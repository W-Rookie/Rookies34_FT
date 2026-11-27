// =====================================================
// common.js — 모든 페이지가 같이 쓰는 도구 모음
// 로드 순서: common.js → mock.js → api.js → header.js → pages/xxx.js
// =====================================================

// ---------- 출력 보안 ----------
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

// 할인가 계산
// 화면 표시용. 실제 결제 금액은 서버가 다시 계산함.
// [협의 필요] 원 단위 절사/반올림 규칙 — 일단 절사
function salePrice(price, rate) {
  return Math.floor(
    Number(price) * (100 - Number(rate || 0)) / 100
  );
}

// URL 쿼리값 읽기: qs('id') → '5063110'
function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

// =====================================
// 로그인 상태 (JWT)
// =====================================

const TOKEN_KEY = 'access_token';

const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

// 로그인이 필요한 페이지 맨 위에서 호출
function goLogin() {
  const back = encodeURIComponent(
    location.pathname.split('/').pop() + location.search
  );

  location.href = `login.jsp?redirect=${back}`;
}

function requireLogin() {
  if (!auth.isLoggedIn()) {
    goLogin();

    // 아래 코드 실행 중단
    throw new Error('login required');
  }
}

function safeRedirect(target) {
  return target || 'index.jsp';
}

// =====================================
// 공통 UI
// =====================================

const PLACEHOLDER = 'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="#eee"/></svg>'
  );

function imgTag(src, alt) {
  return `<img src="${src || PLACEHOLDER}" alt="${alt}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">`;
}

// 상품 카드
// 목록 응답: product_id, name, price, discount_rate, thumbnail
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

// =====================================
// 공통 페이지네이션
// « ‹ 1 2 3 4 5 › »
//
// 상품 목록: 페이지당 20건
// 후기·상품 문의: 페이지당 10건
//
// 전체 페이지를 모두 표시하지 않고
// 현재 페이지 기준 최대 5개만 표시
// =====================================

const PAGE_SIZE = 20;
const SMALL_PAGE_SIZE = 10;

function renderPagination(
  el,
  currentPage,
  totalCount,
  onMove,
  pageSize = PAGE_SIZE
) {
  // 기존 페이지 버튼 제거
  el.replaceChildren();

  // 전체 페이지 수 계산
  const totalPages = Math.max(
    1,
    Math.ceil(Number(totalCount || 0) / pageSize)
  );

  // 기존과 동일하게 1페이지만 있으면 숨김
  if (totalPages <= 1) {
    return;
  }

  // 현재 페이지 보정
  const current = Math.max(
    1,
    Math.min(Number(currentPage) || 1, totalPages)
  );

  // =====================================
  // 현재 페이지 중심 최대 5개 번호
  // =====================================

  const startPage = Math.max(
    1,
    Math.min(current - 2, totalPages - 4)
  );

  const endPage = Math.min(
    totalPages,
    startPage + 4
  );

  // =====================================
  // 페이지 버튼 생성 공통 함수
  // =====================================

  function addButton(
    text,
    targetPage,
    className,
    disabled,
    active,
    ariaLabel
  ) {
    const btn = document.createElement('button');

    btn.type = 'button';
    btn.textContent = text;
    btn.className = className;
    btn.disabled = disabled;

    btn.setAttribute('aria-label', ariaLabel);

    // 현재 페이지 표시
    if (active) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    }

    // 페이지 이동
    if (!disabled) {
      btn.addEventListener('click', function () {
        onMove(targetPage);
      });
    }

    el.appendChild(btn);
  }

  const isFirst = current === 1;
  const isLast = current === totalPages;

  // =====================================
  // « 첫 페이지
  // =====================================

  addButton(
    '«',
    1,
    'nav-btn',
    isFirst,
    false,
    '첫 페이지'
  );

  // =====================================
  // ‹ 이전 페이지
  // =====================================

  addButton(
    '‹',
    current - 1,
    'nav-btn',
    isFirst,
    false,
    '이전 페이지'
  );

  // =====================================
  // 페이지 번호 (최대 5개)
  // =====================================

  for (let p = startPage; p <= endPage; p++) {
    addButton(
      String(p),
      p,
      'page-btn',
      p === current,
      p === current,
      p + '페이지'
    );
  }

  // =====================================
  // › 다음 페이지
  // =====================================

  addButton(
    '›',
    current + 1,
    'nav-btn',
    isLast,
    false,
    '다음 페이지'
  );

  // =====================================
  // » 마지막 페이지
  // =====================================

  addButton(
    '»',
    totalPages,
    'nav-btn',
    isLast,
    false,
    '마지막 페이지'
  );
}

// =====================================
// 응답 결과 확인
// =====================================

// 응답 code가 ok가 아니면 알림
// 규격서: "ok" / "no"
function assertOk(res, failMessage) {
  if (!res || res.code !== 'ok') {
    alert(failMessage || '요청을 처리하지 못했습니다.');
    return false;
  }

  return true;
}

// =====================================
// 코드값 → 한글 라벨
// =====================================

