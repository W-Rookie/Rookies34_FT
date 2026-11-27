const API_BASE = "/api/admin";

const OPTION_LABELS = {
    BUYER: "구매자",
    SELLER: "판매자",
    ACTIVE: "정상",
    SUSPENDED: "정지",
    WITHDRAWN: "탈퇴",
    PENDING: "승인 대기",
    REQUESTED: "출금 신청",
    APPROVED: "승인 완료",
    REJECTED: "반려",
    APPROVE: "승인",
    REJECT: "반려",
    WITHDRAW: "철회",
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
const action = (label, method, path, fields, implemented = false, bodyFormat = "json", fixedBody = {}) =>
    ({ label, method, path, fields, implemented, bodyFormat, fixedBody });

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
            number("page", "페이지", { ...optional, min: 1, defaultValue: 1 })
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
        action("상품 목록 조회", "GET", "/products", [
            choice("status", "상품 상태", "PENDING APPROVED REJECTED WITHDRAWN", {
                ...optional,
                labels: {
                    PENDING: "승인 대기",
                    APPROVED: "승인 완료",
                    REJECTED: "반려",
                    WITHDRAWN: "철회됨"
                }
            }),
            number("page", "페이지", { ...optional, min: 1, defaultValue: 1 })
        ], true),
        action("상품 상세 조회", "GET", "/products/{productId}", [
            id("productId", "상품 ID")
        ], true),
        action("상품 승인", "PATCH", "/products/{productId}/approval", [
            id("productId", "상품 ID")
        ], true, "json", { decision: "APPROVE" }),
        action("상품 반려", "PATCH", "/products/{productId}/approval", [
            id("productId", "상품 ID")
        ], true, "json", { decision: "REJECT" }),
        action("상품 철회", "PATCH", "/products/{productId}/approval", [
            id("productId", "상품 ID")
        ], true, "json", { decision: "WITHDRAW" })
    ],
    catalog: [
        action("카테고리 목록 조회", "GET", "/api/categories", [], true),
        action("카테고리 등록", "POST", "/categories", [
            field("name", "카테고리명", { maxLength: 20 }),
            number("parent_id", "상위 카테고리 ID", {
                ...optional,
                min: 1
            })
        ], true),
        action("카테고리 수정", "PUT", "/categories/{categoryId}", [
            id("categoryId", "카테고리 ID"),
            field("name", "카테고리명", { maxLength: 20 }),
            number("parent_id", "상위 카테고리 ID", {
                ...optional,
                min: 1
            })
        ], true),
        action("베스트·세일·신상·특가 상품 지정·해제", "PUT", "/curations", [
            choice("curation", "지정할 목록", "BEST SALE NEW_ARRIVAL BENEFIT REMOVE", {
                labels: {
                    BEST: "베스트",
                    SALE: "세일",
                    NEW_ARRIVAL: "신상",
                    BENEFIT: "특가",
                    REMOVE: "지정 해제"
                }
            }),
            field("product_ids", "상품 ID 목록 (쉼표로 구분)", {
                type: "ids"
            })
        ], true)
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
                "주문 상품 상태",
                "PAID SHIPPING COMPLETED CANCELED",
                optional
            ),
            field("seller_id", "판매자 아이디", optional),
            number("page", "페이지", { ...optional, min: 1, defaultValue: 1 })
        ], true)
    ],
    settlements: [
        action("정산 내역 조회", "GET", "/settlements", [
            field("seller_id", "판매자 아이디", optional),
            choice("status", "정산 상태", "PENDING COMPLETED CANCELED", {
                ...optional,
                labels: {
                    PENDING: "보류 중",
                    COMPLETED: "완료됨",
                    CANCELED: "취소됨"
                }
            }),
            field("date_from", "시작일", { ...optional, type: "date" }),
            field("date_to", "종료일", { ...optional, type: "date" }),
            number("page", "페이지", { ...optional, min: 1, defaultValue: 1 })
        ], true),
        action("출금 신청 내역 조회", "GET", "/withdrawals", [
            field("seller_id", "판매자 아이디", optional),
            choice("status", "처리 상태", "REQUESTED APPROVED REJECTED", {
                ...optional,
                labels: {
                    REQUESTED: "요청됨",
                    APPROVED: "승인됨",
                    REJECTED: "거절됨"
                }
            }),
            field("date_from", "시작일", { ...optional, type: "date" }),
            field("date_to", "종료일", { ...optional, type: "date" }),
            number("page", "페이지", { ...optional, min: 1, defaultValue: 1 })
        ], true),
        action(
            "수수료율 설정",
            "PATCH",
            "/sellers/{sellerId}/commission-rate",
            [
                field("sellerId", "판매자 ID", { path: true }),
                number("commission_rate", "수수료율 (0~1, 예: 0.1 = 10%)", {
                    min: 0,
                    max: 1,
                    step: 0.0001
                })
            ],
            true
        ),
        action("정산 확정·반려", "PATCH", "/settlements/{settlementId}", [
            id("settlementId", "정산 ID"),
            choice("decision", "처리", "COMPLETED CANCELED", {
                labels: {
                    COMPLETED: "확정 (완료됨)",
                    CANCELED: "반려 (취소됨)"
                }
            })
        ], true),
        action("출금 승인·반려", "PATCH", "/withdrawals/{withdrawalId}", [
            id("withdrawalId", "출금 신청 ID"),
            choice("decision", "처리", "APPROVED REJECTED", {
                labels: {
                    APPROVED: "승인 (승인됨)",
                    REJECTED: "반려 (거절됨)"
                }
            })
        ], true)
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
        ], true)
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
        ], true)
    ]
};

