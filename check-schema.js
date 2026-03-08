
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, val] = line.split('=');
    acc[key.trim()] = val.trim();
    return acc;
  }, {});

async function run() {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );

  console.log('Checking bilder_urls column...');
  const { error } = await supabase.from('rezepte').select('bilder_urls').limit(1);
  if (error) {
    console.log('Error or missing column:', error.message);
  } else {
    console.log('Column "bilder_urls" exists');
  }
}

run();
