
/**
 * signup.js - 판매자 입점 신청
 *
 * U-03 GET  /api/auth/check-id?id=...
 * U-05 POST /api/sellers
 *
 * U-05 전송 방식: multipart/form-data
 * 사업자등록증: Base64 문자열 + 파일명
 */

(function () {

  const $ = (id) => document.getElementById(id);

  const form = $("signupForm");
  const submitBtn = $("submitBtn");
  const msg = $("signupMsg");

  const idInput = $("login_id");
  const checkIdBtn = $("checkIdBtn");
  const checkIdMsg = $("checkIdMsg");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];

  let checkedId = null;

  // =====================================
  // 1. 아이디 중복 확인 메시지
  // =====================================

  function setCheckMessage(text, type = "") {

    checkIdMsg.textContent = text;
    checkIdMsg.className = type
      ? "msg " + type
      : "msg";

    // 메시지가 입력칸 아래에 표시되도록 설정
    checkIdMsg.style.display = text ? "block" : "none";
    checkIdMsg.style.marginTop = "6px";
    checkIdMsg.style.lineHeight = "1.5";
    checkIdMsg.style.fontSize = "13px";
    checkIdMsg.style.whiteSpace = "normal";
    checkIdMsg.style.overflowWrap = "break-word";

    // 성공: 초록색
    if (type === "success") {
      checkIdMsg.style.setProperty(
        "color",
        "#15803d",
        "important"
      );
    }

    // 실패: 빨간색
    else if (type === "error") {
      checkIdMsg.style.setProperty(
        "color",
        "#dc2626",
        "important"
      );
    }

    // 기본 상태
    else {
      checkIdMsg.style.removeProperty("color");
    }
  }

  // 최초 메시지 초기화
  setCheckMessage("");

  // =====================================
  // 2. 아이디 중복 확인
  // =====================================

  checkIdBtn.addEventListener("click", async function () {

    const loginId = idInput.value.trim();

    checkedId = null;
    setCheckMessage("");

    // 아이디 형식 확인
    if (!/^[A-Za-z0-9]{6,16}$/.test(loginId)) {

      setCheckMessage(
        "아이디는 6~16자 영문/숫자입니다.",
        "error"
      );

      return;
    }

    checkIdBtn.disabled = true;

    try {

      // 백엔드 @RequestParam String id 기준
      const data = await api.get(
        "/auth/check-id",
        { id: loginId },
        { skipAuthRedirect: true }
      );

      // 요청 중 아이디가 변경되었다면 결과 무시
      if (idInput.value.trim() !== loginId) {
        return;
      }

      // 사용 가능한 아이디
      if (data && data.code === "ok") {

        checkedId = loginId;

        setCheckMessage(
          "사용 가능한 아이디입니다.",
          "success"
        );

      } else {

        checkedId = null;

        setCheckMessage(
          "중복 확인 결과를 확인할 수 없습니다.",
          "error"
        );

      }

    } catch (err) {

      checkedId = null;

      // 요청 중 아이디가 변경되었다면 결과 무시
      if (idInput.value.trim() !== loginId) {
        return;
      }

      // 서버가 HTTP 200 + code:no 반환
      if (
        err.status === 200 &&
        err.data &&
        err.data.code === "no"
      ) {

        setCheckMessage(
          "이미 사용 중인 아이디입니다.",
          "error"
        );

      } else {

        // 네트워크 오류, 404, 500 등
        setCheckMessage(
          "중복 확인 요청에 실패했습니다.",
          "error"
        );

        console.error("아이디 중복 확인 오류:", err);

      }

    } finally {

      checkIdBtn.disabled = false;

    }

  });

  // =====================================
  // 3. 아이디 변경 시 중복 확인 초기화
  // =====================================

  idInput.addEventListener("input", function () {

    checkedId = null;
    setCheckMessage("");

  });

  // =====================================
  // 4. 입력값 검증
  // =====================================

  function validate() {

    const v = (id) => $(id).value.trim();

    // 아이디 중복 확인 여부
    if (
      checkedId === null ||
      checkedId !== v("login_id")
    ) {
      return "아이디 중복 확인을 해 주세요.";
    }

    // 비밀번호
    const pw = $("password").value;

    if (pw.length < 8 || pw.length > 20) {
      return "비밀번호는 8~20자입니다.";
    }

    if (pw !== $("password_confirm").value) {
      return "비밀번호 확인이 일치하지 않습니다.";
    }

    // 담당자 이름
    if (
      !v("manager_name") ||
      v("manager_name").length > 20
    ) {
      return "담당자 이름은 1~20자입니다.";
    }

    // 이메일
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))
    ) {
      return "이메일 형식이 올바르지 않습니다.";
    }

    // 연락처
    if (!/^[0-9]+$/.test(v("phone"))) {
      return "연락처는 숫자만 입력해 주세요.";
    }

    // 상호명
    if (
      !v("business_name") ||
      v("business_name").length > 50
    ) {
      return "상호명은 1~50자입니다.";
    }

    // 사업자등록번호
    if (!/^[0-9]{10}$/.test(v("business_reg_no"))) {
      return "사업자등록번호는 숫자 10자리입니다.";
    }

    // =====================================
    // 5. 정산 계좌 정보 검증
    // =====================================

    // 은행명
    if (!v("bank")) {
      return "은행을 선택해 주세요.";
    }

    // 계좌번호
    if (
      !/^[0-9]+$/.test(v("account_no")) ||
      v("account_no").length > 100
    ) {
      return "계좌번호는 100자리 이하의 숫자로 입력해 주세요.";
    }

    // 예금주
    if (
      !v("account_holder") ||
      v("account_holder").length > 100
    ) {
      return "예금주를 입력해 주세요.";
    }

    // =====================================
    // 6. 사업자등록증 검증
    // =====================================

    const file = $("business_cert_file").files[0];

    if (!file) {
      return "사업자등록증 파일을 첨부해 주세요.";
    }

    const ext = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!ALLOWED_EXT.includes(ext)) {
      return "jpg, png, pdf 파일만 첨부할 수 있습니다.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "파일은 5MB 이하만 첨부할 수 있습니다.";
    }

    // 약관 동의
    if (!$("agree_terms").checked) {
      return "판매자 이용약관에 동의해 주세요.";
    }

    return null;
  }

  // =====================================
  // 7. 사업자등록증 Base64 변환
  // =====================================

  function fileToBase64(file) {

    return new Promise(function (resolve, reject) {

      const reader = new FileReader();

      reader.onload = function () {

        const result = String(reader.result || "");
        const commaIndex = result.indexOf(",");

        if (commaIndex === -1) {
          reject(new Error("파일 변환 실패"));
          return;
        }

        resolve(result.substring(commaIndex + 1));

      };

      reader.onerror = function () {
        reject(new Error("파일 읽기 실패"));
      };

      reader.readAsDataURL(file);

    });
  }

  // =====================================
  // 8. 입점 신청 API 호출
  // =====================================

  form.addEventListener("submit", async function (e) {

    e.preventDefault();

    msg.textContent = "";

    const error = validate();

    if (error) {
      msg.textContent = error;
      msg.style.color = "#dc2626";
      return;
    }

    submitBtn.disabled = true;

    try {

      const file = $("business_cert_file").files[0];

      // 사업자등록증 Base64 변환
      const base64 = await fileToBase64(file);

      // multipart/form-data
      const fd = new FormData(form);

      // 계정 정보
      fd.set(
        "login_id",
        $("login_id").value.trim()
      );

      // 사업자등록증
      fd.set(
        "business_cert_file",
        base64
      );

      fd.set(
        "business_cert_file_name",
        file.name
      );

      // 정산 계좌 정보
      fd.set(
        "bank",
        $("bank").value
      );

      fd.set(
        "account_no",
        $("account_no").value.trim()
      );

      fd.set(
        "account_holder",
        $("account_holder").value.trim()
      );

      // 판매자 약관 동의
      fd.set("agree_terms", "true");

      // U-05 입점 신청
      const result = await api.upload(
        "POST",
        "/sellers",
        fd,
        { skipAuthRedirect: true }
      );

      // 성공 응답 확인
      if (!result || result.code !== "ok") {
        throw new Error("입점 신청 응답 오류");
      }

      alert(
        "입점 신청이 완료되었습니다.\n" +
        "관리자 승인 후 로그인할 수 있습니다."
      );

      location.replace(api.LOGIN_URL);

    } catch (err) {

      console.error("입점 신청 오류:", err);

      msg.textContent =
        "입점 신청에 실패했습니다. " +
        "입력값이나 서버 상태를 확인해 주세요.";

      msg.style.color = "#dc2626";

    } finally {

      submitBtn.disabled = false;

    }

  });

})();
