/* Frofolia — application logic: routing, Supabase CRUD and the five pages.
   Shared helpers (ic, esc, href …) and the three templates live in templates.js. */
const $ = s => document.querySelector(s);
const go = h => { location.hash = h; };
const errMsg = e => (e && (e.message || e.details || e.hint)) || String(e || 'Unknown error');
const fmtDate = v => { if (!v) return ''; const d = new Date(v); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
const getP = (o, k) => k.split('.').reduce((a, x) => (a == null ? a : a[x]), o);
const setP = (o, k, v) => { const a = k.split('.'); let t = o; a.slice(0, -1).forEach(x => { t = t[x] = t[x] ?? {}; }); t[a[a.length - 1]] = v; };
const curPage = () => { const [pg, id] = location.hash.slice(2).split('/'); return [pg || 'home', id || '']; };

const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 29V6" fill="none" stroke="#173D30" stroke-width="2" stroke-linecap="round"/><path d="M16 23c-6.5 0-10-4-10-9.500 6.500 0 10 3.500 10 9.500z" fill="#173D30"/><path d="M16 16.500c5.500 0 9-3 9-8.500-5.500 0-9 3-9 8.500z" fill="#A8B6A0"/></svg>';

/* ======================= Database (Supabase) ======================= */
let sb = null;
try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } catch (e) { console.error(e); }
let mode = 'connecting', lastErr = '', list = [], loading = true;
let secure = false, uid = null;          // secure = owner-based RLS (schema-secure.sql) is active
let draft = null, draftKey = '', errs = {}, pendingTemplate = 0, tplSel = 0, io = null;

const toRow = p => {
  const r = {
    id: p.id, name: p.name, title: p.title || '', photo: p.photo || '', email: p.email, phone: p.phone || '',
    address: p.address || '', about: p.about || '', education: p.education || [], skills: p.skills || [],
    projects: p.projects || [], experience: p.experience || [], links: p.links || [], template: p.template || 0,
    updated_at: p.updatedAt || Date.now()
  };
  if (secure) r.owner_id = uid;
  return r;
};
const fromRow = r => ({ ...r, updatedAt: r.updated_at });

/* Wraps every request so the status pill reflects what actually happened. */
async function db(fn) {
  try {
    const r = await fn();
    if (mode !== 'cloud') { mode = 'cloud'; nav(); }
    return r;
  } catch (e) {
    lastErr = errMsg(e);
    if (!e || !e.code) { mode = 'error'; nav(); }       // no server code = the request never reached the database
    throw e;
  }
}

/* If schema-secure.sql was run, each visitor gets a private anonymous session and
   only sees their own rows. Otherwise the original public-policy schema is used. */
async function openSession() {
  secure = false; uid = null;
  const probe = await sb.from('portfolios').select('owner_id').limit(1);
  if (probe.error) {
    if (probe.error.code === '42703' || /owner_id/.test(probe.error.message || '')) return;   // column missing → original schema
    throw probe.error;
  }
  secure = true;
  let { data: { session } } = await sb.auth.getSession();
  if (!session) {
    const r = await sb.auth.signInAnonymously();
    if (r.error) throw new Error('Enable "Anonymous sign-ins" in Supabase (Authentication → Sign In / Providers). ' + errMsg(r.error));
    session = r.data.session;
  }
  uid = session.user.id;
}
async function load() {
  let q = sb.from('portfolios').select('*').order('updated_at', { ascending: false });
  if (secure) q = q.eq('owner_id', uid);
  const { data, error } = await q;
  if (error) throw error;
  list = data.map(fromRow);
}
async function initDb() {
  loading = true; mode = 'connecting'; nav();
  try {
    if (!sb) throw new Error('The Supabase library could not be loaded. Check your internet connection.');
    await openSession();
    await load();
    mode = 'cloud';
  } catch (e) { console.error(e); lastErr = errMsg(e); mode = 'error'; }
  loading = false; nav(); route();
}
const persist = p => db(async () => { const { error } = await sb.from('portfolios').upsert(toRow(p)); if (error) throw error; await load(); });          // INSERT or UPDATE
const remove = id => db(async () => { const { error } = await sb.from('portfolios').delete().eq('id', id); if (error) throw error; await load(); });   // DELETE
const find = id => list.find(p => p.id === id);

