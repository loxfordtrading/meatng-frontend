const fs = require('fs');
const s = JSON.parse(fs.readFileSync(__dirname + '/swagger.json', 'utf8'));
const get = s.paths?.['/orders']?.get;
console.log('GET /orders params:', JSON.stringify(get?.parameters, null, 2));
console.log('GET /orders summary:', get?.summary);

// Also check what the admin orders look like
const paths = s.paths || {};
for (const p of Object.keys(paths).sort()) {
  if (/order/i.test(p)) {
    for (const m of Object.keys(paths[p])) {
      console.log(`\n${m.toUpperCase()} ${p} — ${paths[p][m].summary || ''}`);
    }
  }
}
