/* ============================================================
   ONIONGUARD AI — Vanilla JS Application
   ============================================================ */

/* ── State ──────────────────────────────────────────────────── */
const App = {
  currentScreen: 'dashboard',
  flashOn: false,
  analysisTimer: null,

  inspection: {
    batchId:   '',
    center:    'APMC Nashik — Center 3',
    inspector: 'Rajesh Kumar',
    variety:   'Nasik Red',
    quantity:  '',
    capturedImage: null,
  },

  /* Modular: replace with real API response */
  detectionData: {
    total:        20,
    healthy:      15,
    damaged:      2,
    rotten:       1,
    sprouted:     1,
    undersized:   1,
    avgDiameter:  5.4,
    sizeCompliance: 90,
    gradeA:       82,
    urs:          18,
    qualityScore: 87,
  },
};

/* ── Flow definition ────────────────────────────────────────── */
const FLOW_MAP = {
  'new-inspection':   1,
  'capture':          2,
  'ai-analysis':      3,
  'detection-results':4,
  'size-measurement': 4,
  'quality':          5,
  'report':           6,
};

/* ── Bounding box mock data (modular — replace with API) ────── */
const MOCK_BOXES = [
  /* Row 1 */
  {id:1,  label:'Healthy',    conf:97, color:'#22C55E', x:2,  y:2,  w:17, h:22},
  {id:2,  label:'Healthy',    conf:95, color:'#22C55E', x:21, y:2,  w:17, h:22},
  {id:3,  label:'Damaged',    conf:93, color:'#F97316', x:41, y:3,  w:17, h:21},
  {id:4,  label:'Healthy',    conf:96, color:'#22C55E', x:61, y:2,  w:17, h:21},
  {id:5,  label:'Healthy',    conf:94, color:'#22C55E', x:80, y:2,  w:17, h:22},
  /* Row 2 */
  {id:6,  label:'Healthy',    conf:97, color:'#22C55E', x:2,  y:26, w:17, h:21},
  {id:7,  label:'Healthy',    conf:95, color:'#22C55E', x:21, y:26, w:17, h:22},
  {id:8,  label:'Rotten',     conf:96, color:'#EF4444', x:41, y:27, w:17, h:21},
  {id:9,  label:'Healthy',    conf:95, color:'#22C55E', x:61, y:26, w:17, h:21},
  {id:10, label:'Healthy',    conf:97, color:'#22C55E', x:80, y:26, w:17, h:22},
  /* Row 3 */
  {id:11, label:'Healthy',    conf:97, color:'#22C55E', x:2,  y:51, w:17, h:21},
  {id:12, label:'Damaged',    conf:91, color:'#F97316', x:21, y:51, w:17, h:22},
  {id:13, label:'Healthy',    conf:96, color:'#22C55E', x:41, y:51, w:17, h:21},
  {id:14, label:'Healthy',    conf:95, color:'#22C55E', x:61, y:51, w:17, h:21},
  {id:15, label:'Healthy',    conf:97, color:'#22C55E', x:80, y:51, w:17, h:22},
  /* Row 4 */
  {id:16, label:'Healthy',    conf:97, color:'#22C55E', x:2,  y:76, w:17, h:21},
  {id:17, label:'Sprouted',   conf:91, color:'#FACC15', x:21, y:76, w:17, h:22},
  {id:18, label:'Healthy',    conf:96, color:'#22C55E', x:41, y:76, w:17, h:21},
  {id:19, label:'Undersized', conf:88, color:'#60A5FA', x:63, y:79, w:12, h:14},
  {id:20, label:'Healthy',    conf:95, color:'#22C55E', x:80, y:76, w:17, h:22},
];

