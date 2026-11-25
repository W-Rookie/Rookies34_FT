/**
 * guard.js — 판매자 페이지 진입 시 화면용 권한 확인 (include/header.jsp의 <head>에서 api.js 다음에 실행)
 * 사이드바 표시·로그아웃은 layout.js가 담당
 * 규격서 기준:
 *  - 판매자 여부: 로그인 응답 code === "seller" (로그인 때 저장해 둔 값)
 *  - 승인 여부: 서버가 승인 전 판매자의 로그인을 막으므로 프론트에서 확인 안 함
 *  - JWT 내용은 규격서에 없으므로 의존하지 않음 (exp만 있으면 참고)
 *
 * ※ 화면용 차단일 뿐. 진짜 차단은 API 서버가 해야 함.
 */
const guard = (function () {

  function kickOut(message) {
    api.clearSession();
    if (message) alert(message);
    location.replace(api.LOGIN_URL);
  }

  // exp(만료시각)가 토큰에 있으면 확인, 없거나 못 읽으면 건너뜀 → 만료는 서버 401로 처리됨
  function isExpired(token) {
    try {
      const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(part + "===".slice((part.length + 3) % 4)));
      return payload.exp ? payload.exp * 1000 < Date.now() : false;
    } catch (e) {
      return false;
    }
  }

  const token = api.getToken();
  if (!token) {
    kickOut(null);
    return {};
  }
  if (api.getRole() !== "seller") {
    kickOut("판매자 계정만 접근할 수 있습니다.");
    return {};
  }
  if (isExpired(token)) {
    kickOut("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    return {};
  }

  return { loginId: api.getLoginId() };
})();