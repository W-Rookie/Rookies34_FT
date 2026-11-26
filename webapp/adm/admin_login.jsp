<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>관리자 로그인</title>
    <link rel="stylesheet" href="css/admin_login.css">
    <script src="js/admin_login.js" defer></script>
</head>
<body class="admin-login">
    <main class="login-shell">
        <section class="login-card" aria-labelledby="login-title">
            <div class="login-intro">
                <span class="login-kicker">ADMIN</span>
                <h1 id="login-title">관리자 로그인</h1>
                <p>관리자 페이지</p>
            </div>

            <div class="login-content">
                <form id="login-form" method="post">
                    <div class="login-field">
                        <label for="login-id">아이디</label>
                        <input id="login-id" name="login_id" type="text"
                               autocomplete="username" required>
                    </div>

                    <div class="login-field">
                        <label for="password">비밀번호</label>
                        <input id="password" name="password" type="password"
                               autocomplete="current-password" required>
                    </div>

                    <button id="login-button" type="submit" disabled>로그인</button>
                    <p id="login-message" role="status"></p>
                </form>
            </div>
        </section>
    </main>
</body>
</html>
