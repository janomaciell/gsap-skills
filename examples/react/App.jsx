/**
 * GSAP React + Vite example — follows gsap-vite skill patterns:
 * - Plugins registered in main.jsx (not here)
 * - useGSAP with scope for HMR-safe, StrictMode-safe animations
 * - Hero entrance timeline
 * - Scroll-triggered card reveal with ScrollTrigger
 * - No selector without scope
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ─── Hero Section ────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);

  useGSAP(() => {
    // Staggered entrance timeline — scoped to this component's root
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from("h1",     { autoAlpha: 0, y: 60, duration: 1 })
      .from("p",      { autoAlpha: 0, y: 30, duration: 0.8 }, "-=0.5")
      .from(".cta",   { autoAlpha: 0, scale: 0.9, duration: 0.6 }, "-=0.4");
  }, { scope: ref });

  return (
    <section ref={ref} style={{ padding: "6rem 2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        GSAP + React + Vite
      </h1>
      <p style={{ fontSize: "1.25rem", marginBottom: "2rem", opacity: 0.7 }}>
        Entrance animation — staggered timeline, scoped to this component.
      </p>
      <button
        className="cta"
        style={{
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          background: "#0fa",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Get Started
      </button>
    </section>
  );
}

// ─── Cards Section (Scroll Reveal) ───────────────────────────────────────────
const CARDS = [
  { title: "ScrollTrigger", desc: "Scroll-linked animation & pinning" },
  { title: "useGSAP", desc: "HMR-safe, StrictMode-safe hook" },
  { title: "Reusable Hooks", desc: "useGSAPEntrance, useGSAPScrollReveal" },
];

function Cards() {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.from(".card", {
      autoAlpha: 0,
      y: 50,
      stagger: 0.15,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        once: true, // plays once; doesn't replay on scroll back
      },
    });
  }, { scope: ref });

  return (
    <section
      ref={ref}
      style={{
        display: "flex",
        gap: "1.5rem",
        padding: "4rem 2rem",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {CARDS.map((c) => (
        <div
          key={c.title}
          className="card"
          style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: 12,
            padding: "2rem",
            width: 240,
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#0fa", marginBottom: "0.5rem" }}>{c.title}</h3>
          <p style={{ opacity: 0.7 }}>{c.desc}</p>
        </div>
      ))}
    </section>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ minHeight: "200vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <Hero />
      <Cards />
    </div>
  );
}
