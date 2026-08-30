/* ==========================================================================
   MY BRAND — script.js
   Lenis (smooth scroll) + GSAP / ScrollTrigger (all motion)
   ========================================================================== */

/* --------------------------------------------------------------------------
   0. IMAGE CONFIG
   Centralised so placeholder Unsplash images can be swapped for final
   assets later without touching any markup or animation code.
   -------------------------------------------------------------------------- */
const IMAGES = {
  hero:    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2400&auto=format&fit=crop",
  feature: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2200&auto=format&fit=crop",
  story1:  "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=2000&auto=format&fit=crop",
  story2:  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop",
  story3:  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop"
};

document.querySelectorAll("[data-img]").forEach((el) => {
  const key = el.getAttribute("data-img");
  if (IMAGES[key]) {
    el.src = IMAGES[key];
    el.loading = el.closest(".hero") ? "eager" : "lazy";
    el.decoding = "async";
    el.alt = "";
  }
});

/* --------------------------------------------------------------------------
   1. PREFERENCES
   -------------------------------------------------------------------------- */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const isNarrow = () => window.innerWidth < 900;

gsap.registerPlugin(ScrollTrigger);

/* --------------------------------------------------------------------------
   2. LENIS + GSAP TICKER SYNC
   -------------------------------------------------------------------------- */
let lenis;
if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.1,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
} else {
  // Respect prefers-reduced-motion: keep native scrolling, skip Lenis entirely.
  document.documentElement.style.scrollBehavior = "auto";
}

/* --------------------------------------------------------------------------
   3. LOADER + PAGE-LOAD SEQUENCE
   -------------------------------------------------------------------------- */
window.addEventListener("load", () => {
  const loaderTl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: runHeroIntro,
  });

  loaderTl
    .to(".loader-bar span", { scaleX: 1, duration: 0.7, ease: "power2.inOut" })
    .to(".loader", { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "+=0.15")
    .set(".loader", { display: "none" });
});

function runHeroIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.to(".nav", { opacity: 1, duration: 0.6 }, 0)
    .to(".hero-meta", { opacity: 1, duration: 0.6 }, 0.1)
    .to(".hero-title .word", {
      yPercent: 0,
      duration: 1.1,
      stagger: 0.08,
    }, 0.05)
    .to(".hero-img", { scale: 1, duration: 1.8, ease: "power2.out" }, 0)
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
    .to(".scroll-cue", { opacity: 1, duration: 0.6 }, "-=0.4")
    .to(".timecode", { opacity: 1, duration: 0.6 }, "-=0.4")
    .add(() => document.body.classList.add("is-ready"));
}

/* Fallback: if 'load' already fired (cached), run intro immediately. */
if (document.readyState === "complete") {
  gsap.to(".loader", { yPercent: -100, duration: 0.6, delay: 0.2, onComplete: runHeroIntro });
}

/* --------------------------------------------------------------------------
   4. NAV — scrolled state + mobile toggle + section-aware indicator
   -------------------------------------------------------------------------- */
const nav = document.getElementById("nav");
ScrollTrigger.create({
  start: 40,
  end: 99999,
  onUpdate: (self) => {
    nav.classList.toggle("is-scrolled", self.scroll() > 40);
  },
});

const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");
navToggle.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
});
mobileMenu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  })
);

/* Smooth in-page nav (works with or without Lenis) */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  });
});

/* --------------------------------------------------------------------------
   5. HERO — scroll parallax / fade-out
   -------------------------------------------------------------------------- */
gsap.timeline({
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 0.6,
  },
})
  .to(".hero-content", { yPercent: -30, opacity: 0, ease: "none" }, 0)
  .to(".hero-img", { scale: isNarrow() ? 1.1 : 1.22, yPercent: 8, ease: "none" }, 0)
  .to(".hero-scrim", { opacity: 0.9, ease: "none" }, 0);

/* --------------------------------------------------------------------------
   6. INTRODUCTION — progressive word reveal with differing speeds
   -------------------------------------------------------------------------- */
const revealWords = gsap.utils.toArray(".reveal-word");
ScrollTrigger.create({
  trigger: ".intro",
  start: "top 75%",
  end: "bottom 60%",
  scrub: false,
  onUpdate: (self) => {
    const active = Math.floor(self.progress * revealWords.length);
    revealWords.forEach((w, i) => w.classList.toggle("is-active", i <= active));
  },
});

