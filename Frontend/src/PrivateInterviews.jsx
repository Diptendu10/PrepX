import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
Clock3,
Search,
BriefcaseBusiness,
ChevronRight,
X,
CheckCircle2,
GraduationCap,
ArrowRight,
} from "lucide-react";
import { bookPrivateInterview } from "./services/interviews.js";

const interviewCategories = [
{
id: 1,
category: "Programming & Coding",
roles: "Software Developer, Software Engineer, Java Developer, Python Developer, C/C++ Developer, Game Developer, Mobile App Developer, Blockchain Developer",
},
{
id: 2,
category: "Web Development",
roles: "Frontend Developer, Backend Developer, Full Stack Developer, Web Developer, WordPress Developer, Web Designer, PHP Developer, UI Developer",
},
{
id: 3,
category: "Database & SQL",
roles: "Database Administrator, SQL Developer, Database Engineer, Database Developer, Data Engineer, Backend Developer",
},
{
id: 4,
category: "Data Science & Analytics",
roles: "Data Analyst, Data Scientist, Business Intelligence Analyst, Research Analyst, Reporting Analyst, Statistical Analyst, Business Data Analyst",
},
{
id: 5,
category: "AI, Machine Learning & Emerging Technology",
roles: "AI Engineer, Machine Learning Engineer, Generative AI Developer, NLP Engineer, Computer Vision Engineer, Robotics Engineer, IoT Developer, AR/VR Developer, MLOps Engineer",
},
{
id: 6,
category: "Cybersecurity & Networking",
roles: "Cybersecurity Analyst, Ethical Hacker, Penetration Tester, Network Engineer, Network Administrator, Network Security Engineer, Security Engineer, SOC Analyst",
},
{
id: 7,
category: "Cloud, DevOps & System Administration",
roles: "Cloud Engineer, DevOps Engineer, AWS Engineer, Azure Engineer, System Administrator, Site Reliability Engineer, Linux Administrator, Infrastructure Engineer",
},
{
id: 8,
category: "Software Testing & QA",
roles: "QA Engineer, Software Tester, Manual Tester, Automation Tester, Test Engineer, Performance Tester, QA Analyst",
},
{
id: 9,
category: "HR & Recruitment",
roles: "HR Executive, HR Manager, HR Recruiter, Talent Acquisition Specialist, HR Generalist, HR Business Partner, Payroll Executive, HR Operations Executive",
},
{
id: 10,
category: "Sales & Business Development",
roles: "Sales Executive, Sales Manager, Business Development Executive, Business Development Manager, Inside Sales Executive, Field Sales Executive, Relationship Manager, Account Manager, Pre-Sales Consultant",
},
{
id: 11,
category: "Marketing & Digital Marketing",
roles: "Digital Marketing Executive, SEO Specialist, Social Media Manager, Content Marketing Executive, PPC Specialist, Performance Marketing Executive, Brand Manager, Email Marketing Specialist, Market Research Analyst",
},
{
id: 12,
category: "Finance & Accounting",
roles: "Accountant, Accounts Executive, Financial Analyst, Finance Manager, Chartered Accountant, Tax Consultant, Audit Executive, Accounts Payable Executive, Accounts Receivable Executive",
},
{
id: 13,
category: "Banking & Insurance",
roles: "Banking Executive, Loan Officer, Insurance Advisor, Claims Analyst, Credit Analyst, Underwriter, KYC Analyst, AML Analyst, Investment Banking Analyst, Wealth Management Executive",
},
{
id: 14,
category: "Customer Service & Support",
roles: "Customer Support Executive, Customer Care Executive, Customer Success Manager, Technical Support Engineer, Call Center Executive, Chat Support Executive, Help Desk Executive, Client Service Executive",
},
{
id: 15,
category: "Administration & Back Office",
roles: "Office Assistant, Administrative Executive, Office Administrator, Receptionist, Front Desk Executive, Data Entry Operator, Back Office Executive, MIS Executive, Personal Assistant, Executive Assistant",
},
{
id: 16,
category: "Business Analysis & Consulting",
roles: "Business Analyst, Business Consultant, Management Consultant, Strategy Analyst, Business Process Analyst, Operations Research Analyst, Functional Consultant, Research Consultant",
},
{
id: 17,
category: "Project & Product Management",
roles: "Project Manager, Project Coordinator, Product Manager, Product Owner, Program Manager, PMO Analyst, Scrum Master, Agile Project Manager",
},
{
id: 18,
category: "Mechanical & Industrial Engineering",
roles: "Mechanical Engineer, Production Engineer, Industrial Engineer, Maintenance Engineer, Design Engineer, Manufacturing Engineer, Robotics Engineer, Plant Engineer",
},
{
id: 19,
category: "Electrical & Electronics Engineering",
roles: "Electrical Engineer, Electronics Engineer, Electronics and Communication Engineer, Embedded Systems Engineer, Instrumentation Engineer, Control Systems Engineer, Automation Engineer, Power Systems Engineer",
},
{
id: 20,
category: "Civil Engineering & Construction",
roles: "Civil Engineer, Site Engineer, Structural Engineer, Architect, Construction Manager, Site Supervisor, Quantity Surveyor, CAD Designer, BIM Engineer, Estimation Engineer",
},
{
id: 21,
category: "Quality Control & Manufacturing",
roles: "Quality Control Engineer, Quality Assurance Engineer, Quality Inspector, Production Supervisor, Manufacturing Supervisor, Quality Analyst, Process Engineer, Plant Manager",
},
{
id: 22,
category: "Logistics & Supply Chain",
roles: "Logistics Executive, Supply Chain Analyst, Supply Chain Manager, Procurement Executive, Purchase Manager, Warehouse Manager, Inventory Manager, Import/Export Executive, Dispatch Executive, Fleet Manager",
},
{
id: 23,
category: "Design & Creative",
roles: "Graphic Designer, UI Designer, UX Designer, UI/UX Designer, Motion Graphics Designer, Animator, Video Editor, 3D Artist, Illustrator, Creative Director",
},
{
id: 24,
category: "Content & Communication",
roles: "Content Writer, Copywriter, Technical Writer, Editor, Proofreader, Journalist, News Reporter, Scriptwriter, Communications Executive, Public Relations Specialist",
},
{
id: 25,
category: "Education & Training",
roles: "School Teacher, College Lecturer, Private Tutor, Online Tutor, Corporate Trainer, Academic Counselor, Education Consultant, Instructional Designer, Curriculum Developer",
},
{
id: 26,
category: "Healthcare & Medical",
roles: "Doctor, Staff Nurse, Pharmacist, Lab Technician, Medical Coder, Medical Representative, Physiotherapist, Radiology Technician, Clinical Research Associate, Hospital Administrator",
},
{
id: 27,
category: "Legal & Compliance",
roles: "Corporate Lawyer, Legal Advisor, Legal Executive, Paralegal, Company Secretary, Compliance Officer, Contract Manager, Legal Researcher, Risk and Compliance Analyst",
},
{
id: 28,
category: "Hospitality & Tourism",
roles: "Hotel Manager, Hotel Receptionist, Front Office Executive, Chef, Restaurant Manager, Food and Beverage Executive, Housekeeping Supervisor, Travel Consultant, Tour Coordinator, Event Manager",
},
{
id: 29,
category: "Retail & E-commerce",
roles: "Store Manager, Retail Sales Associate, Cashier, E-commerce Executive, E-commerce Manager, Category Manager, Marketplace Executive, Product Listing Executive, Merchandiser, Inventory Executive",
},
{
id: 30,
category: "Real Estate & Property Management",
roles: "Real Estate Agent, Property Manager, Real Estate Sales Executive, Leasing Executive, Property Consultant, Real Estate Analyst, Facility Manager, Property Sales Consultant",
},
{
id: 31,
category: "Automobile & Aerospace Engineering",
roles: "Automobile Engineer, Automotive Design Engineer, EV Engineer, Automotive Service Engineer, Vehicle Diagnostics Technician, Aerospace Engineer, Aircraft Maintenance Engineer, Automotive Quality Engineer",
},
{
id: 32,
category: "Aviation & Airport Operations",
roles: "Airport Operations Executive, Ground Staff Executive, Airline Customer Service Executive, Flight Operations Coordinator, Aviation Safety Officer, Airport Duty Manager, Airline Operations Executive",
},
{
id: 33,
category: "Safety, Security & Environment",
roles: "Security Guard, Security Supervisor, Corporate Security Officer, Safety Officer, Fire Safety Officer, Industrial Safety Engineer, Environmental Engineer, Environmental Consultant, Sustainability Analyst",
},
{
id: 34,
category: "Agriculture & Food Technology",
roles: "Agricultural Engineer, Agronomist, Food Technologist, Food Quality Analyst, Food Safety Officer, Dairy Technologist, Food Production Supervisor, Agriculture Research Associate",
},
{
id: 35,
category: "Fashion & Beauty",
roles: "Fashion Designer, Fashion Stylist, Fashion Merchandiser, Makeup Artist, Beautician, Hair Stylist, Apparel Production Manager, Textile Designer",
},
{
id: 36,
category: "Renewable Energy",
roles: "Solar Engineer, Renewable Energy Engineer, Wind Energy Technician, Energy Auditor, Solar PV Designer, Sustainability Engineer, Renewable Energy Project Manager",
},
{
id: 37,
category: "BPO, KPO & Operations",
roles: "BPO Executive, KPO Analyst, Process Associate, Voice Process Executive, Non-Voice Process Executive, International Process Executive, Data Processing Executive, Operations Associate, Document Verification Executive",
},
{
id: 38,
category: "General Aptitude & Logical Reasoning",
roles: "Graduate Trainee, Management Trainee, Placement Candidate, Competitive Assessment Candidate, Entry-Level Analyst, Junior Operations Executive",
},
{
id: 39,
category: "General HR & Behavioral Interview",
roles: "Software Developer, Engineer, Accountant, HR Executive, Sales Executive, Business Analyst, Manager, Customer Support Executive, Designer, and candidates from any other profession",
},
{
id: 40,
category: "Situational & Scenario-Based Interview",
roles: "Customer Support Executive, Sales Executive, HR Executive, Team Leader, Project Manager, Business Analyst, Operations Manager, Technical Support Engineer, and other roles requiring practical decision-making",
},
{
id: 41,
category: "Project & Practical Assessment",
roles: "Software Developer, Web Developer, Data Analyst, Data Scientist, Graphic Designer, UI/UX Designer, Engineer, Content Writer, Marketing Executive, and other roles requiring a practical task or portfolio",
},
{
id: 42,
category: "Fresher & Internship Assessment",
roles: "Software Development Intern, Web Development Intern, HR Intern, Marketing Intern, Finance Intern, Data Analyst Intern, Graphic Design Intern, Business Development Intern, Graduate Engineer Trainee, Management Trainee, Operations Intern, Research Intern",
},
];

