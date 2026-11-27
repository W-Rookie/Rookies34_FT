
/**
 * products.js - 판매자 상품 목록 조회 (S-11)
 *
 * GET    /api/seller/products?status=&page=
 * DELETE /api/seller/products/{productId}
 *
 * 실제 API 사용 / 페이지당 최대 20건 기준
 * 페이지 버튼: « ‹ 1 2 3 4 5 › »
 * 전체 건수가 없으므로 실제 조회로 확인된 페이지만 번호로 표시합니다.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const PAGE_SIZE = 20;
  const MAX_LAST_PAGE_SCAN = 100;

  const STATUS_LABEL = {
    PENDING: "검증 대기",
    APPROVED: "판매 중(승인)",
    REJECTED: "반려됨",
    HIDDEN: "숨김"
  };

  let currentPage = 1;
  let maxKnownPage = 1;
  let lastPage = null;
  let loadSequence = 0;
  let deletingProduct = false;
  let appliedStatus = $("productStatus").value;

  // =====================================
  // 1. 셀 및 메시지
  // =====================================

  function td(value) {
    const cell = document.createElement("td");

    cell.textContent =
      value === null || value === undefined
        ? "-"
        : String(value);

    return cell;
  }

  function showMessage(message) {
    const row = document.createElement("tr");
    const cell = td(message);

    cell.colSpan = 6;
    row.appendChild(cell);

    $("productTbody").replaceChildren(row);
  }

  // =====================================
  // 2. 실제 상품 목록 API 조회
  // =====================================

  async function fetchProducts(page) {
    const data = await api.get(
      "/seller/products",
      {
        status: appliedStatus,
        page: page
      }
    );

    if (
      !data ||
      data.code !== "ok" ||
      !Array.isArray(data.products)
    ) {
      throw new Error(
        "상품 목록 API 응답 형식 오류"
      );
    }

    return data.products;
  }

  // =====================================
  // 3. 페이지 번호
  // « ‹ 1 2 3 4 5 › »
  // =====================================

  function renderPager() {
    const pager = $("productPager");
    pager.replaceChildren();

    const knownEnd =
      lastPage === null ? maxKnownPage : lastPage;

    const start = Math.max(
      1,
      Math.min(currentPage - 2, knownEnd - 4)
    );

    const end = Math.min(
      knownEnd,
      start + 4
    );

    function add(
      label,
      target,
      type,
      disabled,
      active,
      title,
      action
    ) {
      const button = document.createElement("button");

      button.type = "button";
      button.textContent = label;
      button.className = type;
      button.disabled = disabled;

      button.setAttribute("aria-label", title);

      if (active) {
        button.classList.add("active");
        button.setAttribute(
          "aria-current",
          "page"
        );
      }

      if (!disabled) {
        button.addEventListener(
          "click",
          action || function () {
            loadProducts(target);
          }
        );
      }

      pager.appendChild(button);
    }

    const isFirst = currentPage === 1;
    const hasNext = currentPage < knownEnd;

    const isLast =
      lastPage !== null &&
      currentPage >= lastPage;

    // 처음 페이지
    add(
      "«",
      1,
      "nav-btn",
      isFirst,
      false,
      "첫 페이지"
    );

    // 이전 페이지
    add(
      "‹",
      currentPage - 1,
      "nav-btn",
      isFirst,
      false,
      "이전 페이지"
    );

    // 페이지 번호
    for (let p = start; p <= end; p++) {
      add(
        String(p),
        p,
        "page-btn",
        p === currentPage,
        p === currentPage,
        p + "페이지"
      );
    }

    // 다음 페이지
    add(
      "›",
      currentPage + 1,
      "nav-btn",
      !hasNext,
      false,
      "다음 페이지"
    );

    // 마지막 페이지
    add(
      "»",
      lastPage,
      "nav-btn",
      isLast,
      false,
      "마지막 페이지",
      function () {
        if (lastPage !== null) {
          loadProducts(lastPage);
        } else {
          findLastPage();
        }
      }
    );
  }

  // =====================================
  // 4. 상품 삭제 API
  // DELETE /api/seller/products/{productId}
  // =====================================

  async function deleteProduct(product, button) {

    // 중복 삭제 요청 방지
    if (deletingProduct) {
      return;
    }

    const id = product.product_id;

    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {
      alert(
        "상품 ID를 확인할 수 없어 삭제할 수 없습니다."
      );
      return;
    }

    // 삭제 확인
    const confirmed = confirm(
      "상품 '" +
      String(product.name || id) +
      "' (ID: " + id + ")을 삭제하시겠습니까?\n" +
      "삭제 후 복구할 수 없습니다."
    );

    if (!confirmed) {
      return;
    }

    deletingProduct = true;

    button.disabled = true;
    button.textContent = "삭제 중...";

    try {

      // =====================================
      // 실제 상품 삭제 API 호출
      // =====================================

      const result = await api.del(
        "/seller/products/" +
        encodeURIComponent(id)
      );

      // HTTP 200이어도 code가 ok인지 확인
      if (!result || result.code !== "ok") {
        throw new Error(
          "상품 삭제 API 응답 오류"
        );
      }

      alert("상품이 삭제되었습니다.");

      // =====================================
      // 삭제 후 상품 목록 갱신
      // =====================================

      // 삭제로 인해 페이지 수가 변경됐을 수 있음
      lastPage = null;
      maxKnownPage = 1;

      // 현재 페이지 다시 조회
      // 마지막 상품이었다면 이전 페이지로 이동
      await loadProducts(currentPage);

    } catch (err) {

      if (
        err &&
        err.message !== "UNAUTHORIZED"
      ) {
        console.error(
          "상품 삭제 오류:",
          err
        );

        if (err.status === 403) {
          alert(
            "이 상품을 삭제할 권한이 없습니다."
          );
        } else {
          alert(
            "상품 삭제에 실패했습니다.\n" +
            "서버 응답과 상품 참조 내역을 확인해 주세요."
          );
        }
      }

      // 실패 시 버튼 복구
      button.disabled = false;
      button.textContent = "삭제";

    } finally {

      deletingProduct = false;

    }
  }

  // =====================================
  // 5. 상품 목록 화면 출력
  // =====================================

  function renderProducts(products) {

    const tbody = $("productTbody");
    tbody.replaceChildren();

    // 현재 페이지 상품 수
    $("productTotalCount").textContent =
      String(products.length);

    // 조회 결과가 없는 경우
    if (products.length === 0) {
      showMessage(
        "조회된 상품이 없습니다."
      );
      return;
    }

    products.forEach(function (product) {

      const row = document.createElement("tr");

      // 상품 ID
      row.appendChild(
        td(product.product_id)
      );

      // 상품명
      row.appendChild(
        td(product.name)
      );

      // 판매가
      const price = Number(product.price);

      row.appendChild(
        td(
          Number.isFinite(price)
            ? price.toLocaleString("ko-KR") + "원"
            : "-"
        )
      );

      // 재고
      row.appendChild(
        td(product.stock)
      );

      // 상품 상태
      row.appendChild(
        td(
          STATUS_LABEL[product.status] ||
          product.status
        )
      );

      // =====================================
      // 관리 버튼 영역
      // =====================================

      const actions = document.createElement("td");

      // ① 상품 수정 버튼
      const link = document.createElement("a");

      link.href =
        "productForm.jsp?id=" +
        encodeURIComponent(product.product_id);

      link.textContent = "수정";
      link.className = "text-link";

      actions.appendChild(link);

      // =====================================
      // ② 상품 삭제 버튼
      // =====================================

      const deleteBtn = document.createElement("button");

      deleteBtn.type = "button";
      deleteBtn.textContent = "삭제";
      deleteBtn.className = "subtle-btn";

      // 수정 버튼과 간격
      deleteBtn.style.marginLeft = "8px";

      deleteBtn.setAttribute(
        "aria-label",
        String(
          product.name || product.product_id
        ) + " 삭제"
      );

      deleteBtn.addEventListener(
        "click",
        function () {
          deleteProduct(
            product,
            deleteBtn
          );
        }
      );

      actions.appendChild(deleteBtn);

      row.appendChild(actions);
      tbody.appendChild(row);

    });
  }

  // =====================================
  // 6. 현재 페이지 및 다음 페이지 확인
  // =====================================

  async function loadProducts(page) {

    const sequence = ++loadSequence;

    currentPage = Math.max(
      1,
      Number(page) || 1
    );

    showMessage(
      "상품 목록을 불러오는 중..."
    );

    $("productPager").replaceChildren();

    try {

      const products =
        await fetchProducts(currentPage);

      if (sequence !== loadSequence) {
        return;
      }

      // =====================================
      // 마지막 페이지가 비었다면
      // 이전 페이지로 이동
      // =====================================

      if (
        products.length === 0 &&
        currentPage > 1
      ) {
        lastPage = currentPage - 1;
        maxKnownPage = lastPage;

        await loadProducts(lastPage);
        return;
      }

      // 상품 목록 출력
      renderProducts(products);

      maxKnownPage = Math.max(
        maxKnownPage,
        currentPage
      );

      // =====================================
      // 다음 페이지 존재 여부 확인
      // =====================================

      if (products.length < PAGE_SIZE) {

        lastPage = currentPage;
        maxKnownPage = currentPage;

      } else if (lastPage === null) {

        try {

          const nextProducts =
            await fetchProducts(
              currentPage + 1
            );

          if (sequence !== loadSequence) {
            return;
          }

          if (nextProducts.length > 0) {

            maxKnownPage = Math.max(
              maxKnownPage,
              currentPage + 1
            );

          } else {

            lastPage = currentPage;
            maxKnownPage = currentPage;

          }

        } catch (probeError) {

          if (sequence !== loadSequence) {
            return;
          }

          console.warn(
            "다음 상품 페이지 확인 실패:",
            probeError
          );

        }
      }

      if (sequence !== loadSequence) {
        return;
      }

      renderPager();

    } catch (err) {

      if (sequence !== loadSequence) {
        return;
      }

      if (
        err &&
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error(
        "상품 목록 조회 오류:",
        err
      );

      $("productTotalCount").textContent = "0";

      showMessage(
        "상품 목록을 불러오지 못했습니다."
      );

      $("productPager").replaceChildren();

    }
  }

  // =====================================
  // 7. 마지막 페이지 찾기
  // =====================================

  async function findLastPage() {

    if (lastPage !== null) {
      await loadProducts(lastPage);
      return;
    }

    const sequence = ++loadSequence;
    const originalPage = currentPage;
    const startPage = maxKnownPage;

    $("productPager")
      .querySelectorAll("button")
      .forEach(function (button) {
        button.disabled = true;
      });

    try {

      for (
        let p = startPage;
        p < startPage + MAX_LAST_PAGE_SCAN;
        p++
      ) {

        const products =
          await fetchProducts(p);

        if (sequence !== loadSequence) {
          return;
        }

        if (products.length < PAGE_SIZE) {

          lastPage =
            products.length === 0 && p > 1
              ? p - 1
              : p;

          maxKnownPage = lastPage;

          await loadProducts(lastPage);
          return;
        }

        maxKnownPage = Math.max(
          maxKnownPage,
          p
        );
      }

      throw new Error(
        "마지막 페이지 확인 한도 초과"
      );

    } catch (err) {

      if (sequence !== loadSequence) {
        return;
      }

      if (
        err &&
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error(
        "마지막 상품 페이지 확인 실패:",
        err
      );

      alert(
        "마지막 페이지를 확인하지 못했습니다.\n" +
        "이전/다음으로 이동해 주세요."
      );

      await loadProducts(originalPage);

    }
  }

  // =====================================
  // 8. 상태 필터 및 최초 조회
  // =====================================

  // 기존 샘플 버튼이 남아 있으면 숨기기
  const resetMockBtn = $("productResetMock");

  if (resetMockBtn) {
    resetMockBtn.hidden = true;
  }

  // 상태별 필터
  $("productFilterForm").addEventListener(
    "submit",
    function (e) {

      e.preventDefault();

      appliedStatus =
        $("productStatus").value;

      // 필터 변경 시 페이지 상태 초기화
      maxKnownPage = 1;
      lastPage = null;

      loadProducts(1);

    }
  );

  // 최초 목록 조회
  loadProducts(1);

})();
