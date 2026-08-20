"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header>
      <div className="container nav">

        <Link href="/" className="brand">
  <div>
    <b style={{ fontSize: "26px", letterSpacing: "2px" }}>
      KS{" "}
      <span style={{ color: "#b68901" }}>
        CONSTRUCTIONS
      </span>
    </b>

    <div
      style={{
        fontSize: "12px",
        letterSpacing: "4px",
        marginTop: "4px",
        color: "#ffffff"
      }}
    >
      BUILDING EXCELLENCE
    </div>
  </div>
</Link>
<button
  className="mobile-menu-btn"
  onClick={() => setMenuOpen(!menuOpen)}
  aria-label="Toggle navigation"
>
  ☰
</button>

        <nav className={`links ${menuOpen ? "mobile-open" : ""}`}>

  <Link href="/about" onClick={() => setMenuOpen(false)}>
    About
  </Link>

  <Link href="/services" onClick={() => setMenuOpen(false)}>
    Services
  </Link>

  <Link href="/projects" onClick={() => setMenuOpen(false)}>
    Projects
  </Link>

  <Link href="/gallery" onClick={() => setMenuOpen(false)}>
    Gallery
  </Link>

  <Link href="/vastu" onClick={() => setMenuOpen(false)}>
    Vastu
  </Link>

  <Link href="/civil-supplies" onClick={() => setMenuOpen(false)}>
    Civil Supplies
  </Link>

  <Link href="/contact" onClick={() => setMenuOpen(false)}>
    Contact
  </Link>

  <Link
    href="/estimation"
    className="btn"
    onClick={() => setMenuOpen(false)}
  >
    Estimate Cost
  </Link>

</nav>

      </div>
    </header>
  );
}