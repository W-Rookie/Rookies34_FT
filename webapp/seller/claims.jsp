<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>취소·환불 관리</h2>

<!-- ===== 상태별 조회 ===== -->
<form id="claimFilterForm" class="filter">
  <label for="claimStatus">처리 상태</label>

  <select id="claimStatus">
    <option value="">전체</option>
    <option value="PENDING">처리 대기</option>
    <option value="COMPLETED">처리 완료</option>
    <option value="REJECTED">반려</option>
  </select>

  <button type="submit">조회</button>
</form>

<!-- ===== 조회 건수 ===== -->
<div class="summary">
  <p>
    현재 페이지
    <strong id="claimTotalCount">0</strong>건
  </p>
</div>

<!-- ===== 취소·환불 목록 ===== -->
<div class="table-scroll">
  <table class="list">
    <thead>
      <tr>
        <th>클레임 ID</th>
        <th>주문 ID</th>
        <th>구분</th>
        <th>요청 사유</th>
        <th>요청 금액</th>
        <th>요청 일시</th>
        <th>상태</th>
        <th>관리</th>
      </tr>
    </thead>

    <tbody id="claimTbody">
      <tr>
        <td colspan="8">조회 중...</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ===== 페이지네이션 ===== -->
<div
  id="claimPager"
  class="pager"
  aria-label="취소·환불 페이지">
</div>

<!-- ===== 처리 결과 메시지 ===== -->
<p id="claimMsg" class="msg" role="status"></p>

<script src="resources/js/seller/claims.js?v=claims-1"></script>

<%@ include file="include/footer.jsp" %>