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

    /* ---------- LOADING INTRO — cloud → fish → A → fly to nav (≤ 4s) ---------- */
    const loader = document.getElementById("loader");
    if (loader && document.documentElement.classList.contains("is-loading")) {
      if (window.__loaderSafety) clearTimeout(window.__loaderSafety);

      const fishPaths  = loader.querySelectorAll(".loader__fish path");
      const markPaths  = loader.querySelectorAll(".loader__mark path");
      const loaderFish = loader.querySelector(".loader__fish");
      const loaderMark = loader.querySelector(".loader__mark");
      const navMark    = document.querySelector(".nav__mark");

      // Pre-compute the flight delta from loader's A to nav's A.
      const mRect = loaderMark.getBoundingClientRect();
      const nRect = navMark.getBoundingClientRect();
      const flight = {
        dx: (nRect.left + nRect.width  / 2) - (mRect.left + mRect.width  / 2),
        dy: (nRect.top  + nRect.height / 2) - (mRect.top  + mRect.height / 2),
        scale: nRect.height / mRect.height
      };

      // INITIAL STATE — the fish dots start scattered as a cloud and invisible.
      // Each path keeps its native fish position (cx/cy) but gets a random x/y
      // translate offset, a smaller scale, and zero opacity. Phase 2 will then
      // tween x/y/scale back to 0/0/1 — that's the cloud → fish "morph".
      gsap.set(loaderFish, { opacity: 1 });
      gsap.set(fishPaths, {
        x:       () => gsap.utils.random(-110, 110),
        y:       () => gsap.utils.random(-70, 70),
        scale:   () => gsap.utils.random(0.55, 1.1),
        opacity: 0
      });
      gsap.set(loaderMark, { opacity: 0 });
      gsap.set(markPaths,  { scale: 0, opacity: 0 });

      const ltl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          loader.remove();
          document.documentElement.classList.remove("is-loading");
          document.body.classList.remove("is-loading");
        }
      });

      ltl
        /* 1 ── Cloud appears (0 → ~0.45s) */
        .to(fishPaths, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          stagger: { each: 0.008, from: "random" }
        })

        /* 2 ── Cloud morphs into the fish (~0.30 → ~1.15s, overlaps cloud-in) */
        .to(fishPaths, {
          x: 0, y: 0, scale: 1,
          duration: 0.85,
          ease: "expo.inOut",
          stagger: { each: 0.010, from: "random" }
        }, "-=0.15")

        /* 3 ── Fish settles for a beat */
        .addLabel("toA", "+=0.15")

        /* 4 ── Fish dissolves while the A emerges in its place (~1.4 → ~2.15s) */
        .to(fishPaths, {
          scale: 0,
          opacity: 0,
          duration: 0.55,
          ease: "power2.in",
          stagger: { each: 0.006, from: "center" }
        }, "toA")
        .set(".loader__mark", { opacity: 1 }, "toA+=0.25")
        .fromTo(markPaths,
          { scale: 0, opacity: 0 },
          {
            scale: 1, opacity: 1,
            duration: 0.55,
            ease: "back.out(1.55)",
            stagger: { each: 0.025, from: "random" }
          },
          "toA+=0.25"
        )

        /* 5 ── A settles briefly */
        .addLabel("flight", "+=0.15")

        /* 6 ── A flies to the navbar + panels split open + crossfade handoff
                Total flight phase ~1.0s so the whole intro stays under 4s. */
        .to(loaderMark, {
          x: flight.dx,
          y: flight.dy,
          scale: flight.scale,
          duration: 1.0,
          ease: "expo.inOut"
        }, "flight")
        .to(".loader__panel--top", {
          yPercent: -100, duration: 0.95, ease: "expo.inOut"
        }, "flight+=0.05")
        .to(".loader__panel--bottom", {
          yPercent: 100, duration: 0.95, ease: "expo.inOut"
        }, "flight+=0.05")
        .to(navMark, {
          opacity: 1, duration: 0.35, ease: "power2.out"
        }, "flight+=0.65")
        .to(loaderMark, {
          opacity: 0, duration: 0.3, ease: "power2.out"
        }, "flight+=0.70")

        /* 7 ── Brief settle (intro lands at ~3.95s total) */
        .to({}, { duration: 0.05 });
    }

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
