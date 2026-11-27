/**
 * claims.js - 판매자 취소·환불 관리
 *
 * GET   /api/seller/claims?page=&status=
 * PATCH /api/seller/claims/{claimId}
 *       { decision: "COMPLETED" | "REJECTED" }
 *
 * 전체 건수/페이지 크기가 확정되지 않았으므로 다음 페이지의
 * 실제 데이터 존재 여부로 이동 가능 여부를 판단합니다.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const MAX_LAST_PAGE_SCAN = 100;

  const STATUS_LABEL = {
    PENDING: "처리 대기",
    REQUESTED: "접수",
    COMPLETED: "처리 완료",
    REJECTED: "반려"
  };

  const TYPE_LABEL = {
    CANCEL: "취소",
    CANCELLATION: "취소",
    REFUND: "환불"
  };

  let currentPage = 1;
  let maxKnownPage = 1;
  let lastPage = null;
  let requestSequence = 0;
  let updating = false;
  let appliedStatus = $("claimStatus").value;

  // =====================================
  // 1. 공통 함수
  // =====================================

  // 응답 필드명이 다를 경우 이 부분에서 수정
  function pick(obj, names) {
    for (const name of names) {
      if (
        obj[name] !== undefined &&
        obj[name] !== null &&
        obj[name] !== ""
      ) {
        return obj[name];
      }
    }
    return null;
  }

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
    const row = document.createElement("tr");
    const cell = td(message);

    cell.colSpan = 8;
    row.appendChild(cell);

    $("claimTbody").replaceChildren(row);
  }

  function setMessage(message) {
    $("claimMsg").textContent = message;
  }

  function getClaimId(claim) {
    return pick(claim, ["claim_id", "claimId"]);
  }

  function getClaimStatus(claim) {
    return pick(claim, [
      "status",
      "claim_status",
      "claimStatus"
    ]);
  }

  function getClaimType(claim) {
    return pick(claim, [
      "claim_type",
      "type",
      "request_type",
      "claimType"
    ]);
  }

  // =====================================
  // 2. 실제 취소·환불 목록 API
  // =====================================

  async function fetchClaims(page) {
    const data = await api.get(
      "/seller/claims",
      {
        page: page,
        status: appliedStatus
      }
    );

    if (
      !data ||
      data.code !== "ok" ||
      !Array.isArray(data.claims)
    ) {
      throw new Error(
        "취소·환불 목록 API 응답 형식 오류 " +
        "(claims 배열 확인 필요)"
      );
    }

    return data;
  }

  // =====================================
  // 3. 페이지네이션
  // « ‹ 1 2 3 4 5 › »
  // =====================================

  function renderPager() {
    const pager = $("claimPager");
    pager.replaceChildren();

    const knownEnd =
      lastPage === null ? maxKnownPage : lastPage;

    const start = Math.max(
      1,
      Math.min(currentPage - 2, knownEnd - 4)
    );

    const end = Math.min(knownEnd, start + 4);

    const first = currentPage === 1;

    const final =
      lastPage !== null &&
      currentPage >= lastPage;

    function add(
      text,
      target,
      className,
      disabled,
      active,
      label,
      action
    ) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = className;
      button.textContent = text;
      button.disabled = disabled;

      button.setAttribute("aria-label", label);

      if (active) {
        button.classList.add("active");
        button.setAttribute("aria-current", "page");
      }

      if (!disabled) {
        button.addEventListener(
          "click",
          action || function () {
            loadClaims(target);
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
      first,
      false,
      "첫 페이지"
    );

    // 이전 페이지
    add(
      "‹",
      currentPage - 1,
      "nav-btn",
      first,
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
      currentPage >= knownEnd,
      false,
      "다음 페이지"
    );

    // 마지막 페이지
    add(
      "»",
      lastPage,
      "nav-btn",
      final,
      false,
      "마지막 페이지",
      function () {
        if (lastPage !== null) {
          loadClaims(lastPage);
        } else {
          findLastPage();
        }
      }
    );
  }

  // =====================================
  // 4. 취소·환불 목록 출력
  // =====================================

  function renderClaims(claims) {
    const tbody = $("claimTbody");

    tbody.replaceChildren();

    $("claimTotalCount").textContent =
      String(claims.length);

    if (claims.length === 0) {
      showMessage(
        "취소·환불 신청 내역이 없습니다."
      );
      return;
    }

    claims.forEach(function (claim) {
      const row = document.createElement("tr");

      const claimId = getClaimId(claim);
      const status = getClaimStatus(claim);
      const type = getClaimType(claim);

      // 클레임 ID
      row.appendChild(td(claimId));

      // 주문 ID
      row.appendChild(
        td(
          pick(claim, [
            "order_id",
            "order_item_id",
            "orderId",
            "orderItemId"
          ])
        )
      );

      // 취소 / 환불 구분
      row.appendChild(
        td(
          type === null
            ? "-"
            : (TYPE_LABEL[type] || type)
        )
      );

      // 요청 사유
      row.appendChild(
        td(
          pick(claim, [
            "reason",
            "claim_reason",
            "reason_detail",
            "description"
          ])
        )
      );

      // 요청 금액
      row.appendChild(
        td(
          won(
            pick(claim, [
              "refund_amount",
              "amount",
              "request_amount"
            ])
          )
        )
      );

      // 요청 일시
      row.appendChild(
        td(
          pick(claim, [
            "created_at",
            "requested_at",
            "createdAt",
            "requestedAt"
          ])
        )
      );

      // 처리 상태
      row.appendChild(
        td(
          status === null
            ? "-"
            : (STATUS_LABEL[status] || status)
        )
      );

      // =====================================
      // 5. 취소·환불 관리 버튼
      // =====================================

      const actions = document.createElement("td");

      const completed =
        status === "COMPLETED" ||
        status === "REJECTED";

      // 이미 처리된 요청
      if (completed) {
        actions.textContent = "처리 완료";

      } else {
        // 완료 처리 버튼
        const completeButton =
          document.createElement("button");

        completeButton.type = "button";
        completeButton.textContent = "완료 처리";
        completeButton.className = "subtle-btn";

        completeButton.disabled =
          claimId === null;

        // 반려 버튼
        const rejectButton =
          document.createElement("button");

        rejectButton.type = "button";
        rejectButton.textContent = "반려";
        rejectButton.className = "subtle-btn";

        rejectButton.style.marginLeft = "6px";

        rejectButton.disabled =
          claimId === null;

        // 완료 처리
        completeButton.addEventListener(
          "click",
          function () {
            updateClaim(
              claimId,
              "COMPLETED"
            );
          }
        );

        // 반려 처리
        rejectButton.addEventListener(
          "click",
          function () {
            updateClaim(
              claimId,
              "REJECTED"
            );
          }
        );

        actions.appendChild(completeButton);
        actions.appendChild(rejectButton);
      }

      row.appendChild(actions);
      tbody.appendChild(row);
    });
  }

  // =====================================
  // 6. 실제 취소·환불 목록 조회
  // =====================================

  async function loadClaims(page) {
    const sequence = ++requestSequence;

    currentPage = Math.max(
      1,
      Number(page) || 1
    );

    showMessage(
      "취소·환불 내역을 불러오는 중..."
    );

    $("claimPager").replaceChildren();
    setMessage("");

    try {
      const data = await fetchClaims(currentPage);

      if (sequence !== requestSequence) {
        return;
      }

      const claims = data.claims;

      // 마지막 페이지가 비었다면 이전 페이지
      if (
        claims.length === 0 &&
        currentPage > 1
      ) {
        lastPage = currentPage - 1;
        maxKnownPage = lastPage;

        await loadClaims(lastPage);
        return;
      }

      renderClaims(claims);

      maxKnownPage = Math.max(
        maxKnownPage,
        currentPage
      );

      // =====================================
      // 7. 다음 페이지 존재 여부 확인
      // =====================================

      // 서버가 전체 페이지 수를 반환하면 사용
      const totalPages = Number(
        data.total_pages ?? data.totalPages
      );

      if (
        Number.isInteger(totalPages) &&
        totalPages >= currentPage
      ) {
        lastPage = totalPages;
        maxKnownPage = totalPages;

      } else if (claims.length === 0) {
        lastPage = 1;
        maxKnownPage = 1;

      } else if (lastPage === null) {

        // 서버 페이지 크기를 알 수 없으므로
        // 다음 페이지를 직접 조회
        try {
          const nextData = await fetchClaims(
            currentPage + 1
          );

          if (sequence !== requestSequence) {
            return;
          }

          if (nextData.claims.length > 0) {
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
            "다음 취소·환불 페이지 확인 실패:",
            probeError
          );

          setMessage(
            "다음 페이지 확인에 실패했습니다. " +
            "새로 조회해 주세요."
          );
        }
      }

      if (sequence !== requestSequence) {
        return;
      }

      renderPager();

    } catch (err) {

      if (
        sequence !== requestSequence ||
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error(
        "취소·환불 목록 조회 오류:",
        err
      );

      $("claimTotalCount").textContent = "0";

      showMessage(
        "취소·환불 내역을 불러오지 못했습니다."
      );

      $("claimPager").replaceChildren();

      setMessage(
        err.message || "API 응답을 확인해 주세요."
      );
    }
  }

  // =====================================
  // 8. 마지막 페이지 찾기
  // =====================================

  async function findLastPage() {
    if (lastPage !== null) {
      await loadClaims(lastPage);
      return;
    }

    const sequence = ++requestSequence;
    const originalPage = currentPage;
    const startPage = maxKnownPage;

    setMessage(
      "마지막 페이지를 확인하는 중..."
    );

    $("claimPager")
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
        const data = await fetchClaims(p);

        if (sequence !== requestSequence) {
          return;
        }

        const totalPages = Number(
          data.total_pages ?? data.totalPages
        );

        if (
          Number.isInteger(totalPages) &&
          totalPages >= 1
        ) {
          lastPage = totalPages;
          maxKnownPage = totalPages;

          await loadClaims(lastPage);
          return;
        }

        if (data.claims.length === 0) {
          lastPage = Math.max(1, p - 1);
          maxKnownPage = lastPage;

          await loadClaims(lastPage);
          return;
        }

        maxKnownPage = Math.max(
          maxKnownPage,
          p
        );
      }

      throw new Error(
        "마지막 페이지 조회 한도 초과"
      );

    } catch (err) {

      if (
        sequence !== requestSequence ||
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error(
        "마지막 페이지 탐색 실패:",
        err
      );

      alert(
        "마지막 페이지를 확인하지 못했습니다."
      );

      await loadClaims(originalPage);
    }
  }

  // =====================================
  // 9. 취소·환불 처리 API
  // PATCH /api/seller/claims/{claimId}
  // =====================================

  async function updateClaim(claimId, decision) {

    // 중복 요청 방지
    if (
      updating ||
      claimId === null
    ) {
      return;
    }

    const action =
      decision === "COMPLETED"
        ? "완료 처리"
        : "반려";

    const confirmed = confirm(
      "클레임 ID " + claimId +
      "을(를) " + action +
      "하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    updating = true;

    // 처리 중 버튼 비활성화
    $("claimPager")
      .querySelectorAll("button")
      .forEach(function (b) {
        b.disabled = true;
      });

    $("claimTbody")
      .querySelectorAll("button")
      .forEach(function (b) {
        b.disabled = true;
      });

    setMessage(
      "취소·환불 요청을 처리하는 중..."
    );

    try {

      // =====================================
      // 실제 PATCH API
      // =====================================

      const result = await api.patch(
        "/seller/claims/" +
          encodeURIComponent(claimId),
        {
          decision: decision
        }
      );

      if (
        !result ||
        result.code !== "ok"
      ) {
        throw new Error(
          "처리 API가 성공을 반환하지 않았습니다."
        );
      }

      alert(
        "취소·환불 요청이 " +
        action +
        "되었습니다."
      );

      // 처리 후 목록 재조회
      lastPage = null;
      maxKnownPage = 1;

      await loadClaims(currentPage);

    } catch (err) {

      if (
        err.message !== "UNAUTHORIZED"
      ) {
        console.error(
          "취소·환불 처리 오류:",
          err
        );

        alert(
          "처리에 실패했습니다. " +
          "서버 응답을 확인해 주세요."
        );

        await loadClaims(currentPage);
      }

    } finally {
      updating = false;
    }
  }

  // =====================================
  // 10. 상태별 필터
  // =====================================

  $("claimFilterForm").addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      appliedStatus =
        $("claimStatus").value;

      lastPage = null;
      maxKnownPage = 1;

      loadClaims(1);
    }
  );

  // =====================================
  // 11. 최초 목록 조회
  // =====================================

  loadClaims(1);

})();