/**
 * orders.js — 주문 관리
 *  S-03 GET   /api/seller/orders?date_from&date_to&status&page
 *       응답 { code, num, orders:[{order_item_id, order_id, product_name, quantity,
 *                                   amount, status, ordered_at, tracking_no}] }
 *  S-04 PATCH /api/seller/order-items/{orderItemId}/shipment
 *       { expected_delivery_date, courier, tracking_no }
 *  S-05 POST  /api/seller/order-items/{orderItemId}/cancellation
 *       { reason: OUT_OF_STOCK | ETC }
 */
(function () {
  const PAGE_SIZE = 20; // 협의 #11: 페이지 크기 20 고정

  const STATUS_LABEL = {
    PAID: "결제완료",
    SHIPPING: "배송중",
    COMPLETED: "거래완료",
    CANCELED: "취소"
  };

  const $ = function (id) { return document.getElementById(id); };
  let currentPage = 1;
  let selectedItemId = null; // 배송처리/취소 대상 order_item_id

  // ---------- 유틸 ----------
  function todayStr() {
    const d = new Date();
    const pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function td(text) {
    const cell = document.createElement("td");
    cell.textContent = (text === null || text === undefined) ? "-" : text; // textContent → XSS 방지
    return cell;
  }

  function button(label, onClick, disabled) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.disabled = !!disabled;
    b.addEventListener("click", onClick);
    return b;
  }

  function closePanels() {
    $("shipmentBox").hidden = true;
    $("cancelBox").hidden = true;
    selectedItemId = null;
  }

  // ---------- S-03 주문 목록 조회 ----------
  async function loadOrders(page) {
    currentPage = page || 1;
    closePanels();

    const tbody = $("orderTbody");
    tbody.innerHTML = '<tr><td colspan="8">조회 중...</td></tr>';

    try {
      const data = await api.get("/seller/orders", {
        date_from: $("date_from").value,
        date_to: $("date_to").value,
        status: $("status").value,
        page: currentPage
      });

      const orders = data.orders || [];
      $("totalCount").textContent = data.num || 0;
      tbody.innerHTML = "";

      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">주문이 없습니다.</td></tr>';
      }

      orders.forEach(function (o) {
        const tr = document.createElement("tr");
        tr.appendChild(td(o.order_id));
        tr.appendChild(td(o.product_name));
        tr.appendChild(td(o.quantity));
        tr.appendChild(td(Number(o.amount).toLocaleString() + "원"));
        tr.appendChild(td(STATUS_LABEL[o.status] || o.status));
        tr.appendChild(td(o.ordered_at));
        tr.appendChild(td(o.tracking_no));

        const action = document.createElement("td");
        // 화면에서만 막는 조건 (서버도 상태 검증해야 함)
        action.appendChild(button("배송처리", function () { openShipment(o); },
          !(o.status === "PAID" || o.status === "SHIPPING")));
        action.appendChild(button("취소", function () { openCancel(o); },
          o.status !== "PAID"));
        tr.appendChild(action);

        tbody.appendChild(tr);
      });

      renderPager(data.num || 0);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      tbody.innerHTML = '<tr><td colspan="8">주문 목록을 불러오지 못했습니다.</td></tr>';
    }
  }

  // ---------- 페이지 번호 ----------
  function renderPager(total) {
    const pager = $("pager");
    pager.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    for (let p = 1; p <= totalPages; p++) {
      const b = button(String(p), function () { loadOrders(p); }, p === currentPage);
      pager.appendChild(b);
    }
  }

  // ---------- S-04 배송 정보 입력 ----------
  function openShipment(o) {
    closePanels();
    selectedItemId = o.order_item_id;
    $("shipmentTarget").textContent = "(" + o.order_id + " / " + o.product_name + ")";
    $("expected_delivery_date").min = todayStr();
    $("expected_delivery_date").value = "";
    $("courier").value = "";
    $("tracking_no").value = o.tracking_no || "";
    $("shipmentBox").hidden = false;
  }

  $("shipmentForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!selectedItemId) return;

    const date = $("expected_delivery_date").value;
    const courier = $("courier").value;
    const trackingNo = $("tracking_no").value.trim();

    if (!date && !trackingNo) return alert("배송 예정일 또는 송장번호를 입력해 주세요.");
    if (date && date < todayStr()) return alert("배송 예정일은 오늘 이후여야 합니다.");
    if (trackingNo && !/^[0-9]{10,14}$/.test(trackingNo)) return alert("송장번호는 숫자 10~14자리입니다.");
    if (trackingNo && !courier) return alert("송장번호를 입력하면 택배사를 선택해야 합니다.");

    // 입력한 값만 보냄 (모두 선택 항목)
    const body = {};
    if (date) body.expected_delivery_date = date;
    if (courier) body.courier = courier;
    if (trackingNo) body.tracking_no = trackingNo;

    try {
      await api.patch("/seller/order-items/" + selectedItemId + "/shipment", body);
      alert("배송 정보가 저장되었습니다.");
      loadOrders(currentPage);
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") alert("배송 정보 저장에 실패했습니다.");
    }
  });

  // ---------- S-05 판매자 주문 취소 ----------
  function openCancel(o) {
    closePanels();
    selectedItemId = o.order_item_id;
    $("cancelTarget").textContent = "(" + o.order_id + " / " + o.product_name + ")";
    $("reason").value = "OUT_OF_STOCK";
    $("cancelBox").hidden = false;
  }

  $("cancelForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!selectedItemId) return;
    if (!confirm("이 주문을 취소하시겠습니까? 되돌릴 수 없습니다.")) return;

    try {
      await api.post("/seller/order-items/" + selectedItemId + "/cancellation", {
        reason: $("reason").value
      });
      alert("주문이 취소되었습니다.");
      loadOrders(currentPage);
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") alert("주문 취소에 실패했습니다.");
    }
  });

  // ---------- 공통 이벤트 ----------
  document.querySelectorAll(".closeBtn").forEach(function (b) {
    b.addEventListener("click", closePanels);
  });

  $("filterForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("date_from").value && $("date_to").value && $("date_from").value > $("date_to").value) {
      return alert("시작일이 종료일보다 늦을 수 없습니다.");
    }
    loadOrders(1);
  });

  // 첫 진입 시 전체 조회
  loadOrders(1);
})();