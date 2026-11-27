<%@ page pageEncoding="UTF-8" %>

<header class="header">

  <!-- ===== 상단 회원 메뉴 ===== -->
  <div class="header-top container">

    <!-- 비로그인 상태 -->
    <span id="menu-guest">
      <a href="signup.jsp">회원가입</a>
      <a href="login.jsp">로그인</a>
    </span>

    <!-- 로그인 상태 -->
    <span id="menu-user" hidden>
      <span id="user-name"></span>
      <a href="mypage-orders.jsp">마이컬리</a>
      <a href="#" id="logout-btn">로그아웃</a>
    </span>

    <!-- ===== 고객센터 드롭다운 ===== -->
    <div class="customer-service-menu">

      <!-- 고객센터 메인 메뉴 -->
      <a
        href="notice.jsp"
        class="customer-service-trigger"
        aria-haspopup="true">
        고객센터
        <span class="customer-service-arrow">▾</span>
      </a>

      <!-- 마우스 호버 시 표시할 하위 메뉴 -->
      <nav
        class="customer-service-dropdown"
        aria-label="고객센터 메뉴">

        <a href="notice.jsp">
          공지사항
        </a>

        <a href="faq.jsp">
          자주하는 질문
        </a>

        <a href="inquiry.jsp">
          1:1 문의
        </a>

        <a href="claim.jsp">
          취소·반품 접수
        </a>

      </nav>

    </div>

  </div>

  <!-- ===== 로고 / 검색 / 장바구니 ===== -->
  <div class="header-main container">

    <a href="index.jsp" class="logo">
      신선마켓
    </a>

    <form
      class="search"
      action="search.jsp"
      method="get">

      <input
        type="text"
        name="keyword"
        value="${param.keyword}"
        maxlength="50"
        placeholder="검색어를 입력해 주세요"
        required>

      <button type="submit">
        검색
      </button>

    </form>

    <div class="header-icons">

      <a href="mypage-addresses.jsp">
        배송지
      </a>

      <a href="cart.jsp">
        장바구니
        <b id="cart-count">0</b>
      </a>

    </div>

  </div>

  <!-- ===== 메인 카테고리 메뉴 ===== -->
  <nav class="header-nav container">

    <a href="category.jsp">
      카테고리
    </a>

    <a href="list.jsp?type=NEW">
      신상품
    </a>

    <a href="list.jsp?type=BEST">
      베스트
    </a>

    <a href="list.jsp?type=SALE">
      알뜰쇼핑
    </a>

    <a href="list.jsp?type=BENEFIT">
      특가/혜택
    </a>

    <span class="delivery-info">
      샛별·하루배송 안내
    </span>

  </nav>

</header>