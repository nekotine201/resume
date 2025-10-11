'use strict';

/* ========== Helpers ========== */
const toggle = (el, cls = "active") => el && el.classList.toggle(cls);
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ========== Sidebar toggle ========== */
const sidebar = $("[data-sidebar]");
const sidebarBtn = $("[data-sidebar-btn]");
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", () => toggle(sidebar));
}

/* ========== Testimonials modal (giữ nguyên logic cũ, thêm guard) ========== */
const testimonialsItem = $$("[data-testimonials-item]");
const modalContainer = $("[data-modal-container]");
const modalCloseBtn  = $("[data-modal-close-btn]");
const overlay        = $("[data-overlay]");

const modalImg   = $("[data-modal-img]");
const modalTitle = $("[data-modal-title]");
const modalText  = $("[data-modal-text]");

const openCloseModal = () => {
  if (!modalContainer || !overlay) return;
  toggle(modalContainer);
  toggle(overlay);
};

if (testimonialsItem.length && modalContainer && overlay) {
  testimonialsItem.forEach((item) => {
    item.addEventListener("click", () => {
      if (modalImg) {
        const av = item.querySelector("[data-testimonials-avatar]");
        if (av) { modalImg.src = av.src; modalImg.alt = av.alt || ""; }
      }
      if (modalTitle) {
        const t = item.querySelector("[data-testimonials-title]");
        if (t) modalTitle.innerHTML = t.innerHTML;
      }
      if (modalText) {
        const tx = item.querySelector("[data-testimonials-text]");
        if (tx) modalText.innerHTML = tx.innerHTML;
      }
      openCloseModal();
    });
  });

  if (modalCloseBtn)  modalCloseBtn.addEventListener("click", openCloseModal);
  if (overlay)        overlay.addEventListener("click", openCloseModal);
}

/* ========== Filter select & buttons ========== */
const select      = $("[data-select]");
const selectItems = $$("[data-select-item]");
const selectValue = $("[data-select-value]");
const filterBtns  = $$("[data-filter-btn]");
const filterItems = $$("[data-filter-item]");

// Chuẩn hoá chuỗi để so sánh category
const normalize = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");

const isAll = (val) => {
  const v = normalize(val);
  return v === "all" || v === "tất cả";
};

const applyFilter = (selected) => {
  const sel = normalize(selected);
  filterItems.forEach((it) => {
    const cat = normalize(it.dataset.category);
    if (isAll(sel) || sel === cat) {
      it.classList.add("active");
    } else {
      it.classList.remove("active");
    }
  });
};

if (select) {
  select.addEventListener("click", () => toggle(select));
}

if (selectItems.length) {
  selectItems.forEach((item) => {
    item.addEventListener("click", () => {
      const chosen = item.innerText;
      if (selectValue) selectValue.innerText = item.innerText;
      toggle(select);               // đóng dropdown
      applyFilter(chosen);          // lọc
    });
  });
}

// Nút filter trên màn hình lớn
let lastClickedBtn = filterBtns[0] || null;

if (filterBtns.length) {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosen = btn.innerText;
      if (selectValue) selectValue.innerText = btn.innerText;
      applyFilter(chosen);

      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      btn.classList.add("active");
      lastClickedBtn = btn;
    });
  });
}

