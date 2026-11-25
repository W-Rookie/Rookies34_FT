// =====================================================
// api.js — 백엔드 연동 규격서(일반 사용자 영역) 1:1 대응
// 백엔드 개발 완료 전: USE_MOCK = true (mock.js의 가짜 응답 사용)
// 백엔드 연결 시: USE_MOCK = false 로만 바꾸면 됨
// =====================================================
const USE_MOCK = true;

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
    return mockRequest(method, path, query || {}, body || formToObject(form));
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
  if (res.status === 401) {
    auth.clear();
    alert('로그인이 필요합니다.');
    location.href = 'login.jsp';
    return { code: 'no' };
  }
  try {
    return await res.json();
  } catch {
    return { code: 'no' };
  }
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
  logout: () => request('POST', '/auth/logout'),
  // [확인 필요] 규격서 시트는 /api/auth/check-id, 목록 시트·샘플은 /api/users/check-id
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
  createProductInquiry: (id, { title, content, is_secret }) =>
    request('POST', `/products/${enc(id)}/inquiries`, { body: { title, content, is_secret } }),

  // ---------- 장바구니 (U-23, U-30 ~ U-34) ----------
  getCart: () => request('GET', '/cart'),
  addCartItem: (product_id, quantity, option_id) =>
    request('POST', '/cart/items', { body: { product_id, quantity, option_id } }),
  updateCartItem: (cartItemId, quantity) => request('PATCH', `/cart/items/${enc(cartItemId)}`, { body: { quantity } }),
  deleteCartItems: (cart_item_ids) => request('DELETE', '/cart/items', { body: { cart_item_ids } }),
  setCartAddress: (data) => request('PUT', '/cart/shipping-address', { body: data }),
  mergeCart: () => request('POST', '/cart/merge'),

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
  registerCoupon: (coupon_code) => request('POST', '/me/coupons', { body: { coupon_code } }),
  getPoints: (type, page) => request('GET', '/me/points', { query: { type, page } }),
  getMyProductInquiries: (page) => request('GET', '/me/product-inquiries', { query: { page } }),
  addAddress: (data) => request('POST', '/me/addresses', { body: data }),
  updateAddress: (addressId, data) => request('PUT', `/me/addresses/${enc(addressId)}`, { body: data }),
  deleteAddress: (addressId) => request('DELETE', `/me/addresses/${enc(addressId)}`),
  updateMe: (data) => request('PUT', '/me', { body: data }),
  changePassword: (current_password, new_password) =>
    request('PUT', '/me/password', { body: { current_password, new_password } }),

  createReview: (formData) => request('POST', '/reviews', { form: formData }),
  updateReview: (reviewId, rating, content) => request('PUT', `/reviews/${enc(reviewId)}`, { body: { rating, content } }),
  deleteReview: (reviewId) => request('DELETE', `/reviews/${enc(reviewId)}`),

  // ---------- 고객센터 (U-60 ~ U-63) ----------
  getNotices: (page) => request('GET', '/notices', { query: { page } }),
  getNotice: (id) => request('GET', `/notices/${enc(id)}`),
  getFaqs: (category, page) => request('GET', '/faqs', { query: { category, page } }),
  createInquiry: (formData) => request('POST', '/inquiries', { form: formData }),
  getInquiries: (page) => request('GET', '/inquiries', { query: { page } }),
  getInquiry: (id) => request('GET', `/inquiries/${enc(id)}`),

  // ---------- [규격서 없음 — 백엔드에 추가 요청 필요] ----------
  // 화면 구성에 꼭 필요해서 프론트에서 가정한 API. 응답 형식은 mock.js 참고
  getMe: () => request('GET', '/me'),                                   // 회원 정보 관리 기존값
  getAddresses: () => request('GET', '/me/addresses'),                  // 배송지 관리 목록
  getMyReviews: (page) => request('GET', '/me/reviews', { query: { page } }), // 내가 쓴 후기
};