const LIST_VIEWS = {
    "/api/categories": {
        key: "categories",
        columns: [
            ["카테고리 ID", "category_id"],
            ["카테고리명", "name"],
            ["상위 카테고리 ID", "parent_id"]
        ]
    },
    "/products": {
        key: "products",
        columns: [
            ["상품 ID", "product_id"],
            ["판매자 ID", "seller_id"],
            ["상품명", "name"],
            ["카테고리 ID", "category_id"],
            ["가격", "price", "money"],
            ["상태", "status", "productStatus"],
            ["등록일", "created_at"]
        ]
    },
    "/users": {
        key: "users",
        columns: [
            ["회원 ID", "user_id"],
            ["로그인 ID", "login_id"],
            ["이름", "name"],
            ["구분", "role", "status"],
            ["상태", "status", "status"],
            ["가입일", "created_at"]
        ]
    },
    "/orders": {
        key: "orders",
        columns: [
            ["주문 번호", "order_id"],
            ["주문일", "ordered_at"],
            ["구매자 ID", "buyer_login_id"],
            ["판매자 ID", "seller_id"],
            ["결제 금액", "total_amount", "money"]
        ]
    },
    "/settlements": {
        key: "revenues",
        columns: [
            ["정산 ID", "settlement_id"],
            ["판매자 ID", "seller_id"],
            ["주문 상품 ID", "order_item_id"],
            ["주문 금액", "order_amount", "money"],
            ["수수료", "commission", "money"],
            ["정산액", "settlement_amount", "money"],
            ["상태", "status", "settlementStatus"],
            ["주문일", "created_at"]
        ]
    },
    "/withdrawals": {
        key: "withdrawals",
        columns: [
            ["출금 신청 ID", "withdrawal_id"],
            ["판매자 ID", "seller_id"],
            ["출금 금액", "amount", "money"],
            ["상태", "status", "withdrawalStatus"],
            ["신청일", "requested_at"],
            ["처리일", "processed_at"]
        ]
    }
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
const listResults = document.createElement("section");
listResults.id = "admin-list-results";
listResults.hidden = true;
preview.before(listResults);

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
let selectedMenuName = "";
let inputs = [];
let queryVersion = 0;

function selectMenu(button) {
    selectedMenuName = button.dataset.menu;
    clearListResults();
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
                new Option(spec.labels?.[value] ?? OPTION_LABELS[value] ?? value, value)
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
        if (spec.defaultValue !== undefined) {
            control.value = String(spec.defaultValue);
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
    sendButton.textContent = selectedAction.method === "GET"
        ? "조회"
        : "서버에 요청";
    sendButton.style.opacity =
        selectedAction.implemented ? "1" : "0.5";
    sendButton.style.cursor =
        selectedAction.implemented ? "pointer" : "not-allowed";

    updateConditionalFields();
}

function updateConditionalFields() {
    queryVersion += 1;
    if (selectedMenuName !== "catalog") {
        clearListResults();
    }

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

function clearListResults() {
    listResults.replaceChildren();
    listResults.hidden = true;
}

function formatListValue(value, kind) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    if (kind === "status") {
        return OPTION_LABELS[value] ?? String(value);
    }
    if (kind === "productStatus") {
        return {
            PENDING: "승인 대기",
            APPROVED: "승인 완료",
            REJECTED: "반려",
            WITHDRAWN: "철회됨"
        }[value] ?? String(value);
    }
    if (kind === "settlementStatus") {
        return {
            PENDING: "보류 중",
            COMPLETED: "완료됨",
            CANCELED: "취소됨"
        }[value] ?? String(value);
    }
    if (kind === "withdrawalStatus") {
        return {
            REQUESTED: "요청됨",
            APPROVED: "승인됨",
            REJECTED: "거절됨"
        }[value] ?? String(value);
    }
    if (kind === "money") {
        const amount = Number(value);
        return Number.isFinite(amount)
            ? `${amount.toLocaleString("ko-KR")}원`
            : String(value);
    }
    return String(value);
}

function chooseAction(label, values = {}) {
    const index = selectedActions.findIndex(item => item.label === label);
    if (index < 0) return;

    actionSelect.value = String(index);
    renderForm();

    for (const [name, value] of Object.entries(values)) {
        const control = form.elements.namedItem(name);
        if (control) control.value = value == null ? "" : String(value);
    }
}

function orderCategories(items) {
    const byId = new Map(items.map(item => [String(item.category_id), item]));
    const children = new Map();
    const roots = [];
    const ordered = [];
    const visited = new Set();

    for (const item of items) {
        const parentId = item.parent_id == null ? null : String(item.parent_id);
        const itemId = String(item.category_id);
        if (parentId && byId.has(parentId) && parentId !== itemId) {
            if (!children.has(parentId)) children.set(parentId, []);
            children.get(parentId).push(item);
        } else {
            roots.push(item);
        }
    }

    function visit(item, depth) {
        const itemId = String(item.category_id);
        if (visited.has(itemId)) return;
        visited.add(itemId);
        ordered.push({ item, depth });
        for (const child of children.get(itemId) ?? []) {
            visit(child, depth + 1);
        }
    }

    roots.forEach(item => visit(item, 0));
    items.forEach(item => visit(item, 0));
    return ordered;
}

function renderListResults(result, requestedAction) {
    const view = LIST_VIEWS[requestedAction.path];
    const items = view && result?.[view.key];
    if (!Array.isArray(items)) {
        return false;
    }

    clearListResults();
    const heading = document.createElement("h3");
    heading.textContent = `${requestedAction.label} · 현재 페이지 ${items.length}건`;
    listResults.append(heading);

    if (requestedAction.path === "/api/categories") {
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "admin-list-action";
        addButton.textContent = "새 카테고리 등록";
        addButton.addEventListener("click", function () {
            chooseAction("카테고리 등록");
        });
        listResults.append(addButton);
    }

    const hasRowAction = ["/api/categories", "/products"].includes(requestedAction.path);

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "조회된 내역이 없습니다.";
        listResults.append(empty);
    } else {
        const scroll = document.createElement("div");
        scroll.className = "admin-list-scroll";
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const tbody = document.createElement("tbody");

        for (const [label] of view.columns) {
            const cell = document.createElement("th");
            cell.scope = "col";
            cell.textContent = label;
            headerRow.append(cell);
        }

        if (hasRowAction) {
            const cell = document.createElement("th");
            cell.scope = "col";
            cell.textContent = "작업";
            headerRow.append(cell);
        }
        thead.append(headerRow);

        const rows = requestedAction.path === "/api/categories"
            ? orderCategories(items)
            : items.map(item => ({ item, depth: 0 }));

        for (const { item, depth } of rows) {
            const row = document.createElement("tr");

            for (const [, key, kind] of view.columns) {
                const cell = document.createElement("td");
                cell.textContent = formatListValue(item?.[key], kind);

                if (requestedAction.path === "/api/categories" && key === "name") {
                    cell.style.paddingLeft = `${12 + depth * 20}px`;
                    if (depth > 0) cell.textContent = `↳ ${cell.textContent}`;
                }
                row.append(cell);
            }

            if (hasRowAction) {
                const cell = document.createElement("td");
                const button = document.createElement("button");
                button.type = "button";
                button.className = "admin-list-action";
                button.textContent = requestedAction.path === "/api/categories"
                    ? "수정"
                    : "상세";

                button.addEventListener("click", function () {
                    if (requestedAction.path === "/api/categories") {
                        chooseAction("카테고리 수정", {
                            categoryId: item.category_id,
                            name: item.name,
                            parent_id: item.parent_id
                        });
                    } else {
                        chooseAction("상품 상세 조회", { productId: item.product_id });
                        sendButton.click();
                    }
                });

                cell.append(button);
                row.append(cell);
            }
            tbody.append(row);
        }

        table.append(thead, tbody);
        scroll.append(table);
        listResults.append(scroll);
    }

    listResults.hidden = false;
    return true;
}

function renderProductDetail(result) {
    const product = result?.product;
    if (!product || typeof product !== "object") return false;

    clearListResults();

    const heading = document.createElement("h3");
    heading.textContent = `상품 상세 · ${product.product_id ?? ""}`;
    listResults.append(heading);

    const details = [
        ["상품명", "name"],
        ["판매자 ID", "seller_id"],
        ["상태", "status", "productStatus"],
        ["카테고리 ID", "category_id"],
        ["가격", "price", "money"],
        ["할인율", "discount_rate"],
        ["재고", "stock"],
        ["보관 방식", "storage_type"],
        ["원산지", "origin"],
        ["설명", "description"],
        ["대표 이미지", "thumbnail"],
        ["상세 이미지", "detail_images"],
        ["등록일", "created_at"]
    ];

    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    for (const [label, key, kind] of details) {
        const row = document.createElement("tr");
        const nameCell = document.createElement("th");
        nameCell.scope = "row";
        nameCell.textContent = label;

        const valueCell = document.createElement("td");
        valueCell.textContent = formatListValue(product[key], kind);
        valueCell.style.whiteSpace = "pre-wrap";

        row.append(nameCell, valueCell);
        tbody.append(row);
    }

    table.append(tbody);
    listResults.append(table);

    const imageUrls = [
        product.thumbnail,
        ...(Array.isArray(product.detail_images) ? product.detail_images : [])
    ].filter(Boolean);

    if (imageUrls.length > 0) {
        const gallery = document.createElement("div");
        gallery.className = "admin-product-gallery";

        imageUrls.forEach(function (url, index) {
            const image = document.createElement("img");
            image.src = url;
            image.alt = index === 0 ? "상품 대표 이미지" : `상품 상세 이미지 ${index}`;
            image.loading = "lazy";
            gallery.append(image);
        });

        listResults.append(gallery);
    }

    const actions = document.createElement("div");
    actions.className = "admin-detail-actions";

    for (const label of ["상품 승인", "상품 반려", "상품 철회"]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "admin-product-action";
        button.dataset.action = label === "상품 승인"
            ? "approve"
            : label === "상품 반려"
                ? "reject"
                : "withdraw";
        button.textContent = label;

        button.addEventListener("click", function () {
            chooseAction(label, { productId: product.product_id });
        });

        actions.append(button);
    }

    listResults.append(actions);
    listResults.hidden = false;
    return true;
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
    let path = selectedAction.path.startsWith("/api/")
        ? selectedAction.path
        : API_BASE + selectedAction.path;
    const data = { ...selectedAction.fixedBody };

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

    if (selectedAction.path === "/curations" && data.curation === "REMOVE") {
        data.curation = null;
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
        body: selectedAction.bodyFormat === "text" ? data.decision : data,
        bodyFormat: selectedAction.bodyFormat
    };
}

function formatRequest(request) {
    const lines = [
        `${request.method} ${request.url}`,
        "Authorization: Bearer <관리자 토큰>"
    ];

    if (request.body !== undefined) {
        const isText = request.bodyFormat === "text";
        lines.push(
            `Content-Type: ${isText ? "text/plain" : "application/json"}`,
            "",
            isText ? request.body : JSON.stringify(request.body, null, 2)
        );
    }

    return lines.join("\n");
}

function formatResponse(request, result, status) {
    const responseBody = result === null
        ? "(응답 본문 없음)"
        : JSON.stringify(result, null, 2);
    return `${formatRequest(request)}\n\n응답 (${status})\n${responseBody}`;
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

    queryVersion += 1;
    clearListResults();
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

async function refreshCategories(headers, requestVersion) {
    try {
        const response = await fetch("/api/categories", { headers });
        const result = await response.json();

        if (
            requestVersion === queryVersion &&
            selectedMenuName === "catalog" &&
            response.ok &&
            result?.code === "ok"
        ) {
            renderListResults(result, menus.catalog[0]);
        }
    } catch (error) {
        return;
    }
}

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
    clearListResults();
    preview.hidden = true;
    message.textContent = "서버에 요청 중...";

    const requestVersion = queryVersion;
    const requestedAction = selectedAction;

    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (request.body !== undefined) {
        headers["Content-Type"] = request.bodyFormat === "text"
            ? "text/plain"
            : "application/json";
    }

    try {
        const response = await fetch(request.url, {
            method: request.method,
            headers,
            body: request.body === undefined
                ? undefined
                : request.bodyFormat === "text"
                    ? request.body
                    : JSON.stringify(request.body)
        });

        const result = await response.json().catch(() => null);

        if (requestVersion !== queryVersion) {
            return;
        }

        if (response.status === 401) {
            sessionStorage.removeItem("accessToken");
            window.location.replace("admin_login.jsp");
            return;
        }

        if (!response.ok || result?.code !== "ok") {
            preview.textContent = formatResponse(request, result, response.status);
            preview.hidden = false;

            message.textContent =
                result?.message ||
                (response.status >= 500
                    ? `서버 오류가 발생했습니다. (${response.status}) 백엔드 로그를 확인해 주세요.`
                    : response.status === 403
                        ? "관리자 권한이 없습니다. (403)"
                    : response.status === 404
                        ? "API 경로를 찾지 못했습니다. 백엔드 배포와 경로 매핑을 확인해 주세요. (404)"
                    : `요청에 실패했습니다. (${response.status})`);

            if (requestedAction.path === "/sellers/{sellerId}/commission-rate" && result?.code === "no") {
                message.textContent = "해당 판매자의 수수료율을 변경하지 못했습니다. 판매자 ID와 등록된 수수료율을 확인해 주세요.";
            }
            return;
        }

        if (request.method === "GET" && requestedAction.path === "/products/{productId}") {
            if (!renderProductDetail(result)) {
                preview.textContent = formatResponse(request, result, response.status);
                preview.hidden = false;
                message.textContent = "상품 상세 응답 형식을 확인해 주세요.";
                return;
            }
            message.textContent = "상품 상세 조회가 완료되었습니다.";
        } else if (request.method === "GET" && LIST_VIEWS[requestedAction.path]) {
            if (!renderListResults(result, requestedAction)) {
                preview.textContent = formatResponse(request, result, response.status);
                preview.hidden = false;
                message.textContent = "조회 응답 형식이 규격서와 다릅니다.";
                return;
            }
            message.textContent = "조회가 완료되었습니다.";
        } else {
            preview.textContent = formatResponse(request, result, response.status);
            preview.hidden = false;

            message.textContent = requestedAction.path === "/coupons"
                ? "쿠폰이 생성되었습니다. 발급하려면 쿠폰 ID를 확인해 주세요."
                : requestedAction.path === "/coupons/{coupon_id}"
                    ? "쿠폰 발급이 완료되었습니다."
                    : requestedAction.path === "/categories"
                        ? "카테고리가 등록되었습니다."
                        : requestedAction.path === "/categories/{categoryId}"
                            ? "카테고리가 수정되었습니다."
                    : requestedAction.path === "/sellers/{sellerId}/commission-rate"
                        ? "수수료율이 변경되었습니다."
                    : requestedAction.path === "/curations"
                        ? request.body.curation === null
                            ? "상품 지정이 해제되었습니다."
                            : "상품 지정이 완료되었습니다."
                    : "서버 요청이 완료되었습니다.";

            if (["/categories", "/categories/{categoryId}"].includes(requestedAction.path)) {
                await refreshCategories(headers, requestVersion);
            }
        }
    } catch (error) {
        if (requestVersion === queryVersion) {
            preview.textContent = formatRequest(request);
            preview.hidden = false;
            message.textContent = "서버에 연결할 수 없습니다.";
        }
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