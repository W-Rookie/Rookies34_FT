/**
 * withdraw.js - 출금 신청 및 출금 내역 (S-08, S-09)
 *
 * S-08 POST /api/seller/withdrawals
 *      { amount }
 *
 * S-09 GET /api/seller/withdrawals?page
 *      응답 {
 *        code,
 *        num,
 *        available_amount,
 *        withdrawals: [
 *          { withdrawal_id, amount, status, created_at }
 *        ]
 *      }
 *
 * 서버 페이지당 최대 20건 기준
 * 페이지 버튼: « ‹ 1 2 3 4 5 › »
 *
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
    REQUESTED: "신청",
    APPROVED: "승인",
    REJECTED: "반려"
  };

  let currentPage = 1;
  let maxKnownPage = 1;
  let lastPage = null;
  let loadSequence = 0;
  let submitting = false;

  // =====================================
  // 1. 공통 함수
  // =====================================

  function td(value) {
    const cell = document.createElement("td");

    cell.textContent =
      value === null || value === undefined
        ? "-"
        : String(value);

    return cell;
  }

  function won(value) {
    if (value === null || value === undefined) {
      return "-";
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number.toLocaleString("ko-KR") + "원"
      : "-";
  }

  function showMessage(message) {
    const tr = document.createElement("tr");
    const cell = td(message);

    cell.colSpan = 4;
    tr.appendChild(cell);

    $("withdrawTbody").replaceChildren(tr);
  }

  // =====================================
  // 2. 실제 출금 내역 API 조회
  // =====================================

  async function fetchWithdrawals(page) {
    const data = await api.get(
      "/seller/withdrawals",
      {
        page: page
      }
    );

    if (
      !data ||
      data.code !== "ok" ||
      !Array.isArray(data.withdrawals)
    ) {
      throw new Error(
        "출금 내역 API 응답 형식 오류"
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

    // 현재 페이지 중심으로 최대 5개 표시
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

    const hasNext =
      currentPage < knownEnd;

    // =====================================
    // 페이지 버튼 생성
    // =====================================

    function add(
      label,
      target,
      cssClass,
      disabled,
      active,
      ariaLabel,
      handler
    ) {
      const button = document.createElement("button");

      button.type = "button";
      button.textContent = label;
      button.className = cssClass;
      button.disabled = disabled;

      button.setAttribute(
        "aria-label",
        ariaLabel
      );

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
          handler || function () {
            loadWithdrawals(target);
          }
        );
      }

      pager.appendChild(button);
    }

    // =====================================
    // 처음 페이지
    // =====================================

    add(
      "«",
      1,
      "nav-btn",
      isFirst,
      false,
      "첫 페이지"
    );

    // =====================================
    // 이전 페이지
    // =====================================

    add(
      "‹",
      currentPage - 1,
      "nav-btn",
      isFirst,
      false,
      "이전 페이지"
    );

    // =====================================
    // 페이지 번호 (최대 5개)
    // =====================================

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

    // =====================================
    // 다음 페이지
    // =====================================

    add(
      "›",
      currentPage + 1,
      "nav-btn",
      !hasNext,
      false,
      "다음 페이지"
    );

    // =====================================
    // 마지막 페이지
    // =====================================

    add(
      "»",
      lastPage,
      "nav-btn",
      isLast,
      false,
      "마지막 페이지",
      function () {
        if (lastPage !== null) {
          loadWithdrawals(lastPage);
        } else {
          findLastPage();
        }
      }
    );
  }

  // =====================================
  // 4. 출금 내역 화면 출력
  // =====================================

  function renderWithdrawals(list, data) {
    const tbody = $("withdrawTbody");
    tbody.replaceChildren();

    // 기존 num 출력 방식 유지
    $("totalCount").textContent =
      String(data.num ?? list.length);

    // =====================================
    // 출금 가능액
    // =====================================

    $("availableAmount").textContent =
      won(data.available_amount);

    // =====================================
    // 출금 내역이 없는 경우
    // =====================================

    if (list.length === 0) {
      showMessage(
        "출금 내역이 없습니다."
      );
      return;
    }

    // =====================================
    // 실제 출금 내역 테이블
    // =====================================

    list.forEach(function (w) {
      const tr = document.createElement("tr");

      // 출금 신청 ID
      tr.appendChild(
        td(w.withdrawal_id)
      );

      // 출금 신청일
      tr.appendChild(
        td(w.created_at)
      );

      // 출금 신청 금액
      tr.appendChild(
        td(won(w.amount))
      );

      // 출금 상태
      tr.appendChild(
        td(
          STATUS_LABEL[w.status] ||
          w.status
        )
      );

      tbody.appendChild(tr);
    });
  }

  // =====================================
  // 5. 출금 내역 조회 (S-09)
  // =====================================

  async function loadWithdrawals(page) {
    const sequence = ++loadSequence;

    currentPage = Math.max(
      1,
      Number(page) || 1
    );

    showMessage(
      "출금 내역을 불러오는 중..."
    );

    $("pager").replaceChildren();

    try {
      // =====================================
      // 실제 출금 내역 API
      // =====================================

      const data = await fetchWithdrawals(
        currentPage
      );

      if (sequence !== loadSequence) {
        return;
      }

      const list = data.withdrawals;

      // =====================================
      // 마지막 페이지가 비었다면
      // 이전 페이지로 이동
      // =====================================

      if (
        list.length === 0 &&
        currentPage > 1
      ) {
        lastPage = currentPage - 1;
        maxKnownPage = lastPage;

        await loadWithdrawals(lastPage);
        return;
      }

      // =====================================
      // 출금 내역 출력
      // =====================================

      renderWithdrawals(
        list,
        data
      );

      maxKnownPage = Math.max(
        maxKnownPage,
        currentPage
      );

      // =====================================
      // 6. 다음 페이지 존재 여부 확인
      // =====================================

      if (list.length < PAGE_SIZE) {

        // 20건 미만이면 마지막 페이지
        lastPage = currentPage;
        maxKnownPage = currentPage;

      } else if (lastPage === null) {

        // 20건이면 다음 페이지 조회
        try {
          const nextData =
            await fetchWithdrawals(
              currentPage + 1
            );

          if (sequence !== loadSequence) {
            return;
          }

          if (nextData.withdrawals.length > 0) {

            // 다음 페이지 존재
            maxKnownPage = Math.max(
              maxKnownPage,
              currentPage + 1
            );

          } else {

            // 현재 페이지가 마지막
            lastPage = currentPage;
            maxKnownPage = currentPage;

          }

        } catch (probeError) {

          if (sequence !== loadSequence) {
            return;
          }

          console.warn(
            "다음 출금 페이지 확인 실패:",
            probeError
          );
        }
      }

      if (sequence !== loadSequence) {
        return;
      }

      // 페이지네이션 출력
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
        "출금 내역 조회 오류:",
        err
      );

      $("totalCount").textContent = "0";
      $("availableAmount").textContent = "-";

      showMessage(
        "출금 내역을 불러오지 못했습니다."
      );

      $("pager").replaceChildren();
    }
  }

  // =====================================
  // 7. 마지막 페이지 찾기
  // =====================================

  async function findLastPage() {

    // 마지막 페이지를 이미 확인한 경우
    if (lastPage !== null) {
      await loadWithdrawals(lastPage);
      return;
    }

    const sequence = ++loadSequence;

    const originalPage = currentPage;
    const startPage = maxKnownPage;

    // 조회 중 버튼 중복 클릭 방지
    $("pager")
      .querySelectorAll("button")
      .forEach(function (button) {
        button.disabled = true;
      });

    showMessage(
      "마지막 페이지를 확인하는 중..."
    );

    try {

      for (
        let p = startPage;
        p < startPage + MAX_LAST_PAGE_SCAN;
        p++
      ) {

        const data =
          await fetchWithdrawals(p);

        if (sequence !== loadSequence) {
          return;
        }

        const list = data.withdrawals;

        // =====================================
        // 마지막 페이지 판별
        // =====================================

        if (list.length < PAGE_SIZE) {

          lastPage =
            list.length === 0 && p > 1
              ? p - 1
              : p;

          maxKnownPage = lastPage;

          await loadWithdrawals(lastPage);
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
        "마지막 출금 페이지 확인 실패:",
        err
      );

      alert(
        "마지막 페이지를 확인하지 못했습니다.\n" +
        "이전/다음 페이지로 이동해 주세요."
      );

      await loadWithdrawals(originalPage);
    }
  }

  // =====================================
  // 8. 출금 신청 (S-08)
  // =====================================

  $("withdrawForm").addEventListener(
    "submit",
    async function (e) {
      e.preventDefault();

      // 중복 출금 신청 방지
      if (submitting) {
        return;
      }

      const raw = $("amount").value.trim();

      // =====================================
      // 출금 금액 검증
      // =====================================

      if (
        !/^[0-9]+$/.test(raw) ||
        !Number.isSafeInteger(Number(raw)) ||
        Number(raw) < 1
      ) {
        alert(
          "출금 금액은 1원 이상의 정수로 입력해 주세요."
        );
        return;
      }

      const amount = Number(raw);

      // =====================================
      // 출금 신청 확인
      // =====================================

      if (
        !confirm(
          amount.toLocaleString("ko-KR") +
          "원을 출금 신청하시겠습니까?"
        )
      ) {
        return;
      }

      submitting = true;

      $("withdrawBtn").disabled = true;

      try {

        // =====================================
        // 실제 출금 신청 API
        // =====================================

        const result = await api.post(
          "/seller/withdrawals",
          {
            amount: amount
          }
        );

        // 응답 코드 확인
        if (
          !result ||
          result.code !== "ok"
        ) {
          throw new Error(
            "출금 신청 API 응답 오류"
          );
        }

        alert(
          "출금 신청이 완료되었습니다.\n" +
          "관리자 승인 후 처리됩니다."
        );

        // 입력값 초기화
        $("amount").value = "";

        // =====================================
        // 출금 신청 후 목록 새로고침
        // =====================================

        // 새로운 출금 신청으로 페이지 수가
        // 변경될 수 있으므로 초기화
        maxKnownPage = 1;
        lastPage = null;

        // 방금 신청한 건이 보이도록 1페이지 조회
        await loadWithdrawals(1);

      } catch (err) {

        if (
          err &&
          err.message !== "UNAUTHORIZED"
        ) {
          console.error(
            "출금 신청 실패:",
            err
          );

          alert(
            "출금 신청에 실패했습니다.\n" +
            "출금 가능액 초과, 계좌 미등록 또는 " +
            "서버 오류일 수 있습니다."
          );
        }

      } finally {

        submitting = false;

        $("withdrawBtn").disabled = false;
      }
    }
  );

  // =====================================
  // 9. 최초 출금 내역 조회
  // =====================================

  loadWithdrawals(1);

})();