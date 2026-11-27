
/**
 * revenue.js - 수익금 내역 조회 (S-07)
 *
 * GET /api/seller/revenues?status&date_from&date_to&page
 *
 * 서버가 한 페이지에 최대 10건을 반환한다는 전제.
 * 전체 건수 없이도 이전/다음/처음/마지막 페이지 이동 지원.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const PAGE_SIZE = 10;
  const MAX_LAST_PAGE_SCAN = 100;

  const STATUS_LABEL = {
    COMPLETED: "거래완료",
    CANCELED: "취소"
  };

  let currentPage = 1;
  let maxKnownPage = 1;
  let lastPage = null;
  let requestSequence = 0;
  let appliedFilters = readFilters();

  // =====================================
  // 1. 금액 및 테이블 셀
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

  function showMessage(message) {
    const row = document.createElement("tr");
    const cell = td(message);

    cell.colSpan = 6;
    row.appendChild(cell);

    $("revenueTbody").replaceChildren(row);
  }

  // =====================================
  // 2. 조회 조건
  // =====================================

  function readFilters() {
    return {
      status: $("status").value,
      date_from: $("date_from").value,
      date_to: $("date_to").value
    };
  }

  function queryFor(page) {
    return {
      ...appliedFilters,
      page: page
    };
  }

  function checkResponse(data) {
    if (
      !data ||
      data.code !== "ok" ||
      !Array.isArray(data.revenues)
    ) {
      throw new Error(
        "수익금 내역 API 응답 형식이 올바르지 않습니다."
      );
    }

    return data.revenues;
  }

  // =====================================
  // 3. 페이지네이션
  // « ‹ 1 2 3 4 5 › »
  // =====================================

  function renderPager() {
    const pager = $("pager");
    pager.replaceChildren();

    const knownEnd =
      lastPage === null ? maxKnownPage : lastPage;

    // 현재 페이지를 중심으로 최대 5개 번호 표시
    const start = Math.max(
      1,
      Math.min(currentPage - 2, knownEnd - 4)
    );

    const end = Math.min(knownEnd, start + 4);

    const isFirst = currentPage === 1;
    const isLast =
      lastPage !== null && currentPage >= lastPage;

    const hasVerifiedNext = currentPage < knownEnd;

    // 페이지 버튼 생성
    function add(
      label,
      target,
      kind,
      disabled,
      active,
      ariaLabel,
      handler
    ) {
      const button = document.createElement("button");

      button.type = "button";
      button.textContent = label;
      button.className = kind;
      button.disabled = disabled;

      button.setAttribute("aria-label", ariaLabel);

      // 현재 페이지 스타일
      if (active) {
        button.classList.add("active");
        button.setAttribute("aria-current", "page");
      }

      if (!disabled) {
        button.addEventListener(
          "click",
          handler || function () {
            loadRevenues(target);
          }
        );
      }

      pager.appendChild(button);
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
      !hasVerifiedNext,
      false,
      "다음 페이지"
    );

    // 마지막 페이지
    add(
      "»",
      lastPage,
      "nav-btn",
      isLast || knownEnd === 1,
      false,
      "마지막 페이지",
      function () {
        if (lastPage !== null) {
          loadRevenues(lastPage);
        } else {
          findLastPage();
        }
      }
    );
  }

  // =====================================
  // 4. 실제 수익금 목록 조회
  // =====================================

  async function loadRevenues(page) {
    const sequence = ++requestSequence;

    currentPage = Math.max(1, page || 1);

    showMessage("조회 중...");
    $("pager").replaceChildren();

    try {
      // 실제 수익금 API
      const data = await api.get(
        "/seller/revenues",
        queryFor(currentPage)
      );

      if (sequence !== requestSequence) {
        return;
      }

      const list = checkResponse(data);

      // 현재 페이지의 데이터가 사라졌다면
      // 이전 페이지로 이동
      if (list.length === 0 && currentPage > 1) {
        lastPage = currentPage - 1;
        maxKnownPage = lastPage;

        await loadRevenues(lastPage);
        return;
      }

      // =====================================
      // 5. 정산 예정액 및 건수
      // =====================================

      const expected = Number(
        data.expected_settlement || 0
      );

      $("expectedSettlement").textContent =
        Number.isFinite(expected)
          ? expected.toLocaleString("ko-KR")
          : "0";

      // 현재 페이지 조회 건수
      $("totalCount").textContent =
        String(list.length);

      // =====================================
      // 6. 수익금 테이블 출력
      // =====================================

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

      maxKnownPage = Math.max(
        maxKnownPage,
        currentPage
      );

      // =====================================
      // 7. 다음 페이지 존재 여부 확인
      // =====================================

      if (list.length < PAGE_SIZE) {
        // 10건 미만이면 마지막 페이지
        lastPage = currentPage;
        maxKnownPage = lastPage;

      } else if (lastPage === null) {
        // 10건이면 다음 페이지가 있는지 직접 확인
        try {
          const nextData = await api.get(
            "/seller/revenues",
            queryFor(currentPage + 1)
          );

          if (sequence !== requestSequence) {
            return;
          }

          const nextList = checkResponse(nextData);

          if (nextList.length > 0) {
            maxKnownPage = Math.max(
              maxKnownPage,
              currentPage + 1
            );
          } else {
            lastPage = currentPage;
            maxKnownPage = currentPage;
          }

        } catch (probeError) {
          if (sequence !== requestSequence) {
            return;
          }

          console.warn(
            "다음 페이지 확인 실패:",
            probeError
          );
        }
      }

      if (sequence !== requestSequence) {
        return;
      }

      // 페이지네이션 출력
      renderPager();

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

      showMessage(
        "수익금 내역을 불러오지 못했습니다."
      );

      $("pager").replaceChildren();
    }
  }

  // =====================================
  // 8. 마지막 페이지 이동
  // =====================================

  async function findLastPage() {
    if (lastPage !== null) {
      loadRevenues(lastPage);
      return;
    }

    const previousPage = currentPage;
    const sequence = ++requestSequence;

    let page = maxKnownPage;

    showMessage(
      "마지막 페이지를 확인하는 중..."
    );

    $("pager")
      .querySelectorAll("button")
      .forEach(function (button) {
        button.disabled = true;
      });

    try {
      // 서버가 전체 페이지 수를 제공하지 않으므로
      // 실제 페이지를 순차적으로 확인
      for (
        let attempt = 0;
        attempt < MAX_LAST_PAGE_SCAN;
        attempt++, page++
      ) {
        const result = await api.get(
          "/seller/revenues",
          queryFor(page)
        );

        if (sequence !== requestSequence) {
          return;
        }

        const rows = checkResponse(result);

        if (rows.length < PAGE_SIZE) {
          lastPage =
            rows.length === 0 && page > 1
              ? page - 1
              : page;

          maxKnownPage = lastPage;

          await loadRevenues(lastPage);
          return;
        }

        maxKnownPage = Math.max(
          maxKnownPage,
          page
        );
      }

      throw new Error(
        "마지막 페이지 확인 한도를 초과했습니다."
      );

    } catch (err) {
      if (
        sequence !== requestSequence ||
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error(
        "마지막 페이지 확인 실패:",
        err
      );

      alert(
        "마지막 페이지를 확인하지 못했습니다. " +
        "이전/다음 페이지로 이동해 주세요."
      );

      await loadRevenues(previousPage);
    }
  }

  // =====================================
  // 9. 기간 및 상태 필터
  // =====================================

  $("filterForm").addEventListener(
    "submit",
    function (e) {
      e.preventDefault();

      const newFilters = readFilters();

      if (
        newFilters.date_from &&
        newFilters.date_to &&
        newFilters.date_from > newFilters.date_to
      ) {
        alert(
          "시작일이 종료일보다 늦을 수 없습니다."
        );
        return;
      }

      // 검색 조건 변경 시 페이지 정보 초기화
      appliedFilters = newFilters;
      maxKnownPage = 1;
      lastPage = null;

      loadRevenues(1);
    }
  );

  // =====================================
  // 10. 최초 수익금 목록 조회
  // =====================================

  loadRevenues(1);

})();