/* ======================= UI helpers ======================= */
function toast(m, type) {
  const t = $('#toast'); t.className = 'toast' + (type === 'err' ? ' err' : '');
  t.innerHTML = ic(type === 'err' ? 'alert' : 'check') + '<span>' + esc(m) + '</span>';
  requestAnimationFrame(() => t.classList.add('on'));
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), type === 'err' ? 4500 : 2600);
}
function nav() {
  const [pg, id] = curPage();
  const st = {
    connecting: ['', 'Connecting…', 'Contacting the database'],
    cloud: ['ok', 'Database connected', secure ? 'Connected. Your portfolios are private to this browser.' : 'Connected to the Supabase database.'],
    error: ['bad', 'Database unavailable', 'Cannot reach the database: ' + lastErr]
  }[mode];
  const on = k => (k === 'home' ? pg === 'home' : k === 'create' ? pg === 'edit' && !id : (pg === 'manage' || pg === 'preview' || pg === 'templates' || (pg === 'edit' && id))) ? ' aria-current="page"' : '';
  $('#nav').innerHTML = `<a class="brand" href="#/">${LOGO}<span>Frofolia</span></a>
  <div class="links"><a href="#/"${on('home')}>Home</a><a href="#/edit"${on('create')}>Create Portfolio</a><a href="#/manage"${on('manage')}>My Portfolios</a></div>
  <div class="pill ${st[0]}" role="status" title="${esc(st[2])}"><b></b><span>${st[1]}</span></div>`;
  document.documentElement.style.setProperty('--navh', ($('#nav-wrap').offsetHeight || 64) + 'px');
}
function renderFoot() {
  $('#foot').innerHTML = `<div class="foot-in"><div><div class="mark">${LOGO.replace('#173D30', '#FFFCF5')}Frofolia</div><p>An elegant portfolio studio that helps you present your story and professional work beautifully.</p></div>
  <div><h2>Explore</h2><ul><li><a href="#/">Home</a></li><li><a href="#/edit">Create Portfolio</a></li><li><a href="#/manage">My Portfolios</a></li></ul></div>
  <div><h2>Templates</h2><ul>${TN.map((t, i) => `<li><button type="button" data-act="sample" data-i="${i}">${t.name}</button></li>`).join('')}</ul></div></div>
  <div class="foot-bar">© ${new Date().getFullYear()} Frofolia. Online Portfolio Template Generator.</div>`;
}
function fit() { document.querySelectorAll('.thumb').forEach(t => { const s = t.querySelector('.sc'); if (s) s.style.transform = `scale(${t.clientWidth / 1000})`; }); }
window.addEventListener('resize', () => { fit(); nav(); });
const thumb = (i, p, extra = '') => `<div class="thumb" ${extra}><div class="sc" aria-hidden="true" inert>${tpl(i, p)}</div></div>`;

/* ======================= Router ======================= */
const TITLES = { home: 'Frofolia — Online Portfolio Template Generator', edit: 'Portfolio information', templates: 'Choose a template', preview: 'Portfolio preview', manage: 'My Portfolios' };
function route() {
  nav();
  const [pg, id] = curPage(), A = $('#app');
  const known = ['edit', 'templates', 'preview', 'manage'].includes(pg);
  document.title = (TITLES[known ? pg : 'home']) + (known ? ' — Frofolia' : '');
  A.className = '';
  if (!known) return pgHome(A);
  if (loading) return pgLoading(A);
  if (mode === 'error') return pgDbError(A);
  if (pg === 'edit') return pgEdit(A, id);
  if (pg === 'templates') return pgTemplates(A, id);
  if (pg === 'preview') return pgPreview(A, id);
  return pgManage(A);
}
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); $('#app').focus({ preventScroll: true }); });

function pgLoading(A) {
  A.innerHTML = `<div class="phead"><div><h1>Loading…</h1><p>Contacting the database.</p></div></div><div aria-hidden="true"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>`;
}
function pgDbError(A) {
  A.innerHTML = `<div class="panel"><h2>We can’t reach the database</h2><p>Check <b>config.js</b> (Supabase URL and anon key), confirm <b>schema.sql</b> has been run, and check your connection.</p><p class="errtxt">${esc(lastErr)}</p><div class="actions" style="justify-content:center"><button class="btn btn-primary" data-act="retry">Try again</button><a class="btn" href="#/">Back to Home</a></div></div>`;
}

