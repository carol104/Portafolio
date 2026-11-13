// One-time additions preserve user edits on later deploys, including deliberate removals.
export async function migrateTechnologyLogos(pool){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(39187422)');
  const migration='2026-11-angular-ionic';
  const applied=await client.query('SELECT id FROM content_migrations WHERE id=$1',[migration]);
  if(!applied.rows.length){
   const {rows}=await client.query('SELECT data FROM site_content WHERE id=1 FOR UPDATE');
   const data=rows[0].data;
   const existing=new Set(data.technologyGroups.flatMap(g=>g.items).map(name=>name.toLowerCase().replace(/\s/g,'')));
   const missing=['Angular','Ionic'].filter(name=>!existing.has(name.toLowerCase()));
   if(missing.length){
    let group=data.technologyGroups.find(g=>g.icon==='frontend');
    if(!group){group={id:'web-mobile-frameworks',title:'Frontend y móvil',description:'Interfaces para la web y dispositivos móviles.',icon:'frontend',items:[],visible:true};data.technologyGroups.push(group)}
    group.items.push(...missing);
    await client.query('UPDATE site_content SET data=$1::jsonb, revision=revision+1, updated_at=NOW() WHERE id=1',[JSON.stringify(data)]);
   }
   await client.query('INSERT INTO content_migrations(id) VALUES($1)',[migration]);
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
}
