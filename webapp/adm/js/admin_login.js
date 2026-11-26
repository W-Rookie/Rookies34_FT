const loginForm = document.querySelector("#login-form");
const loginIdInput = document.querySelector("#login-id");
<<<<<<< HEAD
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
=======
const loginButton = document.querySelector("#login-button");
const loginMessage = document.querySelector("#login-message");

loginForm.addEventListener("submit", function (event) {
    // 브라우저가 폼을 서버로 전송하는 기본 동작을 막음
    event.preventDefault();

    // required는 빈 칸을 막고, trim()은 공백만 입력한 아이디를 확인
    const loginId = loginIdInput.value.trim();

    if (loginId === "") {
        loginMessage.textContent = "아이디를 입력해 주세요.";
        loginIdInput.focus();
        return;
    }

    // API가 준비되면 이 위치에서 login_id와 password를 전송
    loginMessage.textContent = "입력값을 확인했습니다. 로그인 API는 연동 예정입니다.";
>>>>>>> 2f4b7e0 (관리자 로그인 API 연동)
});

loginForm.addEventListener("input", function () {
    loginMessage.textContent = "";
});

<<<<<<< HEAD
=======
// 폼 제출을 처리할 준비가 된 뒤 버튼을 활성화
>>>>>>> 2f4b7e0 (관리자 로그인 API 연동)
loginButton.disabled = false;