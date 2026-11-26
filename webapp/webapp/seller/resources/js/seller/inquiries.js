/** S-12 상품 문의 목록 조회 + S-06 문의 답변 등록. */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const mockMode = sellerMock.useMockLists;
  const PAGE_SIZE = sellerMock.pageSize;
  let currentPage = 1;
  let selectedInquiry = null;
  let selectedIsMock = false;

  function td(value) {
    const cell = document.createElement("td");
    cell.textContent = value === null || value === undefined ? "-" : String(value);
    return cell;
  }
  function renderPager(total, size) {
    const pager = $("inquiryPager");
    pager.replaceChildren();
    const pages = Math.max(1, Math.ceil(total / size));
    const start = Math.max(1, Math.min(currentPage - 2, pages - 4));
    const end = Math.min(pages, start + 4);
    function add(text, page, disabled, active) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      b.disabled = disabled;
      if (active) b.setAttribute("aria-current", "page");
      b.addEventListener("click", function () { loadInquiries(page); });
      pager.appendChild(b);
    }
    if (pages > 1) {
      add("이전", currentPage - 1, currentPage === 1, false);
      for (let p = start; p <= end; p++) add(String(p), p, p === currentPage, p === currentPage);
      add("다음", currentPage + 1, currentPage === pages, false);
    }
  }
  function closeAnswer() {
    $("answerPanel").hidden = true;
    $("answerForm").reset();
    $("answerLen").textContent = "0";
    $("answerMsg").textContent = "";
    selectedInquiry = null;
    selectedIsMock = false;
  }
  function openAnswer(inquiry, isMock) {
    selectedInquiry = inquiry;
    selectedIsMock = isMock;
    $("inquiry_id").value = String(inquiry.inquiry_id);
    $("answerPanelTitle").textContent = "문의 답변 (ID: " + inquiry.inquiry_id + ")";
    $("selectedQuestion").textContent = inquiry.title
      ? "[" + inquiry.title + "] " + (inquiry.content || inquiry.question || "")
      : (inquiry.question || "상품 문의 내용을 확인해 주세요.");
    $("answerMsg").textContent = "";
    $("answer").value = "";
    $("answerLen").textContent = "0";
    const answered = inquiry.is_answered === true;
    $("existingAnswer").hidden = !answered;
    $("existingAnswer").textContent = answered ? "등록된 답변: " + (inquiry.answer || "답변 완료") : "";
    $("answer").disabled = answered;
    $("answerBtn").disabled = answered;
    $("answerPanel").hidden = false;
    $("answerPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function loadInquiries(page) {
    currentPage = page || 1;
    closeAnswer();
    const tbody = $("inquiryTbody");
    tbody.replaceChildren();
    const loading = document.createElement("tr");
    const cell = td("문의 목록을 불러오는 중...");
    cell.colSpan = 7;
    loading.appendChild(cell);
    tbody.appendChild(loading);
    try {
      const query = { is_answered: $("answeredFilter").value, page: currentPage };
      const result = mockMode ? sellerMock.listInquiries(query) : await api.get("/seller/product-inquiries", query);
      // 응답 스키마 임시 가정: { num, inquiries, page_size }; S-12 BE 합의 후 조정
      const inquiries = Array.isArray(result.inquiries) ? result.inquiries : [];
      const total = Number(result.num ?? inquiries.length);
      const size = Number(result.page_size) > 0 ? Number(result.page_size) : PAGE_SIZE;
      $("inquiryTotalCount").textContent = String(total);
      tbody.replaceChildren();
      if (!inquiries.length) {
        const row = document.createElement("tr");
        const empty = td("조회된 문의가 없습니다.");
        empty.colSpan = 7;
        row.appendChild(empty);
        tbody.appendChild(row);
      }
      inquiries.forEach(function (q) {
        const tr = document.createElement("tr");
        tr.appendChild(td(q.inquiry_id));
        tr.appendChild(td(q.product_name || q.product_id));
        tr.appendChild(td((q.is_secret ? "[비밀] " : "") + (q.title || "상품 문의")));
        const question = td(q.content || q.question || "-");
        question.classList.add("question-cell");
        tr.appendChild(question);
        tr.appendChild(td(q.asked_at || q.created_at));
        tr.appendChild(td(q.is_answered ? "답변 완료" : "미답변"));
        const action = document.createElement("td");
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = q.is_answered ? "답변 보기" : "답변하기";
        b.addEventListener("click", function () { openAnswer(q, mockMode); });
        action.appendChild(b);
        tr.appendChild(action);
        tbody.appendChild(tr);
      });
      renderPager(total, size);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      $("inquiryTotalCount").textContent = "0";
      tbody.replaceChildren();
      const row = document.createElement("tr");
      const error = td("문의 목록을 불러오지 못했습니다. " + (err.message || ""));
      error.colSpan = 7;
      row.appendChild(error);
      tbody.appendChild(row);
      $("inquiryPager").replaceChildren();
    }
  }
  $("inquiryResetMock").hidden = !mockMode;
  $("inquiryResetMock").addEventListener("click", function () {
    if (!mockMode || !confirm("상품·문의 샘플 데이터 변경 내용을 초기화할까요?")) return;
    sellerMock.reset();
    loadInquiries(1);
  });
  $("inquiryFilterForm").addEventListener("submit", function (e) {
    e.preventDefault();
    loadInquiries(1);
  });  $("answer").addEventListener("input", function () {
    $("answerLen").textContent = String(this.value.length);
  });
  $("closeAnswer").addEventListener("click", closeAnswer);
  $("answerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!selectedInquiry || selectedInquiry.is_answered) return;
    const id = $("inquiry_id").value;
    const answer = $("answer").value.trim();
    if (!answer || answer.length > 1000) {
      $("answerMsg").textContent = "답변을 1~1000자로 입력해 주세요.";
      return;
    }
    $("answerBtn").disabled = true;
    $("answerMsg").textContent = "";
    try {
      if (selectedIsMock) sellerMock.answerInquiry(id, answer);
      else await api.post("/seller/product-inquiries/" + encodeURIComponent(id) + "/answer", { answer: answer });
      alert(selectedIsMock ? "샘플 답변이 브라우저에 저장되었습니다. 실제 서버에는 전송되지 않았습니다." : "답변이 등록되었습니다.");
      if (selectedIsMock) loadInquiries(currentPage);  // 답변 상태/목록 필터 갱신
      else { closeAnswer(); if (!mockMode) loadInquiries(currentPage); }
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") $("answerMsg").textContent = err.message || "답변 등록에 실패했습니다.";
      $("answerBtn").disabled = false;
    }
  });
  loadInquiries(1);
})();
