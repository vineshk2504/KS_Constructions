"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
const services=['Residential Construction','Commercial Construction','Renovation & Remodeling','Architecture & Planning','Civil Supplies'];
export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
  if (isPaused) return;

  const timer = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  }, 2000);

  return () => clearInterval(timer);
}, [isPaused]);

const selectSlide = (index: number) => {
  setCurrentSlide(index);
  setIsPaused(true);

  setTimeout(() => {
    setIsPaused(false);
  }, 1500);
};

  return <main><section className="hero"><div className="hero-slider">
  <div
    className="hero-slider-track"
    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
  >
    <div className="hero-slide hero-slide-1"></div>
    <div className="hero-slide hero-slide-2"></div>
    <div className="hero-slide hero-slide-3"></div>
  </div>

  <div className="hero-dots">
    {[0, 1, 2].map((index) => (
      <button
        key={index}
        className={`hero-dot ${currentSlide === index ? "active" : ""}`}
        onClick={() => selectSlide(index)}
        aria-label={`Show image ${index + 1}`}
      />
    ))}
  </div>
</div><div className="container"><p style={{color:'#f0b429'}}>PREMIUM CONSTRUCTION & DEVELOPMENT</p><h1>We Build More Than Structures. We Build Legacy.</h1><p>KS Constructions delivers high-quality residential and commercial construction with precision, modern design, and uncompromising craftsmanship.</p><div style={{display:'flex',gap:12,marginTop:28}}><Link className="btn" href="/projects">Explore Projects</Link><Link className="btn" href="/appointment">Book Appointment</Link></div></div></section><section className="section home-services"><div className="container"><p>WHAT WE DO</p><h2>Our Services</h2><div className="grid">{services.map(x=><div className="card" key={x}><h3>{x}</h3><p>Professional solutions tailored to your project requirements.</p></div>)}</div></div></section><section className="section home-planning"><div className="container"><h2>Plan Your Construction</h2><div className="grid"><div className="card"><h3>Cost Estimator</h3><p>Get an indicative construction estimate based on area and quality.</p><Link href="/estimation">Calculate →</Link></div><div className="card"><h3>Ongoing Sites</h3><p>Explore active projects and construction progress.</p><Link href="/projects/ongoing">View Sites →</Link></div></div></div></section></main>}
