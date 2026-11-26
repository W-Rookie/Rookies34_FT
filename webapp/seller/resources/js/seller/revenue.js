/**
 * revenue.js — 수익금 내역 조회 (S-07)
 *  GET /api/seller/revenues?status&date_from&date_to&page
 *  응답 { code, expected_settlement, num,
 *         revenues:[{order_item_id, order_amount, commission, settlement_amount, status, created_at}] }
 *  정산액 = 주문금액 - 수수료 (수수료 = 주문금액 × 수수료율, 서버 계산)
 */
(function () {
  const PAGE_SIZE = 20;
  const STATUS_LABEL = { COMPLETED: "거래완료", CANCELED: "취소" };

  const $ = function (id) { return document.getElementById(id); };
  let currentPage = 1;

  function won(n) {
    return (n === null || n === undefined) ? "-" : Number(n).toLocaleString() + "원";
  }

  function td(text) {
    const cell = document.createElement("td");
    cell.textContent = (text === null || text === undefined) ? "-" : text;
    return cell;
  }

  // ---------- 조회 ----------
  async function loadRevenues(page) {
    currentPage = page || 1;
    const tbody = $("revenueTbody");
    tbody.innerHTML = '<tr><td colspan="6">조회 중...</td></tr>';

    try {
      const data = await api.get("/seller/revenues", {
        status: $("status").value,
        date_from: $("date_from").value,
        date_to: $("date_to").value,
        page: currentPage
      });

      const list = data.revenues || [];
      $("expectedSettlement").textContent = Number(data.expected_settlement || 0).toLocaleString();
      $("totalCount").textContent = data.num || 0;
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">내역이 없습니다.</td></tr>';
      }

      list.forEach(function (r) {
        const tr = document.createElement("tr");
        if (r.status === "CANCELED") tr.className = "canceled";
        tr.appendChild(td(r.created_at));
        tr.appendChild(td(r.order_item_id));
        tr.appendChild(td(won(r.order_amount)));
        tr.appendChild(td(won(r.commission)));
        tr.appendChild(td(won(r.settlement_amount)));
        tr.appendChild(td(STATUS_LABEL[r.status] || r.status));
        tbody.appendChild(tr);
      });

      renderPager(data.num || 0);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      tbody.innerHTML = '<tr><td colspan="6">수익금 내역을 불러오지 못했습니다.</td></tr>';
    }
  }

  // ---------- 페이지 번호 ----------
  function renderPager(total) {
    const pager = $("pager");
    pager.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    for (let p = 1; p <= totalPages; p++) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = p;
      b.disabled = (p === currentPage);
      b.addEventListener("click", function () { loadRevenues(p); });
      pager.appendChild(b);
    }
  }

  // ---------- 필터 ----------
  $("filterForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("date_from").value && $("date_to").value && $("date_from").value > $("date_to").value) {
      return alert("시작일이 종료일보다 늦을 수 없습니다.");
    }
    loadRevenues(1);
  });

  loadRevenues(1);
})();