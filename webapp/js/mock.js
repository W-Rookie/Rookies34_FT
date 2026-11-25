// =====================================================
// mock.js — 백엔드 완성 전 가짜 응답 (규격서 응답 형식 그대로)
// 장바구니·주문은 localStorage에 저장해서 페이지 이동해도 유지됨
// 테스트 계정: 아무 아이디 / 비밀번호 (비밀번호 'wrong'이면 실패)
// 쿠폰 코드: WELCOME2026 이면 등록 성공 / 현재 비밀번호 'wrong'이면 회원정보 수정 실패
// 인증번호: 123456 이면 성공
// 백엔드 연결 후에는 이 파일을 HTML에서 빼도 됨
// =====================================================
const MOCK_PRODUCTS = [
  { product_id: 5063110, name: '[푸른농장] 유기농 시금치 200g', category_id: 907, price: 3500, discount_rate: 10, tags: ['BEST', 'SALE'], stock: 100, storage_type: 'COLD', origin: '국산' },
  { product_id: 5063111, name: '[한라농원] 제주 감귤 3kg', category_id: 902, price: 19900, discount_rate: 20, tags: ['BEST', 'SALE', 'BENEFIT'], stock: 40, storage_type: 'ROOM', origin: '국산(제주)' },
  { product_id: 5063112, name: '[횡성축산] 1등급 한우 등심 300g', category_id: 904, price: 45000, discount_rate: 0, tags: ['BEST', 'NEW'], stock: 15, storage_type: 'COLD', origin: '국산(한우)' },
  { product_id: 5063113, name: '[바다수산] 노르웨이 생연어 400g', category_id: 903, price: 21900, discount_rate: 0, tags: ['NEW'], stock: 30, storage_type: 'COLD', origin: '노르웨이' },
  { product_id: 5063114, name: '[초록농장] 무농약 방울토마토 500g', category_id: 901, price: 6900, discount_rate: 15, tags: ['NEW', 'SALE'], stock: 80, storage_type: 'COLD', origin: '국산' },
  { product_id: 5063115, name: '[행복양계] 동물복지 유정란 15구', category_id: 904, price: 8900, discount_rate: 0, tags: ['BEST'], stock: 60, storage_type: 'COLD', origin: '국산' },
  { product_id: 5063116, name: '[성주과수원] 꿀참외 2kg', category_id: 902, price: 24900, discount_rate: 25, tags: ['SALE', 'BENEFIT'], stock: 0, storage_type: 'ROOM', origin: '국산(성주)' },
  { product_id: 5063117, name: '[목장우유] 저온살균 우유 900ml', category_id: 906, price: 3200, discount_rate: 0, tags: ['NEW'], stock: 200, storage_type: 'COLD', origin: '국산' },
  { product_id: 5063118, name: '[바다수산] 손질 고등어 2팩', category_id: 903, price: 9900, discount_rate: 30, tags: ['SALE'], stock: 50, storage_type: 'FROZEN', origin: '국산' },
];

const MOCK_ADDRESSES = [
  { address_id: 31, recipient_name: '홍길동', recipient_phone: '01012345678', zipcode: '06236', address: '서울시 강남구 테헤란로 1', address_detail: '101동 101호', is_default: true },
  { address_id: 32, recipient_name: '홍길동', recipient_phone: '01012345678', zipcode: '04620', address: '서울시 중구 필동로1길 30', address_detail: '신공학관', is_default: false },
];

const MOCK_COUPONS = [
  { coupon_id: 7, coupon_name: '첫구매 2천원', discount_type: 'AMOUNT', discount_value: 2000, min_order_amount: 10000, valid_from: '2026-11-01', valid_to: '2026-12-31', status: 'AVAILABLE' },
  { coupon_id: 8, coupon_name: '신선식품 10%', discount_type: 'PERCENT', discount_value: 10, min_order_amount: 20000, valid_from: '2026-11-01', valid_to: '2026-12-31', status: 'AVAILABLE' },
];

