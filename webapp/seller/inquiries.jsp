
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>상품 문의 답변</h2>

<%-- S-12 상품 문의 목록 조회: GET /api/seller/product-inquiries --%>

<!-- =====================================
     1. 답변 여부 필터
===================================== -->
<form id="inquiryFilterForm" class="filter">

  <label for="answeredFilter">답변 여부</label>

  <select id="answeredFilter" name="is_answered">
    <option value="">전체</option>
    <option value="false">미답변</option>
    <option value="true">답변 완료</option>
  </select>

  <button type="submit">조회</button>

</form>

<!-- =====================================
     2. 상품 문의 조회 결과
===================================== -->
<div class="list-meta">
  <p>
    조회 결과
    <strong id="inquiryTotalCount">0</strong>건
    <small>미답변/답변 완료 필터 · 페이지 이동 지원</small>
  </p>
</div>

<!-- =====================================
     3. 상품 문의 목록 테이블
===================================== -->
<div class="table-scroll">

  <table class="list">

    <thead>
      <tr>
        <th>문의 ID</th>
        <th>상품명</th>
        <th>제목</th>
        <th>문의 내용</th>
        <th>문의일</th>
        <th>답변 여부</th>
        <th>관리</th>
      </tr>
    </thead>

    <tbody id="inquiryTbody">
      <tr>
        <td colspan="7">조회 중...</td>
      </tr>
    </tbody>

  </table>

</div>

<!-- =====================================
     4. 문의 목록 페이지 이동
===================================== -->
<div
  id="inquiryPager"
  class="pager"
  aria-label="문의 목록 페이지">
</div>

<!-- =====================================
     5. 상품 문의 답변 등록
     S-06 POST /api/seller/product-inquiries/{id}/answer
===================================== -->
<section id="answerPanel" class="panel" hidden>

  <h3 id="answerPanelTitle">문의 답변</h3>

  <!-- 선택한 문의 내용 -->
  <p
    id="selectedQuestion"
    class="question-display">
  </p>

  <!-- 이미 답변한 문의 안내 -->
  <p
    id="existingAnswer"
    class="msg"
    hidden>
  </p>

  <!-- 답변 등록 폼 -->
  <form id="answerForm">

    <input
      type="hidden"
      id="inquiry_id">

    <div>
      <label for="answer">답변 *</label>

      <textarea
        id="answer"
        name="answer"
        rows="6"
        maxlength="1000"
        required></textarea>

      <small>
        <span id="answerLen">0</span> / 1000자
      </small>
    </div>

    <!-- 답변 등록 버튼 -->
    <button
      type="submit"
      id="answerBtn">
      답변 등록
    </button>

    <!-- 답변 패널 닫기 버튼 -->
    <button
      type="button"
      class="closeBtn"
      id="closeAnswer">
      닫기
    </button>

  </form>

  <!-- 답변 등록 결과 메시지 -->
  <p
    id="answerMsg"
    class="msg"
    role="status">
  </p>

</section>

<!-- =====================================
     6. 실제 상품 문의 API 연동
     더미데이터 사용하지 않음
===================================== -->
<script src="resources/js/seller/inquiries.js?v=real-api-2"></script>

<%@ include file="include/footer.jsp" %>
