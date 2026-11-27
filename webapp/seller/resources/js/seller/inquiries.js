
/**
 * inquiries.js - 판매자 상품 문의 (S-12, S-06)
 *
 * 목록: GET  /api/seller/product-inquiries?page=1
 * 답변: POST /api/seller/product-inquiries/{inquiryId}/answer
 *
 * 실제 API 연동 / 더미데이터 미사용
 */
(function () {
  "use strict";

  const $ = function (id) {
    return document.getElementById(id);
  };

  const PAGE_SIZE = 10;
  const MAX_FETCH_PAGES = 100;

  let currentPage = 1;
  let filteredInquiries = [];
  let selectedInquiry = null;
  let loadSequence = 0;

  // =====================================
  // 1. 테이블 셀 생성
  // =====================================

  function td(value) {
    const cell = document.createElement("td");
    cell.textContent =
      value === null || value === undefined
        ? "-"
        : String(value);
    return cell;
  }

  function showRow(message) {
    const tbody = $("inquiryTbody");
    tbody.replaceChildren();

    const tr = document.createElement("tr");
    const cell = td(message);
    cell.colSpan = 7;

    tr.appendChild(cell);
    tbody.appendChild(tr);
  }

  // =====================================
  // 2. 페이지 이동
  // =====================================

  function renderPager() {
    const pager = $("inquiryPager");
    pager.replaceChildren();

    const pages = Math.max(
      1,
      Math.ceil(filteredInquiries.length / PAGE_SIZE)
    );

    if (pages <= 1) return;

    const start = Math.max(
      1,
      Math.min(currentPage - 2, pages - 4)
    );
    const end = Math.min(pages, start + 4);

    function add(label, page, disabled, active) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = disabled;

      if (active) {
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", function () {
        renderPage(page);
      });

      pager.appendChild(button);
    }

    add(
      "이전",
      currentPage - 1,
      currentPage === 1,
      false
    );

    for (let p = start; p <= end; p++) {
      add(
        String(p),
        p,
        p === currentPage,
        p === currentPage
      );
    }

    add(
      "다음",
      currentPage + 1,
      currentPage === pages,
      false
    );
  }

  // =====================================
  // 3. 답변 패널 닫기
  // =====================================

  function closeAnswer() {
    $("answerPanel").hidden = true;
    $("answerForm").reset();
    $("answerLen").textContent = "0";
    $("answerMsg").textContent = "";

    $("answer").disabled = false;
    $("answerBtn").disabled = false;

    selectedInquiry = null;
  }

  // =====================================
  // 4. 답변 패널 열기
  // =====================================

  function openAnswer(inquiry) {
    selectedInquiry = inquiry;

    $("inquiry_id").value = String(inquiry.inquiry_id);

    $("answerPanelTitle").textContent =
      "문의 답변 (ID: " + inquiry.inquiry_id + ")";

    const question = inquiry.title
      ? "[" + inquiry.title + "] " + (inquiry.content || "")
      : (inquiry.content || "상품 문의 내용을 확인해 주세요.");

    // 실제 DB 데이터의 HTML 실행 방지
    $("selectedQuestion").textContent = question;

    $("answerMsg").textContent = "";
    $("answer").value = "";
    $("answerLen").textContent = "0";

    const answered = inquiry.is_answered === true;

    $("existingAnswer").hidden = !answered;

    // 현재 백엔드 응답은 답변 본문을 제공하지 않음
    $("existingAnswer").textContent = answered
      ? "이미 답변이 등록된 문의입니다."
      : "";

    $("answer").disabled = answered;
    $("answerBtn").disabled = answered;

    $("answerPanel").hidden = false;

    $("answerPanel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // =====================================
  // 5. 문의 목록 화면 출력
  // =====================================

  function renderPage(page) {
    closeAnswer();

    const pages = Math.max(
      1,
      Math.ceil(filteredInquiries.length / PAGE_SIZE)
    );

    currentPage = Math.max(
      1,
      Math.min(page || 1, pages)
    );

    $("inquiryTotalCount").textContent =
      String(filteredInquiries.length);

    const tbody = $("inquiryTbody");
    tbody.replaceChildren();

    const start = (currentPage - 1) * PAGE_SIZE;
    const inquiries = filteredInquiries.slice(
      start,
      start + PAGE_SIZE
    );

    if (!inquiries.length) {
      showRow("조회된 문의가 없습니다.");
      renderPager();
      return;
    }

    inquiries.forEach(function (q) {
      const tr = document.createElement("tr");

      tr.appendChild(td(q.inquiry_id));
      tr.appendChild(td(q.product_name || q.product_id));

      tr.appendChild(
        td(
          (q.is_secret ? "[비밀] " : "") +
          (q.title || "상품 문의")
        )
      );

      const questionCell = td(q.content || "-");
      questionCell.classList.add("question-cell");
      tr.appendChild(questionCell);

      tr.appendChild(td(q.created_at));

      tr.appendChild(
        td(
          q.is_answered === true
            ? "답변 완료"
            : "미답변"
        )
      );

      // 답변하기 / 답변 보기 버튼
      const actions = document.createElement("td");
      const button = document.createElement("button");

      button.type = "button";
      button.textContent =
        q.is_answered === true
          ? "답변 보기"
          : "답변하기";

      button.addEventListener("click", function () {
        openAnswer(q);
      });

      actions.appendChild(button);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    });

    renderPager();
  }

  // =====================================
  // 6. 실제 문의 목록 API 조회
  // =====================================

  async function fetchAllInquiries(sequence) {
    const all = [];

    // 백엔드가 페이지당 10건만 반환하므로
    // 전체 페이지를 읽어 프론트에서 필터 적용
    for (let page = 1; page <= MAX_FETCH_PAGES; page++) {
      const result = await api.get(
        "/seller/product-inquiries",
        { page: page }
      );

      if (sequence !== loadSequence) {
        return null;
      }

      if (
        !result ||
        result.code !== "ok" ||
        !Array.isArray(result.inquiries)
      ) {
        throw new Error(
          "상품 문의 API 응답 형식이 올바르지 않습니다."
        );
      }

      all.push(...result.inquiries);

      // 마지막 페이지
      if (result.inquiries.length < PAGE_SIZE) {
        return all;
      }
    }

    throw new Error(
      "문의가 너무 많아 전체 목록을 읽지 못했습니다. " +
      "서버 페이지네이션 지원이 필요합니다."
    );
  }

  // =====================================
  // 7. 문의 목록 새로고침 및 필터
  // =====================================

  async function loadInquiries(page) {
    const sequence = ++loadSequence;

    closeAnswer();
    showRow("문의 목록을 불러오는 중...");
    $("inquiryPager").replaceChildren();

    try {
      const all = await fetchAllInquiries(sequence);

      if (sequence !== loadSequence || all === null) {
        return;
      }

      const filter = $("answeredFilter").value;

      filteredInquiries = all.filter(function (q) {
        if (filter === "true") {
          return q.is_answered === true;
        }

        if (filter === "false") {
          return q.is_answered === false;
        }

        return true;
      });

      renderPage(page);

    } catch (err) {
      if (
        sequence !== loadSequence ||
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error("상품 문의 목록 조회 오류:", err);

      filteredInquiries = [];
      $("inquiryTotalCount").textContent = "0";

      showRow(
        "문의 목록을 불러오지 못했습니다. " +
        (err.message || "")
      );

      $("inquiryPager").replaceChildren();
    }
  }

  // =====================================
  // 8. 샘플 초기화 버튼 숨기기
  // =====================================

  const resetMockBtn = $("inquiryResetMock");

  if (resetMockBtn) {
    resetMockBtn.hidden = true;
  }

  // =====================================
  // 9. 답변 여부 검색
  // =====================================

  $("inquiryFilterForm").addEventListener(
    "submit",
    function (e) {
      e.preventDefault();
      loadInquiries(1);
    }
  );

  // =====================================
  // 10. 답변 글자 수
  // =====================================

  $("answer").addEventListener("input", function () {
    $("answerLen").textContent =
      String(this.value.length);
  });

  $("closeAnswer").addEventListener(
    "click",
    closeAnswer
  );

  // =====================================
  // 11. 실제 문의 답변 등록 API
  // =====================================

  $("answerForm").addEventListener(
    "submit",
    async function (e) {
      e.preventDefault();

      if (
        !selectedInquiry ||
        selectedInquiry.is_answered === true
      ) {
        return;
      }

      const id = selectedInquiry.inquiry_id;
      const answer = $("answer").value.trim();

      if (!answer || answer.length > 1000) {
        $("answerMsg").textContent =
          "답변을 1~1000자로 입력해 주세요.";
        return;
      }

      $("answerBtn").disabled = true;
      $("answerMsg").textContent = "";

      try {
        // S-06 실제 답변 등록 API
        const result = await api.post(
          "/seller/product-inquiries/" +
            encodeURIComponent(id) +
            "/answer",
          { answer: answer }
        );

        if (!result || result.code !== "ok") {
          throw new Error("답변 등록 API 응답 오류");
        }

        alert("답변이 등록되었습니다.");

        // 서버에서 다시 조회하여 답변 상태 갱신
        await loadInquiries(currentPage);

      } catch (err) {
        if (err.message !== "UNAUTHORIZED") {
          console.error("상품 문의 답변 등록 오류:", err);

          $("answerMsg").textContent =
            err.message || "답변 등록에 실패했습니다.";
        }

        if (selectedInquiry) {
          $("answerBtn").disabled = false;
        }
      }
    }
  );

  // =====================================
  // 12. 최초 목록 조회
  // =====================================

  loadInquiries(1);

})();
