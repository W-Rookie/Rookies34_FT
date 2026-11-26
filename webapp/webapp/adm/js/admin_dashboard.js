const API_BASE = "/api/admin";

const OPTION_LABELS = {
    BUYER: "구매자",
    SELLER: "판매자",
    ACTIVE: "정상",
    SUSPENDED: "정지",
    WITHDRAWN: "탈퇴",
    APPROVE: "승인",
    REJECT: "반려",
    HIDE: "숨김",
    BEST: "베스트",
    SALE: "세일",
    NEW: "신상",
    BENEFIT: "특가",
    PAID: "결제 완료",
    SHIPPING: "배송 중",
    DELIVERED: "배송 완료",
    CANCELED: "취소",
    AMOUNT: "금액 할인",
    PERCENT: "비율 할인",
    ALL: "전체 회원",
    USERS: "지정 회원",
    CODE: "쿠폰 코드",
    NOTICE: "공지사항",
    FAQ: "자주 묻는 질문",
    MEMBER: "회원",
    ORDER: "주문",
    DELIVERY: "배송",
    CANCEL: "취소·환불",
    COUPON: "쿠폰",
    ETC: "기타"
};

const field = (name, label, options = {}) => ({ name, label, ...options });
const number = (name, label, options = {}) =>
    field(name, label, { type: "number", ...options });
const choice = (name, label, choices, options = {}) =>
    field(name, label, { choices: choices.split(" "), ...options });
const action = (label, method, path, fields) => ({ label, method, path, fields });

const optional = { required: false };
const id = (name, label) => number(name, label, { min: 1, path: true });
const decision = () => choice("decision", "처리", "APPROVE REJECT");

