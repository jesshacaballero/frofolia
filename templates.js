/* Frofolia — shared helpers + the three portfolio templates.
   Simple, Modern and Creative are separate functions with separate markup,
   so they differ in structure, not just colour. All three read the same data. */

/* ---------- helpers ---------- */
const ICONS = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  pin: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  book: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 4v-3a3 3 0 0 0-1-2c3 0 6-2 6-6a5 5 0 0 0-1-3 4 4 0 0 0 0-3s-1 0-3 1a10 10 0 0 0-6 0C6 4 5 4 5 4a4 4 0 0 0 0 3 5 5 0 0 0-1 3c0 4 3 6 6 6a3 3 0 0 0-1 2v3"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 7.5v.01M12 17v-6m0 2a3 3 0 0 1 5 1v3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-8 9"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  home: '<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v5M12 18v.01"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
};
const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[n] || ''}</svg>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const href = u => /^(https?:\/\/|mailto:|tel:)/i.test(u) ? u : 'https://' + u;   // anything else gets https:// so javascript: URLs can't run
const ok = a => Array.isArray(a) ? a : [];
const has = r => r && typeof r === 'object' ? Object.values(r).some(v => String(v || '').trim()) : !!String(r || '').trim();
const linkIcon = u => /github/i.test(u) ? 'github' : /linkedin/i.test(u) ? 'linkedin' : 'globe';
const initial = p => esc((p.name || '?').trim().charAt(0).toUpperCase());
const portrait = p => p.photo ? `<img src="${esc(p.photo)}" alt="Portrait of ${esc(p.name)}">` : `<span class="ini" aria-hidden="true">${initial(p)}</span>`;
const firstName = p => (p.name || '').trim().split(/\s+/)[0] || 'there';
const longName = p => (p.name || '').length > 24 ? ' long' : '';
const contactHref = (t, v) => t === 'mail' ? 'mailto:' + v : t === 'phone' ? 'tel:' + v.replace(/[^\d+]/g, '') : '';
const contactItem = c => {
  const h = contactHref(c[0], c[1]);
  return `<li>${ic(c[0])}${h ? `<a href="${esc(h)}">${esc(c[1])}</a>` : `<span>${esc(c[1])}</span>`}</li>`;
};
const extLink = (u, label) => `<a href="${esc(href(u))}" target="_blank" rel="noopener noreferrer">${label}</a>`;

/* Normalised, filtered copy of the saved data that every template reads. */
function view(p) {
  return {
    ct: [['mail', p.email], ['phone', p.phone], ['pin', p.address]].filter(x => x[1]),
    links: ok(p.links).filter(l => l && l.url),
    ed: ok(p.education).filter(has),
    pj: ok(p.projects).filter(has),
    ex: ok(p.experience).filter(has),
    sk: ok(p.skills).filter(Boolean)
  };
}

/* ---------- template metadata (exact names required by the course) ---------- */
const TN = [
  { name: 'Simple', blurb: 'Minimalist, timeless, and professional.' },
  { name: 'Modern', blurb: 'Structured, contemporary, and technology-focused.' },
  { name: 'Creative', blurb: 'Expressive, artistic, and editorial.' }
];

/* =====================================================================
   TEMPLATE 1 — SIMPLE: a typeset résumé. Narrow profile column + main column.
   ===================================================================== */
