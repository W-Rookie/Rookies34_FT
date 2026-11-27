
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>판매자 입점 신청</title>

  <link rel="stylesheet"
        href="resources/css/seller.css?v=signup-bank-1">

  <%-- 비로그인 페이지이므로 guard.js를 불러오지 않음 --%>
  <script src="resources/js/seller/api.js?v=signup-bank-1"></script>
</head>
<body>

<main class="auth-box">
  <h1>판매자 입점 신청</h1>

  <form id="signupForm">

    <h2>계정 정보</h2>

    <div>
      <label for="login_id">아이디 *</label>
      <input
        type="text"
        id="login_id"
        name="login_id"
        placeholder="6~16자 영문/숫자"
        required
      >
      <button type="button" id="checkIdBtn">
        중복 확인
      </button>
      <span id="checkIdMsg" class="msg"></span>
    </div>

    <div>
      <label for="password">비밀번호 *</label>
      <input
        type="password"
        id="password"
        name="password"
        placeholder="8~20자"
        required
      >
    </div>

    <div>
      <label for="password_confirm">
        비밀번호 확인 *
      </label>
      <input
        type="password"
        id="password_confirm"
        required
      >
    </div>

    <h2>담당자 정보</h2>

    <div>
      <label for="manager_name">담당자 이름 *</label>
      <input
        type="text"
        id="manager_name"
        name="manager_name"
        required
      >
    </div>

    <div>
      <label for="email">이메일 *</label>
      <input
        type="email"
        id="email"
        name="email"
        required
      >
    </div>

    <div>
      <label for="phone">연락처 *</label>
      <input
        type="text"
        id="phone"
        name="phone"
        placeholder="숫자만 입력"
        required
      >
    </div>

    <h2>사업자 정보</h2>

    <div>
      <label for="business_name">상호명 *</label>
      <input
        type="text"
        id="business_name"
        name="business_name"
        required
      >
    </div>

    <div>
      <label for="business_reg_no">
        사업자등록번호 *
      </label>
      <input
        type="text"
        id="business_reg_no"
        name="business_reg_no"
        placeholder="숫자 10자리"
        required
      >
    </div>

    <div>
      <label for="business_cert_file">
        사업자등록증 *
      </label>
      <input
        type="file"
        id="business_cert_file"
        name="business_cert_file"
        accept=".jpg,.jpeg,.png,.pdf"
        required
      >
      <small>jpg / png / pdf, 최대 5MB</small>
    </div>

    <%-- [추가] 정산 계좌 정보 --%>
    <h2>정산 계좌 정보</h2>

    <div>
      <label for="bank">은행명 *</label>
      <select id="bank" name="bank" required>
        <option value="">은행 선택</option>
        <option value="KB국민은행">KB국민은행</option>
        <option value="신한은행">신한은행</option>
        <option value="우리은행">우리은행</option>
        <option value="하나은행">하나은행</option>
        <option value="NH농협은행">NH농협은행</option>
        <option value="IBK기업은행">IBK기업은행</option>
        <option value="카카오뱅크">카카오뱅크</option>
        <option value="토스뱅크">토스뱅크</option>
        <option value="케이뱅크">케이뱅크</option>
        <option value="우체국">우체국</option>
      </select>
    </div>

    <div>
      <label for="account_no">계좌번호 *</label>
      <input
        type="text"
        id="account_no"
        name="account_no"
        placeholder="숫자만 입력"
        required
      >
    </div>

    <div>
      <label for="account_holder">예금주 *</label>
      <input
        type="text"
        id="account_holder"
        name="account_holder"
        placeholder="예금주 이름"
        required
      >
    </div>

    <div>
      <label>
        <input type="checkbox" id="agree_terms">
        판매자 이용약관에 동의합니다. *
      </label>
    </div>

    <button type="submit" id="submitBtn">
      입점 신청
    </button>

  </form>

  <p id="signupMsg" class="msg"></p>

  <p>
    이미 계정이 있으신가요?
    <a href="login.jsp">로그인</a>
  </p>
</main>

<script src="resources/js/seller/signup.js?v=signup-bank-1"></script>
</body>
</html>
