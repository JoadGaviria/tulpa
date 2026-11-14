import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
createServer(async(req,res)=>{try{const raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(raw==='/'?'/index.html':raw));if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}const body=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'})[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404).end('No encontrado');}}).listen(4173,'127.0.0.1',()=>console.log('Tulpa: http://127.0.0.1:4173'));
