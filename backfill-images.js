
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { parse } = require('node-html-parser');

// Minimal fetcher mock since we can't easily import TS files with dependencies in a simple node script without ts-node
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

async function fetchImagesFromUrl(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
    if (!res.ok) return [];
    const html = await res.text();
    const root = parse(html);
    
    const ogImages = root.querySelectorAll('meta[property="og:image"]').map(meta => meta.getAttribute("content")).filter(Boolean);
    const twitterImages = root.querySelectorAll('meta[name="twitter:image"]').map(meta => meta.getAttribute("content")).filter(Boolean);
    const imgTags = root.querySelectorAll('article img, .recipe-image img, img[itemprop="image"]').map(img => img.getAttribute("src")).filter(Boolean);
    
    const all = [...new Set([...ogImages, ...twitterImages, ...imgTags])];
    return all.map(src => {
      if (src.startsWith("/")) {
        try { return new URL(src, url).toString(); } catch { return src; }
      }
      return src;
    }).slice(0, 10);
  } catch (e) {
    console.error(`Error fetching ${url}:`, e.message);
    return [];
  }
}

const env = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...rest] = line.split('=');
    acc[key.trim()] = rest.join('=').trim();
    return acc;
  }, {});

async function backfill() {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );

  console.log('Fetching recipes...');
  const { data: recipes, error } = await supabase.from('rezepte').select('id, titel, quelle_url, bild_url');
  if (error) throw error;

  console.log(`Found ${recipes.length} recipes. Processing...`);

  for (const recipe of recipes) {
    if (!recipe.quelle_url) {
      console.log(`Skipping ${recipe.titel} (no source URL)`);
      continue;
    }

    console.log(`Processing ${recipe.titel}...`);
    const images = await fetchImagesFromUrl(recipe.quelle_url);
    
    if (images.length > 0) {
      console.log(`Found ${images.length} images for ${recipe.titel}`);
      
      // Update at least the main image
      if (!recipe.bild_url) {
        console.log(`Updating main image for ${recipe.titel}...`);
        await supabase.from('rezepte').update({ bild_url: images[0] }).eq('id', recipe.id);
      }
      
      // Try to add bilder_urls only if they might exist
      const { error: updateError } = await supabase
        .from('rezepte')
        .update({ bilder_urls: images })
        .eq('id', recipe.id);
      
      if (updateError) {
         console.log(`Info: Column "bilder_urls" possibly missing (${updateError.message}). Only updated main thumbnail.`);
      } else {
         console.log(`Successfully updated all ${images.length} images for ${recipe.titel}.`);
      }
    } else {
      console.log(`No images found for ${recipe.titel}`);
    }
  }

  console.log('Backfill complete!');
}

backfill().catch(console.error);
