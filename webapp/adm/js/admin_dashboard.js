const API_BASE = "/api/admin";

const OPTION_LABELS = {
    BUYER: "구매자",
    SELLER: "판매자",
    ACTIVE: "정상",
    SUSPENDED: "정지",
    WITHDRAWN: "탈퇴",
    PENDING: "승인 대기",
    APPROVED: "승인 완료",
    REJECTED: "반려",
    APPROVE: "승인",
    REJECT: "반려",
    HIDE: "숨김",
    BEST: "베스트",
    SALE: "세일",
    NEW: "신상",
    BENEFIT: "특가",
    PAID: "결제 완료",
    SHIPPING: "배송 중",
    COMPLETED: "완료",
    CANCELED: "취소",
    AMOUNT: "금액 할인",
    PERCENT: "비율 할인",
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
const action = (label, method, path, fields, implemented = false) =>
    ({ label, method, path, fields, implemented });

const optional = { required: false };
const id = (name, label) => number(name, label, { min: 1, path: true });
const decision = () => choice("decision", "처리", "APPROVE REJECT");

const menus = {
    users: [
        action("회원 목록 조회·검색", "GET", "/users", [
            field("keyword", "아이디 또는 이름", optional),
            choice("role", "회원 구분", "BUYER SELLER", optional),
            choice(
                "status",
                "현재 상태",
                "ACTIVE SUSPENDED WITHDRAWN PENDING APPROVED REJECTED",
                optional
            ),
            number("page", "페이지", { ...optional, min: 1 })
        ], true),
        action("회원 상태 변경", "PATCH", "/users/{userId}/status", [
            field("userId", "회원 ID", { path: true }),
            choice("status", "변경할 상태", "ACTIVE SUSPENDED"),
            field("memo", "사유", { ...optional, maxLength: 200 })
        ], true)
    ],
    sellers: [
        action("입점 신청 승인·반려", "PATCH", "/sellers/{sellerId}/approval", [
            field("sellerId", "판매자 ID", { path: true }),
            decision(),
            field("reject_reason", "반려 사유", {
                when: ["decision", "REJECT"]
            })
        ], true)
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
            number("parent_id", "상위 카테고리 ID", {
                ...optional,
                min: 1
            }),
            number("sort_order", "노출 순서", optional)
        ]),
        action("베스트·세일·신상·특가 상품 지정", "PUT", "/curations", [
            choice("list_type", "목록 종류", "BEST SALE NEW BENEFIT"),
            field("product_ids", "상품 ID 목록 (쉼표로 구분)", {
                type: "ids"
            })
        ])
    ],
    orders: [
        action("전체 주문 조회", "GET", "/orders", [
            field("date_from", "시작일", {
                ...optional,
                type: "date"
            }),
            field("date_to", "종료일", {
                ...optional,
                type: "date"
            }),
            choice(
                "status",
                "주문 상태",
                "PAID SHIPPING COMPLETED CANCELED",
                optional
            ),
            field("seller_id", "판매자 아이디", optional),
            number("page", "페이지", { ...optional, min: 1 })
        ], true)
    ],
    settlements: [
        action(
            "수수료율 설정",
            "PATCH",
            "/sellers/{sellerId}/commission-rate",
            [
                field("sellerId", "판매자 ID", { path: true }),
                number("commission_rate", "수수료율 (예: 15%는 0.15)", {
                    min: 0,
                    max: 1,
                    step: 0.01
                })
            ]
        ),
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
        action("쿠폰 생성", "POST", "/coupons", [
            field("coupon_name", "쿠폰명", { maxLength: 30 }),
            choice("discount_type", "할인 방식", "AMOUNT PERCENT"),
            number("discount_value", "할인 값 (금액은 원, 비율은 1~100)"),
            number("min_order_amount", "최소 주문 금액", {
                ...optional,
                min: 0
            }),
            field("valid_from", "사용 시작일", { type: "date" }),
            field("valid_to", "사용 종료일", { type: "date" })
        ], true),
        action("쿠폰 발급", "POST", "/coupons/{coupon_id}", [
            id("coupon_id", "쿠폰 ID"),
            field(
                "target_user_ids",
                "대상 회원 아이디 (쉼표로 구분)",
                { type: "stringList" }
            )
        ], true)
    ],
    inquiries: [
        action("문의 답변 등록", "POST", "/inquiries/{inquiryId}/answer", [
            id("inquiryId", "문의 ID"),
            field("answer", "답변 내용", {
                type: "textarea",
                maxLength: 2000
            })
        ])
    ],
    posts: [
        action("공지사항·FAQ 작성", "POST", "/posts", [
            choice("board_type", "게시판", "NOTICE FAQ"),
            field("title", "제목 또는 질문", { maxLength: 100 }),
            field("content", "내용 또는 답변", { type: "textarea" }),
            choice(
                "faq_category",
                "FAQ 분류",
                "MEMBER ORDER DELIVERY CANCEL COUPON ETC",
                { when: ["board_type", "FAQ"] }
            ),
            field("is_pinned", "상단 고정", { type: "checkbox" })
        ])
    ]
};

