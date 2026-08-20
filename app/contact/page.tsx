import AppointmentForm from "../../components/AppointmentForm";

export default function ContactPage() {
  return (
    <main className="contact-page">

      {/* CONTACT HERO */}
      <section className="contact-hero">
        <div className="contact-hero-overlay">
          <div className="contact-hero-content">
            <span>GET IN TOUCH</span>

            <h1>Contact Us</h1>

            <p>
              We're here to help you build your dream.
              <br />
              Reach out to us for consultations, estimates
              <br />
              and any queries.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="contact-main">

        {/* LEFT SIDE */}
        <div className="contact-info-card">
          <h2>Contact Information</h2>

          <div className="contact-gold-line"></div>

          <div className="contact-item">
            <div className="contact-icon">☎</div>
            <div>
              <h3>Phone</h3>
              <p>+91 XXXXX XXXXX</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">✉</div>
            <div>
              <h3>Email</h3>
              <p>info@ksconstructions.com</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">⌖</div>
            <div>
              <h3>Office Address</h3>
              <p>
                KS Constructions
                <br />
                Hyderabad, Telangana
                <br />
                India
              </p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">◷</div>
            <div>
              <h3>Business Hours</h3>
              <p>
                Monday - Saturday
                <br />
                9:00 AM - 6:00 PM
              </p>
              <small>Sunday - Closed</small>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">◉</div>
            <div>
              <h3>WhatsApp</h3>
              <p>Chat with our construction team</p>
            </div>
          </div>

          <div className="contact-help-box">
            <h3>Need Immediate Assistance?</h3>
            <p>
              Call or WhatsApp us. We typically reply within minutes.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="contact-appointment-card">
  <span className="contact-small-title">
    FREE CONSULTATION
  </span>

  <h2>Book an Appointment</h2>

  <p>
    Schedule a free consultation with our construction experts.
  </p>

  <AppointmentForm />
</div>

      </section>

    </main>
  );
}