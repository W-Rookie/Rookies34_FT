<%@ page pageEncoding="UTF-8" %>
<%-- 공통 상단: <head> + 왼쪽 사이드바 + <main> 열기 (footer.jsp가 닫음)
     로그인 후 페이지에서만 include. 메뉴 수정은 이 파일의 <nav>만 바꾸면 전 페이지 반영 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>판매자 센터</title>
  <link rel="stylesheet" href="resources/css/seller.css?v=20261125-R5">
  <%-- 순서 중요: api.js(통신) → guard.js(권한 확인) → layout.js(메뉴 표시·로그아웃) --%>
  <script src="resources/js/seller/api.js?v=20261125-R5"></script>
  <%--<script src="resources/js/seller/guard.js?v=20261125-R5"></script> --%>
  <script src="resources/js/seller/layout.js?v=20261125-R5"></script>
</head>
<body>

<header class="seller-header">
  <h1><a href="orders.jsp">판매자 센터</a></h1>
  <nav>
    <a href="products.jsp">상품 관리</a>
    <a href="orders.jsp">주문 관리</a>
    <a href="inquiries.jsp">상품 문의</a>
    <a href="revenue.jsp">수익금 내역</a>
    <a href="withdraw.jsp">출금</a>
    <a href="settings.jsp">정보 수정</a>
  </nav>
  <div>
    <span id="sellerName"></span>
    <button type="button" id="logoutBtn">로그아웃</button>
  </div>
</header>

<main>