const menus = {
    users: [
        action("회원 목록 조회·검색", "GET", "/users", [
            field("keyword", "아이디 또는 이름", optional),
            choice("role", "회원 구분", "BUYER SELLER", optional),
            choice("status", "현재 상태", "ACTIVE SUSPENDED WITHDRAWN", optional),
            number("page", "페이지", { ...optional, min: 1 })
        ]),
        action("회원 상태 변경", "PATCH", "/users/{userId}/status", [
            id("userId", "회원 ID"),
            choice("status", "변경할 상태", "ACTIVE SUSPENDED"),
            field("memo", "사유", { ...optional, maxLength: 200 })
        ])
    ],
    sellers: [
        action("입점 신청 승인·반려", "PATCH", "/sellers/{sellerId}/approval", [
            id("sellerId", "판매자 ID"),
            decision(),
            field("reject_reason", "반려 사유", { when: ["decision", "REJECT"] })
        ])
    ],
    products: [
        action("상품 승인·반려·숨김", "PATCH", "/products/{productId}/approval", [
            id("productId", "상품 ID"),
            choice("decision", "처리", "APPROVE REJECT HIDE"),
            field("reject_reason", "반려 사유", {
                ...optional,
                when: ["decision", "REJECT"]
            })
        ])
    ],
    catalog: [
        action("카테고리 등록", "POST", "/categories", [
            field("name", "카테고리명", { maxLength: 20 }),
            number("parent_id", "상위 카테고리 ID", { ...optional, min: 1 }),
            number("sort_order", "노출 순서", optional)
        ]),
        // A-06 카테고리 수정 (기술명세서: 수정 부분 API 누락 → 추가)
        action("카테고리 수정", "PUT", "/categories/{categoryId}", [
            id("categoryId", "카테고리 ID"),
            field("name", "카테고리명", { maxLength: 20 }),
            number("parent_id", "상위 카테고리 ID", { ...optional, min: 1 }),
            number("sort_order", "노출 순서", optional)
        ]),
        action("베스트·세일·신상·특가 상품 지정", "PUT", "/curations", [
            choice("list_type", "목록 종류", "BEST SALE NEW BENEFIT"),
            field("product_ids", "상품 ID 목록 (쉼표로 구분)", { type: "ids" })
        ])
    ],
    orders: [
        action("전체 주문 조회", "GET", "/orders", [
            field("date_from", "시작일", { ...optional, type: "date" }),
            field("date_to", "종료일", { ...optional, type: "date" }),
            choice("status", "주문 상태", "PAID SHIPPING DELIVERED CANCELED", optional),
            number("seller_id", "판매자 ID", { ...optional, min: 1 }),
            number("page", "페이지", { ...optional, min: 1 })
        ])
    ],
    settlements: [
        action("수수료율 설정", "PATCH", "/sellers/{sellerId}/commission-rate", [
            id("sellerId", "판매자 ID"),
            number("commission_rate", "수수료율 (예: 15%는 0.15)", {
                min: 0, max: 1, step: 0.01
            })
        ]),
        action("정산 확정·반려", "PATCH", "/settlements/{settlementId}", [
            id("settlementId", "정산 ID"),
            decision()
        ]),
        action("출금 승인·반려", "PATCH", "/withdrawals/{withdrawalId}", [
            id("withdrawalId", "출금 신청 ID"),
            decision()
        ])
    ],
    coupons: [
        action("쿠폰 생성·발급", "POST", "/coupons", [
            field("coupon_name", "쿠폰명", { maxLength: 30 }),
            choice("discount_type", "할인 방식", "AMOUNT PERCENT"),
            number("discount_value", "할인 값 (금액은 원, 비율은 1~100)"),
            number("min_order_amount", "최소 주문 금액", { ...optional, min: 0 }),
            field("valid_from", "사용 시작일", { type: "date" }),
            field("valid_to", "사용 종료일", { type: "date" }),
            choice("target", "발급 대상", "ALL USERS CODE"),
            field("target_user_ids", "대상 회원 ID 목록 (쉼표로 구분)", {
                type: "ids", when: ["target", "USERS"]
            }),
            field("coupon_code", "쿠폰 코드", { when: ["target", "CODE"] })
        ])
    ],
    inquiries: [
        action("문의 답변 등록", "POST", "/inquiries/{inquiryId}/answer", [
            id("inquiryId", "문의 ID"),
            field("answer", "답변 내용", { type: "textarea", maxLength: 2000 })
        ])
    ],
    posts: [
        action("공지사항·FAQ 작성", "POST", "/posts", [
            choice("board_type", "게시판", "NOTICE FAQ"),
            field("title", "제목 또는 질문", { maxLength: 100 }),
            field("content", "내용 또는 답변", { type: "textarea" }),
            choice("faq_category", "FAQ 분류", "MEMBER ORDER DELIVERY CANCEL COUPON ETC", {
                when: ["board_type", "FAQ"]
            }),
            field("is_pinned", "상단 고정", { type: "checkbox" })
        ])
    ]
};

const menuButtons = document.querySelectorAll("#admin-menu button[data-menu]");
const title = document.querySelector("#section-title");
const actionSelect = document.querySelector("#action-select");
const form = document.querySelector("#admin-form");
const fields = document.querySelector("#form-fields");
const message = document.querySelector("#preview-message");
const preview = document.querySelector("#request-preview");

let selectedActions = [];
let selectedAction;
let inputs = [];

function selectMenu(button) {
    menuButtons.forEach(function (menuButton) {
        menuButton.setAttribute("aria-pressed", String(menuButton === button));
    });

    title.textContent = button.textContent.trim();
    selectedActions = menus[button.dataset.menu];

    actionSelect.replaceChildren();
    selectedActions.forEach(function (item, index) {
        actionSelect.add(new Option(item.label, String(index)));
    });

    renderForm();
}

