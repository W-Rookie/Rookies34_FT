const loginForm = document.querySelector("#login-form");
const loginIdInput = document.querySelector("#login-id");
const loginButton = document.querySelector("#login-button");
const loginMessage = document.querySelector("#login-message");

loginForm.addEventListener("submit", function (event) {
    // 브라우저가 폼을 서버로 전송하는 기본 동작을 막습니다.
    event.preventDefault();

    // required는 빈 칸을 막고, trim()은 공백만 입력한 아이디를 확인합니다.
    const loginId = loginIdInput.value.trim();

    if (loginId === "") {
        loginMessage.textContent = "아이디를 입력해 주세요.";
        loginIdInput.focus();
        return;
    }

    // API가 준비되면 이 위치에서 login_id와 password를 전송합니다.
    loginMessage.textContent = "입력값을 확인했습니다. 로그인 API는 연동 예정입니다.";
});

loginForm.addEventListener("input", function () {
    loginMessage.textContent = "";
});

// 폼 제출을 처리할 준비가 된 뒤 버튼을 활성화합니다.
loginButton.disabled = false;