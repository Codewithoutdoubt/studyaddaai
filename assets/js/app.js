const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const state = {
  branches: [],
  semesters: [],
  subjects: [],
  units: [],
  topics: [],
  selected: {
    branchId: null,
    semesterId: null,
    subjectId: null,
    unitId: null,
    topicId: null,
  },
};

function parseHash() {
  // #/                 => home
  // #/t/ID             => topic
  // #/b/BR/sem/SEM    => drill
  const h = window.location.hash || '#/';
  const parts = h.replace(/^#\//, '').split('/').filter(Boolean);
  if (parts.length === 0) return { route: 'home' };
  if (parts[0] === 't') return { route: 'topic', topicId: Number(parts[1]) };
  if (parts[0] === 'b') {
    const branchId = Number(parts[1]);
    const out = { route: 'home', selected: { branchId } };
    for (let i = 2; i < parts.length; i++) {
      const key = parts[i];
      const val = Number(parts[i + 1]);
      if (key === 'sem') out.selected.semesterId = val;
      if (key === 'sub') out.selected.subjectId = val;
      if (key === 'unit') out.selected.unitId = val;
      i++;
    }
    return out;
  }
  return { route: 'home' };
}

async function api(path) {
  const res = await fetch(path, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => {
    const map = {
      '&': '&amp;',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#39;',
    };
    return map[c];
  });
}

function renderList(container, items, onClick) {
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<div id="appEmpty">No items found.</div>';
    return;
  }

  const wrap = document.createDocumentFragment();
  for (const it of items) {
    const div = document.createElement('div');
    div.className = 'item';
    div.role = 'button';
    div.tabIndex = 0;
    div.innerHTML = `
      <div class="itemTitle">${escapeHtml(it.name || it.title || '')}</div>
      <div class="itemMeta">
        ${escapeHtml(it.code ? String(it.code) : '')}
        ${it.unitNumber != null ? `Unit ${it.unitNumber}` : ''}
        ${it.semesterNumber != null ? `Sem ${it.semesterNumber}` : ''}
      </div>
    `;
    div.addEventListener('click', () => onClick(it));
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onClick(it);
    });
    wrap.appendChild(div);
  }

  container.appendChild(wrap);
}

function setBreadcrumbs() {
  const b = $('#breadcrumbs');
  const s = state.selected;
  const crumbs = [];

  crumbs.push('<span class="crumb">Home</span>');

  if (s.branchId) {
    const br = state.branches.find((x) => x.id === s.branchId);
    crumbs.push(
      '<span class="crumb">›</span><span class="crumb"><strong>' + escapeHtml(br?.name || '') + '</strong></span>'
    );
  }
  if (s.semesterId) {
    const sem = state.semesters.find((x) => x.id === s.semesterId);
    crumbs.push(
      '<span class="crumb">›</span><span class="crumb"><strong>' + escapeHtml(sem?.name || '') + '</strong></span>'
    );
  }
  if (s.subjectId) {
    const sub = state.subjects.find((x) => x.id === s.subjectId);
    crumbs.push(
      '<span class="crumb">›</span><span class="crumb"><strong>' + escapeHtml(sub?.name || '') + '</strong></span>'
    );
  }
  if (s.unitId) {
    const u = state.units.find((x) => x.id === s.unitId);
    crumbs.push(
      '<span class="crumb">›</span><span class="crumb"><strong>' + escapeHtml(u?.title || '') + '</strong></span>'
    );
  }

  b.innerHTML = crumbs.join(' ');
}

async function loadHome() {
  $('#mainTitle').textContent = 'Browse Study Material';
  const loading = $('#loading');
  loading.classList.add('loading');

  try {
    state.selected = { branchId: null, semesterId: null, subjectId: null, unitId: null, topicId: null };

    const branches = await api('/.netlify/functions/api/branches');
    state.branches = branches;
    state.semesters = [];
    state.subjects = [];
    state.units = [];
    state.topics = [];

    const branchBox = $('#branchList');
    renderList(branchBox, branches, (br) => {
      state.selected.branchId = br.id;
      setBreadcrumbs();
      loadSemesters(br.id);
    });

    $('#semList').innerHTML = '';
    $('#subList').innerHTML = '';
    $('#unitList').innerHTML = '';
    $('#topicList').innerHTML = '';
  } finally {
    loading.classList.remove('loading');
  }
}

async function loadSemesters(branchId) {
  const loading = $('#loading');
  loading.classList.add('loading');
  try {
    state.selected.semesterId = null;
    state.selected.subjectId = null;
    state.selected.unitId = null;
    state.selected.topicId = null;

    const semesters = await api(
      `/.netlify/functions/api/semesters?branchId=${encodeURIComponent(branchId)}`
    );

    state.semesters = semesters;
    state.subjects = [];
    state.units = [];
    state.topics = [];

    setBreadcrumbs();
    renderList($('#semList'), semesters, (sem) => {
      state.selected.semesterId = sem.id;
      loadSubjects(sem.id);
    });

    $('#subList').innerHTML = '';
    $('#unitList').innerHTML = '';
    $('#topicList').innerHTML = '';
  } finally {
    loading.classList.remove('loading');
  }
}