function tplSimple(p) {
  const v = view(p);
  return `<div class="tplw"><article class="tpl t1" aria-label="Portfolio of ${esc(p.name)}">
  <div class="t1-pic">${portrait(p)}</div>
  <header class="t1-head"><h1 class="${longName(p).trim()}">${esc(p.name)}</h1>${p.title ? `<p class="t1-role">${esc(p.title)}</p>` : ''}</header>
  <aside class="t1-side">
    ${v.ct.length ? `<section><h2>Contact</h2><ul class="t1-list">${v.ct.map(contactItem).join('')}</ul></section>` : ''}
    ${v.links.length ? `<section><h2>Online</h2><ul class="t1-list">${v.links.map(l => `<li>${ic(linkIcon(l.url))}${extLink(l.url, esc(l.label || l.url))}</li>`).join('')}</ul></section>` : ''}
    ${v.sk.length ? `<section><h2>Skills</h2><ul class="t1-skills">${v.sk.map(s => `<li>${esc(s)}</li>`).join('')}</ul></section>` : ''}
  </aside>
  <div class="t1-main">
    ${p.about ? `<section><h2>About</h2><p class="t1-about">${esc(p.about)}</p></section>` : ''}
    ${v.ex.length ? `<section><h2>Experience</h2>${v.ex.map(r => `<div class="t1-item"><div class="t1-row"><h3>${esc(r.role)}</h3><span class="t1-yrs">${esc(r.years)}</span></div>${r.company ? `<p class="t1-org">${esc(r.company)}</p>` : ''}${r.desc ? `<p>${esc(r.desc)}</p>` : ''}</div>`).join('')}</section>` : ''}
    ${v.ed.length ? `<section><h2>Education</h2>${v.ed.map(r => `<div class="t1-item"><div class="t1-row"><h3>${esc(r.school)}</h3><span class="t1-yrs">${esc(r.years)}</span></div>${r.degree ? `<p class="t1-org">${esc(r.degree)}</p>` : ''}</div>`).join('')}</section>` : ''}
    ${v.pj.length ? `<section><h2>Projects</h2>${v.pj.map(r => `<div class="t1-item"><div class="t1-row"><h3>${esc(r.title)}</h3>${r.link ? `<span class="t1-yrs">${extLink(r.link, 'View project')}</span>` : ''}</div>${r.desc ? `<p>${esc(r.desc)}</p>` : ''}</div>`).join('')}</section>` : ''}
  </div></article></div>`;
}

/* =====================================================================
   TEMPLATE 2 — MODERN: forest-green sidebar + structured grid + uniform project cards.
   ===================================================================== */
const phModern = '<div class="t2-img ph" aria-hidden="true">' + ic('image') + '</div>';
function tplModern(p) {
  const v = view(p);
  const nav = [['about', 'Introduction', true], ['projects', 'Projects', v.pj.length], ['experience', 'Experience', v.ex.length], ['education', 'Education', v.ed.length], ['skills', 'Skills', v.sk.length]].filter(x => x[2]);
  return `<div class="tplw"><article class="tpl t2" aria-label="Portfolio of ${esc(p.name)}">
  <aside class="t2-side">
    <div class="t2-pic">${portrait(p)}</div>
    <div class="t2-id"><h1 class="t2-name">${esc(p.name)}</h1>${p.title ? `<p class="t2-role">${esc(p.title)}</p>` : ''}</div>
    ${v.ct.length ? `<ul class="t2-contact">${v.ct.map(contactItem).join('')}</ul>` : ''}
    <nav class="t2-nav" aria-label="Portfolio sections">${nav.map(n => `<a href="#" data-scroll="${n[0]}">${n[1]}</a>`).join('')}</nav>
    ${v.links.length ? `<ul class="t2-links">${v.links.map(l => `<li>${ic(linkIcon(l.url))}${extLink(l.url, esc(l.label || l.url))}</li>`).join('')}</ul>` : ''}
  </aside>
  <div class="t2-main">
    <section class="t2-hero" data-sec="about">
      <h2>${p.title ? esc(p.title) : `Hello, I’m ${esc(firstName(p))}.`}</h2>
      ${p.about ? `<p>${esc(p.about)}</p>` : ''}
      <div class="t2-cta">${v.pj.length ? `<a class="t2-btn" href="#" data-scroll="projects">View projects</a>` : ''}${p.email ? `<a class="t2-btn alt" href="mailto:${esc(p.email)}">Get in touch</a>` : ''}</div>
    </section>
    ${v.pj.length ? `<section class="t2-sec" data-sec="projects"><h2>Projects</h2><div class="t2-cards">${v.pj.map(r => `<article class="t2-card">${r.image ? `<div class="t2-img"><img src="${esc(r.image)}" alt="Screenshot of ${esc(r.title)}"></div>` : phModern}<div class="t2-body"><h3>${esc(r.title)}</h3>${r.desc ? `<p>${esc(r.desc)}</p>` : ''}${r.link ? extLink(r.link, 'View project') : ''}</div></article>`).join('')}</div></section>` : ''}
    ${v.ex.length || v.ed.length ? `<div class="t2-grid2">
      ${v.ex.length ? `<section class="t2-sec" data-sec="experience"><h2>Experience</h2><div class="t2-panel">${v.ex.map(r => `<div class="t2-entry"><b>${esc(r.role)}</b><div class="t2-meta">${esc([r.company, r.years].filter(Boolean).join(' | '))}</div>${r.desc ? `<p>${esc(r.desc)}</p>` : ''}</div>`).join('')}</div></section>` : ''}
      ${v.ed.length ? `<section class="t2-sec" data-sec="education"><h2>Education</h2><div class="t2-panel">${v.ed.map(r => `<div class="t2-entry"><b>${esc(r.school)}</b><div class="t2-meta">${esc([r.degree, r.years].filter(Boolean).join(' | '))}</div></div>`).join('')}</div></section>` : ''}
    </div>` : ''}
    ${v.sk.length ? `<section class="t2-sec" data-sec="skills"><h2>Skills</h2><ul class="t2-tags">${v.sk.map(s => `<li class="t2-tag">${esc(s)}</li>`).join('')}</ul></section>` : ''}
  </div></article></div>`;
}

