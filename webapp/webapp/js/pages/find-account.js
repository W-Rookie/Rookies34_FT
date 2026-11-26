// 아이디 찾기(find-id.jsp) / 비밀번호 찾기(find-pw.jsp) 공용
// <body data-mode="id"> 또는 data-mode="pw"
// 휴대폰/이메일 탭 → ① 인증번호 요청 → ② 인증번호 확인 → (비번) ③ 새 비밀번호
const mode = document.body.dataset.mode;
let method = 'sms';
let resetToken = null;

const form = document.getElementById('find-form');

document.querySelectorAll('.tab').forEach((tab) => {
  tab.onclick = () => {
    method = tab.dataset.method;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    document.getElementById('phone-row').hidden = method !== 'sms';
    document.getElementById('email-row').hidden = method !== 'email';
    document.getElementById('verify-row').hidden = true;
    document.getElementById('result').textContent = '';
  };
});

const val = (n) => (form.elements[n] ? form.elements[n].value.trim() : ''); // form.name 충돌 방지
const phone = () => val('phone').replace(/\D/g, '');

document.getElementById('send-code').onclick = async () => {
  let res;
  if (mode === 'id') {
    res = method === 'sms' ? await api.findIdSendSms(val('name'), phone()) : await api.findIdSendEmail(val('name'), val('email'));
  } else {
    res = method === 'sms' ? await api.pwSendSms(val('login_id'), val('name'), phone()) : await api.pwSendEmail(val('login_id'), val('name'), val('email'));
  }
  if (!assertOk(res, '인증번호를 보내지 못했습니다. 입력 정보를 확인해 주세요.')) return;
  alert('인증번호를 보냈습니다. (3분 이내 입력)');
  document.getElementById('verify-row').hidden = false;
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const code = val('verify_code'); // 앞자리 0 보존 위해 문자열 그대로
  if (!/^\d{6}$/.test(code)) return alert('인증번호 6자리를 입력해 주세요.');

  let res;
  if (mode === 'id') {
    res = method === 'sms' ? await api.findIdVerifySms(val('name'), phone(), code) : await api.findIdVerifyEmail(val('name'), val('email'), code);
    if (!assertOk(res, '인증번호가 올바르지 않습니다.')) return;
    document.getElementById('result').innerHTML = `회원님의 아이디는 ${res.id} 입니다.`;
  } else {
    res = method === 'sms' ? await api.pwVerifySms(val('login_id'), phone(), code) : await api.pwVerifyEmail(val('login_id'), val('email'), code);
    if (!assertOk(res, '인증번호가 올바르지 않습니다.')) return;
    resetToken = res.reset_token;
    form.hidden = true;
    document.getElementById('reset-form').hidden = false;
  }
};

const resetForm = document.getElementById('reset-form');
if (resetForm) {
  resetForm.onsubmit = async (e) => {
    e.preventDefault();
    const pw = resetForm.new_password.value;
    if (pw.length < 8 || pw.length > 20) return alert('비밀번호는 8~20자로 입력해 주세요.');
    if (pw !== resetForm.new_password_confirm.value) return alert('비밀번호가 일치하지 않습니다.');
    if (!assertOk(await api.pwReset(resetToken, pw), '비밀번호를 변경하지 못했습니다.')) return;
    alert('비밀번호가 변경되었습니다. 다시 로그인해 주세요.');
    location.href = 'login.jsp';
  };
}
