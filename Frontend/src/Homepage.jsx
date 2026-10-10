import React, { useEffect, useState } from "react";
import AccountMenu from "./AccountMenu.jsx";
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check,
  ChevronDown, Code2, Facebook, Instagram, Linkedin, MapPin, Menu,
  Play, X, Mail, Headphones, Sparkles
} from "lucide-react";

const media = [
  {
    type: "image",
    src: import.meta.env.VITE_CLOUDINARY_HERO_IMAGE || "",
    eyebrow: "YOUR NEXT CHAPTER STARTS HERE",
    title: "Turn interview anxiety into confidence.",
    description: "Practice smarter, build real skills, and walk into your next interview ready to shine.",
    cta: "Start your journey"
  },
  {
    type: "video",
    src: import.meta.env.VITE_CLOUDINARY_HERO_VIDEO || "",
    eyebrow: "PRACTICE WITH PURPOSE",
    title: "Make every practice session count.",
    description: "Build consistency with a learning experience designed to help you get interview-ready.",
    cta: "Explore PrepX"
  },
  {
    type: "image",
    src: "",
    eyebrow: "LEARN. PRACTICE. GROW.",
    title: "Your goals deserve a game plan.",
    description: "Explore interview preparation resources and take the next step toward your career goals.",
    cta: "Discover more"
  }
];

const menuGroups = [
  {
    label: "Prepare",
    items: [
      ["Technical Interviews", "#technical-interviews"],
      ["HR Interview Practice", "#hr-practice"],
      ["Aptitude & Reasoning", "#aptitude"],
      ["Resume Preparation", "#resume"],
      ["Communication Skills", "#communication"]
    ]
  },
  {
    label: "Practice",
    items: [
      ["Mock Interviews", "#mock-interviews"],
      ["Coding Challenges", "#coding"],
      ["Question Bank", "#question-bank"],
      ["Company Preparation", "#companies"],
      ["Daily Practice", "#daily-practice"]
    ]
  },
  {
    label: "Resources",
    items: [
      ["Learning Roadmaps", "#roadmaps"],
      ["Interview Guides", "#guides"],
      ["Career Tips", "#career-tips"],
      ["Success Stories", "#success-stories"],
      ["About PrepX", "#about"]
    ]
  }
];

const founders = [
  {
    name: "Founder One",
    role: "Co-Founder · Product & Learning",
    image: import.meta.env.VITE_CLOUDINARY_FOUNDER_ONE || "",
    initials: "F1",
    bio: "Driven by a belief that preparation should be accessible, practical, and empowering. Add your founder's story, experience, and vision here."
  },
  {
    name: "Founder Two",
    role: "Co-Founder · Technology & Community",
    image: import.meta.env.VITE_CLOUDINARY_FOUNDER_TWO || "",
    initials: "F2",
    bio: "Focused on building tools that make career preparation feel clearer and more achievable. Replace this text with your co-founder's background and mission."
  }
];

function Brand() {
  return (
    <a className="brand" href="/" aria-label="PrepX home">
      <span className="brand-mark"><Code2 size={23} strokeWidth={2.6} /></span>
      <span className="brand-copy">
        <strong>Prep<span>X</span></strong>
        <small>Your Interview, OUR Platform</small>
      </span>
    </a>
  );
}

