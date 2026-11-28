<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2 id="pageTitle">상품 등록</h2>

<!-- 상품 수정 시 기존 상품 조회 결과 및 안내 메시지 -->
<p id="modeNotice" class="msg"></p>

<!-- 실제 상품 등록·수정 API 연동 -->
<form id="productForm" method="post" enctype="multipart/form-data">

  <!-- 1. 상품명 -->
  <div>
    <label for="name">상품명 *</label>
    <input
      type="text"
      id="name"
      name="name"
      maxlength="100"
      required>
  </div>

  <!-- 2. 카테고리 ID -->
  <div>
    <label for="category_id">카테고리 ID *</label>
    <input
      type="number"
      id="category_id"
      name="category_id"
      min="1"
      required>
  </div>

  <!-- 3. 판매가 -->
  <div>
    <label for="price">판매가(원) *</label>
    <input
      type="number"
      id="price"
      name="price"
      min="100"
      required>
  </div>

  <!-- 4. 할인율 -->
  <div>
    <label for="discount_rate">할인율(%)</label>
    <input
      type="number"
      id="discount_rate"
      name="discount_rate"
      min="0"
      max="90">
  </div>

  <!-- 5. 재고 -->
  <div>
    <label for="stock">재고 *</label>
    <input
      type="number"
      id="stock"
      name="stock"
      min="0"
      required>
  </div>

  <!-- 6. 포장타입 -->
  <div>
    <label for="storage_type">포장타입 *</label>
    <select id="storage_type" name="storage_type" required>
      <option value="">선택</option>
      <option value="ROOM">상온</option>
      <option value="COLD">냉장</option>
      <option value="FROZEN">냉동</option>
    </select>
  </div>

  <!-- 7. 원산지 -->
  <div>
    <label for="origin">원산지 *</label>
    <input
      type="text"
      id="origin"
      name="origin"
      required>
  </div>

  <!-- 8. 상품 설명 -->
  <div>
    <label for="description">상품 설명 *</label>
    <textarea
      id="description"
      name="description"
      rows="8"
      required></textarea>
  </div>

  <!-- 9. 대표 이미지 -->
  <div>
    <label for="thumbnail">대표 이미지 *</label>
    <input
      type="file"
      id="thumbnail"
      name="thumbnail"
      accept=".jpg,.jpeg,.png">

    <small>jpg / jpeg / png, 최대 5MB</small>

    <!-- 상품 수정 시 기존 대표 이미지 미리보기 -->
    <div id="currentThumb"></div>
  </div>

  <!-- 10. 상세 이미지 -->
  <div>
    <label for="detail_images">상세 이미지</label>
    <input
      type="file"
      id="detail_images"
      name="detail_images"
      accept=".jpg,.jpeg,.png"
      multiple>

    <small>최대 10장, 파일당 5MB 이하</small>

    <!-- 상품 수정 시 기존 상세 이미지 미리보기 -->
    <div id="currentDetailImages"></div>
  </div>

  <!-- 11. 등록·수정 버튼 -->
  <button type="submit" id="submitBtn">등록</button>

</form>

<!-- 등록·수정 오류 안내 -->
<p id="formMsg" class="msg"></p>

<!-- 실제 API 연동 -->
<script src="resources/js/seller/productForm.js?v=20261128-1"></script>

<%@ include file="include/footer.jsp" %>