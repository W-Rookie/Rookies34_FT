
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>상품 관리</h2>

<!-- 실제 상품 등록 페이지 -->
<p>
  <a href="productForm.jsp" class="btn">+ 새 상품 등록</a>
</p>

<%-- S-11 내 상품 목록 조회: GET /api/seller/products?status=&page= --%>

<!-- =====================================
     1. 상품 상태별 필터
===================================== -->
<form id="productFilterForm" class="filter">

  <label for="productStatus">상품 상태</label>

  <select id="productStatus" name="status">
    <option value="">전체</option>
    <option value="PENDING">검증 대기</option>
    <option value="APPROVED">승인됨</option>
    <option value="REJECTED">반려됨</option>
    <option value="HIDDEN">숨김</option>
  </select>

  <button type="submit">조회</button>

</form>

<!-- =====================================
     2. 상품 조회 결과
===================================== -->
<div class="list-meta">
  <p>
    현재 페이지
    <strong id="productTotalCount">0</strong>건
    <small>상태별 필터 · 페이지 이동 지원</small>
  </p>
</div>

<!-- =====================================
     3. 상품 목록 테이블
===================================== -->
<div class="table-scroll">

  <table class="list" id="productTable">

    <thead>
      <tr>
        <th>상품 ID</th>
        <th>상품명</th>
        <th>판매가</th>
        <th>재고</th>
        <th>상태</th>
        <th>관리</th>
      </tr>
    </thead>

    <tbody id="productTbody">
      <tr>
        <td colspan="6">조회 중...</td>
      </tr>
    </tbody>

  </table>

</div>

<!-- =====================================
     4. 페이지 이동
===================================== -->
<div
  id="productPager"
  class="pager"
  aria-label="상품 목록 페이지">
</div>

<!-- =====================================
     5. 실제 상품 목록 API 연동
===================================== -->
<script src="resources/js/seller/products.js?v=pager-design-1"></script>

<%@ include file="include/footer.jsp" %>
