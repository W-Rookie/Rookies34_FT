<%@ page pageEncoding="UTF-8" %>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 공통 CSS -->
<link rel="stylesheet" href="css/common.css?v=pager-design-2">

<!-- 고객센터 드롭다운 스타일 -->
<style>

/* =====================================
   고객센터 드롭다운 메뉴
===================================== */

/* 고객센터 메뉴 영역 */
.header-top .customer-service-menu {
  position: relative;
  display: inline-flex;
  align-items: center;
  z-index: 1000;
}

/* 고객센터 상단 링크 */
.header-top .customer-service-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}

/* 아래쪽 화살표 */
.customer-service-arrow {
  display: inline-block;
  font-size: 11px;
  color: #888;
  transition: transform 0.2s ease;
}

/* 마우스를 올리면 화살표 회전 */
.customer-service-menu:hover .customer-service-arrow,
.customer-service-menu:focus-within .customer-service-arrow {
  transform: rotate(180deg);
}

/* =====================================
   드롭다운 목록
===================================== */

.header-top .customer-service-dropdown {
  display: none;

  position: absolute;
  top: 100%;
  right: 0;

  width: 165px;
  min-width: 165px;

  margin: 0;
  padding: 8px 0;

  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;

  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);

  z-index: 1001;
}

/* 마우스 호버 또는 키보드 포커스 시 표시 */
.header-top .customer-service-menu:hover
.customer-service-dropdown,
.header-top .customer-service-menu:focus-within
.customer-service-dropdown {
  display: block;
}

/* =====================================
   드롭다운 개별 메뉴
===================================== */

.header-top .customer-service-dropdown a {
  display: block;

  width: 100%;
  padding: 11px 16px;
  margin: 0;

  color: #333;
  background: #fff;

  font-size: 13px;
  font-weight: normal;
  line-height: 1.4;
  text-align: left;
  text-decoration: none;
  white-space: nowrap;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

/* 메뉴에 마우스를 올렸을 때 */
.header-top .customer-service-dropdown a:hover,
.header-top .customer-service-dropdown a:focus-visible {
  background: #f7f3fa;
  color: #5f0080;
}

/* 키보드 접근성 */
.header-top .customer-service-dropdown a:focus-visible {
  outline: 2px solid #5f0080;
  outline-offset: -2px;
}

/* =====================================
   드롭다운이 다른 콘텐츠 위에 표시되도록
===================================== */

.header-top {
  position: relative;
  z-index: 1000;
}

/* =====================================
   모바일 대응
===================================== */

@media (max-width: 768px) {

  .header-top .customer-service-dropdown {
    width: 155px;
    min-width: 155px;
  }

  .header-top .customer-service-dropdown a {
    padding: 10px 12px;
    font-size: 12px;
  }

}

</style>