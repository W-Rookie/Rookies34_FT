<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>주문 관리</h2>

<%-- S-03 검색 필터 --%>
<form id="filterForm" class="filter">
  <label>기간 <input type="date" id="date_from"> ~ <input type="date" id="date_to"></label>
  <label>상태
    <select id="status">
      <option value="">전체</option>
      <option value="PAID">결제완료</option>
      <option value="SHIPPING">배송중</option>
      <option value="COMPLETED">거래완료</option>
      <option value="CANCELED">취소</option>
    </select>
  </label>
  <button type="submit">조회</button>
</form>

<p>총 <strong id="totalCount">0</strong>건</p>

<%-- S-03 주문 목록 --%>
<table class="list">
  <thead>
    <tr>
      <th>주문번호</th><th>상품명</th><th>수량</th><th>금액</th>
      <th>상태</th><th>주문일</th><th>송장번호</th><th>처리</th>
    </tr>
  </thead>
  <tbody id="orderTbody">
    <tr><td colspan="8">조회 중...</td></tr>
  </tbody>
</table>

<div id="pager" class="pager"></div>

<%-- S-04 배송 정보 입력 --%>
<section id="shipmentBox" class="panel" hidden>
  <h3>배송 정보 입력 <span id="shipmentTarget"></span></h3>
  <form id="shipmentForm">
    <label>배송 예정일 <input type="date" id="expected_delivery_date"></label>
    <label>택배사
      <select id="courier">
        <option value="">선택</option>
        <option value="CJ">CJ대한통운</option>
        <option value="HANJIN">한진택배</option>
        <option value="LOTTE">롯데택배</option>
        <option value="POST">우체국택배</option>
        <option value="LOGEN">로젠택배</option>
      </select>
    </label>
    <label>송장번호 <input type="text" id="tracking_no" placeholder="숫자 10~14자리"></label>
    <button type="submit">저장</button>
    <button type="button" class="closeBtn">닫기</button>
  </form>
</section>

<%-- S-05 판매자 주문 취소 --%>
<section id="cancelBox" class="panel" hidden>
  <h3>주문 취소 <span id="cancelTarget"></span></h3>
  <form id="cancelForm">
    <label>취소 사유
      <select id="reason">
        <option value="OUT_OF_STOCK">재고 부족</option>
        <option value="ETC">기타</option>
      </select>
    </label>
    <button type="submit">취소 확정</button>
    <button type="button" class="closeBtn">닫기</button>
  </form>
</section>

<script src="resources/js/seller/orders.js?v=20261125-R5"></script>
<%@ include file="include/footer.jsp" %>
