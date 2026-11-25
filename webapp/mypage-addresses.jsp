<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>배송지 관리 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
  <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">배송지 관리</h2>
    <div class="list-toolbar"><span class="hint">기본배송지는 주문서에 자동으로 선택됩니다.</span>
      <button type="button" class="btn btn-primary" id="add-btn">+ 새 배송지 추가</button></div>
    <ul id="address-list"></ul>
    <form id="address-form" class="form narrow box" hidden>
      <h3 id="form-title">새 배송지 추가</h3>
      <label>받는 분<input name="recipient_name" maxlength="20" required></label>
      <label>연락처<input name="recipient_phone" inputmode="numeric" placeholder="숫자만" required></label>
      <label>주소<span class="inline"><input name="zipcode" maxlength="5" placeholder="우편번호">
        <button type="button" class="btn" id="find-zip">주소 검색</button></span></label>
      <input name="address" maxlength="100" placeholder="기본 주소">
      <input name="address_detail" maxlength="100" placeholder="상세 주소">
      <label class="check"><input type="checkbox" name="is_default"> 기본배송지로 설정</label>
      <div class="btn-row"><button type="button" class="btn" id="cancel-btn">취소</button>
        <button class="btn btn-primary" type="submit">저장</button></div>
    </form></section></div>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-addresses.js"></script>
</body>
</html>
