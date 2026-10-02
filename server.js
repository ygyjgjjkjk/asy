const http=require("http"),fs=require("fs"),path=require("path"),url=require("url");
const PORT=process.env.PORT||3000;
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"change-me-123";
const DATA=path.join(__dirname,"data.json");
if(!fs.existsSync(DATA)) fs.writeFileSync(DATA,"[]","utf8");
function read(){try{return JSON.parse(fs.readFileSync(DATA,"utf8"))}catch{return[]}}
function send(res,status,type,body){res.writeHead(status,{"Content-Type":type,"Cache-Control":"no-store"});res.end(body)}
function pageAdmin(){return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Профиль преподавателя</title><link rel="stylesheet" href="/style.css"></head><body><div class="container"><div class="hero"><div class="badge">Личный профиль</div><h1>Результаты учеников</h1><p>Тест «Ася»</p></div><div class="card"><label>Пароль преподавателя</label><input id="pw" type="password" placeholder="Введите пароль"><button class="primary" onclick="load()">Открыть результаты</button><p id="e" class="error"></p></div><div id="out"></div></div><script>
async function load(){const pw=document.getElementById("pw").value;const r=await fetch("/api/results?password="+encodeURIComponent(pw));if(!r.ok){document.getElementById("e").textContent="Неверный пароль";return}const a=await r.json();document.getElementById("out").innerHTML='<div class="card"><h2>Отправленные работы: '+a.length+'</h2><p><a href="/api/results.csv?password='+encodeURIComponent(pw)+'">Скачать CSV</a></p><table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;padding:8px">ФИО</th><th>Баллы</th><th>Процент</th><th>Дата</th></tr>'+a.slice().reverse().map(x=>'<tr><td style="padding:8px;border-top:1px solid #eee">'+esc(x.firstName+' '+x.lastName)+'</td><td style="text-align:center;border-top:1px solid #eee">'+x.score+'/15</td><td style="text-align:center;border-top:1px solid #eee">'+Math.round(x.score/15*100)+'%</td><td style="border-top:1px solid #eee">'+new Date(x.submittedAt).toLocaleString('ru-RU')+'</td></tr>').join('')+'</table></div>'}
function esc(s){return s.replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}</script></body></html>`}
const server=http.createServer((req,res)=>{
 const u=url.parse(req.url,true);
 if(req.method==="POST"&&u.pathname==="/api/results"){
   let b="";req.on("data",c=>b+=c);req.on("end",()=>{try{const x=JSON.parse(b);if(!x.firstName||!x.lastName||!Array.isArray(x.answers))throw 0;const a=read();a.push({...x,id:Date.now()});fs.writeFileSync(DATA,JSON.stringify(a,null,2));send(res,200,"application/json","{\"ok\":true}")}catch{send(res,400,"application/json","{\"ok\":false}")}});return;
 }
 if(u.pathname==="/api/results"){
   if(u.query.password!==ADMIN_PASSWORD)return send(res,401,"application/json","{\"error\":\"unauthorized\"}");
   return send(res,200,"application/json",JSON.stringify(read()));
 }
 if(u.pathname==="/api/results.csv"){
   if(u.query.password!==ADMIN_PASSWORD)return send(res,401,"text/plain","Unauthorized");
   const rows=[["ФИО","Баллы","Всего","Процент","Дата"],...read().map(x=>[x.firstName+" "+x.lastName,x.score,x.total,Math.round(x.score/x.total*100)+"%",x.submittedAt])];
   const csv="\\ufeff"+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\\n");
   res.writeHead(200,{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=results.csv"});res.end(csv);return;
 }
 if(u.pathname==="/admin"){return send(res,200,"text/html; charset=utf-8",pageAdmin())}
 let file=u.pathname==="/"?"index.html":u.pathname.slice(1);let p=path.join(__dirname,"public",file);
 if(fs.existsSync(p))return send(res,200,file.endsWith(".css")?"text/css; charset=utf-8":"text/html; charset=utf-8",fs.readFileSync(p));
 send(res,404,"text/plain","Not found");
});
server.listen(PORT,()=>console.log("Test server on port "+PORT));
