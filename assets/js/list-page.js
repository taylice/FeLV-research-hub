function initListPage({ data, totalCountEl, pageSize = 50 }) {
  if (totalCountEl) totalCountEl.textContent = data.length;

  const searchEl = document.getElementById('search');
  const tbody = document.getElementById('tbody');
  const countEl = document.getElementById('count');
  const paginationEl = document.getElementById('pagination');

  let filtered = data;
  let page = 1;

  function doiOrPmid(a) {
    if (a.doi) return `<a href="https://doi.org/${a.doi}" target="_blank" rel="noopener">${a.doi}</a>`;
    if (a.pmid) return `<a href="https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/" target="_blank" rel="noopener">PMID ${a.pmid}</a>`;
    return '—';
  }

  function rowHtml(a, idx) {
    const hasAbstract = a.abstract && a.abstract.trim().length > 0;
    const deposited = a.deposited_data && /sim/i.test(a.deposited_data);
    return `
      <tr>
        <td>${a.year ?? ''}</td>
        <td class="ref-cell">
          <b>${a.author || ''}</b>${a.n_authors > 1 ? ' et al.' : ''} — ${a.title || ''}${a.journal ? `. <i>${a.journal}</i>` : ''}
          ${deposited ? '<span class="badge yes" style="margin-left:6px">dados depositados</span>' : ''}
          ${hasAbstract ? `<br><button class="abstract-toggle" data-idx="${idx}">ver resumo</button><div class="abstract-box" id="abs-${idx}">${a.abstract}</div>` : ''}
        </td>
        <td>${doiOrPmid(a)}</td>
      </tr>`;
  }

  function render() {
    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);
    tbody.innerHTML = pageItems.map((a, i) => rowHtml(a, start + i)).join('');
    countEl.textContent = filtered.length + ' referência' + (filtered.length !== 1 ? 's' : '');

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    paginationEl.innerHTML = `
      <button id="prevBtn" ${page <= 1 ? 'disabled' : ''}>← Anterior</button>
      <span>Página ${page} de ${totalPages}</span>
      <button id="nextBtn" ${page >= totalPages ? 'disabled' : ''}>Próxima →</button>
    `;
    document.getElementById('prevBtn').addEventListener('click', () => { page--; render(); window.scrollTo({top:0, behavior:'smooth'}); });
    document.getElementById('nextBtn').addEventListener('click', () => { page++; render(); window.scrollTo({top:0, behavior:'smooth'}); });

    tbody.querySelectorAll('.abstract-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const box = document.getElementById('abs-' + btn.dataset.idx);
        box.classList.toggle('open');
        btn.textContent = box.classList.contains('open') ? 'ocultar resumo' : 'ver resumo';
      });
    });
  }

  let debounceTimer;
  searchEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = searchEl.value.toLowerCase();
      filtered = q ? data.filter(a => JSON.stringify(a).toLowerCase().includes(q)) : data;
      page = 1;
      render();
    }, 150);
  });

  render();
}
