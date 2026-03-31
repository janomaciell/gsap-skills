/**
 * React + Vite entry point — follows gsap-vite skill:
 * Register all GSAP plugins ONCE here, before any component mounts.
 * Never register inside a component — it runs on every render.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

// Register all plugins once — Vite tree-shakes unused imports automatically
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip, Observer, useGSAP);

// Optional: global defaults for every tween in the app
gsap.defaults({ ease: "power2.out", duration: 0.6 });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
