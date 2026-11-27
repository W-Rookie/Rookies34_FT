
/**
 * revenue.js - 수익금 내역 조회 (S-07)
 *
 * GET /api/seller/revenues?status&date_from&date_to&page
 *
 * 서버 페이지당 10건 기준
 * 다음 페이지의 실제 데이터 존재 여부를 조회해 페이지 이동 처리
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const PAGE_SIZE = 10;

  const STATUS_LABEL = {
    COMPLETED: "거래완료",
    CANCELED: "취소"
  };

  let currentPage = 1;
  let maxKnownPage = 1;
  let requestSequence = 0;

  // =====================================
  // 1. 금액 및 셀 출력
  // =====================================

  function won(value) {
    if (value === null || value === undefined) {
      return "-";
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number.toLocaleString("ko-KR") + "원"
      : "-";
  }

  function td(value) {
    const cell = document.createElement("td");
    cell.textContent =
      value === null || value === undefined
        ? "-"
        : String(value);
    return cell;
  }

  function showMessage(text) {
    const tbody = $("revenueTbody");
    const row = document.createElement("tr");
    const cell = td(text);

    cell.colSpan = 6;
    row.appendChild(cell);
    tbody.replaceChildren(row);
  }

  // =====================================
  // 2. 현재 조회 조건
  // =====================================

  function currentFilters(page) {
    return {
      status: $("status").value,
      date_from: $("date_from").value,
      date_to: $("date_to").value,
      page: page
    };
  }

  // =====================================
  // 3. 페이지 버튼 출력
  // =====================================

  function renderPager(hasNext, hasRows) {
    const pager = $("pager");
    pager.replaceChildren();

    if (!hasRows && currentPage === 1) {
      return;
    }

    maxKnownPage = Math.max(
      maxKnownPage,
      currentPage + (hasNext ? 1 : 0)
    );

    if (maxKnownPage <= 1) {
      return;
    }

    function add(text, page, disabled, active) {
      const button = document.createElement("button");

      button.type = "button";
      button.textContent = text;
      button.disabled = disabled;

      if (active) {
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", function () {
        if (!disabled) {
          loadRevenues(page);
        }
      });

      pager.appendChild(button);
    }

    const start = Math.max(
      1,
      Math.min(currentPage - 2, maxKnownPage - 4)
    );

    const end = Math.min(maxKnownPage, start + 4);

    add(
      "이전",
      currentPage - 1,
      currentPage === 1,
      false
    );

    for (let page = start; page <= end; page++) {
      add(
        String(page),
        page,
        page === currentPage,
        page === currentPage
      );
    }

    add(
      "다음",
      currentPage + 1,
      currentPage >= maxKnownPage,
      false
    );
  }

  // =====================================
  // 4. 실제 수익금 내역 조회
  // =====================================

  async function loadRevenues(page) {
    currentPage = page || 1;

    const sequence = ++requestSequence;
    const query = currentFilters(currentPage);

    showMessage("조회 중...");
    $("pager").replaceChildren();

    try {
      const data = await api.get(
        "/seller/revenues",
        query
      );

      if (sequence !== requestSequence) {
        return;
      }

      if (
        !data ||
        data.code !== "ok" ||
        !Array.isArray(data.revenues)
      ) {
        throw new Error(
          "수익금 내역 API 응답 형식 오류"
        );
      }

      const list = data.revenues;

      // 조회 기간 정산 예정액
      $("expectedSettlement").textContent =
        Number(data.expected_settlement || 0)
          .toLocaleString("ko-KR");

      // 현재 페이지 상품 건수
      $("totalCount").textContent =
        String(list.length);

      const tbody = $("revenueTbody");
      tbody.replaceChildren();

      if (list.length === 0) {
        showMessage("내역이 없습니다.");
      } else {
        list.forEach(function (r) {
          const tr = document.createElement("tr");

          if (r.status === "CANCELED") {
            tr.className = "canceled";
          }

          tr.appendChild(td(r.created_at));
          tr.appendChild(td(r.order_item_id));
          tr.appendChild(td(won(r.order_amount)));
          tr.appendChild(td(won(r.commission)));
          tr.appendChild(td(won(r.settlement_amount)));
          tr.appendChild(
            td(STATUS_LABEL[r.status] || r.status)
          );

          tbody.appendChild(tr);
        });
      }

      // =====================================
      // 5. 다음 페이지 존재 여부 확인
      // =====================================

      let hasNext = false;

      if (list.length >= PAGE_SIZE) {
        try {
          const nextData = await api.get(
            "/seller/revenues",
            {
              ...query,
              page: currentPage + 1
            }
          );

          if (sequence !== requestSequence) {
            return;
          }

          if (
            !nextData ||
            nextData.code !== "ok" ||
            !Array.isArray(nextData.revenues)
          ) {
            throw new Error(
              "다음 페이지 응답 형식 오류"
            );
          }

          hasNext = nextData.revenues.length > 0;

        } catch (err) {
          if (sequence !== requestSequence) {
            return;
          }

          console.warn(
            "다음 페이지 확인 실패:",
            err
          );

          // 확인 요청 실패 시 다음 페이지 이동 시도 허용
          hasNext = true;
        }
      }

      if (sequence !== requestSequence) {
        return;
      }

      renderPager(hasNext, list.length > 0);

    } catch (err) {
      if (
        sequence !== requestSequence ||
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error(
        "수익금 내역 조회 실패:",
        err
      );

      $("totalCount").textContent = "0";
      showMessage("수익금 내역을 불러오지 못했습니다.");
      $("pager").replaceChildren();
    }
  }

  // =====================================
  // 6. 기간 및 상태 필터
  // =====================================

  $("filterForm").addEventListener(
    "submit",
    function (e) {
      e.preventDefault();

      const from = $("date_from").value;
      const to = $("date_to").value;

      if (from && to && from > to) {
        alert("시작일이 종료일보다 늦을 수 없습니다.");
        return;
      }

      maxKnownPage = 1;
      loadRevenues(1);
    }
  );

  // =====================================
  // 7. 최초 목록 조회
  // =====================================

  loadRevenues(1);

})();
