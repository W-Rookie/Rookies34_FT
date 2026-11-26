<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>상품 상세 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <main class="container">
    <section class="detail" id="product"></section>
    <nav class="detail-tabs"><a href="#tab-desc">상품설명</a><a href="#tab-review">후기 (<span id="review-count">0</span>)</a><a href="#tab-inquiry">문의 (<span id="inquiry-count">0</span>)</a></nav>
    <section id="tab-desc" class="detail-section">
      <h3 class="sub-title">상품 설명</h3>
      <div class="pre-wrap" id="description"></div>
      <div id="detail-images"></div>
    </section>
    <section id="tab-review" class="detail-section">
      <h3 class="sub-title">상품 후기</h3>
      <ul id="review-list"></ul>
      <div class="pagination" id="review-pagination"></div>
    </section>
    <section id="tab-inquiry" class="detail-section">
      <h3 class="sub-title">상품 문의</h3>
      <form id="inquiry-form" class="form">
        <input name="title" maxlength="50" placeholder="제목 (50자 이내)" required>
        <textarea name="content" maxlength="1000" rows="4" placeholder="문의 내용 (1000자 이내)" required></textarea>
        <label class="check"><input type="checkbox" name="is_secret"> 비밀글로 문의하기</label>
        <button class="btn btn-primary" type="submit">문의 등록</button>
      </form>
      <ul id="inquiry-list"></ul>
      <div class="pagination" id="inquiry-pagination"></div>
    </section></main>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/product.js"></script>
</body>
</html>
