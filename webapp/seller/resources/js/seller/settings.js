
/**
 * settings.js - 판매자 마이페이지 및 정보 수정 (S-10)
 *
 * GET /api/seller/profile          판매자 정보 조회
 * PUT /api/seller/profile          판매자 정보 수정 (JSON)
 * GET /api/seller/cert-file?path=  사업자등록증 다운로드
 *
 * 판매자 정보 조회 응답:
 * { code: "ok", manager_name, ..., cert_file_url }
 *
 * 백엔드 SellerInfoResponse의 @JsonUnwrapped 기준
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const form = $("settingsForm");
  const saveBtn = $("saveBtn");
  const settingsMsg = $("settingsMsg");
  const profileMsg = $("profileMsg");
  const certBtn = $("certDownloadBtn");
  const certMsg = $("certMsg");

  let certificatePath = "";

  // =====================================
  // 1. 공통 표시 함수
  // =====================================

  function show(id, value) {
    $(id).textContent =
      value === null ||
      value === undefined ||
      value === ""
        ? "-"
        : String(value);
  }

  // 조회 영역에 표시되는 계좌번호 마스킹
  function maskAccount(value) {
    const account = String(value || "");

    if (!account) return "-";

    if (account.length <= 4) {
      return "*".repeat(account.length);
    }

    return account.slice(0, 2) +
      "*".repeat(account.length - 4) +
      account.slice(-2);
  }

  // DB에 저장된 은행명이 select 목록에 없는 경우에도
  // 기존 은행 정보가 사라지지 않도록 처리
  function setBank(value) {
    const select = $("bank");
    const bank = String(value || "");

    const exists = Array.from(select.options).some(
      (option) => option.value === bank
    );

    if (bank && !exists) {
      const option = document.createElement("option");
      option.value = bank;
      option.textContent = bank;
      select.appendChild(option);
    }

    select.value = bank;
  }

  function statusLabel(status) {
    const labels = {
      PENDING: "승인 대기",
      APPROVED: "승인 완료",
      REJECTED: "반려"
    };

    return labels[status] || status || "-";
  }

  // 저장 경로에서 파일명 추출
  function storedFileName(path) {
    const filename = String(path || "")
      .split(/[\\/]/)
      .pop();

    return filename || "등록된 사업자등록증";
  }

  // =====================================
  // 2. 판매자 정보 조회
  // GET /api/seller/profile
  // =====================================

  async function loadProfile() {

    profileMsg.textContent =
      "판매자 정보를 불러오는 중입니다.";

    certMsg.textContent = "";

    certificatePath = "";
    certBtn.disabled = true;
    saveBtn.disabled = true;

    try {

      const data = await api.get("/seller/profile");

      if (!data || data.code !== "ok") {
        throw new Error("판매자 정보 조회 응답 오류");
      }

      // =====================================
      // 판매자 기본 정보
      // =====================================

      show(
        "profileLoginId",
        api.getLoginId()
      );

      show(
        "profileBusinessName",
        data.business_name
      );

      show(
        "profileManagerName",
        data.manager_name
      );

      show(
        "profileEmail",
        data.email
      );

      show(
        "profilePhone",
        data.phone
      );

      show(
        "profileBusinessRegNo",
        data.business_reg_no
      );

      show(
        "profileStatus",
        statusLabel(data.status)
      );

      // =====================================
      // 정산 계좌 정보
      // =====================================

      show(
        "profileBank",
        data.bank
      );

      show(
        "profileAccountNo",
        maskAccount(data.account_no)
      );

      show(
        "profileAccountHolder",
        data.account_holder
      );

      // =====================================
      // 기존 정보 수정 폼 자동 입력
      // =====================================

      $("business_name").value =
        data.business_name || "";

      $("phone").value =
        data.phone || "";

      setBank(data.bank);

      $("account_no").value =
        data.account_no || "";

      $("account_holder").value =
        data.account_holder || "";

      // =====================================
      // 사업자등록증
      // =====================================

      // 현재 백엔드 응답에서는 cert_download_url이
      // 누락될 수 있으므로 cert_file_url을 사용
      certificatePath =
        typeof data.cert_file_url === "string"
          ? data.cert_file_url.trim()
          : "";

      show(
        "certFileName",
        certificatePath
          ? storedFileName(certificatePath)
          : "등록된 파일 없음"
      );

      certBtn.disabled = !certificatePath;

      certMsg.textContent = certificatePath
        ? ""
        : "등록된 사업자등록증 경로가 없습니다.";

      profileMsg.textContent = "";
      saveBtn.disabled = false;

    } catch (err) {

      if (err.message === "UNAUTHORIZED") {
        return;
      }

      console.error(
        "판매자 정보 조회 실패:",
        err
      );

      profileMsg.textContent =
        "판매자 정보를 불러오지 못했습니다. " +
        "로그인 상태와 서버 응답을 확인해 주세요.";

      certMsg.textContent =
        "판매자 정보를 불러와야 다운로드할 수 있습니다.";

      // 조회 실패 시 빈 정보가 저장되지 않도록
      // 저장 버튼은 비활성화 유지
    }
  }

  // =====================================
  // 3. 사업자등록증 다운로드
  // GET /api/seller/cert-file?path=...
  // =====================================

  certBtn.addEventListener("click", async function () {

    if (!certificatePath) {
      certMsg.textContent =
        "다운로드할 사업자등록증이 없습니다.";
      return;
    }

    const token = api.getToken();

    if (!token) {
      certMsg.textContent =
        "로그인 정보가 없습니다. 다시 로그인해 주세요.";
      return;
    }

    certBtn.disabled = true;

    certMsg.textContent =
      "사업자등록증을 내려받는 중입니다.";

    try {

      // 현재 로그인한 판매자 정보에서
      // 조회한 사업자등록증 경로 사용
      const url =
        "/api/seller/cert-file?path=" +
        encodeURIComponent(certificatePath);

      // api.get()은 JSON 응답을 처리하므로
      // 파일 다운로드는 fetch로 별도 요청
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token
        }
      });

      // 인증 오류
      if (response.status === 401) {
        api.clearSession();

        alert("로그인이 필요합니다.");

        location.replace(api.LOGIN_URL);
        return;
      }

      if (!response.ok) {
        throw new Error(
          "파일 다운로드 HTTP " + response.status
        );
      }

      // 파일 대신 오류 JSON이 반환된 경우 방지
      const contentType = (
        response.headers.get("Content-Type") || ""
      ).toLowerCase();

      if (contentType.includes("application/json")) {
        throw new Error(
          "서버에서 파일 대신 JSON 응답을 반환했습니다."
        );
      }

      // =====================================
      // 파일 다운로드
      // =====================================

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error(
          "다운로드한 파일이 비어 있습니다."
        );
      }

      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = objectUrl;

      // 저장 경로에 포함된 파일명을 사용
      link.download = storedFileName(certificatePath)
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");

      document.body.appendChild(link);

      link.click();
      link.remove();

      // Blob URL 메모리 해제
      setTimeout(function () {
        URL.revokeObjectURL(objectUrl);
      }, 1000);

      certMsg.textContent =
        "다운로드 요청이 완료되었습니다.";

    } catch (err) {

      console.error(
        "사업자등록증 다운로드 실패:",
        err
      );

      certMsg.textContent =
        "다운로드에 실패했습니다. " +
        "서버의 파일 경로와 다운로드 API를 확인해 주세요.";

    } finally {

      certBtn.disabled = !certificatePath;

    }
  });

  // =====================================
  // 4. 판매자 정보 수정 검증
  // =====================================

  function validate() {

    const v = (id) => $(id).value.trim();

    // 상호명
    if (
      !v("business_name") ||
      v("business_name").length > 50
    ) {
      return "상호명은 1~50자입니다.";
    }

    // 연락처
    if (!/^[0-9]+$/.test(v("phone"))) {
      return "연락처는 숫자만 입력해 주세요.";
    }

    // 은행
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
      return "예금주는 1~100자입니다.";
    }

    return null;
  }

  // =====================================
  // 5. 판매자 정보 수정
  // PUT /api/seller/profile
  // =====================================

  form.addEventListener("submit", async function (e) {

    e.preventDefault();

    settingsMsg.textContent = "";

    if (saveBtn.disabled) return;

    const error = validate();

    if (error) {
      settingsMsg.textContent = error;
      return;
    }

    if (
      !confirm(
        "판매자 정보와 정산 계좌를 저장하시겠습니까?"
      )
    ) {
      return;
    }

    saveBtn.disabled = true;

    try {

      const result = await api.put(
        "/seller/profile",
        {
          business_name:
            $("business_name").value.trim(),

          phone:
            $("phone").value.trim(),

          bank:
            $("bank").value,

          account_no:
            $("account_no").value.trim(),

          account_holder:
            $("account_holder").value.trim()
        }
      );

      // HTTP 200이더라도 code:no는 실패
      if (!result || result.code !== "ok") {
        throw new Error("판매자 정보 수정 응답 오류");
      }

      settingsMsg.textContent = "저장되었습니다.";

      // 수정 완료 후 최신 판매자 정보 조회
      await loadProfile();

    } catch (err) {

      if (err.message === "UNAUTHORIZED") {
        return;
      }

      console.error(
        "판매자 정보 저장 실패:",
        err
      );

      settingsMsg.textContent =
        "저장에 실패했습니다. " +
        "서버 응답을 확인해 주세요.";

    } finally {

      // 정보 조회에 성공한 경우에만 다시 활성화
      if (!profileMsg.textContent) {
        saveBtn.disabled = false;
      }

    }
  });

  // =====================================
  // 6. 마이페이지 최초 진입 시 조회
  // =====================================

  loadProfile();

})();