/* ── History data ───────────────────────────────────────────── */
const HISTORY_DATA = [
  {id:'OG-20260823-047', batch:'APMC-NAS-4721', center:'APMC Nashik — Center 3', gradeA:85, urs:15, score:88, time:'11:42 AM', date:'23 Aug 2026', status:'pass', variety:'Nasik Red', inspector:'Rajesh Kumar'},
  {id:'OG-20260823-046', batch:'APMC-NAS-4720', center:'APMC Nashik — Center 3', gradeA:70, urs:30, score:72, time:'10:15 AM', date:'23 Aug 2026', status:'marginal', variety:'Bellary Red', inspector:'Rajesh Kumar'},
  {id:'OG-20260823-045', batch:'APMC-NAS-4718', center:'APMC Lasalgaon — Center 2', gradeA:89, urs:11, score:91, time:'9:03 AM',  date:'23 Aug 2026', status:'pass', variety:'Nasik Red', inspector:'Arun Patil'},
  {id:'OG-20260822-044', batch:'APMC-NAS-4715', center:'APMC Nashik — Center 3', gradeA:76, urs:24, score:77, time:'3:45 PM',  date:'22 Aug 2026', status:'pass', variety:'N-53', inspector:'Rajesh Kumar'},
  {id:'OG-20260822-043', batch:'APMC-NAS-4712', center:'APMC Pune — Center 1',   gradeA:92, urs:8,  score:94, time:'11:20 AM', date:'22 Aug 2026', status:'pass', variety:'Agrifound Dark Red', inspector:'Priya Sharma'},
  {id:'OG-20260822-042', batch:'APMC-NAS-4710', center:'APMC Nashik — Center 3', gradeA:61, urs:39, score:63, time:'9:30 AM',  date:'22 Aug 2026', status:'fail', variety:'Bellary Red', inspector:'Rajesh Kumar'},
];

/* ================================================================
   NAVIGATION
   ================================================================ */
function navigate(screenId) {
  /* Hide all screens */
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  /* Show target */
  const target = document.getElementById('screen-' + screenId);
  if (!target) { console.warn('Screen not found:', screenId); return; }
  target.classList.add('active');
  App.currentScreen = screenId;

  /* Scroll to top */
  const mc = document.getElementById('main-content');
  mc.scrollTo(0, 0);

  /* Update nav active states */
  updateNavActive(screenId);

  /* Flow progress */
  updateFlowProgress(screenId);

  /* Per-screen init */
  initScreen(screenId);

  /* Re-init lucide icons */
  if (window.lucide) lucide.createIcons();
}

function updateNavActive(screenId) {
  const mainNav = ['dashboard', 'new-inspection', 'history', 'profile'];
  let activeNav = screenId;
  if (!mainNav.includes(screenId)) {
    if (['capture','ai-analysis','detection-results','size-measurement','quality','report'].includes(screenId)) {
      activeNav = 'new-inspection';
    }
  }

  document.querySelectorAll('.nav-link, .bnav-btn').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.nav === activeNav) el.classList.add('active');
  });
}

function updateFlowProgress(screenId) {
  const fp = document.getElementById('flow-progress');
  const stepNum = FLOW_MAP[screenId];
  if (!stepNum) { fp.classList.add('hidden'); return; }
  fp.classList.remove('hidden');

  document.querySelectorAll('.flow-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    const dot = el.querySelector('.step-dot');
    el.classList.remove('active', 'done');
    if (s < stepNum)  { el.classList.add('done');  dot.textContent = '✓'; }
    if (s === stepNum){ el.classList.add('active'); dot.textContent = s; }
    if (s > stepNum)  { dot.textContent = s; }
  });

  document.querySelectorAll('.step-line').forEach((line, i) => {
    if (i + 1 < stepNum) line.classList.add('done');
    else line.classList.remove('done');
  });
}

/* ================================================================
   SCREEN INIT
   ================================================================ */
function initScreen(screenId) {
  const init = {
    'new-inspection':    initNewInspection,
    'capture':           initCapture,
    'ai-analysis':       initAnalysis,
    'detection-results': initDetection,
    'size-measurement':  initSizeMeasurement,
    'report':            initReport,
    'history':           initHistory,
  };
  if (init[screenId]) init[screenId]();
}

/* ── New Inspection ─────────────────────────────────────────── */
function initNewInspection() {
  const batchEl = document.getElementById('batch-id');
  if (!batchEl.value) {
    batchEl.value = 'APMC-NAS-' + (4722 + Math.floor(Math.random() * 10));
  }
}

function continueToCapture() {
  const qty = document.getElementById('quantity').value;
  if (!qty || qty <= 0) { showToast('Please enter a valid sample quantity'); return; }
  App.inspection.batchId   = document.getElementById('batch-id').value;
  App.inspection.center    = document.getElementById('center-select').value;
  App.inspection.inspector = document.getElementById('inspector-name').value;
  App.inspection.variety   = document.getElementById('variety-select').value;
  App.inspection.quantity  = qty;
  navigate('capture');
}