const menuButtons = document.querySelectorAll(
    "#admin-menu button[data-menu]"
);
const title = document.querySelector("#section-title");
const actionSelect = document.querySelector("#action-select");
const form = document.querySelector("#admin-form");
const fields = document.querySelector("#form-fields");
const message = document.querySelector("#preview-message");
const preview = document.querySelector("#request-preview");
const previewButton = document.querySelector("#preview-button");

const existingSendButton = document.querySelector("#send-button");
const sendButton = existingSendButton || document.createElement("button");

previewButton.type = "button";
sendButton.type = "button";
sendButton.id = "send-button";
sendButton.textContent = "서버에 요청";

if (!existingSendButton) {
    sendButton.style.cssText =
        "margin:16px 0 0 8px;padding:10px 14px;border:0;" +
        "border-radius:7px;background:#663399;color:#fff;" +
        "font:inherit;cursor:pointer";
    previewButton.insertAdjacentElement("afterend", sendButton);
}

let selectedActions = [];
let selectedAction;
let inputs = [];

function selectMenu(button) {
    menuButtons.forEach(function (menuButton) {
        menuButton.setAttribute(
            "aria-pressed",
            String(menuButton === button)
        );
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
    const tag = spec.choices
        ? "select"
        : spec.type === "textarea"
            ? "textarea"
            : "input";
    const control = document.createElement(tag);

    control.id = `field-${spec.name}`;
    control.name = spec.name;
    label.htmlFor = control.id;
    label.textContent = spec.label;

    if (spec.choices) {
        const emptyLabel =
            spec.required === false ? "전체" : "선택해 주세요";

        control.add(new Option(emptyLabel, ""));

        spec.choices.forEach(function (value) {
            control.add(
                new Option(OPTION_LABELS[value] ?? value, value)
            );
        });
    } else if (tag === "input") {
        control.type = ["ids", "stringList"].includes(spec.type)
            ? "text"
            : (spec.type || "text");

        if (spec.type === "ids") {
            control.placeholder = "9001, 9002";
        } else if (spec.type === "stringList") {
            control.placeholder = "fresh_user01, fresh_user02";
        }
    }

    control.required =
        spec.type !== "checkbox" && spec.required !== false;

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

    sendButton.disabled = !selectedAction.implemented;
    sendButton.style.opacity =
        selectedAction.implemented ? "1" : "0.5";
    sendButton.style.cursor =
        selectedAction.implemented ? "pointer" : "not-allowed";

    updateConditionalFields();
}

function updateConditionalFields() {
    for (const { spec, control, row } of inputs) {
        if (!spec.when) continue;

        const [parentName, expectedValue] = spec.when;
        const visible =
            form.elements.namedItem(parentName).value === expectedValue;

        row.hidden = !visible;
        control.disabled = !visible;
    }

    message.textContent = selectedAction.implemented
        ? ""
        : "백엔드 API가 아직 구현되지 않아 요청 미리보기만 가능합니다.";

    preview.hidden = true;
}

function readValue(spec, control) {
    if (spec.type === "checkbox") {
        return control.checked;
    }

    const value = control.value.trim();

    if (value === "") {
        if (control.required) {
            throw new Error(`${spec.label}을(를) 입력해 주세요.`);
        }
        return undefined;
    }

    if (spec.type === "number") {
        return Number(value);
    }

    if (spec.type === "ids") {
        const parts = value.split(",").map(part => part.trim());
        const ids = parts.map(Number);

        if (
            parts.some(part => !/^\d+$/.test(part)) ||
            ids.some(idValue =>
                !Number.isSafeInteger(idValue) || idValue < 1
            )
        ) {
            throw new Error(
                `${spec.label}에 양의 정수 ID를 쉼표로 구분해 입력해 주세요.`
            );
        }

        return ids;
    }

    if (spec.type === "stringList") {
        const values = value.split(",").map(part => part.trim());

        if (values.some(part => part === "")) {
            throw new Error(
                `${spec.label}을(를) 쉼표로 구분해 입력해 주세요.`
            );
        }

        return values;
    }

    return value;
}

function buildRequest() {
    let path = API_BASE + selectedAction.path;
    const data = {};

    for (const { spec, control } of inputs) {
        if (control.disabled) continue;

        const value = readValue(spec, control);
        if (value === undefined) continue;

        if (spec.path) {
            path = path.replace(
                `{${spec.name}}`,
                encodeURIComponent(String(value))
            );
        } else {
            data[spec.name] = value;
        }
    }

    if (
        data.date_from &&
        data.date_to &&
        data.date_to < data.date_from
    ) {
        throw new Error("종료일은 시작일 이후로 선택해 주세요.");
    }

    if (
        data.valid_from &&
        data.valid_to &&
        data.valid_to < data.valid_from
    ) {
        throw new Error("쿠폰 사용 종료일을 확인해 주세요.");
    }

    if (
        data.discount_type === "PERCENT" &&
        (data.discount_value < 1 || data.discount_value > 100)
    ) {
        throw new Error("퍼센트 할인 값은 1~100으로 입력해 주세요.");
    }

    if (selectedAction.method === "GET") {
        const query = new URLSearchParams(data).toString();

        return {
            method: "GET",
            url: query ? `${path}?${query}` : path
        };
    }

    return {
        method: selectedAction.method,
        url: path,
        body: data
    };
}

function formatRequest(request) {
    const lines = [
        `${request.method} ${request.url}`,
        "Authorization: Bearer <관리자 토큰>"
    ];

    if (request.body !== undefined) {
        lines.push(
            "Content-Type: application/json",
            "",
            JSON.stringify(request.body, null, 2)
        );
    }

    return lines.join("\n");
}

menuButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectMenu(button);
    });
});

