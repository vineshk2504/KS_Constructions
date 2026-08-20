"use client";

import { useState } from "react";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("General Enquiry");

  const phoneNumber = "+919397936369";

  const services = [
    {
      name: "New Home Construction",
      icon: "🏠",
      message:
        "Hi KS Constructions, I visited your website and I’m interested in building a new home. Please share more details about your construction process and next steps.",
    },
    {
      name: "Renovation & Remodeling",
      icon: "🛠",
      message:
        "Hi KS Constructions, I visited your website and I’m interested in renovation and remodeling services. Please share more details and the next steps.",
    },
    {
      name: "Commercial Construction",
      icon: "🏢",
      message:
        "Hi KS Constructions, I visited your website and I’m interested in commercial construction services. Please share more details and the next steps.",
    },
    {
      name: "Project Estimate",
      icon: "📋",
      message:
        "Hi KS Constructions, I visited your website and I’m interested in getting a project estimate. Please share the next steps.",
    },
    {
      name: "General Enquiry",
      icon: "💬",
      message:
        "Hi KS Constructions, I visited your website and would like to know more about your construction services.",
    },
  ];

  const selected = services.find(
    (service) => service.name === selectedService
  );

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
  selected?.message || ""
)}`;

  return (
    <div className="whatsapp-container">
      {open && (
        <div className="whatsapp-popup">
          <div className="whatsapp-header">
            <div>
              <strong>KS Constructions</strong>
              <span>● Typically replies quickly</span>
            </div>

            <button
              className="whatsapp-close"
              onClick={() => setOpen(false)}
              aria-label="Close WhatsApp chat"
            >
              ×
            </button>
          </div>

          <div className="whatsapp-body">
            <div className="whatsapp-message">
              <strong>Welcome to KS Constructions 👋</strong>

              <p>
                Building your dream starts with the right conversation.
              </p>

              <p>How can we help you today?</p>

              <div className="whatsapp-options">
                {services.map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    className={`whatsapp-option ${
                      selectedService === service.name ? "selected" : ""
                    }`}
                    onClick={() => setSelectedService(service.name)}
                  >
                    <span className="whatsapp-option-icon">
                      {service.icon}
                    </span>

                    <span>{service.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-chat-button"
            >
              Continue on WhatsApp
            </a>

            <p className="whatsapp-privacy">
              🔒 We respect your privacy
            </p>
          </div>
        </div>
      )}

      <button
        className="whatsapp-floating-button"
        onClick={() => setOpen(!open)}
        aria-label="Chat with KS Constructions on WhatsApp"
      >
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.04 2.003c-7.72 0-14 6.28-14 14 0 2.47.65 4.88 1.88 7L2 30l7.17-1.88A13.9 13.9 0 0 0 16.04 30c7.72 0 14-6.28 14-14s-6.28-13.997-14-13.997zm0 25.63c-2.12 0-4.2-.57-6.02-1.65l-.43-.25-4.25 1.11 1.13-4.14-.28-.44a11.57 11.57 0 0 1-1.78-6.26c0-6.41 5.22-11.63 11.63-11.63S27.67 9.59 27.67 16s-5.22 11.63-11.63 11.63zm6.38-8.71c-.35-.18-2.07-1.02-2.39-1.14-.32-.12-.55-.18-.78.18-.23.35-.9 1.14-1.1 1.37-.2.23-.41.26-.76.09-.35-.18-1.48-.55-2.82-1.74-1.04-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.41.53-.61.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.18-.78-1.89-1.07-2.59-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.61.09-.93.44-.32.35-1.22 1.19-1.22 2.91s1.25 3.38 1.43 3.61c.18.23 2.46 3.76 5.96 5.27.83.36 1.48.57 1.99.73.84.27 1.6.23 2.2.14.67-.1 2.07-.85 2.36-1.66.29-.82.29-1.52.2-1.66-.09-.15-.32-.23-.67-.41z" />
        </svg>
      </button>
    </div>
  );
}
