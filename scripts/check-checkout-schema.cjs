const fs = require('fs');
const s = JSON.parse(fs.readFileSync(__dirname + '/swagger.json', 'utf8'));
const post = s.paths?.['/checkout']?.post;
const rb = post?.requestBody?.content?.['application/json']?.schema;
if (rb) {
  const ref = rb['$ref'];
  if (ref) {
    const parts = ref.split('/');
    let r = s;
    for (const p of parts.slice(1)) r = r?.[p] || {};
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(JSON.stringify(rb, null, 2));
  }
}
