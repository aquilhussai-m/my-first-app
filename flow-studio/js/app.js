/* Flow Studio — सब data browser के localStorage में रहता है। कोई server / API नहीं। */
(function () {
  'use strict';

  const KEY = 'flowStudio.v1';
  const $ = (s) => document.querySelector(s);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const lines = (txt) => String(txt || '').split('\n').map((l) => l.trim()).filter(Boolean);

  /* ---------------- Constants ---------------- */
  const STYLES = {
    glossy: {
      label: 'Glossy 3D CGI',
      text: 'Glossy, high-end 3D CGI animated film style: smooth stylized shading, vibrant saturated colors, clean soft reflections, soft global illumination, cinematic quality.'
    },
    fur4d: {
      label: 'Hyper-detailed realistic fur ("4D")',
      text: 'Hyper-detailed photorealistic 3D animation ("4D" look): individually rendered fur strands that move naturally, realistic textures, subsurface scattering, cinematic depth of field, ultra-sharp detail.'
    },
    pixar: {
      label: 'Pixar-like 3D',
      text: 'Pixar-like 3D animated feature film style: expressive appealing character shapes, big emotive eyes, warm soft lighting, rich colors, family-friendly cinematic look.'
    }
  };

  const CAMERAS = [
    ['Close-up shot', 'Close-up (चेहरा पास से)'],
    ['Extreme close-up shot', 'Extreme close-up (आँखें / detail)'],
    ['Medium close-up shot', 'Medium close-up (सीने तक)'],
    ['Medium shot', 'Medium shot (आधा शरीर)'],
    ['Full shot showing the whole body', 'Full shot (पूरा शरीर)'],
    ['Wide shot', 'Wide shot (दूर से, जगह दिखे)'],
    ['Extreme wide establishing shot', 'Establishing / extreme wide'],
    ['Low angle shot looking up at the characters', 'Low angle (नीचे से ऊपर)'],
    ['High angle shot looking down at the characters', 'High angle (ऊपर से नीचे)'],
    ["Bird's-eye view from directly above", "Bird's-eye (बिल्कुल ऊपर से)"],
    ['Over-the-shoulder shot', 'Over-the-shoulder (कंधे के पीछे से)'],
    ['POV shot from the character\'s eyes', 'POV (character की नज़र से)'],
    ['Two-shot framing both characters', 'Two-shot (दोनों एक frame में)'],
    ['Slow dolly push-in toward the subject', 'Slow push-in (धीरे पास आना)'],
    ['Smooth tracking shot following the character', 'Tracking shot (साथ-साथ चलना)'],
    ['Slow orbit around the characters', 'Orbit (चारों ओर घूमना)'],
    ['__custom', '✍️ अपना लिखो…']
  ];

  const STATUSES = {
    pending: 'बाकी',
    done: 'बना',
    retake: 'Retake चाहिए',
    approved: 'Approved',
    trailer: 'Trailer में'
  };

  const NARRATOR = '__narrator';

  /* ---------------- Sample data ---------------- */
  function sampleData() {
    const p1 = 'p_chinku', p2 = 'p_rocky', p3 = 'p_golu';
    const ch = (projectId, tag, hindiName, look, items) => ({ id: uid(), projectId, tag, hindiName, look, items });
    const lo = (projectId, tag, hindiName, desc, rules) => ({ id: uid(), projectId, tag, hindiName, desc, rules });
    return {
      version: 1,
      currentProject: p1,
      projects: [
        { id: p1, name: 'चिंकू और खोया हुआ नन्हा दोस्त', aspect: '9:16', setting: 'A peaceful traditional Japanese Sakura village in spring, pink cherry blossoms everywhere', style: 'glossy' },
        { id: p2, name: 'रॉकी और चिंटू', aspect: '16:9', setting: 'Sci-fi space adventure on the alien planet Zoran', style: 'glossy' },
        { id: p3, name: 'Golu', aspect: '16:9', setting: 'A vast hot desert with sand dunes, red striped rocks and cactus', style: 'fur4d' }
      ],
      characters: [
        ch(p1, '@Chinku', 'चिंकू', 'a cute cream-golden fennec fox with very large expressive ears, big amber eyes and a fluffy tail', ['pink-red scarf tied around the neck']),
        ch(p1, '@Mitthu', 'मिट्ठू', 'a tiny round fluffy yellow baby bird with a small orange beak and big shiny eyes; he only chirps, never speaks words', ['no clothes or accessories']),
        ch(p1, '@Gauri', 'गौरी', 'a graceful golden-yellow mother bird with soft feathers and warm caring eyes', ['no clothes or accessories']),
        ch(p2, '@Rocky', 'रॉकी', 'a brave, confident young space explorer hero', ['white-and-blue space suit', 'clear round glass helmet', 'silver utility belt', 'orange gloves', 'white space boots', 'no backpack']),
        ch(p2, '@Chintu', 'चिंटू', 'Rocky\'s small, cheerful and curious sidekick', ['green space suit', 'clear round glass helmet', 'yellow scarf', 'grey gloves', 'grey space boots', 'no backpack']),
        ch(p2, '@Robot', 'रोबोट', 'a friendly round silver robot with glowing blue eyes that hovers slightly above the ground', []),
        ch(p2, '@Urja prani', 'ऊर्जा प्राणी', 'a small friendly floating energy creature made of glowing blue light', []),
        ch(p2, '@Crystal', 'क्रिस्टल', 'a glowing blue energy crystal, hexagonal, softly pulsing with light', []),
        ch(p2, '@Space Explorer', 'स्पेस एक्सप्लोरर', 'the sleek white-and-blue spaceship named "Space Explorer"', []),
        ch(p3, '@Golu', 'गोलू', 'a chubby fennec fox cub with hyper-detailed realistic sandy-cream fur, huge ears and big dark shiny eyes', ['red scarf around the neck'])
      ],
      locations: [
        lo(p1, '@Cottage', 'कॉटेज', 'a small cozy wooden Japanese cottage with a sloped tiled roof and paper sliding doors, surrounded by pink sakura trees', ['pink sakura petals gently floating in the air', 'soft spring daylight']),
        lo(p1, '@Tree', 'पेड़', 'a huge old sakura tree on a green grassy hill, with a small bird nest on a high branch', ['tree always full of pink blossoms']),
        lo(p1, '@Bridge', 'पुल', 'a red wooden arched Japanese bridge over a calm clear stream in the sakura village', ['bridge is always red', 'clear blue water']),
        lo(p2, '@Zoran', 'ज़ोरान', 'the alien planet Zoran', ['purple sky', 'dark rocky ground', 'glowing blue stones', 'no lava', 'no orange glow']),
        lo(p3, '@Desert', 'रेगिस्तान', 'a vast hot desert', ['golden sand dunes', 'red striped rock formations', 'tall green cactus'])
      ],
      shots: [],
      trailer: {},
      scripts: {},
      draft: null
    };
  }

  /* ---------------- State ---------------- */
  let S;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { S = normalize(JSON.parse(raw)); return; }
    } catch (e) { /* fall back to sample */ }
    S = sampleData();
    save();
  }
  function normalize(d) {
    const base = sampleData();
    const out = Object.assign({}, base, d);
    ['projects', 'characters', 'locations', 'shots'].forEach((k) => { if (!Array.isArray(out[k])) out[k] = []; });
    if (!out.trailer || typeof out.trailer !== 'object') out.trailer = {};
    if (!out.scripts || typeof out.scripts !== 'object') out.scripts = {};
    if (!out.projects.find((p) => p.id === out.currentProject)) out.currentProject = out.projects[0] ? out.projects[0].id : null;
    return out;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast('⚠️ Save नहीं हुआ (storage भरा है?)'); }
  }

  const proj = () => S.projects.find((p) => p.id === S.currentProject) || null;
  const pid = () => S.currentProject;
  const charById = (id) => S.characters.find((c) => c.id === id);
  const locById = (id) => S.locations.find((l) => l.id === id);
  const projChars = (all) => S.characters.filter((c) => all || !c.projectId || c.projectId === pid());
  const projLocs = (all) => S.locations.filter((l) => all || !l.projectId || l.projectId === pid());
  const projName = (id) => { const p = S.projects.find((x) => x.id === id); return p ? p.name : 'सभी projects'; };

  function freshDraft() {
    const p = proj();
    return {
      projectId: pid(), chars: [], gaze: {}, point: {}, loc: '',
      camera: 'Medium shot', cameraCustom: '', action: '', dialogues: [],
      mood: '', style: (p && p.style) || 'glossy', aspect: (p && p.aspect) || '16:9', length: '8',
      output: '', shotNum: '', shotDesc: ''
    };
  }
  function draft() {
    if (!S.draft || S.draft.projectId !== pid()) S.draft = freshDraft();
    return S.draft;
  }

  /* ---------------- Toast & clipboard ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function copyText(text, okMsg) {
    const done = () => toast(okMsg || '✅ Copy हो गया');
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, text.length);
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? done() : toast('⚠️ Copy नहीं हुआ — text लंबा दबाकर copy करें');
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }

  /* ---------------- Modal form ---------------- */
  let modalHandlers = null;
  function openForm({ title, fields, values, onSave, onDelete, saveLabel }) {
    $('#modalTitle').textContent = title;
    const body = $('#modalBody');
    body.innerHTML = fields.map((f) => {
      const v = values && values[f.key] != null ? values[f.key] : (f.default != null ? f.default : '');
      const id = 'f_' + f.key;
      let input;
      if (f.type === 'textarea') {
        input = `<textarea id="${id}" rows="${f.rows || 4}" placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`;
      } else if (f.type === 'select') {
        input = `<select id="${id}">${f.options.map(([val, lab]) => `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
      } else {
        const listAttr = f.datalist ? `list="${id}_dl"` : '';
        const dl = f.datalist ? `<datalist id="${id}_dl">${f.datalist.map((o) => `<option value="${esc(o)}">`).join('')}</datalist>` : '';
        input = `<input id="${id}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}" ${f.inputmode ? `inputmode="${f.inputmode}"` : ''} ${listAttr}>${dl}`;
      }
      return `<label class="lbl" for="${id}">${esc(f.label)}</label>${input}${f.hint ? `<div class="field-hint">${esc(f.hint)}</div>` : ''}`;
    }).join('');
    $('#modalSave').textContent = saveLabel || '✅ Save';
    $('#modalDelete').classList.toggle('hidden', !onDelete);
    modalHandlers = {
      save: () => {
        const out = {};
        fields.forEach((f) => { out[f.key] = $('#f_' + f.key).value; });
        if (onSave(out) !== false) closeModal();
      },
      del: onDelete ? () => { if (onDelete() !== false) closeModal(); } : null
    };
    $('#modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const first = body.querySelector('input, textarea, select');
    if (first && window.innerWidth > 700) first.focus();
  }
  function closeModal() {
    $('#modal').classList.add('hidden');
    document.body.style.overflow = '';
    modalHandlers = null;
  }

  const projectOptions = () => [['', 'सभी projects (common)']].concat(S.projects.map((p) => [p.id, p.name]));
  const fixTag = (t) => { t = String(t || '').trim(); return t && !t.startsWith('@') ? '@' + t : t; };

  /* ---------------- Projects ---------------- */
  function editProject(p) {
    const isNew = !p;
    openForm({
      title: isNew ? '➕ नया project' : '✏️ Project बदलो',
      values: p || { aspect: '16:9', style: 'glossy' },
      fields: [
        { key: 'name', label: 'Project का नाम', placeholder: 'जैसे: चिंकू और खोया हुआ नन्हा दोस्त' },
        { key: 'aspect', label: 'Aspect ratio', type: 'select', options: [['16:9', '16:9 (YouTube)'], ['9:16', '9:16 (Shorts / Reels)']] },
        { key: 'style', label: 'Default style', type: 'select', options: Object.keys(STYLES).map((k) => [k, STYLES[k].label]) },
        { key: 'setting', label: 'दुनिया / setting (English में)', type: 'textarea', rows: 3, placeholder: 'e.g. A peaceful Japanese Sakura village in spring' }
      ],
      onSave: (v) => {
        if (!v.name.trim()) { toast('नाम लिखें'); return false; }
        if (isNew) {
          const np = { id: uid(), name: v.name.trim(), aspect: v.aspect, style: v.style, setting: v.setting.trim() };
          S.projects.push(np);
          S.currentProject = np.id;
        } else {
          Object.assign(p, { name: v.name.trim(), aspect: v.aspect, style: v.style, setting: v.setting.trim() });
          if (S.draft && S.draft.projectId === p.id) { S.draft.aspect = v.aspect; S.draft.style = v.style; }
        }
        save(); renderAll(); toast('✅ Project save हुआ');
      },
      onDelete: isNew ? null : () => {
        if (S.projects.length <= 1) { toast('कम से कम एक project रहना चाहिए'); return false; }
        if (!confirm(`"${p.name}" और उसके सारे characters, locations, shots, script मिटा दें?`)) return false;
        S.projects = S.projects.filter((x) => x.id !== p.id);
        S.characters = S.characters.filter((x) => x.projectId !== p.id);
        S.locations = S.locations.filter((x) => x.projectId !== p.id);
        S.shots = S.shots.filter((x) => x.projectId !== p.id);
        delete S.trailer[p.id]; delete S.scripts[p.id];
        S.currentProject = S.projects[0].id;
        save(); renderAll(); toast('🗑️ Project मिटा दिया');
      }
    });
  }

  function renderProjectBar() {
    $('#projectSelect').innerHTML = S.projects.map((p) =>
      `<option value="${esc(p.id)}" ${p.id === pid() ? 'selected' : ''}>${esc(p.name)} · ${esc(p.aspect)}</option>`).join('');
  }

  /* ---------------- Characters & Locations library ---------------- */
  function editChar(c) {
    const isNew = !c;
    openForm({
      title: isNew ? '➕ नया character' : '✏️ ' + c.tag,
      values: c ? Object.assign({}, c, { items: (c.items || []).join('\n') }) : { projectId: pid() },
      fields: [
        { key: 'tag', label: 'Reference tag (Flow में यही नाम)', placeholder: '@Chinku', hint: 'Flow में जो ingredient/reference का नाम है, वही लिखें।' },
        { key: 'hindiName', label: 'Hindi नाम (script में पहचानने के लिए)', placeholder: 'चिंकू' },
        { key: 'look', label: 'रूप-रंग (English में)', type: 'textarea', rows: 3, placeholder: 'a cute cream-golden fennec fox with big ears...' },
        { key: 'items', label: 'कपड़े / सामान (हर एक अलग लाइन में)', type: 'textarea', rows: 6, placeholder: 'white space suit\nclear glass helmet\nsilver belt\norange gloves\nwhite boots\nno backpack', hint: '"no ..." से शुरू होने वाली लाइन prompt में "Must NOT have" में जाएगी।' },
        { key: 'projectId', label: 'Project', type: 'select', options: projectOptions() }
      ],
      onSave: (v) => {
        const tag = fixTag(v.tag);
        if (!tag) { toast('Tag लिखें, जैसे @Chinku'); return false; }
        const data = { tag, hindiName: v.hindiName.trim(), look: v.look.trim(), items: lines(v.items), projectId: v.projectId };
        if (isNew) S.characters.push(Object.assign({ id: uid() }, data)); else Object.assign(c, data);
        save(); renderPrompt(); toast('✅ Character save हुआ');
      },
      onDelete: isNew ? null : () => {
        if (!confirm(c.tag + ' को मिटा दें?')) return false;
        S.characters = S.characters.filter((x) => x.id !== c.id);
        if (S.draft) S.draft.chars = S.draft.chars.filter((id) => id !== c.id);
        save(); renderPrompt(); toast('🗑️ मिटा दिया');
      }
    });
  }

  function editLoc(l) {
    const isNew = !l;
    openForm({
      title: isNew ? '➕ नई location' : '✏️ ' + l.tag,
      values: l ? Object.assign({}, l, { rules: (l.rules || []).join('\n') }) : { projectId: pid() },
      fields: [
        { key: 'tag', label: 'Reference tag', placeholder: '@Cottage' },
        { key: 'hindiName', label: 'Hindi नाम', placeholder: 'कॉटेज' },
        { key: 'desc', label: 'Description (English में)', type: 'textarea', rows: 3, placeholder: 'a small wooden Japanese cottage...' },
        { key: 'rules', label: '"हमेशा ऐसा ही दिखे" नियम (हर नियम अलग लाइन में)', type: 'textarea', rows: 5, placeholder: 'purple sky\nno lava\nno orange glow' },
        { key: 'projectId', label: 'Project', type: 'select', options: projectOptions() }
      ],
      onSave: (v) => {
        const tag = fixTag(v.tag);
        if (!tag) { toast('Tag लिखें, जैसे @Cottage'); return false; }
        const data = { tag, hindiName: v.hindiName.trim(), desc: v.desc.trim(), rules: lines(v.rules), projectId: v.projectId };
        if (isNew) S.locations.push(Object.assign({ id: uid() }, data)); else Object.assign(l, data);
        save(); renderPrompt(); toast('✅ Location save हुई');
      },
      onDelete: isNew ? null : () => {
        if (!confirm(l.tag + ' को मिटा दें?')) return false;
        S.locations = S.locations.filter((x) => x.id !== l.id);
        if (S.draft && S.draft.loc === l.id) S.draft.loc = '';
        save(); renderPrompt(); toast('🗑️ मिटा दिया');
      }
    });
  }

  const isNeg = (s) => /^(no|without|never|not)\b/i.test(s.trim());

  function renderLibraries() {
    const allC = $('#showAllChars').checked, allL = $('#showAllLocs').checked;
    const chars = projChars(allC), locs = projLocs(allL);
    $('#charCount').textContent = `(${chars.length})`;
    $('#locCount').textContent = `(${locs.length})`;
    $('#charList').innerHTML = chars.length ? chars.map((c) => `
      <div class="lib-item">
        <div class="tag">${esc(c.tag)} ${c.hindiName ? `<span class="meta">· ${esc(c.hindiName)}</span>` : ''}</div>
        ${allC ? `<div class="meta">${esc(projName(c.projectId))}</div>` : ''}
        <div class="desc">${esc(c.look)}</div>
        ${(c.items || []).length ? `<ul>${c.items.map((i) => `<li class="${isNeg(i) ? 'neg' : ''}">${esc(i)}</li>`).join('')}</ul>` : ''}
        <div class="item-actions"><button class="btn" data-action="edit-char" data-id="${c.id}">✏️ Edit</button></div>
      </div>`).join('') : '<div class="empty">कोई character नहीं। नीचे से जोड़ें।</div>';
    $('#locList').innerHTML = locs.length ? locs.map((l) => `
      <div class="lib-item">
        <div class="tag">${esc(l.tag)} ${l.hindiName ? `<span class="meta">· ${esc(l.hindiName)}</span>` : ''}</div>
        ${allL ? `<div class="meta">${esc(projName(l.projectId))}</div>` : ''}
        <div class="desc">${esc(l.desc)}</div>
        ${(l.rules || []).length ? `<ul>${l.rules.map((r) => `<li class="${isNeg(r) ? 'neg' : ''}">${esc(r)}</li>`).join('')}</ul>` : ''}
        <div class="item-actions"><button class="btn" data-action="edit-loc" data-id="${l.id}">✏️ Edit</button></div>
      </div>`).join('') : '<div class="empty">कोई location नहीं। नीचे से जोड़ें।</div>';
  }

  /* ---------------- Prompt builder ---------------- */
  function buildPrompt(o) {
    const L = [];
    const style = STYLES[o.style] || STYLES.glossy;
    const frame = o.aspect === '9:16' ? 'vertical 9:16 (portrait)' : 'horizontal 16:9 (widescreen)';
    L.push(`${o.length === "8" ? "An" : "A"} ${o.length}-second, ${frame} 3D animated cinematic clip.`);
    L.push('');
    L.push(`STYLE: ${style.text}`);
    if (o.project && o.project.setting) L.push(`WORLD: ${o.project.setting}.`);

    if (o.loc) {
      L.push('');
      L.push(`LOCATION: ${o.loc.tag}${o.loc.desc ? ' — ' + o.loc.desc : ''}.`);
      const pos = (o.loc.rules || []).filter((r) => !isNeg(r));
      const neg = (o.loc.rules || []).filter(isNeg);
      if (pos.length) L.push(`The location must always look like this: ${pos.join('; ')}.`);
      if (neg.length) L.push(`Location must NOT have: ${neg.map(stripNeg).join('; ')}.`);
    }

    if (o.chars.length) {
      L.push('');
      L.push('CHARACTERS (match the attached reference images exactly; keep every design detail consistent):');
      o.chars.forEach((c) => {
        let s = `- ${c.tag}${c.look ? ': ' + c.look : ''}.`;
        const pos = (c.items || []).filter((i) => !isNeg(i));
        const neg = (c.items || []).filter(isNeg);
        if (pos.length) s += ` Wearing / carrying: ${pos.join(', ')}.`;
        if (neg.length) s += ` Must NOT have: ${neg.map(stripNeg).join(', ')}.`;
        L.push(s);
      });
      L.push(`Only ${o.chars.length === 1 ? 'this character appears' : 'these ' + o.chars.length + ' characters appear'} in the shot — no extra characters.`);
    }

    L.push('');
    L.push(`CAMERA: ${o.camera}.`);
    if (o.action) L.push(`ACTION: ${o.action.trim().replace(/\.?$/, '.')}`);

    const dirs = o.chars.map((c) => {
      const g = (o.gaze[c.id] || '').trim(), p = (o.point[c.id] || '').trim();
      if (!g && !p) return null;
      const parts = [];
      if (g) parts.push(`${c.tag} is looking at ${g}`);
      if (p) parts.push(`${c.tag} is pointing ${p}`);
      else if (g) parts.push(`${c.tag} is not pointing at anything`);
      return '- ' + parts.join('; ') + '.';
    }).filter(Boolean);
    if (dirs.length) {
      L.push('');
      L.push('GAZE & POINTING (follow exactly):');
      dirs.forEach((d) => L.push(d));
    }

    L.push('');
    const dl = o.dialogues.filter((d) => d.line && d.line.trim());
    if (dl.length) {
      L.push('DIALOGUE (spoken in Hindi, natural expressive voice, accurate lip-sync):');
      dl.forEach((d) => {
        const at = String(d.at || '').trim();
        const when = at ? `At ${at.replace(/s(ec)?$/i, '')}s, ` : '';
        const who = d.speakerTag === NARRATOR || !d.speakerTag
          ? 'an off-screen narrator (voice-over) says in Hindi'
          : `${d.speakerTag} says in Hindi`;
        L.push(`- ${when}${who}: "${d.line.trim()}"`);
      });
      L.push('Only the speaking character\'s mouth moves while they talk; all other characters keep their mouths closed.');
    } else {
      L.push('AUDIO: No dialogue — only natural ambient sounds and character sounds.');
    }

    if (o.mood) L.push(`MOOD & LIGHTING: ${o.mood.trim().replace(/\.?$/, '.')}`);

    L.push('');
    L.push('AVOID: on-screen text, subtitles, captions, watermarks, logos, extra characters, changes to character design, colors or clothing, distorted faces or limbs.');

    const tags = o.chars.map((c) => c.tag).concat(o.loc ? [o.loc.tag] : []);
    if (tags.length) {
      L.push('');
      L.push(`Attach in Flow: ${tags.join(', ')}`);
    }
    return L.join('\n');
  }
  function stripNeg(s) { return s.trim().replace(/^(no|without|never|not)\s+/i, ''); }

  function cameraValue(d) {
    return d.camera === '__custom' ? (d.cameraCustom.trim() || 'Medium shot') : d.camera;
  }

  function renderPromptForm() {
    const d = draft();
    const chars = projChars($('#showAllChars').checked);
    // characters still selected but not in filtered list stay visible
    const selectedExtra = d.chars.map(charById).filter((c) => c && !chars.includes(c));
    const allShown = chars.concat(selectedExtra);
    $('#pgChars').innerHTML = allShown.length ? allShown.map((c) =>
      `<button class="chip ${d.chars.includes(c.id) ? 'on' : ''}" data-action="toggle-char" data-id="${c.id}">${esc(c.tag)}</button>`).join('')
      : '<div class="empty">पहले Characters library में character जोड़ें।</div>';

    const sel = d.chars.map(charById).filter(Boolean);
    const loc = locById(d.loc);
    const targets = ['the camera'].concat(sel.map((c) => c.tag), loc ? [loc.tag] : []);
    $('#pgGaze').innerHTML = sel.map((c) => {
      const others = targets.filter((t) => t !== c.tag);
      const dlId = 'dl_' + c.id;
      return `<div class="char-dir">
        <span class="tag">${esc(c.tag)}</span>
        <label class="lbl">👀 कहाँ देख रहा है</label>
        <input data-gaze="${c.id}" value="${esc(d.gaze[c.id] || '')}" list="${dlId}" placeholder="e.g. ${esc(others[1] || 'the camera')}">
        <label class="lbl">👉 किस तरफ़ इशारा (खाली = कोई इशारा नहीं)</label>
        <input data-point="${c.id}" value="${esc(d.point[c.id] || '')}" list="${dlId}p" placeholder="e.g. with right paw toward ${esc(loc ? loc.tag : 'the sky')}">
        <datalist id="${dlId}">${others.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
        <datalist id="${dlId}p">${others.map((t) => `<option value="${esc('toward ' + t)}">`).join('')}</datalist>
      </div>`;
    }).join('');

    const locs = projLocs($('#showAllLocs').checked);
    if (loc && !locs.includes(loc)) locs.push(loc);
    $('#pgLoc').innerHTML = '<option value="">— कोई location नहीं —</option>' +
      locs.map((l) => `<option value="${l.id}" ${l.id === d.loc ? 'selected' : ''}>${esc(l.tag)}${l.hindiName ? ' · ' + esc(l.hindiName) : ''}</option>`).join('');

    $('#pgCamera').innerHTML = CAMERAS.map(([v, lab]) => `<option value="${esc(v)}" ${v === d.camera ? 'selected' : ''}>${esc(lab)}</option>`).join('');
    $('#pgCameraCustom').classList.toggle('hidden', d.camera !== '__custom');
    $('#pgCameraCustom').value = d.cameraCustom || '';

    $('#pgAction').value = d.action;
    $('#pgMood').value = d.mood;
    $('#pgStyle').innerHTML = Object.keys(STYLES).map((k) => `<option value="${k}" ${k === d.style ? 'selected' : ''}>${esc(STYLES[k].label)}</option>`).join('');
    $('#pgAspect').value = d.aspect;
    $('#pgLength').value = d.length;

    renderDialogues();

    $('#pgOutCard').classList.toggle('hidden', !d.output);
    $('#pgOutput').value = d.output || '';
    $('#pgShotNum').value = d.shotNum || '';
    $('#pgShotDesc').value = d.shotDesc || '';
  }

  function renderDialogues() {
    const d = draft();
    const sel = d.chars.map(charById).filter(Boolean);
    const opts = sel.map((c) => [c.tag, c.tag]).concat([[NARRATOR, '🎙️ Narrator (voice-over)']]);
    $('#pgDialogues').innerHTML = d.dialogues.length ? d.dialogues.map((dl, i) => `
      <div class="dlg-row">
        <div class="grid2">
          <select data-dlg="${i}" data-field="speakerTag" aria-label="कौन बोलेगा">
            ${opts.map(([v, lab]) => `<option value="${esc(v)}" ${v === dl.speakerTag ? 'selected' : ''}>${esc(lab)}</option>`).join('')}
          </select>
          <input data-dlg="${i}" data-field="at" value="${esc(dl.at || '')}" placeholder="sec (2)" inputmode="decimal" aria-label="किस second पर">
        </div>
        <textarea data-dlg="${i}" data-field="line" rows="2" placeholder="Hindi लाइन, जैसे: अरे! तुम कौन हो, नन्हे दोस्त?">${esc(dl.line || '')}</textarea>
        <button class="btn small danger" data-action="del-dialogue" data-i="${i}">✕ हटाओ</button>
      </div>`).join('') : '<div class="empty">कोई dialogue नहीं (बिना dialogue भी prompt बन जाएगा)।</div>';
  }

  function generatePrompt() {
    const d = draft();
    const chars = d.chars.map(charById).filter(Boolean);
    if (!chars.length && !d.action.trim()) { toast('कम से कम एक character या action चुनें'); return; }
    const sel = new Set(chars.map((c) => c.tag));
    d.dialogues.forEach((dl) => { if (dl.speakerTag !== NARRATOR && !sel.has(dl.speakerTag)) dl.speakerTag = chars[0] ? chars[0].tag : NARRATOR; });
    d.output = buildPrompt({
      project: proj(), chars, gaze: d.gaze, point: d.point, loc: locById(d.loc),
      camera: cameraValue(d), action: d.action, dialogues: d.dialogues,
      mood: d.mood, style: d.style, aspect: d.aspect, length: d.length
    });
    if (!d.shotNum) d.shotNum = suggestNextShotNum();
    save();
    renderPromptForm();
    $('#pgOutCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('⚡ Prompt तैयार');
  }

  function renderPrompt() { renderLibraries(); renderPromptForm(); }

  /* ---------------- Shot tracker ---------------- */
  function shotKey(n) {
    return (String(n || '').match(/\d+|[a-zA-Zऀ-ॿ]+/g) || [])
      .map((t) => (/^\d+$/.test(t) ? Number(t) : t.toLowerCase()));
  }
  function cmpShot(a, b) {
    const A = shotKey(a), B = shotKey(b);
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      if (A[i] === undefined) return -1;
      if (B[i] === undefined) return 1;
      const x = A[i], y = B[i];
      if (typeof x !== typeof y) return typeof x === 'number' ? -1 : 1;
      if (x < y) return -1;
      if (x > y) return 1;
    }
    return 0;
  }
  const projShots = () => S.shots.filter((s) => s.projectId === pid()).sort((a, b) => cmpShot(a.num, b.num) || (a.created || 0) - (b.created || 0));

  function suggestNextShotNum() {
    const shots = projShots();
    if (!shots.length) return '1.1';
    const last = shots[shots.length - 1].num;
    const m = String(last).match(/^(\d+)\.(\d+)/);
    return m ? `${m[1]}.${Number(m[2]) + 1}` : '';
  }

  function addShot(data) {
    const shot = Object.assign({ id: uid(), projectId: pid(), num: '', desc: '', prompt: '', status: 'pending', notes: '', seconds: 8, created: Date.now() }, data);
    S.shots.push(shot);
    return shot;
  }

  function editShot(s) {
    const isNew = !s;
    openForm({
      title: isNew ? '➕ नया shot' : '✏️ Shot ' + s.num,
      values: s || { num: suggestNextShotNum(), status: 'pending', seconds: 8 },
      fields: [
        { key: 'num', label: 'Shot number', placeholder: '1.1 / 1.6a', inputmode: 'text' },
        { key: 'desc', label: 'छोटा description', placeholder: 'चिंकू को घास में मिट्ठू मिलता है' },
        { key: 'status', label: 'Status', type: 'select', options: Object.entries(STATUSES) },
        { key: 'seconds', label: 'Length (seconds)', placeholder: '8', inputmode: 'decimal' },
        { key: 'notes', label: 'Notes (retake क्यों?)', type: 'textarea', rows: 3, placeholder: 'e.g. scarf का रंग बदल गया, Mitthu बोल रहा था' },
        { key: 'prompt', label: 'Prompt', type: 'textarea', rows: 8, placeholder: 'Flow prompt यहाँ paste करें' }
      ],
      onSave: (v) => {
        if (!v.num.trim()) { toast('Shot number लिखें'); return false; }
        const data = { num: v.num.trim(), desc: v.desc.trim(), status: v.status, seconds: Number(v.seconds) || 0, notes: v.notes.trim(), prompt: v.prompt.trim() };
        if (isNew) addShot(data); else Object.assign(s, data);
        save(); renderShots(); toast('✅ Shot save हुआ');
      },
      onDelete: isNew ? null : () => {
        if (!confirm('Shot ' + s.num + ' मिटा दें?')) return false;
        S.shots = S.shots.filter((x) => x.id !== s.id);
        Object.keys(S.trailer).forEach((k) => { S.trailer[k] = S.trailer[k].filter((id) => id !== s.id); });
        save(); renderShots(); toast('🗑️ Shot मिटा दिया');
      }
    });
  }

  function trailerIds() {
    const ids = (S.trailer[pid()] || []).filter((id) => S.shots.some((s) => s.id === id));
    S.trailer[pid()] = ids;
    return ids;
  }

  function renderShots() {
    const shots = projShots();
    const made = shots.filter((s) => ['done', 'approved', 'trailer'].includes(s.status)).length;
    const pending = shots.filter((s) => s.status === 'pending').length;
    const retake = shots.filter((s) => s.status === 'retake').length;
    const secs = shots.reduce((a, s) => a + (Number(s.seconds) || 0), 0);
    const madeSecs = shots.filter((s) => ['done', 'approved', 'trailer'].includes(s.status)).reduce((a, s) => a + (Number(s.seconds) || 0), 0);
    const fmt = (n) => n >= 60 ? `${Math.floor(n / 60)}m ${n % 60}s` : `${n}s`;
    $('#shotStats').innerHTML = `
      <div class="stat green"><b>${made}</b><span>बने</span></div>
      <div class="stat yellow"><b>${pending}</b><span>बाकी</span></div>
      <div class="stat red"><b>${retake}</b><span>Retake</span></div>
      <div class="stat blue"><b>${fmt(secs)}</b><span>कुल (${fmt(madeSecs)} बने)</span></div>`;

    const f = $('#shotFilter');
    const fv = f.value || 'all';
    f.innerHTML = `<option value="all">सभी (${shots.length})</option>` +
      Object.entries(STATUSES).map(([k, lab]) => `<option value="${k}">${lab} (${shots.filter((s) => s.status === k).length})</option>`).join('');
    f.value = fv;

    const tIds = trailerIds();
    const list = fv === 'all' ? shots : shots.filter((s) => s.status === fv);
    $('#shotList').innerHTML = list.length ? list.map((s) => `
      <div class="shot st-${esc(s.status)}">
        <div class="shot-head"><span class="shot-num">${esc(s.num)}</span><span class="shot-sec">⏱️ ${esc(s.seconds)}s</span></div>
        <div class="shot-desc">${esc(s.desc) || '<span class="meta">(कोई description नहीं)</span>'}</div>
        ${s.notes ? `<div class="shot-notes">📝 ${esc(s.notes)}</div>` : ''}
        ${s.prompt ? `<div class="shot-prompt">${esc(s.prompt)}</div>` : ''}
        <select class="status-sel" data-status="${s.id}" aria-label="Status">
          ${Object.entries(STATUSES).map(([k, lab]) => `<option value="${k}" ${k === s.status ? 'selected' : ''}>${lab}</option>`).join('')}
        </select>
        <div class="item-actions">
          <button class="btn" data-action="edit-shot" data-id="${s.id}">✏️ Edit</button>
          ${s.prompt ? `<button class="btn" data-action="copy-shot" data-id="${s.id}">📋 Prompt</button>` : ''}
          <button class="btn ${tIds.includes(s.id) ? 'on' : ''}" data-action="toggle-trailer" data-id="${s.id}">🎬 Trailer</button>
        </div>
      </div>`).join('') : '<div class="empty" style="margin-top:12px">कोई shot नहीं। “➕ नया shot” दबाएँ या Prompt tab से जोड़ें।</div>';

    const tShots = tIds.map((id) => S.shots.find((s) => s.id === id));
    const tSecs = tShots.reduce((a, s) => a + (Number(s.seconds) || 0), 0);
    $('#trailerCount').textContent = `(${tShots.length} shots · ${fmt(tSecs)})`;
    $('#trailerList').innerHTML = tShots.length ? tShots.map((s, i) => `
      <li>
        <span class="t-text"><b>${esc(s.num)}</b> ${esc(s.desc)}</span>
        <button class="icon-btn" data-action="tr-up" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="icon-btn" data-action="tr-down" data-i="${i}" ${i === tShots.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="icon-btn" data-action="tr-del" data-i="${i}">✕</button>
      </li>`).join('') : '<li class="empty" style="display:block">अभी trailer खाली है।</li>';
  }

  /* ---------------- Backup ---------------- */
  function exportJSON() {
    const data = JSON.stringify(S, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flow-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('⬇️ Backup download हुआ');
  }
  function importData(text) {
    let d;
    try { d = JSON.parse(text); } catch (e) { toast('⚠️ JSON सही नहीं है'); return false; }
    if (!d || !Array.isArray(d.projects) || !d.projects.length) { toast('⚠️ यह Flow Studio backup नहीं लगता'); return false; }
    if (!confirm('अभी का सारा data हटाकर यह backup लगा दें?')) return false;
    S = normalize(d);
    save(); renderAll(); toast('✅ Import हो गया');
    return true;
  }

  /* ---------------- Script builder ---------------- */
  function script() {
    if (!S.scripts[pid()]) S.scripts[pid()] = { story: '', scenes: [] };
    return S.scripts[pid()];
  }
  const projScenes = () => script().scenes.slice().sort((a, b) => cmpShot(a.num, b.num));

  function claudeRequest() {
    const p = proj();
    const story = $('#storyText').value.trim();
    if (!story) { toast('पहले कहानी paste करें'); return null; }
    const chars = projChars(false), locs = projLocs(false);
    const L = [];
    L.push('इस कहानी को 8-second के Google Flow clips में बाँटो, हर clip के लिए scene, action, Hindi dialogue और English Flow prompt दो।');
    L.push('');
    L.push('हर clip के लिए यह format रखो:');
    L.push('Shot number (1.1, 1.2, 2.1 ...) | Scene (जगह) | कौन-कौन है | Action | Hindi dialogue (किरदार: लाइन, और किस second पर) | English Flow prompt (camera shot, gaze, pointing, mood/lighting के साथ, आख़िर में "Attach in Flow: @..." लिस्ट)');
    L.push('');
    if (p) {
      L.push(`Project: ${p.name}`);
      L.push(`Aspect ratio: ${p.aspect} · Style: ${(STYLES[p.style] || STYLES.glossy).label}`);
      if (p.setting) L.push(`World: ${p.setting}`);
    }
    if (chars.length) {
      L.push('');
      L.push('Characters (Flow reference tags — prompt में हर बार सारे कपड़े/सामान लिखना):');
      chars.forEach((c) => L.push(`- ${c.tag}${c.hindiName ? ' (' + c.hindiName + ')' : ''}: ${c.look}${(c.items || []).length ? ' | ' + c.items.join(', ') : ''}`));
    }
    if (locs.length) {
      L.push('');
      L.push('Locations (नियम हमेशा मानना):');
      locs.forEach((l) => L.push(`- ${l.tag}${l.hindiName ? ' (' + l.hindiName + ')' : ''}: ${l.desc}${(l.rules || []).length ? ' | ' + l.rules.join(', ') : ''}`));
    }
    L.push('');
    L.push('कहानी:');
    L.push(story);
    return L.join('\n');
  }

  function editScene(sc) {
    const isNew = !sc;
    const scenes = projScenes();
    const nextNum = scenes.length ? (() => { const m = String(scenes[scenes.length - 1].num).match(/^(\d+)\.(\d+)/); return m ? `${m[1]}.${Number(m[2]) + 1}` : ''; })() : '1.1';
    const locNames = projLocs(false).map((l) => l.tag);
    openForm({
      title: isNew ? '➕ नया scene' : '✏️ Scene ' + sc.num,
      values: sc || { num: nextNum },
      fields: [
        { key: 'num', label: 'Scene / shot number', placeholder: '1.1' },
        { key: 'place', label: 'जगह', placeholder: '@Cottage', datalist: locNames },
        { key: 'who', label: 'कौन-कौन है', placeholder: '@Chinku, @Mitthu', hint: 'Tag (@Chinku) या Hindi नाम (चिंकू) — दोनों पहचाने जाएँगे।' },
        { key: 'action', label: 'Action', type: 'textarea', rows: 3, placeholder: 'चिंकू घास में कुछ हिलता देखता है' },
        { key: 'dialogue', label: 'Dialogue (हर लाइन: किरदार: लाइन)', type: 'textarea', rows: 4, placeholder: 'चिंकू: अरे! ये आवाज़ कहाँ से आई?\nमिट्ठू: चीं-चीं!' }
      ],
      onSave: (v) => {
        if (!v.num.trim()) { toast('Number लिखें'); return false; }
        const data = { num: v.num.trim(), place: v.place.trim(), who: v.who.trim(), action: v.action.trim(), dialogue: v.dialogue.trim() };
        if (isNew) script().scenes.push(Object.assign({ id: uid() }, data)); else Object.assign(sc, data);
        save(); renderScript(); toast('✅ Scene save हुआ');
      },
      onDelete: isNew ? null : () => {
        if (!confirm('Scene ' + sc.num + ' मिटा दें?')) return false;
        script().scenes = script().scenes.filter((x) => x.id !== sc.id);
        save(); renderScript(); toast('🗑️ Scene मिटा दिया');
      }
    });
  }

  function matchesName(text, item) {
    const t = String(text || '').toLowerCase();
    const names = [item.tag, String(item.tag || '').replace(/^@/, ''), item.hindiName].filter((n) => n && n.length > 1);
    return names.some((n) => t.includes(n.toLowerCase()));
  }
  function findChar(name, pool) {
    const n = String(name || '').trim().toLowerCase().replace(/^@/, '');
    return pool.find((c) => [c.tag.replace(/^@/, ''), c.hindiName].filter(Boolean).some((x) => x.toLowerCase() === n))
      || pool.find((c) => matchesName(name, c));
  }

  function sceneToPrompt(sc) {
    const pool = projChars(false);
    const dlgLines = lines(sc.dialogue).map((l) => {
      const m = l.match(/^([^:：]{1,40})[:：]\s*(.+)$/);
      return m ? { name: m[1].trim(), line: m[2].trim() } : { name: '', line: l };
    });
    const chars = pool.filter((c) => matchesName(sc.who, c) || dlgLines.some((d) => findChar(d.name, [c])));
    const loc = projLocs(false).find((l) => matchesName(sc.place, l)) || null;
    const p = proj();
    const dialogues = dlgLines.map((d) => {
      const c = findChar(d.name, chars);
      return { speakerTag: c ? c.tag : NARRATOR, line: d.line, at: '' };
    });
    let action = sc.action;
    if (sc.place && !loc) action = `${sc.place}: ${action}`;
    return buildPrompt({
      project: p, chars, gaze: {}, point: {}, loc, camera: 'Medium shot',
      action,
      dialogues, mood: '', style: (p && p.style) || 'glossy', aspect: (p && p.aspect) || '16:9', length: '8'
    });
  }

  function scenesToTracker(list) {
    const existing = new Set(projShots().map((s) => s.num.toLowerCase()));
    let added = 0, skipped = 0;
    list.forEach((sc) => {
      if (existing.has(sc.num.toLowerCase())) { skipped++; return; }
      const desc = (sc.action || sc.place || '').replace(/\s+/g, ' ').slice(0, 90);
      addShot({ num: sc.num, desc, prompt: sceneToPrompt(sc), notes: 'Script से — prompt check करें', seconds: 8 });
      existing.add(sc.num.toLowerCase());
      added++;
    });
    save(); renderShots();
    toast(`🎞️ ${added} shot जुड़े${skipped ? `, ${skipped} पहले से थे` : ''}`);
  }

  function renderScript() {
    $('#storyText').value = script().story || '';
    const scenes = projScenes();
    $('#sceneCount').textContent = `(${scenes.length})`;
    $('#sceneList').innerHTML = scenes.length ? scenes.map((sc) => `
      <div class="scene">
        <div class="shot-head"><span class="shot-num">${esc(sc.num)}</span><span class="shot-sec">📍 ${esc(sc.place || '—')}</span></div>
        ${sc.who ? `<div class="kv"><b>कौन:</b> ${esc(sc.who)}</div>` : ''}
        ${sc.action ? `<div class="kv"><b>Action:</b> ${esc(sc.action)}</div>` : ''}
        ${sc.dialogue ? `<div class="dlg">${esc(sc.dialogue)}</div>` : ''}
        <div class="item-actions">
          <button class="btn" data-action="edit-scene" data-id="${sc.id}">✏️ Edit</button>
          <button class="btn" data-action="scene-to-tracker" data-id="${sc.id}">🎞️ Tracker में</button>
        </div>
      </div>`).join('') : '<div class="empty">अभी कोई scene नहीं। कहानी को scenes में बाँटकर यहाँ जोड़ें।</div>';
  }

  /* ---------------- Render all & tabs ---------------- */
  function renderAll() {
    renderProjectBar();
    renderPrompt();
    renderShots();
    renderScript();
  }

  function setTab(name) {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + name));
    try { localStorage.setItem(KEY + '.tab', name); } catch (e) { /* ignore */ }
    window.scrollTo(0, 0);
  }

  /* ---------------- Events ---------------- */
  function move(arr, i, j) { if (j < 0 || j >= arr.length) return; const [x] = arr.splice(i, 1); arr.splice(j, 0, x); }

  const actions = {
    'edit-project': () => editProject(proj()),
    'new-project': () => editProject(null),
    'new-char': () => editChar(null),
    'edit-char': (el) => editChar(charById(el.dataset.id)),
    'new-loc': () => editLoc(null),
    'edit-loc': (el) => editLoc(locById(el.dataset.id)),
    'toggle-char': (el) => {
      const d = draft(), id = el.dataset.id;
      d.chars = d.chars.includes(id) ? d.chars.filter((x) => x !== id) : d.chars.concat(id);
      save(); renderPromptForm();
    },
    'add-dialogue': () => {
      const d = draft();
      const first = d.chars.map(charById).filter(Boolean)[0];
      d.dialogues.push({ speakerTag: first ? first.tag : NARRATOR, line: '', at: d.dialogues.length ? '' : '1' });
      save(); renderDialogues();
    },
    'del-dialogue': (el) => { draft().dialogues.splice(Number(el.dataset.i), 1); save(); renderDialogues(); },
    'build-prompt': generatePrompt,
    'clear-draft': () => { if (confirm('Prompt form साफ़ कर दें?')) { S.draft = freshDraft(); save(); renderPromptForm(); } },
    'copy-prompt': () => copyText($('#pgOutput').value, '✅ Prompt copy हो गया — Flow में paste करें'),
    'prompt-to-tracker': () => {
      const d = draft();
      const num = $('#pgShotNum').value.trim();
      if (!num) { toast('Shot number लिखें'); return; }
      if (projShots().some((s) => s.num.toLowerCase() === num.toLowerCase()) && !confirm(`Shot ${num} पहले से है। फिर भी नया जोड़ें?`)) return;
      addShot({ num, desc: $('#pgShotDesc').value.trim(), prompt: $('#pgOutput').value, seconds: Number(d.length) || 8 });
      d.shotDesc = '';
      d.shotNum = suggestNextShotNum();
      save(); renderShots(); renderPromptForm();
      toast(`🎞️ Shot ${num} Tracker में जुड़ गया`);
    },
    'new-shot': () => editShot(null),
    'edit-shot': (el) => editShot(S.shots.find((s) => s.id === el.dataset.id)),
    'copy-shot': (el) => copyText(S.shots.find((s) => s.id === el.dataset.id).prompt, '✅ Prompt copy हो गया'),
    'toggle-trailer': (el) => {
      const ids = trailerIds(), id = el.dataset.id;
      S.trailer[pid()] = ids.includes(id) ? ids.filter((x) => x !== id) : ids.concat(id);
      save(); renderShots();
      toast(ids.includes(id) ? 'Trailer से हटाया' : '🎬 Trailer में जोड़ा');
    },
    'tr-up': (el) => { const i = Number(el.dataset.i); move(trailerIds(), i, i - 1); save(); renderShots(); },
    'tr-down': (el) => { const i = Number(el.dataset.i); move(trailerIds(), i, i + 1); save(); renderShots(); },
    'tr-del': (el) => { trailerIds().splice(Number(el.dataset.i), 1); save(); renderShots(); },
    'copy-trailer': () => {
      const t = trailerIds().map((id, i) => { const s = S.shots.find((x) => x.id === id); return `${i + 1}. ${s.num} — ${s.desc} (${s.seconds}s)`; });
      if (!t.length) { toast('Trailer खाली है'); return; }
      copyText(`Trailer order — ${proj().name}\n` + t.join('\n'));
    },
    'export-json': exportJSON,
    'copy-json': () => copyText(JSON.stringify(S), '✅ पूरा JSON copy हो गया'),
    'paste-json': () => openForm({
      title: '📥 JSON paste करें',
      fields: [{ key: 'json', label: 'Backup JSON', type: 'textarea', rows: 10, placeholder: '{ "projects": [...] }' }],
      saveLabel: '⬆️ Import',
      onSave: (v) => importData(v.json)
    }),
    'reset-sample': () => {
      if (!confirm('सारा data मिटाकर sample data वापस लाएँ? (पहले Export कर लें)')) return;
      S = sampleData(); save(); renderAll(); toast('♻️ Sample data वापस आ गया');
    },
    'copy-claude': () => { const t = claudeRequest(); if (t) copyText(t, '✅ Request copy हो गई — Claude chat में paste करें'); },
    'new-scene': () => editScene(null),
    'edit-scene': (el) => editScene(script().scenes.find((s) => s.id === el.dataset.id)),
    'scene-to-tracker': (el) => scenesToTracker([script().scenes.find((s) => s.id === el.dataset.id)]),
    'scenes-to-tracker': () => {
      const sc = projScenes();
      if (!sc.length) { toast('पहले scenes जोड़ें'); return; }
      scenesToTracker(sc);
    }
  };

  function bind() {
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (tab) { setTab(tab.dataset.tab); return; }
      const el = e.target.closest('[data-action]');
      if (el && actions[el.dataset.action]) { e.preventDefault(); actions[el.dataset.action](el); }
    });

    $('#projectSelect').addEventListener('change', (e) => { S.currentProject = e.target.value; save(); renderAll(); });
    $('#showAllChars').addEventListener('change', renderPrompt);
    $('#showAllLocs').addEventListener('change', renderPrompt);

    // Prompt form inputs
    const bindField = (sel, key, rerender) => {
      const el = $(sel);
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', (e) => {
        draft()[key] = e.target.value; save(); if (rerender) renderPromptForm();
      });
    };
    bindField('#pgLoc', 'loc', true);
    bindField('#pgCamera', 'camera', true);
    bindField('#pgCameraCustom', 'cameraCustom');
    bindField('#pgAction', 'action');
    bindField('#pgMood', 'mood');
    bindField('#pgStyle', 'style');
    bindField('#pgAspect', 'aspect');
    bindField('#pgLength', 'length');
    bindField('#pgOutput', 'output');
    bindField('#pgShotNum', 'shotNum');
    bindField('#pgShotDesc', 'shotDesc');

    // Delegated inputs: gaze / point / dialogue
    document.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.gaze) { draft().gaze[t.dataset.gaze] = t.value; save(); }
      else if (t.dataset.point) { draft().point[t.dataset.point] = t.value; save(); }
      else if (t.dataset.dlg != null && t.tagName !== 'SELECT') { draft().dialogues[Number(t.dataset.dlg)][t.dataset.field] = t.value; save(); }
    });
    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset.dlg != null && t.tagName === 'SELECT') { draft().dialogues[Number(t.dataset.dlg)][t.dataset.field] = t.value; save(); }
      if (t.dataset.status) {
        const s = S.shots.find((x) => x.id === t.dataset.status);
        if (s) { s.status = t.value; save(); renderShots(); toast('Status: ' + STATUSES[t.value]); }
      }
    });

    $('#shotFilter').addEventListener('change', renderShots);
    $('#storyText').addEventListener('input', (e) => { script().story = e.target.value; save(); });

    $('#importFile').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => importData(String(r.result));
      r.readAsText(file);
      e.target.value = '';
    });

    $('#modalSave').addEventListener('click', () => modalHandlers && modalHandlers.save());
    $('#modalCancel').addEventListener('click', closeModal);
    $('#modalDelete').addEventListener('click', () => modalHandlers && modalHandlers.del && modalHandlers.del());
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalHandlers) closeModal(); });
  }

  /* ---------------- Init ---------------- */
  load();
  bind();
  renderAll();
  try { const t = localStorage.getItem(KEY + '.tab'); if (t && document.getElementById('tab-' + t)) setTab(t); } catch (e) { /* ignore */ }

  // Exposed for testing only
  window.FlowStudio = { cmpShot, buildPrompt };
})();
