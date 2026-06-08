/* SEARULEA — motion + interactions
   GSAP + ScrollTrigger. Respects prefers-reduced-motion.
*/

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.querySelectorAll(".reveal").forEach(el => { el.style.opacity = 1; el.style.transform = "none"; });
    document.querySelectorAll(".reveal-line > span").forEach(el => { el.style.transform = "none"; });
    return;
  }

  // Wait for GSAP
  const ready = () => typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const init = () => {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });

    /* ---------- SCROLL-AWARE NAV ---------- */
    const nav = document.querySelector(".nav");
    if (nav) {
      const setScrolled = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
      setScrolled();
      window.addEventListener("scroll", setScrolled, { passive: true });
    }

    /* ---------- HERO INTRO ---------- */
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    // Hero title and nav are animated via CSS keyframes (see main.css)
    // so they can't be killed by GSAP timeline interference.
    tl.from(".hero__eyebrow", { y: 16, opacity: 0, duration: 0.8, delay: 0.3 })
      .from(".hero__deck", { y: 24, opacity: 0, duration: 0.9, delay: 0.4 }, "-=0.4")
      .from(".hero__ctas > *", { y: 16, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.6")
      .from(".hero__photo", { scale: 1.12, opacity: 0, duration: 1.8, ease: "power3.out" }, 0)
      .from(".hero__veil",  { opacity: 0, duration: 1.4, ease: "power2.out" }, 0.1);

    /* ---------- HERO PARALLAX ---------- */
    gsap.to(".hero__photo", {
      yPercent: 14, scale: 1.06,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__bg", {
      yPercent: 22,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__bg--mirror", {
      yPercent: -14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* ---------- SECTION REVEAL ---------- */
    gsap.utils.toArray(".reveal").forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });

    /* ---------- LINE-CLIP REVEALS (scroll, excluding hero title — handled by intro) ---------- */
    gsap.utils.toArray(".reveal-line").forEach(el => {
      if (el.closest(".hero__title")) return;
      const inner = el.querySelectorAll(":scope > span");
      gsap.to(inner, {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    /* ---------- NUMBER COUNT-UPS ---------- */
    gsap.utils.toArray("[data-count]").forEach(el => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.decimals ? parseInt(el.dataset.decimals) : 0);
      const obj = { v: 0 };
      const isThousand = target >= 1000;
      gsap.to(obj, {
        v: target,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          const n = obj.v.toFixed(decimals);
          el.textContent = isThousand
            ? Number(n).toLocaleString("en-US")
            : n;
        }
      });
    });

    /* ---------- SPIRAL ROTATION ---------- */
    gsap.utils.toArray(".sovereignty__bg, .manifesto__bg").forEach(el => {
      gsap.to(el, {
        rotation: 60,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 }
      });
    });

    /* ---------- DOORS STAGGER ON SCROLL ---------- */
    gsap.from(".door", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "expo.out",
      scrollTrigger: { trigger: ".doors__grid", start: "top 78%", once: true }
    });

    /* ---------- PROOF CARDS ---------- */
    gsap.from(".proof__card", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "expo.out",
      scrollTrigger: { trigger: ".proof__grid", start: "top 80%", once: true }
    });
  };

  // Poll briefly for GSAP from CDN
  let tries = 0;
  const wait = setInterval(() => {
    if (ready()) { clearInterval(wait); init(); }
    else if (++tries > 80) { clearInterval(wait); }
  }, 50);
})();
