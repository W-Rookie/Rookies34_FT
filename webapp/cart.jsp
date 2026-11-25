<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>장바구니 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <h2 class="page-title">장바구니</h2>
    <div class="cart-layout">
      <div class="cart-main">
        <div class="cart-toolbar">
          <label class="check"><input type="checkbox" id="check-all" checked> 전체선택</label>
          <button type="button" class="link-btn" id="delete-selected">선택삭제</button>
        </div>
        <div id="cart-list"></div>
      </div>
      <aside class="summary">
        <p><span>상품금액</span><span id="sum-origin">0원</span></p>
        <p><span>상품할인</span><span id="sum-discount">0원</span></p>
        <p class="total"><span>결제예정금액</span><b id="sum-pay">0원</b></p>
        <p class="hint">쿠폰·적립금은 주문서에서 적용됩니다.</p>
        <button class="btn btn-primary btn-block" id="order-btn">주문하기</button>
      </aside>
    </div></main>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/cart.js"></script>
</body>
</html>
