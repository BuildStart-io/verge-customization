const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('frontend/src');

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  // replace supabase.functions.invoke("name")
  code = code.replace(/functions\.invoke(?:<[^>]+>)?\(\s*["']([a-zA-Z0-9-]+)["']/g, (match, fnName) => {
    if (fnName.endsWith('-verge-customization')) return match;
    changed = true;
    return match.replace(fnName, `${fnName}-verge-customization`);
  });

  // replace fetch(`/functions/v1/name`
  code = code.replace(/\/functions\/v1\/([a-zA-Z0-9-]+)/g, (match, fnName) => {
    if (fnName.endsWith('-verge-customization')) return match;
    changed = true;
    return `/functions/v1/${fnName}-verge-customization`;
  });

  if (changed) {
    fs.writeFileSync(file, code);
  }
}
console.log('Patched frontend functions');
