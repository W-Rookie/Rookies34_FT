<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>홈 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <section class="banner">
      <p class="banner-sub">오늘 밤 주문하면 내일 아침 도착</p>
      <h2>제철 과일 최대 30% 할인</h2>
    </section>
    <section class="product-section" data-type="BEST">
      <div class="section-head"><h3>베스트</h3><a href="list.jsp?type=BEST">전체보기 &gt;</a></div>
      <div class="product-list"></div>
    </section>
    <section class="product-section" data-type="NEW">
      <div class="section-head"><h3>신상품</h3><a href="list.jsp?type=NEW">전체보기 &gt;</a></div>
      <div class="product-list"></div>
    </section>
    <section class="product-section" data-type="SALE">
      <div class="section-head"><h3>알뜰 세일</h3><a href="list.jsp?type=SALE">전체보기 &gt;</a></div>
      <div class="product-list"></div>
    </section></main>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/main.js"></script>
</body>
</html>
