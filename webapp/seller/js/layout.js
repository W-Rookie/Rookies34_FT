/**
 * layout.js — 사이드바 동작 (사이드바 HTML 자체는 include/header.jsp에 있음)
 *  - 현재 페이지 메뉴에 active 표시
 *  - 판매자 아이디 표시
 *  - 로그아웃 버튼 연결
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    let current = location.pathname.split("/").pop(); // 예: orders.jsp
    if (current === "productForm.jsp") current = "products.jsp"; // 상품 등록·수정은 상품 관리 메뉴로 표시

    document.querySelectorAll(".seller-header nav a").forEach(function (a) {
      if (a.getAttribute("href") === current) a.classList.add("active");
    });

    const nameEl = document.getElementById("sellerName");
    if (nameEl) nameEl.textContent = (api.getLoginId() || "") + " 님"; // textContent → XSS 방지

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        if (confirm("로그아웃 하시겠습니까?")) api.logout();
      });
    }
  });
})();