/* ── Capture ────────────────────────────────────────────────── */
function initCapture() {
  const label = document.getElementById('capture-batch-label');
  if (label) label.textContent = App.inspection.batchId || 'APMC-NAS-4722';

  /* Wire file input */
  const fileInput = document.getElementById('file-input');
  const galleryBtn = document.getElementById('gallery-btn');

  galleryBtn.onclick = () => fileInput.click();

  fileInput.onchange = function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      App.inspection.capturedImage = e.target.result;
      const prev = document.getElementById('preview-img');
      if (prev) { prev.src = e.target.result; prev.style.filter = 'brightness(0.82)'; }
      document.getElementById('detected-count').textContent = App.detectionData.total;
      showToast('Image loaded — tap Capture to analyze');
    };
    reader.readAsDataURL(file);
  };
}

function toggleFlash() {
  App.flashOn = !App.flashOn;
  const icon = document.getElementById('flash-icon');
  const btn  = document.getElementById('flash-btn');
  if (icon) {
    icon.setAttribute('data-lucide', App.flashOn ? 'zap' : 'zap-off');
    icon.style.color = App.flashOn ? '#FDE047' : '';
  }
  if (btn) btn.style.border = App.flashOn ? '1px solid rgba(253,224,71,0.5)' : 'none';
  if (window.lucide) lucide.createIcons();
}

function startAnalysis() {
  const captureBtn = document.getElementById('capture-btn');
  if (captureBtn) {
    captureBtn.classList.add('captured');
    captureBtn.querySelector('.capture-inner').style.background = '#4ADE80';
  }
  setTimeout(() => navigate('ai-analysis'), 600);
}

/* ── AI Analysis ────────────────────────────────────────────── */
function initAnalysis() {
  const ring = document.getElementById('analysis-ring');
  const pctEl = document.getElementById('analysis-pct');
  const circ = 364.4;
  let pct = 0;

  /* Reset steps */
  document.querySelectorAll('.astep').forEach(el => {
    const icon = el.querySelector('.astep-icon');
    icon.className = 'astep-icon idle';
    icon.textContent = '';
    el.classList.remove('active', 'done');
  });
  if (ring) { ring.style.strokeDashoffset = circ; }
  if (pctEl) pctEl.textContent = '0%';

  if (App.analysisTimer) clearInterval(App.analysisTimer);

  App.analysisTimer = setInterval(() => {
    pct += 2;
    if (pct > 100) pct = 100;

    /* Ring */
    if (ring) ring.style.strokeDashoffset = circ * (1 - pct / 100);
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';

    /* Steps: 6 steps, advance one per ~16% */
    const stepIdx = Math.min(Math.floor((pct / 100) * 6), 5);
    document.querySelectorAll('.astep').forEach((el, i) => {
      const icon = el.querySelector('.astep-icon');
      el.classList.remove('active', 'done');
      icon.className = 'astep-icon idle';
      icon.textContent = '';
      if (i < stepIdx) {
        el.classList.add('done');
        icon.className = 'astep-icon done';
      } else if (i === stepIdx) {
        el.classList.add('active');
        icon.className = 'astep-icon active';
      }
    });

    if (pct >= 100) {
      clearInterval(App.analysisTimer);
      App.analysisTimer = null;
      setTimeout(() => navigate('detection-results'), 700);
    }
  }, 55);
}

/* ── AI Detection Results ───────────────────────────────────── */
function initDetection() {
  /* Set image */
  const img = document.getElementById('detection-img');
  if (img && App.inspection.capturedImage) img.src = App.inspection.capturedImage;

  /* Draw bounding boxes */
  renderBoundingBoxes();

  /* Detection breakdown */
  renderDetectionBreakdown();
}

