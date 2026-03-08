
const { fetchUrlContent } = require('./src/lib/extractors');
const { extractWithGemini } = require('./src/lib/gemini/extractor');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
  const url = 'https://www.chefkoch.de/rezepte/1429181247833075/Spaghettoni-mit-Tomatensauce-aus-frischen-Tomaten.html';
  console.log('Fetching content...');
  const content = await fetchUrlContent(url);
  console.log('Extracted content length:', content.length);
  if (content.includes('Bild-URL:')) {
    console.log('Found Bild-URL in content');
  } else if (content.startsWith('{')) {
    const data = JSON.parse(content);
    console.log('Structured data found, bild_url:', data.bild_url);
  }

  console.log('Calling Gemini...');
  const result = await extractWithGemini({ text: content, sourceUrl: url });
  console.log('Gemini Result bild_url:', result.bild_url);
}

test().catch(console.error);
