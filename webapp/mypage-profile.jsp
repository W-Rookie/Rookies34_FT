<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>회원 정보 관리 | 신선마켓</title>
  <%@ include file="/WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="/WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">회원 정보 관리</h2>
    <form id="info-form" class="form narrow">
      <p>아이디: <b id="login-id"></b></p>
      <label>이름<input name="name" maxlength="20" required></label>
      <label>이메일<input name="email" type="email" required></label>
      <label>휴대폰<input name="phone" inputmode="numeric" required></label>
      <div class="radio-group">성별
        <label><input type="radio" name="gender" value="MALE"> 남자</label>
        <label><input type="radio" name="gender" value="FEMALE"> 여자</label>
        <label><input type="radio" name="gender" value="NONE"> 선택안함</label>
      </div>
      <label>생년월일<input name="birth_date" type="date"></label>
      <label>현재 비밀번호 (정보 수정 확인용)<input name="current_password" type="password" autocomplete="current-password"></label>
      <button class="btn btn-primary btn-block" type="submit">정보 수정</button>
    </form>
    <h3 class="sub-title narrow">비밀번호 변경</h3>
    <form id="pw-form" class="form narrow">
      <input name="current_password" type="password" placeholder="현재 비밀번호" autocomplete="current-password" required>
      <input name="new_password" type="password" placeholder="새 비밀번호 (8~20자)" maxlength="20" autocomplete="new-password" required>
      <input name="new_password_confirm" type="password" placeholder="새 비밀번호 확인" maxlength="20" autocomplete="new-password" required>
      <button class="btn btn-block" type="submit">비밀번호 변경</button>
    </form></section></div>
  <%@ include file="/WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="/WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-profile.js"></script>
</body>
</html>