function renderBoundingBoxes() {
  const overlay = document.getElementById('bbox-overlay');
  const legend  = document.getElementById('bbox-legend');
  if (!overlay) return;
  overlay.innerHTML = '';
  if (legend) legend.innerHTML = '';

  MOCK_BOXES.forEach(box => {
    const el = document.createElement('div');
    el.className = 'bbox';
    el.style.left         = box.x + '%';
    el.style.top          = box.y + '%';
    el.style.width        = box.w + '%';
    el.style.height       = box.h + '%';
    el.style.borderColor  = box.color;
    el.style.boxShadow    = `0 0 6px ${box.color}55`;

    /* Glow ring */
    el.style.outline      = `3px solid ${box.color}22`;

    const lbl = document.createElement('div');
    lbl.className = 'bbox-label';
    lbl.textContent = box.label;
    lbl.style.background = box.color;
    lbl.style.color = getContrastColor(box.color);
    el.appendChild(lbl);

    const num = document.createElement('div');
    num.style.cssText = `position:absolute;bottom:2px;right:4px;font-size:8px;font-weight:700;color:rgba(255,255,255,0.85);font-family:var(--mono)`;
    num.textContent = '#' + box.id;
    el.appendChild(num);

    overlay.appendChild(el);
  });

  /* Legend */
  const legendItems = [
    {label:'Healthy',    color:'#22C55E'},
    {label:'Damaged',    color:'#F97316'},
    {label:'Rotten',     color:'#EF4444'},
    {label:'Sprouted',   color:'#FACC15'},
    {label:'Undersized', color:'#60A5FA'},
  ];
  legendItems.forEach(l => {
    const pill = document.createElement('div');
    pill.className = 'legend-pill';
    pill.innerHTML = `<div class="legend-pill-dot" style="background:${l.color}"></div><span>${l.label}</span>`;
    if (legend) legend.appendChild(pill);
  });
}

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 128 ? '#1A2F23' : '#ffffff';
}

