
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import { bookPrivateInterview } from "./services/interviews.js";

const governmentInterviewCategories = [
  { category: "Software Development", roles: ["Software Developer", "Software Engineer", "Programmer", "Full Stack Developer", "Application Developer"] },
  { category: "Web Development", roles: ["Frontend Developer", "Backend Developer", "Web Developer", "UI Developer"] },
  { category: "Mobile App Development", roles: ["Android Developer", "iOS Developer", "Mobile App Developer"] },
  { category: "Data Science & Artificial Intelligence", roles: ["Data Scientist", "AI Engineer", "Machine Learning Engineer", "AI Researcher"] },
  { category: "Data Analysis & Statistics", roles: ["Data Analyst", "Statistical Officer", "Statistical Investigator", "Research Analyst"] },
  { category: "Database Management", roles: ["Database Administrator", "SQL Developer", "Database Engineer"] },
  { category: "Networking & Cybersecurity", roles: ["Network Engineer", "Cybersecurity Analyst", "Security Engineer", "Network Administrator"] },
  { category: "IT Support & System Administration", roles: ["System Administrator", "IT Support Engineer", "Technical Support Officer", "Computer Operator"] },
  { category: "Government IT & Technical Services", roles: ["Government IT Officer", "NIC Technical Officer", "Technical Assistant", "IT Specialist"] },
  { category: "Civil Engineering", roles: ["Civil Engineer", "Junior Engineer (Civil)", "Assistant Engineer (Civil)", "PWD Engineer"] },
  { category: "Mechanical Engineering", roles: ["Mechanical Engineer", "Junior Engineer (Mechanical)", "Maintenance Engineer", "Production Engineer"] },
  { category: "Electrical Engineering", roles: ["Electrical Engineer", "Junior Engineer (Electrical)", "Assistant Engineer (Electrical)", "Power System Engineer"] },
  { category: "Electronics & Communication Engineering", roles: ["Electronics Engineer", "Telecom Engineer", "Communication Engineer", "Electronics Technician"] },
  { category: "Other Engineering Disciplines", roles: ["Chemical Engineer", "Aerospace Engineer", "Mining Engineer", "Environmental Engineer", "Petroleum Engineer"] },
  { category: "Engineering Technicians & Skilled Trades", roles: ["Electrician", "Fitter", "Welder", "Mechanic", "Instrument Mechanic", "Plant Operator", "Draughtsman"] },
  { category: "Civil Services & General Administration", roles: ["IAS Officer", "State Civil Services Officer", "SDM", "Deputy Collector", "BDO", "Tehsildar"] },
  { category: "Office Administration & Clerical", roles: ["LDC", "UDC", "Junior Clerk", "Senior Clerk", "Office Assistant", "Office Superintendent", "Data Entry Operator"] },
  { category: "Human Resources & Personnel Management", roles: ["HR Officer", "HR Assistant", "Recruitment Officer", "Establishment Officer", "Labour Officer", "Personnel Officer"] },
  { category: "Banking & Financial Services", roles: ["Bank PO", "Bank Clerk", "RBI Assistant", "Banking Specialist Officer", "Insurance Officer", "LIC AAO"] },
  { category: "Accounting & Bookkeeping", roles: ["Accountant", "Junior Accountant", "Accounts Assistant", "Accounts Officer", "Finance Assistant"] },
  { category: "Auditing, Taxation & Revenue", roles: ["Auditor", "Income Tax Inspector", "GST Inspector", "Customs Officer", "Tax Assistant", "Excise Inspector"] },
  { category: "Economics, Finance & Treasury", roles: ["Economic Officer", "Treasury Officer", "Financial Analyst", "Planning Officer", "Economics Investigator"] },
  { category: "Teaching & School Education", roles: ["Primary Teacher", "TGT", "PGT", "School Principal", "Education Officer", "Special Education Teacher"] },
  { category: "Higher Education & Academic Research", roles: ["Assistant Professor", "Lecturer", "Professor", "Research Assistant", "Academic Coordinator"] },
  { category: "Laboratory & Scientific Services", roles: ["Laboratory Technician", "Scientific Assistant", "Research Scientist", "Laboratory Assistant", "Research Associate"] },
  { category: "Police & Law Enforcement", roles: ["Police Constable", "Head Constable", "ASI", "SI", "Police Inspector", "DSP", "Traffic Police Officer"] },
  { category: "Defence & Armed Forces", roles: ["Army Officer", "Navy Officer", "Air Force Officer", "Soldier", "Sailor", "Coast Guard Officer", "Military Police"] },
  { category: "Paramilitary & Border Security", roles: ["BSF Personnel", "CRPF Personnel", "CISF Personnel", "ITBP Personnel", "SSB Personnel", "RPF Constable", "RPF Sub-Inspector"] },
  { category: "Intelligence & Investigation", roles: ["Intelligence Bureau Officer", "Intelligence Assistant", "Investigation Officer", "Crime Branch Officer", "Enforcement Officer"] },
  { category: "Railway Operations & Commercial Services", roles: ["Railway Station Master", "Train Manager", "Ticket Examiner", "Railway Clerk", "Commercial Apprentice", "Traffic Assistant"] },
  { category: "Railway Engineering & Technical Services", roles: ["Assistant Loco Pilot", "Railway Technician", "Railway Junior Engineer", "Railway Engineer"] },
  { category: "Medical & Clinical Services", roles: ["Government Doctor", "Medical Officer", "Dentist", "Specialist Doctor", "Medical Superintendent"] },
  { category: "Nursing & Patient Care", roles: ["Staff Nurse", "Nursing Officer", "Community Health Officer", "Nursing Assistant"] },
  { category: "Pharmacy & Allied Healthcare", roles: ["Pharmacist", "Radiographer", "Medical Laboratory Technician", "Physiotherapist", "Occupational Therapist"] },
  { category: "Public Health & Hospital Administration", roles: ["Public Health Officer", "Health Inspector", "Hospital Administrator", "Health Services Officer"] },
  { category: "Law, Judiciary & Legal Services", roles: ["Civil Judge", "Judicial Magistrate", "Public Prosecutor", "Government Advocate", "Legal Officer", "Court Assistant"] },
  { category: "Agriculture & Horticulture", roles: ["Agriculture Officer", "Agricultural Development Officer", "Horticulture Officer", "Agriculture Extension Officer"] },
  { category: "Forestry, Wildlife & Environment", roles: ["Forest Officer", "Forest Ranger", "Forest Guard", "Wildlife Officer", "Environmental Officer", "Soil Conservation Officer"] },
  { category: "Veterinary & Fisheries Services", roles: ["Veterinary Officer", "Fisheries Officer", "Animal Husbandry Officer", "Veterinary Assistant"] },
  { category: "Social Welfare & Community Development", roles: ["Social Welfare Officer", "Child Development Project Officer (CDPO)", "Child Protection Officer", "Labour Welfare Officer", "Women Welfare Officer"] },
  { category: "Rural Development & Panchayat Services", roles: ["Panchayat Development Officer", "Village Development Officer", "Rural Development Officer", "Block Development Officer"] },
  { category: "Revenue, Land & Municipal Administration", roles: ["Patwari", "Village Revenue Officer", "Revenue Inspector", "Municipal Officer", "Tehsildar", "Land Records Officer"] },
  { category: "Public Relations & Communications", roles: ["Public Relations Officer", "Public Information Officer", "Communications Officer", "Publicity Assistant"] },
  { category: "Marketing, Sales & Business Development", roles: ["Marketing Officer", "Sales Officer", "Business Development Officer", "Trade Promotion Officer", "Export Promotion Officer"] },
  { category: "Management & Project Operations", roles: ["Management Trainee", "Project Officer", "Project Manager", "Operations Manager", "Assistant Manager"] },
  { category: "Procurement, Supply Chain & Logistics", roles: ["Procurement Officer", "Supply Officer", "Warehouse Manager", "Inventory Manager", "Logistics Officer", "Supply Chain Officer"] },
  { category: "Quality Control, Safety & Compliance", roles: ["Quality Control Officer", "Quality Assurance Engineer", "Safety Officer", "Compliance Officer", "Vigilance Officer"] },
  { category: "Space, Defence Research & Advanced Science", roles: ["ISRO Scientist", "DRDO Scientist", "BARC Scientific Officer", "Physicist", "Chemist", "Geologist", "Meteorologist"] },
  { category: "Forensic Science & Evidence Examination", roles: ["Forensic Officer", "Forensic Analyst", "Forensic Laboratory Assistant", "Evidence Examination Officer"] },
  { category: "Postal & Telecommunications", roles: ["Postal Assistant", "Sorting Assistant", "Postman", "Postal Inspector", "Telecom Officer", "Telecom Engineer", "Gramin Dak Sevak"] },
  { category: "Transport & Motor Vehicle Services", roles: ["Transport Officer", "Motor Vehicle Inspector", "Assistant Motor Vehicle Inspector", "Depot Manager", "Road Safety Officer"] },
  { category: "Municipal Services, Fire & Disaster Management", roles: ["Fire Officer", "Firefighter", "Sanitary Inspector", "Disaster Management Officer", "Waste Management Officer"] },
  { category: "Media, Journalism & Publishing", roles: ["Government Journalist", "Editor", "Content Writer", "Photographer", "Video Editor", "Publications Officer", "Broadcast Engineer"] },
  { category: "Translation & Language Services", roles: ["Translator", "Interpreter", "Official Language Officer", "Language Assistant"] },
  { category: "Foreign Affairs & Passport Services", roles: ["Foreign Service Officer", "Embassy Assistant", "Passport Officer", "Consular Officer", "Visa Officer"] },
  { category: "Energy, Mining & Infrastructure", roles: ["Power Plant Engineer", "Mining Engineer", "Petroleum Engineer", "Geophysicist", "Infrastructure Project Officer"] },
  { category: "Food Safety & Consumer Protection", roles: ["Food Safety Officer", "Food Inspector", "Consumer Protection Officer", "Weights and Measures Inspector", "Supply Inspector"] },
  { category: "Library & Documentation Services", roles: ["Librarian", "Library Assistant", "Documentation Officer", "Record Keeper"] },
  { category: "Secretarial & Personal Assistance", roles: ["Personal Assistant", "Private Secretary", "Stenographer", "Executive Assistant", "Stenotypist"] },
  { category: "General Support & Multitasking", roles: ["Multi-Tasking Staff (MTS)", "Office Attendant", "Peon", "Dispatch Clerk", "Record Assistant", "Group D Support Staff"] },
];

