const spec = require('./swagger.json');
const paths = spec.paths || {};
for (const path of Object.keys(paths).sort()) {
  if (/product|plan|box|categor/i.test(path)) {
    const methods = paths[path];
    for (const method of Object.keys(methods)) {
      const schema = methods[method]?.requestBody?.content?.['application/json']?.schema;
      console.log(method.toUpperCase(), path);
      if (schema) {
        const ref = schema['$ref'];
        if (ref) {
          const parts = ref.split('/');
          let resolved = spec;
          for (const p of parts.slice(1)) resolved = resolved?.[p] || {};
          const props = resolved.properties || {};
          console.log('  Required:', JSON.stringify(resolved.required || []));
          for (const [k,v] of Object.entries(props)) {
            console.log('   ', k, ':', JSON.stringify(v));
          }
        }
      }
      console.log();
    }
  }
}
