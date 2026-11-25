// =====================================================
// header.js — 공통 헤더 동작
// 헤더·푸터 HTML 자체는 WEB-INF/jsp/common/header.jsp, footer.jsp 에 있음
// 여기서는 로그인 상태에 따라 메뉴 바꾸기 + 장바구니 개수 + 로그아웃만 처리
// =====================================================
async function renderHeader() {
  // [협의 필요] 로그인 사용자 정보 조회 API(GET /api/me)가 규격서에 없음
  // → 이름 표시 불가. 지금은 토큰 유무로만 로그인 상태 판단
  const loggedIn = auth.isLoggedIn();
  document.getElementById('menu-guest').hidden = loggedIn;
  document.getElementById('menu-user').hidden = !loggedIn;

  // 장바구니 개수 (비로그인도 조회 가능 — guest_cart_token 쿠키)
  try {
    const cart = await api.getCart();
    if (cart.code === 'ok') document.getElementById('cart-count').textContent = cart.num;
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('logout-btn').onclick = async (e) => {
  e.preventDefault();
  await api.logout();
  auth.clear();
  location.href = 'index.jsp';
};

renderHeader();
renderMypageNav();
