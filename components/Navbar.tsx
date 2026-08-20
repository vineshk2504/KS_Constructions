import Link from "next/link";

export default function Navbar() {
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

        <nav className="links">
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/vastu">Vastu</Link>
          <Link href="/civil-supplies">Civil Supplies</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/estimation" className="btn">
            Estimate Cost
          </Link>
        </nav>

      </div>
    </header>
  );
}