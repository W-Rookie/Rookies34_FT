// 마이컬리 > 회원 정보 관리 — 정보 수정 / 비밀번호 변경
// [규격서 없음] 기존 정보 조회 GET /api/me 는 프론트가 가정한 API
requireLogin();
const infoForm = document.getElementById('info-form');
const pwForm = document.getElementById('pw-form');

async function load() {
  const res = await api.getMe();
  if (res.code !== 'ok') return;
  document.getElementById('login-id').textContent = res.login_id;
  ['name', 'email', 'phone', 'birth_date'].forEach((k) => { infoForm.elements[k].value = res[k] || ''; });
  const g = infoForm.querySelector(`input[name="gender"][value="${res.gender || 'NONE'}"]`);
  if (g) g.checked = true;
}

infoForm.onsubmit = async (e) => {
  e.preventDefault();
  const v = (k) => infoForm.elements[k].value.trim();
  if (!v('current_password')) return alert('현재 비밀번호를 입력해 주세요.');
  const res = await api.updateMe({
    current_password: infoForm.elements.current_password.value, // 정보 수정 전 본인 재확인
    name: v('name'),
    email: v('email'),
    phone: v('phone').replace(/\D/g, ''),
    gender: infoForm.gender.value,
    birth_date: v('birth_date') || undefined,
  });
  if (!assertOk(res, '정보를 수정하지 못했습니다. 현재 비밀번호를 확인해 주세요.')) return;
  alert('회원 정보가 수정되었습니다.');
  infoForm.elements.current_password.value = '';
};

pwForm.onsubmit = async (e) => {
  e.preventDefault();
  const pw = pwForm.new_password.value;
  if (pw.length < 8 || pw.length > 20) return alert('새 비밀번호는 8~20자로 입력해 주세요.');
  if (pw !== pwForm.new_password_confirm.value) return alert('새 비밀번호가 일치하지 않습니다.');
  const res = await api.changePassword(pwForm.current_password.value, pw);
  if (!assertOk(res, '비밀번호를 변경하지 못했습니다. 현재 비밀번호를 확인해 주세요.')) return;
  alert('비밀번호가 변경되었습니다.');
  pwForm.reset();
};

load();
