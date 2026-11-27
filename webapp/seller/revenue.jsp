
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>수익금 내역</h2>

<%-- =====================================
     1. S-07 수익금 내역 검색 필터
===================================== --%>
<form id="filterForm" class="filter">

  <label>
    기간
    <input type="date" id="date_from">
    ~
    <input type="date" id="date_to">
  </label>

  <label>
    구분
    <select id="status">
      <option value="">전체</option>
      <option value="COMPLETED">거래완료</option>
      <option value="CANCELED">취소</option>
    </select>
  </label>

  <button type="submit">조회</button>

</form>

<%-- =====================================
     2. 수익금 조회 결과 요약
===================================== --%>
<div class="summary">

  <p>
    조회 기간 정산 예정액:
    <strong id="expectedSettlement">0</strong>원
  </p>

  <p>
    현재 페이지
    <strong id="totalCount">0</strong>건
  </p>

</div>

<%-- =====================================
     3. 수익금 내역 테이블
===================================== --%>
<div class="table-scroll">

  <table class="list">

    <thead>
      <tr>
        <th>일자</th>
        <th>주문상품 ID</th>
        <th>주문금액</th>
        <th>수수료</th>
        <th>정산액</th>
        <th>구분</th>
      </tr>
    </thead>

    <tbody id="revenueTbody">
      <tr>
        <td colspan="6">조회 중...</td>
      </tr>
    </tbody>

  </table>

</div>

<%-- =====================================
     4. 수익금 내역 페이지 이동
     revenue.js에서 동적으로 생성
===================================== --%>
<div
  id="pager"
  class="pager"
  aria-label="수익금 내역 페이지">
</div>

<%-- =====================================
     5. 출금 신청 페이지 이동
===================================== --%>
<p>
  <a href="withdraw.jsp">
    출금 신청하러 가기 →
  </a>
</p>

<%-- =====================================
     6. 실제 수익금 API 연동
     GET /api/seller/revenues
===================================== --%>
<script src="resources/js/seller/revenue.js?v=real-api-pagination-1"></script>

<%@ include file="include/footer.jsp" %>
