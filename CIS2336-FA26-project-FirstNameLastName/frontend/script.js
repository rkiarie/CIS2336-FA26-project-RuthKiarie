/* =========================================================
   UH Sugar Land Student Center - client-side script
   Shared by every page. Each feature only runs if the
   elements it needs exist on the current page.
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   1. Site data
   --------------------------------------------------------- */

// Navigation menu items. The menu is built from this array,
// so adding a page only means adding one line here.
const NAV_ITEMS = [
  { label: "Home", href: "index.html" },
  { label: "FAQ", href: "FAQ.html" },
  { label: "Room Booking", href: "roombooking.html" },
  { label: "References", href: "reference.html" }
];

// The 5 bookable rooms. The backend keeps its own copy of this
// list and makes the final availability decision.
const ROOMS = [
  {
    id: "study-a",
    name: "Study Room A",
    capacity: 4,
    features: ["Whiteboard", "TV screen with HDMI"],
    image: "https://picsum.photos/seed/uhsl-study-a/600/400"
  },
  {
    id: "study-b",
    name: "Study Room B",
    capacity: 6,
    features: ["Whiteboard", "Large table", "Power outlets"],
    image: "https://picsum.photos/seed/uhsl-study-b/600/400"
  },
  {
    id: "collab-lab",
    name: "Collaboration Lab",
    capacity: 10,
    features: ["Two displays", "Movable furniture"],
    image: "https://picsum.photos/seed/uhsl-collab/600/400"
  },
  {
    id: "media-studio",
    name: "Media Studio",
    capacity: 3,
    features: ["Podcast mics", "Green screen", "Soundproofing"],
    image: "https://picsum.photos/seed/uhsl-media/600/400"
  },
  {
    id: "conference",
    name: "Conference Room",
    capacity: 16,
    features: ["Projector", "Video conferencing", "Conference table"],
    image: "https://picsum.photos/seed/uhsl-conference/600/400"
  }
];

// Booking rules shared by the form validation.
const BOOKING_RULES = {
  openHour: 8,        // 8:00 AM
  closeHour: 21,      // 9:00 PM
  maxHours: 3,        // longest single booking
  maxDaysAhead: 30    // how far ahead students can book
};

/* ---------------------------------------------------------
   2. Dynamic navigation menu
   --------------------------------------------------------- */

function buildNavigation() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  // Work out which page we are on ("" means the site root -> index.html)
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const list = document.createElement("ul");
  list.className = "nav-list";

  NAV_ITEMS.forEach((item) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;

    if (item.href.toLowerCase() === currentPage.toLowerCase()) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    li.appendChild(link);
    list.appendChild(li);
  });

  nav.appendChild(list);

  // Mobile menu toggle (hamburger button)
  const toggle = document.getElementById("nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "✕ Close" : "☰ Menu";
    });

    // Close the mobile menu with the Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰ Menu";
        toggle.focus();
      }
    });
  }
}

/* ---------------------------------------------------------
   3. Small extras used on every page
   --------------------------------------------------------- */

function setFooterYear() {
  document.querySelectorAll(".js-year").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function setupBackToTop() {
  const button = document.getElementById("to-top");
  if (!button) return;

  window.addEventListener("scroll", () => {
    button.classList.toggle("visible", window.scrollY > 400);
  });
  button.addEventListener("click", () => window.scrollTo({ top: 0 }));
}

// Homepage: shows whether the center is open right now.
function showOpenStatus() {
  const el = document.getElementById("open-status");
  if (!el) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const hour = now.getHours() + now.getMinutes() / 60;

  // Mon-Fri 7am-10pm, Sat 9am-5pm, Sun 12pm-6pm
  const hours = { 0: [12, 18], 6: [9, 17] };
  const [open, close] = hours[day] || [7, 22];
  const isOpen = hour >= open && hour < close;

  el.textContent = isOpen ? "Open now" : "Closed now";
  el.style.color = isOpen ? "var(--ok)" : "var(--bad)";
}

/* ---------------------------------------------------------
   4. FAQ collapsible items
   --------------------------------------------------------- */

function setupFaq() {
  const questions = document.querySelectorAll(".faq-question");
  if (questions.length === 0) return;

  function setOpen(button, open) {
    const answer = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(open));
    answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0px";
    answer.setAttribute("aria-hidden", String(!open));
  }

  questions.forEach((button) => {
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      setOpen(button, !isOpen);
    });
  });

  const expandAll = document.getElementById("faq-expand-all");
  const collapseAll = document.getElementById("faq-collapse-all");
  if (expandAll) expandAll.addEventListener("click", () => questions.forEach((q) => setOpen(q, true)));
  if (collapseAll) collapseAll.addEventListener("click", () => questions.forEach((q) => setOpen(q, false)));
}

