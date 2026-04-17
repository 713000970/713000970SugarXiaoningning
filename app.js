// ── State ──────────────────────────────────────────────
const STATE_KEY = 'jf_rules_v2';
let state = { providers: [], brands: [], seriesMap: {} };

function loadState() {
  try {
    const s = localStorage.getItem(STATE_KEY);
    if (s) state = JSON.parse(s);
  } catch(e) {}

  if (!state.brands.length) {
    try {
      const oldData = localStorage.getItem('rule_library_providers');
      if (oldData) {
        const arr = JSON.parse(oldData);
        const brandSet = new Set(), seriesMap = {};
        arr.forEach(item => {
          if (item.brand) brandSet.add(item.brand);
          if (!seriesMap[item.brand]) seriesMap[item.brand] = [];
          if (item.series && !seriesMap[item.brand].includes(item.series)) {
            seriesMap[item.brand].push(item.series);
          }
          state.providers.push({
            id: uid(),
            name: item.name,
            brand: item.brand,
            series: item.series,
            note: item.specialCase || item.pricing || ''
          });
        });
        state.brands = Array.from(brandSet);
        state.seriesMap = seriesMap;
        localStorage.removeItem('rule_library_providers');
        saveState();
        return;
      }
    } catch(e) {}

    state.brands = ['人教版', '北师大版', '苏教版'];
    state.seriesMap = {
      '人教版': ['必修系列', '选修系列', '同步练习'],
      '北师大版': ['核心素养版', '专项突破'],
      '苏教版': ['基础训练', '提优版']
    };
    state.providers = [
      { id: uid(), name: '学科网官方', brand: '人教版', series: '必修系列', note: '' },
      { id: uid(), name: '教辅精选团队', brand: '北师大版', series: '核心素养版', note: '真题卷作者统一打标"教辅精选"' }
    ];
    saveState();
  }
}

function saveState() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
function uid() { return Math.random().toString(36).slice(2, 10); }

// ── Page routing ────────────────────────────────────────
function goPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'provider') renderProviderList();
}

function goHome() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-home').classList.add('active');
  window.scrollTo(0, 0);
}

// ── Collapsible blocks ──────────────────────────────────
document.querySelectorAll('.block-hd.collapsible').forEach(hd => {
  hd.addEventListener('click', () => {
    const bd = document.getElementById(hd.dataset.target);
    const hidden = bd.classList.toggle('hidden');
    hd.classList.toggle('collapsed', hidden);
  });
});

// ── Brand / Series selects ──────────────────────────────
function populateBrandSelect(id) {
  const sel = document.getElementById(id);
  const cur = sel.value;
  sel.innerHTML = '<option value="">— 选择品牌 —</option>';
  state.brands.forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    if (b === cur) o.selected = true;
    sel.appendChild(o);
  });
}

function populateSeriesSelect(brand) {
  const sel = document.getElementById('series-select');
  sel.innerHTML = '<option value="">— 选择系列 —</option>';
  (state.seriesMap[brand] || []).forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.textContent = s;
    sel.appendChild(o);
  });
}

function onBrandChange() {
  const brand = document.getElementById('brand-select').value;
  populateSeriesSelect(brand);
  document.getElementById('custom-rule-display').style.display = 'none';
  renderProviderList();
}

function onSeriesChange() {
  const brand = document.getElementById('brand-select').value;
  const series = document.getElementById('series-select').value;
  if (brand && series) showCustomRule(brand, series);
  else document.getElementById('custom-rule-display').style.display = 'none';
  renderProviderList();
}

function showCustomRule(brand, series) {
  const box = document.getElementById('custom-rule-display');
  const matched = state.providers.find(p => p.brand === brand && p.series === series && p.note);
  const note = matched ? matched.note : '（暂无特殊个性化规则，按通用规则执行）';
  box.style.display = 'block';
  box.innerHTML = `<h3>📋 ${brand} · ${series} — 个性化生产规则</h3><div class="rule-note">${note}</div>`;
}