/* Words drift at slightly different speeds; the italic word stays fixed. */
revealWords.forEach((word, i) => {
  if (word.classList.contains("pin-word")) return;
  const dir = i % 2 === 0 ? -1 : 1;
  gsap.to(word, {
    y: dir * (isNarrow() ? 6 : 14),
    ease: "none",
    scrollTrigger: {
      trigger: ".intro",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
});

/* --------------------------------------------------------------------------
   7. FEATURED PROJECT — pinned reveal
   -------------------------------------------------------------------------- */
const featureTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".feature",
    start: "top top",
    end: "+=140%",
    scrub: 0.8,
    pin: true,
    pinSpacing: true,
  },
});

featureTl
  .fromTo(".feature-frame", { width: isNarrow() ? "82vw" : "30vw", height: isNarrow() ? "34vh" : "34vh" }, { width: isNarrow() ? "94vw" : "92vw", height: isNarrow() ? "50vh" : "88vh", ease: "power2.inOut" }, 0)
  .fromTo(".feature-img", { scale: 1.3 }, { scale: 1.05, ease: "none" }, 0)
  .fromTo(".feature-title", { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, ease: "power2.out" }, 0.05)
  .to(".feature-tags", { opacity: 1, duration: 0.3 }, 0.55)
  .to(".feature-img", { yPercent: -6, ease: "none" }, 0.55)
  .to([".feature-title", ".feature-tags", ".feature-frame"], { opacity: 0, duration: 0.25, ease: "power1.in" }, 0.92);

/* --------------------------------------------------------------------------
   8. CINEMATIC IMAGE STORY — three distinct treatments
   -------------------------------------------------------------------------- */
// Panel 1: scale + fade
gsap.fromTo(
  '.story-panel--fade .story-img',
  { scale: 1.25, opacity: 0.4 },
  {
    scale: 1,
    opacity: 1,
    ease: "none",
    scrollTrigger: {
      trigger: '.story-panel--fade',
      start: "top bottom",
      end: "top 20%",
      scrub: 0.6,
    },
  }
);

// Panel 2: slide from right + scale
gsap.fromTo(
  '.story-panel--slide .story-img',
  { xPercent: 18, scale: 1.15 },
  {
    xPercent: 0,
    scale: 1,
    ease: "none",
    scrollTrigger: {
      trigger: '.story-panel--slide',
      start: "top bottom",
      end: "top 15%",
      scrub: 0.6,
    },
  }
);

// Panel 3: clip-path reveal (mask)
gsap.to('.story-panel--mask .story-mask', {
  clipPath: "inset(0 0 0% 0)",
  ease: "none",
  scrollTrigger: {
    trigger: '.story-panel--mask',
    start: "top 90%",
    end: "top 10%",
    scrub: 0.6,
  },
});

// Shared caption fade-up for all three panels
gsap.utils.toArray(".story-caption").forEach((caption) => {
  gsap.fromTo(
    caption,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: caption,
        start: "top 85%",
      },
    }
  );
});

/* --------------------------------------------------------------------------
   9. SERVICES — hover state driven mostly by CSS; JS toggles an
      "is-active" class for touch devices (tap to preview state).
   -------------------------------------------------------------------------- */
document.querySelectorAll(".service-row").forEach((row) => {
  if (isTouch) {
    row.addEventListener("click", () => {
      document.querySelectorAll(".service-row").forEach((r) => r !== row && r.classList.remove("is-active"));
      row.classList.toggle("is-active");
    });
  }
});

gsap.utils.toArray(".service-row").forEach((row, i) => {
  gsap.fromTo(
    row,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: i * 0.03,
      ease: "power2.out",
      scrollTrigger: { trigger: row, start: "top 92%" },
    }
  );
});

/* --------------------------------------------------------------------------
   10. ABOUT — split scroll-based drift
   -------------------------------------------------------------------------- */
gsap.to(".about-left", {
  yPercent: -8,
  ease: "none",
  scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: 1 },
});
gsap.to(".about-right", {
  yPercent: 8,
  ease: "none",
  scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: 1 },
});

/* --------------------------------------------------------------------------
   11. PROCESS — horizontal scroll controlled by vertical scroll (pinned)
   -------------------------------------------------------------------------- */
