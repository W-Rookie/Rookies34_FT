// =====================================================
// common.js — 모든 페이지가 같이 쓰는 도구 모음
// 로드 순서: common.js → mock.js → api.js → header.js → pages/xxx.js
// =====================================================

// ---------- 출력 보안 (조치 단계에서 사용할 함수 — 현재는 호출하는 곳 없음) ----------
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ---------- 포맷 ----------
function won(n) {
  return Number(n || 0).toLocaleString('ko-KR') + '원';
}

// 할인가 계산 (화면 표시용. 실제 결제 금액은 서버가 다시 계산함)
// [협의 필요] 원 단위 절사/반올림 규칙 — 일단 절사
function salePrice(price, rate) {
  return Math.floor(Number(price) * (100 - Number(rate || 0)) / 100);
}

// URL 쿼리값 읽기: qs('id') → '5063110'
function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

// ---------- 로그인 상태 (JWT) ----------
// 규격서: 로그인 응답의 token을 Authorization: Bearer 헤더로 전송
const TOKEN_KEY = 'access_token';
const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

// 로그인 필요한 페이지 맨 위에서 호출
function requireLogin() {
  if (!auth.isLoggedIn()) {
    const back = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    location.href = `login.jsp?redirect=${back}`;
    throw new Error('login required'); // 아래 코드 실행 중단
  }
}

function safeRedirect(target) {
  return target || 'index.jsp';
}

// ---------- 공통 UI ----------
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="#eee"/></svg>'
);

function imgTag(src, alt) {
  return `<img src="${src || PLACEHOLDER}" alt="${alt}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">`;
}

// 상품 카드 (목록 응답: product_id, name, price, discount_rate, thumbnail)
function productCard(p) {
  const rate = Number(p.discount_rate) || 0;
  return `
    <a class="card" href="product.jsp?id=${encodeURIComponent(p.product_id)}">
      <div class="card-img">${imgTag(p.thumbnail, p.name)}</div>
      <p class="card-name">${p.name}</p>
      <p class="card-price">
        ${rate > 0 ? `<span class="rate">${rate}%</span>` : ''}
        <b>${won(salePrice(p.price, rate))}</b>
        ${rate > 0 ? `<del>${won(p.price)}</del>` : ''}
      </p>
    </a>`;
}

function renderProductGrid(el, products) {
  el.innerHTML = products.length
    ? products.map(productCard).join('')
    : '<p class="empty">상품이 없습니다.</p>';
}

// 페이지네이션 — 응답의 num(총 개수)으로 계산
// [협의 필요] 규격서에 페이지 크기(size)가 없음. 일단 20개로 가정
const PAGE_SIZE = 20;
function renderPagination(el, currentPage, totalCount, onMove) {
  const last = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  if (last === 1) { el.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= last; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  el.innerHTML = html;
  el.onclick = (e) => {
    const p = e.target.dataset.page;
    if (p) onMove(Number(p));
  };
}

// 응답 code가 ok가 아니면 알림 (규격서: "ok" / "no")
function assertOk(res, failMessage) {
  if (!res || res.code !== 'ok') {
    alert(failMessage || '요청을 처리하지 못했습니다.');
    return false;
  }
  return true;
}

// ---------- 코드값 → 한글 라벨 ----------
const LABEL = {
  orderStatus: { PAID: '결제완료', SHIPPING: '배송중', DELIVERED: '배송완료', CANCELED: '취소' },
  payment: { CARD: '신용카드', BANK_TRANSFER: '계좌이체', VIRTUAL_ACCOUNT: '가상계좌' },
  storage: { ROOM: '상온', COLD: '냉장', FROZEN: '냉동' },
  listType: { BEST: '베스트', NEW: '신상품', SALE: '알뜰쇼핑', BENEFIT: '특가/혜택', CATEGORY: '카테고리' },
  couponStatus: { AVAILABLE: '사용 가능', USED: '사용 완료', EXPIRED: '기간 만료' },
  pointType: { POINT: '적립금', CASH: '컬리캐시' },
  requestType: { CANCEL: '취소', RETURN: '반품', EXCHANGE: '교환' },
  reasonType: { CHANGE_MIND: '단순 변심', DEFECT: '상품 불량', WRONG_ITEM: '오배송', DELAY: '배송 지연', ETC: '기타' },
  claimStatus: { REQUESTED: '접수', COMPLETED: '처리 완료', REJECTED: '반려' },
  faqCategory: { MEMBER: '회원', ORDER: '주문/결제', DELIVERY: '배송', CANCEL: '취소/교환/반품', COUPON: '쿠폰/적립금', ETC: '기타' },
  inquiryCategory: { ORDER: '주문/결제', DELIVERY: '배송', CANCEL: '취소/교환/반품', MEMBER: '회원', ETC: '기타' },
  gender: { MALE: '남자', FEMALE: '여자', NONE: '선택안함' },
};

// [협의 필요] 카테고리 목록 조회 API가 규격서에 없음 → 임시 하드코딩
const CATEGORIES = [
  { id: 901, name: '채소' },
  { id: 902, name: '과일·견과·쌀' },
  { id: 903, name: '수산·해산·건어물' },
  { id: 904, name: '정육·가공육·달걀' },
  { id: 905, name: '국·반찬·메인요리' },
  { id: 906, name: '유제품' },
  { id: 907, name: '친환경' },
];

// 마이페이지 왼쪽 메뉴 (사이트맵 '마이컬리' 기준)
function renderMypageNav() {
  const el = document.getElementById('mypage-nav');
  if (!el) return;
  const menus = [
    ['mypage-orders.jsp', '주문 내역'], ['mypage-claims.jsp', '취소·반품·교환 내역'],
    ['mypage-frequent.jsp', '자주 구매'],
    ['mypage-coupons.jsp', '쿠폰'], ['mypage-points.jsp', '적립금·캐시'],
    ['mypage-reviews.jsp', '후기'],
    ['mypage-inquiries.jsp', '상품 문의'], ['mypage-addresses.jsp', '배송지 관리'],
    ['mypage-profile.jsp', '회원 정보 관리'],
  ];
  const now = location.pathname.split('/').pop();
  el.innerHTML = '<h3>마이컬리</h3>' + menus
    .map(([href, name]) => `<a href="${href}" class="${href === now ? 'active' : ''}">${name}</a>`)
    .join('');
}

// 탭 버튼 그리기: renderTabs(el, {값: '라벨'}, 현재값, 클릭시함수)
function renderTabs(el, options, current, onSelect) {
  el.innerHTML = Object.entries(options)
    .map(([value, label]) => `<button type="button" class="tab ${value === current ? 'active' : ''}" data-value="${value}">${label}</button>`)
    .join('');
  el.onclick = (e) => {
    const v = e.target.dataset.value;
    if (v === undefined) return;
    el.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === e.target));
    onSelect(v);
  };
}

// <select>용 옵션 만들기
function optionsHtml(options, selected) {
  return Object.entries(options)
    .map(([v, label]) => `<option value="${v}" ${v === selected ? 'selected' : ''}>${label}</option>`)
    .join('');
}
