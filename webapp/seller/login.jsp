<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>판매자 로그인</title>
  <link rel="stylesheet" href="resources/css/seller.css?v=20261125-R5">
  <%-- 비로그인 페이지: header.jsp(guard.js 포함)를 쓰지 않음 → 무한 리다이렉트 방지 --%>
  <script src="resources/js/seller/api.js?v=20261125-R5"></script>
</head>
<body>

<main class="auth-box">
  <h1>판매자 센터 로그인</h1>

  <form id="loginForm">
    <div>
      <label for="login_id">아이디</label>
      <input type="text" id="login_id" name="login_id" required>
    </div>
    <div>
      <label for="password">비밀번호</label>
      <input type="password" id="password" name="password" required>
    </div>
    <button type="submit" id="loginBtn">로그인</button>
  </form>

  <p id="loginMsg" class="msg"></p>

  <p>아직 입점하지 않으셨나요? <a href="signup.jsp">입점 신청</a></p>
</main>

<script src="resources/js/seller/login.js?v=20261125-R5"></script>
</body>
</html>
