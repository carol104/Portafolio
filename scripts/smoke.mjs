import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.SMOKE_URL||'http://127.0.0.1:8080';
const page=await fetch(base);
assert.equal(page.status,200);
const html=await page.text();
assert.match(html,/Carol/);
for(const [,asset] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(!asset.startsWith('/'))continue;
 const response=await fetch(base+asset);
 assert.equal(response.status,200,asset);
 assert.ok(!response.headers.get('content-type').includes('text/html'),`${asset} must not be an HTML fallback`);
 console.log('Asset OK:',asset);
}
assert.deepEqual(await (await fetch(base+'/api/health')).json(),{status:'ok',database:'connected'});
const pdfResponse=await fetch(base+'/api/resume');
assert.equal(pdfResponse.status,200);
const pdf=Buffer.from(await pdfResponse.arrayBuffer());
assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
const pages=[...pdf.toString('latin1').matchAll(/\/Type\s*\/Page\b/g)].length;
assert.ok(pages>=1&&pages<=2,`Expected 1-2 CV pages, got ${pages}`);
await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/hoja-de-vida.pdf',pdf);
const message=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Prueba automatica',email:'portfolio-smoke@example.invalid',subject:'Proyecto',message:'Prueba local de persistencia del formulario en PostgreSQL.',consent:'on',website:''})});
assert.equal(message.status,201);
console.log(`Production HTTP, assets, PostgreSQL health, contact and ${pages}-page PDF OK.`);
console.log('Verify and remove the test row with email portfolio-smoke@example.invalid.');
