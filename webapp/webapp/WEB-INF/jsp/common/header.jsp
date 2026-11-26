<%@ page pageEncoding="UTF-8" %>
<header class="header">
  <div class="header-top container">
    <span id="menu-guest"><a href="signup.jsp">회원가입</a><a href="login.jsp">로그인</a></span>
    <span id="menu-user" hidden><span id="user-name"></span><a href="mypage-orders.jsp">마이컬리</a><a href="#" id="logout-btn">로그아웃</a></span>
    <a href="notice.jsp">고객센터</a>
  </div>
  <div class="header-main container">
    <a href="index.jsp" class="logo">신선마켓</a>
    <form class="search" action="search.jsp" method="get">
      <input type="text" name="keyword" value="${param.keyword}" maxlength="50" placeholder="검색어를 입력해 주세요" required>
      <button type="submit">검색</button>
    </form>
    <div class="header-icons">
      <a href="mypage-addresses.jsp">배송지</a>
      <a href="cart.jsp">장바구니 <b id="cart-count">0</b></a>
    </div>
  </div>
  <nav class="header-nav container">
    <a href="category.jsp">카테고리</a>
    <a href="list.jsp?type=NEW">신상품</a>
    <a href="list.jsp?type=BEST">베스트</a>
    <a href="list.jsp?type=SALE">알뜰쇼핑</a>
    <a href="list.jsp?type=BENEFIT">특가/혜택</a>
    <span class="delivery-info">샛별·하루배송 안내</span>
  </nav>
</header>