export default function GovernmentInterviews() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [levels, setLevels] = useState({});
  const [detailsCategory, setDetailsCategory] = useState(null);
  const [bookingCategory, setBookingCategory] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  const filteredCategories = governmentInterviewCategories.filter((item) => {
    const search = searchTerm.trim().toLocaleLowerCase();
    return (
      item.category.toLocaleLowerCase().includes(search) ||
      item.roles.some((role) => role.toLocaleLowerCase().includes(search))
    );
  });

  function updateLevel(index, level) {
    setLevels((previous) => ({ ...previous, [index]: level }));
  }

  function openBooking(item, index) {
    if (!sessionStorage.getItem("prepx_token")) {
      navigate("/login");
      return;
    }

    setBookingCategory({ ...item, id: index + 1 });
    setScheduledDate("");
    setScheduledTime("");
    setBookingMessage("");
    setIsBookingConfirmed(false);
  }

  async function confirmBooking() {
    const interviewDateTime = new Date(
      `${scheduledDate}T${scheduledTime}:00`
    );

    if (
      !scheduledDate ||
      !/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(scheduledTime) ||
      interviewDateTime.getTime() <= Date.now()
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
        difficulty: levels[bookingCategory.id - 1] || "Easy",
        scheduledAt: interviewDateTime.toISOString(),
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

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minimumDate = today.toISOString().slice(0, 10);

  return (
    <main className="private-interviews-page">
      <header className="private-interviews-header">
        <div className="private-interviews-heading">
          <span className="private-interviews-heading-icon">
            <BriefcaseBusiness size={25} />
          </span>
          <div>
            <h1>Government Job Interviews</h1>
            <p>
              Explore government interview categories, job roles, and book a
              practice session.
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

        <label className="private-interviews-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search interview categories or roles..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search government interview categories"
          />
        </label>
      </header>

      <section className="private-interviews-content">
        <div className="private-interviews-section-heading">
          <div>
            <h2>Explore Government Interview Categories</h2>
            <p>
              {filteredCategories.length} of{" "}
              {governmentInterviewCategories.length} categories
            </p>
          </div>
          <span className="private-interviews-duration-note">
            <Clock3 size={16} />
            30 minutes per interview
          </span>
        </div>

        <div className="private-interview-list">
          {filteredCategories.map((item) => {
            const categoryIndex = governmentInterviewCategories.indexOf(item);
            return (
              <article className="private-interview-card" key={item.category}>
                <div className="private-interview-main">
                  <span className="private-interview-icon">
                    <GraduationCap size={24} />
                  </span>
                  <div className="private-interview-info">
                    <span className="private-interview-number">
                      CATEGORY {String(categoryIndex + 1).padStart(2, "0")}
                    </span>
                    <h3>{item.category}</h3>
                    <div className="private-interview-meta">
                      <span>
                        <Clock3 size={15} />
                        30 minutes
                      </span>
                      <span className="private-interview-private-tag">
                        Government interview
                      </span>
                    </div>
                  </div>
                </div>

                <div className="private-interview-actions">
                  <label className="private-interview-level">
                    <span>Difficulty level</span>
                    <select
                      value={levels[categoryIndex] || "Easy"}
                      onChange={(event) =>
                        updateLevel(categoryIndex, event.target.value)
                      }
                      aria-label={`Difficulty level for ${item.category}`}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
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
                    onClick={() => openBooking(item, categoryIndex)}
                  >
                    Book Interview
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="private-interviews-empty">
              <Search size={28} />
              <h3>No categories found</h3>
              <p>Try searching with a different category or job role.</p>
            </div>
          )}
        </div>
      </section>

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
            aria-labelledby="government-interview-details-title"
          >
            <div className="private-interview-modal-header">
              <div>
                <span className="private-interview-modal-eyebrow">
                  GOVERNMENT INTERVIEW CATEGORY
                </span>
                <h2 id="government-interview-details-title">
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
                  {levels[governmentInterviewCategories.indexOf(detailsCategory)] ||
                    "Easy"}{" "}
                  level
                </span>
              </div>
              <h3>Job roles covered</h3>
              <p className="private-interview-roles-description">
                This category is suitable for candidates preparing for these
                government roles:
              </p>
              <div className="private-interview-roles-list">
                {detailsCategory.roles.map((role) => (
                  <span className="private-interview-role-chip" key={role}>
                    <CheckCircle2 size={15} />
                    {role}
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
            aria-labelledby="government-interview-booking-title"
          >
            <div className="private-interview-modal-header">
              <div>
                <span className="private-interview-modal-eyebrow">
                  GOVERNMENT INTERVIEW BOOKING
                </span>
                <h2 id="government-interview-booking-title">
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
                  {levels[bookingCategory.id - 1] || "Easy"} level
                </span>
              </div>

              <div className="private-interview-schedule-fields">
                <label className="private-interview-schedule-field">
                  <span>Interview date</span>
                  <input
                    type="date"
                    value={scheduledDate}
                    min={minimumDate}
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
                Choose a future time in 30-minute intervals. Your booking will
                appear in your schedule and the admin schedule.
              </p>

              {!isBookingConfirmed ? (
                <button
                  type="button"
                  className="private-interview-modal-confirm"
                  onClick={confirmBooking}
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