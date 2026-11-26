// 마이컬리 > 취소·반품·교환 내역
requireLogin();
let page = 1;

async function load() {
  const res = await api.getClaims(page);
  if (res.code !== 'ok') return;
  document.getElementById('claim-list').innerHTML = res.claims.length ? res.claims.map((c) => `
    <tr>
      <td>${c.created_at.slice(0, 10)}</td>
      <td><a href="order-detail.jsp?order_id=${c.order_id}">${c.order_id}</a></td>
      <td>${LABEL.requestType[c.request_type] || c.request_type}</td>
      <td>${LABEL.reasonType[c.reason_type] || c.reason_type}</td>
      <td><b>${LABEL.claimStatus[c.status] || c.status}</b></td>
    </tr>`).join('') : '<tr><td colspan="5" class="empty">신청 내역이 없습니다.</td></tr>';
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}
load();
