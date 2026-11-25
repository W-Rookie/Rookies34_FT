/**
 * withdraw.js — 출금 신청·내역
 *  S-08 POST /api/seller/withdrawals   { amount }   (1원 이상, 출금 가능액 이하 → 서버 검증)
 *  S-09 GET  /api/seller/withdrawals?page
 *       응답 { code, num, withdrawals:[{withdrawal_id, amount, status, created_at}] }
 *  ※ 실계좌 연동 없이 상태 기록만. 승인은 관리자(A-10)
 */
(function () {
  const PAGE_SIZE = 20;
  const STATUS_LABEL = { REQUESTED: "신청", APPROVED: "승인", REJECTED: "반려" };

  const $ = function (id) { return document.getElementById(id); };
  let currentPage = 1;
  let submitting = false; // 처리 중 중복 신청 방지 (화면용)

  function td(text) {
    const cell = document.createElement("td");
    cell.textContent = (text === null || text === undefined) ? "-" : text;
    return cell;
  }

  // ---------- S-09 출금 내역 ----------
  async function loadWithdrawals(page) {
    currentPage = page || 1;
    const tbody = $("withdrawTbody");
    tbody.innerHTML = '<tr><td colspan="4">조회 중...</td></tr>';

    try {
      const data = await api.get("/seller/withdrawals", { page: currentPage });
      const list = data.withdrawals || [];
      $("totalCount").textContent = data.num || 0;
      tbody.innerHTML = "";

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">출금 내역이 없습니다.</td></tr>';
      }

      list.forEach(function (w) {
        const tr = document.createElement("tr");
        tr.appendChild(td(w.withdrawal_id));
        tr.appendChild(td(w.created_at));
        tr.appendChild(td(Number(w.amount).toLocaleString() + "원"));
        tr.appendChild(td(STATUS_LABEL[w.status] || w.status));
        tbody.appendChild(tr);
      });

      renderPager(data.num || 0);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") return;
      tbody.innerHTML = '<tr><td colspan="4">출금 내역을 불러오지 못했습니다.</td></tr>';
    }
  }

  function renderPager(total) {
    const pager = $("pager");
    pager.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    for (let p = 1; p <= totalPages; p++) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = p;
      b.disabled = (p === currentPage);
      b.addEventListener("click", function () { loadWithdrawals(p); });
      pager.appendChild(b);
    }
  }

  // ---------- S-08 출금 신청 ----------
  $("withdrawForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (submitting) return;

    const raw = $("amount").value.trim();
    if (!/^[0-9]+$/.test(raw) || Number(raw) < 1) {
      return alert("출금 금액은 1원 이상 정수로 입력해 주세요.");
    }
    const amount = Number(raw);

    if (!confirm(amount.toLocaleString() + "원을 출금 신청하시겠습니까?")) return;

    submitting = true;
    $("withdrawBtn").disabled = true;
    try {
      await api.post("/seller/withdrawals", { amount: amount });
      alert("출금 신청이 완료되었습니다.\n관리자 승인 후 처리됩니다.");
      $("amount").value = "";
      loadWithdrawals(1); // 방금 신청한 건이 보이도록 1페이지로
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") {
        alert("출금 신청에 실패했습니다. (출금 가능액 초과 또는 계좌 미등록일 수 있습니다)");
      }
    } finally {
      submitting = false;
      $("withdrawBtn").disabled = false;
    }
  });

  loadWithdrawals(1);
})();