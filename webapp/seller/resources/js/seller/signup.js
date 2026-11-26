/**
 * signup.js — 판매자 회원가입 / 입점 신청 (U-05)
 * API: POST /api/sellers  (multipart/form-data)
 *      login_id, password, manager_name, email, phone,
 *      business_reg_no, business_name, business_cert_file(파일), agree_terms
 * 응답: { code: "ok" | "no" }
 *
 * 아이디 중복 확인 (U-03): GET /api/auth/check-id?login_id=...
 * 응답: { code: "ok"(사용 가능) | "no"(중복) }
 */
(function () {
  const form = document.getElementById("signupForm");
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("signupMsg");
  const idInput = document.getElementById("login_id");
  const checkIdBtn = document.getElementById("checkIdBtn");
  const checkIdMsg = document.getElementById("checkIdMsg");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];

  let checkedId = null; // 중복 확인 통과한 아이디 (확인 후 아이디를 바꾸면 다시 확인해야 함)

  // ---------- 아이디 중복 확인 ----------
  checkIdBtn.addEventListener("click", async function () {
    const loginId = idInput.value.trim();
    if (!/^[A-Za-z0-9]{6,16}$/.test(loginId)) {
      checkIdMsg.textContent = "아이디는 6~16자 영문/숫자입니다.";
      return;
    }
    try {
      // api.get은 code "no"면 에러를 던짐 → catch로 가면 "중복"
      await api.get("/auth/check-id", { login_id: loginId }, { skipAuthRedirect: true });
      checkedId = loginId;
      checkIdMsg.textContent = "사용 가능한 아이디입니다.";
    } catch (err) {
      checkedId = null;
      checkIdMsg.textContent = "이미 사용 중인 아이디입니다.";
    }
  });

  // 아이디를 다시 바꾸면 중복확인 무효
  idInput.addEventListener("input", function () {
    checkedId = null;
    checkIdMsg.textContent = "";
  });

  // ---------- 입력값 검사 (규격서 제약 기준) ----------
  function validate() {
    const v = function (id) { return document.getElementById(id).value.trim(); };

    if (checkedId === null || checkedId !== v("login_id")) return "아이디 중복 확인을 해 주세요.";

    const pw = document.getElementById("password").value;
    if (pw.length < 8 || pw.length > 20) return "비밀번호는 8~20자입니다.";
    if (pw !== document.getElementById("password_confirm").value) return "비밀번호 확인이 일치하지 않습니다.";

    if (!v("manager_name") || v("manager_name").length > 20) return "담당자 이름은 1~20자입니다.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) return "이메일 형식이 올바르지 않습니다.";
    if (!/^[0-9]+$/.test(v("phone"))) return "연락처는 숫자만 입력해 주세요.";
    if (!v("business_name") || v("business_name").length > 50) return "상호명은 1~50자입니다.";
    if (!/^[0-9]{10}$/.test(v("business_reg_no"))) return "사업자등록번호는 숫자 10자리입니다.";

    const file = document.getElementById("business_cert_file").files[0];
    if (!file) return "사업자등록증 파일을 첨부해 주세요.";
    const ext = file.name.split(".").pop().toLowerCase();
    if (ALLOWED_EXT.indexOf(ext) === -1) return "jpg, png, pdf 파일만 첨부할 수 있습니다.";
    if (file.size > MAX_FILE_SIZE) return "파일은 5MB 이하만 첨부할 수 있습니다.";

    if (!document.getElementById("agree_terms").checked) return "판매자 이용약관에 동의해 주세요.";

    return null; // 통과
  }

  // ---------- 입점 신청 전송 ----------
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    msg.textContent = "";

    const error = validate();
    if (error) {
      msg.textContent = error;
      return;
    }

    // name 있는 입력값(+파일)이 자동으로 담김. password_confirm은 name이 없어서 제외됨
    const fd = new FormData(form);
    fd.set("login_id", fd.get("login_id").trim());
    fd.set("agree_terms", "true"); // 체크박스는 name 없이 두고 값만 직접 넣음

    submitBtn.disabled = true;
    try {
      await api.upload("POST", "/sellers", fd, { skipAuthRedirect: true });
      alert("입점 신청이 완료되었습니다.\n관리자 승인 후 로그인할 수 있습니다.");
      location.replace(api.LOGIN_URL);
    } catch (err) {
      msg.textContent = "입점 신청에 실패했습니다. 입력값을 확인해 주세요.";
    } finally {
      submitBtn.disabled = false;
    }
  });
})();