/* ---------------------------------------------------------
   5. Room booking page
   --------------------------------------------------------- */

// Draw the 5 room cards and fill the room drop-down.
function renderRooms() {
  const grid = document.getElementById("room-grid");
  const select = document.getElementById("room");
  if (!grid || !select) return;

  ROOMS.forEach((room) => {
    const card = document.createElement("article");
    card.className = "card room-card";
    card.innerHTML = `
      <img src="${room.image}" alt="${room.name} at the UH Sugar Land Student Center" loading="lazy">
      <div class="card-body">
        <h3>${room.name}</h3>
        <span class="badge">Up to ${room.capacity} people</span>
        <ul>${room.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <button type="button" class="btn btn-outline" data-room="${room.id}">Book this room</button>
      </div>`;
    grid.appendChild(card);

    const option = document.createElement("option");
    option.value = room.id;
    option.textContent = `${room.name} (up to ${room.capacity})`;
    select.appendChild(option);
  });

  // "Book this room" buttons pre-select the room and jump to the form
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-room]");
    if (!button) return;
    select.value = button.dataset.room;
    select.dispatchEvent(new Event("change"));
    document.getElementById("booking-form").scrollIntoView();
    document.getElementById("fullName").focus();
  });
}

// Helpers for dates and times
function todayString() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // local date, not UTC
  return d.toISOString().split("T")[0];
}

