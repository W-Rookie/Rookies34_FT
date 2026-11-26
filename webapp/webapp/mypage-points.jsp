<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>적립금·컬리캐시 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">적립금 · 컬리캐시</h2>
    <div class="tabs" id="point-tabs"></div>
    <div class="balance-box"><span id="balance-label"></span><b id="balance">0원</b></div>
    <table class="board">
      <thead><tr><th class="w-date">일자</th><th>내용</th><th class="w-date">금액</th></tr></thead>
      <tbody id="history-list"></tbody>
    </table>
    <div class="pagination" id="pagination"></div></section></div>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-points.js"></script>
</body>
</html>
