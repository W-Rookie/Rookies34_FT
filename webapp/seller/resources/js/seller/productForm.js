
/**
 * productForm.js - 판매자 상품 등록·수정 (S-02)
 *
 * 등록: POST /api/seller/products (multipart/form-data)
 * 수정: PUT  /api/seller/products/{productId} (multipart/form-data)
 * 기존 상품 조회: GET /api/products/{productId}
 *
 * 더미데이터를 사용하지 않고 실제 API만 호출합니다.
 */
(function () {
  "use strict";

  const $ = function (id) { return document.getElementById(id); };
  const form = $("productForm");
  const submitBtn = $("submitBtn");
  const msg = $("formMsg");
  const modeNotice = $("modeNotice");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXT = ["jpg", "jpeg", "png"];
  const MAX_DETAIL = 10;

  const params = new URLSearchParams(location.search);
  const productId = params.get("id");
  const isEdit = productId !== null && productId !== "";

  // 기존 상품 정보를 불러오기 전에는 수정 요청을 허용하지 않음
  let productLoaded = !isEdit;

  function showError(text) {
    msg.textContent = text;
    msg.style.color = "#dc2626";
  }

  // =====================================
  // 1. 수정 모드: 기존 상품 조회
  // =====================================
  if (isEdit) {
    $("pageTitle").textContent = "상품 수정";
    submitBtn.textContent = "수정";
    submitBtn.disabled = true;

    if (!/^[1-9][0-9]*$/.test(productId)) {
      modeNotice.textContent = "잘못된 상품 ID입니다. 상품 목록에서 다시 선택해 주세요.";
    } else {
      modeNotice.textContent = "기존 상품 정보를 불러오는 중입니다.";
      loadProduct(productId);
    }
  }

  async function loadProduct(id) {
    try {
      // 실제 상품 상세 응답: { code: "ok", product: { ... } }
      const result = await api.get(
        "/products/" + encodeURIComponent(id)
      );

      if (!result || result.code !== "ok" || !result.product) {
        throw new Error("상품 상세 응답이 올바르지 않습니다.");
      }

      const p = result.product;

      // 0과 빈 값을 구분하여 입력값 설정
      $("name").value = p.name ?? "";
      $("category_id").value = p.category_id ?? "";
      $("price").value = p.price ?? "";
      $("discount_rate").value = p.discount_rate ?? "";
      $("stock").value = p.stock ?? "";
      $("storage_type").value = p.storage_type ?? "";
      $("origin").value = p.origin ?? "";
      $("description").value = p.description ?? "";

      // 기존 대표 이미지 미리보기 (파일 input에는 기존 파일을 채울 수 없음)
      const currentThumb = $("currentThumb");
      currentThumb.replaceChildren();

      if (p.thumbnail) {
        const img = document.createElement("img");
        img.src = p.thumbnail;
        img.alt = "현재 대표 이미지";
        img.width = 120;
        currentThumb.appendChild(img);
      }

      productLoaded = true;
      submitBtn.disabled = false;
      modeNotice.textContent = "이미지를 새로 선택하지 않으면 기존 이미지가 유지됩니다.";

    } catch (err) {
      productLoaded = false;
      submitBtn.disabled = true;

      if (err.message === "UNAUTHORIZED") return;

      console.error("기존 상품 조회 오류:", err);
      modeNotice.textContent =
        "기존 상품 정보를 불러오지 못했습니다. 상품 목록에서 다시 선택해 주세요.";
    }
  }

  // =====================================
  // 2. 이미지 파일 검증
  // =====================================
  function checkFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXT.includes(ext)) {
      return file.name + ": jpg, jpeg, png 파일만 가능합니다.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return file.name + ": 5MB 이하만 가능합니다.";
    }

    return null;
  }

  // =====================================
  // 3. 입력값 검증
  // =====================================
  function validate() {
    const v = function (id) { return $(id).value.trim(); };
    const isInt = function (s) { return /^[0-9]+$/.test(s); };

    if (isEdit && !productLoaded) {
      return "기존 상품 정보를 불러오지 못해 수정할 수 없습니다.";
    }

    if (!v("name") || v("name").length > 100) {
      return "상품명은 1~100자입니다.";
    }

    if (!isInt(v("category_id")) || Number(v("category_id")) < 1) {
      return "카테고리 ID는 1 이상의 숫자로 입력해 주세요.";
    }

    if (!isInt(v("price")) || Number(v("price")) < 100) {
      return "판매가는 100원 이상 정수입니다.";
    }

    if (v("discount_rate") !== "") {
      if (!isInt(v("discount_rate")) || Number(v("discount_rate")) > 90) {
        return "할인율은 0~90입니다.";
      }
    }

    if (!isInt(v("stock"))) {
      return "재고는 0 이상 정수입니다.";
    }

    if (!v("storage_type")) {
      return "포장타입을 선택해 주세요.";
    }

    if (!v("origin")) {
      return "원산지를 입력해 주세요.";
    }

    if (!v("description")) {
      return "상품 설명을 입력해 주세요.";
    }

    const thumb = $("thumbnail").files[0];

    // 등록 시 대표 이미지 필수, 수정 시에는 기존 이미지 유지 가능
    if (!thumb && !isEdit) {
      return "대표 이미지를 첨부해 주세요.";
    }

    if (thumb) {
      const thumbError = checkFile(thumb);
      if (thumbError) return thumbError;
    }

    const details = $("detail_images").files;

    if (details.length > MAX_DETAIL) {
      return "상세 이미지는 최대 10장입니다.";
    }

    for (let i = 0; i < details.length; i++) {
      const detailError = checkFile(details[i]);
      if (detailError) return detailError;
    }

    return null;
  }

  // =====================================
  // 4. 상품 등록·수정 API 호출
  // =====================================
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    msg.textContent = "";

    // 기존 상품 조회 중이거나 요청 처리 중이면 중복 제출 방지
    if (submitBtn.disabled) return;

    const error = validate();
    if (error) {
      showError(error);
      return;
    }

    // 실제 multipart/form-data 전송
    const fd = new FormData(form);

    // 앞뒤 공백 제거
    fd.set("name", $("name").value.trim());
    fd.set("origin", $("origin").value.trim());
    fd.set("description", $("description").value.trim());

    // 선택 항목의 빈 파일 파트는 보내지 않음
    if ($("discount_rate").value.trim() === "") {
      fd.delete("discount_rate");
    }
    if ($("detail_images").files.length === 0) {
      fd.delete("detail_images");
    }
    if ($("thumbnail").files.length === 0) {
      fd.delete("thumbnail");
    }

    submitBtn.disabled = true;

    try {
      let result;

      if (isEdit) {
        // 실제 상품 수정 API
        result = await api.upload(
          "PUT",
          "/seller/products/" + encodeURIComponent(productId),
          fd
        );
      } else {
        // 실제 상품 등록 API
        result = await api.upload(
          "POST",
          "/seller/products",
          fd
        );
      }

      // HTTP 200이어도 code가 ok가 아니면 성공으로 보지 않음
      if (!result || result.code !== "ok") {
        throw new Error("상품 저장 API 응답 오류");
      }

      if (isEdit) {
        alert("상품이 수정되었습니다.");
      } else {
        alert("상품이 등록되었습니다.\n관리자 검증 후 판매가 시작됩니다.");
      }

      location.href = "products.jsp";

    } catch (err) {
      if (err.message !== "UNAUTHORIZED") {
        console.error("상품 저장 오류:", err);
        showError(isEdit ? "상품 수정에 실패했습니다." : "상품 등록에 실패했습니다.");
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