function createInput(spec) {
    const row = document.createElement("div");
    const label = document.createElement("label");
    const tag = spec.choices ? "select" : spec.type === "textarea" ? "textarea" : "input";
    const control = document.createElement(tag);

    control.id = `field-${spec.name}`;
    control.name = spec.name;
    label.htmlFor = control.id;
    label.textContent = spec.label;

    if (spec.choices) {
        const emptyLabel = spec.required === false ? "전체" : "선택해 주세요";
        control.add(new Option(emptyLabel, ""));
        spec.choices.forEach(function (value) {
            control.add(new Option(OPTION_LABELS[value] ?? value, value));
        });
    } else if (tag === "input") {
        control.type = spec.type === "ids" ? "text" : (spec.type || "text");
        if (spec.type === "ids") {
            control.placeholder = "9001, 9002";
        }
    }

    control.required = spec.type !== "checkbox" && spec.required !== false;

    for (const attribute of ["min", "max", "step", "maxLength"]) {
        if (spec[attribute] !== undefined) {
            control[attribute] = spec[attribute];
        }
    }

    row.append(label, " ", control);
    fields.append(row);

    return { spec, control, row };
}

function renderForm() {
    selectedAction = selectedActions[Number(actionSelect.value)];
    fields.replaceChildren();
    inputs = selectedAction.fields.map(createInput);
    updateConditionalFields();
}

function updateConditionalFields() {
    for (const { spec, control, row } of inputs) {
        if (!spec.when) continue;

        const [parentName, expectedValue] = spec.when;
        const visible = form.elements.namedItem(parentName).value === expectedValue;
        row.hidden = !visible;
        control.disabled = !visible;
    }

    message.textContent = "";
    preview.hidden = true;
}

function readValue(spec, control) {
    if (spec.type === "checkbox") return control.checked;

    const value = control.value.trim();

    if (value === "") {
        if (control.required) throw new Error(`${spec.label}을(를) 입력해 주세요.`);
        return undefined;
    }

    if (spec.type === "number") return Number(value);

    if (spec.type === "ids") {
        const parts = value.split(",").map(part => part.trim());
        const ids = parts.map(Number);

        if (parts.some(part => !/^\d+$/.test(part)) ||
            ids.some(value => !Number.isSafeInteger(value) || value < 1)) {
            throw new Error(`${spec.label}에 양의 정수 ID를 쉼표로 구분해 입력해 주세요.`);
        }

        return ids;
    }

    return value;
}

function buildRequestPreview() {
    let path = API_BASE + selectedAction.path;
    const data = {};

    for (const { spec, control } of inputs) {
        if (control.disabled) continue;

        const value = readValue(spec, control);
        if (value === undefined) continue;

        if (spec.path) {
            path = path.replace(`{${spec.name}}`, encodeURIComponent(String(value)));
        } else {
            data[spec.name] = value;
        }
    }

    if (data.date_from && data.date_to && data.date_to < data.date_from) {
        throw new Error("종료일은 시작일 이후로 선택해 주세요.");
    }

    if (data.valid_from && data.valid_to && data.valid_to < data.valid_from) {
        throw new Error("쿠폰 사용 종료일을 확인해 주세요.");
    }

    if (data.discount_type === "PERCENT" &&
        (data.discount_value < 1 || data.discount_value > 100)) {
        throw new Error("퍼센트 할인 값은 1~100으로 입력해 주세요.");
    }

    if (selectedAction.method === "GET") {
        const query = new URLSearchParams(data).toString();
        return query ? `GET ${path}?${query}` : `GET ${path}`;
    }

    return `${selectedAction.method} ${path}\n\n${JSON.stringify(data, null, 2)}`;
}

menuButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectMenu(button);
    });
});

actionSelect.addEventListener("change", renderForm);
form.addEventListener("input", updateConditionalFields);
form.addEventListener("change", updateConditionalFields);

form.addEventListener("submit", function (event) {
    event.preventDefault();
    preview.hidden = true;

    try {
        preview.textContent = buildRequestPreview();
        preview.hidden = false;
        message.textContent = "미리보기입니다. 서버에 전송하지 않았습니다.";
    } catch (error) {
        message.textContent = error.message;
    }
});

selectMenu(menuButtons[0]);
document.querySelector("#preview-button").disabled = false;

const logoutButton = document.querySelector("#logout-button");

logoutButton.addEventListener("click", function () {
    // A-14 관리자 로그아웃: 11/25 협의에 따라 토큰 삭제로 구현 (로그아웃 API 추가는 어려움)
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("adminName");

    window.location.replace(logoutButton.dataset.loginUrl);
});
