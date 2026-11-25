<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>수익금 내역</h2>

<%-- S-07 검색 필터 --%>
<form id="filterForm" class="filter">
  <label>기간 <input type="date" id="date_from"> ~ <input type="date" id="date_to"></label>
  <label>구분
    <select id="status">
      <option value="">전체</option>
      <option value="COMPLETED">거래완료</option>
      <option value="CANCELED">취소</option>
    </select>
  </label>
  <button type="submit">조회</button>
</form>

<div class="summary">
  <p>조회 기간 정산 예정액: <strong id="expectedSettlement">0</strong>원</p>
  <p>총 <strong id="totalCount">0</strong>건</p>
</div>

<table class="list">
  <thead>
    <tr><th>일자</th><th>주문상품 ID</th><th>주문금액</th><th>수수료</th><th>정산액</th><th>구분</th></tr>
  </thead>
  <tbody id="revenueTbody">
    <tr><td colspan="6">조회 중...</td></tr>
  </tbody>
</table>

<div id="pager" class="pager"></div>

<p><a href="withdraw.jsp">출금 신청하러 가기 →</a></p>

<script src="resources/js/seller/revenue.js?v=20261125-R5"></script>
<%@ include file="include/footer.jsp" %>