async function loadSubjects(semesterId) {
  const loading = $('#loading');
  loading.classList.add('loading');
  try {
    state.selected.subjectId = null;
    state.selected.unitId = null;
    state.selected.topicId = null;

    const subjects = await api(
      `/.netlify/functions/api/subjects?semesterId=${encodeURIComponent(semesterId)}`
    );

    state.subjects = subjects;
    state.units = [];
    state.topics = [];

    setBreadcrumbs();
    renderList($('#subList'), subjects, (sub) => {
      state.selected.subjectId = sub.id;
      loadUnits(sub.id);
    });

    $('#unitList').innerHTML = '';
    $('#topicList').innerHTML = '';
  } finally {
    loading.classList.remove('loading');
  }
}

async function loadUnits(subjectId) {
  const loading = $('#loading');
  loading.classList.add('loading');
  try {
    state.selected.unitId = null;
    state.selected.topicId = null;

    const units = await api(`/.netlify/functions/api/units?subjectId=${encodeURIComponent(subjectId)}`);

    state.units = units;
    state.topics = [];

    setBreadcrumbs();
    renderList($('#unitList'), units, (unit) => {
      state.selected.unitId = unit.id;
      loadTopics(unit.id);
    });

    $('#topicList').innerHTML = '';
  } finally {
    loading.classList.remove('loading');
  }
}

async function loadTopics(unitId, q) {
  const loading = $('#loading');
  loading.classList.add('loading');
  try {
    state.selected.topicId = null;

    let url = `/.netlify/functions/api/topics?unitId=${encodeURIComponent(unitId)}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;

    const topics = await api(url);
    state.topics = topics;

    setBreadcrumbs();
    renderList($('#topicList'), topics, (t) => {
      state.selected.topicId = t.id;
      window.location.hash = `#/t/${t.id}`;
      loadTopic(t.id);
    });
  } finally {
    loading.classList.remove('loading');
  }
}

async function loadTopic(topicId) {
  const loading = $('#loading');
  loading.classList.add('loading');
  try {
    const topic = await api(`/.netlify/functions/api/topic?id=${encodeURIComponent(topicId)}`);
    const wrap = $('#topicDetail');
    $('#mainTitle').textContent = topic.title;
    state.selected.topicId = topic.id;

    const kwords = Array.isArray(topic.keywords) ? topic.keywords.join(', ') : '';
    wrap.innerHTML = `
      <div class="contentCard">
        <div class="crumbs" style="margin-top:0">
          <span class="badge">Difficulty: <strong style="color:var(--text)">${escapeHtml(topic.difficulty || '')}</strong></span>
          <span class="badge">Status: <strong style="color:var(--text)">${escapeHtml(topic.status || '')}</strong></span>
          <span class="badge">Read: <strong style="color:var(--text)">${escapeHtml(String(topic.estimatedReadingMinutes ?? ''))} min</strong></span>
        </div>
        <h2>${escapeHtml(topic.title)}</h2>
        <p class="muted">${escapeHtml(topic.summary || '')}</p>
        <div class="kv">
          <div class="k">Definition</div><div>${escapeHtml(topic.definition || '')}</div>
          <div class="k">Explanation</div><div>${escapeHtml(topic.explanation || '')}</div>
          <div class="k">Examples</div><div>${escapeHtml(topic.examples || '')}</div>
          <div class="k">Advantages</div><div>${escapeHtml(topic.advantages || '')}</div>
          <div class="k">Disadvantages</div><div>${escapeHtml(topic.disadvantages || '')}</div>
          <div class="k">Applications</div><div>${escapeHtml(topic.applications || '')}</div>
          <div class="k">Interview Qs</div><div>${escapeHtml(topic.interviewQuestions || '')}</div>
          <div class="k">Exam Qs</div><div>${escapeHtml(topic.examQuestions || '')}</div>
          <div class="k">Revision Notes</div><div>${escapeHtml(topic.revisionNotes || '')}</div>
          <div class="k">References</div><div>${escapeHtml(topic.references || '')}</div>
          <div class="k">Keywords</div><div>${escapeHtml(kwords)}</div>
        </div>
      </div>
    `;
  } finally {
    loading.classList.remove('loading');
  }
}

function attachSearch() {
  const box = $('#searchBox');
  const btn = $('#searchBtn');
  btn.addEventListener('click', async () => {
    const q = box.value.trim();
    if (!state.selected.unitId) {
      $('#topicList').innerHTML = '<div id="appEmpty">Select a Unit first to search inside that unit.</div>';
      return;
    }
    await loadTopics(state.selected.unitId, q || undefined);
  });
}

async function route() {
  const r = parseHash();
  if (r.route === 'topic') {
    await loadTopic(r.topicId);
    return;
  }
  await loadHome();

  // Drill-down (best effort)
  if (r.selected) {
    state.selected.branchId = r.selected.branchId;
    await loadSemesters(state.selected.branchId);
    if (r.selected.semesterId) {
      state.selected.semesterId = r.selected.semesterId;
      await loadSubjects(state.selected.semesterId);
    }
    if (r.selected.subjectId) {
      state.selected.subjectId = r.selected.subjectId;
      await loadUnits(state.selected.subjectId);
    }
    if (r.selected.unitId) {
      state.selected.unitId = r.selected.unitId;
      await loadTopics(state.selected.unitId);
    }
  }
}

function init() {
  $('#backHome').addEventListener('click', () => {
    window.location.hash = '#/';
    route();
  });
  attachSearch();
  window.addEventListener('hashchange', () => route());
  route();
}

document.addEventListener('DOMContentLoaded', init);

