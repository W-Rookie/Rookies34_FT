// 로그인 — 구매자·판매자 공용 API, 응답 code로 구분
if (auth.isLoggedIn()) location.href = 'index.jsp';

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const res = await api.login(f.login_id.value.trim(), f.password.value);

  // [협의 필요] 로그인 실패 응답 형식이 규격서에 없음 (code: "user" / "seller"만 정의)
  if (res.code === 'user') {
    auth.setToken(res.token);
    // 비회원 장바구니 병합 — [협의 필요] 로그인 API 내부에서 처리할지 여부
    try { await api.mergeCart(); } catch (err) { console.error(err); }
    location.href = safeRedirect(qs('redirect'));
  } else if (res.code === 'seller') {
    auth.setToken(res.token);
    location.href = 'seller/index.jsp'; // 판매자센터 담당 팀원 경로에 맞게 수정
  } else {
    document.getElementById('login-error').textContent = '아이디 또는 비밀번호를 확인해 주세요.';
  }
};
