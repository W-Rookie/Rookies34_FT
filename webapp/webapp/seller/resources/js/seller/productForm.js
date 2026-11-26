/**
 * productForm.js — 상품 등록·수정 (S-02)
 *  등록: POST /api/seller/products               (multipart)
 *  수정: PUT  /api/seller/products/{productId}   (multipart)
 *  필드: name, category_id, price, discount_rate, stock, storage_type,
 *        origin, description, thumbnail(파일), detail_images(파일 여러 개)
 *  응답: { code: "ok" | "no" }
 *
 *  productForm.jsp       → 등록 모드
 *  productForm.jsp?id=9001→ 수정 모드
 *    ※ 판매자용 상품 조회 API가 없어서, 공개 상품 상세(GET /api/products/{id})로 기존 값 채움
 *      (승인 전 상품은 안 나올 수 있음 → 그때는 빈 폼으로 수정)
 */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const form = $("productForm");
  const submitBtn = $("submitBtn");
  const msg = $("formMsg");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXT = ["jpg", "jpeg", "png"];
  const MAX_DETAIL = 10;

  const params = new URLSearchParams(location.search);
  const productId = params.get("id");
  const isEdit = !!productId;
  const isMockEdit = isEdit && params.get("mock") === "1";

  // ---------- 수정 모드 준비 ----------
  if (isEdit) {
    $("pageTitle").textContent = isMockEdit ? "샘플 상품 수정" : "상품 수정";
    submitBtn.textContent = isMockEdit ? "샘플 수정 저장" : "수정";
    if (isMockEdit) {
      $("modeNotice").textContent = "[샘플 데이터] 변경 내용은 이 브라우저에만 저장되며 서버(S-02)에는 전송되지 않습니다. 이미지 파일은 샘플 수정에서 지원하지 않습니다.";
      $("modeNotice").classList.add("demo-notice");
      $("thumbnail").disabled = true;
      $("detail_images").disabled = true;
    }
    loadProduct(productId);
  }

  async function loadProduct(id) {
    try {
      const p = isMockEdit ? sellerMock.getProduct(id) : await api.get("/products/" + encodeURIComponent(id));
      if (!p) throw new Error("샘플 상품이 존재하지 않습니다.");
      $("name").value = p.name || "";
      $("category_id").value = p.category_id || "";
      $("price").value = p.price || "";
      $("discount_rate").value = (p.discount_rate !== undefined && p.discount_rate !== null) ? p.discount_rate : "";
      $("stock").value = (p.stock !== undefined && p.stock !== null) ? p.stock : "";
      $("storage_type").value = p.storage_type || "";
      $("origin").value = p.origin || "";
      $("description").value = p.description || ""; // textarea.value → HTML이 있어도 실행 안 됨

      if (p.thumbnail) {
        const img = document.createElement("img");
        img.src = p.thumbnail;
        img.alt = "현재 대표 이미지";
        img.width = 120;
        $("currentThumb").appendChild(img);
      }
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      $("modeNotice").textContent = isMockEdit
        ? "샘플 상품을 찾지 못했습니다. 상품 목록에서 다시 선택해 주세요."
        : "기존 상품 정보를 불러오지 못했습니다. (승인 전 상품일 수 있음) 값을 직접 입력해 수정해 주세요.";
      if (isMockEdit) submitBtn.disabled = true;
    }
  }

  // ---------- 파일 검사 ----------
  function checkFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ALLOWED_EXT.indexOf(ext) === -1) return file.name + ": jpg, png 파일만 가능합니다.";
    if (file.size > MAX_FILE_SIZE) return file.name + ": 5MB 이하만 가능합니다.";
    return null;
  }

  // ---------- 입력값 검사 (규격서 제약 기준) ----------
  function validate() {
    const v = function (id) { return $(id).value.trim(); };
    const isInt = function (s) { return /^[0-9]+$/.test(s); };

    if (!v("name") || v("name").length > 100) return "상품명은 1~100자입니다.";
    if (!isInt(v("category_id"))) return "카테고리 ID를 숫자로 입력해 주세요.";
    if (!isInt(v("price")) || Number(v("price")) < 100) return "판매가는 100원 이상 정수입니다.";
    if (v("discount_rate") !== "") {
      if (!isInt(v("discount_rate")) || Number(v("discount_rate")) > 90) return "할인율은 0~90입니다.";
    }
    if (!isInt(v("stock"))) return "재고는 0 이상 정수입니다.";
    if (!v("storage_type")) return "포장타입을 선택해 주세요.";
    if (!v("origin")) return "원산지를 입력해 주세요.";
    if (!v("description")) return "상품 설명을 입력해 주세요.";

    const thumb = $("thumbnail").files[0];
    // 기존 상품 수정(S-02)은 대표 이미지를 유지할 수 있으므로 새 첨부는 선택 사항.
    if (!thumb && !isEdit) return "대표 이미지를 첨부해 주세요.";
    if (thumb) {
      const thumbErr = checkFile(thumb);
      if (thumbErr) return thumbErr;
    }

    const details = $("detail_images").files;
    if (details.length > MAX_DETAIL) return "상세 이미지는 최대 10장입니다.";
    for (let i = 0; i < details.length; i++) {
      const e = checkFile(details[i]);
      if (e) return e;
    }
    return null;
  }

  // ---------- 전송 ----------
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    msg.textContent = "";

    const error = validate();
    if (error) {
      msg.textContent = error;
      return;
    }

    const fd = new FormData(form);
    // 비어 있는 선택 항목은 빼고 보냄
    if ($("discount_rate").value.trim() === "") fd.delete("discount_rate");
    if ($("detail_images").files.length === 0) fd.delete("detail_images"); // 빈 파일 항목 제거
    if (!$('thumbnail').files.length) fd.delete('thumbnail'); // 수정 시 기존 이미지 유지

    submitBtn.disabled = true;
    try {
      if (isMockEdit) {
        sellerMock.updateProduct(productId, {
          name: $("name").value.trim(),
          category_id: Number($("category_id").value),
          price: Number($("price").value),
          discount_rate: $("discount_rate").value.trim() === "" ? 0 : Number($("discount_rate").value),
          stock: Number($("stock").value),
          storage_type: $("storage_type").value,
          origin: $("origin").value.trim(),
          description: $("description").value.trim()
        });
        alert("샘플 상품이 브라우저에 저장되었습니다. 서버에는 전송되지 않았습니다.");
        location.href = "products.jsp";
      } else if (isEdit) {
        await api.upload("PUT", "/seller/products/" + encodeURIComponent(productId), fd);
        alert("상품이 수정되었습니다. (샘플 상품 목록에는 반영되지 않을 수 있습니다.)");
      } else {
        await api.upload("POST", "/seller/products", fd);
        alert("상품이 등록되었습니다.\n관리자 검증 후 판매가 시작됩니다.\n현재 샘플 상품 목록에는 서버 등록 상품이 표시되지 않습니다.");
        form.reset();
      }
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") {
        msg.textContent = isEdit ? "상품 수정에 실패했습니다." : "상품 등록에 실패했습니다.";
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
})();