export function Navbar({ onGetStarted, showMenus = true }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = Boolean(sessionStorage.getItem("prepx_token"));

  useEffect(() => {
    if (!showMenus) return undefined;
    const close = (event) => {
      if (!event.target.closest(".nav-menu")) setOpenMenu(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showMenus]);

  return (
    <header className="site-header">
      <nav className={`navbar container ${showMenus ? "" : "navbar-simple"}`} aria-label="Main navigation">
        <Brand />
        {showMenus && (
          <button className="mobile-toggle icon-button" onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        )}
        <div className={`nav-right ${mobileOpen ? "nav-right-open" : ""}`}>
          {showMenus && (
            <div className="nav-menus">
              {menuGroups.map((group) => (
                <div className="nav-menu" key={group.label}>
                  <button className={`nav-trigger ${openMenu === group.label ? "active" : ""}`}
                    onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                    aria-expanded={openMenu === group.label}>
                    {group.label}<ChevronDown size={15} />
                  </button>
                  {openMenu === group.label && (
                    <div className="dropdown">
                      <div className="dropdown-heading">{group.label} with PrepX</div>
                      {group.items.map(([label, href], index) => (
                        <a key={label} href={href} onClick={() => { setOpenMenu(null); setMobileOpen(false); }}>
                          <span className="dropdown-number">0{index + 1}</span>{label}<ArrowUpRight size={14} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isLoggedIn ? (
            <AccountMenu showDashboard />
          ) : (
            <button className="button button-primary nav-cta" onClick={onGetStarted}>
              Get Started <ArrowUpRight size={16} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

function MediaSlider({ onGetStarted }) {
  const [index, setIndex] = useState(0);
  const slide = media[index];
  const move = (direction) => setIndex((current) => (current + direction + media.length) % media.length);

  return (
    <section className="hero container" id="home">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> {slide.eyebrow}</div>
        <h1>{slide.title.split(" ").map((word, i) =>
          ["confidence.", "count.", "plan."].includes(word)
            ? <span key={i} className="gradient-text"> {word}</span>
            : <span key={i}>{i ? " " : ""}{word}</span>
        )}</h1>
        <p>{slide.description}</p>
        <div className="hero-actions">
          <button className="button button-primary" onClick={onGetStarted}>{slide.cta}<ArrowUpRight size={17} /></button>
          <a className="text-link" href="#about">Meet PrepX <ArrowDownRight size={16} /></a>
        </div>
        <div className="hero-proof">
          <div className="proof-avatars"><span>A</span><span>D</span><span>P</span></div>
          <div><strong>Built for your next step</strong><small>Learn at your pace. Grow with purpose.</small></div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="visual-glow" />
        <div className="visual-card">
          {slide.src ? (
            slide.type === "video" ? (
              <video key={slide.src} className="slide-media" src={slide.src} controls playsInline
                poster={import.meta.env.VITE_CLOUDINARY_HERO_IMAGE || undefined}>
                Your browser does not support embedded video.
              </video>
            ) : <img key={slide.src} className="slide-media" src={slide.src} alt="PrepX learning preview" />
          ) : (
            <div className={`media-placeholder ${slide.type === "video" ? "video-placeholder" : ""}`}>
              <div className="placeholder-orbit orbit-one" />
              <div className="placeholder-orbit orbit-two" />
              <div className="placeholder-core">{slide.type === "video" ? <Play size={30} fill="currentColor" /> : <Code2 size={40} />}</div>
              <span className="placeholder-tag">{slide.type === "video" ? "YOUR VIDEO GOES HERE" : "YOUR VISUAL GOES HERE"}</span>
              <small>Connect your Cloudinary URL in <code>.env</code></small>
            </div>
          )}
          {/* <div className="visual-caption"><span className="caption-icon"><Sparkles size={16} /></span></div> */}
        </div>
        <div className="floating-note note-top"><span className="note-check"><Check size={15} /></span><span><strong>Practice with purpose</strong><small>One step closer to your goal</small></span></div>
        <div className="floating-note note-bottom"><span className="note-play"><Play size={14} fill="currentColor" /></span><span><strong>Learn. Practice. Repeat.</strong><small>Your future starts today.</small></span></div>
        <div className="slider-controls">
          <span className="slide-count">0{index + 1}<span> / 0{media.length}</span></span>
          <div className="slide-dots" aria-label="Choose slide">
            {media.map((item, i) => <button key={i} className={index === i ? "dot active" : "dot"} aria-label={`Show slide ${i + 1}`} onClick={() => setIndex(i)} />)}
          </div>
          <div className="slide-arrows"><button aria-label="Previous slide" onClick={() => move(-1)}><ArrowLeft size={17} /></button><button aria-label="Next slide" onClick={() => move(1)}><ArrowRight size={17} /></button></div>
        </div>
      </div>
    </section>
  );
}

function Founders() {
  return (
    <section className="founders-section section-pad" id="about">
      <div className="container">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot" /> THE PEOPLE BEHIND PREPX</div><h2>Built with purpose.<br /><span className="gradient-text">Made for your potential.</span></h2></div>
          <p>We believe great opportunities begin with the confidence to prepare. Get to know the people building your practice space.</p>
        </div>
        <div className="founder-grid">
          {founders.map((founder, index) => (
            <article className="founder-card" key={founder.name}>
              <div className="founder-photo">
                {founder.image ? <img src={founder.image} alt={founder.name} /> : <div className="founder-placeholder"><span>{founder.initials}</span><small>Founder photo</small></div>}
                <span className="founder-index">0{index + 1}</span>
              </div>
              <div className="founder-details">
                <div className="founder-role">{founder.role}</div>
                <h3>{founder.name}</h3>
                <p>{founder.bio}</p>
                <a className="round-link" href="#contact" aria-label={`Learn more about ${founder.name}`}><ArrowUpRight size={19} /></a>
              </div>
            </article>
          ))}
        </div>
        <div className="learn-more">
          <div><span className="learn-icon"><Sparkles size={18} /></span><span><strong>Curious about our mission?</strong><small>Discover the story and vision behind PrepX.</small></span></div>
          <a className="button button-outline" href="/about">Learn More <ArrowUpRight size={16} /></a>
        </div>
      </div>
    </section>
  );
}

function TermsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
        <div className="modal-head"><div><div className="eyebrow"><span className="eyebrow-dot" /> THE DETAILS</div><h2 id="terms-title">Terms & Conditions</h2></div><button className="icon-button modal-close" onClick={onClose} aria-label="Close terms"><X /></button></div>
        <div className="terms-content">
          <p className="terms-intro">Welcome to PrepX. Please replace this sample text with your final terms before publishing your website.</p>
          <h3>1. Using PrepX</h3><p>Use the platform lawfully and respectfully. You are responsible for the information you submit and for keeping any account credentials secure.</p>
          <h3>2. Learning content</h3><p>Practice material is provided for educational purposes. Outcomes depend on many factors and are not guaranteed.</p>
          <h3>3. Intellectual property</h3><p>Unless stated otherwise, PrepX branding and original content may not be copied or redistributed without permission.</p>
          <h3>4. Availability and updates</h3><p>We may update, improve, or temporarily suspend parts of the platform. We will update this section with your final policy details.</p>
          <h3>5. Contact</h3><p>For questions about these terms, contact <a href="mailto:hello@prepx.example">hello@prepx.example</a>.</p>
          <div className="terms-warning">Template only — this is not legal advice. Have your final terms reviewed before launch.</div>
        </div>
        <button className="button button-primary modal-done" onClick={onClose}>I understand <Check size={16} /></button>
      </section>
    </div>
  );
}

function Footer({ onTerms }) {
  return (
    <footer className="site-footer" id="contact">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand-column"><Brand /><p>Your next opportunity doesn't have to feel out of reach. Prepare with purpose, one step at a time.</p>
            <div className="social-links">
              <a href="#" aria-label="Instagram — add your profile URL" title="Add your Instagram URL"><Instagram /></a>
              <a href="#" aria-label="Facebook — add your profile URL" title="Add your Facebook URL"><Facebook /></a>
              <a href="#" aria-label="LinkedIn — add your profile URL" title="Add your LinkedIn URL"><Linkedin /></a>
            </div>
          </div>    
          <div className="footer-column contact-column"><h4>Get in touch</h4><a href="mailto:diptendum10@gmail.com"><Mail size={16}/>diptendum10@gmail.com</a><a href="mailto:ashk07760@gmail.com"><Mail size={16}/>ashk07760@gmail.com</a><a href="tel:8649813532"><Headphones size={16} />8649813532</a><a href="tel:7439427996"><Headphones size={16} />7439427996</a></div>
          <div className="map-placeholder"><MapPin size={25} /><span>Mouza, Balarampur, Baruipur, Beralia, West Bengal 743610</span><a href="https://maps.app.goo.gl/isZVexkmh2GTDtCz8?g_st=aw" target="_blank" rel="noreferrer">Open Google Maps <ArrowUpRight size={14} /></a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} PrepX. All rights reserved.</span><button className="terms-link" onClick={onTerms}>Terms & Conditions <ArrowUpRight size={14} /></button></div>
      </div>
    </footer>
  );
}

export default function App() {
  const [termsOpen, setTermsOpen] = useState(false);
  const closeTerms = () => setTermsOpen(false);
  const handleGetStarted = () => {
    window.location.href = sessionStorage.getItem("prepx_token")
      ? "/dashboard"
      : "/login";
  };

  return (
    <>
      <Navbar onGetStarted={handleGetStarted} />
      <main><MediaSlider onGetStarted={handleGetStarted} /><Founders /></main>
      <Footer onTerms={() => setTermsOpen(true)} />
      <TermsModal open={termsOpen} onClose={closeTerms} />
    </>
  );
}
