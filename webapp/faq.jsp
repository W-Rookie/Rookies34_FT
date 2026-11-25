<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>자주하는 질문 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <h2 class="page-title">자주하는 질문</h2>
    <div class="tabs wrap" id="faq-tabs"></div>
    <ul id="faq-list"></ul>
    <div class="pagination" id="pagination"></div></main>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/faq.js"></script>
</body>
</html>
