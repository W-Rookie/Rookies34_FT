<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>로그인 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <div class="auth-box">
      <h2 class="page-title">로그인</h2>
      <form id="login-form" class="form">
        <input name="login_id" placeholder="아이디" maxlength="16" required autocomplete="username">
        <input name="password" type="password" placeholder="비밀번호" maxlength="20" required autocomplete="current-password">
        <p class="field-msg err" id="login-error"></p>
        <button class="btn btn-primary btn-block" type="submit">로그인</button>
      </form>
      <div class="auth-links"><a href="find-id.jsp">아이디 찾기</a> · <a href="find-pw.jsp">비밀번호 찾기</a> · <a href="signup.jsp">회원가입</a></div>
    </div></main>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/login.js"></script>
</body>
</html>