/* ========== Contact form (Apps Script) ========== */
document.addEventListener("DOMContentLoaded", () => {
  const form      = $("#contactForm");
  if (!form) return;

  const inputs    = $$("[data-form-input]", form);
  const submitBtn = $("[data-form-btn]", form);
  const statusEl  = $("#formStatus");

  // URL Apps Script của bạn:
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbwigjPerX2YCb8aVQK3tjswKsfPEw3fnKJdUbv9RqjVlk-_DehDivipqbJ9UVqFOQgu/exec";

  const validate = () => {
    const ok = inputs.every(i => i.value.trim() !== "");
    if (submitBtn) submitBtn.disabled = !ok;
  };

  inputs.forEach(i => i.addEventListener("input", validate));
  validate();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = "Sending...";

    try {
      const formData = new FormData(form);
      const res  = await fetch(ENDPOINT, { method: "POST", body: formData });
      const text = await res.text();

      if (res.ok && text.trim() === "OK") {
        if (statusEl) statusEl.textContent = "✅ Sent successfully!";
        form.reset();
        validate();
      } else {
        if (statusEl) statusEl.textContent = "⚠️ Failed to send. Please try again.";
        console.error("Unexpected response:", text);
        if (submitBtn) submitBtn.disabled = false;
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "❌ Network error. Please try again.";
      console.error(err);
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});

/* ========== Page navigation (dùng data-target) ========== */
const navLinks = $$("[data-nav-link]");
const pages    = $$("[data-page]");

// Fallback map nếu có trang nào quên gắn data-target
const FALLBACK_MAP = {
  "about": "about",
  "resume": "resume",
  "portfolio": "portfolio",
  "contact": "contact",
  "giới thiệu": "about",
  "hồ sơ": "resume",
  "dự án": "portfolio",
  "liên hệ": "contact"
};

if (navLinks.length && pages.length) {
  navLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Ưu tiên data-target; nếu thiếu thì suy ra từ text (cả tiếng Việt & Anh)
      const raw = btn.dataset.target || btn.innerText || btn.textContent || "";
      const key = normalize(raw);
      const target = FALLBACK_MAP[key] || key; // ví dụ "about"

      // Bật trang mục tiêu, tắt trang khác
      pages.forEach((pg) => {
        pg.classList.toggle("active", normalize(pg.dataset.page) === target);
      });

      // Active trạng thái nút
      navLinks.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      window.scrollTo(0, 0);
    });
  });
}
<!-- Cuối body, sau khi đã load main.js hiện có -->
<script>
(() => {
  /* Mouse */
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let clicked = false;

  const getMouse = (e) => {
    const isTouch = e.touches && e.touches.length;
    const cx = isTouch ? e.touches[0].pageX : (e.clientX ?? e.pageX ?? window.innerWidth / 2);
    const cy = isTouch ? e.touches[0].pageY : (e.clientY ?? e.pageY ?? window.innerHeight / 2);
    mouse.x = cx; mouse.y = cy;
  };

  ['mousemove', 'touchstart', 'touchmove'].forEach(ev =>
    window.addEventListener(ev, getMouse, { passive: true })
  );
  window.addEventListener('mousedown', e => { e.preventDefault(); clicked = true; });
  window.addEventListener('mouseup',   () => { clicked = false; });

  /* Helpers */
  const map = (num, inMin, inMax, outMin, outMax) =>
    (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

  /* Ghost follow */
  class GhostFollow {
    constructor () {
      this.el = document.querySelector('#ghost');
      if (!this.el) return;  // không có ghost → thoát
      this.mouth = this.el.querySelector('.ghost__mouth');
      this.eyes  = this.el.querySelector('.ghost__eyes');
      this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    follow() {
      if (!this.el) return;
      const distX = mouse.x - this.pos.x;
      const distY = mouse.y - this.pos.y;
      const velX  = distX / 8;
      const velY  = distY / 8;

      this.pos.x += distX / 10;
      this.pos.y += distY / 10;

      const skewX     = map(velX, 0, 100, 0, -50);
      const scaleY    = map(velY, 0, 100, 1, 2.0);
      let scaleEyeX   = map(Math.abs(velX), 0, 100, 1, 1.2);
      let scaleEyeY   = map(Math.abs(velX * 2), 0, 100, 1, 0.1);
      let scaleMouth  = Math.min(
        Math.max(map(Math.abs(velX * 1.5), 0, 100, 0, 10), map(Math.abs(velY * 1.2), 0, 100, 0, 5)),
        2
      );

      if (clicked) { scaleEyeY = .4; scaleMouth = -scaleMouth; }

      // áp transform trực tiếp
      this.el.style.transform =
        `translate(${this.pos.x}px, ${this.pos.y}px) scale(.7) skew(${skewX}deg) rotate(${-skewX}deg) scaleY(${scaleY})`;

      if (this.eyes)  this.eyes.style.transform  = `translateX(-50%) scale(${scaleEyeX}, ${scaleEyeY})`;
      if (this.mouth) this.mouth.style.transform = `translate(${(-skewX*.5-10)}px) scale(${scaleMouth})`;
    }
  }

  const cursor = new GhostFollow();
  const render = () => { requestAnimationFrame(render); cursor.follow(); };
  render();
})();
</script>
