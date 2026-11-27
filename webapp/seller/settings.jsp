
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>판매자 정보·정산 계좌 수정</h2>

<p class="msg">
  수정할 정보를 입력한 후 저장해 주세요.
</p>

<%-- S-10 판매자 정보 수정 --%>
<form id="settingsForm">

  <h3>판매자 정보</h3>

  <div>
    <label for="business_name">상호명 *</label>
    <input
      type="text"
      id="business_name"
      maxlength="50"
      required
    >
  </div>

  <div>
    <label for="phone">연락처 *</label>
    <input
      type="text"
      id="phone"
      placeholder="숫자만 입력"
      required
    >
  </div>

  <h3>정산 계좌</h3>

  <div>
    <label for="bank">은행 *</label>

    <select id="bank" required>
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
      <option value="테스트은행">테스트은행</option>
    </select>
  </div>

  <div>
    <label for="account_no">계좌번호 *</label>
    <input
      type="text"
      id="account_no"
      placeholder="숫자만 입력 (테스트 계좌만)"
      required
    >
  </div>

  <div>
    <label for="account_holder">예금주 *</label>
    <input
      type="text"
      id="account_holder"
      required
    >
  </div>

  <button type="submit" id="saveBtn">
    저장
  </button>

</form>

<p id="settingsMsg" class="msg"></p>

<script src="resources/js/seller/settings.js?v=signup-bank-1"></script>

<%@ include file="include/footer.jsp" %>
