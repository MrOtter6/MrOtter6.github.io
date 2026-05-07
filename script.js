/* ===========================================
   Simon Buschen Produktdesign – Frontend Logic
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Year ---------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Sticky Nav ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile Nav Toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  // Close on link click (mobile)
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Reveal on Scroll ---------- */
  const revealEls = document.querySelectorAll(
    '.section-head, .step, .card-img, .ueber-img, .ueber-text, .kontakt-info, .kontakt-form, .compare-wrapper'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Gallery Filter ---------- */
  const chips = document.querySelectorAll('.chip');
  const galleryItems = document.querySelectorAll('#gallery .card-img');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
      chip.classList.add('active');
      chip.setAttribute('aria-selected','true');
      const filter = chip.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('hide', !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lb-img');
  const lbClose = lb.querySelector('.lb-close');
  const lbPrev = lb.querySelector('.lb-prev');
  const lbNext = lb.querySelector('.lb-next');
  let lbIndex = -1;

  const visibleItems = () => Array.from(galleryItems).filter(i => !i.classList.contains('hide'));

  const openLb = (idx) => {
    const items = visibleItems();
    if (!items.length) return;
    lbIndex = (idx + items.length) % items.length;
    const src = items[lbIndex].dataset.img;
    lbImg.src = src;
    lbImg.alt = items[lbIndex].querySelector('img').alt || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = '';
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const items = visibleItems();
      const idx = items.indexOf(item);
      openLb(idx);
    });
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); openLb(lbIndex - 1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); openLb(lbIndex + 1); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIndex - 1);
    if (e.key === 'ArrowRight') openLb(lbIndex + 1);
  });

  /* ---------- Compare Slider ---------- */
  const compare = document.getElementById('compare');
  if (compare) {
    const before = compare.querySelector('.compare-before');
    const handle = compare.querySelector('.compare-handle');
    let dragging = false;

    const apply = (pct) => {
      pct = Math.max(0, Math.min(100, pct));
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      before.style.webkitClipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
    };

    const setPos = (clientX) => {
      const rect = compare.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      apply((x / rect.width) * 100);
    };

    const onDown = (e) => {
      dragging = true;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };
    const onUp = () => { dragging = false; };

    compare.addEventListener('mousedown', onDown);
    compare.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    // Initial state and auto-tease on view
    apply(50);
    let didIntro = false;
    const compareIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !didIntro) {
          didIntro = true;
          let pct = 50, dir = -1;
          const id = setInterval(() => {
            pct += dir * 1.6;
            if (pct <= 28) dir = 1;
            if (pct >= 72) dir = -1;
            apply(pct);
          }, 28);
          setTimeout(() => { clearInterval(id); apply(50); }, 2600);
        }
      });
    }, { threshold: 0.4 });
    compareIO.observe(compare);
  }

  /* ---------- Contact Form ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const fd = new FormData(form);
    const name = fd.get('name');
    const email = fd.get('email');
    const thema = fd.get('thema');
    const nachricht = fd.get('nachricht');

    const subject = encodeURIComponent(`[Website] ${thema} – ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nE-Mail: ${email}\nThema: ${thema}\n\n${nachricht}\n\n— gesendet über buschen-design.com`
    );
    // Open user's email client
    window.location.href = `mailto:simon@buschen.com?subject=${subject}&body=${body}`;

    status.textContent = 'Dein E-Mail-Programm öffnet sich gleich. Falls nicht, schreib mir direkt an simon@buschen.com';
    status.className = 'form-status success';
    setTimeout(() => form.reset(), 800);
  });

  /* ---------- Smooth Anchor (small offset under fixed nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const id = this.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