/* =====================================================================
   TEMPLATE 3 — CREATIVE: asymmetric editorial composition, oversized serif name,
   arch portrait, varied project gallery. No sidebar.
   ===================================================================== */
const SPRIG = '<svg class="t3-sprig" viewBox="0 0 120 240" aria-hidden="true" focusable="false"><path d="M60 236C58 160 64 90 60 8" fill="none" stroke="#173D30" stroke-width="2.5" stroke-linecap="round"/><g fill="#173D30"><ellipse cx="38" cy="186" rx="26" ry="10" transform="rotate(-35 38 186)"/><ellipse cx="84" cy="150" rx="26" ry="10" transform="rotate(35 84 150)"/><ellipse cx="36" cy="114" rx="24" ry="9" transform="rotate(-38 36 114)"/><ellipse cx="82" cy="78" rx="22" ry="8" transform="rotate(38 82 78)"/><ellipse cx="46" cy="44" rx="18" ry="7" transform="rotate(-40 46 44)"/></g></svg>';
function phCreative(i) {
  const bg = ['#E9CBBD', '#C9D3C2', '#2D5A47', '#EFDFC4'][i % 4], fg = ['#C5684D', '#173D30', '#A8B6A0', '#C5684D'][i % 4], cx = [300, 100, 260, 120][i % 4];
  return `<svg class="t3-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="300" fill="${bg}"/><circle cx="${cx}" cy="110" r="78" fill="${fg}" opacity=".85"/><path d="M0 300C80 190 190 210 260 250S380 240 400 200V300Z" fill="${fg}" opacity=".35"/></svg>`;
}
function tplCreative(p) {
  const v = view(p);
  let n = 0;
  const num = () => String(++n).padStart(2, '0');
  const lab = t => `<p class="t3-lab">${num()} / ${t}</p>`;
  const hasContact = v.ct.length || v.links.length;
  return `<div class="tplw"><article class="tpl t3" aria-label="Portfolio of ${esc(p.name)}">
  <div class="t3-hero">
    <div class="t3-hero-text">${p.title ? `<p class="t3-role">${esc(p.title)}</p>` : ''}<h1 class="t3-name${longName(p)}">${esc(p.name)}</h1></div>
    <figure class="t3-photo"><span class="t3-blob"></span><div class="t3-arch">${portrait(p)}</div>${SPRIG}</figure>
    ${p.about ? `<div class="t3-about">${lab('About me')}<p class="t3-lead">${esc(p.about)}</p></div>` : ''}
  </div>
  ${v.pj.length ? `<section class="t3-sec">${lab('Selected projects')}<div class="t3-works">${v.pj.map((r, i) => `<figure class="t3-work g${i % 4}"><div class="t3-fig">${r.image ? `<img src="${esc(r.image)}" alt="Image for ${esc(r.title)}">` : phCreative(i)}</div><figcaption class="t3-cap"><span class="t3-no">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(r.title)}</h3>${r.desc ? `<p>${esc(r.desc)}</p>` : ''}${r.link ? extLink(r.link, 'View project') : ''}</div></figcaption></figure>`).join('')}</div></section>` : ''}
  ${v.ex.length || v.ed.length ? `<section class="t3-sec t3-row">
    ${v.ex.length ? `<div class="t3-exp">${lab('Experience')}${v.ex.map(r => `<div class="t3-ent"><span class="yrs">${esc(r.years)}</span><h3>${esc(r.role)}</h3>${r.company ? `<p class="org">${esc(r.company)}</p>` : ''}${r.desc ? `<p>${esc(r.desc)}</p>` : ''}</div>`).join('')}</div>` : ''}
    ${v.ed.length ? `<div class="t3-edu">${lab('Education')}${v.ed.map(r => `<div class="t3-ent"><span class="yrs">${esc(r.years)}</span><h3>${esc(r.school)}</h3>${r.degree ? `<p class="org">${esc(r.degree)}</p>` : ''}</div>`).join('')}</div>` : ''}
  </section>` : ''}
  ${v.sk.length ? `<section class="t3-sec t3-skills">${lab('Skills')}<ul class="t3-sk">${v.sk.map(s => `<li>${esc(s)}</li>`).join('')}</ul></section>` : ''}
  ${hasContact ? `<footer class="t3-foot"><div class="t3-foot-main">${lab('Say hello')}${p.email ? `<a class="t3-mail" href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ''}</div>
    <ul class="t3-foot-side">${[p.phone, p.address].filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('')}${v.links.map(l => `<li>${extLink(l.url, esc(l.label || l.url))}</li>`).join('')}</ul></footer>` : ''}
  </article></div>`;
}

const TPL = [tplSimple, tplModern, tplCreative];
const tpl = (n, p) => (TPL[n] || TPL[0])(p);

/* ---------- sample content for the home page and footer previews ---------- */
const svgURI = s => 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
const samplePhoto = svgURI("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240'><rect width='200' height='240' fill='#A8B6A0'/><circle cx='100' cy='92' r='38' fill='#F7F3E9'/><path d='M24 240c4-56 38-80 76-80s72 24 76 80z' fill='#173D30'/></svg>");
const sampleArt = (a, b, c) => svgURI(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 300'><rect width='480' height='300' fill='${a}'/><circle cx='350' cy='96' r='72' fill='${b}'/><path d='M0 300C90 170 200 200 290 250S440 230 480 190V300Z' fill='${c}'/></svg>`);
const SAMPLE = {
  id: 'sample', template: 0, name: 'Amara Reyes', title: 'Product Designer & Front-End Developer',
  photo: samplePhoto, email: 'amara@example.com', phone: '+63 912 345 6789', address: 'Cebu City, Philippines',
  about: 'I design and build calm, useful digital products. My work sits between interface design and front-end code, with a habit of sweating the small details that make something feel finished.',
  education: [{ school: 'Cebu Technological University', degree: 'BS Information Technology', years: '2021 – 2025' }],
  skills: ['UI Design', 'JavaScript', 'React', 'Figma', 'SQL', 'Accessibility'],
  projects: [
    { title: 'Campus Connect', desc: 'A social app that helps students find study groups and events.', link: 'example.com', image: sampleArt('#E9CBBD', '#C5684D', '#A24A31') },
    { title: 'Budget Buddy', desc: 'A responsive budgeting dashboard with weekly summaries.', link: '', image: sampleArt('#C9D3C2', '#173D30', '#2D5A47') },
    { title: 'Plant Journal', desc: 'A photo journal for tracking how houseplants grow.', link: '', image: sampleArt('#EFDFC4', '#A8B6A0', '#173D30') }
  ],
  experience: [{ role: 'Front-End Intern', company: 'Acme Studio', years: '2024', desc: 'Built reusable interface components and improved page load times.' }],
  links: [{ label: 'GitHub', url: 'github.com' }, { label: 'LinkedIn', url: 'linkedin.com' }]
};
