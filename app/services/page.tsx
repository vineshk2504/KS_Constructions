import Link from "next/link";
import {
  Home,
  Building2,
  Hammer,
  Ruler,
  KeyRound,
  Paintbrush,
  ClipboardCheck,
  Truck,
  MessageSquare,
  MapPin,
  PencilRuler,
  FileText,
  HardHat,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    title: "Residential Construction",
    description:
      "Complete construction solutions for independent homes, villas, duplexes and residential buildings from planning to final handover.",
    icon: Home,
  },
  {
    title: "Commercial Construction",
    description:
      "Professional construction services for offices, retail spaces, warehouses and other commercial developments.",
    icon: Building2,
  },
  {
    title: "Renovation & Remodeling",
    description:
      "Transform existing spaces through structural improvements, extensions, modernization and complete remodeling.",
    icon: Hammer,
  },
  {
    title: "Architecture & Planning",
    description:
      "Thoughtful architectural planning, floor plans, space optimization and design support tailored to your requirements.",
    icon: Ruler,
  },
  {
    title: "Turnkey Projects",
    description:
      "End-to-end project execution covering design, materials, construction, quality checks and final handover.",
    icon: KeyRound,
  },
  {
    title: "Interior Design",
    description:
      "Functional and modern interior solutions designed around your lifestyle, space requirements and budget.",
    icon: Paintbrush,
  },
  {
    title: "Project Management",
    description:
      "Structured project planning, contractor coordination, quality monitoring and milestone management.",
    icon: ClipboardCheck,
  },
  {
    title: "Civil Supplies",
    description:
      "Reliable sourcing and supply of essential construction materials including cement, steel, blocks and aggregates.",
    icon: Truck,
  },
];

const process = [
  {
    number: "01",
    title: "Consultation",
    description: "We understand your vision, requirements, budget and expectations.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "Site Visit",
    description: "Our team evaluates the site and identifies project requirements.",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Design & Planning",
    description: "We prepare layouts, specifications and the project execution plan.",
    icon: PencilRuler,
  },
  {
    number: "04",
    title: "Estimation",
    description: "You receive a clear project estimate and scope before construction.",
    icon: FileText,
  },
  {
    number: "05",
    title: "Construction",
    description: "Our team executes the project with structured milestone tracking.",
    icon: HardHat,
  },
  {
    number: "06",
    title: "Handover",
    description: "Final quality inspections are completed before project delivery.",
    icon: BadgeCheck,
  },
];

const benefits = [
  {
    title: "Quality Materials",
    description:
      "We focus on reliable materials and construction practices for long-term durability.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent Pricing",
    description:
      "Clear estimates and project scope help minimize unexpected costs during construction.",
    icon: FileText,
  },
  {
    title: "On-Time Execution",
    description:
      "Projects are organized around defined phases, milestones and delivery schedules.",
    icon: Clock3,
  },
  {
    title: "Experienced Team",
    description:
      "Engineers, architects and construction professionals work together throughout the project.",
    icon: Users,
  },
  {
    title: "Quality Checks",
    description:
      "Construction quality is reviewed throughout key stages instead of only at handover.",
    icon: CheckCircle2,
  },
  {
    title: "End-to-End Support",
    description:
      "From initial planning to final handover, you have one team supporting your project.",
    icon: BadgeCheck,
  },
];

export default function ServicesPage() {
  return (
    <main>
      {/* HERO */}
      <section className="servicesHero">
        <div className="container servicesHeroContent">
          <p className="servicesEyebrow">BUILDWELL CONSTRUCTIONS</p>

          <h1>Complete Construction Solutions Under One Roof</h1>

          <p className="servicesHeroDescription">
            From the first idea to final handover, we provide dependable
            residential and commercial construction services focused on
            quality, transparency and execution.
          </p>

          <div className="servicesHeroActions">
            <Link className="servicesPrimaryBtn" href="/appointment">
              Get Free Consultation
              <ArrowRight size={18} />
            </Link>

            <Link className="servicesSecondaryBtn" href="/projects">
              Explore Our Projects
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section servicesSection">
        <div className="container">
          <div className="servicesHeading">
            <p className="servicesLabel">WHAT WE DO</p>
            <h2>Our Construction Services</h2>
            <p>
              Whether you are building a new property or improving an existing
              space, our team can support your project from planning through
              completion.
            </p>
          </div>

          <div className="servicesGrid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article className="serviceCard" key={service.title}>
                  <div className="serviceIcon">
                    <Icon size={30} strokeWidth={1.8} />
                  </div>

                  <h3>{service.title}</h3>

                  <p>{service.description}</p>

                  <Link href="/appointment" className="serviceLink">
                    Discuss Your Project
                    <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section processSection">
        <div className="container">
          <div className="servicesHeading">
            <p className="servicesLabel">OUR PROCESS</p>
            <h2>From Consultation to Handover</h2>
            <p>
              A structured construction process helps keep your project clear,
              organized and predictable.
            </p>
          </div>

          <div className="processGrid">
            {process.map((step) => {
              const Icon = step.icon;

              return (
                <div className="processCard" key={step.number}>
                  <span className="processNumber">{step.number}</span>

                  <div className="processIcon">
                    <Icon size={26} />
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section">
        <div className="container">
          <div className="servicesHeading">
            <p className="servicesLabel">WHY BUILDWELL</p>
            <h2>Built Around Quality & Trust</h2>
            <p>
              We believe successful construction requires more than materials.
              It requires communication, accountability and attention to every
              stage of the project.
            </p>
          </div>

          <div className="benefitsGrid">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div className="benefitItem" key={benefit.title}>
                  <div className="benefitIcon">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="servicesCtaSection">
        <div className="container">
          <div className="servicesCta">
            <div>
              <p className="servicesCtaLabel">START YOUR PROJECT</p>

              <h2>Planning to Build Your Dream Project?</h2>

              <p>
                Tell us about your requirements and our team will help you
                understand the next steps for your construction project.
              </p>
            </div>

            <div className="servicesCtaButtons">
              <Link className="servicesPrimaryBtn" href="/appointment">
                Book Appointment
                <ArrowRight size={18} />
              </Link>

              <Link className="servicesCtaOutline" href="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}