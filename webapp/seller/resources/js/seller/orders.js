/**
 * orders.js - 주문 관리 (S-03, S-04, S-05)
 *
 * S-03 GET   /api/seller/orders?date_from&date_to&status&page
 * S-04 PATCH /api/seller/order-items/{orderItemId}/shipment
 * S-05 POST  /api/seller/order-items/{orderItemId}/cancellation
 *
 * 서버 페이지당 20건 기준
 * 페이지 버튼: « ‹ 1 2 3 4 5 › »
 * 실제 API 연동 / 더미데이터 미사용
 */
(function () {
  "use strict";

  const $ = function (id) {
    return document.getElementById(id);
  };

  const PAGE_SIZE = 20;
  const MAX_LAST_PAGE_SCAN = 100;

  const STATUS_LABEL = {
    PAID: "결제완료",
    SHIPPING: "배송중",
    COMPLETED: "거래완료",
    CANCELED: "취소"
  };

  let currentPage = 1;
  let maxKnownPage = 1;
  let lastPage = null;
  let loadSequence = 0;
  let selectedItemId = null;
  let appliedFilters = readFilters();

  // =====================================
  // 1. 공통 함수
  // =====================================

  function todayStr() {
    const d = new Date();

    const pad = function (n) {
      return String(n).padStart(2, "0");
    };

    return d.getFullYear() + "-" +
      pad(d.getMonth() + 1) + "-" +
      pad(d.getDate());
  }

  function td(value) {
    const cell = document.createElement("td");

    cell.textContent =
      value === null || value === undefined
        ? "-"
        : String(value);

    return cell;
  }

  function button(label, onClick, disabled) {
    const b = document.createElement("button");

    b.type = "button";
    b.textContent = label;
    b.disabled = !!disabled;

    if (onClick) {
      b.addEventListener("click", onClick);
    }

    return b;
  }

  function showMessage(message) {
    const tr = document.createElement("tr");
    const cell = td(message);

    cell.colSpan = 8;
    tr.appendChild(cell);

    $("orderTbody").replaceChildren(tr);
  }

  function closePanels() {
    $("shipmentBox").hidden = true;
    $("cancelBox").hidden = true;

    selectedItemId = null;
  }

  // =====================================
  // 2. 조회 조건 및 API
  // =====================================

  function readFilters() {
    return {
      date_from: $("date_from").value,
      date_to: $("date_to").value,
      status: $("status").value
    };
  }

  function queryFor(page) {
    return {
      ...appliedFilters,
      page: page
    };
  }

  async function fetchOrders(page) {
    const data = await api.get(
      "/seller/orders",
      queryFor(page)
    );

    if (
      !data ||
      data.code !== "ok" ||
      !Array.isArray(data.orders)
    ) {
      throw new Error(
        "주문 목록 API 응답 형식 오류"
      );
    }

    return data;
  }

  // =====================================
  // 3. 페이지네이션
  // « ‹ 1 2 3 4 5 › »
  // =====================================

  function renderPager() {
    const pager = $("pager");
    pager.replaceChildren();

    const knownEnd =
      lastPage === null
        ? maxKnownPage
        : lastPage;

    const start = Math.max(
      1,
      Math.min(currentPage - 2, knownEnd - 4)
    );

    const end = Math.min(
      knownEnd,
      start + 4
    );

    const isFirst = currentPage === 1;

    const isLast =
      lastPage !== null &&
      currentPage >= lastPage;

    const hasNext = currentPage < knownEnd;

    function add(
      label,
      target,
      cssClass,
      disabled,
      active,
      ariaLabel,
      handler
    ) {
      const b = document.createElement("button");

      b.type = "button";
      b.textContent = label;
      b.className = cssClass;
      b.disabled = disabled;

      b.setAttribute("aria-label", ariaLabel);

      if (active) {
        b.classList.add("active");
        b.setAttribute("aria-current", "page");
      }

      if (!disabled) {
        b.addEventListener(
          "click",
          handler || function () {
            loadOrders(target);
          }
        );
      }

      pager.appendChild(b);
    }

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

    // 페이지 번호 (최대 5개)
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
          loadOrders(lastPage);
        } else {
          findLastPage();
        }
      }
    );
  }

  // =====================================
  // 4. 주문 목록 출력
  // =====================================

  function renderOrders(orders, data) {
    const tbody = $("orderTbody");
    tbody.replaceChildren();

    $("totalCount").textContent =
      String(data.num ?? orders.length);

    if (orders.length === 0) {
      showMessage("주문이 없습니다.");
      return;
    }

    orders.forEach(function (o) {
      const tr = document.createElement("tr");

      // 주문 ID
      tr.appendChild(td(o.order_id));

      // 상품명
      tr.appendChild(td(o.product_name));

      // 수량
      tr.appendChild(td(o.quantity));

      // 주문금액
      const amount = Number(o.amount);

      tr.appendChild(
        td(
          Number.isFinite(amount)
            ? amount.toLocaleString("ko-KR") + "원"
            : "-"
        )
      );

      // 주문 상태
      tr.appendChild(
        td(STATUS_LABEL[o.status] || o.status)
      );

      // 주문일
      tr.appendChild(td(o.ordered_at));

      // 송장번호
      tr.appendChild(td(o.tracking_no));

      // =====================================
      // 주문 관리 버튼
      // =====================================

      const actions = document.createElement("td");

      // 배송 처리 버튼
      actions.appendChild(
        button(
          "배송처리",
          function () {
            openShipment(o);
          },
          !(
            o.status === "PAID" ||
            o.status === "SHIPPING"
          )
        )
      );

      // 주문 취소 버튼
      actions.appendChild(
        button(
          "취소",
          function () {
            openCancel(o);
          },
          o.status !== "PAID"
        )
      );

      tr.appendChild(actions);
      tbody.appendChild(tr);
    });
  }

  // =====================================
  // 5. 주문 목록 조회
  // =====================================

  async function loadOrders(page) {
    const sequence = ++loadSequence;

    currentPage = Math.max(
      1,
      Number(page) || 1
    );

    closePanels();

    showMessage("조회 중...");
    $("pager").replaceChildren();

    try {
      const data = await fetchOrders(currentPage);

      if (sequence !== loadSequence) {
        return;
      }

      const orders = data.orders;

      // 마지막 페이지가 비었다면 이전 페이지 조회
      if (
        orders.length === 0 &&
        currentPage > 1
      ) {
        lastPage = currentPage - 1;
        maxKnownPage = lastPage;

        await loadOrders(lastPage);
        return;
      }

      // 실제 주문 목록 출력
      renderOrders(orders, data);

      maxKnownPage = Math.max(
        maxKnownPage,
        currentPage
      );

      // =====================================
      // 6. 다음 페이지 존재 여부 확인
      // =====================================

      if (orders.length < PAGE_SIZE) {
        lastPage = currentPage;
        maxKnownPage = currentPage;

      } else if (lastPage === null) {
        try {
          const nextData = await fetchOrders(
            currentPage + 1
          );

          if (sequence !== loadSequence) {
            return;
          }

          if (nextData.orders.length > 0) {
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
            "다음 주문 페이지 확인 실패:",
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
        "주문 목록 조회 오류:",
        err
      );

      $("totalCount").textContent = "0";

      showMessage(
        "주문 목록을 불러오지 못했습니다."
      );

      $("pager").replaceChildren();
    }
  }

  // =====================================
  // 7. 마지막 페이지 찾기
  // =====================================

  async function findLastPage() {
    if (lastPage !== null) {
      await loadOrders(lastPage);
      return;
    }

    const sequence = ++loadSequence;

    const originalPage = currentPage;
    const startPage = maxKnownPage;

    $("pager")
      .querySelectorAll("button")
      .forEach(function (b) {
        b.disabled = true;
      });

    try {
      for (
        let p = startPage;
        p < startPage + MAX_LAST_PAGE_SCAN;
        p++
      ) {
        const data = await fetchOrders(p);

        if (sequence !== loadSequence) {
          return;
        }

        if (data.orders.length < PAGE_SIZE) {
          lastPage =
            data.orders.length === 0 && p > 1
              ? p - 1
              : p;

          maxKnownPage = lastPage;

          await loadOrders(lastPage);
          return;
        }

        maxKnownPage = Math.max(
          maxKnownPage,
          p
        );
      }

      throw new Error(
        "마지막 페이지 확인 한도를 초과했습니다."
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
        "마지막 주문 페이지 확인 오류:",
        err
      );

      alert(
        "마지막 페이지를 확인하지 못했습니다.\n" +
        "이전/다음으로 이동해 주세요."
      );

      await loadOrders(originalPage);
    }
  }

  // =====================================
  // 8. 배송 정보 입력
  // =====================================

  function openShipment(o) {
    closePanels();

    selectedItemId = o.order_item_id;

    $("shipmentTarget").textContent =
      "(" + o.order_id + " / " +
      o.product_name + ")";

    $("expected_delivery_date").min = todayStr();
    $("expected_delivery_date").value = "";

    $("courier").value = "";

    $("tracking_no").value =
      o.tracking_no || "";

    $("shipmentBox").hidden = false;
  }

  // =====================================
  // 9. 배송 정보 저장 (S-04)
  // =====================================

  $("shipmentForm").addEventListener(
    "submit",
    async function (e) {
      e.preventDefault();

      if (!selectedItemId) {
        return;
      }

      const date =
        $("expected_delivery_date").value;

      const courier =
        $("courier").value;

      const trackingNo =
        $("tracking_no").value.trim();

      if (!date && !trackingNo) {
        return alert(
          "배송 예정일 또는 송장번호를 입력해 주세요."
        );
      }

      if (date && date < todayStr()) {
        return alert(
          "배송 예정일은 오늘 이후여야 합니다."
        );
      }

      if (
        trackingNo &&
        !/^[0-9]{10,14}$/.test(trackingNo)
      ) {
        return alert(
          "송장번호는 숫자 10~14자리입니다."
        );
      }

      if (trackingNo && !courier) {
        return alert(
          "송장번호를 입력하면 택배사를 선택해야 합니다."
        );
      }

      // 입력한 필드만 전송
      const body = {};

      if (date) {
        body.expected_delivery_date = date;
      }

      if (courier) {
        body.courier = courier;
      }

      if (trackingNo) {
        body.tracking_no = trackingNo;
      }

      const itemId = selectedItemId;

      const saveButton = $("shipmentForm")
        .querySelector('[type="submit"]');

      if (saveButton) {
        saveButton.disabled = true;
      }

      try {
        const result = await api.patch(
          "/seller/order-items/" +
            encodeURIComponent(itemId) +
            "/shipment",
          body
        );

        if (!result || result.code !== "ok") {
          throw new Error(
            "배송 정보 저장 응답 오류"
          );
        }

        alert("배송 정보가 저장되었습니다.");

        await loadOrders(currentPage);

      } catch (err) {
        if (err.message !== "UNAUTHORIZED") {
          console.error(
            "배송 정보 저장 오류:",
            err
          );

          alert(
            "배송 정보 저장에 실패했습니다."
          );
        }

      } finally {
        if (saveButton) {
          saveButton.disabled = false;
        }
      }
    }
  );

  // =====================================
  // 10. 판매자 주문 취소 화면
  // =====================================

  function openCancel(o) {
    closePanels();

    selectedItemId = o.order_item_id;

    $("cancelTarget").textContent =
      "(" + o.order_id + " / " +
      o.product_name + ")";

    $("reason").value = "OUT_OF_STOCK";

    $("cancelBox").hidden = false;
  }

  // =====================================
  // 11. 주문 취소 API (S-05)
  // =====================================

  $("cancelForm").addEventListener(
    "submit",
    async function (e) {
      e.preventDefault();

      if (!selectedItemId) {
        return;
      }

      if (
        !confirm(
          "이 주문을 취소하시겠습니까? 되돌릴 수 없습니다."
        )
      ) {
        return;
      }

      const itemId = selectedItemId;

      const cancelButton = $("cancelForm")
        .querySelector('[type="submit"]');

      if (cancelButton) {
        cancelButton.disabled = true;
      }

      try {
        const result = await api.post(
          "/seller/order-items/" +
            encodeURIComponent(itemId) +
            "/cancellation",
          {
            reason: $("reason").value
          }
        );

        if (!result || result.code !== "ok") {
          throw new Error(
            "주문 취소 응답 오류"
          );
        }

        alert("주문이 취소되었습니다.");

        await loadOrders(currentPage);

      } catch (err) {
        if (err.message !== "UNAUTHORIZED") {
          console.error(
            "주문 취소 오류:",
            err
          );

          alert(
            "주문 취소에 실패했습니다."
          );
        }

      } finally {
        if (cancelButton) {
          cancelButton.disabled = false;
        }
      }
    }
  );

  // =====================================
  // 12. 필터 및 공통 이벤트
  // =====================================

  document.querySelectorAll(".closeBtn")
    .forEach(function (b) {
      b.addEventListener(
        "click",
        closePanels
      );
    });

  $("filterForm").addEventListener(
    "submit",
    function (e) {
      e.preventDefault();

      const nextFilters = readFilters();

      if (
        nextFilters.date_from &&
        nextFilters.date_to &&
        nextFilters.date_from > nextFilters.date_to
      ) {
        alert(
          "시작일이 종료일보다 늦을 수 없습니다."
        );
        return;
      }

      appliedFilters = nextFilters;
      maxKnownPage = 1;
      lastPage = null;

      loadOrders(1);
    }
  );

  // =====================================
  // 13. 최초 주문 목록 조회
  // =====================================

  loadOrders(1);

})();