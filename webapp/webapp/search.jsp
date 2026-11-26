<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>검색 결과 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <h2 class="page-title">'<span id="keyword-text">${param.keyword}</span>'에 대한 검색 결과</h2>
    <div class="list-toolbar"><span id="total"></span><select id="sort">
        <option value="RECOMMEND">추천순</option><option value="NEW">신상품순</option>
        <option value="PRICE_ASC">낮은 가격순</option><option value="PRICE_DESC">높은 가격순</option>
      </select></div>
    <div class="product-list" id="product-list"></div>
    <div class="pagination" id="pagination"></div></main>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/search.js"></script>
</body>
</html>
