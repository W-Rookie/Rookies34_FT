/**
 * layout.js — 판매자 사이드바 동작
 *
 * 사이드바 HTML: include/header.jsp
 *
 * 기능:
 * 1. 취소·환불 관리 메뉴 자동 추가
 * 2. 현재 페이지 메뉴 active 표시
 * 3. 판매자 아이디 표시
 * 4. 로그아웃 버튼 연결
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. 현재 페이지 확인
    // =====================================

    let current = location.pathname.split("/").pop();

    // 상품 등록·수정 화면은 상품 관리 메뉴 활성화
    if (current === "productForm.jsp") {
      current = "products.jsp";
    }

    // =====================================
    // 2. 취소·환불 관리 메뉴 추가
    // =====================================

    const nav = document.querySelector(
      ".seller-header nav"
    );

    if (nav) {

      // 메뉴 중복 생성 방지
      const existingClaimLink = Array.from(
        nav.querySelectorAll("a")
      ).find(function (a) {
        return a.getAttribute("href") === "claims.jsp";
      });

      if (!existingClaimLink) {

        // 새로운 메뉴 생성
        const claimLink = document.createElement("a");

        claimLink.href = "claims.jsp";
        claimLink.textContent = "취소·환불 관리";

        // 주문 관리 메뉴 찾기
        const orderLink = Array.from(
          nav.querySelectorAll("a")
        ).find(function (a) {
          return a.getAttribute("href") === "orders.jsp";
        });

        if (orderLink) {

          // 주문 관리 바로 아래에 추가
          orderLink.insertAdjacentElement(
            "afterend",
            claimLink
          );

        } else {

          // 주문 관리 메뉴가 없으면 마지막에 추가
          nav.appendChild(claimLink);

        }
      }

      // =====================================
      // 3. 현재 페이지 메뉴 활성화
      // =====================================

      nav.querySelectorAll("a").forEach(function (a) {

        a.classList.remove("active");

        if (a.getAttribute("href") === current) {
          a.classList.add("active");
        }

      });
    }

    // =====================================
    // 4. 판매자 아이디 표시
    // =====================================

    const nameEl = document.getElementById("sellerName");

    if (nameEl) {

      const loginId = api.getLoginId() || "";

      // textContent 사용으로 XSS 방지
      nameEl.textContent = loginId + " 님";

    }

    // =====================================
    // 5. 로그아웃 버튼 연결
    // =====================================

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        function () {

          if (confirm("로그아웃 하시겠습니까?")) {
            api.logout();
          }

        }
      );
    }

  });

})();