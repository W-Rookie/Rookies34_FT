<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>주문 상세 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">주문 상세</h2>
    <div id="order-detail"></div>
    <div class="btn-row"><a class="btn" href="mypage-orders.jsp">목록</a></div></section></div>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/order.js"></script>
</body>
</html>
