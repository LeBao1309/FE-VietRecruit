const fs = require('fs');
const path = require('path');
function walk(dir) {
  let res = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
      res = res.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.vue')) {
      res.push(file);
    }
  });
  return res;
}
const files = walk('src');
let r1=0, r2=0, r3=0, r4=0, r5=0, r6=0, r7=0, r8=0;
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('localStorage.getItem(') || c.includes('localStorage.setItem(') || c.includes('sessionStorage.getItem(')) r2++;
  if (c.match(/user\.role\s*===?\s*'[^']+'/)) r3++;
  if (c.match(/setTimeout\([^,]+,\s*\d+\)/)) r4++;
  if (c.includes('console.log(') || c.includes('console.error(')) r5++;
  if (f.includes('stores') && c.includes('async ') && c.includes('catch ') && !c.includes('getErrorMessage(')) r6++;
  if (!f.includes('services') && !f.includes('api.ts') && !f.includes('axios.instance.ts') && (c.includes('apiClient.post(') || c.includes('apiClient.get(') || c.includes('axios.get('))) r7++;
  if (c.includes('http://') || c.includes('https://') && !c.includes('ui-avatars') && !c.includes('be-vietnam-pro')) r8++;
});
console.log({ r1, r2, r3, r4, r5, r6, r7, r8 });
