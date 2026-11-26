<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>상품 문의 답변</h2>
<!-- seller-ui-build: SELLER-CLEAN-20261125-R5 -->

<%-- S-12 받은 상품 문의 목록 조회 --%>
<form id="inquiryFilterForm" class="filter">
  <label for="answeredFilter">답변 여부</label>
  <select id="answeredFilter" name="is_answered">
    <option value="">전체</option>
    <option value="false">미답변</option>
    <option value="true">답변 완료</option>
  </select>
  <button type="submit">조회</button>
</form>
<div class="list-meta"><p>조회 결과 <strong id="inquiryTotalCount">0</strong>건 <small>미답변/답변 완료 필터 · 페이지 이동 지원</small></p><button type="button" id="inquiryResetMock" class="subtle-btn">샘플 초기화</button></div>
<div class="table-scroll">
  <table class="list">
    <thead>
      <tr><th>문의 ID</th><th>상품명</th><th>제목</th><th>문의 내용</th><th>문의일</th><th>답변 여부</th><th>관리</th></tr>
    </thead>
    <tbody id="inquiryTbody"><tr><td colspan="7">조회 중...</td></tr></tbody>
  </table>
</div>
<div id="inquiryPager" class="pager" aria-label="문의 목록 페이지"></div>

<%-- S-06 답변 등록 API 유지. 샘플 문의는 브라우저에만 저장. --%>
<section id="answerPanel" class="panel" hidden>
  <h3 id="answerPanelTitle">문의 답변</h3>
  <p id="selectedQuestion" class="question-display"></p>
  <p id="existingAnswer" class="msg" hidden></p>
  <form id="answerForm">
    <input type="hidden" id="inquiry_id">
    <div>
      <label for="answer">답변 *</label>
      <textarea id="answer" rows="6" maxlength="1000" required></textarea>
      <small><span id="answerLen">0</span> / 1000자</small>
    </div>
    <button type="submit" id="answerBtn">답변 등록</button>
    <button type="button" class="closeBtn" id="closeAnswer">닫기</button>
  </form>
  <p id="answerMsg" class="msg" role="status"></p>
</section>

<script src="resources/js/seller/mock-data.js?v=20261125-R5"></script>
<script src="resources/js/seller/inquiries.js?v=20261125-R5"></script>
<script>
  // 더미 데이터 스크립트가 누락되었을 때 원인을 화면에서 확인할 수 있도록 표시
  window.addEventListener("load", function () {
    var tb = document.getElementById("inquiryTbody");
    if (tb && /조회 중|불러오는 중/.test(tb.textContent || "")) {
      var cell = tb.querySelector("td");
      if (cell) cell.textContent = "목록 스크립트를 실행하지 못했습니다. F12 > Console과 Network에서 mock-data.js, inquiries.js를 확인해 주세요.";
    }
  });
</script>
<%@ include file="include/footer.jsp" %>
