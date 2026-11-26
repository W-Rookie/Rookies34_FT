// 마이컬리 > 적립금·컬리캐시 — 탭(POINT/CASH) + 잔액 + 내역
requireLogin();
let type = 'POINT';
let page = 1;

async function load() {
  const res = await api.getPoints(type, page);
  if (res.code !== 'ok') return;
  document.getElementById('balance-label').textContent = `보유 ${LABEL.pointType[type]}`;
  document.getElementById('balance').textContent = won(res.balance);
  document.getElementById('history-list').innerHTML = res.histories.length ? res.histories.map((h) => `
    <tr>
      <td>${h.created_at.slice(0, 10)}</td>
      <td>${h.reason}</td>
      <td class="${h.amount >= 0 ? 'plus' : 'minus'}">${h.amount >= 0 ? '+' : ''}${won(h.amount)}</td>
    </tr>`).join('') : '<tr><td colspan="3" class="empty">내역이 없습니다.</td></tr>';
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}

renderTabs(document.getElementById('point-tabs'), LABEL.pointType, type, (v) => { type = v; page = 1; load(); });
load();
