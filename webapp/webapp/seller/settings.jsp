<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>판매자 정보·정산 계좌 수정</h2>
<p class="msg">※ 현재 정보 조회 API가 없어 빈 칸으로 시작합니다. 모든 항목을 입력해 저장해 주세요.</p>

<%-- S-10 --%>
<form id="settingsForm">
  <h3>판매자 정보</h3>
  <div>
    <label for="business_name">상호명 *</label>
    <input type="text" id="business_name" maxlength="50" required>
  </div>
  <div>
    <label for="phone">연락처 *</label>
    <input type="text" id="phone" placeholder="숫자만 입력" required>
  </div>

  <h3>정산 계좌</h3>
  <div>
    <label for="bank">은행 *</label>
    <select id="bank" required>
      <option value="">선택</option>
      <option value="NH">농협</option>
      <option value="KB">국민</option>
      <option value="SHINHAN">신한</option>
      <option value="WOORI">우리</option>
      <option value="HANA">하나</option>
      <option value="IBK">기업</option>
      <option value="KAKAO">카카오뱅크</option>
      <option value="TOSS">토스뱅크</option>
    </select>
  </div>
  <div>
    <label for="account_no">계좌번호 *</label>
    <input type="text" id="account_no" placeholder="숫자만 입력 (테스트 계좌만)" required>
  </div>
  <div>
    <label for="account_holder">예금주 *</label>
    <input type="text" id="account_holder" required>
  </div>

  <button type="submit" id="saveBtn">저장</button>
</form>

<p id="settingsMsg" class="msg"></p>

<script src="resources/js/seller/settings.js?v=20261125-R5"></script>
<%@ include file="include/footer.jsp" %>
