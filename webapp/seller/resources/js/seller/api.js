/**
 * api.js — 판매자 페이지의 모든 서버 요청이 지나가는 통로
 * 규격서 기준:
 *  - 인증: Authorization: Bearer {token}
 *  - 응답: 항상 { "code": "ok" | "no", ... }  → "no"면 실패로 처리
 *  - 로그인 응답 code: "user" | "seller"
 */
const api = (function () {
  // ★ 백엔드 서버 주소
  //   JSP와 API가 같은 서버(Tomcat)에서 돌면 "" 그대로 → "/api/..."로 요청 (CORS 불필요)
  //   API 서버가 따로 떠 있으면 "http://localhost:8080" 처럼 주소를 넣고, 백엔드에서 CORS 허용 필요
  const API_ORIGIN = "";
  const BASE_URL = API_ORIGIN + "/api";

  // 판매자 JSP는 모두 같은 폴더(seller/)에 있으므로 상대경로 사용
  const LOGIN_URL = "login.jsp";

  const TOKEN_KEY = "seller_token";
  const ROLE_KEY = "seller_role";     // 로그인 응답의 code ("seller")
  const LOGIN_ID_KEY = "seller_login_id";

  // ---------- 로그인 정보 저장/조회/삭제 ----------
  function saveSession(token, role, loginId) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(LOGIN_ID_KEY, loginId);
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(LOGIN_ID_KEY);
  }
  function getToken()   { return localStorage.getItem(TOKEN_KEY); }
  function getRole()    { return localStorage.getItem(ROLE_KEY); }
  function getLoginId() { return localStorage.getItem(LOGIN_ID_KEY); }

  // ---------- 쿼리스트링 (빈 값 제외) ----------
  function toQuery(params) {
    if (!params) return "";
    const qs = new URLSearchParams();
    Object.keys(params).forEach(function (key) {
      const v = params[key];
      if (v !== undefined && v !== null && v !== "") qs.append(key, v);
    });
    const s = qs.toString();
    return s ? "?" + s : "";
  }

  // ---------- 공통 요청 ----------
  async function request(method, path, options) {
    options = options || {};
    const headers = {};
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    let body;
    if (options.formData) {
      body = options.formData; // multipart: Content-Type 직접 넣지 말 것 (boundary 자동)
    } else if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const res = await fetch(BASE_URL + path + toQuery(options.query), {
      method: method,
      headers: headers,
      body: body
    });

    // 토큰 없음/만료 → 로그인으로 (로그인 요청은 제외)
    // 401만 로그아웃 처리. 403(남의 주문·상품 등 권한 없음)은 로그인 유지 + 실패 메시지만 표시
    if (res.status === 401 && !options.skipAuthRedirect) {
      clearSession();
      alert("로그인이 필요합니다.");
      location.replace(LOGIN_URL);
      throw new Error("UNAUTHORIZED");
    }
    if (res.status === 403) {
      const err = new Error("FORBIDDEN"); // 각 페이지의 실패 메시지가 표시됨
      err.status = 403;
      throw err;
    }

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    // 실패 판정: HTTP 에러이거나, 규격서 공통 code가 "no"
    if (!res.ok || (data && data.code === "no")) {
      const err = new Error(options.failMessage || "요청을 처리하지 못했습니다.");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // ---------- 로그아웃 ----------
  // 11/25 백엔드 협의: 로그아웃 API 없이 토큰 삭제로 구현
  async function logout() {
    clearSession();
    location.replace(LOGIN_URL);
  }

  return {
    LOGIN_URL: LOGIN_URL,
    saveSession: saveSession,
    clearSession: clearSession,
    getToken: getToken,
    getRole: getRole,
    getLoginId: getLoginId,
    logout: logout,

    // opt 예: { failMessage: "주문 목록을 불러오지 못했습니다." }
    get:    function (path, query, opt) { return request("GET", path, Object.assign({ query: query }, opt)); },
    post:   function (path, body, opt)  { return request("POST", path, Object.assign({ body: body }, opt)); },
    put:    function (path, body, opt)  { return request("PUT", path, Object.assign({ body: body }, opt)); },
    patch:  function (path, body, opt)  { return request("PATCH", path, Object.assign({ body: body }, opt)); },
    del:    function (path, body, opt)  { return request("DELETE", path, Object.assign({ body: body }, opt)); },
    upload: function (method, path, formData, opt) { return request(method, path, Object.assign({ formData: formData }, opt)); }
  };
})();