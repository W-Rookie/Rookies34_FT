<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>카테고리 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <h2 class="page-title">카테고리</h2>
    <div class="category-list" id="category-list"></div></main>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/category.js"></script>
</body>
</html>
