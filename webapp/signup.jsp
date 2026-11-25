<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>회원가입 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
  <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</head>
<body>
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <div class="auth-box wide">
      <h2 class="page-title">회원가입</h2>
      <form id="signup-form" class="form" novalidate>
        <label>아이디 *<span class="inline"><input name="login_id" maxlength="16" placeholder="6~16자 영문/숫자">
          <button type="button" class="btn" id="check-id">중복확인</button></span></label>
        <p class="field-msg" id="id-msg"></p>
        <label>비밀번호 *<input name="password" type="password" maxlength="20" placeholder="8~20자" autocomplete="new-password"></label>
        <label>비밀번호 확인 *<input name="password_confirm" type="password" maxlength="20" autocomplete="new-password"></label>
        <label>이름 *<input name="name" maxlength="20"></label>
        <label>이메일 *<input name="email" type="email"></label>
        <label>휴대폰 *<input name="phone" inputmode="numeric" placeholder="숫자만 입력"></label>
        <label>주소 *<span class="inline"><input name="zipcode" maxlength="5" placeholder="우편번호">
          <button type="button" class="btn" id="find-zip">주소 검색</button></span></label>
        <input name="address" maxlength="100" placeholder="기본 주소">
        <input name="address_detail" maxlength="100" placeholder="상세 주소">
        <div class="radio-group">성별
          <label><input type="radio" name="gender" value="MALE"> 남자</label>
          <label><input type="radio" name="gender" value="FEMALE"> 여자</label>
          <label><input type="radio" name="gender" value="NONE" checked> 선택안함</label>
        </div>
        <label>생년월일<input name="birth_date" type="date"></label>
        <div class="agree-box">
          <label class="check"><input type="checkbox" id="agree-all"> <b>전체 동의</b></label>
          <label class="check"><input type="checkbox" name="agree_terms"> 이용약관 동의 (필수)</label>
          <label class="check"><input type="checkbox" name="agree_privacy"> 개인정보 수집·이용 동의 (필수)</label>
          <label class="check"><input type="checkbox" name="is_over_14"> 만 14세 이상입니다 (필수)</label>
        </div>
        <button class="btn btn-primary btn-block" type="submit">가입하기</button>
      </form>
    </div></main>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/signup.js"></script>
</body>
</html>
