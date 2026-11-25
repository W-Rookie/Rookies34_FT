<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>주문 완료 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <div class="complete-head"><h2>주문이 완료되었습니다</h2><p>판매자가 직접 배송합니다.</p></div>
    <div id="order-detail"></div>
    <div class="btn-row"><a class="btn" href="index.jsp">쇼핑 계속하기</a><a class="btn btn-primary" href="mypage-orders.jsp">주문 내역 보기</a></div></main>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/order.js"></script>
</body>
</html>
