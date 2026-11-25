<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>취소·반품·교환 내역 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">취소 · 반품 · 교환 내역</h2>
    <div class="list-toolbar"><span></span><a class="btn btn-primary" href="claim.jsp">새로 신청하기</a></div>
    <table class="board">
      <thead><tr><th class="w-date">신청일</th><th>주문번호</th><th class="w-cat">종류</th><th>사유</th><th class="w-cat">상태</th></tr></thead>
      <tbody id="claim-list"></tbody>
    </table>
    <div class="pagination" id="pagination"></div></section></div>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-claims.js"></script>
</body>
</html>
