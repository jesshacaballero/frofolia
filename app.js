const P={user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',pin:'<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',book:'<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',folder:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',link:'<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',check:'<path d="m5 12 5 5 9-10"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',sparkle:'<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',github:'<path d="M9 19c-4 1-4-2-6-2m12 4v-3a3 3 0 0 0-1-2c3 0 6-2 6-6a5 5 0 0 0-1-3 4 4 0 0 0 0-3s-1 0-3 1a10 10 0 0 0-6 0C6 4 5 4 5 4a4 4 0 0 0 0 3 5 5 0 0 0-1 3c0 4 3 6 6 6a3 3 0 0 0-1 2v3"/>',linkedin:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 7.5v.01M12 17v-6m0 2a3 3 0 0 1 5 1v3"/>',camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',cloud:'<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 20 11a3.5 3.5 0 0 1-1 7z"/>',home:'<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24">${P[n]||''}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href=u=>/^https?:\/\//i.test(u)?u:'https://'+u;
const $=s=>document.querySelector(s);
const go=h=>{location.hash=h};
let mode='connecting',lastErr='',list=[],draft=null,loading=true;

/* ---------- Storage: Supabase (online PostgreSQL database) ---------- */
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const toRow=p=>({id:p.id,name:p.name,title:p.title,photo:p.photo,email:p.email,phone:p.phone,address:p.address,about:p.about,education:p.education,skills:p.skills,projects:p.projects,experience:p.experience,links:p.links,template:p.template,updated_at:p.updatedAt});
const fromRow=r=>({...r,updatedAt:r.updated_at});
async function initDb(){
  try{await load();mode='cloud'}catch(e){console.error(e);lastErr=(e&&(e.message||e.details||e.hint))||String(e);mode='error'}
  loading=false;nav();route();
}
async function load(){
  const {data,error}=await sb.from('portfolios').select('*').order('updated_at',{ascending:false});
  if(error)throw error;
  list=data.map(fromRow);
}
async function persist(p){
  const {error}=await sb.from('portfolios').upsert(toRow(p));   // INSERT or UPDATE
  if(error)throw error;
  await load();
}
async function remove(id){
  const {error}=await sb.from('portfolios').delete().eq('id',id); // DELETE
  if(error)throw error;
  await load();
}
const find=id=>list.find(p=>p.id===id);

/* ---------- UI helpers ---------- */
function toast(m){const t=$('#toast');t.innerHTML=ic('check')+esc(m);t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2400)}
function confirmDlg(title,msg,yes){
  const b=document.createElement('div');b.className='bk';
  b.innerHTML=`<div class="card dlg"><div class="ico" style="margin:0 auto;background:linear-gradient(135deg,#ef4444,#f97316)">${ic('trash')}</div><h3>${title}</h3><p>${msg}</p><div class="ac"><button class="btn" id="n">Cancel</button><button class="btn p" id="y" style="background:linear-gradient(135deg,#ef4444,#f97316)">Delete</button></div></div>`;
  document.body.appendChild(b);b.querySelector('#n').onclick=()=>b.remove();b.querySelector('#y').onclick=async()=>{b.remove();await yes()};
}
document.addEventListener('mousemove',e=>{const c=e.target.closest&&e.target.closest('.card');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}});
function theme(){const r=document.documentElement,d=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=d?'light':'dark'}
function nav(){
  const pg=(location.hash.slice(2).split('/')[0])||'home';
  $('#nav').innerHTML=`<div class="brand" onclick="go('/')"><div class="logo">${ic('sparkle')}</div>Frofolia</div>
  <button class="nl ${pg==='home'?'on':''}" onclick="go('/')">${ic('home')}<span>Home</span></button>
  <button class="nl ${pg==='edit'?'on':''}" onclick="go('/edit')">${ic('plus')}<span>Create</span></button>
  <button class="nl ${pg==='manage'?'on':''}" onclick="go('/manage')">${ic('grid')}<span>My Portfolios</span></button>
  <div class="pill ${mode==='cloud'?'ok':''}" title="${mode==='cloud'?'Connected to the Supabase online database':'Cannot reach the database — check config.js'}"><b></b><span>${mode==='cloud'?'Supabase connected':mode==='error'?'DB error':'Connecting…'}</span></div>
  <button class="nl" onclick="theme()" aria-label="Toggle theme">${ic('moon')}</button>`;
}

