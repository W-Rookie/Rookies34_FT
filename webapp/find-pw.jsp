<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>비밀번호 찾기 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
</head>
<body data-mode="pw">
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <div class="auth-box">
      <h2 class="page-title">비밀번호 찾기</h2>
        <div class="tabs"><button type="button" class="tab active" data-method="sms">휴대폰 인증</button><button type="button" class="tab" data-method="email">이메일 인증</button></div>
        <form id="find-form" class="form">
          <input name="login_id" placeholder="아이디" maxlength="16" required>
          <input name="name" placeholder="이름" maxlength="20" required>
          <div id="phone-row"><input name="phone" placeholder="휴대폰 번호 (숫자만)" inputmode="numeric"></div>
          <div id="email-row" hidden><input name="email" type="email" placeholder="이메일"></div>
          <button type="button" class="btn btn-block" id="send-code">인증번호 받기</button>
          <div id="verify-row" hidden>
            <input name="verify_code" placeholder="인증번호 6자리" maxlength="6" inputmode="numeric">
            <button class="btn btn-primary btn-block" type="submit">확인</button>
          </div>
        </form>
        <p class="result" id="result"></p>
        <form id="reset-form" class="form" hidden>
          <input name="new_password" type="password" placeholder="새 비밀번호 (8~20자)" maxlength="20" autocomplete="new-password">
          <input name="new_password_confirm" type="password" placeholder="새 비밀번호 확인" maxlength="20" autocomplete="new-password">
          <button class="btn btn-primary btn-block" type="submit">비밀번호 변경</button>
        </form>
      <div class="auth-links"><a href="login.jsp">로그인</a> · <a href="find-id.jsp">아이디 찾기</a></div>
    </div></main>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/find-account.js"></script>
</body>
</html>
