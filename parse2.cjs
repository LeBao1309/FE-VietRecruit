const fs = require('fs');
const t = JSON.parse(fs.readFileSync('api.json'));
const schema = t.paths['/vietrecruit/payment/transactions']?.get?.responses?.['200']?.content?.['*/*']?.schema;
console.log(JSON.stringify(schema));
