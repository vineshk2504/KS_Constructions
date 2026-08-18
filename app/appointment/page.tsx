"use client";

import { useState } from "react";

export default function AppointmentPage() {
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    projectType: "",
    location: "",
    budget: "",
    date: "",
  });

  const [success, setSuccess] = useState(false);

  const timeSlots = [
    "10:00 AM",
    "11:30 AM",
    "2:00 PM",
    "4:30 PM",
    "5:30 PM",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (
    !formData.name ||
    !formData.phone ||
    !formData.email ||
    !formData.projectType ||
    !formData.location ||
    !formData.budget ||
    !formData.date ||
    !selectedTime
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    setSuccess(false);

    const response = await fetch("/api/appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ...formData,
        time: selectedTime,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Appointment error:", result);
      alert("Unable to send appointment. Please try again.");
      return;
    }

    console.log("Appointment sent:", result);

    setSuccess(true);

    setFormData({
      name: "",
      phone: "",
      email: "",
      projectType: "",
      location: "",
      budget: "",
      date: "",
    });

    setSelectedTime("10:00 AM");
  } catch (error) {
    console.error("Error:", error);

    alert("Something went wrong. Please try again.");
  }
};

  return (
    <main className="appointment-page">
      <div className="appointment-wrapper">

        {/* LEFT SIDE */}
        <section className="appointment-info">
          <div className="appointment-info-content">
            <p className="appointment-label">CONSULT WITH EXPERTS</p>

            <h1>
              Plan Your
              <br />
              Dream Project
            </h1>

            <p className="appointment-description">
              Schedule a free consultation with our construction experts and
              take the first step towards building excellence.
            </p>

            <div className="appointment-benefits">
              <div>
                <span>✓</span>
                <p>
                  <strong>Free Initial Consultation</strong>
                  <small>Get expert advice at no cost.</small>
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  <strong>Expert Project Guidance</strong>
                  <small>Personalized solutions for your needs.</small>
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  <strong>No Obligation</strong>
                  <small>You decide, we help build your dreams.</small>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <form className="appointment-form" onSubmit={handleSubmit}>

          <div className="form-section">
            <h3>
              <span>01</span> Your Details
            </h3>

            <div className="form-grid three">
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <span>02</span> Project Details
            </h3>

            <div className="form-grid three">
              <div>
                <label>Project Type</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                >
                  <option value="">Select project type</option>
                  <option value="New Home Construction">
                    New Home Construction
                  </option>
                  <option value="Commercial Construction">
                    Commercial Construction
                  </option>
                  <option value="Renovation">Renovation</option>
                  <option value="Architecture & Planning">
                    Architecture & Planning
                  </option>
                  <option value="Civil Supplies">Civil Supplies</option>
                  <option value="Vastu Consultation">
                    Vastu Consultation
                  </option>
                </select>
              </div>

              <div>
                <label>Project Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter project location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Approximate Budget</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                >
                  <option value="">Select budget range</option>
                  <option value="Below ₹10 Lakhs">Below ₹10 Lakhs</option>
                  <option value="₹10L – ₹25L">₹10L – ₹25L</option>
                  <option value="₹25L – ₹50L">₹25L – ₹50L</option>
                  <option value="₹50L – ₹1 Crore">₹50L – ₹1 Crore</option>
                  <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <span>03</span> Schedule
            </h3>

            <div className="date-field">
              <label>Preferred Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <label className="time-label">Available Time Slots</label>

            <div className="time-slots">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={selectedTime === time ? "selected" : ""}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button className="confirm-appointment" type="submit">
            Confirm Appointment
          </button>

          {success && (
            <div className="appointment-success">
              ✓ Your appointment has been booked successfully.
              <br />
              We will contact you soon to confirm the consultation.
            </div>
          )}

        </form>
      </div>
    </main>
  );
}