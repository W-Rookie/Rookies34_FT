
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>판매자 입점 신청</title>
  <link rel="stylesheet" href="resources/css/seller.css?v=20261125-R5">


  <style>
  /* 아이디 영역: 일반 입력 필드와 동일하게 정렬 */
  .signup-id-field {
    display: block;
  }

  /* 아이디 입력칸 + 중복 확인 버튼 */
  .signup-id-field .signup-id-controls {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    vertical-align: middle;
  }

  /* 비밀번호 입력칸과 동일한 기본 너비 */
  .signup-id-field .signup-id-controls input[type="text"] {
    width: auto;
    min-width: 0;
    max-width: none;
    flex: none;
  }

  /* 버튼 줄바꿈 방지 */
  .signup-id-field #checkIdBtn {
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* 안내 메시지는 입력칸 아래 */
  .signup-id-field #checkIdMsg {
    display: block;
    margin: 6px 0 0 114px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  </style>


  <%-- 비로그인 페이지: header.jsp를 사용하지 않음 --%>
  <script src="resources/js/seller/api.js?v=20261125-R5"></script>
</head>
<body>

<main class="auth-box">
  <h1>판매자 입점 신청</h1>

  <form id="signupForm">

    <h2>계정 정보</h2>

    <%-- 아이디 입력 및 중복 확인 --%>
    <div class="signup-id-field">
      <label for="login_id">아이디 *</label>

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

      <%-- 중복 확인 결과 메시지 --%>
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
      <label for="password_confirm">비밀번호 확인 *</label>
      <%-- 서버로 전송하지 않는 클라이언트 검증용 필드 --%>
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
      <label for="business_reg_no">사업자등록번호 *</label>
      <input
        type="text"
        id="business_reg_no"
        name="business_reg_no"
        placeholder="숫자 10자리"
        required
      >
    </div>

    <div>
      <label for="business_cert_file">사업자등록증 *</label>
      <input
        type="file"
        id="business_cert_file"
        name="business_cert_file"
        accept=".jpg,.jpeg,.png,.pdf"
        required
      >
      <small>jpg / png / pdf, 최대 5MB</small>
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

<script src="resources/js/seller/signup.js?v=20261125-R5"></script>
</body>
</html>
