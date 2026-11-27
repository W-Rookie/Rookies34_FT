<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>출금</h2>
<!-- seller-ui-build: SELLER-CLEAN-20261125-R5 -->

<%-- S-08 출금 신청 --%>
<section class="panel">
  <h3>출금 신청</h3>
  <p>출금 가능액: <strong id="availableAmount">-</strong></p>
  <form id="withdrawForm">
    <label>출금 금액(원) <input type="number" id="amount" min="1" step="1" required></label>
    <button type="submit" id="withdrawBtn">출금 신청</button>
  </form>
  <p>정산 계좌 변경은 <a href="settings.jsp">정보 수정</a>에서 할 수 있습니다.</p>
</section>

<%-- S-09 출금 내역 --%>
<h3>출금 내역</h3>
<p>총 <strong id="totalCount">0</strong>건</p>

<table class="list">
  <thead>
    <tr><th>신청 ID</th><th>신청일</th><th>금액</th><th>처리 상태</th></tr>
  </thead>
  <tbody id="withdrawTbody">
    <tr><td colspan="4">조회 중...</td></tr>
  </tbody>
</table>

<div id="pager" class="pager"></div>

<script src="resources/js/seller/withdraw.js?v=pager-design-1"></script>
<%@ include file="include/footer.jsp" %>
