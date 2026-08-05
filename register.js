// ============================================
// CONFIG
// ============================================
const STORAGE_KEY = "studentRegistrations";

// ============================================
// 3D TILT EFFECT ON CARD
// ============================================
const card = document.querySelector(".glass-card");

function handleTilt(e) {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -4;
  const rotateY = ((x - centerX) / centerX) * 4;
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetTilt() {
  card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
}

if (window.matchMedia("(hover: hover)").matches) {
  card.addEventListener("mousemove", handleTilt);
  card.addEventListener("mouseleave", resetTilt);
}

// ============================================
// FORM VALIDATION + SUBMIT
// ============================================
const form = document.getElementById("regForm");
const submitBtn = document.getElementById("submitBtn");
const successScreen = document.getElementById("successScreen");
const successId = document.getElementById("successId");
const registerAnotherBtn = document.getElementById("registerAnother");

const validators = {
  fullName: (v) => v.trim().length >= 2,
  studentId: (v) => v.trim().length >= 3,
  dob: (v) => !!v,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v) => /^[0-9+\-\s]{7,15}$/.test(v),
  department: (v) => !!v,
  year: (v) => !!v,
};

function validateField(field) {
  const name = field.name;
  if (!validators[name]) return true;
  const valid = validators[name](field.value);
  const wrapper = field.closest(".field");
  wrapper.classList.toggle("invalid", !valid);
  return valid;
}

form.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.closest(".field").classList.contains("invalid")) {
      validateField(field);
    }
  });
});

function getExisting() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRegistration(entry) {
  const list = getExisting();
  list.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function isDuplicateId(studentId) {
  return getExisting().some(
    (r) => r.studentId.toLowerCase() === studentId.toLowerCase()
  );
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fields = Array.from(form.querySelectorAll("input, select"));
  let allValid = true;
  fields.forEach((field) => {
    if (!validateField(field)) allValid = false;
  });

  if (!allValid) {
    form.querySelector(".field.invalid input, .field.invalid select")?.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());

  if (isDuplicateId(data.studentId)) {
    const idField = document.getElementById("studentId");
    idField.closest(".field").classList.add("invalid");
    idField.nextElementSibling.textContent = "This Student ID is already registered.";
    idField.focus();
    return;
  }

  const entry = {
    ...data,
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    submittedAt: new Date().toISOString(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  setTimeout(() => {
    saveRegistration(entry);
    form.classList.add("hide");
    successScreen.classList.add("show");
    successId.textContent = `ID: ${entry.studentId}`;
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit registration";
  }, 450);
});

registerAnotherBtn.addEventListener("click", () => {
  form.reset();
  form.querySelectorAll(".field.invalid").forEach((f) => f.classList.remove("invalid"));
  form.classList.remove("hide");
  successScreen.classList.remove("show");
});
