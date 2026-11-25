<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>자주 구매 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">자주 구매</h2>
    <div class="product-list cols-3" id="product-list"></div>
    <div class="pagination" id="pagination"></div></section></div>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-frequent.js"></script>
</body>
</html>