function addDays(dateString, days) {
  const d = new Date(dateString + "T00:00:00");
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

function timeToHours(time) {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// One validation function per field. Each returns an error
// message, or "" when the value is valid.
const validators = {
  fullName(value) {
    if (!value) return "Please enter your full name.";
    if (!/^[A-Za-z][A-Za-z\s'.-]{1,59}$/.test(value)) {
      return "Use letters, spaces, hyphens or apostrophes only (2-60 characters).";
    }
    if (!value.includes(" ")) return "Please enter your first and last name.";
    return "";
  },

  email(value) {
    if (!value) return "Please enter your UH email address.";
    if (!/^[^\s@]+@(cougarnet\.)?uh\.edu$/i.test(value)) {
      return "Use your UH email (ending in @uh.edu or @cougarnet.uh.edu).";
    }
    return "";
  },

  psid(value) {
    if (!value) return "Please enter your PeopleSoft ID.";
    if (!/^\d{7}$/.test(value)) return "Your PSID should be exactly 7 digits.";
    return "";
  },

  room(value) {
    if (!value) return "Please choose a room.";
    return "";
  },

  date(value) {
    if (!value) return "Please choose a date.";
    const today = todayString();
    if (value < today) return "The date cannot be in the past.";
    if (value > addDays(today, BOOKING_RULES.maxDaysAhead)) {
      return `You can book up to ${BOOKING_RULES.maxDaysAhead} days ahead.`;
    }
    return "";
  },

  startTime(value, form) {
    if (!value) return "Please choose a start time.";
    const start = timeToHours(value);
    if (start < BOOKING_RULES.openHour || start >= BOOKING_RULES.closeHour) {
      return "Rooms can be booked between 8:00 AM and 9:00 PM.";
    }
    // Today's bookings must start in the future
    if (form.elements.date.value === todayString()) {
      const now = new Date();
      if (start <= now.getHours() + now.getMinutes() / 60) {
        return "That start time has already passed today.";
      }
    }
    return "";
  },

  endTime(value, form) {
    if (!value) return "Please choose an end time.";
    if (!form.elements.startTime.value) return "";
    const start = timeToHours(form.elements.startTime.value);
    const end = timeToHours(value);
    if (end <= start) return "The end time must be after the start time.";
    if (end > BOOKING_RULES.closeHour) return "Bookings must end by 9:00 PM.";
    if (end - start > BOOKING_RULES.maxHours) {
      return `A booking can last at most ${BOOKING_RULES.maxHours} hours.`;
    }
    return "";
  },

  attendees(value, form) {
    if (!value) return "Please enter the number of attendees.";
    const count = Number(value);
    if (!Number.isInteger(count) || count < 1) return "Enter a whole number of at least 1.";
    const room = ROOMS.find((r) => r.id === form.elements.room.value);
    if (room && count > room.capacity) {
      return `${room.name} holds up to ${room.capacity} people.`;
    }
    return "";
  },

  purpose(value) {
    if (value.length > 200) return "Please keep this under 200 characters.";
    return "";
  },

  agree(_value, form) {
    if (!form.elements.agree.checked) return "Please agree to the room use policy.";
    return "";
  }
};

// Show or clear the error for one field. Returns true if valid.
function validateField(form, name) {
  const field = form.elements[name];
  const value = field.type === "checkbox" ? field.checked : field.value.trim();
  const message = validators[name](value, form);

  const group = field.closest(".form-group");
  const errorEl = document.getElementById(`${name}-error`);
  group.classList.toggle("invalid", message !== "");
  field.setAttribute("aria-invalid", String(message !== ""));
  if (errorEl) errorEl.textContent = message;

  return message === "";
}

function showResult(type, html) {
  const box = document.getElementById("booking-result");
  box.className = `result show ${type}`;
  box.innerHTML = html;
  box.focus();
}

function setupBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  // Limit the date picker to the allowed window
  form.elements.date.min = todayString();
  form.elements.date.max = addDays(todayString(), BOOKING_RULES.maxDaysAhead);

  // Live character counter for the purpose box
  const counter = document.getElementById("purpose-count");
  form.elements.purpose.addEventListener("input", () => {
    counter.textContent = `${form.elements.purpose.value.length}/200`;
  });

  // Check each field when the user leaves it, and re-check as they fix it
  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener("blur", () => validateField(form, name));
    field.addEventListener("input", () => {
      if (field.closest(".form-group").classList.contains("invalid")) {
        validateField(form, name);
      }
    });
  });

  // Fields that depend on each other are re-checked together
  form.elements.room.addEventListener("change", () => {
    if (form.elements.attendees.value) validateField(form, "attendees");
  });
  form.elements.startTime.addEventListener("change", () => {
    if (form.elements.endTime.value) validateField(form, "endTime");
  });
  form.elements.date.addEventListener("change", () => {
    if (form.elements.startTime.value) validateField(form, "startTime");
  });

  form.addEventListener("reset", () => {
    form.querySelectorAll(".form-group").forEach((g) => g.classList.remove("invalid"));
    form.querySelectorAll(".error-msg").forEach((e) => (e.textContent = ""));
    document.getElementById("booking-result").className = "result";
    counter.textContent = "0/200";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Validate everything and move focus to the first problem
    const results = Object.keys(validators).map((name) => validateField(form, name));
    if (results.includes(false)) {
      form.querySelector(".invalid input, .invalid select, .invalid textarea").focus();
      showResult("error", "<strong>Please fix the highlighted fields.</strong>");
      return;
    }

    const booking = {
      name: form.elements.fullName.value.trim(),
      email: form.elements.email.value.trim().toLowerCase(),
      psid: form.elements.psid.value.trim(),
      room: form.elements.room.value,
      date: form.elements.date.value,
      startTime: form.elements.startTime.value,
      endTime: form.elements.endTime.value,
      attendees: Number(form.elements.attendees.value),
      purpose: form.elements.purpose.value.trim()
    };

    const submitButton = form.querySelector("button[type=submit]");
    submitButton.disabled = true;
    submitButton.textContent = "Checking availability...";

    try {
      // The backend checks whether the room is free and replies
      // with a confirmation or a decline.
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const room = ROOMS.find((r) => r.id === booking.room);
        form.reset(); // clears the form (and the old message) first
        showResult(
          "success",
          `<strong>Booking confirmed!</strong><br>
           ${room.name} on ${booking.date}, ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}.<br>
           Confirmation number: <strong>${data.booking.id}</strong>`
        );
      } else {
        showResult("error", `<strong>Booking declined.</strong><br>${data.message || "Please try a different time."}`);
      }
    } catch (error) {
      // No server running (e.g. the page was opened straight from the file)
      showResult(
        "info",
        "<strong>Your form passed every check.</strong><br>" +
          "The booking server isn't reachable, so the room's availability couldn't be confirmed. " +
          "Start the app with <code>node backend/app.js</code> and open http://localhost:8080."
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Book Room";
    }
  });
}

/* ---------------------------------------------------------
   6. Start everything once the page has loaded
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  buildNavigation();
  setFooterYear();
  setupBackToTop();
  showOpenStatus();
  setupFaq();
  renderRooms();
  setupBookingForm();
});
