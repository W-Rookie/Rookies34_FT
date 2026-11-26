<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2 id="pageTitle">상품 등록</h2>
<p id="modeNotice" class="msg"></p>

<form id="productForm">
  <div>
    <label for="name">상품명 *</label>
    <input type="text" id="name" name="name" maxlength="100" required>
  </div>
  <div>
    <label for="category_id">카테고리 ID *</label>
    <input type="number" id="category_id" name="category_id" min="1" required>
    <small>카테고리 목록 API가 없어 ID 직접 입력 (예: 907)</small>
  </div>
  <div>
    <label for="price">판매가(원) *</label>
    <input type="number" id="price" name="price" min="100" required>
  </div>
  <div>
    <label for="discount_rate">할인율(%)</label>
    <input type="number" id="discount_rate" name="discount_rate" min="0" max="90">
  </div>
  <div>
    <label for="stock">재고 *</label>
    <input type="number" id="stock" name="stock" min="0" required>
  </div>
  <div>
    <label for="storage_type">포장타입 *</label>
    <select id="storage_type" name="storage_type" required>
      <option value="">선택</option>
      <option value="ROOM">상온</option>
      <option value="COLD">냉장</option>
      <option value="FROZEN">냉동</option>
    </select>
  </div>
  <div>
    <label for="origin">원산지 *</label>
    <input type="text" id="origin" name="origin" required>
  </div>
  <div>
    <label for="description">상품 설명 *</label>
    <textarea id="description" name="description" rows="8" required></textarea>
  </div>
  <div>
    <label for="thumbnail">대표 이미지 *</label>
    <input type="file" id="thumbnail" name="thumbnail" accept=".jpg,.jpeg,.png">
    <small>jpg / png, 최대 5MB</small>
    <div id="currentThumb"></div>
  </div>
  <div>
    <label for="detail_images">상세 이미지</label>
    <input type="file" id="detail_images" name="detail_images" accept=".jpg,.jpeg,.png" multiple>
    <small>최대 10장</small>
  </div>

  <button type="submit" id="submitBtn">등록</button>
</form>

<p id="formMsg" class="msg"></p>

<script src="resources/js/seller/mock-data.js?v=20261125-R5"></script>
<script src="resources/js/seller/productForm.js?v=20261125-R5"></script>
<%@ include file="include/footer.jsp" %>