const store = {
  get: (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const addrList = () => store.get('mock_addresses', MOCK_ADDRESSES);
const nowStr = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// 후기·취소 테스트용 "배송완료" 주문 1건을 처음 한 번만 넣어둠
if (!localStorage.getItem('mock_seeded')) {
  store.set('mock_orders', [{ order_id: 'ORD20261120001', ordered_at: '2026-11-20 10:00:00', status: 'DELIVERED',
    payment_method: 'BANK_TRANSFER', total_amount: 24850, recipient_name: '홍길동', recipient_phone: '01012345678',
    zipcode: '06236', address: '서울시 강남구 테헤란로 1', address_detail: '101동 101호', delivery_request: '',
    items: [{ order_item_id: 1, product_id: 5063111, name: '[한라농원] 제주 감귤 3kg', quantity: 1, price: 15920 },
            { order_item_id: 2, product_id: 5063115, name: '[행복양계] 동물복지 유정란 15구', quantity: 1, price: 8900 }] }]);
  localStorage.setItem('mock_seeded', '1');
}

function listShape(p) {
  const { product_id, name, category_id, price, discount_rate } = p;
  return { product_id, name, category_id, price, discount_rate, thumbnail: '' };
}

function sortAndPage(list, sort, page) {
  const arr = [...list];
  if (sort === 'PRICE_ASC') arr.sort((a, b) => salePrice(a.price, a.discount_rate) - salePrice(b.price, b.discount_rate));
  if (sort === 'PRICE_DESC') arr.sort((a, b) => salePrice(b.price, b.discount_rate) - salePrice(a.price, a.discount_rate));
  if (sort === 'NEW') arr.reverse();
  const p = Number(page) || 1;
  return { code: 'ok', num: arr.length, products: arr.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE).map(listShape) };
}

function cartItems() {
  return store.get('mock_cart', []).map((c) => {
    const p = MOCK_PRODUCTS.find((x) => x.product_id === c.product_id);
    return { cart_item_id: c.cart_item_id, product_id: p.product_id, name: p.name, quantity: c.quantity, price: p.price, discount_rate: p.discount_rate, thumbnail: '' };
  });
}

const verifyOk = (code) => code === '123456';

// [메서드, 경로 정규식, 처리함수(쿼리, 본문, 경로매치)]
const MOCK_ROUTES = [
  ['POST', /^\/auth\/login$/, (q, b) => (b.password === 'wrong' ? { code: 'no' } : { code: 'user', token: 'mock.jwt.token' })],
  ['POST', /^\/auth\/logout$/, () => ({ code: 'ok' })],
  ['GET', /^\/auth\/check-id$/, (q) => ({ code: q.login_id === 'taken01' ? 'no' : 'ok' })],
  ['POST', /^\/users$/, () => ({ code: 'ok' })],
  ['POST', /^\/auth\/find-id\/(sms|email)$/, () => ({ code: 'ok' })],
  ['POST', /^\/auth\/find-id\/(sms|email)\/verify$/, (q, b) => (verifyOk(b.verify_code) ? { code: 'ok', id: 'fresh*****01' } : { code: 'no' })],
  ['POST', /^\/auth\/password-reset\/(sms|email)$/, () => ({ code: 'ok' })],
  ['POST', /^\/auth\/password-reset\/(sms|email)\/verify$/, (q, b) => (verifyOk(b.verify_code) ? { code: 'ok', reset_token: 'mock.reset.token' } : { code: 'no' })],
  ['PUT', /^\/auth\/password-reset$/, () => ({ code: 'ok' })],

  ['GET', /^\/products$/, (q) => {
    const list = q.list_type === 'CATEGORY'
      ? MOCK_PRODUCTS.filter((p) => p.category_id === Number(q.category_id))
      : MOCK_PRODUCTS.filter((p) => p.tags.includes(q.list_type));
    return sortAndPage(list, q.sort, q.page);
  }],
  ['GET', /^\/products\/search$/, (q) => sortAndPage(MOCK_PRODUCTS.filter((p) => p.name.includes(q.keyword || '')), q.sort, q.page)],
  ['GET', /^\/products\/(\d+)$/, (q, b, m) => {
    const p = MOCK_PRODUCTS.find((x) => x.product_id === Number(m[1]));
    if (!p) return { code: 'no' };
    return { code: 'ok', ...listShape(p), stock: p.stock, storage_type: p.storage_type, origin: p.origin,
      description: `${p.name}\n산지에서 바로 보내드리는 신선한 상품입니다.\n받으신 후 바로 냉장 보관해 주세요.`, detail_images: [] };
  }],
  ['GET', /^\/products\/\d+\/reviews$/, () => ({ code: 'ok', num: 2, reviews: [
    { review_id: 301, rating: 5, content: '신선하고 맛있어요. 재구매 의사 있습니다.', images: [], writer: 'fres*****01', created_at: '2026-11-23 14:00:00' },
    { review_id: 302, rating: 4, content: '포장이 <b>꼼꼼해서</b> 좋았어요.', images: [], writer: 'test*****02', created_at: '2026-11-22 09:30:00' },
  ] })],
  ['POST', /^\/products\/\d+\/inquiries$/, () => ({ code: 'ok' })],

  ['GET', /^\/cart$/, () => { const items = cartItems(); return { code: 'ok', num: items.length, items }; }],
  ['POST', /^\/cart\/items$/, (q, b) => {
    const cart = store.get('mock_cart', []);
    const found = cart.find((c) => c.product_id === Number(b.product_id));
    if (found) found.quantity = Math.min(99, found.quantity + Number(b.quantity));
    else cart.push({ cart_item_id: Date.now(), product_id: Number(b.product_id), quantity: Number(b.quantity) });
    store.set('mock_cart', cart);
    return { code: 'ok' };
  }],
  ['PATCH', /^\/cart\/items\/(\d+)$/, (q, b, m) => {
    const cart = store.get('mock_cart', []);
    const item = cart.find((c) => c.cart_item_id === Number(m[1]));
    if (!item) return { code: 'no' };
    item.quantity = Number(b.quantity);
    store.set('mock_cart', cart);
    return { code: 'ok' };
  }],
  ['DELETE', /^\/cart\/items$/, (q, b) => {
    store.set('mock_cart', store.get('mock_cart', []).filter((c) => !b.cart_item_ids.includes(c.cart_item_id)));
    return { code: 'ok' };
  }],
  ['PUT', /^\/cart\/shipping-address$/, () => ({ code: 'ok' })],
  ['POST', /^\/cart\/merge$/, () => ({ code: 'ok' })],

  ['POST', /^\/orders\/checkout$/, (q, b) => {
    const items = cartItems().filter((i) => b.cart_item_ids.includes(i.cart_item_id));
    const expected = items.reduce((s, i) => s + salePrice(i.price, i.discount_rate) * i.quantity, 0);
    return { code: 'ok', items, addresses: addrList(), coupons: MOCK_COUPONS, points: 3000, expected_amount: expected };
  }],
  ['POST', /^\/orders$/, (q, b) => {
    const items = cartItems().filter((i) => b.cart_item_ids.includes(i.cart_item_id));
    if (!items.length) return { code: 'no' };
    const addr = addrList().find((a) => a.address_id === Number(b.address_id)) || addrList()[0];
    const order_id = 'ORD' + Date.now();
    const total = items.reduce((s, i) => s + salePrice(i.price, i.discount_rate) * i.quantity, 0) - Number(b.use_points || 0);
    const orders = store.get('mock_orders', []);
    orders.unshift({ order_id, ordered_at: new Date().toISOString().slice(0, 19).replace('T', ' '), status: 'PAID',
      payment_method: b.payment_method, total_amount: Math.max(0, total), recipient_name: b.recipient_name,
      recipient_phone: b.recipient_phone, zipcode: addr.zipcode, address: addr.address, address_detail: addr.address_detail,
      delivery_request: b.delivery_request || '',
      items: items.map((i, idx) => ({ order_item_id: idx + 1, product_id: i.product_id, name: i.name, quantity: i.quantity, price: salePrice(i.price, i.discount_rate) })) });
    store.set('mock_orders', orders);
    store.set('mock_cart', store.get('mock_cart', []).filter((c) => !b.cart_item_ids.includes(c.cart_item_id)));
    return { code: 'ok', order_id };
  }],
  ['GET', /^\/orders$/, () => {
    const orders = store.get('mock_orders', []);
    return { code: 'ok', num: orders.length, orders: orders.map((o) => ({ order_id: o.order_id, ordered_at: o.ordered_at,
      product_name: o.items[0].name, item_count: o.items.length, total_amount: o.total_amount, status: o.status })) };
  }],
  ['GET', /^\/orders\/([\w-]+)$/, (q, b, m) => {
    const o = store.get('mock_orders', []).find((x) => x.order_id === m[1]);
    return o ? { code: 'ok', ...o } : { code: 'no' };
  }],

  ['GET', /^\/notices$/, () => ({ code: 'ok', num: 3, notices: [
    { notice_id: 3, title: '[필독] 설 연휴 배송 일정 안내', is_pinned: true, created_at: '2026-11-20 10:00:00' },
    { notice_id: 2, title: '개인정보 처리방침 개정 안내', is_pinned: false, created_at: '2026-11-15 10:00:00' },
    { notice_id: 1, title: '신선마켓 오픈 안내', is_pinned: false, created_at: '2026-11-01 10:00:00' },
  ] })],
  ['GET', /^\/notices\/(\d+)$/, (q, b, m) => ({ code: 'ok', notice_id: Number(m[1]), title: '공지사항 상세 예시', is_pinned: false,
    content: '공지 본문 예시입니다.\n줄바꿈이 그대로 보여야 합니다.', created_at: '2026-11-20 10:00:00' })],
  // ---------- 고객센터 ----------
  ['GET', /^\/faqs$/, (q) => {
    const all = [
      { faq_id: 1, faq_category: 'DELIVERY', title: '샛별배송 지역은 어디인가요?', content: '서울·경기·인천 일부 지역에서 이용 가능합니다.' },
      { faq_id: 2, faq_category: 'ORDER', title: '주문 후 결제수단을 바꿀 수 있나요?', content: '결제 완료 후에는 변경할 수 없습니다.\n주문 취소 후 다시 주문해 주세요.' },
      { faq_id: 3, faq_category: 'CANCEL', title: '반품은 언제까지 가능한가요?', content: '신선식품은 <b>수령 당일</b> 사진과 함께 접수해 주세요.' },
      { faq_id: 4, faq_category: 'MEMBER', title: '아이디를 잊어버렸어요.', content: '로그인 화면의 아이디 찾기를 이용해 주세요.' },
      { faq_id: 5, faq_category: 'COUPON', title: '쿠폰은 어디서 등록하나요?', content: '마이컬리 > 쿠폰에서 쿠폰 코드를 입력해 주세요.' },
    ];
    const list = q.category ? all.filter((x) => x.faq_category === q.category) : all;
    return { code: 'ok', num: list.length, faqs: list };
  }],
  ['GET', /^\/inquiries$/, () => {
    const list = store.get('mock_inquiries', []);
    return { code: 'ok', num: list.length, inquiries: list.map(({ inquiry_id, category, title, is_answered, created_at }) => ({ inquiry_id, category, title, is_answered, created_at })) };
  }],
  ['GET', /^\/inquiries\/(\d+)$/, (q, b, m) => {
    const i = store.get('mock_inquiries', []).find((x) => x.inquiry_id === Number(m[1]));
    return i ? { code: 'ok', ...i } : { code: 'no' };
  }],
  ['POST', /^\/inquiries$/, (q, b) => {
    const list = store.get('mock_inquiries', []);
    const id = list.length + 1;
    const file = b.attachment && b.attachment.name ? `/uploads/inquiry/${b.attachment.name}` : null;
    list.unshift({ inquiry_id: id, category: b.category, order_id: b.order_id || null, title: b.title, content: b.content,
      attachment: file, answer: null, is_answered: false, created_at: nowStr() });
    store.set('mock_inquiries', list);
    return { code: 'ok' };
  }],

  // ---------- 마이페이지 ----------
  ['GET', /^\/me\/coupons$/, (q) => {
    const all = [...MOCK_COUPONS, ...store.get('mock_coupons', []),
      { coupon_id: 3, coupon_name: '가입 축하 3천원', discount_type: 'AMOUNT', discount_value: 3000, min_order_amount: 15000, valid_from: '2026-10-01', valid_to: '2026-10-31', status: 'EXPIRED' }];
    const list = q.status ? all.filter((c) => c.status === q.status) : all;
    return { code: 'ok', num: list.length, coupons: list };
  }],
  ['POST', /^\/me\/coupons$/, (q, b) => {
    if (b.coupon_code !== 'WELCOME2026') return { code: 'no' };
    store.set('mock_coupons', [{ coupon_id: 99, coupon_name: '웰컴 쿠폰 5천원', discount_type: 'AMOUNT', discount_value: 5000, min_order_amount: 30000, valid_from: '2026-11-24', valid_to: '2026-12-31', status: 'AVAILABLE' }]);
    return { code: 'ok' };
  }],
  ['GET', /^\/me\/points$/, (q) => {
    const all = [
      { type: 'POINT', amount: 3000, reason: '회원가입 적립', created_at: '2026-11-01 09:00:00' },
      { type: 'POINT', amount: 250, reason: '구매 적립 (ORD20261120001)', created_at: '2026-11-21 09:00:00' },
      { type: 'POINT', amount: -250, reason: '주문 사용', created_at: '2026-11-22 12:00:00' },
      { type: 'CASH', amount: 10000, reason: '컬리캐시 충전', created_at: '2026-11-10 18:00:00' },
    ];
    const type = q.type || 'POINT';
    const list = all.filter((h) => h.type === type);
    return { code: 'ok', balance: list.reduce((s, h) => s + h.amount, 0), num: list.length, histories: list };
  }],
  ['GET', /^\/me\/frequent-products$/, () => {
    const list = [MOCK_PRODUCTS[1], MOCK_PRODUCTS[5], MOCK_PRODUCTS[7]].map(listShape);
    return { code: 'ok', num: list.length, products: list };
  }],
  ['GET', /^\/me\/product-inquiries$/, () => ({ code: 'ok', num: 2, inquiries: [
    { inquiry_id: 11, product_id: 5063110, product_name: '[푸른농장] 유기농 시금치 200g', title: '세척해서 오나요?', is_secret: false, is_answered: true, created_at: '2026-11-21 10:00:00' },
    { inquiry_id: 12, product_id: 5063112, product_name: '[횡성축산] 1등급 한우 등심 300g', title: '선물 포장 되나요?', is_secret: true, is_answered: false, created_at: '2026-11-23 15:00:00' },
  ] })],
  ['GET', /^\/me\/claims$/, () => {
    const list = store.get('mock_claims', []);
    return { code: 'ok', num: list.length, claims: list };
  }],
  ['POST', /^\/orders\/([\w-]+)\/claims$/, (q, b, m) => {
    const list = store.get('mock_claims', []);
    list.unshift({ claim_id: list.length + 1, order_id: m[1], request_type: b.request_type, reason_type: b.reason_type, status: 'REQUESTED', created_at: nowStr() });
    store.set('mock_claims', list);
    return { code: 'ok' };
  }],
  ['GET', /^\/me\/addresses$/, () => ({ code: 'ok', num: addrList().length, addresses: addrList() })],
  ['POST', /^\/me\/addresses$/, (q, b) => {
    let list = addrList();
    if (b.is_default) list = list.map((a) => ({ ...a, is_default: false }));
    list.push({ ...b, address_id: Date.now(), is_default: !!b.is_default });
    store.set('mock_addresses', list);
    return { code: 'ok' };
  }],
  ['PUT', /^\/me\/addresses\/(\d+)$/, (q, b, m) => {
    let list = addrList();
    if (b.is_default) list = list.map((a) => ({ ...a, is_default: false }));
    list = list.map((a) => (a.address_id === Number(m[1]) ? { ...a, ...b, address_id: a.address_id } : a));
    store.set('mock_addresses', list);
    return { code: 'ok' };
  }],
  ['DELETE', /^\/me\/addresses\/(\d+)$/, (q, b, m) => {
    store.set('mock_addresses', addrList().filter((a) => a.address_id !== Number(m[1])));
    return { code: 'ok' };
  }],
  ['GET', /^\/me$/, () => ({ code: 'ok', ...store.get('mock_me', { login_id: 'fresh_user01', name: '홍길동', email: 'fresh@example.com', phone: '01012345678', gender: 'NONE', birth_date: '2000-01-01' }) })],
  ['PUT', /^\/me$/, (q, b) => {
    if (b.current_password === 'wrong') return { code: 'no' };
    const { current_password, ...rest } = b;
    store.set('mock_me', { login_id: 'fresh_user01', ...rest });
    return { code: 'ok' };
  }],
  ['PUT', /^\/me\/password$/, (q, b) => ({ code: b.current_password === 'wrong' ? 'no' : 'ok' })],
  ['GET', /^\/me\/reviews$/, () => {
    const list = store.get('mock_reviews', []);
    return { code: 'ok', num: list.length, reviews: list };
  }],
  ['POST', /^\/reviews$/, (q, b) => {
    const list = store.get('mock_reviews', []);
    const order = store.get('mock_orders', []).find((o) => o.items.some((i) => i.order_item_id === Number(b.order_item_id)));
    const item = order ? order.items.find((i) => i.order_item_id === Number(b.order_item_id)) : null;
    list.unshift({ review_id: Date.now(), order_item_id: Number(b.order_item_id), product_id: item ? item.product_id : null,
      product_name: item ? item.name : '', rating: Number(b.rating), content: b.content, images: [], created_at: nowStr() });
    store.set('mock_reviews', list);
    return { code: 'ok' };
  }],
  ['PUT', /^\/reviews\/(\d+)$/, (q, b, m) => {
    store.set('mock_reviews', store.get('mock_reviews', []).map((r) => (r.review_id === Number(m[1]) ? { ...r, rating: Number(b.rating), content: b.content } : r)));
    return { code: 'ok' };
  }],
  ['DELETE', /^\/reviews\/(\d+)$/, (q, b, m) => {
    store.set('mock_reviews', store.get('mock_reviews', []).filter((r) => r.review_id !== Number(m[1])));
    return { code: 'ok' };
  }],
];

async function mockRequest(method, path, query, body) {
  await new Promise((r) => setTimeout(r, 150)); // 네트워크 지연 흉내
  for (const [m, re, handler] of MOCK_ROUTES) {
    const match = path.match(re);
    if (m === method && match) {
      const res = handler(query, body || {}, match);
      console.log('[MOCK]', method, path, query, body, '→', res);
      return res;
    }
  }
  console.warn('[MOCK] 정의 안 된 API:', method, path);
  return { code: 'ok', num: 0 };
}