// ── Provider list ───────────────────────────────────────
function renderProviderList() {
  const kw = document.getElementById('provider-search').value.trim().toLowerCase();
  const brand = document.getElementById('brand-select').value;
  const series = document.getElementById('series-select').value;

  let list = state.providers.filter(p => {
    if (kw && !p.name.toLowerCase().includes(kw) && !p.brand.toLowerCase().includes(kw) && !p.series.toLowerCase().includes(kw)) return false;
    if (brand && p.brand !== brand) return false;
    if (series && p.series !== series) return false;
    return true;
  });

  document.getElementById('provider-count').textContent = list.length;
  const el = document.getElementById('provider-list');

  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="ei">🔍</div>暂无匹配的提供者</div>`;
    return;
  }

  el.innerHTML = list.map(p => `
    <div class="provider-card">
      <div class="pv-info">
        <div class="pv-name">${p.name}</div>
        <div class="pv-meta">
          <span>🏷️ ${p.brand || '—'}</span>
          <span>📚 ${p.series || '—'}</span>
          ${p.note ? '<span>📝 有个性化规则</span>' : ''}
        </div>
      </div>
      <div class="pv-actions">
        <button class="btn-edit" onclick="editProvider('${p.id}')">编辑</button>
        <button class="btn-del" onclick="deleteProvider('${p.id}')">删除</button>
      </div>
    </div>`).join('');
}

function searchProvider() { renderProviderList(); }
document.getElementById('provider-search').addEventListener('keydown', e => { if (e.key === 'Enter') renderProviderList(); });

// ── Add / Edit Provider ─────────────────────────────────
let editingId = null;

function populateModalBrand(selectedBrand) {
  const sel = document.getElementById('new-provider-brand');
  sel.innerHTML = '<option value="">— 选择品牌 —</option>';
  state.brands.forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    if (b === selectedBrand) o.selected = true;
    sel.appendChild(o);
  });
  populateModalSeries(selectedBrand, '');
}

function populateModalSeries(brand, selectedSeries) {
  const sel = document.getElementById('new-provider-series');
  sel.innerHTML = '<option value="">— 选择系列 —</option>';
  (state.seriesMap[brand] || []).forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.textContent = s;
    if (s === selectedSeries) o.selected = true;
    sel.appendChild(o);
  });
}

function onModalBrandChange() {
  const brand = document.getElementById('new-provider-brand').value;
  populateModalSeries(brand, '');
}

function openAddProvider() {
  editingId = null;
  document.getElementById('new-provider-name').value = '';
  document.getElementById('new-provider-note').value = '';
  populateModalBrand('');
  document.getElementById('modal-provider-title').textContent = '新增提供者';
  document.getElementById('modal-provider').style.display = 'flex';
}

function editProvider(id) {
  const p = state.providers.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('new-provider-name').value = p.name;
  document.getElementById('new-provider-note').value = p.note;
  populateModalBrand(p.brand);
  populateModalSeries(p.brand, p.series);
  document.getElementById('modal-provider-title').textContent = '编辑提供者';
  document.getElementById('modal-provider').style.display = 'flex';
}

function saveProvider() {
  const name   = document.getElementById('new-provider-name').value.trim();
  const brand  = document.getElementById('new-provider-brand').value;
  const series = document.getElementById('new-provider-series').value;
  const note   = document.getElementById('new-provider-note').value.trim();
  if (!name) { toast('请填写提供者名称', 'error'); return; }

  if (editingId) {
    const p = state.providers.find(x => x.id === editingId);
    if (p) Object.assign(p, { name, brand, series, note });
    toast('已更新', 'success');
  } else {
    if (state.providers.find(p => p.name === name)) { toast('提供者已存在', 'error'); return; }
    state.providers.push({ id: uid(), name, brand, series, note });
    toast('提供者已添加', 'success');
  }
  saveState();
  closeModal('modal-provider');
  renderProviderList();
}

function deleteProvider(id) {
  if (!confirm('确认删除该提供者？')) return;
  state.providers = state.providers.filter(p => p.id !== id);
  saveState(); renderProviderList(); toast('已删除', 'success');
}

// ── Brand ───────────────────────────────────────────────
function openAddBrand() {
  document.getElementById('new-brand-name').value = '';
  document.getElementById('modal-brand').style.display = 'flex';
}
function saveBrand() {
  const name = document.getElementById('new-brand-name').value.trim();
  if (!name) { toast('请填写品牌名称', 'error'); return; }
  if (state.brands.includes(name)) { toast('品牌已存在', 'error'); return; }
  state.brands.push(name);
  state.seriesMap[name] = [];
  saveState();
  populateBrandSelect('brand-select');
  populateBrandSelect('new-series-brand');
  closeModal('modal-brand');
  toast('品牌已添加', 'success');
}

// ── Series ──────────────────────────────────────────────
function openAddSeries() {
  populateBrandSelect('new-series-brand');
  document.getElementById('new-series-name').value = '';
  document.getElementById('modal-series').style.display = 'flex';
}
function saveSeries() {
  const brand = document.getElementById('new-series-brand').value;
  const name  = document.getElementById('new-series-name').value.trim();
  if (!brand) { toast('请选择所属品牌', 'error'); return; }
  if (!name)  { toast('请填写系列名称', 'error'); return; }
  if (!state.seriesMap[brand]) state.seriesMap[brand] = [];
  if (state.seriesMap[brand].includes(name)) { toast('系列已存在', 'error'); return; }
  state.seriesMap[brand].push(name);
  saveState();
  if (document.getElementById('brand-select').value === brand) populateSeriesSelect(brand);
  closeModal('modal-series');
  toast('系列已添加', 'success');
}

// ── AI Query ────────────────────────────────────────────
const RULES = [
  { title: '资料拆分', body: '<strong>PDF</strong>：按目录拆分，无目录则按标题，杜绝单页<br><strong>PPT/WORD</strong>：删除敏感信息（联系方式、二维码）后直接上传' },
  { title: '资料命名', body: '具体标题（第X章+第X节+标题名）— 专辑名<br>若资料名与书籍名重复则无需后缀' },
  { title: '专辑命名', body: '【品牌】学年 + 年级 + 学科 + 具体名称（版本）' },
  { title: '专辑目录', body: '有目录书籍：1:1还原目录，资料按顺序排序<br>同步书籍：获取主数据目录，资料放对应目录下' },
  { title: '专辑简介', body: 'XXXX（书籍名称）系列资料由XXXX（提供者名称）提供，并授权学科网在互联网进行发布，侵权必究！' },
  { title: '专辑封面', body: '无封面 → 用去年同期产品封面<br>去年无 → 智能平台生成，最下标写：学科网书城·学科网AI智能平台' },
  { title: '真题试卷', body: '高考：不处理直接上传<br>中考/小升初：发布后XMP后台加入网校通<br>校考/统考卷：作者打标"教辅精选"，发布后加入网校通' },
  { title: '音视频',   body: '勾选"禁止下载"标签' },
  { title: '电子样书', body: '名称补充"-电子样书"，勾选"样书"+"禁止下载"，定价0，立即发布' },
  { title: '中职产品', body: '发布后在XMP后台加入网校通' },
];

function aiQuery() {
  const q = document.getElementById('ai-query').value.trim().toLowerCase();
  if (!q) { toast('请输入查询内容', 'error'); return; }

  const pMatches = state.providers.filter(p =>
    p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.series.toLowerCase().includes(q)
  );
  const rMatches = RULES.filter(r => r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q));

  let html = '';
  pMatches.forEach(p => {
    html += `<div class="ai-card">
      <div class="ai-card-hd">🏢 ${p.name}</div>
      <div class="ai-card-bd"><strong>品牌：</strong>${p.brand||'—'} &nbsp;|&nbsp; <strong>系列：</strong>${p.series||'—'}<br><strong>个性化规则：</strong>${p.note||'按通用规则执行'}</div>
    </div>`;
  });
  rMatches.forEach(r => {
    html += `<div class="ai-card">
      <div class="ai-card-hd">📋 ${r.title}</div>
      <div class="ai-card-bd">${r.body}</div>
    </div>`;
  });

  if (!html) {
    html = `<div class="ai-card">
      <div class="ai-card-hd">💡 未找到精确匹配，显示全部通用规则</div>
      <div class="ai-card-bd">${RULES.map(r=>`<strong>${r.title}：</strong>${r.body}`).join('<br><br>')}</div>
    </div>`;
  }
  document.getElementById('ai-result').innerHTML = html;
}

document.getElementById('ai-query').addEventListener('keydown', e => { if (e.key === 'Enter') aiQuery(); });

// ── Modal ───────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
});

// ── Toast ───────────────────────────────────────────────
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ── Init ────────────────────────────────────────────────
loadState();
populateBrandSelect('brand-select');
populateBrandSelect('new-series-brand');
renderProviderList();