function initProcess() {
  const track = document.getElementById("processTrack");
  if (!track) return null;

  const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

  const tween = gsap.to(track, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: ".process",
      start: "top top",
      end: () => `+=${getDistance() + window.innerHeight * 0.4}`,
      scrub: 0.7,
      pin: true,
      invalidateOnRefresh: true,
    },
  });

  gsap.utils.toArray(".process-card").forEach((card) => {
    gsap.fromTo(
      card.querySelector(".process-num"),
      { opacity: 0.3 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: "left 70%",
          end: "left 30%",
          scrub: true,
        },
      }
    );
  });

  return tween;
}
let processTween = initProcess();

/* --------------------------------------------------------------------------
   12. MAGNETIC CTA BUTTON
   -------------------------------------------------------------------------- */
const magneticBtn = document.getElementById("magneticBtn");
if (magneticBtn && !isTouch) {
  const strength = 0.35;
  magneticBtn.addEventListener("mousemove", (e) => {
    const rect = magneticBtn.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    gsap.to(magneticBtn, {
      x: relX * strength,
      y: relY * strength,
      duration: 0.5,
      ease: "power3.out",
    });
  });
  magneticBtn.addEventListener("mouseleave", () => {
    gsap.to(magneticBtn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  });
}

/* Subtle ambient drift on the CTA glow */
if (!prefersReducedMotion) {
  gsap.to(".cta-glow", {
    x: 40,
    y: -30,
    duration: 8,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}

/* --------------------------------------------------------------------------
   13. CUSTOM CURSOR
   -------------------------------------------------------------------------- */
if (!isTouch) {
  const cursor = document.getElementById("cursor");
  const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { ...cursorPos };

  window.addEventListener("mousemove", (e) => {
    cursorPos.x = e.clientX;
    cursorPos.y = e.clientY;
  });

  gsap.ticker.add(() => {
    ringPos.x += (cursorPos.x - ringPos.x) * 0.18;
    ringPos.y += (cursorPos.y - ringPos.y) * 0.18;
    cursor.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
  });

  const hoverTargets = "a, button, .service-row, .process-card";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) cursor.classList.add("is-hover");
    if (e.target.closest("#magneticBtn")) cursor.classList.add("is-cta");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) cursor.classList.remove("is-hover");
    if (e.target.closest("#magneticBtn")) cursor.classList.remove("is-cta");
  });
}

/* --------------------------------------------------------------------------
   14. TIMECODE HUD — signature scroll-progress element styled as a
       film timecode (HH:MM:SS:FF against total scrollable "runtime").
   -------------------------------------------------------------------------- */
const timecodeEl = document.getElementById("timecode");
const timecodeValue = document.getElementById("timecodeValue");
function formatTimecode(progress) {
  const totalFrames = Math.floor(progress * 24 * 60 * 5); // fictitious 5-min "runtime" at 24fps
  const ff = totalFrames % 24;
  const totalSeconds = Math.floor(totalFrames / 24);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}
ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => {
    timecodeValue.textContent = formatTimecode(self.progress);
    timecodeEl.classList.toggle("is-visible", self.scroll() > window.innerHeight * 0.5);
  },
});

/* --------------------------------------------------------------------------
   15. BACK TO TOP
   -------------------------------------------------------------------------- */
document.getElementById("backToTop").addEventListener("click", () => {
  if (lenis) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
});

/* --------------------------------------------------------------------------
   16. RESIZE HANDLING
   -------------------------------------------------------------------------- */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});

/* --------------------------------------------------------------------------
   17. GRACEFUL DEGRADATION — if prefers-reduced-motion, strip scrub/pin
       heavy triggers so the page still reads correctly with plain scroll.
   -------------------------------------------------------------------------- */
if (prefersReducedMotion) {
  ScrollTrigger.getAll().forEach((st) => st.kill());
  gsap.set([".hero-title .word", ".hero-sub", ".scroll-cue", ".hero-meta", ".nav", ".feature-title", ".feature-tags", ".story-caption", ".service-row"], { clearProps: "all", opacity: 1, y: 0, x: 0, scale: 1 });
  document.querySelectorAll(".reveal-word").forEach((w) => w.classList.add("is-active"));
  document.querySelector(".story-panel--mask .story-mask").style.clipPath = "inset(0 0 0% 0)";
}
