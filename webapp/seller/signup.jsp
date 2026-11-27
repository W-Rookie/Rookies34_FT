
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>판매자 입점 신청</title>

  <link rel="stylesheet"
        href="resources/css/seller.css?v=signup-layout-2">
  <script src="resources/js/seller/api.js?v=signup-layout-2"></script>

  <style>
    /* 판매자 입점 신청 페이지 전용 스타일 */

    .auth-box.signup-auth {
      width: calc(100% - 32px);
      max-width: 640px;
      margin: 32px auto;
      padding: 34px 40px;
    }

    /* 라벨 / 입력 영역 2열 정렬 */
    .signup-auth #signupForm .signup-row {
      display: grid;
      grid-template-columns: 130px minmax(0, 1fr);
      align-items: start;
      column-gap: 12px;
      margin-bottom: 14px;
    }

    .signup-auth #signupForm .signup-row > label {
      min-width: 0;
      margin: 0;
      padding-top: 9px;
      line-height: 1.4;
      white-space: nowrap;
    }

    .signup-auth #signupForm .signup-field,
    .signup-auth #signupForm .signup-id-controls {
      margin: 0;
      min-width: 0;
    }

    /* 일반 입력칸 */
    .signup-auth #signupForm .signup-field > input:not([type="file"]),
    .signup-auth #signupForm .signup-field > select {
      display: block;
      width: 100%;
      min-width: 0;
      height: 40px;
    }

    /* 아이디 입력칸 + 중복 확인 버튼 */
    .signup-auth #signupForm .signup-id-controls {
      display: flex;
      align-items: stretch;
      gap: 8px;
    }

    .signup-auth #signupForm .signup-id-controls input {
      width: 100%;
      min-width: 0;
      flex: 1 1 auto;
    }

    .signup-auth #checkIdBtn {
      flex: 0 0 auto;
      white-space: nowrap;
      padding: 7px 12px;
    }

    /* 중복 확인 결과: 입력칸 아래에 표시 */
    .signup-auth #checkIdMsg {
      display: block;
      margin-top: 6px;
      font-size: 13px;
      line-height: 1.5;
      white-space: normal;
      overflow-wrap: break-word;
      color: #dc2626;
    }

    /* 사용 가능 */
    .signup-auth #checkIdMsg.success {
      color: #15803d;
    }

    /* 중복 또는 입력 오류 */
    .signup-auth #checkIdMsg.error {
      color: #dc2626;
    }

    /* 가입 오류 메시지 */
    .signup-auth #signupMsg {
      color: #dc2626;
      line-height: 1.5;
    }

    /* 첨부파일 안내 */
    .signup-auth #signupForm .signup-field small {
      display: block;
      margin: 6px 0 0;
      line-height: 1.5;
    }

    .signup-auth #signupForm .signup-field input[type="file"] {
      display: block;
      width: 100%;
      max-width: 100%;
    }

    /* 약관 동의 */
    .signup-auth #signupForm .signup-terms {
      margin: 14px 0 18px;
    }

    .signup-auth #signupForm .signup-terms label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      white-space: normal;
    }

    .signup-auth #signupForm .signup-terms input {
      margin: 0;
    }

    /* 작은 화면에서는 세로 정렬 */
    @media (max-width: 540px) {
      .auth-box.signup-auth {
        padding: 24px 20px;
        width: calc(100% - 20px);
      }

      .signup-auth #signupForm .signup-row {
        grid-template-columns: minmax(0, 1fr);
        gap: 6px;
      }

      .signup-auth #signupForm .signup-row > label {
        padding-top: 0;
      }
    }
  </style>
</head>

<body>
<main class="auth-box signup-auth">
  <h1>판매자 입점 신청</h1>

  <form id="signupForm">

    <!-- 계정 정보 -->
    <h2>계정 정보</h2>

    <div class="signup-row">
      <label for="login_id">아이디 *</label>

      <div class="signup-field">
        <div class="signup-id-controls">
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
        </div>

        <span
          id="checkIdMsg"
          class="msg"
          aria-live="polite"
        ></span>
      </div>
    </div>

    <div class="signup-row">
      <label for="password">비밀번호 *</label>
      <div class="signup-field">
        <input
          type="password"
          id="password"
          name="password"
          placeholder="8~20자"
          required
        >
      </div>
    </div>

    <div class="signup-row">
      <label for="password_confirm">
        비밀번호 확인 *
      </label>
      <div class="signup-field">
        <input
          type="password"
          id="password_confirm"
          required
        >
      </div>
    </div>

    <!-- 담당자 정보 -->
    <h2>담당자 정보</h2>

    <div class="signup-row">
      <label for="manager_name">담당자 이름 *</label>
      <div class="signup-field">
        <input
          type="text"
          id="manager_name"
          name="manager_name"
          required
        >
      </div>
    </div>

    <div class="signup-row">
      <label for="email">이메일 *</label>
      <div class="signup-field">
        <input
          type="email"
          id="email"
          name="email"
          required
        >
      </div>
    </div>

    <div class="signup-row">
      <label for="phone">연락처 *</label>
      <div class="signup-field">
        <input
          type="text"
          id="phone"
          name="phone"
          placeholder="숫자만 입력"
          required
        >
      </div>
    </div>

    <!-- 사업자 정보 -->
    <h2>사업자 정보</h2>

    <div class="signup-row">
      <label for="business_name">상호명 *</label>
      <div class="signup-field">
        <input
          type="text"
          id="business_name"
          name="business_name"
          required
        >
      </div>
    </div>

    <div class="signup-row">
      <label for="business_reg_no">
        사업자등록번호 *
      </label>
      <div class="signup-field">
        <input
          type="text"
          id="business_reg_no"
          name="business_reg_no"
          placeholder="숫자 10자리"
          required
        >
      </div>
    </div>

    <div class="signup-row">
      <label for="business_cert_file">
        사업자등록증 *
      </label>
      <div class="signup-field">
        <input
          type="file"
          id="business_cert_file"
          name="business_cert_file"
          accept=".jpg,.jpeg,.png,.pdf"
          required
        >
        <small>jpg / png / pdf, 최대 5MB</small>
      </div>
    </div>

    <!-- 정산 계좌 정보 -->
    <h2>정산 계좌 정보</h2>

    <div class="signup-row">
      <label for="bank">은행명 *</label>
      <div class="signup-field">
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
    </div>

    <div class="signup-row">
      <label for="account_no">계좌번호 *</label>
      <div class="signup-field">
        <input
          type="text"
          id="account_no"
          name="account_no"
          placeholder="숫자만 입력"
          required
        >
      </div>
    </div>

    <div class="signup-row">
      <label for="account_holder">예금주 *</label>
      <div class="signup-field">
        <input
          type="text"
          id="account_holder"
          name="account_holder"
          placeholder="예금주 이름"
          required
        >
      </div>
    </div>

    <!-- 약관 -->
    <div class="signup-terms">
      <label for="agree_terms">
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

<script src="resources/js/seller/signup.js?v=signup-fix-1"></script>
</body>
</html>
