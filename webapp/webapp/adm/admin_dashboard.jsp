<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>관리자 대시보드</title>

    <link rel="stylesheet" href="css/admin_dashboard.css">
    <script src="js/admin_dashboard.js" defer></script>
</head>
<body class="admin-dashboard">
    <div class="admin-layout">
        <nav id="admin-menu" aria-label="관리 메뉴">
            <ul>
                <li><button type="button" data-menu="users">회원정보 관리</button></li>
                <li><button type="button" data-menu="sellers">판매자 입점 승인</button></li>
                <li><button type="button" data-menu="products">상품 검증·승인</button></li>
                <li><button type="button" data-menu="catalog">카테고리·기획전 관리</button></li>
                <li><button type="button" data-menu="orders">주문·배송 현황</button></li>
                <li><button type="button" data-menu="settlements">판매자 정산·수수료 관리</button></li>
                <li><button type="button" data-menu="coupons">쿠폰 발급</button></li>
                <li><button type="button" data-menu="inquiries">1:1 문의 답변</button></li>
                <li><button type="button" data-menu="posts">공지사항·FAQ 작성</button></li>

                <li class="admin-logout-item">
                    <button type="button"
                            id="logout-button"
                            class="admin-logout"
                            data-login-url="admin_login.jsp">
                        로그아웃
                    </button>
                </li>
            </ul>
        </nav>

        <div class="admin-content">
            <header class="admin-header">
                <h1>관리자 대시보드</h1>
            </header>

            <main class="admin-main">
                <h2 id="section-title">관리 메뉴</h2>

                <label for="action-select">작업</label>
                <select id="action-select"></select>

                <form id="admin-form" method="post">
                    <div id="form-fields"></div>
                    <button id="preview-button" type="submit" disabled>
                        요청 미리보기
                    </button>
                </form>

                <p id="preview-message" role="status"></p>
                <pre id="request-preview" hidden></pre>
            </main>
        </div>
    </div>
</body>
</html>