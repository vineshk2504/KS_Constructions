"use client";

import { useMemo, useState } from "react";

/* ---------------------------------------------------------------------- */
/* Calculator data                                                        */
/* ---------------------------------------------------------------------- */

const TIERS = {
  tier1: {
    label: "Basic — Essential Specifications",
    shortLabel: "Basic",
    description: "Standard materials and workmanship, no upgrades.",
    ratePerSqft: 1800,
  },
  tier2: {
    label: "Classic — Standard Upgrades",
    shortLabel: "Classic",
    description: "Better fittings, tiling and finish quality.",
    ratePerSqft: 2000,
  },
  tier3: {
    label: "Premium — Elevated Finishes",
    shortLabel: "Premium",
    description: "Premium brands, finishes and fixtures throughout.",
    ratePerSqft: 2200,
  },
  tier4: {
    label: "Royale — Signature Specifications",
    shortLabel: "Royale",
    description: "Top-tier materials, designer fittings and luxury finishes.",
    ratePerSqft: 2500,
  },
};

const CITIES = {
  hyderabad: { label: "Hyderabad", multiplier: 1.0 },
  bengaluru: { label: "Bengaluru", multiplier: 1.08 },
  chennai: { label: "Chennai", multiplier: 1.05 },
  mysuru: { label: "Mysuru", multiplier: 0.95 },
  delhi_ncr: { label: "Delhi NCR", multiplier: 1.1 },
};

const AREAS = {
  standard: { label: "Standard area", multiplier: 1.0 },
  high_cost: { label: "High-cost / premium locality", multiplier: 1.15 },
};

const FLOORS = {
  g0: { label: "G+0 (Single floor)", levels: 1 },
  g1: { label: "G+1", levels: 2 },
  g2: { label: "G+2", levels: 3 },
  g3: { label: "G+3", levels: 4 },
  g4plus: { label: "G+4 & above", levels: 5 },
};

const RANGE_VARIANCE = 0.08;

/* Placeholder trust stats — replace with real company figures. */
const STATS = [
  { value: "500+", label: "Homes Built" },
  { value: "1,000+", label: "Quality Checks Completed" },
  { value: "50+", label: "Areas Served" },
];

/* Materials comparison — illustrative specification tiers, replace with your actual supplier list. */
const MATERIALS = [
  { category: "Steel (TMT Bars)", tier1: "ISI-marked, standard grade", tier2: "Branded Fe500 grade", tier3: "Premium branded Fe500D grade", tier4: "Premium branded Fe550D grade" },
  { category: "Cement", tier1: "OPC 43 grade, standard brand", tier2: "OPC 43 grade, reputed brand", tier3: "OPC 53 / PPC, reputed brand", tier4: "OPC 53 / PPC, premium brand" },
  { category: "Flooring — Living & Dining", tier1: "Vitrified tiles, up to ₹45/sqft", tier2: "Vitrified tiles, up to ₹70/sqft", tier3: "Vitrified tiles or granite, up to ₹110/sqft", tier4: "Marble or premium vitrified, up to ₹150/sqft" },
  { category: "Flooring — Bedrooms & Kitchen", tier1: "Ceramic tiles, up to ₹40/sqft", tier2: "Vitrified tiles, up to ₹60/sqft", tier3: "Vitrified tiles, up to ₹90/sqft", tier4: "Vitrified tiles, up to ₹120/sqft" },
  { category: "Bathroom (CP) Fittings", tier1: "ISI-marked", tier2: "Branded, mid-range", tier3: "Branded, premium range", tier4: "Luxury branded" },
  { category: "Main Door", tier1: "Flush door with laminate", tier2: "Flush door with veneer", tier3: "Engineered wood door", tier4: "Solid wood door" },
  { category: "Windows", tier1: "Aluminium, powder-coated", tier2: "UPVC, standard profile", tier3: "UPVC, premium profile", tier4: "UPVC, premium profile with double glazing option" },
  { category: "Interior Painting", tier1: "Distemper", tier2: "Premium emulsion", tier3: "Luxury emulsion", tier4: "Luxury emulsion with textured finish option" },
  { category: "Electrical Switches & Sockets", tier1: "Standard, ISI-marked", tier2: "Branded modular", tier3: "Premium branded modular", tier4: "Designer branded modular" },
  { category: "Water Storage (Overhead + Sump)", tier1: "1000L + 4000L", tier2: "1500L + 5000L", tier3: "2000L + 6000L", tier4: "2500L + 8000L" },
];

