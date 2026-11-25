/** S-11 내 상품 목록 조회. S-11 미구현 동안 샘플 조회, 실제 상품 S-02는 기존 API 유지. */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const STATUS_LABEL = { PENDING: "검증 대기", APPROVED: "판매 중(승인)", REJECTED: "반려됨", HIDDEN: "숨김" };
  const mockMode = sellerMock.useMockLists;
  const PAGE_SIZE = sellerMock.pageSize; // 실제 S-11 연동 시 백엔드 합의된 크기로 변경
  let currentPage = 1;


  function td(value) {
    const cell = document.createElement("td");
    cell.textContent = value === null || value === undefined ? "-" : String(value);
    return cell;
  }
  function renderPager(total, pageSize) {
    const pager = $("productPager");
    pager.replaceChildren();
    const pages = Math.max(1, Math.ceil(total / pageSize));
    // 페이지가 늘어나도 전체 번호를 무한 생성하지 않도록 주변 5개 + 이전/다음 표시
    const start = Math.max(1, Math.min(currentPage - 2, pages - 4));
    const end = Math.min(pages, start + 4);
    function add(label, target, disabled, active) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = disabled;
      if (active) button.setAttribute("aria-current", "page");
      button.addEventListener("click", function () { loadProducts(target); });
      pager.appendChild(button);
    }
    if (pages > 1) {
      add("이전", currentPage - 1, currentPage === 1, false);
      for (let p = start; p <= end; p++) add(String(p), p, p === currentPage, p === currentPage);
      add("다음", currentPage + 1, currentPage === pages, false);
    }
  }
  async function loadProducts(page) {
    currentPage = page || 1;
    const tbody = $("productTbody");
    tbody.replaceChildren();
    const loading = document.createElement("tr");
    const loadingCell = td("상품 목록을 불러오는 중...");
    loadingCell.colSpan = 6;
    loading.appendChild(loadingCell);
    tbody.appendChild(loading);
    try {
      const query = { status: $("productStatus").value, page: currentPage };
      const result = mockMode ? sellerMock.listProducts(query) : await api.get("/seller/products", query);
      // 실제 응답 필드명은 백엔드와 최종 합의 필요: 현재 임시 {num,products,page_size}
      const products = Array.isArray(result.products) ? result.products : [];
      const total = Number(result.num ?? products.length);
      const size = Number(result.page_size) > 0 ? Number(result.page_size) : PAGE_SIZE;
      $("productTotalCount").textContent = String(total);
      tbody.replaceChildren();
      if (!products.length) {
        const row = document.createElement("tr");
        const cell = td("조회된 상품이 없습니다.");
        cell.colSpan = 6;
        row.appendChild(cell);
        tbody.appendChild(row);
      }
      products.forEach(function (product) {
        const tr = document.createElement("tr");
        tr.appendChild(td(product.product_id));
        tr.appendChild(td(product.name));
        tr.appendChild(td(Number(product.price || 0).toLocaleString("ko-KR") + "원"));
        tr.appendChild(td(product.stock));
        tr.appendChild(td(STATUS_LABEL[product.status] || product.status));
        const actions = document.createElement("td");
        const a = document.createElement("a");
        const id = encodeURIComponent(product.product_id);
        a.href = "productForm.jsp?id=" + id + (mockMode ? "&mock=1" : "");
        a.textContent = mockMode ? "샘플 수정" : "수정";
        a.className = "text-link";
        actions.appendChild(a);
        tr.appendChild(actions);
        tbody.appendChild(tr);
      });
      renderPager(total, size);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      $("productTotalCount").textContent = "0";
      tbody.replaceChildren();
      const row = document.createElement("tr");
      const cell = td("상품 목록을 불러오지 못했습니다. " + (err.message || ""));
      cell.colSpan = 6;
      row.appendChild(cell);
      tbody.appendChild(row);
      $("productPager").replaceChildren();
    }
  }
  $("productResetMock").hidden = !mockMode;
  $("productResetMock").addEventListener("click", function () {
    if (!mockMode || !confirm("상품·문의 샘플 데이터 변경 내용을 초기화할까요?")) return;
    sellerMock.reset();
    loadProducts(1);
  });
  $("productFilterForm").addEventListener("submit", function (e) {
    e.preventDefault();
    loadProducts(1);
  });  loadProducts(1);
})();
