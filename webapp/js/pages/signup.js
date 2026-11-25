// 일반 회원가입 — 화면 검증은 편의용, 서버도 같은 규칙으로 반드시 검증해야 함
const form = document.getElementById('signup-form');
let idChecked = false;

const RULE = {
  login_id: /^[A-Za-z0-9]{6,16}$/,
  password: /^.{8,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{10,11}$/,
  zipcode: /^\d{5}$/,
};

// 아이디를 바꾸면 중복확인 다시
form.elements.login_id.oninput = () => { idChecked = false; setMsg('id-msg', ''); };

function setMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'field-msg ' + (ok ? 'ok' : 'err');
}

document.getElementById('check-id').onclick = async () => {
  const id = form.elements.login_id.value.trim();
  if (!RULE.login_id.test(id)) return setMsg('id-msg', '6~16자 영문/숫자로 입력해 주세요.');
  const res = await api.checkId(id);
  idChecked = res.code === 'ok';
  setMsg('id-msg', idChecked ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.', idChecked);
};

// 우편번호 검색 — 카카오(다음) 우편번호 서비스 (외부 스크립트, HTML에서 로드)
document.getElementById('find-zip').onclick = () => {
  if (typeof daum === 'undefined') return alert('주소 검색을 불러오지 못했습니다. 직접 입력해 주세요.');
  new daum.Postcode({
    oncomplete(data) {
      form.zipcode.value = data.zonecode;
      form.address.value = data.roadAddress || data.jibunAddress;
      form.address_detail.focus();
    },
  }).open();
};

document.getElementById('agree-all').onchange = (e) => {
  ['agree_terms', 'agree_privacy', 'is_over_14'].forEach((n) => { form.elements[n].checked = e.target.checked; });
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const v = (n) => form.elements[n].value.trim(); // form.name 은 폼 자체 속성이라 elements로 접근

  if (!idChecked) return alert('아이디 중복확인을 해 주세요.');
  if (!RULE.password.test(form.password.value)) return alert('비밀번호는 8~20자로 입력해 주세요.');
  if (form.password.value !== form.password_confirm.value) return alert('비밀번호가 일치하지 않습니다.');
  if (!v('name') || v('name').length > 20) return alert('이름을 확인해 주세요.');
  if (!RULE.email.test(v('email'))) return alert('이메일 형식을 확인해 주세요.');
  const phone = v('phone').replace(/\D/g, '');
  if (!RULE.phone.test(phone)) return alert('휴대폰 번호를 확인해 주세요.');
  if (!RULE.zipcode.test(v('zipcode')) || !v('address')) return alert('주소를 입력해 주세요.');
  if (!form.agree_terms.checked || !form.agree_privacy.checked || !form.is_over_14.checked) {
    return alert('필수 약관에 동의해 주세요.');
  }

  const res = await api.signup({
    login_id: v('login_id'),
    password: form.password.value, // password_confirm은 서버로 안 보냄 (규격서에 없음)
    name: v('name'),
    email: v('email'),
    phone,
    zipcode: v('zipcode'),
    address: v('address'),
    address_detail: v('address_detail') || undefined,
    gender: form.gender.value || undefined,
    birth_date: v('birth_date') || undefined,
    agree_terms: true,
    agree_privacy: true,
    is_over_14: true,
  });
  if (!assertOk(res, '회원가입에 실패했습니다. 입력값을 확인해 주세요.')) return;
  alert('회원가입이 완료되었습니다.');
  location.href = 'login.jsp';
};
