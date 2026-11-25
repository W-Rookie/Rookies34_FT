// 1:1 문의 — 하나의 페이지에서 3가지 화면
//   inquiry.jsp            → 목록
//   inquiry.jsp?id=3       → 상세 (답변 포함)
//   inquiry.jsp?mode=write → 작성 (파일 첨부)
requireLogin();
const box = document.getElementById('inquiry-box');
const inquiryId = qs('id');
let page = 1;

async function showList() {
  const res = await api.getInquiries(page);
  if (res.code !== 'ok') return;
  box.innerHTML = `
    <div class="list-toolbar"><span>총 ${res.num}건</span><a class="btn btn-primary" href="inquiry.jsp?mode=write">문의하기</a></div>
    <table class="board">
      <thead><tr><th class="w-cat">유형</th><th>제목</th><th class="w-cat">상태</th><th class="w-date">작성일</th></tr></thead>
      <tbody>${res.inquiries.length ? res.inquiries.map((i) => `
        <tr>
          <td>${LABEL.inquiryCategory[i.category] || i.category}</td>
          <td><a href="inquiry.jsp?id=${i.inquiry_id}">${i.title}</a></td>
          <td>${i.is_answered ? '<b>답변완료</b>' : '답변대기'}</td>
          <td>${i.created_at.slice(0, 10)}</td>
        </tr>`).join('') : '<tr><td colspan="4" class="empty">문의 내역이 없습니다.</td></tr>'}
      </tbody>
    </table>
    <div class="pagination" id="pagination"></div>`;
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; showList(); });
}

async function showDetail() {
  const res = await api.getInquiry(inquiryId);
  if (res.code !== 'ok') { box.innerHTML = '<p class="empty">존재하지 않는 문의입니다.</p>'; return; }
  box.innerHTML = `
    <div class="post">
      <p class="post-date">${LABEL.inquiryCategory[res.category] || res.category}${res.order_id ? ` · 주문번호 ${res.order_id}` : ''}</p>
      <h3>${res.title}</h3>
      <p class="post-date">${res.created_at}</p>
      <div class="post-body">${res.content}</div>
      ${res.attachment ? `<p>첨부파일: <a href="${res.attachment}" target="_blank">${res.attachment.split('/').pop()}</a></p>` : ''}
      <div class="answer">${res.answer ? `<b>답변</b><div class="pre-wrap">${res.answer}</div>` : '아직 답변이 등록되지 않았습니다.'}</div>
      <a class="btn" href="inquiry.jsp">목록</a>
    </div>`;
}

async function showWrite() {
  // 관련 주문 선택용으로 최근 주문 불러오기
  const orders = await api.getOrders({ period: '3M', page: 1 });
  const orderOptions = (orders.orders || [])
    .map((o) => `<option value="${o.order_id}">${o.order_id} · ${o.product_name}</option>`).join('');

  box.innerHTML = `
    <form id="write-form" class="form">
      <label>문의 유형<select name="category" required>${optionsHtml(LABEL.inquiryCategory)}</select></label>
      <label>관련 주문 (선택)<select name="order_id"><option value="">선택 안 함</option>${orderOptions}</select></label>
      <label>제목<input name="title" maxlength="50" required></label>
      <label>내용<textarea name="content" rows="8" maxlength="2000" required></textarea></label>
      <label>첨부파일 (jpg, png, pdf / 5MB 이하)<input type="file" name="attachment" accept=".jpg,.jpeg,.png,.pdf"></label>
      <div class="btn-row"><a class="btn" href="inquiry.jsp">취소</a><button class="btn btn-primary" type="submit">등록</button></div>
    </form>`;

  document.getElementById('write-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);           // 폼 전체를 multipart로 (파일 포함)
    if (!fd.get('order_id')) fd.delete('order_id');
    if (!fd.get('attachment').name) fd.delete('attachment');
    if (!assertOk(await api.createInquiry(fd), '문의를 등록하지 못했습니다.')) return;
    alert('문의가 등록되었습니다.');
    location.href = 'inquiry.jsp';
  };
}

if (qs('mode') === 'write') showWrite();
else if (inquiryId) showDetail();
else showList();