/* ======================= Home ======================= */
const HERO_ART = `<svg viewBox="0 0 520 560" role="img" aria-label="Illustration of a laptop showing a portfolio, a notebook, a mug and a plant on a sunlit desk">
<defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C8" stop-opacity=".7"/><stop offset="1" stop-color="#FFF1C8" stop-opacity="0"/></linearGradient></defs>
<rect width="520" height="400" fill="#EDE6D3"/>
<rect x="300" y="40" width="172" height="232" fill="#FBF3DB" stroke="#CFC6B0" stroke-width="2"/><path d="M386 40v232M300 156h172" stroke="#CFC6B0" stroke-width="2"/>
<polygon points="300,272 472,272 520,400 240,400" fill="url(#beam)"/>
<rect y="380" width="520" height="180" fill="#CBB08A"/><path d="M0 380h520" stroke="#B89A72" stroke-width="2"/>
<ellipse cx="195" cy="386" rx="176" ry="8" fill="#000" opacity=".14"/>
<rect x="70" y="205" width="250" height="160" rx="6" fill="#252820"/><rect x="80" y="215" width="230" height="140" rx="2" fill="#FFFCF5"/>
<rect x="94" y="232" width="116" height="16" fill="#252820"/><rect x="94" y="254" width="70" height="8" fill="#C5684D"/>
<rect x="94" y="278" width="96" height="4" fill="#A8B6A0"/><rect x="94" y="288" width="84" height="4" fill="#A8B6A0"/><rect x="94" y="298" width="92" height="4" fill="#A8B6A0"/>
<circle cx="280" cy="312" r="28" fill="#C5684D" opacity=".4"/><path d="M236 344v-52a32 32 0 0 1 64 0v52z" fill="#A8B6A0"/><circle cx="268" cy="296" r="9" fill="#F7F3E9"/><path d="M250 344c2-18 10-26 18-26s16 8 18 26z" fill="#173D30"/>
<rect x="94" y="322" width="38" height="24" fill="#E9CBBD"/><rect x="138" y="322" width="38" height="24" fill="#C9D3C2"/><rect x="182" y="322" width="38" height="24" fill="#EFDFC4"/>
<path d="M50 365h290l12 15H38z" fill="#3A3D34"/>
<rect x="372" y="346" width="32" height="34" rx="4" fill="#FFFCF5" stroke="#DED8CA"/><path d="M404 355h8a6 6 0 0 1 0 14h-8" fill="none" stroke="#DED8CA" stroke-width="3"/><path d="M382 336c-4-6 4-8 0-14M394 336c-4-6 4-8 0-14" fill="none" stroke="#A8B6A0" stroke-width="2" stroke-linecap="round"/>
<path d="M432 330h58l-8 50h-42z" fill="#F2EBDB" stroke="#DED8CA"/><ellipse cx="461" cy="330" rx="29" ry="5" fill="#6B4F36"/>
<g transform="translate(461 330)"><ellipse cx="0" cy="-50" rx="12" ry="42" fill="#173D30"/><ellipse cx="-26" cy="-34" rx="11" ry="34" transform="rotate(-38 -26 -34)" fill="#4F6F5B"/><ellipse cx="28" cy="-36" rx="11" ry="34" transform="rotate(36 28 -36)" fill="#A8B6A0"/><ellipse cx="-44" cy="-14" rx="9" ry="26" transform="rotate(-70 -44 -14)" fill="#173D30"/><ellipse cx="46" cy="-14" rx="9" ry="26" transform="rotate(68 46 -14)" fill="#4F6F5B"/></g>
<g transform="rotate(-8 400 475)"><rect x="330" y="430" width="140" height="92" rx="4" fill="#C5684D"/><rect x="330" y="430" width="14" height="92" fill="#A24A31"/><rect x="448" y="430" width="6" height="92" fill="#173D30" opacity=".8"/><rect x="364" y="454" width="58" height="34" fill="#FFFCF5" opacity=".92"/><path d="M372 466h42M372 474h30" stroke="#A8B6A0" stroke-width="3"/></g>
<path d="M352 520 470 458" stroke="#173D30" stroke-width="5" stroke-linecap="round"/>
</svg>`;

