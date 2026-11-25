<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>주문 내역 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">주문 내역</h2>
    <form id="filter-form" class="filter">
      <select name="period"><option value="3M">3개월</option><option value="6M">6개월</option><option value="1Y">1년</option></select>
      <input name="keyword" maxlength="50" placeholder="상품명 검색">
      <button class="btn" type="submit">조회</button>
    </form>
    <ul id="order-list"></ul>
    <div class="pagination" id="pagination"></div></section></div>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-orders.js"></script>
</body>
</html>
