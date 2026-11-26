<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>주문서 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <h2 class="page-title">주문서</h2>
    <form id="checkout-form" class="checkout-layout">
      <div class="checkout-main">
        <h3 class="sub-title">주문 상품</h3>
        <ul class="order-items" id="order-items"></ul>

        <h3 class="sub-title">배송 정보</h3>
        <div id="address-list"></div>
        <div class="form">
          <label>받는 분<input name="recipient_name" id="recipient_name" maxlength="20" required></label>
          <label>연락처<input name="recipient_phone" id="recipient_phone" inputmode="numeric" required></label>
          <label>배송 요청사항<input name="delivery_request" maxlength="200" placeholder="예) 공동현관 비밀번호"></label>
        </div>

        <h3 class="sub-title">쿠폰 · 적립금</h3>
        <div class="form">
          <label>쿠폰<select name="coupon" id="coupon"></select></label>
          <label><span>적립금 (보유 <span id="my-points">0원</span>)</span>
            <span class="inline"><input type="number" name="use_points" id="use-points" min="0" value="0">
            <button type="button" class="btn" id="use-all-points">모두 사용</button></span>
          </label>
        </div>

        <h3 class="sub-title">결제 수단</h3>
        <div class="radio-group">
          <label><input type="radio" name="payment_method" value="CARD" checked> 신용카드</label>
          <label><input type="radio" name="payment_method" value="BANK_TRANSFER"> 계좌이체</label>
          <label><input type="radio" name="payment_method" value="VIRTUAL_ACCOUNT"> 가상계좌</label>
        </div>
        <p class="hint">교육용 모의 결제입니다. 실제 결제는 이루어지지 않습니다.</p>
      </div>
      <aside class="summary">
        <p><span>주문금액</span><span id="amt-base">0원</span></p>
        <p><span>쿠폰할인</span><span id="amt-coupon">0원</span></p>
        <p><span>적립금사용</span><span id="amt-points">0원</span></p>
        <p class="total"><span>최종결제금액</span><b id="amt-total">0원</b></p>
        <p class="hint">최종 금액은 서버에서 다시 계산됩니다.</p>
        <label class="check"><input type="checkbox" name="agree_payment"> 주문 내용 확인 및 결제 동의 (필수)</label>
        <button class="btn btn-primary btn-block" type="submit">결제하기</button>
      </aside>
    </form></main>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/checkout.js"></script>
</body>
</html>
