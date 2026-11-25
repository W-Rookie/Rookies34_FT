/**
 * settings.js — 판매자 정보·정산 계좌 수정 (S-10)
 *  PUT /api/seller/profile
 *      { business_name, phone, bank, account_no, account_holder }   (모두 필수)
 *  응답: { code: "ok" | "no" }
 *  ※ 현재 정보 조회 API(GET /api/seller/profile)가 없어 빈 폼으로 시작
 *  ※ 은행 코드는 규격서 예시("NH") 외에는 임시값 → 백엔드와 확인 필요
 */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const form = $("settingsForm");
  const btn = $("saveBtn");
  const msg = $("settingsMsg");

  function validate() {
    const v = function (id) { return $(id).value.trim(); };
    if (!v("business_name") || v("business_name").length > 50) return "상호명은 1~50자입니다.";
    if (!/^[0-9]+$/.test(v("phone"))) return "연락처는 숫자만 입력해 주세요.";
    if (!v("bank")) return "은행을 선택해 주세요.";
    if (!/^[0-9]+$/.test(v("account_no"))) return "계좌번호는 숫자만 입력해 주세요.";
    if (!v("account_holder")) return "예금주를 입력해 주세요.";
    return null;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    msg.textContent = "";

    const error = validate();
    if (error) {
      msg.textContent = error;
      return;
    }

    if (!confirm("판매자 정보와 정산 계좌를 저장하시겠습니까?")) return;

    btn.disabled = true;
    try {
      await api.put("/seller/profile", {
        business_name: $("business_name").value.trim(),
        phone: $("phone").value.trim(),
        bank: $("bank").value,
        account_no: $("account_no").value.trim(),
        account_holder: $("account_holder").value.trim()
      });
      msg.textContent = "저장되었습니다.";
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") msg.textContent = "저장에 실패했습니다.";
    } finally {
      btn.disabled = false;
    }
  });
})();
