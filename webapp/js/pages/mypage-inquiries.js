// 마이컬리 > 상품 문의 — 내가 상품 상세에서 남긴 문의 목록
requireLogin();
let page = 1;

async function load() {
  const res = await api.getMyProductInquiries(page);
  if (res.code !== 'ok') return;
  document.getElementById('inquiry-list').innerHTML = res.inquiries.length ? res.inquiries.map((i) => `
    <tr>
      <td><a href="product.jsp?id=${i.product_id}">${i.product_name}</a></td>
      <td>${i.is_secret ? '🔒 ' : ''}${i.title}</td>
      <td>${i.is_answered ? '<b>답변완료</b>' : '답변대기'}</td>
      <td>${i.created_at.slice(0, 10)}</td>
    </tr>`).join('') : '<tr><td colspan="4" class="empty">문의 내역이 없습니다.</td></tr>';
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}
load();
