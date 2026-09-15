const fs = require('fs');
const path = require('path');

const dir = 'supabase/functions';
const schema = 'verge_customization';

const dirs = fs.readdirSync(dir);

for (const d of dirs) {
  const file = path.join(dir, d, 'index.ts');
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    // Add schema to simple createClient calls
    code = code.replace(
      /createClient\(\s*([^,]+),\s*([^,)]+)\s*\)/g,
      `createClient($1, $2, { db: { schema: "${schema}" } })`
    );

    // Add schema to createClient calls with existing options object
    code = code.replace(
      /createClient\(\s*([^,]+),\s*([^,]+),\s*\{\s*global:/g,
      `createClient($1, $2, { db: { schema: "${schema}" }, global:`
    );

    // Also replace references to edge function names to include -verge-customization
    // E.g. fetch(`${supabaseUrl}/functions/v1/wsender-sessions`...)
    code = code.replace(/\/functions\/v1\/([a-zA-Z0-9-]+)/g, (match, fnName) => {
      if (fnName.endsWith('-verge-customization')) return match;
      return `/functions/v1/${fnName}-verge-customization`;
    });

    fs.writeFileSync(file, code);
  }
}
console.log('Patched functions');
