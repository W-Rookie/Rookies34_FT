/**
 * productForm.js - 판매자 상품 등록·수정 (S-02)
 *
 * 기존 상품 조회:
 * GET /api/products/{productId}
 *
 * 상품 등록:
 * POST /api/seller/products
 *
 * 상품 수정:
 * PUT /api/seller/products/{productId}
 *
 * 실제 API 사용 / 더미데이터 미사용
 */

(function () {
  "use strict";

  // =====================================
  // 1. 기본 설정
  // =====================================

  const $ = (id) => document.getElementById(id);

  const form = $("productForm");
  const submitBtn = $("submitBtn");
  const msg = $("formMsg");
  const modeNotice = $("modeNotice");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXT = ["jpg", "jpeg", "png"];
  const MAX_DETAIL = 10;

  const params = new URLSearchParams(location.search);
  const productId = params.get("id");

  const isEdit =
    productId !== null &&
    productId !== "";

  let productLoaded = !isEdit;
  let submitting = false;

  // =====================================
  // 2. 메시지 처리
  // =====================================

  function showError(text) {
    msg.textContent = text;
    msg.style.color = "#dc2626";
  }

  function clearError() {
    msg.textContent = "";
  }

  function showNotice(text) {
    if (modeNotice) {
      modeNotice.textContent = text;
    }
  }

  // =====================================
  // 3. 기존 상품 정보 입력
  // =====================================

  function populateFields(product) {

    // 상품명
    $("name").value =
      product.name ?? "";

    // 카테고리 ID
    $("category_id").value =
      product.category_id ?? "";

    // 판매가
    $("price").value =
      product.price ?? "";

    // 할인율
    $("discount_rate").value =
      product.discount_rate ?? 0;

    // 재고
    $("stock").value =
      product.stock ?? "";

    // 포장 타입
    $("storage_type").value =
      product.storage_type ?? "";

    // 원산지
    $("origin").value =
      product.origin ?? "";

    // 상품 설명
    $("description").value =
      product.description ?? "";

    // =====================================
    // 대표 이미지 미리보기
    // =====================================

    const currentThumb = $("currentThumb");

    if (currentThumb) {
      currentThumb.replaceChildren();

      const thumbnail =
        product.thumbnail ||
        product.thumbnail_url;

      if (thumbnail) {
        const img = document.createElement("img");

        img.src = thumbnail;
        img.alt = "대표 이미지";
        img.width = 120;

        img.style.maxWidth = "120px";
        img.style.height = "auto";
        img.style.marginTop = "10px";

        currentThumb.appendChild(img);
      }
    }

    // =====================================
    // 상세 이미지 미리보기
    // =====================================

    const currentDetails =
      $("currentDetailImages");

    if (currentDetails) {
      currentDetails.replaceChildren();

      const images = Array.isArray(product.detail_images)
        ? product.detail_images
        : [];

      images.forEach(function (url) {

        if (!url || typeof url !== "string") {
          return;
        }

        const img = document.createElement("img");

        img.src = url;
        img.alt = "상세 이미지";
        img.width = 100;

        img.style.maxWidth = "100px";
        img.style.height = "auto";
        img.style.margin = "5px";

        currentDetails.appendChild(img);
      });
    }
  }

  // =====================================
  // 4. 기존 상품 정보 조회
  // =====================================

  async function loadProduct(id) {

    productLoaded = false;
    submitBtn.disabled = true;

    clearError();
    showNotice("상품 정보를 불러오는 중입니다.");

    try {

      // 일반 상품 상세 조회 API
      const result = await api.get(
        "/products/" + encodeURIComponent(id)
      );

      // API 응답 검증
      if (
        !result ||
        result.code !== "ok"
      ) {
        throw new Error(
          "상품 상세 조회에 실패했습니다."
        );
      }

      // 최신 규격서에서는 최상위에 필드가 존재함.
      // 중첩 응답도 호환되도록 처리.
      const product = result.product || result;

      if (
        !product ||
        !product.name
      ) {
        throw new Error(
          "상품 상세 정보가 없습니다."
        );
      }

      // 상품 ID 일치 여부 확인
      if (
        product.product_id !== undefined &&
        product.product_id !== null &&
        String(product.product_id) !== String(id)
      ) {
        throw new Error(
          "조회된 상품 ID가 일치하지 않습니다."
        );
      }

      // =====================================
      // 기존 상품 정보 자동 입력
      // =====================================

      populateFields(product);

      // 필수 정보 누락 확인
      const requiredFields = [
        "name",
        "category_id",
        "price",
        "stock",
        "storage_type",
        "origin",
        "description"
      ];

      const missing = requiredFields.filter(function (field) {
        const input = $(field);
        return !input || input.value.trim() === "";
      });

      if (missing.length > 0) {
        throw new Error(
          "상품 정보 중 일부 항목이 누락되었습니다: " +
          missing.join(", ")
        );
      }

      // 정상 조회 완료
      productLoaded = true;
      submitBtn.disabled = false;

      // 불필요한 안내 문구 표시하지 않음
      showNotice("");

    } catch (err) {

      productLoaded = false;
      submitBtn.disabled = true;

      if (err.message === "UNAUTHORIZED") {
        return;
      }

      console.error(
        "상품 정보 조회 실패:",
        err
      );

      showNotice("");

      showError(
        err.message ||
        "기존 상품 정보를 불러오지 못했습니다."
      );
    }
  }

  // =====================================
  // 5. 이미지 파일 검증
  // =====================================

  function checkFile(file) {

    const ext = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!ALLOWED_EXT.includes(ext)) {
      return (
        file.name +
        ": jpg, jpeg, png 파일만 가능합니다."
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return (
        file.name +
        ": 5MB 이하만 가능합니다."
      );
    }

    return null;
  }

  // =====================================
  // 6. 입력값 검증
  // =====================================

  function validate() {

    const v = (id) => $(id).value.trim();

    const isInt = (value) =>
      /^[0-9]+$/.test(value);

    // 수정 모드 기존 정보 확인
    if (isEdit && !productLoaded) {
      return "상품 정보를 불러오지 못했습니다.";
    }

    // 상품명
    if (
      !v("name") ||
      v("name").length > 100
    ) {
      return "상품명은 1~100자입니다.";
    }

    // 카테고리 ID
    if (
      !isInt(v("category_id")) ||
      Number(v("category_id")) < 1
    ) {
      return "카테고리 ID를 확인해 주세요.";
    }

    // 판매가
    if (
      !isInt(v("price")) ||
      Number(v("price")) < 100
    ) {
      return "판매가는 100원 이상이어야 합니다.";
    }

    // 할인율
    if (v("discount_rate") !== "") {

      if (
        !isInt(v("discount_rate")) ||
        Number(v("discount_rate")) > 90
      ) {
        return "할인율은 0~90입니다.";
      }
    }

    // 재고
    if (!isInt(v("stock"))) {
      return "재고는 0 이상 정수입니다.";
    }

    // 포장 타입
    if (
      !["ROOM", "COLD", "FROZEN"].includes(
        v("storage_type")
      )
    ) {
      return "포장 타입을 선택해 주세요.";
    }

    // 원산지
    if (!v("origin")) {
      return "원산지를 입력해 주세요.";
    }

    // 상품 설명
    if (!v("description")) {
      return "상품 설명을 입력해 주세요.";
    }

    // =====================================
    // 대표 이미지
    // =====================================

    const thumbnail = $("thumbnail").files[0];

    // 신규 등록에서만 필수
    if (!thumbnail && !isEdit) {
      return "대표 이미지를 첨부해 주세요.";
    }

    if (thumbnail) {
      const error = checkFile(thumbnail);

      if (error) {
        return error;
      }
    }

    // =====================================
    // 상세 이미지
    // =====================================

    const details = $("detail_images").files;

    if (details.length > MAX_DETAIL) {
      return "상세 이미지는 최대 10장입니다.";
    }

    for (const file of details) {
      const error = checkFile(file);

      if (error) {
        return error;
      }
    }

    return null;
  }

  // =====================================
  // 7. 상품 등록·수정 API
  // =====================================

  form.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();
      clearError();

      // 중복 제출 방지
      if (
        submitting ||
        submitBtn.disabled
      ) {
        return;
      }

      // 입력값 검증
      const error = validate();

      if (error) {
        showError(error);
        return;
      }

      // multipart/form-data 생성
      const fd = new FormData(form);

      // 텍스트 공백 제거
      fd.set(
        "name",
        $("name").value.trim()
      );

      fd.set(
        "origin",
        $("origin").value.trim()
      );

      fd.set(
        "description",
        $("description").value.trim()
      );

      // 할인율
      if (
        $("discount_rate").value.trim() === ""
      ) {
        fd.delete("discount_rate");
      }

      // 새로 선택한 대표 이미지가 없으면 파일 파트 생략
      if (
        $("thumbnail").files.length === 0
      ) {
        fd.delete("thumbnail");
      }

      // 새로 선택한 상세 이미지가 없으면 파일 파트 생략
      if (
        $("detail_images").files.length === 0
      ) {
        fd.delete("detail_images");
      }

      submitting = true;
      submitBtn.disabled = true;

      try {

        let result;

        // =====================================
        // 기존 상품 수정
        // =====================================

        if (isEdit) {

          result = await api.upload(
            "PUT",
            "/seller/products/" +
              encodeURIComponent(productId),
            fd
          );

        } else {

          // =====================================
          // 신규 상품 등록
          // =====================================

          result = await api.upload(
            "POST",
            "/seller/products",
            fd
          );

        }

        // API 성공 확인
        if (
          !result ||
          result.code !== "ok"
        ) {
          throw new Error(
            "상품 저장 API 응답 오류"
          );
        }

        // =====================================
        // 성공 처리
        // =====================================

        if (isEdit) {
          alert("상품이 수정되었습니다.");
        } else {
          alert(
            "상품이 등록되었습니다.\n" +
            "관리자 검증 후 판매가 시작됩니다."
          );
        }

        // 상품 관리 페이지로 이동
        location.href = "products.jsp";

      } catch (err) {

        if (
          err.message !== "UNAUTHORIZED"
        ) {
          console.error(
            "상품 저장 실패:",
            err
          );

          showError(
            isEdit
              ? "상품 수정에 실패했습니다."
              : "상품 등록에 실패했습니다."
          );
        }

      } finally {

        submitting = false;
        submitBtn.disabled =
          isEdit && !productLoaded;

      }
    }
  );

  // =====================================
  // 8. 수정 모드 초기화
  // =====================================

  if (isEdit) {

    $("pageTitle").textContent = "상품 수정";
    submitBtn.textContent = "수정";
    submitBtn.disabled = true;

    if (!/^[1-9][0-9]*$/.test(productId)) {

      showError("잘못된 상품 ID입니다.");

    } else {

      // 기존 상품 정보 조회
      loadProduct(productId);

    }

  } else {

    // 신규 등록 모드
    $("pageTitle").textContent = "상품 등록";
    submitBtn.textContent = "등록";

  }

})();