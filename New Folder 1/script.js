/**
 * KAVACH Cybersecurity - Main Script
 * Connected node canvas + Interactive security grid + Browser Database (localStorage)
 */

// ==========================================================
// 1. FREE BROWSER DATABASE LAYER (localStorage abstraction)
// ==========================================================
const KavachDB = {
  STORAGE_KEY: 'kavach_client_inquiries_db_v1',
  
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  },

  saveInquiry(payload) {
    const records = this.getAllInquiries();
    const newRecord = {
      id: 'KVC-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      ...payload
    };
    records.push(newRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    return newRecord;
  },

  getAllInquiries() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }
};

// ==========================================================
// 2. CONNECTED DOT-NETWORK CANVAS BACKGROUND
// ==========================================================
class ConnectedNodeCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dots = [];
    this.mouse = { x: -1000, y: -1000, radius: 140 };
    this.resize();
    this.initDots();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initDots() {
    const density = window.innerWidth < 768 ? 42 : 75;
    this.dots = [];
    for (let i = 0; i < density; i++) {
      this.dots.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 1
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initDots();
    });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];
      d.x += d.vx;
      d.y += d.vy;

      if (d.x < 0 || d.x > this.width) d.vx *= -1;
      if (d.y < 0 || d.y > this.height) d.vy *= -1;

      // Draw dot
      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
      this.ctx.fill();

      // Connect dot to nearby dots
      for (let j = i + 1; j < this.dots.length; j++) {
        const d2 = this.dots[j];
        const dx = d.x - d2.x;
        const dy = d.y - d2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 135) {
          this.ctx.beginPath();
          this.ctx.moveTo(d.x, d.y);
          this.ctx.lineTo(d2.x, d2.y);
          const alpha = (1 - dist / 135) * 0.22;
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }

      // Connect dot to cursor
      const mdx = d.x - this.mouse.x;
      const mdy = d.y - this.mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < this.mouse.radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(d.x, d.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        const mAlpha = (1 - mdist / this.mouse.radius) * 0.45;
        this.ctx.strokeStyle = `rgba(0, 255, 157, ${mAlpha})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================================
// 3. UI CONTROLLER & EVENT LISTENERS
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  KavachDB.init();
  new ConnectedNodeCanvas('network-canvas');

  // Sticky Navbar
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Hero Security Grid Node Hover Inspection
  const securityNodes = document.querySelectorAll('.security-node[data-status]');
  const panelOutput = document.getElementById('node-panel-output-text');
  securityNodes.forEach(node => {
    const handleInspect = () => {
      securityNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      const msg = node.getAttribute('data-status');
      if (panelOutput) panelOutput.textContent = msg;
    };
    node.addEventListener('mouseenter', handleInspect);
    node.addEventListener('click', handleInspect);
  });

  // Use Case Tabs Switcher
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = `panel-${btn.dataset.tab}`;
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const qBtn = item.querySelector('.faq-question');
    qBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Quick Pricing Fill helper buttons
  document.querySelectorAll('[data-select-service]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceValue = btn.getAttribute('data-select-service');
      const selectElem = document.getElementById('serviceRequired');
      if (selectElem) {
        selectElem.value = serviceValue;
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Contact Form Handling with Free Database Persistence
  const contactForm = document.getElementById('kavach-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById('clientName').value.trim(),
        organization: document.getElementById('clientOrg').value.trim(),
        email: document.getElementById('clientEmail').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        orgType: document.getElementById('orgType').value,
        service: document.getElementById('serviceRequired').value,
        message: document.getElementById('clientMessage').value.trim()
      };

      const savedRecord = KavachDB.saveInquiry(formData);
      showToast(`Security check request saved locally! Reference: ${savedRecord.id}`);
      contactForm.reset();
    });
  }
});

function showToast(message) {
  const toast = document.getElementById('kavach-toast');
  const toastText = document.getElementById('kavach-toast-text');
  if (!toast || !toastText) return;
  toastText.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}