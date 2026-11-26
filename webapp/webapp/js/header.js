// =====================================================
// header.js — 공통 헤더 동작
// 헤더·푸터 HTML 자체는 WEB-INF/jsp/common/header.jsp, footer.jsp 에 있음
// 여기서는 로그인 상태에 따라 메뉴 바꾸기 + 장바구니 개수 + 로그아웃만 처리
// =====================================================
async function renderHeader() {
  const loggedIn = auth.isLoggedIn();
  document.getElementById('menu-guest').hidden = loggedIn;
  document.getElementById('menu-user').hidden = !loggedIn;
  if (!loggedIn) return; // 장바구니는 로그인 필수 (U-30) → 비로그인은 0 그대로

  try {
    // U-58 내 정보 조회 → 이름 표시
    const me = await api.getMe();
    if (me.code === 'ok') document.getElementById('user-name').innerHTML = `${me.name}님`;
    // U-30 장바구니 개수
    const cart = await api.getCart();
    if (cart.code === 'ok') document.getElementById('cart-count').textContent = cart.num;
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('logout-btn').onclick = async (e) => {
  e.preventDefault();
  auth.clear(); // 11/25 협의: 로그아웃 = 브라우저의 토큰 삭제 (서버 호출 없음)
  location.href = 'index.jsp';
};

renderHeader();
renderMypageNav();
