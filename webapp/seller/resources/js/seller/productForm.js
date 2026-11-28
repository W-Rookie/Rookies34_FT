/**
 * productForm.js - 판매자 상품 등록·수정 (S-02)
 *
 * 등록:
 * POST /api/seller/products
 *
 * 수정:
 * PUT /api/seller/products/{productId}
 *
 * 기존 상품 조회:
 * GET /api/products/{productId}
 *
 * 보조 조회:
 * GET /api/seller/products?page=1
 *
 * 기능:
 * 1. 신규 상품 등록
 * 2. 기존 상품 정보 자동 입력
 * 3. 상품명, 카테고리, 가격, 재고 등 기존 정보 표시
 * 4. 포장 타입, 원산지, 설명 자동 입력
 * 5. 대표 이미지 미리보기
 * 6. 이미지 미변경 시 기존 이미지 유지
 * 7. 실제 API 연동
 *
 * 더미데이터 사용하지 않음
 */

(function () {
  "use strict";

  // =====================================
  // 1. 기본 설정
  // =====================================

  const $ = function (id) {
    return document.getElementById(id);
  };

  const form = $("productForm");
  const submitBtn = $("submitBtn");
  const msg = $("formMsg");
  const modeNotice = $("modeNotice");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXT = ["jpg", "jpeg", "png"];
  const MAX_DETAIL = 10;

  const SELLER_PAGE_SIZE = 20;
  const MAX_SELLER_PAGES = 100;

  const params = new URLSearchParams(location.search);

  const productId = params.get("id");

  const isEdit =
    productId !== null &&
    productId !== "";

  // 수정 모드일 때는 기존 정보 조회 후 저장 허용
  let productLoaded = !isEdit;
  let submitting = false;

  // =====================================
  // 2. 메시지 출력
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

    // 입력칸과 API 필드명 연결
    const fields = [
      "name",
      "category_id",
      "price",
      "discount_rate",
      "stock",
      "storage_type",
      "origin",
      "description"
    ];

    fields.forEach(function (field) {

      const input = $(field);

      if (!input) {
        return;
      }

      // 0도 정상적인 값으로 처리
      if (
        product[field] !== undefined &&
        product[field] !== null
      ) {
        input.value = String(product[field]);
      }

    });

    // =====================================
    // 기존 대표 이미지 미리보기
    // =====================================

    const currentThumb = $("currentThumb");

    if (currentThumb) {

      currentThumb.replaceChildren();

      const thumbnail =
        product.thumbnail ||
        product.thumbnail_url;

      if (
        thumbnail &&
        typeof thumbnail === "string"
      ) {

        const image = document.createElement("img");

        image.src = thumbnail;
        image.alt = "현재 대표 이미지";
        image.width = 120;

        image.style.maxWidth = "120px";
        image.style.height = "auto";
        image.style.marginTop = "10px";

        currentThumb.appendChild(image);

      }
    }

    // =====================================
    // 기존 상세 이미지 표시
    // =====================================

    // JSP에 currentDetailImages 영역이 있을 때만 표시
    const currentDetails = $("currentDetailImages");

    if (currentDetails) {

      currentDetails.replaceChildren();

      if (Array.isArray(product.detail_images)) {

        product.detail_images.forEach(function (url) {

          if (
            !url ||
            typeof url !== "string"
          ) {
            return;
          }

          const image = document.createElement("img");

          image.src = url;
          image.alt = "기존 상세 이미지";
          image.width = 100;

          image.style.maxWidth = "100px";
          image.style.margin = "5px";

          currentDetails.appendChild(image);

        });

      }
    }
  }

  // =====================================
  // 4. 필수 정보 누락 확인
  // =====================================

  function getMissingFields() {

    const required = [
      ["name", "상품명"],
      ["category_id", "카테고리 ID"],
      ["price", "판매가"],
      ["stock", "재고"],
      ["storage_type", "포장 타입"],
      ["origin", "원산지"],
      ["description", "상품 설명"]
    ];

    return required
      .filter(function (item) {

        const input = $(item[0]);

        return (
          !input ||
          input.value.trim() === ""
        );

      })
      .map(function (item) {
        return item[1];
      });

  }

  // =====================================
  // 5. 일반 상품 상세 조회
  // =====================================

  async function fetchProductDetail(id) {

    const result = await api.get(
      "/products/" + encodeURIComponent(id)
    );

    if (
      !result ||
      result.code !== "ok"
    ) {
      throw new Error(
        "상품 상세 조회 API 응답 오류"
      );
    }

    // 백엔드 응답 구조 두 가지 모두 지원
    //
    // 형태 1:
    // { code: "ok", product: { ... } }
    //
    // 형태 2:
    // { code: "ok", product_id: ..., name: ... }

    const product = result.product || result;

    if (
      !product ||
      typeof product !== "object" ||
      !product.name
    ) {
      throw new Error(
        "상품 상세 정보가 없습니다."
      );
    }

    // 다른 상품 정보가 반환되는 경우 방지
    if (
      product.product_id !== undefined &&
      product.product_id !== null &&
      String(product.product_id) !== String(id)
    ) {
      throw new Error(
        "조회된 상품 ID가 일치하지 않습니다."
      );
    }

    return product;
  }

  // =====================================
  // 6. 판매자 상품 목록에서 해당 상품 찾기
  // =====================================

  async function fetchSellerProduct(id) {

    let previousFirstId = null;

    for (
      let page = 1;
      page <= MAX_SELLER_PAGES;
      page++
    ) {

      const result = await api.get(
        "/seller/products",
        {
          page: page
        }
      );

      if (
        !result ||
        result.code !== "ok" ||
        !Array.isArray(result.products)
      ) {
        throw new Error(
          "판매자 상품 목록 API 응답 오류"
        );
      }

      const products = result.products;

      // 현재 상품 ID 검색
      const found = products.find(function (product) {
        return (
          String(product.product_id) === String(id)
        );
      });

      if (found) {
        return found;
      }

      // 동일한 페이지가 반복 반환되는 경우 방지
      const firstId = products.length
        ? String(products[0].product_id)
        : null;

      if (
        firstId !== null &&
        firstId === previousFirstId
      ) {
        throw new Error(
          "판매자 상품 목록의 페이지 이동이 정상적으로 동작하지 않습니다."
        );
      }

      previousFirstId = firstId;

      // 마지막 페이지
      if (products.length < SELLER_PAGE_SIZE) {
        break;
      }
    }

    throw new Error(
      "판매자 상품 목록에서 해당 상품을 찾지 못했습니다."
    );
  }

  // =====================================
  // 7. 기존 상품 정보 불러오기
  // =====================================

  async function loadProduct(id) {

    productLoaded = false;
    submitBtn.disabled = true;

    clearError();

    showNotice(
      "기존 상품 정보를 불러오는 중입니다."
    );

    let detail = null;
    let summary = null;

    try {

      // =====================================
      // ① 일반 상품 상세 API 먼저 조회
      // =====================================

      try {

        detail = await fetchProductDetail(id);

      } catch (detailError) {

        if (
          detailError.message === "UNAUTHORIZED"
        ) {
          throw detailError;
        }

        console.warn(
          "상품 상세 조회 실패:",
          detailError
        );

      }

      // =====================================
      // ② 상세 조회 실패 또는 필드 누락 시
      //    판매자 목록 API로 보완
      // =====================================

      const detailFields = [
        "name",
        "category_id",
        "price",
        "discount_rate",
        "stock",
        "storage_type",
        "origin",
        "description"
      ];

      const needSummary =
        !detail ||
        detailFields.some(function (field) {
          return (
            detail[field] === undefined ||
            detail[field] === null
          );
        });

      if (needSummary) {

        try {

          summary = await fetchSellerProduct(id);

        } catch (summaryError) {

          if (
            summaryError.message === "UNAUTHORIZED"
          ) {
            throw summaryError;
          }

          console.warn(
            "판매자 상품 목록 조회 실패:",
            summaryError
          );

        }

      }

      // =====================================
      // ③ 두 API 모두 실패한 경우
      // =====================================

      if (!detail && !summary) {

        throw new Error(
          "기존 상품 정보를 조회할 수 없습니다."
        );

      }

      // =====================================
      // ④ 정보 병합
      // =====================================

      // 판매자 목록 정보를 먼저 넣고,
      // 상세 API 정보를 우선 적용
      const product = Object.assign(
        {},
        summary || {},
        detail || {}
      );

      // =====================================
      // ⑤ 입력칸에 기존 정보 자동 입력
      // =====================================

      populateFields(product);

      productLoaded = true;

      // =====================================
      // ⑥ 누락된 정보 확인
      // =====================================

      const missing = getMissingFields();

      if (missing.length > 0) {

        showNotice(
          "기존 상품의 일부 정보가 조회되지 않았습니다. " +
          "다음 항목을 확인하고 입력해 주세요: " +
          missing.join(", ") + "."
        );

      } else {

        showNotice(
          "기존 상품 정보를 불러왔습니다. " +
          "내용을 수정한 후 저장해 주세요. " +
          "이미지를 새로 첨부하지 않으면 기존 이미지가 유지됩니다."
        );

      }

      // 조회 성공 후 수정 버튼 활성화
      submitBtn.disabled = false;

    } catch (err) {

      productLoaded = false;

      submitBtn.disabled = true;

      if (
        err.message === "UNAUTHORIZED"
      ) {
        return;
      }

      console.error(
        "기존 상품 조회 오류:",
        err
      );

      showNotice(
        "상품 정보를 불러오지 못했습니다. " +
        "상품 목록에서 다시 선택해 주세요."
      );

      showError(
        err.message || "상품 조회 실패"
      );

    }
  }

  // =====================================
  // 8. 이미지 파일 검증
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
  // 9. 입력값 검증
  // =====================================

  function validate() {

    const v = function (id) {
      return $(id).value.trim();
    };

    const isInt = function (value) {
      return /^[0-9]+$/.test(value);
    };

    // 기존 정보 조회 여부
    if (isEdit && !productLoaded) {
      return (
        "기존 상품 정보를 불러오지 못해 수정할 수 없습니다."
      );
    }

    // =====================================
    // 상품명
    // =====================================

    if (
      !v("name") ||
      v("name").length > 100
    ) {
      return "상품명은 1~100자입니다.";
    }

    // =====================================
    // 카테고리
    // =====================================

    if (
      !isInt(v("category_id")) ||
      Number(v("category_id")) < 1
    ) {
      return (
        "카테고리 ID는 1 이상의 숫자로 입력해 주세요."
      );
    }

    // =====================================
    // 판매가
    // =====================================

    if (
      !isInt(v("price")) ||
      Number(v("price")) < 100
    ) {
      return "판매가는 100원 이상 정수입니다.";
    }

    // =====================================
    // 할인율
    // =====================================

    if (v("discount_rate") !== "") {

      if (
        !isInt(v("discount_rate")) ||
        Number(v("discount_rate")) > 90
      ) {
        return "할인율은 0~90입니다.";
      }

    }

    // =====================================
    // 재고
    // =====================================

    if (!isInt(v("stock"))) {
      return "재고는 0 이상 정수입니다.";
    }

    // =====================================
    // 포장 타입
    // =====================================

    if (
      !["ROOM", "COLD", "FROZEN"].includes(
        v("storage_type")
      )
    ) {
      return "포장 타입을 선택해 주세요.";
    }

    // =====================================
    // 원산지
    // =====================================

    if (!v("origin")) {
      return "원산지를 입력해 주세요.";
    }

    // =====================================
    // 상품 설명
    // =====================================

    if (!v("description")) {
      return "상품 설명을 입력해 주세요.";
    }

    // =====================================
    // 대표 이미지
    // =====================================

    const thumbnail = $("thumbnail").files[0];

    // 신규 등록 시 대표 이미지 필수
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

    for (let i = 0; i < details.length; i++) {

      const error = checkFile(details[i]);

      if (error) {
        return error;
      }

    }

    return null;
  }

  // =====================================
  // 10. 상품 등록·수정 API
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

      const error = validate();

      if (error) {

        showError(error);
        return;

      }

      // =====================================
      // multipart/form-data 생성
      // =====================================

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

      // 할인율이 비어 있으면 0으로 처리
      if (
        $("discount_rate").value.trim() === ""
      ) {
        fd.delete("discount_rate");
      }

      // 새로운 상세 이미지가 없으면
      // 기존 상세 이미지 유지
      if (
        $("detail_images").files.length === 0
      ) {
        fd.delete("detail_images");
      }

      // 새로운 대표 이미지가 없으면
      // 기존 대표 이미지 유지
      if (
        $("thumbnail").files.length === 0
      ) {
        fd.delete("thumbnail");
      }

      submitting = true;

      submitBtn.disabled = true;

      try {

        let result;

        // =====================================
        // 상품 수정 (PUT)
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
          // 상품 등록 (POST)
          // =====================================

          result = await api.upload(
            "POST",
            "/seller/products",
            fd
          );

        }

        // =====================================
        // API 성공 여부 확인
        // =====================================

        if (
          !result ||
          result.code !== "ok"
        ) {

          throw new Error(
            "상품 저장 API 응답 오류"
          );

        }

        // =====================================
        // 정상 처리
        // =====================================

        if (isEdit) {

          alert(
            "상품이 수정되었습니다."
          );

        } else {

          alert(
            "상품이 등록되었습니다.\n" +
            "관리자 검증 후 판매가 시작됩니다."
          );

        }

        // 상품 목록으로 이동
        location.href = "products.jsp";

      } catch (err) {

        if (
          err.message !== "UNAUTHORIZED"
        ) {

          console.error(
            "상품 저장 오류:",
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
  // 11. 수정 모드 초기화
  // =====================================

  if (isEdit) {

    $("pageTitle").textContent = "상품 수정";

    submitBtn.textContent = "수정";

    submitBtn.disabled = true;

    // 상품 ID 검증
    if (!/^[1-9][0-9]*$/.test(productId)) {

      showNotice(
        "잘못된 상품 ID입니다. " +
        "상품 목록에서 다시 선택해 주세요."
      );

    } else {

      showNotice(
        "기존 상품 정보를 불러오는 중입니다."
      );

      // 기존 상품 정보 조회
      loadProduct(productId);

    }

  } else {

    // 신규 상품 등록
    $("pageTitle").textContent = "상품 등록";

    submitBtn.textContent = "등록";

  }

})();