const levels = ["Easy", "Medium", "Hard"];

function getLocalDateValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function PrivateInterviews() {
const navigate = useNavigate();
const [searchTerm, setSearchTerm] = useState("");
const [selectedLevels, setSelectedLevels] = useState({});
const [detailsCategory, setDetailsCategory] = useState(null);
const [bookingCategory, setBookingCategory] = useState(null);
const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
const [isBooking, setIsBooking] = useState(false);
const [bookingMessage, setBookingMessage] = useState("");
const [scheduledDate, setScheduledDate] = useState("");
const [scheduledTime, setScheduledTime] = useState("");

const filteredCategories = interviewCategories.filter((item) =>
item.category.toLowerCase().includes(searchTerm.toLowerCase())
);

function handleLevelChange(id, level) {
setSelectedLevels((previous) => ({
...previous,
[id]: level,
}));
}

function handleBookInterview(item) {
if (!sessionStorage.getItem("prepx_token")) {
  navigate("/login");
  return;
}

setBookingCategory(item);
setIsBookingConfirmed(false);
setBookingMessage("");
setScheduledDate("");
setScheduledTime("");
}

async function handleConfirmBooking() {
  const selectedDateTime = new Date(
    `${scheduledDate}T${scheduledTime}:00`
  );
  if (
    !scheduledDate ||
    !/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(scheduledTime) ||
    selectedDateTime.getTime() <= Date.now()
  ) {
    setBookingMessage(
      "Choose a future interview time on the hour or half-hour."
    );
    return;
  }

  setIsBooking(true);
  setBookingMessage("");

  try {
    await bookPrivateInterview({
      categoryId: bookingCategory.id,
      category: bookingCategory.category,
      difficulty: selectedLevels[bookingCategory.id] || "Easy",
      scheduledAt: selectedDateTime.toISOString(),
      scheduledTime,
    });
    setIsBookingConfirmed(true);
    setBookingMessage("Your interview booking has been recorded.");
  } catch (error) {
    setBookingMessage(
      error.message || "Unable to book your interview. Please try again."
    );
  } finally {
    setIsBooking(false);
  }
}

return (
<main className="private-interviews-page">
<header className="private-interviews-header">
<div className="private-interviews-heading">
<span className="private-interviews-heading-icon">
<BriefcaseBusiness size={25} />
</span>

      <div>
        <h1>Private Interviews</h1>
        <p>
          Choose your interview category, select a difficulty
          level, and prepare for your next opportunity.
        </p>
      </div>
    </div>

    <button
      type="button"
      className="private-interviews-home-button"
      onClick={() => navigate("/")}
      aria-label="Return to homepage"
      title="Return to homepage"
    >
      <X size={21} />
    </button>

    <div className="private-interviews-search">
      <Search size={18} />
      <input
        type="search"
        placeholder="Search interview categories..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        aria-label="Search interview categories"
      />
    </div>
  </header>

  <section className="private-interviews-content">
    <div className="private-interviews-section-heading">
      <div>
        <h2>Explore Interview Categories</h2>
        <p>
          {filteredCategories.length} of {interviewCategories.length}{" "}
          categories
        </p>
      </div>

      <span className="private-interviews-duration-note">
        <Clock3 size={16} />
        30 minutes per interview
      </span>
    </div>

    <div className="private-interview-list">
      {filteredCategories.map((item) => (
        <article className="private-interview-card" key={item.id}>
          <div className="private-interview-main">
            <span className="private-interview-icon">
              <GraduationCap size={24} />
            </span>

            <div className="private-interview-info">
              <span className="private-interview-number">
                CATEGORY {String(item.id).padStart(2, "0")}
              </span>

              <h3>{item.category}</h3>

              <div className="private-interview-meta">
                <span>
                  <Clock3 size={15} />
                  30 minutes
                </span>

                <span className="private-interview-private-tag">
                  Private interview
                </span>
              </div>
            </div>
          </div>

          <div className="private-interview-actions">
            <label className="private-interview-level">
              <span>Difficulty level</span>
              <select
                value={selectedLevels[item.id] || "Easy"}
                onChange={(event) =>
                  handleLevelChange(item.id, event.target.value)
                }
                aria-label={`Difficulty level for ${item.category}`}
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="private-interview-details-button"
              onClick={() => setDetailsCategory(item)}
            >
              Details
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="private-interview-book-button"
              onClick={() => handleBookInterview(item)}
            >
              Book Interview
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
      ))}

      {filteredCategories.length === 0 && (
        <div className="private-interviews-empty">
          <Search size={28} />
          <h3>No categories found</h3>
          <p>Try searching with a different category name.</p>
        </div>
      )}
    </div>
  </section>

  {/* Job roles details popup */}
  {detailsCategory && (
    <div
      className="private-interview-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setDetailsCategory(null);
        }
      }}
    >
      <section
        className="private-interview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-interview-modal-title"
      >
        <div className="private-interview-modal-header">
          <div>
            <span className="private-interview-modal-eyebrow">
              INTERVIEW CATEGORY {detailsCategory.id}
            </span>
            <h2 id="private-interview-modal-title">
              {detailsCategory.category}
            </h2>
          </div>

          <button
            type="button"
            className="private-interview-modal-close"
            onClick={() => setDetailsCategory(null)}
            aria-label="Close details"
          >
            <X size={21} />
          </button>
        </div>

        <div className="private-interview-modal-body">
          <div className="private-interview-modal-meta">
            <span>
              <Clock3 size={16} />
              30 minutes
            </span>
            <span>
              <GraduationCap size={16} />
              {selectedLevels[detailsCategory.id] || "Easy"} level
            </span>
          </div>

          <h3>Job roles covered</h3>

          <p className="private-interview-roles-description">
            This interview category is suitable for candidates
            preparing for the following job roles:
          </p>

          <div className="private-interview-roles-list">
            {detailsCategory.roles
              .split(",")
              .map((role, index) => (
                <span
                  className="private-interview-role-chip"
                  key={`${detailsCategory.id}-${index}`}
                >
                  <CheckCircle2 size={15} />
                  {role.trim()}
                </span>
              ))}
          </div>

        </div>
      </section>
    </div>
  )}

  {bookingCategory && (
    <div
      className="private-interview-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setBookingCategory(null);
          setIsBookingConfirmed(false);
        }
      }}
    >
      <section
        className="private-interview-modal private-interview-booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-interview-booking-title"
      >
        <div className="private-interview-modal-header">
          <div>
            <span className="private-interview-modal-eyebrow">
              PRIVATE INTERVIEW BOOKING
            </span>
            <h2 id="private-interview-booking-title">
              Confirm your interview
            </h2>
          </div>
          <button
            type="button"
            className="private-interview-modal-close"
            onClick={() => {
              setBookingCategory(null);
              setIsBookingConfirmed(false);
            }}
            aria-label="Close booking confirmation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="private-interview-modal-body">
          <div className="private-interview-modal-meta">
            <span>
              <BriefcaseBusiness size={16} />
              {bookingCategory.category}
            </span>
            <span>
              <Clock3 size={16} />
              30 minutes
            </span>
            <span>
              <GraduationCap size={16} />
              {selectedLevels[bookingCategory.id] || "Easy"} level
            </span>
          </div>

          <div className="private-interview-schedule-fields">
            <label className="private-interview-schedule-field">
              <span>Interview date</span>
              <input
                type="date"
                value={scheduledDate}
                min={getLocalDateValue(new Date())}
                onChange={(event) => {
                  setScheduledDate(event.target.value);
                  setScheduledTime("");
                  setBookingMessage("");
                }}
                required
              />
            </label>
            <label className="private-interview-schedule-field">
              <span>Interview time</span>
              <select
                value={scheduledTime}
                onChange={(event) => {
                  setScheduledTime(event.target.value);
                  setBookingMessage("");
                }}
                required
                disabled={!scheduledDate}
              >
                <option value="" disabled>
                  {scheduledDate ? "Select a time" : "Choose a date first"}
                </option>
                {Array.from({ length: 48 }, (_, index) => {
                  const hour = Math.floor(index / 2);
                  const minute = index % 2 === 0 ? "00" : "30";
                  const value = `${String(hour).padStart(2, "0")}:${minute}`;
                  const slot = new Date(`${scheduledDate}T${value}:00`);

                  return slot.getTime() > Date.now() ? (
                    <option key={value} value={value}>
                      {`${hour % 12 || 12}:${minute} ${
                        hour < 12 ? "AM" : "PM"
                      }`}
                    </option>
                  ) : null;
                })}
              </select>
            </label>
          </div>
          <p className="private-interview-roles-description">
            Choose a future time in 30-minute intervals. Your selection will
            appear in your schedule and the admin schedule.
          </p>

          {!isBookingConfirmed ? (
            <button
              type="button"
              className="private-interview-modal-confirm"
              onClick={handleConfirmBooking}
              disabled={isBooking || !scheduledDate || !scheduledTime}
            >
              <CheckCircle2 size={17} />
              {isBooking ? "Booking..." : "Confirm Booking"}
            </button>
          ) : (
            <div className="private-interview-booking-confirmed">
              <p role="status">{bookingMessage}</p>
            </div>
          )}
          {!isBookingConfirmed && bookingMessage && (
            <p className="private-interview-booking-error" role="alert">
              {bookingMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  )}
</main>

);
}