function pgHome(A) {
  A.className = 'home';
  A.innerHTML = `<section class="hero"><div><h1>Your Story, Beautifully Presented.</h1>
    <p>Enter your details, choose a design, and Frofolia lays out your portfolio. It’s saved online and ready to edit whenever your story changes.</p>
    <div class="actions"><a class="btn btn-primary" href="#/edit">Create Portfolio</a><a class="btn" href="#" data-scroll="templates">See the templates</a></div></div>
    <div class="hero-art">${HERO_ART}</div></section>
  <section class="sect" id="templates"><div class="wrap"><div class="sect-head"><h2>Discover Our Templates</h2><p>Three distinct layouts, each shown here with sample content. Preview one in full, or start with the one you like.</p></div>
    <div class="tgrid">${TN.map((t, i) => `<article class="tcard">
      <button type="button" class="thumb" data-act="sample" data-i="${i}" aria-label="Preview the ${t.name} template"><div class="sc" aria-hidden="true" inert>${tpl(i, SAMPLE)}</div></button>
      <div class="tbody"><h3>${t.name}</h3><p>${t.blurb}</p>
        <div class="actions"><button type="button" class="btn btn-sm" data-act="sample" data-i="${i}">Preview</button><button type="button" class="btn btn-primary btn-sm" data-act="use-tpl" data-i="${i}">Use ${t.name}</button></div></div></article>`).join('')}</div></div></section>
  <section class="sect"><div class="wrap"><div class="sect-head"><h2>How It Works</h2></div>
    <ol class="steps">${[['Enter Information', 'Add your details, education, skills, projects and experience in one organised form.'], ['Choose a Template', 'Compare Simple, Modern and Creative using your own content.'], ['Preview & Generate', 'See your portfolio exactly as visitors will, then print it or save it as a PDF.'], ['Manage Your Portfolio', 'Edit, switch templates or delete your portfolios whenever you like.']].map((s, i) => `<li><span class="n" aria-hidden="true">${i + 1}</span><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol></div></section>`;
  fit();
}

/* sample-template preview dialog (home page + footer) */
function openSample(i) {
  const d = document.createElement('dialog'); d.className = 'pdlg'; d.setAttribute('aria-labelledby', 'pd-t');
  d.innerHTML = `<div class="pdlg-head"><div><h2 id="pd-t">${TN[i].name} template</h2><p>${TN[i].blurb} Shown with sample content.</p></div><div class="actions"><button type="button" class="btn btn-primary btn-sm" data-use>Use ${TN[i].name}</button><button type="button" class="btn btn-ghost btn-sm" data-close>Close</button></div></div><div class="pdlg-body">${tpl(i, SAMPLE)}</div>`;
  document.body.appendChild(d); d.showModal();
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.querySelector('[data-close]').onclick = () => d.close();
  d.querySelector('[data-use]').onclick = () => { d.close(); useTemplate(i); };
}
function useTemplate(i) {
  pendingTemplate = i;
  const [pg, id] = curPage();
  if (pg === 'edit' && !id && draft) { draft.template = i; toast(TN[i].name + ' selected for this portfolio'); }
  else go('/edit');
}

/* ======================= Form ======================= */
const blank = () => ({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: '', title: '', photo: '', email: '', phone: '', address: '', about: '', education: [{}], skills: [], projects: [{}], experience: [{}], links: [{}], template: pendingTemplate });
const store = { get: k => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or unavailable */ } }, del: k => { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } } };
let restored = false;

function pgEdit(A, id) {
  const ex = id && find(id);
  if (id && !ex) { toast('That portfolio no longer exists', 'err'); go('/manage'); return; }
  draftKey = 'frofolia:draft:' + (id || 'new');
  const saved = store.get(draftKey);
  restored = !!saved;
  draft = saved || (ex ? JSON.parse(JSON.stringify(ex)) : blank());
  errs = {};
  normaliseDraft();
  A.innerHTML = `<div class="phead"><div><h1>${ex ? 'Edit portfolio' : 'Create your portfolio'}</h1><p>Fill in what you have. Only your name and email are required, and you can edit everything later.</p></div></div><div id="fw"></div>`;
  drawForm();
}
function normaliseDraft() {
  ['education', 'projects', 'experience', 'links'].forEach(k => { if (!Array.isArray(draft[k]) || !draft[k].length) draft[k] = [{}]; });
  draft.skills = Array.isArray(draft.skills) ? draft.skills : [];
}
const fid = k => 'f-' + k.replace(/\./g, '-');
function field(k, label, o = {}) {
  const { type = 'text', ph = '', req = false, ac = '', full = false } = o;
  const val = getP(draft, k) ?? '', er = errs[k];
  return `<div class="fld${full ? ' full' : ''}"><label for="${fid(k)}">${label}${req ? '<span class="req" aria-hidden="true"> *</span>' : ''}</label>
  <input id="${fid(k)}" type="${type}" data-p="${k}" value="${esc(val)}" placeholder="${esc(ph)}"${req ? ' aria-required="true"' : ''}${ac ? ` autocomplete="${ac}"` : ''}${er ? ` aria-invalid="true" aria-describedby="${fid(k)}-e"` : ''}>
  ${er ? `<p class="err" id="${fid(k)}-e">${ic('alert')}<span>${esc(er)}</span></p>` : ''}</div>`;
}
function area(k, label, ph, rows) {
  return `<div class="fld full"><label for="${fid(k)}">${label}</label><textarea id="${fid(k)}" data-p="${k}" placeholder="${esc(ph)}"${rows ? ` rows="${rows}"` : ''}>${esc(getP(draft, k) ?? '')}</textarea></div>`;
}
function rep(key, label, cols, descArea, withImage) {
  return draft[key].map((r, i) => `<div class="entry"><div class="rhead"><span>${label} ${i + 1}</span><button type="button" class="link-btn danger" data-act="del-row" data-k="${key}" data-i="${i}" aria-label="Remove ${label} ${i + 1}">Remove</button></div>
    <div class="frow">${cols.map(c => field(`${key}.${i}.${c[0]}`, c[1], { ph: c[2], full: c[3] })).join('')}${descArea ? area(`${key}.${i}.${descArea[0]}`, descArea[1], descArea[2], 3) : ''}</div>
    ${withImage ? `<div class="pimg"><div class="pimg-prev">${r.image ? `<img src="${esc(r.image)}" alt="Project image preview">` : ic('image')}</div><div><span class="lbl">Project image <span class="muted">(optional)</span></span>
      <input type="file" id="pimg-${i}" accept="image/*" class="sr" data-img="proj" data-i="${i}" tabindex="-1">
      <button type="button" class="btn btn-sm" data-act="pick-file" data-t="pimg-${i}">${ic('camera')} ${r.image ? 'Replace' : 'Add'} image</button>${r.image ? ` <button type="button" class="link-btn danger" data-act="rm-pimg" data-i="${i}">Remove</button>` : ''}</div></div>` : ''}</div>`).join('') +
    `<button type="button" class="btn btn-sm" data-act="add-row" data-k="${key}">${ic('plus')} Add ${label.toLowerCase()}</button>`;
}
const SECS = [['personal', 'Personal details'], ['about', 'About me'], ['education', 'Education'], ['skills', 'Skills'], ['projects', 'Projects'], ['experience', 'Work experience'], ['links', 'Links']];
const secDone = id => ({ personal: () => draft.name.trim() && draft.email.trim(), about: () => (draft.about || '').trim(), education: () => draft.education.some(has), skills: () => draft.skills.length, projects: () => draft.projects.some(has), experience: () => draft.experience.some(has), links: () => draft.links.some(has) }[id]());
function drawForm() {
  const y = window.scrollY, nErr = Object.keys(errs).length;
  const sec = (id, title, hint, body) => `<section class="fsec" id="sec-${id}" data-fsec="${id}" aria-labelledby="h-${id}"><div class="fhead"><h2 id="h-${id}">${title}</h2><p>${hint}</p></div>${body}</section>`;
  $('#fw').innerHTML = `${restored ? `<div class="note"><span>We restored the unsaved changes you made earlier.</span><button type="button" class="link-btn" data-act="discard-draft">Discard them</button></div>` : ''}
  <div class="fwrap"><nav class="fnav" aria-label="Form sections"><ol>${SECS.map(s => `<li><a href="#" data-scroll="sec-${s[0]}" data-fn="${s[0]}" class="${secDone(s[0]) ? 'done' : ''}"><span class="dot">${ic('check')}</span>${s[1]}</a></li>`).join('')}</ol></nav>
  <div>
  ${sec('personal', 'Personal details', 'How visitors will recognise and reach you.', `
    <div class="photo-row"><div class="avatar">${draft.photo ? `<img src="${esc(draft.photo)}" alt="Profile picture preview">` : ic('user')}</div>
      <div><span class="lbl">Profile picture</span><p class="hint" style="margin:0 0 10px">JPG or PNG. It is cropped to a square and resized automatically.</p>
      <input type="file" id="photo-file" accept="image/*" class="sr" data-img="photo" tabindex="-1">
      <button type="button" class="btn btn-sm" data-act="pick-file" data-t="photo-file">${ic('camera')} ${draft.photo ? 'Replace' : 'Upload'} photo</button>${draft.photo ? ' <button type="button" class="link-btn danger" data-act="rm-photo">Remove</button>' : ''}</div></div>
    <div class="frow">${field('name', 'Full name', { req: true, ph: 'Jane Dela Cruz', ac: 'name' })}${field('title', 'Headline or professional role', { ph: 'Full-Stack Developer' })}${field('email', 'Email', { req: true, type: 'email', ph: 'jane@email.com', ac: 'email' })}${field('phone', 'Contact number', { type: 'tel', ph: '+63 900 000 0000', ac: 'tel' })}${field('address', 'Address', { ph: 'City, Country', full: true, ac: 'street-address' })}</div>`)}
  ${sec('about', 'About me', 'A short introduction in your own words.', `<div class="frow">${area('about', 'About me', 'Tell visitors who you are, what you do and what you care about.', 6)}</div>`)}
  ${sec('education', 'Educational background', 'Add every school or program you want to show.', rep('education', 'Education', [['school', 'School or university', 'Cebu Technological University', true], ['degree', 'Degree or program', 'BS Information Technology'], ['years', 'Years', '2021 – 2025']]))}
  ${sec('skills', 'Skills', 'Type a skill and press Enter, or choose Add skill.', `<div class="fld"><label for="f-skill">New skill</label><div class="skill-add"><input id="f-skill" type="text" placeholder="e.g. JavaScript"><button type="button" class="btn" data-act="add-skill">Add skill</button></div></div>
    <div class="chips" aria-label="Your skills">${draft.skills.map((s, i) => `<button type="button" class="chip" data-act="del-skill" data-i="${i}" aria-label="Remove skill ${esc(s)}">${esc(s)}${ic('x')}</button>`).join('') || '<span class="muted" style="font-size:14px">No skills added yet.</span>'}</div>`)}
  ${sec('projects', 'Projects', 'Show your best work. An image makes a project stand out.', rep('projects', 'Project', [['title', 'Project title', 'My Awesome App'], ['link', 'Link (optional)', 'https://…']], ['desc', 'Description', 'What did you build, and what was your part?'], true))}
  ${sec('experience', 'Work experience', 'Jobs, internships, volunteering or freelance work.', rep('experience', 'Experience', [['role', 'Role', 'Intern Developer'], ['company', 'Company', 'Acme Inc.'], ['years', 'Years', '2024 – 2025', true]], ['desc', 'Description', 'Key responsibilities and results']))}
  ${sec('links', 'Social media and website links', 'Where people can find you online.', rep('links', 'Link', [['label', 'Label', 'GitHub'], ['url', 'URL', 'https://github.com/you']]))}
  <div class="fbar"><div id="ferr" class="alert" role="alert" hidden></div><div class="fbtns"><a class="btn btn-ghost" href="#" data-act="cancel">Cancel</a><button type="button" class="btn btn-primary" id="sv" data-act="save">Save and Continue</button></div></div>
  </div></div>`;
  if (nErr) showErr(`Please fix ${nErr} field${nErr > 1 ? 's' : ''} marked below.`);
  window.scrollTo(0, y);
  watchSections();
}
function showErr(m) { const e = $('#ferr'); if (!e) return; e.hidden = !m; e.innerHTML = m ? ic('alert') + '<span>' + esc(m) + '</span>' : ''; }
function watchSections() {
  if (io) io.disconnect();
  io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) document.querySelectorAll('.fnav a').forEach(a => { if (a.dataset.fn === en.target.dataset.fsec) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }), { rootMargin: '-25% 0px -65% 0px' });
  document.querySelectorAll('.fsec').forEach(s => io.observe(s));
}
function refreshDone() { document.querySelectorAll('.fnav a').forEach(a => a.classList.toggle('done', !!secDone(a.dataset.fn))); }
let saveT;
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.p;
  if (!k || !draft) return;
  setP(draft, k, e.target.value);
  if (errs[k]) { delete errs[k]; e.target.removeAttribute('aria-invalid'); const m = $('#' + fid(k) + '-e'); if (m) m.remove(); if (!Object.keys(errs).length) showErr(''); }
  clearTimeout(saveT); saveT = setTimeout(() => store.set(draftKey, draft), 300);
  refreshDone();
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'f-skill') { e.preventDefault(); addSkill(); } });
function addSkill() {
  const el = $('#f-skill'); if (!el) return;
  const v = el.value.trim(); if (!v) return;
  if (!draft.skills.some(s => s.toLowerCase() === v.toLowerCase())) draft.skills.push(v);
  store.set(draftKey, draft); drawForm(); $('#f-skill').focus();
}
function resizeImage(file, o = {}) {
  const { cover = false, size = 480, max = 800, q = .82 } = o;
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error('Please choose an image file (JPG or PNG).'));
    const r = new FileReader();
    r.onerror = () => rej(new Error('That file could not be read.'));
    r.onload = () => {
      const im = new Image();
      im.onerror = () => rej(new Error('That image could not be opened.'));
      im.onload = () => {
        const c = document.createElement('canvas'), x = c.getContext('2d');
        if (cover) { c.width = c.height = size; x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); const m = Math.min(im.width, im.height); x.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, size, size); }
        else { const k = Math.min(1, max / Math.max(im.width, im.height)); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); }
        res(c.toDataURL('image/jpeg', q));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
document.addEventListener('change', async e => {
  const t = e.target;
  if (t.name === 'tpl') { tplSel = +t.value; return; }
  if (!t.dataset || !t.dataset.img || !draft) return;
  const f = t.files[0]; if (!f) return;
  try {
    if (t.dataset.img === 'photo') draft.photo = await resizeImage(f, { cover: true, size: 480 });
    else draft.projects[+t.dataset.i].image = await resizeImage(f, { max: 800, q: .78 });
    store.set(draftKey, draft); drawForm();
  } catch (err) { toast(errMsg(err), 'err'); }
});
function validate() {
  errs = {};
  if (!draft.name.trim()) errs.name = 'Enter your full name.';
  if (!draft.email.trim()) errs.email = 'Enter your email address.';
  else if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) errs.email = 'Enter a valid email address, like name@example.com.';
  return !Object.keys(errs).length;
}
async function saveDraft() {
  const sk = $('#f-skill'); if (sk && sk.value.trim() && !draft.skills.includes(sk.value.trim())) draft.skills.push(sk.value.trim());
  if (!validate()) {
    drawForm();
    const first = document.querySelector('[aria-invalid="true"]'); if (first) { first.focus(); first.scrollIntoView({ block: 'center' }); }
    return;
  }
  const clean = JSON.parse(JSON.stringify(draft));
  ['education', 'projects', 'experience', 'links'].forEach(k => { clean[k] = clean[k].filter(has); });
  clean.name = clean.name.trim(); clean.email = clean.email.trim(); clean.updatedAt = Date.now();
  const b = $('#sv'); b.disabled = true; b.textContent = 'Saving…'; showErr('');
  try {
    await persist(clean);
    store.del(draftKey); pendingTemplate = 0; draft = null;
    toast('Portfolio saved'); go('/templates/' + clean.id);
  } catch (e) {
    console.error(e);
    b.disabled = false; b.textContent = 'Save and Continue';
    showErr('Could not save: ' + errMsg(e) + '. Your entries are still here, so you can try again.');
  }
}

/* ======================= Template picker ======================= */
function pgTemplates(A, id) {
  const p = find(id); if (!p) { go('/manage'); return; }
  tplSel = p.template || 0;
  A.innerHTML = `<div class="phead"><div><h1>Choose a template</h1><p>Each layout below is shown with your own information, ${esc(p.name)}. Pick the one that fits.</p></div><div class="actions"><a class="btn" href="#/edit/${esc(p.id)}">${ic('edit')} Edit information</a></div></div>
  <div class="tgrid tpick" role="radiogroup" aria-label="Portfolio template">${TN.map((t, i) => `<div class="tcard">
    <input class="sr" type="radio" name="tpl" id="tpl-${i}" value="${i}"${tplSel === i ? ' checked' : ''}>
    <label for="tpl-${i}" class="thumb" aria-hidden="true" tabindex="-1" style="display:block"><div class="sc" aria-hidden="true" inert>${tpl(i, p)}</div></label>
    <div class="tbody"><h3>${t.name}</h3><p>${t.blurb}</p><div class="actions"><label for="tpl-${i}" class="selmark"><span class="off">Select ${t.name}</span><span class="on">${t.name} selected</span></label></div></div></div>`).join('')}</div>
  <div class="tpick-bar"><a class="btn btn-ghost" href="#/edit/${esc(p.id)}">Back to information</a><button type="button" class="btn btn-primary" id="gen" data-act="generate" data-id="${esc(p.id)}">Preview &amp; Generate</button></div>`;
  fit();
}
async function generate(id) {
  const p = find(id), b = $('#gen'); if (!p) return;
  b.disabled = true; b.textContent = 'Saving…';
  try { await persist({ ...p, template: tplSel, updatedAt: Date.now() }); go('/preview/' + id); }
  catch (e) { b.disabled = false; b.textContent = 'Preview & Generate'; toast('Could not save your choice: ' + errMsg(e), 'err'); }
}

/* ======================= Preview ======================= */
function pgPreview(A, id) {
  const p = find(id); if (!p) { go('/manage'); return; }
  const t = p.template || 0;
  A.innerHTML = `<div class="phead"><div><h1>Your portfolio</h1><p><span class="tag">${ic('layout')} ${TN[t].name} template</span> &nbsp;Showing ${esc(p.name)}’s saved information.</p></div>
  <div class="actions"><div class="tabs" role="group" aria-label="Switch template">${TN.map((x, i) => `<button type="button" data-act="switch-tpl" data-i="${i}" aria-pressed="${t === i}">${x.name}</button>`).join('')}</div>
  <a class="btn" href="#/edit/${esc(p.id)}">${ic('edit')} Edit</a><a class="btn" href="#/templates/${esc(p.id)}">${ic('layout')} Change Template</a><button type="button" class="btn" data-act="print">${ic('print')} Print</button><a class="btn btn-primary" href="#/manage">${ic('grid')} Manage</a></div></div>
  <div class="stage">${tpl(t, p)}</div>`;
}
async function switchTpl(i) {
  const [, id] = curPage(), p = find(id);
  if (!p || (p.template || 0) === i) return;
  try { await persist({ ...p, template: i, updatedAt: Date.now() }); pgPreview($('#app'), id); const b = document.querySelector('.tabs [aria-pressed="true"]'); if (b) b.focus({ preventScroll: true }); toast('Switched to ' + TN[i].name); }
  catch (e) { toast('Could not switch template: ' + errMsg(e), 'err'); }
}

/* ======================= Manage ======================= */
function pgManage(A) {
  const head = `<div class="phead"><div><h1>My portfolios</h1><p>View, edit or delete the portfolios saved in your database.</p></div><div class="actions"><a class="btn btn-primary" href="#/edit">${ic('plus')} Create New Portfolio</a></div></div>`;
  if (!list.length) { A.innerHTML = head + `<div class="panel"><h2>No portfolios yet</h2><p>Create your first portfolio and it will appear here.</p><a class="btn btn-primary" href="#/edit">Create Portfolio</a></div>`; return; }
  A.innerHTML = head + `<ul class="mlist">${list.map(p => `<li class="mrow"><div class="mav">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : initial(p)}</div>
    <div class="mmain"><h2>${esc(p.name)}</h2><p>${esc(p.title || p.email)}</p></div>
    <div class="mmeta"><span class="tag">${ic('layout')} ${TN[p.template || 0].name}</span><span>Updated ${fmtDate(p.updatedAt) || '—'}</span>${p.created_at ? `<span>Created ${fmtDate(p.created_at)}</span>` : ''}</div>
    <div class="macts"><a class="btn btn-sm btn-primary" href="#/preview/${esc(p.id)}">${ic('eye')} View</a><a class="btn btn-sm" href="#/edit/${esc(p.id)}">${ic('edit')} Edit</a><a class="btn btn-sm" href="#/templates/${esc(p.id)}">${ic('layout')} Template</a><button type="button" class="btn btn-sm btn-ghost" data-act="del-portfolio" data-id="${esc(p.id)}">${ic('trash')} Delete</button></div></li>`).join('')}</ul>`;
}
function confirmDelete(id) {
  const p = find(id); if (!p) return;
  const d = document.createElement('dialog'); d.className = 'dlg'; d.setAttribute('aria-labelledby', 'dl-t');
  d.innerHTML = `<h2 id="dl-t">Delete this portfolio?</h2><p>“${esc(p.name)}” will be permanently removed from the database. This can’t be undone.</p><div class="dact"><button type="button" class="btn btn-ghost" data-x>Cancel</button><button type="button" class="btn btn-danger" data-ok>Delete portfolio</button></div>`;
  document.body.appendChild(d); d.showModal();
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.querySelector('[data-x]').onclick = () => d.close();
  d.querySelector('[data-ok]').onclick = async e => {
    e.target.disabled = true; e.target.textContent = 'Deleting…';
    try { await remove(id); store.del('frofolia:draft:' + id); d.close(); toast('Portfolio deleted'); pgManage($('#app')); }
    catch (err) { d.close(); toast('Delete failed: ' + errMsg(err), 'err'); }
  };
}

/* ======================= Global actions ======================= */
document.addEventListener('click', e => {
  if (e.target.closest('.skip')) { e.preventDefault(); $('#app').focus(); return; }
  const sc = e.target.closest('[data-scroll]');
  if (sc) {
    e.preventDefault();
    const root = sc.closest('.tpl') || document, key = sc.dataset.scroll;
    const t = root.querySelector(`[data-sec="${key}"]`) || document.getElementById(key);
    if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, i = +b.dataset.i, k = b.dataset.k;
  switch (a) {
    case 'sample': openSample(i); break;
    case 'use-tpl': useTemplate(i); break;
    case 'add-row': draft[k].push({}); store.set(draftKey, draft); drawForm(); break;
    case 'del-row': draft[k].splice(i, 1); if (!draft[k].length) draft[k].push({}); store.set(draftKey, draft); drawForm(); break;
    case 'add-skill': addSkill(); break;
    case 'del-skill': draft.skills.splice(i, 1); store.set(draftKey, draft); drawForm(); break;
    case 'pick-file': $('#' + b.dataset.t).click(); break;
    case 'rm-photo': draft.photo = ''; store.set(draftKey, draft); drawForm(); break;
    case 'rm-pimg': delete draft.projects[i].image; store.set(draftKey, draft); drawForm(); break;
    case 'save': saveDraft(); break;
    case 'cancel': e.preventDefault(); store.del(draftKey); pendingTemplate = 0; draft = null; go(list.length ? '/manage' : '/'); break;
    case 'discard-draft': store.del(draftKey); route(); break;
    case 'generate': generate(b.dataset.id); break;
    case 'switch-tpl': switchTpl(i); break;
    case 'print': window.print(); break;
    case 'del-portfolio': confirmDelete(b.dataset.id); break;
    case 'retry': initDb(); break;
  }
});

/* ======================= Start ======================= */
renderFoot();
route();
initDb();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); nav(); });
