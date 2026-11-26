const loginForm = document.querySelector("#login-form");
const loginIdInput = document.querySelector("#login-id");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-button");
const loginMessage = document.querySelector("#login-message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const loginId = loginIdInput.value.trim();
    const password = passwordInput.value;

    if (!loginId || !password) {
        loginMessage.textContent = "아이디와 비밀번호를 입력해 주세요.";
        (!loginId ? loginIdInput : passwordInput).focus();
        return;
    }

    loginButton.disabled = true;
    loginMessage.textContent = "로그인 중...";
    sessionStorage.removeItem("accessToken");

    try {
        const response = await fetch("/api/admin/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login_id: loginId,
                password: password
            })
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.code !== "admin" || !result.token) {
            loginMessage.textContent =
                result?.message || "아이디 또는 비밀번호를 확인해 주세요.";
            return;
        }

        sessionStorage.setItem("accessToken", result.token);
        window.location.replace("admin_dashboard.jsp");
    } catch (error) {
        loginMessage.textContent = "로그인 서버에 연결할 수 없습니다.";
    } finally {
        loginButton.disabled = false;
    }
});

loginForm.addEventListener("input", function () {
    loginMessage.textContent = "";
});

loginButton.disabled = false;