
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="include/header.jsp" %>

<h2>판매자 마이페이지</h2>

<p class="msg">
  등록된 판매자 정보를 확인하고 정산 계좌를 관리할 수 있습니다.
</p>

<%-- =====================================
     1. 판매자 기본 정보 조회
     GET /api/seller/profile
===================================== --%>

<section class="panel">

  <h3>판매자 기본 정보</h3>

  <table class="list">
    <tbody>

      <tr>
        <th scope="row">판매자 아이디</th>
        <td id="profileLoginId">-</td>
      </tr>

      <tr>
        <th scope="row">상호명</th>
        <td id="profileBusinessName">-</td>
      </tr>

      <tr>
        <th scope="row">담당자 이름</th>
        <td id="profileManagerName">-</td>
      </tr>

      <tr>
        <th scope="row">이메일</th>
        <td id="profileEmail">-</td>
      </tr>

      <tr>
        <th scope="row">연락처</th>
        <td id="profilePhone">-</td>
      </tr>

      <tr>
        <th scope="row">사업자등록번호</th>
        <td id="profileBusinessRegNo">-</td>
      </tr>

      <tr>
        <th scope="row">입점 상태</th>
        <td id="profileStatus">-</td>
      </tr>

    </tbody>
  </table>

</section>


<%-- =====================================
     2. 정산 계좌 정보 조회
     GET /api/seller/profile
===================================== --%>

<section class="panel">

  <h3>등록된 정산 계좌</h3>

  <table class="list">
    <tbody>

      <tr>
        <th scope="row">은행</th>
        <td id="profileBank">-</td>
      </tr>

      <tr>
        <th scope="row">계좌번호</th>
        <td id="profileAccountNo">-</td>
      </tr>

      <tr>
        <th scope="row">예금주</th>
        <td id="profileAccountHolder">-</td>
      </tr>

    </tbody>
  </table>

  <small>
    등록된 정산 계좌 정보입니다.
    계좌 정보를 변경하려면 아래 정보 수정 영역을 이용해 주세요.
  </small>

</section>


<%-- =====================================
     3. 사업자등록증 확인 및 다운로드
     GET /api/seller/cert-file
===================================== --%>

<section class="panel">

  <h3>사업자등록증</h3>

  <p>
    입점 신청 시 제출한 사업자등록증을 확인하고
    다시 다운로드할 수 있습니다.
  </p>

  <table class="list">
    <tbody>

      <tr>
        <th scope="row">등록 파일</th>
        <td id="certFileName">-</td>
      </tr>

      <tr>
        <th scope="row">파일 관리</th>
        <td>
          <button
            type="button"
            id="certDownloadBtn"
            class="subtle-btn"
            disabled>
            사업자등록증 다운로드
          </button>
        </td>
      </tr>

    </tbody>
  </table>

  <p id="certMsg" class="msg" role="status"></p>

</section>


<%-- 판매자 정보 조회 상태 메시지 --%>
<p id="profileMsg" class="msg" role="status"></p>


<%-- =====================================
     4. 판매자 정보 및 정산 계좌 수정
     PUT /api/seller/profile

     기존 settings.js 기능 유지
===================================== --%>

<section class="panel">

  <h3>판매자 정보 수정</h3>

  <p class="msg">
    수정할 정보를 입력한 후 저장해 주세요.
  </p>

  <form id="settingsForm">

    <h3>판매자 정보</h3>

    <!-- 상호명 -->
    <div>
      <label for="business_name">상호명 *</label>

      <input
        type="text"
        id="business_name"
        maxlength="50"
        required>
    </div>

    <!-- 연락처 -->
    <div>
      <label for="phone">연락처 *</label>

      <input
        type="text"
        id="phone"
        placeholder="숫자만 입력"
        required>
    </div>

    <h3>정산 계좌 수정</h3>

    <!-- 은행 -->
    <div>
      <label for="bank">은행 *</label>

      <select id="bank" required>
        <option value="">은행 선택</option>
        <option value="KB국민은행">KB국민은행</option>
        <option value="신한은행">신한은행</option>
        <option value="우리은행">우리은행</option>
        <option value="하나은행">하나은행</option>
        <option value="NH농협은행">NH농협은행</option>
        <option value="IBK기업은행">IBK기업은행</option>
        <option value="카카오뱅크">카카오뱅크</option>
        <option value="토스뱅크">토스뱅크</option>
        <option value="케이뱅크">케이뱅크</option>
        <option value="우체국">우체국</option>
        <option value="테스트은행">테스트은행</option>
      </select>
    </div>

    <!-- 계좌번호 -->
    <div>
      <label for="account_no">계좌번호 *</label>

      <input
        type="text"
        id="account_no"
        placeholder="숫자만 입력 (테스트 계좌만)"
        required>
    </div>

    <!-- 예금주 -->
    <div>
      <label for="account_holder">예금주 *</label>

      <input
        type="text"
        id="account_holder"
        required>
    </div>

    <!-- 저장 버튼 -->
    <button type="submit" id="saveBtn">
      저장
    </button>

  </form>

  <!-- 정보 수정 결과 -->
  <p id="settingsMsg" class="msg" role="status"></p>

</section>


<%-- =====================================
     5. 마이페이지 API 연동
===================================== --%>

<script src="resources/js/seller/settings.js?v=mypage-2"></script>

<%@ include file="include/footer.jsp" %>
