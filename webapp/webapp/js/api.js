// =====================================================
// api.js — 백엔드 연동 규격서(일반 사용자 영역) 1:1 대응
// 백엔드 개발 완료 전: USE_MOCK = true (mock.js의 가짜 응답 사용)
// 백엔드 연결 시: USE_MOCK = false 로만 바꾸면 됨
// =====================================================
const USE_MOCK = false;

// 공통 요청 함수
//   query: 쿼리스트링 객체, body: JSON 본문, form: FormData(multipart)
async function request(method, path, { query, body, form } = {}) {
  // 빈 값은 쿼리에서 제외
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const qsStr = params.toString() ? `?${params}` : '';

  if (USE_MOCK) {
    const mres = await mockRequest(method, path, query || {}, body || formToObject(form));
    if (mres && mres.__status === 401) return handleUnauthorized();
    return mres;
  }

  const headers = {};
  const token = auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form; // Content-Type은 브라우저가 boundary 포함해서 자동 설정
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  // guest_cart_token 쿠키는 같은 도메인(Apache 프록시)이라 자동 전송됨
  const res = await fetch(`/api${path}${qsStr}`, { method, headers, body: payload });

  // [협의 필요] 토큰 만료/미인증 시 응답 형식이 규격서에 없음 → 401로 가정
  if (res.status === 401) return handleUnauthorized();
  try {
    return await res.json();
  } catch {
    return { code: 'no' };
  }
}

// 토큰 없음·만료 → 로그인 페이지로 (로그인 후 원래 페이지로 복귀)
function handleUnauthorized() {
  auth.clear();
  alert('로그인이 필요합니다.');
  const back = encodeURIComponent(location.pathname.split('/').pop() + location.search);
  location.href = `login.jsp?redirect=${back}`;
  return { code: 'no' };
}

function formToObject(form) {
  if (!form) return undefined;
  const obj = {};
  for (const [k, v] of form.entries()) {
    if (k in obj) obj[k] = [].concat(obj[k], v); // 같은 이름이 여러 개면 배열로
    else obj[k] = v;
  }
  return obj;
}

const enc = encodeURIComponent;

