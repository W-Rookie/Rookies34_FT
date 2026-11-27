
/**
 * products.js - 판매자 상품 목록 조회 (S-11)
 *
 * GET /api/seller/products
 *
 * 기능:
 * 1. 실제 상품 목록 API 조회
 * 2. 상품 상태별 필터
 * 3. 페이지 이동
 * 4. 상품 수정 화면 이동
 *
 * 더미데이터 사용하지 않음
 */

(function () {

  const $ = function (id) {
    return document.getElementById(id);
  };

  const STATUS_LABEL = {
    PENDING: "검증 대기",
    APPROVED: "판매 중(승인)",
    REJECTED: "반려됨",
    HIDDEN: "숨김"
  };

  const PAGE_SIZE = 20;

  let currentPage = 1;
  let loadSequence = 0;

  // =====================================
  // 1. 테이블 셀 생성
  // =====================================

  function td(value) {

    const cell = document.createElement("td");

    // 실제 DB 데이터의 HTML 실행 방지
    cell.textContent =
      value === null || value === undefined
        ? "-"
        : String(value);

    return cell;
  }

  // =====================================
  // 2. 안내 행 출력
  // =====================================

  function showMessage(text) {

    const tbody = $("productTbody");
    tbody.replaceChildren();

    const row = document.createElement("tr");
    const cell = td(text);

    cell.colSpan = 6;

    row.appendChild(cell);
    tbody.appendChild(row);
  }

  // =====================================
  // 3. 페이지 버튼 생성
  // =====================================

  function renderPager(hasNext) {

    const pager = $("productPager");
    pager.replaceChildren();

    // 전체 건수가 제공되지 않으므로
    // 현재 페이지와 확인된 다음 페이지까지만 표시
    const end = currentPage + (hasNext ? 1 : 0);
    const start = Math.max(1, end - 4);

    function add(label, target, disabled, active) {

      const button = document.createElement("button");

      button.type = "button";
      button.textContent = label;
      button.disabled = disabled;

      if (active) {
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", function () {
        loadProducts(target);
      });

      pager.appendChild(button);
    }

    if (currentPage === 1 && !hasNext) {
      return;
    }

    // 이전 페이지
    add(
      "이전",
      currentPage - 1,
      currentPage === 1,
      false
    );

    // 페이지 번호
    for (let p = start; p <= end; p++) {

      add(
        String(p),
        p,
        p === currentPage,
        p === currentPage
      );

    }

    // 다음 페이지
    add(
      "다음",
      currentPage + 1,
      !hasNext,
      false
    );

  }

  // =====================================
  // 4. 상품 목록 조회
  // =====================================

  async function loadProducts(page) {

    currentPage = page || 1;

    // 이전 요청이 나중에 도착하는 경우 방지
    const sequence = ++loadSequence;

    showMessage("상품 목록을 불러오는 중...");
    $("productPager").replaceChildren();

    try {

      // 상태 필터 및 페이지
      const query = {
        status: $("productStatus").value,
        page: currentPage
      };

      // =====================================
      // 실제 상품 목록 API 호출
      // =====================================

      const result = await api.get(
        "/seller/products",
        query
      );

      if (sequence !== loadSequence) {
        return;
      }

      // API 응답 확인
      if (
        !result ||
        result.code !== "ok" ||
        !Array.isArray(result.products)
      ) {
        throw new Error("상품 목록 API 응답 오류");
      }

      const products = result.products;

      // 현재 페이지에서 조회된 상품 수
      $("productTotalCount").textContent =
        String(products.length);

      const tbody = $("productTbody");
      tbody.replaceChildren();

      // =====================================
      // 조회 결과 없음
      // =====================================

      if (products.length === 0) {

        showMessage("조회된 상품이 없습니다.");

        renderPager(false);

        return;
      }

      // =====================================
      // 상품 목록 출력
      // =====================================

      products.forEach(function (product) {

        const tr = document.createElement("tr");

        // 상품 ID
        tr.appendChild(
          td(product.product_id)
        );

        // 상품명
        tr.appendChild(
          td(product.name)
        );

        // 판매가
        const price = Number(product.price || 0);

        tr.appendChild(
          td(price.toLocaleString("ko-KR") + "원")
        );

        // 재고
        tr.appendChild(
          td(product.stock)
        );

        // 상품 상태
        tr.appendChild(
          td(
            STATUS_LABEL[product.status] ||
            product.status
          )
        );

        // =====================================
        // 상품 수정 버튼
        // =====================================

        const actions = document.createElement("td");

        const link = document.createElement("a");

        const id = encodeURIComponent(
          product.product_id
        );

        link.href = "productForm.jsp?id=" + id;

        link.textContent = "수정";
        link.className = "text-link";

        actions.appendChild(link);
        tr.appendChild(actions);

        tbody.appendChild(tr);

      });

      // =====================================
      // 5. 다음 페이지 존재 여부 확인
      // =====================================

      let hasNext = false;

      // 백엔드 num은 현재 페이지 상품 수이므로
      // 전체 페이지 수를 계산할 수 없음
      // 20건이 조회된 경우에만 다음 페이지를 확인
      if (products.length === PAGE_SIZE) {

        try {

          const nextResult = await api.get(
            "/seller/products",
            {
              status: $("productStatus").value,
              page: currentPage + 1
            }
          );

          if (sequence !== loadSequence) {
            return;
          }

          hasNext =
            nextResult &&
            nextResult.code === "ok" &&
            Array.isArray(nextResult.products) &&
            nextResult.products.length > 0;

        } catch (nextErr) {

          console.warn(
            "다음 페이지 확인 실패:",
            nextErr
          );

        }

      }

      if (sequence !== loadSequence) {
        return;
      }

      renderPager(hasNext);

    } catch (err) {

      if (sequence !== loadSequence) {
        return;
      }

      // 인증 오류
      if (err.message === "UNAUTHORIZED") {
        return;
      }

      console.error(
        "상품 목록 조회 오류:",
        err
      );

      $("productTotalCount").textContent = "0";

      showMessage(
        "상품 목록을 불러오지 못했습니다. " +
        (err.message || "")
      );

      $("productPager").replaceChildren();

    }

  }

  // =====================================
  // 6. 샘플 초기화 버튼 비활성화
  // =====================================

  const resetMockBtn = $("productResetMock");

  if (resetMockBtn) {
    resetMockBtn.hidden = true;
  }

  // =====================================
  // 7. 상태별 검색
  // =====================================

  $("productFilterForm").addEventListener(
    "submit",
    function (e) {

      e.preventDefault();

      // 필터 변경 시 첫 페이지부터 조회
      loadProducts(1);

    }
  );

  // =====================================
  // 8. 최초 상품 목록 조회
  // =====================================

  loadProducts(1);

})();