function renderDetectionBreakdown() {
  const container = document.getElementById('detection-breakdown');
  if (!container) return;
  const d = App.detectionData;
  const cats = [
    {label:'Healthy',    count:d.healthy,    color:'#16A34A', bg:'#DCFCE7', border:'#BBF7D0', conf:97},
    {label:'Damaged',    count:d.damaged,    color:'#EA580C', bg:'#FFF3EB', border:'#FED7AA', conf:93},
    {label:'Rotten',     count:d.rotten,     color:'#DC2626', bg:'#FEE2E2', border:'#FECACA', conf:96},
    {label:'Sprouted',   count:d.sprouted,   color:'#CA8A04', bg:'#FEF9C3', border:'#FDE68A', conf:91},
    {label:'Undersized', count:d.undersized, color:'#2563EB', bg:'#DBEAFE', border:'#BFDBFE', conf:88},
  ];
  container.innerHTML = cats.map(cat => {
    const pct = Math.round(cat.count / d.total * 100);
    const barW = Math.max(pct * 3, 4);
    return `
      <div class="detection-breakdown-row">
        <div class="det-icon-label">
          <div class="det-icon" style="background:${cat.bg};border-color:${cat.border}">
            <div class="det-dot" style="background:${cat.color}"></div>
          </div>
          <div>
            <div class="det-name">${cat.label}</div>
            <div class="det-conf">${pct}% · <span style="font-family:var(--mono)">${cat.conf}%</span> conf.</div>
          </div>
        </div>
        <div class="det-right">
          <div class="det-bar-wrap">
            <div class="det-bar-fill" style="width:${barW}%;background:${cat.color}"></div>
          </div>
          <div class="det-count" style="color:${cat.color}">${cat.count}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── Size Measurement ───────────────────────────────────────── */
function initSizeMeasurement() {
  const img = document.getElementById('measurement-img');
  if (img && App.inspection.capturedImage) img.src = App.inspection.capturedImage;
}

/* ── Digital Report ─────────────────────────────────────────── */
function initReport() {
  /* Populate dynamic fields from inspection state */
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) +
                  ', ' + now.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('cert-report-id', 'OQA-2026-00' + (124 + Math.floor(Math.random() * 5)));
  set('cert-date',      dateStr);
  set('cert-batch',     App.inspection.batchId    || 'APMC-NAS-4722');
  set('cert-center',    App.inspection.center     || 'APMC Nashik — Center 3');
  set('cert-inspector', (App.inspection.inspector || 'Rajesh Kumar') + ' (ID: INS-0492)');
  set('cert-variety',   App.inspection.variety    || 'Nasik Red');

  const certImg = document.getElementById('cert-sample-img');
  if (certImg && App.inspection.capturedImage) certImg.src = App.inspection.capturedImage;
}

/* ── History ────────────────────────────────────────────────── */
let historyFilter = 'all';

function initHistory() {
  renderHistory(HISTORY_DATA);
}

function renderHistory(data) {
  const list = document.getElementById('history-list');
  if (!list) return;
  if (!data.length) { list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:24px">No inspections found</p>'; return; }
  list.innerHTML = data.map(r => {
    const badge = r.status === 'pass' ? 'badge-pass' : r.status === 'marginal' ? 'badge-warn' : 'badge-fail';
    const statusLabel = r.status === 'pass' ? 'Passed' : r.status === 'marginal' ? 'Marginal' : 'Failed';
    const chipBg = r.score >= 85 ? '#E8F5EE' : r.score >= 75 ? '#FFFBEB' : '#FDECEA';
    const chipColor = r.score >= 85 ? '#1B6B3A' : r.score >= 75 ? '#D97706' : '#C0392B';
    return `
      <button class="inspection-row" onclick="viewReport('${r.id}')">
        <div class="insp-info">
          <div class="insp-top">
            <span class="insp-batch">${r.batch}</span>
            <span class="badge ${badge}">${statusLabel}</span>
          </div>
          <p class="insp-id font-mono">${r.id}</p>
          <p style="font-size:11px;color:var(--muted);margin-bottom:4px">${r.date} · ${r.center}</p>
          <div class="insp-grades">
            <span style="color:#1B6B3A;font-weight:600;font-size:12px">Grade A: ${r.gradeA}%</span>
            <span style="color:#E8650A;font-weight:600;font-size:12px">URS: ${r.urs}%</span>
          </div>
        </div>
        <div class="insp-right">
          <span class="insp-time">${r.time}</span>
          <div class="score-chip" style="background:${chipBg};color:${chipColor}">${r.score}</div>
        </div>
      </button>
    `;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

function filterHistory() {
  const q = document.getElementById('history-search').value.toLowerCase();
  const data = HISTORY_DATA.filter(r => {
    const matchFilter = historyFilter === 'all' || r.status === historyFilter;
    const matchSearch = !q || r.batch.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.center.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
  renderHistory(data);
}

function setHistoryFilter(filter, btn) {
  historyFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  filterHistory();
}

/* ── View report details ────────────────────────────────────── */
function viewReport(reportId) {
  const r = HISTORY_DATA.find(x => x.id === reportId);
  if (!r) { navigate('history'); return; }

  const sub = document.getElementById('detail-sub');
  if (sub) sub.textContent = r.batch + ' · ' + r.date;

  const body = document.getElementById('detail-body');
  if (!body) { navigate('history'); return; }

  const chipBg    = r.score >= 85 ? '#E8F5EE' : r.score >= 75 ? '#FFFBEB' : '#FDECEA';
  const chipColor = r.score >= 85 ? '#1B6B3A' : r.score >= 75 ? '#D97706' : '#C0392B';
  const statusLabel = r.status === 'pass' ? 'PASSED' : r.status === 'marginal' ? 'MARGINAL' : 'FAILED';

  body.innerHTML = `
    <div class="certificate-card">
      <div class="cert-header">
        <div class="cert-brand">
          <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
            <ellipse cx="19" cy="22" rx="13" ry="12" fill="rgba(255,255,255,0.18)"/>
            <ellipse cx="19" cy="22" rx="9" ry="8" fill="rgba(255,255,255,0.22)"/>
            <ellipse cx="19" cy="23" rx="5" ry="5" fill="rgba(255,255,255,0.3)"/>
            <path d="M19 10 C17 4 13 3 13 3 C16 7 16 10 19 10Z" fill="#4ADE80"/>
            <path d="M19 10 C21 4 25 3 25 3 C22 7 22 10 19 10Z" fill="#4ADE80"/>
            <circle cx="24" cy="14" r="2.5" fill="#E8650A"/>
          </svg>
          <div>
            <p class="cert-brand-name">OnionGuard AI</p>
            <p class="cert-brand-sub">APMC Quality Certificate</p>
          </div>
        </div>
        <div class="cert-pass-badge" style="border-color:rgba(74,222,128,0.4)">
          <span>${statusLabel}</span>
        </div>
      </div>
      <div class="cert-meta-row">
        <div>
          <p class="cert-meta-label">Report ID</p>
          <p class="cert-meta-value font-mono">${r.id}</p>
        </div>
        <div>
          <p class="cert-meta-label">Date &amp; Time</p>
          <p class="cert-meta-value">${r.date}, ${r.time}</p>
        </div>
      </div>
      <div class="cert-body">
        <div class="cert-score-tiles">
          <div class="score-tile green"><p class="tile-val">${r.gradeA}%</p><p class="tile-label">Grade A</p></div>
          <div class="score-tile orange"><p class="tile-val">${r.urs}%</p><p class="tile-label">URS</p></div>
          <div class="score-tile mint" style="background:${chipBg}"><p class="tile-val" style="color:${chipColor}">${r.score}</p><p class="tile-label" style="color:${chipColor}">Score</p></div>
        </div>
        <table class="cert-table">
          <tr><td>Batch ID</td><td>${r.batch}</td></tr>
          <tr><td>Procurement Center</td><td>${r.center}</td></tr>
          <tr><td>Inspector</td><td>${r.inspector}</td></tr>
          <tr><td>Onion Variety</td><td>${r.variety}</td></tr>
          <tr><td>Sample Size</td><td>20 onions assessed</td></tr>
        </table>
        <div class="cert-inspection-img">
          <img src="https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=600&h=200&fit=crop&auto=format" alt="Inspection sample"/>
          <div class="cert-img-overlay">
            <p class="cert-img-label">INSPECTION IMAGE</p>
            <p class="cert-img-sub">20 onions · ${r.variety}</p>
          </div>
          <div class="cert-img-badge"><span class="cert-img-dot"></span>AI VERIFIED</div>
        </div>
        <div class="cert-assessment">
          <p class="cert-assess-title">AI Assessment Summary</p>
          <p class="cert-assess-body">Batch ${r.batch} demonstrates ${r.status === 'pass' ? 'acceptable' : 'marginal'} quality for Grade A procurement. ${r.gradeA}% of assessed onions meet size and surface standards.</p>
        </div>
        <div class="cert-footer">
          <p>Generated by OnionGuard AI · Smart India Hackathon 2026</p>
          <p>Ministry of Agriculture &amp; Farmers Welfare, Govt. of India</p>
        </div>
      </div>
    </div>
  `;

  navigate('report-details');
}

/* ================================================================
   REPORT ACTIONS
   ================================================================ */
function downloadPDF() {
  showToast('Preparing PDF — opening print dialog…');
  setTimeout(() => window.print(), 400);
}

function shareReport() {
  const text = `OnionGuard AI Report — Batch ${App.inspection.batchId || 'APMC-NAS-4722'}\nGrade A: 82% | URS: 18% | Score: 87/100\nGenerated: ${new Date().toLocaleString()}`;
  if (navigator.share) {
    navigator.share({ title: 'OnionGuard AI Report', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('Report details copied to clipboard')).catch(() => showToast('Share: ' + text));
  }
}

function saveReport() {
  showToast('Report saved to device storage');
}

function verifyReport() {
  const modal = document.createElement('div');
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px`;
  modal.innerHTML = `
    <div style="background:white;border-radius:20px;padding:28px;max-width:360px;width:100%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.25)">
      <div style="width:56px;height:56px;border-radius:16px;background:#E8F5EE;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:24px">✓</div>
      <h3 style="font-size:17px;font-weight:700;color:#1A2F23;margin-bottom:6px">Report Verified</h3>
      <p style="font-size:13px;color:#5E7468;margin-bottom:6px">OQA-2026-00124</p>
      <p style="font-size:12.5px;color:#5E7468;line-height:1.5;margin-bottom:18px">This certificate is authentic and has been verified via APMC blockchain registry.</p>
      <p style="font-size:11px;color:#1B6B3A;font-family:monospace;background:#E8F5EE;padding:8px 12px;border-radius:8px;margin-bottom:18px">apmc.gov.in/verify/OQA-2026-00124</p>
      <button onclick="this.closest('[style]').remove()" style="width:100%;height:46px;background:linear-gradient(135deg,#1B6B3A,#2E8B57);color:white;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ================================================================
   TOAST
   ================================================================ */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ================================================================
   NAV CLICKS — wire sidebar + bottom nav
   ================================================================ */
function wireNavClicks() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  wireNavClicks();

  /* Init Lucide */
  if (window.lucide) lucide.createIcons();

  /* Start on dashboard */
  navigate('dashboard');
});
