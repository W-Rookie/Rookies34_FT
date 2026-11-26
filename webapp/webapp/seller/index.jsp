<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%-- /seller/ 로 들어오면 주문 관리로 이동 (로그인 안 했으면 guard.js가 login.jsp로 보냄)
     폴더 주소로 접근 시 파일 목록(디렉터리 리스팅)이 보이는 것도 막아줌 --%>
<% response.sendRedirect("orders.jsp"); %>