const api = {
  // ---------- 회원 (U-01 ~ U-15) ----------
  login: (login_id, password) => request('POST', '/auth/login', { body: { login_id, password } }),
  // 11/25 협의: 로그아웃은 토큰 삭제로 구현 (서버 호출 없음) → logout API 함수 제거

  // [확인 필요] 규격서 시트는 /api/auth/check-id, 목록 시트·샘플은 /api/users/check-id
  // 11/25 협의: /api/auth/check-id 로 확정. 판매자·일반 사용자 구분 없이 한 API (서버가 두 테이블 모두 조회)
  checkId: (login_id) => request('GET', '/auth/check-id', { query: { login_id } }),
  signup: (data) => request('POST', '/users', { body: data }),

  findIdSendSms: (name, phone) => request('POST', '/auth/find-id/sms', { body: { name, phone } }),
  findIdVerifySms: (name, phone, verify_code) => request('POST', '/auth/find-id/sms/verify', { body: { name, phone, verify_code } }),
  findIdSendEmail: (name, email) => request('POST', '/auth/find-id/email', { body: { name, email } }),
  findIdVerifyEmail: (name, email, verify_code) => request('POST', '/auth/find-id/email/verify', { body: { name, email, verify_code } }),

  pwSendSms: (login_id, name, phone) => request('POST', '/auth/password-reset/sms', { body: { login_id, name, phone } }),
  pwVerifySms: (login_id, phone, verify_code) => request('POST', '/auth/password-reset/sms/verify', { body: { login_id, phone, verify_code } }),
  pwSendEmail: (login_id, name, email) => request('POST', '/auth/password-reset/email', { body: { login_id, name, email } }),
  pwVerifyEmail: (login_id, email, verify_code) => request('POST', '/auth/password-reset/email/verify', { body: { login_id, email, verify_code } }),
  pwReset: (reset_token, new_password) => request('PUT', '/auth/password-reset', { body: { reset_token, new_password } }),

  // ---------- 상품 (U-20 ~ U-25) ----------
  // list_type: CATEGORY | BEST | SALE | NEW | BENEFIT, sort: RECOMMEND | NEW | PRICE_ASC | PRICE_DESC
  getProducts: ({ list_type, category_id, sort, page }) =>
    request('GET', '/products', { query: { list_type, category_id, sort, page } }),
  searchProducts: ({ keyword, sort, page }) =>
    request('GET', '/products/search', { query: { keyword, sort, page } }),
  getProduct: (id) => request('GET', `/products/${enc(id)}`),
  getReviews: (id, page) => request('GET', `/products/${enc(id)}/reviews`, { query: { page } }),
  // [추가] U-26 상품 문의 목록 (10개씩, 작성 시간순). 남의 비밀글은 서버가 content를 비워서 줌
  getProductInquiries: (id, page) => request('GET', `/products/${enc(id)}/inquiries`, { query: { page } }),
  createProductInquiry: (id, { title, content, is_secret }) =>
    request('POST', `/products/${enc(id)}/inquiries`, { body: { title, content, is_secret } }),

  // ---------- 장바구니 (U-23, U-30 ~ U-34) ----------
  getCart: () => request('GET', '/cart'),
  addCartItem: (product_id, quantity, option_id) =>
    request('POST', '/cart/items', { body: { product_id, quantity, option_id } }),
  updateCartItem: (cartItemId, quantity) => request('PATCH', `/cart/items/${enc(cartItemId)}`, { body: { quantity } }),
  deleteCartItems: (cart_item_ids) => request('DELETE', '/cart/items', { body: { cart_item_ids } }),
  // U-33 11/25 협의: 비로그인 주소 직접 입력 삭제 → 저장된 배송지(address_id)만 보냄 (화면은 미구현)
  setCartAddress: (address_id) => request('PUT', '/cart/shipping-address', { body: { address_id } }),
  // [변경] U-34 비회원 장바구니 병합: 추후 구현 예정 → mergeCart 제거 (장바구니는 로그인 필수)

  // ---------- 주문 (U-35 ~ U-43) ----------
  checkout: (cart_item_ids) => request('POST', '/orders/checkout', { body: { cart_item_ids } }),
  createOrder: (data) => request('POST', '/orders', { body: data }),
  getOrders: ({ period, keyword, page }) => request('GET', '/orders', { query: { period, keyword, page } }),
  getOrder: (orderId) => request('GET', `/orders/${enc(orderId)}`),
  createClaim: (orderId, formData) => request('POST', `/orders/${enc(orderId)}/claims`, { form: formData }),
  getClaims: (page) => request('GET', '/me/claims', { query: { page } }),

  // ---------- 마이페이지 (U-44 ~ U-57) ----------
  getFrequentProducts: (page) => request('GET', '/me/frequent-products', { query: { page } }),
  getCoupons: (status) => request('GET', '/me/coupons', { query: { status } }),
  // [변경] U-47 쿠폰 코드 등록 삭제 (쿠폰은 관리자만 발급)
  getPoints: (type, page) => request('GET', '/me/points', { query: { type, page } }),
  getMyProductInquiries: (page) => request('GET', '/me/product-inquiries', { query: { page } }),
  addAddress: (data) => request('POST', '/me/addresses', { body: data }),
  updateAddress: (addressId, data) => request('PUT', `/me/addresses/${enc(addressId)}`, { body: data }),
  deleteAddress: (addressId) => request('DELETE', `/me/addresses/${enc(addressId)}`),
  updateMe: (data) => request('PUT', '/me', { body: data }),
  changePassword: (current_password, new_password) =>
    request('PUT', '/me/password', { body: { current_password, new_password } }),

  createReview: (formData) => request('POST', '/reviews', { form: formData }),
  // [변경] U-51 후기 수정, U-52 후기 삭제 삭제 (후기는 작성만 가능)

  // ---------- 고객센터 (U-60 ~ U-63) ----------
  getNotices: (page) => request('GET', '/notices', { query: { page } }),
  getNotice: (id) => request('GET', `/notices/${enc(id)}`),
  getFaqs: (category, page) => request('GET', '/faqs', { query: { category, page } }),
  createInquiry: (formData) => request('POST', '/inquiries', { form: formData }),
  getInquiries: (page) => request('GET', '/inquiries', { query: { page } }),
  getInquiry: (id) => request('GET', `/inquiries/${enc(id)}`),

  // ---------- [추가] 기술명세서 U-27, U-58, U-59, U-64, U-65 ----------
  getCategories: () => request('GET', '/categories'),                   // U-27 카테고리 목록
  getMe: () => request('GET', '/me'),                                   // U-58 내 정보 (회원정보 기존값, 헤더 이름)
  getAddresses: () => request('GET', '/me/addresses'),                  // U-59 배송지 목록
  getMyReviews: (page) => request('GET', '/me/reviews', { query: { page } }),                   // U-64 작성한 후기
  getWritableReviews: (page) => request('GET', '/me/reviews/writable', { query: { page } }),    // U-65 작성 가능한 후기
};
