/**
 * login.js — 판매자 로그인 (S-01)
 * API: POST /api/auth/login  { login_id, password }
 * 응답: { code: "seller" | "user", token }   실패 시 code "no" 또는 HTTP 에러
 */
(function () {
  const HOME_URL = "orders.jsp"; // 로그인 후 첫 화면

  // 이미 판매자로 로그인된 상태면 바로 이동
  if (api.getToken() && api.getRole() === "seller") {
    location.replace(HOME_URL);
    return;
  }

  const form = document.getElementById("loginForm");
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("loginMsg");

  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // 폼 기본 전송(페이지 새로고침) 막고 fetch로 보냄

    const loginId = document.getElementById("login_id").value.trim();
    const password = document.getElementById("password").value;

    if (!loginId || !password) {
      msg.textContent = "아이디와 비밀번호를 입력해 주세요.";
      return;
    }

    btn.disabled = true; // 중복 클릭 방지
    msg.textContent = "";

    try {
      const data = await api.post(
        "/auth/login",
        { login_id: loginId, password: password },
        { skipAuthRedirect: true } // 비번 틀림(401)일 때 튕기지 말고 메시지 표시
      );

      if (data.code === "seller") {
        api.saveSession(data.token, data.code, loginId);
        location.replace(HOME_URL);
      } else if (data.code === "user") {
        // 구매자 계정: 토큰을 저장하지 않음
        msg.textContent = "구매자 계정입니다. 판매자 계정으로 로그인해 주세요.";
      } else {
        msg.textContent = "로그인에 실패했습니다.";
      }
    } catch (err) {
      // 서버가 비번 틀림 / 승인 대기를 구분해 주지 않으므로 한 문구로 안내
      msg.textContent = "아이디 또는 비밀번호가 올바르지 않거나, 입점 승인 대기 중인 계정입니다.";
    } finally {
      btn.disabled = false;
    }
  });
})();