const LABEL = {
  // WAITING:
  // 취소·반품·교환 신청이 접수됐지만
  // 아직 처리되지 않은 주문상품 상태
  orderStatus: {
    PAID: '결제완료',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    CANCELED: '취소',
    WAITING: '신청 처리중'
  },

  payment: {
    CARD: '신용카드',
    BANK_TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌'
  },

  storage: {
    ROOM: '상온',
    COLD: '냉장',
    FROZEN: '냉동'
  },

  listType: {
    BEST: '베스트',
    NEW: '신상품',
    SALE: '알뜰쇼핑',
    BENEFIT: '특가/혜택',
    CATEGORY: '카테고리'
  },

  couponStatus: {
    AVAILABLE: '사용 가능',
    USED: '사용 완료',
    EXPIRED: '기간 만료'
  },

  pointType: {
    POINT: '적립금',
    CASH: '컬리캐시'
  },

  requestType: {
    CANCEL: '취소',
    RETURN: '반품',
    EXCHANGE: '교환'
  },

  reasonType: {
    CHANGE_MIND: '단순 변심',
    DEFECT: '상품 불량',
    WRONG_ITEM: '오배송',
    DELAY: '배송 지연',
    ETC: '기타'
  },

  claimStatus: {
    REQUESTED: '접수',
    COMPLETED: '처리 완료',
    REJECTED: '반려'
  },

  faqCategory: {
    MEMBER: '회원',
    ORDER: '주문/결제',
    DELIVERY: '배송',
    CANCEL: '취소/교환/반품',
    COUPON: '쿠폰/적립금',
    ETC: '기타'
  },

  inquiryCategory: {
    ORDER: '주문/결제',
    DELIVERY: '배송',
    CANCEL: '취소/교환/반품',
    MEMBER: '회원',
    ETC: '기타'
  },

  gender: {
    MALE: '남자',
    FEMALE: '여자',
    NONE: '선택안함'
  }
};

// =====================================
// 취소·반품·교환 신청 가능 상태
// =====================================

// 결제완료 → 취소 가능
// 배송완료 → 반품·교환 가능
// 배송중·취소·신청 처리중 → 신청 불가
//
// 화면에서만 거르는 규칙
// 서버에서도 동일하게 검증하는지는 별도 확인 필요

const CLAIMABLE = {
  PAID: ['CANCEL'],
  DELIVERED: ['RETURN', 'EXCHANGE']
};

// 상태값 대소문자 통일
const normStatus = (s) =>
  (s ? String(s).toUpperCase() : s);

// =====================================
// U-27 카테고리 기본값
// =====================================

// 카테고리 API가 실패하거나 비어 있을 때 사용
const CATEGORIES = [
  { id: 901, name: '채소' },
  { id: 902, name: '과일·견과·쌀' },
  { id: 903, name: '수산·해산·건어물' },
  { id: 904, name: '정육·가공육·달걀' },
  { id: 905, name: '국·반찬·메인요리' },
  { id: 906, name: '유제품' },
  { id: 907, name: '친환경' }
];

// =====================================
// 마이페이지 왼쪽 메뉴
// =====================================

function renderMypageNav() {
  const el = document.getElementById('mypage-nav');

  if (!el) return;

  const menus = [
    ['mypage-orders.jsp', '주문 내역'],
    ['mypage-claims.jsp', '취소·반품·교환 내역'],
    ['mypage-frequent.jsp', '자주 구매'],
    ['mypage-coupons.jsp', '쿠폰'],
    ['mypage-points.jsp', '적립금·캐시'],
    ['mypage-reviews.jsp', '후기'],
    ['mypage-inquiries.jsp', '상품 문의'],
    ['mypage-addresses.jsp', '배송지 관리'],
    ['mypage-profile.jsp', '회원 정보 관리']
  ];

  const now = location.pathname.split('/').pop();

  el.innerHTML = '<h3>마이컬리</h3>' +
    menus.map(([href, name]) =>
      `<a href="${href}" class="${href === now ? 'active' : ''}">${name}</a>`
    ).join('');
}

// =====================================
// 탭 버튼
// =====================================

// renderTabs(el, {값: '라벨'}, 현재값, 클릭시함수)
function renderTabs(el, options, current, onSelect) {
  el.innerHTML = Object.entries(options)
    .map(([value, label]) =>
      `<button type="button" class="tab ${value === current ? 'active' : ''}" data-value="${value}">${label}</button>`
    )
    .join('');

  el.onclick = (e) => {
    const v = e.target.dataset.value;

    if (v === undefined) return;

    el.querySelectorAll('.tab').forEach((t) =>
      t.classList.toggle('active', t === e.target)
    );

    onSelect(v);
  };
}

// =====================================
// select 옵션 생성
// =====================================

function optionsHtml(options, selected) {
  return Object.entries(options)
    .map(([v, label]) =>
      `<option value="${v}" ${v === selected ? 'selected' : ''}>${label}</option>`
    )
    .join('');
}