<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>판매자 입점 신청</title>
  <link rel="stylesheet" href="resources/css/seller.css?v=20261125-R5">
  <%-- 비로그인 페이지: header.jsp(guard.js 포함)를 쓰지 않음 → 무한 리다이렉트 방지 --%>
  <script src="resources/js/seller/api.js?v=20261125-R5"></script>
</head>
<body>

<main class="auth-box">
  <h1>판매자 입점 신청</h1>

  <form id="signupForm">
    <h2>계정 정보</h2>
    <div>
      <label for="login_id">아이디 *</label>
      <input type="text" id="login_id" name="login_id" placeholder="6~16자 영문/숫자" required>
      <button type="button" id="checkIdBtn">중복 확인</button>
      <span id="checkIdMsg" class="msg"></span>
    </div>
    <div>
      <label for="password">비밀번호 *</label>
      <input type="password" id="password" name="password" placeholder="8~20자" required>
    </div>
    <div>
      <label for="password_confirm">비밀번호 확인 *</label>
      <%-- name 속성 없음: 서버로 안 보냄 (클라이언트 검증용) --%>
      <input type="password" id="password_confirm" required>
    </div>

    <h2>담당자 정보</h2>
    <div>
      <label for="manager_name">담당자 이름 *</label>
      <input type="text" id="manager_name" name="manager_name" required>
    </div>
    <div>
      <label for="email">이메일 *</label>
      <input type="email" id="email" name="email" required>
    </div>
    <div>
      <label for="phone">연락처 *</label>
      <input type="text" id="phone" name="phone" placeholder="숫자만 입력" required>
    </div>

    <h2>사업자 정보</h2>
    <div>
      <label for="business_name">상호명 *</label>
      <input type="text" id="business_name" name="business_name" required>
    </div>
    <div>
      <label for="business_reg_no">사업자등록번호 *</label>
      <input type="text" id="business_reg_no" name="business_reg_no" placeholder="숫자 10자리" required>
    </div>
    <div>
      <label for="business_cert_file">사업자등록증 *</label>
      <input type="file" id="business_cert_file" name="business_cert_file" accept=".jpg,.jpeg,.png,.pdf" required>
      <small>jpg / png / pdf, 최대 5MB</small>
    </div>

    <div>
      <label><input type="checkbox" id="agree_terms"> 판매자 이용약관에 동의합니다. *</label>
    </div>

    <button type="submit" id="submitBtn">입점 신청</button>
  </form>

  <p id="signupMsg" class="msg"></p>

  <p>이미 계정이 있으신가요? <a href="login.jsp">로그인</a></p>
</main>

<script src="resources/js/seller/signup.js?v=20261125-R5"></script>
</body>
</html>