/* ---------- Routing ---------- */
function route(){
  nav();window.scrollTo(0,0);
  const [pg,id]=location.hash.slice(2).split('/');
  const A=$('#app');
  if(loading){A.innerHTML=`<div class="empty"><div class="ico">${ic('cloud')}</div><h3>Connecting to database…</h3></div>`;return}
  if(mode==='error'&&pg&&pg!=='home'){A.innerHTML=`<div class="card empty"><div class="ico">${ic('db')}</div><h3>Database not connected</h3><p style="color:var(--mut)">Check <b>config.js</b> (Supabase URL + anon key) and that you ran <b>schema.sql</b>.</p><p style="color:#ef4444;font-size:13px;word-break:break-word">Error: ${esc(lastErr)}</p><button class="btn p" onclick="go('/')">${ic('home')} Back to Home</button></div>`;return}
  if(pg==='edit')return pgEdit(A,id);
  if(pg==='templates')return pgTemplates(A,id);
  if(pg==='preview')return pgPreview(A,id);
  if(pg==='manage')return pgManage(A);
  pgHome(A);
}
window.addEventListener('hashchange',route);

/* ---------- Home ---------- */
function pgHome(A){
  const warn=mode==='error'?`<div class="card" style="padding:14px 18px;margin-bottom:10px;border-color:#ef4444;color:#ef4444;font-size:14px">${ic('db')} Database error: ${esc(lastErr)} — check config.js and schema.sql.</div>`:'';
  const f=[['user','Enter your details','Profile, education, skills, projects and experience in one clean form.','/edit'],['db','Saved online','Your data lives in a cloud database and survives every refresh.','/manage'],['layout','3 stunning templates','Simple, Modern and Creative — switch looks in one click.',list[0]?'/templates/'+list[0].id:'/edit'],['globe','Share-ready','Generate, preview, edit or delete your portfolio anytime.',list[0]?'/preview/'+list[0].id:'/edit']];
  A.innerHTML=warn+`<section class="hero"><div class="tag">${ic('sparkle')} Portfolio builder · Powered by a cloud database</div>
  <h1>Build a portfolio<br>that <span class="grad">stands out.</span></h1>
  <p><b>Frofolia</b> turns your story into a professional online portfolio in minutes. Fill in your info, pick a template, and you're live.</p>
  <div class="ac" style="justify-content:center"><button class="btn p" onclick="go('/edit')" style="padding:15px 28px;font-size:16px">${ic('plus')} Create Portfolio ${ic('arrow')}</button>${list.length?`<button class="btn" onclick="go('/manage')" style="padding:15px 24px">${ic('grid')} My Portfolios (${list.length})</button>`:''}</div></section>
  <div class="g3">${f.map(x=>`<div class="card click feat" onclick="go('${x[3]}')"><div class="ico">${ic(x[0])}</div><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div>
  <div class="flow">${['Enter info','Save online','Pick template','Preview','Edit / Delete'].map((s,i)=>`<span>${i?ic('arrow'):''}${s}</span>`).join('')}</div>`;
}

/* ---------- Form ---------- */
const blank=()=>({id:'p'+Date.now().toString(36),name:'',title:'',photo:'',email:'',phone:'',address:'',about:'',education:[{}],skills:[],projects:[{}],experience:[{}],links:[{}],template:0});
function pgEdit(A,id){
  const ex=id&&find(id);
  if(id&&!ex){go('/manage');return}
  draft=ex?JSON.parse(JSON.stringify(ex)):blank();
  ['education','projects','experience','links'].forEach(k=>{if(!draft[k]||!draft[k].length)draft[k]=[{}]});
  draft.skills=draft.skills||[];
  A.innerHTML=`<div class="top"><div><h2>${ex?'Edit':'Create'} <span class="grad">portfolio</span></h2><p>Fill in your details — everything is saved to the online database.</p></div></div><div class="form" id="fw"></div>`;
  drawForm();
}
const fld=(l,k,t='text',ph='',v)=>`<div><label>${l}</label><input type="${t}" data-p="${k}" value="${esc(v??draft[k])}" placeholder="${ph}"></div>`;
function rep(key,icn,title,cols,area){
  return `<div class="card sec"><h3><span class="ico">${ic(icn)}</span>${title}</h3>${draft[key].map((r,i)=>`<div class="rep"><button class="x" onclick="delRow('${key}',${i})" title="Remove">${ic('x')}</button><div class="row">${cols.map(c=>fld(c[1],`${key}.${i}.${c[0]}`,'text',c[2]||'',r[c[0]]||'')).join('')}</div>${area?`<div style="margin-top:12px"><label>${area[1]}</label><textarea data-p="${key}.${i}.${area[0]}" placeholder="${area[2]||''}">${esc(r[area[0]]||'')}</textarea></div>`:''}</div>`).join('')}<button class="btn sm" onclick="addRow('${key}')">${ic('plus')} Add another</button></div>`;
}
function drawForm(){
  const y=scrollY;
  $('#fw').innerHTML=`<div class="card sec"><h3><span class="ico">${ic('user')}</span>Personal Information</h3>
  <div class="ph"><div class="av" onclick="$('#file').click()" title="Upload photo">${draft.photo?`<img src="${draft.photo}" alt="">`:ic('camera')}</div><div><b>Profile picture</b><div style="color:var(--mut);font-size:13px;margin:2px 0 8px">JPG or PNG, auto-resized</div><button class="btn sm" onclick="$('#file').click()">${ic('camera')} Upload</button> ${draft.photo?`<button class="btn sm d" onclick="draft.photo='';drawForm()">Remove</button>`:''}<input type="file" id="file" accept="image/*" hidden onchange="photo(this)"></div></div>
  <div class="row">${fld('Full name *','name','text','Jane Dela Cruz')}${fld('Headline / Role','title','text','Full-Stack Developer')}${fld('Email *','email','email','jane@email.com')}${fld('Contact number','phone','tel','+63 900 000 0000')}</div>
  <div style="margin-top:14px">${fld('Address','address','text','City, Country')}</div>
  <div style="margin-top:14px"><label>About me</label><textarea data-p="about" placeholder="Tell visitors who you are and what you do…">${esc(draft.about)}</textarea></div></div>
  ${rep('education','book','Educational Background',[['school','School / University','Cebu Technological University'],['degree','Degree / Program','BS Information Technology'],['years','Years','2021 – 2025']])}
  <div class="card sec"><h3><span class="ico">${ic('bolt')}</span>Skills</h3><input id="sk" placeholder="Type a skill and press Enter (e.g. JavaScript)" onkeydown="if(event.key==='Enter'){event.preventDefault();addSkill(this)}"><div class="chips">${draft.skills.map((s,i)=>`<span class="chip" onclick="draft.skills.splice(${i},1);drawForm()" title="Remove">${esc(s)} ${ic('x')}</span>`).join('')||'<span style="color:var(--mut);font-size:13px">No skills yet</span>'}</div></div>
  ${rep('projects','folder','Projects',[['title','Project title','My Awesome App'],['link','Link (optional)','https://…']],['desc','Description','What did you build?'])}
  ${rep('experience','brief','Work Experience',[['role','Role','Intern Developer'],['company','Company','Acme Inc.'],['years','Years','2024 – 2025']],['desc','Description','Key responsibilities'])}
  ${rep('links','link','Social Media / Website Links',[['label','Label','GitHub'],['url','URL','https://github.com/you']])}
  <div class="card bar"><button class="btn" onclick="go('/manage')">Cancel</button><button class="btn p" id="sv" onclick="saveDraft()">${ic('db')} Save &amp; choose template ${ic('arrow')}</button></div>`;
  scrollTo(0,y);
}
document.addEventListener('input',e=>{const p=e.target.dataset&&e.target.dataset.p;if(!p||!draft)return;const k=p.split('.');if(k.length===1)draft[k[0]]=e.target.value;else{draft[k[0]][k[1]]=draft[k[0]][k[1]]||{};draft[k[0]][k[1]][k[2]]=e.target.value}});
const addRow=k=>{draft[k].push({});drawForm()};
const delRow=(k,i)=>{draft[k].splice(i,1);if(!draft[k].length)draft[k].push({});drawForm()};
function addSkill(el){const v=el.value.trim();if(v){draft.skills.push(v);drawForm();$('#sk').focus()}}
function photo(inp){
  const f=inp.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),s=260;c.width=c.height=s;const m=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,s,s);draft.photo=c.toDataURL('image/jpeg',.82);drawForm()};im.src=r.result};r.readAsDataURL(f);
}
async function saveDraft(){
  const sk=$('#sk');if(sk&&sk.value.trim())draft.skills.push(sk.value.trim());
  if(!draft.name.trim()||!/\S+@\S+\.\S+/.test(draft.email)){toast('Please enter your name and a valid email');return}
  ['education','projects','experience','links'].forEach(k=>draft[k]=draft[k].filter(r=>Object.values(r).some(v=>String(v).trim())));
  draft.updatedAt=Date.now();
  const b=$('#sv');b.disabled=true;b.textContent='Saving…';
  try{await persist(draft);toast('Saved to database');go('/templates/'+draft.id)}
  catch(e){console.error(e);toast('Could not save — please retry');drawForm()}
}

/* ---------- Templates ---------- */
const TN=[['Simple','Clean, classic and professional single-column résumé style.'],['Modern','Dark glass cards, gradients and visual sections.'],['Creative','Bold colours, sidebar and playful asymmetric layout.']];
const lk=u=>/github/i.test(u)?'github':/linkedin/i.test(u)?'linkedin':'globe';
const ini=p=>esc((p.name||'?').trim().charAt(0).toUpperCase());
const avatar=p=>p.photo?`<img src="${p.photo}" alt="">`:ini(p);
const ok=a=>Array.isArray(a)?a:[];
function tpl(n,p){
  const ct=[['mail',p.email],['phone',p.phone],['pin',p.address]].filter(x=>x[1]);
  const ls=ok(p.links).filter(l=>l.url);
  const ed=ok(p.education),pj=ok(p.projects),ex=ok(p.experience),sk=ok(p.skills);
  const lnk=l=>`<a href="${esc(href(l.url))}" target="_blank" rel="noopener">${ic(lk(l.url))} ${esc(l.label||l.url)}</a>`;
  if(n===0)return `<div class="tplw"><div class="tpl t1"><header><div class="pic">${avatar(p)}</div><div><h1>${esc(p.name)}</h1>${p.title?`<div class="role">${esc(p.title)}</div>`:''}<div class="ct">${ct.map(c=>`<span>${ic(c[0])}${esc(c[1])}</span>`).join('')}${ls.map(l=>`<span>${lnk(l)}</span>`).join('')}</div></div></header>
  ${p.about?`<section><h2>About</h2><p style="margin:0;line-height:1.7">${esc(p.about)}</p></section>`:''}
  ${ex.length?`<section><h2>Experience</h2>${ex.map(r=>`<div class="it"><small>${esc(r.years)}</small><div><b>${esc(r.role)}</b>${r.company?`, ${esc(r.company)}`:''}<p>${esc(r.desc)}</p></div></div>`).join('')}</section>`:''}
  ${ed.length?`<section><h2>Education</h2>${ed.map(r=>`<div class="it"><small>${esc(r.years)}</small><div><b>${esc(r.school)}</b><p>${esc(r.degree)}</p></div></div>`).join('')}</section>`:''}
  ${pj.length?`<section><h2>Projects</h2>${pj.map(r=>`<div class="it"><small>${r.link?`<a href="${esc(href(r.link))}" target="_blank" rel="noopener">View ↗</a>`:''}</small><div><b>${esc(r.title)}</b><p>${esc(r.desc)}</p></div></div>`).join('')}</section>`:''}
  ${sk.length?`<section style="border:0"><h2>Skills</h2><div class="sk">${sk.map(s=>`<span>${esc(s)}</span>`).join('')}</div></section>`:''}</div></div>`;
  if(n===1)return `<div class="tplw"><div class="tpl t2"><div class="hero2"><div class="ban"></div><div class="hb"><div class="pic">${avatar(p)}</div><div><h1>${esc(p.name)}</h1><div class="role">${esc(p.title)}</div></div></div></div>
  <div class="tiles">${ct.map(c=>`<div class="tile"><i>${ic(c[0])}</i>${esc(c[1])}</div>`).join('')}${ls.map(l=>`<a class="tile" style="text-decoration:none" href="${esc(href(l.url))}" target="_blank" rel="noopener"><i>${ic(lk(l.url))}</i>${esc(l.label||l.url)}</a>`).join('')}</div>
  <div class="grid">${p.about?`<div class="c w"><h2>${ic('user')} About me</h2><p style="margin:0;line-height:1.7;color:#cbd5e1">${esc(p.about)}</p></div>`:''}
  ${sk.length?`<div class="c w"><h2>${ic('bolt')} Skills</h2>${sk.map(s=>`<span class="pl">${esc(s)}</span>`).join('')}</div>`:''}
  ${ex.length?`<div class="c"><h2>${ic('brief')} Experience</h2>${ex.map(r=>`<div class="sub"><b>${esc(r.role)}</b><small>${esc(r.company)} ${r.years?'· '+esc(r.years):''}</small><p>${esc(r.desc)}</p></div>`).join('')}</div>`:''}
  ${ed.length?`<div class="c"><h2>${ic('book')} Education</h2>${ed.map(r=>`<div class="sub"><b>${esc(r.school)}</b><small>${esc(r.degree)} ${r.years?'· '+esc(r.years):''}</small></div>`).join('')}</div>`:''}
  ${pj.length?`<div class="c w"><h2>${ic('folder')} Projects</h2><div class="pj">${pj.map(r=>`<div><b>${esc(r.title)}</b><p style="margin:6px 0;font-size:14px;color:#cbd5e1">${esc(r.desc)}</p>${r.link?`<a href="${esc(href(r.link))}" target="_blank" rel="noopener" style="color:#67e8f9;font-size:13px">Open project ↗</a>`:''}</div>`).join('')}</div></div>`:''}</div></div></div>`;
  return `<div class="tplw"><div class="tpl t3"><aside><div class="blob">${avatar(p)}</div><div style="text-align:center"><span class="st">Hello! 👋</span></div>
  <h4>Contact</h4>${ct.map(c=>`<div class="li">${ic(c[0])}${esc(c[1])}</div>`).join('')}
  ${ls.length?`<h4>Find me</h4>${ls.map(l=>`<div class="li">${lnk(l)}</div>`).join('')}`:''}
  ${ed.length?`<h4>Education</h4>${ed.map(r=>`<div class="li" style="display:block"><b>${esc(r.school)}</b><br><span style="opacity:.85">${esc(r.degree)} ${esc(r.years)}</span></div>`).join('')}`:''}</aside>
  <div class="mn"><h1>${esc(p.name)}</h1>${p.title?`<div class="role">${esc(p.title)}</div>`:''}${p.about?`<p class="ab">${esc(p.about)}</p>`:''}
  ${sk.length?`<h2><em>01</em>Skills</h2><div class="sk">${sk.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`:''}
  ${pj.length?`<h2><em>02</em>Projects</h2><div class="pj">${pj.map(r=>`<div class="pc"><b>${esc(r.title)}</b><p>${esc(r.desc)}</p>${r.link?`<a href="${esc(href(r.link))}" target="_blank" rel="noopener" style="font-size:13px;font-weight:700">Visit ↗</a>`:''}</div>`).join('')}</div>`:''}
  ${ex.length?`<h2><em>03</em>Experience</h2><div class="tl">${ex.map(r=>`<div><b>${esc(r.role)}</b> @ ${esc(r.company)}<br><small>${esc(r.years)}</small><p>${esc(r.desc)}</p></div>`).join('')}</div>`:''}</div></div></div>`;
}
const SAMPLE={name:'Alex Rivera',title:'Product Designer & Developer',email:'alex@mail.com',phone:'+63 912 345 6789',address:'Cebu, Philippines',about:'I design and build delightful digital products with a focus on clarity and performance.',education:[{school:'State University',degree:'BS Information Technology',years:'2021–2025'}],skills:['UI Design','JavaScript','React','Figma','SQL'],projects:[{title:'Finance Tracker',desc:'A responsive budgeting dashboard.',link:''},{title:'Campus Connect',desc:'Social app for students.',link:''}],experience:[{role:'Frontend Intern',company:'Acme Co.',years:'2024',desc:'Built reusable UI components.'}],links:[{label:'GitHub',url:'github.com'}]};
function fit(){document.querySelectorAll('.thumb').forEach(t=>{const s=t.firstElementChild;s.style.transform=`scale(${t.clientWidth/1000})`})}
window.addEventListener('resize',fit);
function pgTemplates(A,id){
  const p=find(id);if(!p){go('/manage');return}
  A.innerHTML=`<div class="top"><div><h2>Choose a <span class="grad">template</span></h2><p>Live previews with your own data, <b>${esc(p.name)}</b>. Click a card to generate your portfolio.</p></div><button class="btn" onclick="go('/edit/${p.id}')">${ic('edit')} Edit info</button></div>
  <div class="g3">${TN.map((t,i)=>`<div class="card click tc ${p.template===i?'sel':''}" onclick="pick('${p.id}',${i})"><div class="thumb"><div class="sc">${tpl(i,p)}</div></div><div class="in"><div><h3>${i+1}. ${t[0]}</h3><p>${t[1]}</p></div><span class="btn sm p">${ic('eye')} Use</span></div></div>`).join('')}</div>`;
  fit();
}
async function pick(id,n){const p=find(id);p.template=n;p.updatedAt=Date.now();try{await persist(p);go('/preview/'+id)}catch(e){toast('Could not save selection')}}

/* ---------- Preview ---------- */
function pgPreview(A,id){
  const p=find(id);if(!p){go('/manage');return}
  A.innerHTML=`<div class="top"><div><h2>Your <span class="grad">portfolio</span></h2><p>Generated with the ${TN[p.template||0][0]} template and loaded from the database.</p></div>
  <div class="ac"><div class="tabs">${TN.map((t,i)=>`<button class="${(p.template||0)===i?'on':''}" onclick="pick('${p.id}',${i})">${t[0]}</button>`).join('')}</div><button class="btn" onclick="go('/edit/${p.id}')">${ic('edit')} Edit</button><button class="btn p" onclick="go('/manage')">${ic('grid')} Manage</button></div></div>
  <div class="stage">${tpl(p.template||0,p)}</div>`;
}

/* ---------- Manage ---------- */
function pgManage(A){
  A.innerHTML=`<div class="top"><div><h2>My <span class="grad">portfolios</span></h2><p>View, edit or delete the portfolios saved in your online database.</p></div><button class="btn p" onclick="go('/edit')">${ic('plus')} New portfolio</button></div>`+
  (list.length?`<div class="g3">${list.map(p=>`<div class="card mc"><div class="mh"><div class="a">${avatar(p)}</div><div><h3>${esc(p.name)}</h3><p>${esc(p.title||p.email)}</p></div></div>
  <div class="ac"><span class="chip" style="cursor:default">${ic('layout')} ${TN[p.template||0][0]}</span><span class="chip" style="cursor:default">${ic('bolt')} ${ok(p.skills).length} skills</span><span class="chip" style="cursor:default">${ic('folder')} ${ok(p.projects).length} projects</span></div>
  <div class="ac"><button class="btn sm p" onclick="go('/preview/${p.id}')">${ic('eye')} View</button><button class="btn sm" onclick="go('/edit/${p.id}')">${ic('edit')} Edit</button><button class="btn sm" onclick="go('/templates/${p.id}')">${ic('layout')} Template</button><button class="btn sm d" onclick="del('${p.id}')">${ic('trash')} Delete</button></div></div>`).join('')}</div>`
  :`<div class="card empty"><div class="ico">${ic('folder')}</div><h3>No portfolios yet</h3><p style="color:var(--mut)">Create your first portfolio to see it here.</p><button class="btn p" onclick="go('/edit')">${ic('plus')} Create Portfolio</button></div>`);
}
function del(id){const p=find(id);confirmDlg('Delete portfolio?',`“${esc(p.name)}” will be permanently removed from the database.`,async()=>{try{await remove(id);toast('Portfolio deleted');pgManage($('#app'))}catch(e){toast('Delete failed')}})}

route();initDb();
