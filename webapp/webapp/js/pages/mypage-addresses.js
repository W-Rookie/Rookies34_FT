// 마이컬리 > 배송지 관리 — 목록 / 추가 / 수정 / 삭제 / 기본배송지
// [규격서 없음] 목록 조회 GET /api/me/addresses 는 프론트가 가정한 API
requireLogin();
let addresses = [];
let editingId = null; // null이면 추가, 숫자면 수정

const form = document.getElementById('address-form');

async function load() {
  const res = await api.getAddresses();
  if (res.code !== 'ok') return;
  addresses = res.addresses;
  document.getElementById('address-list').innerHTML = addresses.length ? addresses.map((a) => `
    <li class="address-card" data-id="${a.address_id}">
      ${a.is_default ? '<span class="badge">기본배송지</span>' : ''}
      <p><b>${a.recipient_name}</b> · ${a.recipient_phone}</p>
      <p>[${a.zipcode}] ${a.address} ${a.address_detail || ''}</p>
      <div class="card-actions">
        <button type="button" class="link-btn" data-act="edit">수정</button>
        <button type="button" class="link-btn" data-act="delete">삭제</button>
      </div>
    </li>`).join('') : '<li class="empty">등록된 배송지가 없습니다.</li>';
}

function openForm(addr) {
  editingId = addr ? addr.address_id : null;
  document.getElementById('form-title').textContent = addr ? '배송지 수정' : '새 배송지 추가';
  form.reset();
  if (addr) {
    ['recipient_name', 'recipient_phone', 'zipcode', 'address', 'address_detail'].forEach((k) => { form.elements[k].value = addr[k] || ''; });
    form.elements.is_default.checked = !!addr.is_default;
  }
  form.hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('add-btn').onclick = () => openForm(null);
document.getElementById('cancel-btn').onclick = () => { form.hidden = true; };

document.getElementById('address-list').onclick = async (e) => {
  const act = e.target.dataset.act;
  if (!act) return;
  const id = Number(e.target.closest('.address-card').dataset.id);
  if (act === 'edit') openForm(addresses.find((a) => a.address_id === id));
  if (act === 'delete' && confirm('배송지를 삭제하시겠습니까?')) {
    if (assertOk(await api.deleteAddress(id), '삭제하지 못했습니다.')) load();
  }
};

document.getElementById('find-zip').onclick = () => {
  if (typeof daum === 'undefined') return alert('주소 검색을 불러오지 못했습니다. 직접 입력해 주세요.');
  new daum.Postcode({
    oncomplete(data) {
      form.elements.zipcode.value = data.zonecode;
      form.elements.address.value = data.roadAddress || data.jibunAddress;
      form.elements.address_detail.focus();
    },
  }).open();
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const v = (k) => form.elements[k].value.trim();
  const data = {
    recipient_name: v('recipient_name'),
    recipient_phone: v('recipient_phone').replace(/\D/g, ''),
    zipcode: v('zipcode'),
    address: v('address'),
    address_detail: v('address_detail'),
    is_default: form.elements.is_default.checked,
  };
  if (!/^\d{5}$/.test(data.zipcode) || !data.address) return alert('주소를 입력해 주세요.');
  const res = editingId ? await api.updateAddress(editingId, data) : await api.addAddress(data);
  if (!assertOk(res, '저장하지 못했습니다.')) return;
  form.hidden = true;
  load();
};

load();