const FAQS = [
  {
    q: "What is a house construction cost calculator?",
    a: "It's a tool that gives you an instant, package-wise estimate of what your home will cost to build, based on your plot size, built-up area, floors, city and the finish quality you choose.",
  },
  {
    q: "How accurate is this estimate?",
    a: "This is a preliminary estimate meant for early budgeting. Your final cost depends on the actual site condition, soil type, design complexity, structural requirements and material choices, which we assess during a site visit.",
  },
  {
    q: "What's included in each package tier?",
    a: "Each tier — Basic, Classic, Premium and Royale — specifies the brand and quality level of steel, cement, flooring, fittings, doors, windows, paint and electrical components used in your build. See the comparison table above for details.",
  },
  {
    q: "Why does construction cost vary by city?",
    a: "Labour rates, material transport costs and local regulatory requirements differ from city to city, which is why we apply a city-specific adjustment on top of the base rate.",
  },
  {
    q: "What's the difference between plot area and built-up area?",
    a: "Plot area is the total size of your land. Built-up area is the actual constructed floor area, which is smaller than the plot area once you account for setbacks, FAR/FSI limits and local regulations.",
  },
  {
    q: "Can I get a detailed, itemised quote after this estimate?",
    a: "Yes — use \"Send Estimate by Email/SMS\" above or request a callback below, and our team will follow up with a detailed, line-item quote for your specific project.",
  },
];

