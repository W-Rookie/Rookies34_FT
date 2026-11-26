/**
 * S-11/S-12 조회 API가 아직 없는 동안 사용하는 프론트 전용 샘플 데이터.
 * 서버 데이터가 아니며, 브라우저 localStorage에만 변경 내용이 저장된다.
 * 백엔드가 준비되면 USE_MOCK_LISTS = false로 전환하고, 응답 스키마를 확정한다.
 * 기존 S-02/S-06 등 실제 API 호출은 별도로 유지한다.
 */
const sellerMock = (function () {
  const USE_MOCK_LISTS = true;
  const PAGE_SIZE = 10; // 임시 구현: 백엔드 페이지 크기 확정 시 조정
  const STORAGE_PREFIX = "kurly_seller_sample_s11_s12_v2_";
  const STATUS_VALUES = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"];
  const PRODUCT_NAMES = [
    "친환경 사과 1kg", "국산 햇감자 2kg", "제철 방울토마토 500g", "무항생제 달걀 10구",
    "유기농 시금치 200g", "국산 애호박 1개", "손질 대파 300g", "국산 당근 1kg",
    "한우 국거리 300g", "냉장 닭가슴살 500g", "국산 양파 1kg", "햇 고구마 1.5kg",
    "국산 표고버섯 200g", "무농약 깻잎 30장", "생 블루베리 125g", "제주 감귤 1kg",
    "국산 새송이버섯 400g", "냉동 딸기 500g", "국산 두부 300g", "무농약 상추 150g",
    "국산 배 2입", "찰옥수수 4입", "국산 현미 2kg", "냉장 우유 900ml",
    "유기농 오이 2입", "국산 쌀 4kg"
  ];
  const QUESTION_TEXTS = [
    "배송은 보통 며칠 정도 걸리나요?", "유통기한이 얼마나 남아 있나요?",
    "냉장 보관해야 하나요?", "원산지가 어디인가요?", "상품을 나눠 포장할 수 있나요?",
    "품절된 상품은 언제 재입고되나요?", "알레르기 유발 성분이 있나요?",
    "선물 포장이 가능한가요?", "수령 후 어떻게 보관해야 하나요?",
    "제품의 중량에 포장재가 포함되나요?"
  ];

  function storageKey() {
    const loginId = (typeof api !== "undefined" && api.getLoginId && api.getLoginId()) || "preview";
    return STORAGE_PREFIX + encodeURIComponent(loginId);
  }
  function seed() {
    const products = PRODUCT_NAMES.map(function (name, i) {
      const id = 9001 + i;
      return {
        product_id: id,
        name: name,
        category_id: 907,
        price: 2900 + (i % 8) * 1800,
        discount_rate: i % 3 === 0 ? 10 : 0,
        stock: 12 + (i * 7) % 120,
        storage_type: i % 6 === 0 ? "COLD" : "ROOM",
        origin: "국산",
        description: name + "의 상품 상세 설명입니다. (화면 확인용 샘플)",
        thumbnail: "",
        status: STATUS_VALUES[i % STATUS_VALUES.length]
      };
    });
    const inquiries = Array.from({ length: 27 }, function (_, i) {
      const answered = i % 3 === 0;
      return {
        inquiry_id: 4101 + i,
        product_id: products[i % products.length].product_id,
        product_name: products[i % products.length].name,
        title: ["배송 문의", "보관 방법 문의", "상품 품질 문의", "원산지 문의", "재입고 문의"][i % 5],
        question: QUESTION_TEXTS[i % QUESTION_TEXTS.length],
        content: QUESTION_TEXTS[i % QUESTION_TEXTS.length] + " 자세한 안내 부탁드립니다.",
        writer: "구매자" + String(i + 1).padStart(2, "0") + "**",
        is_secret: i % 4 === 0,
        asked_at: "2026-11-" + String(24 - (i % 19)).padStart(2, "0"),
        is_answered: answered,
        answer: answered ? "문의해 주셔서 감사합니다. 상세 내용은 상품 안내를 확인해 주세요. (샘플 답변)" : ""
      };
    });
    return { products: products, inquiries: inquiries };
  }
  function load() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) {
        const value = JSON.parse(raw);
        if (value && Array.isArray(value.products) && Array.isArray(value.inquiries)) return value;
      }
    } catch (e) { /* 손상된 샘플 저장값은 초기 샘플로 복구 */ }
    return seed();
  }
  function save(data) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch (e) {
      throw new Error("브라우저에 샘플 변경 내용을 저장하지 못했습니다.");
    }
  }
  function paginate(items, page, key) {
    const p = Number(page);
    const safePage = Number.isInteger(p) && p > 0 ? p : 1;
    const start = (safePage - 1) * PAGE_SIZE;
    const result = { code: "ok", num: items.length, page: safePage, page_size: PAGE_SIZE, mock: true };
    result[key] = items.slice(start, start + PAGE_SIZE).map(function (item) { return Object.assign({}, item); });
    return result;
  }
  function listProducts(params) {
    const rows = load().products;
    const status = params && params.status;
    return paginate(status ? rows.filter(function (p) { return p.status === status; }) : rows, params && params.page, "products");
  }
  function listInquiries(params) {
    const rows = load().inquiries;
    const answered = params && params.is_answered;
    const filtered = answered === "true" || answered === true
      ? rows.filter(function (q) { return q.is_answered; })
      : answered === "false" || answered === false
        ? rows.filter(function (q) { return !q.is_answered; }) : rows;
    return paginate(filtered, params && params.page, "inquiries");
  }
  function getProduct(id) {
    return load().products.find(function (p) { return String(p.product_id) === String(id); }) || null;
  }
  function getInquiry(id) {
    return load().inquiries.find(function (q) { return String(q.inquiry_id) === String(id); }) || null;
  }
  function updateProduct(id, fields) {
    const state = load();
    const target = state.products.find(function (p) { return String(p.product_id) === String(id); });
    if (!target) throw new Error("해당 샘플 상품이 없습니다.");
    ["name", "category_id", "price", "discount_rate", "stock", "storage_type", "origin", "description"].forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) target[key] = fields[key];
    });
    save(state);
    return Object.assign({}, target);
  }
  function answerInquiry(id, answer) {
    const state = load();
    const target = state.inquiries.find(function (q) { return String(q.inquiry_id) === String(id); });
    if (!target) throw new Error("해당 샘플 문의가 없습니다.");
    if (target.is_answered) throw new Error("이미 답변이 등록된 문의입니다.");
    target.answer = answer;
    target.is_answered = true;
    save(state);
    return Object.assign({}, target);
  }
  function reset() { localStorage.removeItem(storageKey()); }
  return {
    useMockLists: USE_MOCK_LISTS,
    pageSize: PAGE_SIZE,
    listProducts: listProducts,
    listInquiries: listInquiries,
    getProduct: getProduct,
    getInquiry: getInquiry,
    updateProduct: updateProduct,
    answerInquiry: answerInquiry,
    reset: reset
  };
})();
