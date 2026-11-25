<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
  <title>후기 | 신선마켓</title>
  <%@ include file="WEB-INF/jsp/common/head.jsp" %>
</head>
<body>
  <%@ include file="WEB-INF/jsp/common/header.jsp" %>
  <div class="mypage container"><aside id="mypage-nav" class="mypage-nav"></aside><section class="mypage-content">
    <h2 class="page-title">후기</h2>
    <div class="tabs" id="review-tabs"></div>
    <ul id="review-list"></ul>
    <form id="review-form" class="form box" hidden>
      <h3>후기 작성: <span id="review-target"></span></h3>
      <input type="hidden" name="order_item_id">
      <div class="radio-group star-input">별점
        <label><input type="radio" name="rating" value="5"> ★5</label>
        <label><input type="radio" name="rating" value="4"> ★4</label>
        <label><input type="radio" name="rating" value="3"> ★3</label>
        <label><input type="radio" name="rating" value="2"> ★2</label>
        <label><input type="radio" name="rating" value="1"> ★1</label>
      </div>
      <textarea name="content" rows="6" maxlength="1000" placeholder="10자 이상 작성해 주세요"></textarea>
      <label id="image-row">사진 (jpg, png / 최대 5장)<input type="file" name="images" accept=".jpg,.jpeg,.png" multiple></label>
      <div class="btn-row"><button type="button" class="btn" id="cancel-btn">취소</button>
        <button class="btn btn-primary" type="submit">저장</button></div>
    </form></section></div>
  <%@ include file="WEB-INF/jsp/common/footer.jsp" %>

  <%@ include file="WEB-INF/jsp/common/scripts.jsp" %>
  <script src="js/pages/mypage-reviews.js"></script>
</body>
</html>