function formatINR(amount) {
  if (!isFinite(amount) || amount <= 0) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

/* ---------------------------------------------------------------------- */
/* Page                                                                    */
/* ---------------------------------------------------------------------- */

export default function Page() {
  const [plotWidth, setPlotWidth] = useState("30");
  const [plotLength, setPlotLength] = useState("40");
  const [builtUpPerFloor, setBuiltUpPerFloor] = useState("1200");
  const [floorKey, setFloorKey] = useState("g1");
  const [tier, setTier] = useState("tier2");
  const [city, setCity] = useState("hyderabad");
  const [area, setArea] = useState("standard");

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [showSendForm, setShowSendForm] = useState(false);

  const [faqOpen, setFaqOpen] = useState(null);

  const [advisorName, setAdvisorName] = useState("");
  const [advisorPhone, setAdvisorPhone] = useState("");
  const [advisorLocation, setAdvisorLocation] = useState("hyderabad");
  const [advisorErrors, setAdvisorErrors] = useState({});
  const [advisorStatus, setAdvisorStatus] = useState("idle");

  const plotArea = useMemo(() => {
    const w = parseFloat(plotWidth);
    const l = parseFloat(plotLength);
    return w > 0 && l > 0 ? w * l : 0;
  }, [plotWidth, plotLength]);

  const floors = FLOORS[floorKey].levels;

  const totalBuiltUpArea = useMemo(() => {
    const perFloor = parseFloat(builtUpPerFloor);
    return perFloor > 0 && floors > 0 ? perFloor * floors : 0;
  }, [builtUpPerFloor, floors]);

  const effectiveMultiplier = (cityKey, areaKey) =>
    CITIES[cityKey].multiplier * AREAS[areaKey].multiplier;

  const effectiveRate = (tierKey, cityKey = city, areaKey = area) =>
    Math.round(TIERS[tierKey].ratePerSqft * effectiveMultiplier(cityKey, areaKey));

  const costForTier = (tierKey) => {
    return totalBuiltUpArea * effectiveRate(tierKey);
  };

  const selectedCost = useMemo(() => costForTier(tier), [totalBuiltUpArea, tier, city, area]);

  const costRange = useMemo(() => {
    return {
      low: selectedCost * (1 - RANGE_VARIANCE),
      high: selectedCost * (1 + RANGE_VARIANCE),
    };
  }, [selectedCost]);

  const validate = () => {
    const next = {};
    if (!leadName.trim()) next.name = "Enter your name.";
    if (!isValidPhone(leadPhone)) next.phone = "Enter a valid 10-digit mobile number.";
    if (leadEmail.trim() && !isValidEmail(leadEmail)) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendEstimate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== "undefined") window.print();
  };

  const validateAdvisor = () => {
    const next = {};
    if (!advisorName.trim()) next.name = "Enter your name.";
    if (!isValidPhone(advisorPhone)) next.phone = "Enter a valid 10-digit mobile number.";
    setAdvisorErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAdvisorSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdvisor()) return;
    setAdvisorStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setAdvisorStatus("success");
    } catch {
      setAdvisorStatus("error");
    }
  };

  return (
    <main className="ks-page">
      <p className="brand-eyebrow">KS CONSTRUCTIONS</p>
      <h1 className="page-title">Construction Estimation Calculator</h1>
      <p className="page-sub">
        Estimate project cost using plot size, built-up area, floors and construction quality.
      </p>

      <div className="stats-bar">
        {STATS.map((s) => (
          <div key={s.label} className="stat-chip">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="estimator-grid">
        <div className="card">
          <h2 className="calc-card-title">Project Details</h2>

          <div>
            <label htmlFor="plotWidth" className="field-label">
              Plot Size (ft)
            </label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                id="plotWidth"
                type="number"
                min={0}
                value={plotWidth}
                onChange={(e) => setPlotWidth(e.target.value)}
                placeholder="Width"
                aria-label="Plot width in feet"
                className="text-input"
              />
              <span aria-hidden="true">×</span>
              <input
                id="plotLength"
                type="number"
                min={0}
                value={plotLength}
                onChange={(e) => setPlotLength(e.target.value)}
                placeholder="Length"
                aria-label="Plot length in feet"
                className="text-input"
              />
            </div>
            <p className="field-hint">
              Plot area: {plotArea > 0 ? `${plotArea.toLocaleString("en-IN")} sqft` : "—"}
            </p>
          </div>

          <div>
            <label htmlFor="builtUp" className="field-label">
              Built-up Area per Floor (sqft)
            </label>
            <input
              id="builtUp"
              type="number"
              min={0}
              value={builtUpPerFloor}
              onChange={(e) => setBuiltUpPerFloor(e.target.value)}
              className="text-input"
              style={{ width: "100%" }}
            />
            <p className="field-note">
              Plot area and built-up area are different — allowable built-up area depends on
              setbacks, FAR/FSI, local regulations and the specifics of your site.
            </p>
          </div>

          <div>
            <label htmlFor="floors" className="field-label">
              Floors
            </label>
            <select
              id="floors"
              value={floorKey}
              onChange={(e) => setFloorKey(e.target.value)}
              className="text-input"
              style={{ width: "100%" }}
            >
              {Object.keys(FLOORS).map((key) => (
                <option key={key} value={key}>
                  {FLOORS[key].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="field-label">
              City
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-input"
              style={{ width: "100%" }}
            >
              {Object.keys(CITIES).map((key) => (
                <option key={key} value={key}>
                  {CITIES[key].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="area" className="field-label">
              Locality Type
            </label>
            <select
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="text-input"
              style={{ width: "100%" }}
            >
              {Object.keys(AREAS).map((key) => (
                <option key={key} value={key}>
                  {AREAS[key].label}
                  {key === "high_cost" ? " (+15%)" : ""}
                </option>
              ))}
            </select>
          </div>

          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend className="field-label" style={{ marginBottom: 8 }}>
              Construction Quality
            </legend>
            <div style={{ display: "grid", gap: 10 }}>
              {Object.keys(TIERS).map((key) => (
                <label key={key} className={`tier-option ${tier === key ? "tier-option-active" : ""}`}>
                  <input type="radio" name="tier" checked={tier === key} onChange={() => setTier(key)} style={{ marginTop: 4 }} />
                  <span>
                    <span style={{ display: "block", fontWeight: 600 }}>
                      {TIERS[key].label} — ₹{effectiveRate(key)}/sqft
                    </span>
                    <span style={{ display: "block", fontSize: 13, opacity: 0.75 }}>
                      {TIERS[key].description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="card result-card">
          <p className="result-eyebrow">Estimated Construction Cost</p>
          <p className="result-figure">
            {formatINR(costRange.low)} – {formatINR(costRange.high)}
          </p>
          <p className="result-point">
            Point estimate: {formatINR(selectedCost)} at {TIERS[tier].shortLabel} tier, {CITIES[city].label} ({AREAS[area].label})
          </p>

          <div className="result-breakdown">
            <div className="result-row">
              <span>Total built-up area</span>
              <span>{totalBuiltUpArea > 0 ? `${totalBuiltUpArea.toLocaleString("en-IN")} sqft` : "—"}</span>
            </div>
            <div className="result-row">
              <span>Base rate</span>
              <span>₹{TIERS[tier].ratePerSqft}/sqft</span>
            </div>
            <div className="result-row">
              <span>City adjustment</span>
              <span>×{CITIES[city].multiplier.toFixed(2)}</span>
            </div>
            <div className="result-row">
              <span>Locality adjustment</span>
              <span>×{AREAS[area].multiplier.toFixed(2)}</span>
            </div>
            <div className="result-row">
              <span>Effective rate</span>
              <span>₹{effectiveRate(tier)}/sqft</span>
            </div>
            <div className="result-row">
              <span>Floors</span>
              <span>{FLOORS[floorKey].label}</span>
            </div>
          </div>

          <p className="field-label result-compare-label">Compare tiers at this size</p>
          <table className="tier-table">
            <thead>
              <tr>
                <th scope="col">Tier</th>
                <th scope="col">Rate in {CITIES[city].label}</th>
                <th scope="col">Est. cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(TIERS).map((key) => (
                <tr key={key} className={key === tier ? "tier-row-active" : ""}>
                  <td>{TIERS[key].shortLabel}</td>
                  <td>₹{effectiveRate(key)}</td>
                  <td>{formatINR(costForTier(key))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={handleDownloadPDF} className="primary-button" style={{ marginTop: 24, width: "100%" }}>
            Download Estimate PDF
          </button>

          <button
            type="button"
            onClick={() => setShowSendForm((v) => !v)}
            className="secondary-button"
            style={{ marginTop: 12, width: "100%" }}
            aria-expanded={showSendForm}
            aria-controls="send-estimate-form"
          >
            Send Estimate by Email/SMS
          </button>

          {showSendForm && (
            <div id="send-estimate-form" className="inline-send-form">
              {submitStatus === "success" ? (
                <p role="status" className="success-note">
                  Sent. Check your phone or inbox shortly — our team will follow up within 30 minutes.
                </p>
              ) : (
                <form onSubmit={handleSendEstimate} noValidate>
                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label htmlFor="leadName" className="field-label field-label-on-dark">
                        Name
                      </label>
                      <input
                        id="leadName"
                        type="text"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="text-input"
                        style={{ width: "100%" }}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "leadName-error" : undefined}
                      />
                      {errors.name && (
                        <p id="leadName-error" role="alert" className="field-error">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="leadPhone" className="field-label field-label-on-dark">
                        Phone Number
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span className="phone-prefix">+91</span>
                        <input
                          id="leadPhone"
                          type="tel"
                          inputMode="numeric"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="text-input"
                          style={{ flex: 1 }}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "leadPhone-error" : undefined}
                        />
                      </div>
                      {errors.phone && (
                        <p id="leadPhone-error" role="alert" className="field-error">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="leadEmail" className="field-label field-label-on-dark">
                        Email
                      </label>
                      <input
                        id="leadEmail"
                        type="email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className="text-input"
                        style={{ width: "100%" }}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "leadEmail-error" : undefined}
                      />
                      {errors.email && (
                        <p id="leadEmail-error" role="alert" className="field-error">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {submitStatus === "error" && (
                      <p role="alert" className="field-error">
                        Something went wrong sending your estimate. Please try again.
                      </p>
                    )}

                    <button type="submit" disabled={submitStatus === "submitting"} className="primary-button">
                      {submitStatus === "submitting" ? "Sending…" : "Send my estimate"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <p className="disclaimer">
            Estimate only. Actual construction cost may vary based on site conditions, design
            complexity, approvals, specifications, labor and material price fluctuations.
          </p>
        </div>
      </div>

      {/* ---------------- Materials comparison table ---------------- */}
      <section className="page-section">
        <h2 className="section-heading">What's Included in Each Package</h2>
        <p className="section-subheading">
          Specifications shown apply across cities. Rates on the calculator above already reflect
          your selected city and locality.
        </p>
        <div className="materials-table-wrap">
          <table className="materials-table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {Object.keys(TIERS).map((key) => (
                  <th key={key} scope="col" className={key === "tier2" ? "materials-top-pick" : ""}>
                    {TIERS[key].shortLabel}
                    {key === "tier2" && <span className="top-pick-badge">Top Pick</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATERIALS.map((row) => (
                <tr key={row.category}>
                  <td className="materials-row-label">{row.category}</td>
                  <td>{row.tier1}</td>
                  <td>{row.tier2}</td>
                  <td>{row.tier3}</td>
                  <td>{row.tier4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="page-section">
        <h2 className="section-heading">Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQS.map((item, i) => {
            const open = faqOpen === i;
            return (
              <div key={item.q} className={`faq-item ${open ? "faq-item-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  onClick={() => setFaqOpen(open ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon" aria-hidden="true">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <p id={`faq-panel-${i}`} className="faq-answer">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- Talk to an advisor ---------------- */}
      <section className="page-section advisor-section">
        <div className="advisor-grid">
          <div>
            <h2 className="section-heading">Talk to an Advisor</h2>
            <p className="section-subheading">
              Our advisor will call you back to walk through packages, materials and a realistic
              timeline for your build, and help you finalise a detailed budget.
            </p>
            <ul className="advisor-points">
              <li>Free, no-obligation consultation</li>
              <li>Callback within 2 working hours</li>
              <li>Itemised quote follow-up</li>
            </ul>
          </div>

          <div className="card advisor-form-card">
            {advisorStatus === "success" ? (
              <p role="status" className="success-note-dark">
                Thanks — our advisor will call you back shortly.
              </p>
            ) : (
              <form onSubmit={handleAdvisorSubmit} noValidate>
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label htmlFor="advisorName" className="field-label">Name</label>
                    <input
                      id="advisorName"
                      type="text"
                      value={advisorName}
                      onChange={(e) => setAdvisorName(e.target.value)}
                      className="text-input"
                      style={{ width: "100%" }}
                      aria-invalid={!!advisorErrors.name}
                      aria-describedby={advisorErrors.name ? "advisorName-error" : undefined}
                    />
                    {advisorErrors.name && (
                      <p id="advisorName-error" role="alert" className="field-error">
                        {advisorErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="advisorPhone" className="field-label">Phone Number</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className="phone-prefix">+91</span>
                      <input
                        id="advisorPhone"
                        type="tel"
                        inputMode="numeric"
                        value={advisorPhone}
                        onChange={(e) => setAdvisorPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="text-input"
                        style={{ flex: 1 }}
                        aria-invalid={!!advisorErrors.phone}
                        aria-describedby={advisorErrors.phone ? "advisorPhone-error" : undefined}
                      />
                    </div>
                    {advisorErrors.phone && (
                      <p id="advisorPhone-error" role="alert" className="field-error">
                        {advisorErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="advisorLocation" className="field-label">Location</label>
                    <select
                      id="advisorLocation"
                      value={advisorLocation}
                      onChange={(e) => setAdvisorLocation(e.target.value)}
                      className="text-input"
                      style={{ width: "100%" }}
                    >
                      {Object.keys(CITIES).map((key) => (
                        <option key={key} value={key}>{CITIES[key].label}</option>
                      ))}
                    </select>
                  </div>

                  {advisorStatus === "error" && (
                    <p role="alert" className="field-error">
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button type="submit" disabled={advisorStatus === "submitting"} className="primary-button">
                    {advisorStatus === "submitting" ? "Requesting…" : "Request a Callback"}
                  </button>
                  <p className="consent-note">
                    By submitting this form, I confirm that I have read and agreed to accept KS
                    Constructions' privacy policy.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --charcoal: #15151a;
          --charcoal-2: #1e1e24;
          --cream: #f8f6f1;
          --gold: #c9a227;
          --gold-light: #e4c567;
          --text-dark: #1a1a1a;
        }

        .ks-page {
          padding: 48px 24px 80px;
          max-width: 1120px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
          color: var(--text-dark);
          background: var(--cream);
        }
        .ks-page * { box-sizing: border-box; }

        .brand-eyebrow {
          font-weight: 700;
          letter-spacing: 0.15em;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0;
        }
        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 34px;
          font-weight: 600;
          margin: 8px 0 12px;
        }
        .page-sub {
          font-size: 17px;
          max-width: 720px;
          line-height: 1.6;
          opacity: 0.75;
          margin: 0;
        }

        .stats-bar {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          margin-top: 28px;
          padding: 20px 0;
          border-top: 1px solid #e6e2d8;
          border-bottom: 1px solid #e6e2d8;
        }
        .stat-chip { display: flex; flex-direction: column; }
        .stat-value { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 600; color: var(--gold); }
        .stat-label { font-size: 12.5px; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

        .estimator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
          margin-top: 36px;
        }
        .card {
          background: #fff;
          border: 1px solid #e6e2d8;
          border-radius: 12px;
          padding: 28px;
          display: grid;
          gap: 20px;
        }
        .calc-card-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        .field-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .field-hint {
          font-size: 13px;
          opacity: 0.65;
          margin-top: 6px;
        }
        .field-note {
          font-size: 12.5px;
          opacity: 0.6;
          margin-top: 6px;
          line-height: 1.5;
        }
        .field-error {
          color: #d64545;
          font-size: 13px;
          margin-top: 6px;
        }
        .text-input {
          padding: 11px 13px;
          font-size: 15px;
          border: 1px solid #d8d3c4;
          border-radius: 6px;
          font-family: inherit;
          background: #fff;
          color: var(--text-dark);
        }
        .text-input:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        .phone-prefix {
          display: flex;
          align-items: center;
          padding: 0 10px;
          border: 1px solid #d8d3c4;
          border-radius: 6px;
          font-size: 15px;
          background: #f2f0ea;
        }
        .tier-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border: 1px solid #d8d3c4;
          border-radius: 8px;
          cursor: pointer;
        }
        .tier-option-active {
          border: 2px solid var(--gold);
          background: #fffaf0;
        }
        .tier-option:focus-within {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }

        .result-card {
          background: var(--charcoal);
          color: #f5f3ee;
          border: none;
        }
        .result-eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.65;
          margin: 0;
        }
        .result-figure {
          font-family: 'Fraunces', serif;
          font-size: 38px;
          font-weight: 600;
          color: var(--gold-light);
          margin: 0;
        }
        .result-point {
          font-size: 13px;
          opacity: 0.7;
          margin: 0;
        }
        .result-breakdown {
          display: grid;
          gap: 10px;
          font-size: 14.5px;
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.12);
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .result-row {
          display: flex;
          justify-content: space-between;
          opacity: 0.9;
        }
        .result-compare-label {
          color: #f5f3ee;
          margin: 0;
        }
        .tier-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .tier-table th,
        .tier-table td {
          text-align: left;
          padding: 8px 6px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tier-table th {
          opacity: 0.6;
          font-weight: 600;
        }
        .tier-row-active {
          font-weight: 600;
          color: var(--gold-light);
        }
        .disclaimer {
          font-size: 12px;
          opacity: 0.55;
          margin: 16px 0 0;
          line-height: 1.6;
        }
        .success-note {
          font-weight: 600;
          color: var(--gold-light);
        }
        .success-note-dark {
          font-weight: 600;
          color: var(--gold);
        }

        .primary-button {
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 600;
          background: var(--gold);
          color: var(--charcoal);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }
        .primary-button:hover { background: var(--gold-light); }
        .primary-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .primary-button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

        .secondary-button {
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 600;
          background: transparent;
          color: var(--gold-light);
          border: 1px solid var(--gold-light);
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }
        .secondary-button:hover { background: rgba(228, 197, 103, 0.1); }
        .secondary-button:focus-visible { outline: 2px solid var(--gold-light); outline-offset: 2px; }

        .inline-send-form {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .field-label-on-dark { color: #f5f3ee; }

        /* Page sections */
        .page-section { margin-top: 72px; }
        .section-heading {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 10px;
        }
        .section-subheading {
          font-size: 15px;
          opacity: 0.7;
          max-width: 680px;
          line-height: 1.6;
          margin: 0 0 28px;
        }

        /* Materials table */
        .materials-table-wrap { overflow-x: auto; border: 1px solid #e6e2d8; border-radius: 12px; background: #fff; }
        .materials-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 720px; }
        .materials-table th, .materials-table td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #eee7d8; }
        .materials-table thead th { background: var(--charcoal); color: #f5f3ee; font-weight: 600; position: relative; }
        .materials-top-pick { color: var(--gold-light) !important; }
        .top-pick-badge { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold-light); margin-top: 2px; }
        .materials-row-label { font-weight: 600; }
        .materials-table tbody tr:last-child td { border-bottom: none; }

        /* FAQ */
        .faq-list { display: grid; gap: 12px; max-width: 800px; }
        .faq-item { border: 1px solid #e6e2d8; border-radius: 10px; background: #fff; overflow: hidden; }
        .faq-item-open { border-color: var(--gold); }
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: none;
          border: none;
          text-align: left;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          color: var(--text-dark);
        }
        .faq-icon { font-size: 20px; color: var(--gold); flex-shrink: 0; line-height: 1; }
        .faq-answer { padding: 0 20px 18px; font-size: 14px; line-height: 1.65; opacity: 0.75; margin: 0; }

        /* Advisor */
        .advisor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        .advisor-points { list-style: none; padding: 0; margin: 20px 0 0; display: grid; gap: 10px; font-size: 14px; }
        .advisor-points li { padding-left: 22px; position: relative; }
        .advisor-points li::before { content: "✓"; position: absolute; left: 0; color: var(--gold); font-weight: 700; }
        .advisor-form-card { background: var(--charcoal-2); border: none; }
        .advisor-form-card .field-label { color: #f5f3ee; }
        .consent-note { font-size: 11.5px; opacity: 0.55; margin: 0; line-height: 1.5; }
        .advisor-form-card .success-note-dark { color: var(--gold-light); }

        @media (max-width: 780px) {
          .estimator-grid { grid-template-columns: 1fr; }
          .advisor-grid { grid-template-columns: 1fr; }
        }
        @media print {
          form { display: none; }
        }
      `}</style>
    </main>
  );
}