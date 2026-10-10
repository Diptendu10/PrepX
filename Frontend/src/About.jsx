
import React from "react";
import { Navbar } from "./Homepage.jsx";

function About() {
  return (
    <>
    <Navbar showMenus={false} onGetStarted={() => { window.location.href = "/login"; }} />
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <p>ABOUT PrepX</p>
        <h1>
          Your Interview,
          <br />
          Our Platform.
        </h1>
        <p>
          PrepX is an interview practice platform designed to help
          students and job seekers prepare with confidence, improve
          their skills, and take the next step in their careers.
        </p>
      </section>

      {/* Who We Are */}
      <section className="about-intro">
        <h2>Who We Are</h2>
        <p>
          We believe that every aspiring professional deserves the
          opportunity to prepare, practice, and perform at their best.
          PrepX provides a space where learners can build confidence,
          strengthen their communication, and prepare for real-world
          interview experiences.
        </p>
      </section>

      {/* Mission and Vision */}
      <section className="about-values">
        <article className="value-card">
          <h2>Our Mission</h2>
          <p>
            To make interview preparation accessible, practical, and
            effective for everyone by helping learners develop the
            skills and confidence needed to succeed.
          </p>
        </article>

        <article className="value-card">
          <h2>Our Vision</h2>
          <p>
            To become a trusted platform where students and
            professionals can prepare for opportunities, discover
            their strengths, and achieve their career goals.
          </p>
        </article>
      </section>

      {/* What We Offer */}
      <section className="about-offer">
        <h2>What We Offer</h2>

        <div className="offer-list">
          <article>
            <h3>Interview Practice</h3>
            <p>
              Practice answering interview questions and become more
              comfortable with the interview process.
            </p>
          </article>

          <article>
            <h3>Technical Preparation</h3>
            <p>
              Strengthen your technical knowledge and prepare for
              subject-specific and coding interviews.
            </p>
          </article>

          <article>
            <h3>Communication Skills</h3>
            <p>
              Work on expressing your thoughts clearly and presenting
              yourself professionally.
            </p>
          </article>

          <article>
            <h3>Career Confidence</h3>
            <p>
              Prepare with purpose, recognize your progress, and
              approach new opportunities with confidence.
            </p>
          </article>
        </div>
      </section>

      {/* Our Approach */}
      <section className="about-approach">
        <h2>Practice Today. Perform Tomorrow.</h2>
        <p>
          Every interview is an opportunity to learn. PrepX encourages
          continuous improvement through preparation, practice, and
          self-confidence.
        </p>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <h2>Your Next Opportunity Starts Here.</h2>
        <p>
          Take the first step toward becoming a more confident
          interview candidate.
        </p>

        <a href="/login">Get Started</a>
      </section>
    </main>
    </>
  );
}

export default About;