// ============================================
// CONFIG — change the admin password here
// ============================================
const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "studentRegistrations";
const SESSION_FLAG = "adminSession";

// ============================================
// LOGIN GATE
// ============================================
const loginGate = document.getElementById("loginGate");
const dashboard = document.getElementById("dashboard");
const passwordInput = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

function unlock() {
  loginGate.style.display = "none";
  dashboard.classList.add("show");
  renderAll();
}

function tryLogin() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_FLAG, "1");
    loginError.textContent = "";
    unlock();
  } else {
    loginError.textContent = "Incorrect password. Try again.";
    passwordInput.value = "";
    passwordInput.focus();
  }
}

loginBtn.addEventListener("click", tryLogin);
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryLogin();
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_FLAG);
  location.reload();
});

if (sessionStorage.getItem(SESSION_FLAG) === "1") {
  unlock();
}

// ============================================
// DATA HELPERS
// ============================================
function getData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function setData(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function updateEntry(id, field, value) {
  const list = getData();
  const idx = list.findIndex((r) => r.id === id);
  if (idx !== -1) {
    list[idx][field] = value;
    setData(list);
    showToast("Saved", "success");
  }
}

function deleteEntry(id) {
  const list = getData().filter((r) => r.id !== id);
  setData(list);
  renderAll();
  showToast("Registration deleted", "success");
}

// ============================================
// TOAST
// ============================================
let toastTimer;
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

// ============================================
// RENDER
// ============================================
const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const deptFilter = document.getElementById("deptFilter");

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function populateDeptFilter(list) {
  const depts = [...new Set(list.map((r) => r.department).filter(Boolean))].sort();
  const current = deptFilter.value;
  deptFilter.innerHTML = `<option value="">All departments</option>` +
    depts.map((d) => `<option value="${d}">${d}</option>`).join("");
  deptFilter.value = current;
}

function renderStats(list) {
  document.getElementById("statTotal").textContent = list.length;
  const today = new Date().toDateString();
  const todayCount = list.filter((r) => new Date(r.submittedAt).toDateString() === today).length;
  document.getElementById("statToday").textContent = todayCount;
  const deptCount = new Set(list.map((r) => r.department).filter(Boolean)).size;
  document.getElementById("statDepts").textContent = deptCount;
}

function renderTable() {
  const list = getData();
  const query = searchInput.value.trim().toLowerCase();
  const dept = deptFilter.value;

  const filtered = list.filter((r) => {
    const matchesQuery =
      !query ||
      r.fullName?.toLowerCase().includes(query) ||
      r.studentId?.toLowerCase().includes(query) ||
      r.email?.toLowerCase().includes(query);
    const matchesDept = !dept || r.department === dept;
    return matchesQuery && matchesDept;
  });

  tableBody.innerHTML = "";
  emptyState.style.display = filtered.length ? "none" : "block";

  filtered
    .slice()
    .reverse()
    .forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono">${escapeHtml(r.studentId)}</td>
        <td contenteditable="true" data-field="fullName">${escapeHtml(r.fullName)}</td>
        <td contenteditable="true" data-field="email">${escapeHtml(r.email)}</td>
        <td contenteditable="true" data-field="phone">${escapeHtml(r.phone)}</td>
        <td contenteditable="true" data-field="department">${escapeHtml(r.department)}</td>
        <td contenteditable="true" data-field="year">${escapeHtml(r.year)}</td>
        <td>${escapeHtml(r.dob || "—")}</td>
        <td>${fmtDate(r.submittedAt)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn danger" data-action="delete" data-id="${r.id}">Delete</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);

      tr.querySelectorAll("[contenteditable]").forEach((cell) => {
        cell.addEventListener("blur", () => {
          updateEntry(r.id, cell.dataset.field, cell.textContent.trim());
        });
        cell.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            cell.blur();
          }
        });
      });
    });

  tableBody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Delete this registration? This cannot be undone.")) {
        deleteEntry(btn.dataset.id);
      }
    });
  });
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderAll() {
  const list = getData();
  populateDeptFilter(list);
  renderStats(list);
  renderTable();
}

searchInput.addEventListener("input", renderTable);
deptFilter.addEventListener("change", renderTable);

// ============================================
// EXPORT
// ============================================
document.getElementById("exportJsonBtn").addEventListener("click", () => {
  const data = getData();
  downloadFile(JSON.stringify(data, null, 2), "student-registrations.json", "application/json");
});

document.getElementById("exportCsvBtn").addEventListener("click", () => {
  const data = getData();
  if (!data.length) return showToast("Nothing to export", "error");
  const headers = ["studentId", "fullName", "email", "phone", "department", "year", "dob", "address", "submittedAt"];
  const rows = data.map((r) =>
    headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  downloadFile(csv, "student-registrations.csv", "text/csv");
});

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