actionSelect.addEventListener("change", renderForm);
form.addEventListener("input", updateConditionalFields);
form.addEventListener("change", updateConditionalFields);

function showPreview() {
    if (!form.reportValidity()) return;

    preview.hidden = true;

    try {
        preview.textContent = formatRequest(buildRequest());
        preview.hidden = false;
        message.textContent =
            "미리보기입니다. 서버에 전송하지 않았습니다.";
    } catch (error) {
        message.textContent = error.message;
    }
}

previewButton.addEventListener("click", showPreview);

form.addEventListener("submit", function (event) {
    event.preventDefault();
    showPreview();
});

sendButton.addEventListener("click", async function () {
    if (!selectedAction.implemented || !form.reportValidity()) {
        return;
    }

    let request;

    try {
        request = buildRequest();
    } catch (error) {
        message.textContent = error.message;
        return;
    }

    const token = sessionStorage.getItem("accessToken");

    if (!token) {
        message.textContent = "관리자 로그인이 필요합니다.";
        return;
    }

    if (
        request.method !== "GET" &&
        !window.confirm(`${selectedAction.label} 요청을 전송할까요?`)
    ) {
        return;
    }

    sendButton.disabled = true;
    preview.hidden = true;
    message.textContent = "서버에 요청 중...";

    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (request.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    try {
        const response = await fetch(request.url, {
            method: request.method,
            headers,
            body: request.body === undefined
                ? undefined
                : JSON.stringify(request.body)
        });

        const result = await response.json().catch(() => null);

        if (response.status === 401) {
            sessionStorage.removeItem("accessToken");
            window.location.replace("admin_login.jsp");
            return;
        }

        preview.textContent = JSON.stringify(result, null, 2);
        preview.hidden = false;

        if (!response.ok || result?.code !== "ok") {
            message.textContent =
                result?.message ||
                `요청에 실패했습니다. (${response.status})`;
            return;
        }

        message.textContent = "서버 요청이 완료되었습니다.";
    } catch (error) {
        message.textContent = "서버에 연결할 수 없습니다.";
    } finally {
        sendButton.disabled = !selectedAction.implemented;
    }
});

selectMenu(menuButtons[0]);
previewButton.disabled = false;

const logoutButton = document.querySelector("#logout-button");

logoutButton.addEventListener("click", function () {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("adminName");

    window.location.replace(logoutButton.dataset.loginUrl);
});