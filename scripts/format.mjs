import {transform} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
for(const path of ['src/app.js','src/domain.mjs','src/style.css']){
  const source=await readFile(path,'utf8');
  const result=await transform(source,{loader:path.endsWith('.css')?'css':'js',minify:false,charset:'utf8',legalComments:'inline',target:'es2022'});
  await writeFile(path,result.code);
}
