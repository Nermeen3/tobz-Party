// Tiny local web server for Tobz Party.  Run:  node serve.js   then open http://localhost:8123
const http=require('http'),fs=require('fs'),path=require('path');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
http.createServer((req,res)=>{
 const rel=decodeURIComponent(req.url.split('?')[0]);
 const file=path.join(__dirname,path.normalize(rel==='/'?'/index.html':rel));
 if(!file.startsWith(__dirname)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{
  if(err){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(8123,()=>console.log('Tobz Party is running at http://localhost:8123'));
