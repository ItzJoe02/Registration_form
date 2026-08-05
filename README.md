# Student Registration Portal

A frontend-only student registration form + admin dashboard. Built with plain HTML, CSS, and JavaScript — no frameworks, no backend required to run.

## Structure

```
student-registration/
├── index.html          → student registration form
├── admin.html           → password-gated admin dashboard
├── css/
│   ├── base.css          → design tokens, background, glass card, buttons (shared)
│   ├── register.css      → registration form styles
│   └── admin.css         → dashboard styles
├── js/
│   ├── register.js       → form validation, save to storage, 3D tilt, success animation
│   └── admin.js          → login gate, table render, inline edit, delete, export
└── README.md
```

## How it works

- Students fill out `index.html`. On submit, their data is validated and saved to the browser's `localStorage` under the key `studentRegistrations`.
- `admin.html` is protected by a simple password prompt. Once unlocked, it shows every saved registration in an editable table — click any cell (except Student ID) to edit it inline, or delete a row.
- Admin can export all data as JSON or CSV at any time (useful for backing it up or importing into a real database later).

## Running it

Just open `index.html` in a browser — no build step, no server needed. For the admin page to see the same data as the form, open both from the **same browser on the same device** (this is the localStorage limitation described below).

## Change the admin password

Open `js/admin.js` and edit this line near the top:

```js
const ADMIN_PASSWORD = "admin123";
```

## ⚠️ Important limitations (read before using with real students)

This is a **frontend-only prototype**, as requested. That means:

1. **Data is local to one browser.** `localStorage` only exists inside the browser it was written in. If a student submits the form on their own phone, you (the admin) will **not** see that entry unless you open the admin page in that exact same browser. Right now, this setup only really works for demos, testing, or a single shared kiosk/computer.
2. **The admin password is not secure.** It's stored in plain text inside `admin.js`, which anyone can view via "View Source." It stops casual snooping, not a determined person.
3. **No data backup.** Clearing browser data/cache wipes all registrations. Use the Export JSON/CSV buttons regularly if you're testing with real data.

**When you're ready to go live** with real students on different devices, the fix is a small backend (e.g. Node.js/Express + a database like MongoDB or PostgreSQL) that the form POSTs to, and the admin dashboard reads from. I can build that next whenever you want — it slots in without needing to redesign the frontend.

## Customizing fields

Registration fields live in `index.html` inside `<form id="regForm">`. To add/remove a field:
1. Add the `<div class="field">...</div>` block in `index.html`.
2. If it's required, add a validator for it in `js/register.js` under the `validators` object.
3. Add a matching `<th>` and `<td>` in `admin.html` / `js/admin.js` if you want it visible in the dashboard table.
