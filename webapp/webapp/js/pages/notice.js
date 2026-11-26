// 공지사항 — notice.jsp (목록) / notice.jsp?id=3 (상세)
// 고객센터 게시판형 화면의 기본 패턴 (FAQ, 1:1 문의 목록도 같은 구조)
const noticeId = qs('id');
const box = document.getElementById('notice-box');
let page = 1;

async function loadList() {
  const res = await api.getNotices(page);
  if (res.code !== 'ok') return;
  box.innerHTML = `
    <table class="board">
      <thead><tr><th>제목</th><th class="w-date">작성일</th></tr></thead>
      <tbody>${res.notices.map((n) => `
        <tr class="${n.is_pinned ? 'pinned' : ''}">
          <td><a href="notice.jsp?id=${encodeURIComponent(n.notice_id)}">${n.is_pinned ? '<span class="badge">공지</span>' : ''}${n.title}</a></td>
          <td>${n.created_at.slice(0, 10)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="pagination" id="pagination"></div>`;
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; loadList(); });
}

async function loadDetail() {
  const res = await api.getNotice(noticeId);
  if (res.code !== 'ok') { box.innerHTML = '<p class="empty">존재하지 않는 글입니다.</p>'; return; }
  box.innerHTML = `
    <div class="post">
      <h3>${res.title}</h3>
      <p class="post-date">${res.created_at}</p>
      <div class="post-body"></div>
      <a class="btn" href="notice.jsp">목록</a>
    </div>`;
  box.querySelector('.post-body').innerHTML = res.content; // 줄바꿈은 CSS pre-wrap
}

noticeId ? loadDetail() : loadList();
