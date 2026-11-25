<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>쿠폰 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">쿠폰</h2>
    <form id="coupon-form" class="filter">
      <input name="coupon_code" maxlength="20" placeholder="쿠폰 코드를 입력해 주세요">
      <button class="btn btn-primary" type="submit">쿠폰 등록</button>
    </form>
    <div class="tabs" id="coupon-tabs"></div>
    <ul id="coupon-list"></ul></section></div>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-coupons.js"></script>
</body>
</html>
