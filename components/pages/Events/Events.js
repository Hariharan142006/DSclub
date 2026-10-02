"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Terminal, ChevronDown, ExternalLink } from 'lucide-react';
import styles from './Events.module.css';

const events = [
  // 2025-26 EVEN
  { 
    id: 1, 
    title: 'DATAXSCAPE 2K26', 
    date: '21-22 Jan 2026', 
    time: '24 Hours', 
    venue: 'Panimalar Engineering College', 
    type: 'flagship', 
    year: '2025-26',
    desc: 'A 24-hour National Level Data Science Hackathon in collaboration with HEXAWARE, where participants collaborate to solve real-world problems using data-driven approaches, coding, and innovative solutions.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg' 
  },
  // 2025-26 ODD
  { 
    id: 2, 
    title: 'Logo Contest', 
    date: '14 Jul 2025', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2025-26',
    desc: 'A creative competition where students design an innovative logo representing the identity of the Data Science Club.', 
    img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    title: 'Code Battle', 
    date: '22 Jul 2025', 
    time: 'Full Day', 
    venue: 'Lab', 
    type: 'executed', 
    year: '2025-26',
    desc: 'A blind coding competition testing students\' programming logic, accuracy, and problem-solving skills under constraints.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582683/DS_Club_Events/Code_Battle.jpg' 
  },
  { 
    id: 4, 
    title: 'Clash of Clans', 
    date: '22 Jul 2025', 
    time: 'Full Day', 
    venue: 'Seminar Hall', 
    type: 'executed', 
    year: '2025-26',
    desc: 'A technical debate event where students discuss and analyze trending topics in technology.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582683/DS_Club_Events/Clash_of_Clans.jpg' 
  },
  { 
    id: 5, 
    title: 'Idea Presentation', 
    date: '22 Jul 2025', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2025-26',
    desc: 'Students present innovative project ideas focusing on solving real-world problems using technology.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Idea_Presentation.jpg' 
  },
  { 
    id: 6, 
    title: 'Code Arena', 
    date: '22 Jul 2025', 
    time: 'Full Day', 
    venue: 'Lab', 
    type: 'executed', 
    year: '2025-26',
    desc: 'A competitive coding contest that evaluates students\' speed, efficiency, and accuracy in solving problems.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582683/DS_Club_Events/Code_Arena.jpg' 
  },
  { 
    id: 7, 
    title: 'Data Duel', 
    date: '31 Jul 2025', 
    time: 'Full Day', 
    venue: 'Lab', 
    type: 'executed', 
    year: '2025-26',
    desc: 'A coding and debugging challenge designed to test students\' programming and analytical skills in a competitive setting.', 
    img: 'https://images.unsplash.com/photo-1620712948343-008423671db0?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 8, 
    title: 'The Cafe', 
    date: '05 Aug 2025', 
    time: 'Full Day', 
    venue: 'Lab', 
    type: 'executed', 
    year: '2025-26',
    desc: 'A hands-on event focusing on Python programming, data analysis, and visualization in a time-bound challenge format.', 
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop' 
  },
  // 2024-25
  { 
    id: 9, 
    title: 'Unlocking Creativity with Generative AI', 
    date: '20 Aug 2024', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2024-25',
    desc: 'A workshop on leveraging generative AI for data science tasks — visualization, synthetic data generation, automated insights, and intelligent content creation. By Mr. R. Ranganathan, Growth Director GenAI.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582691/DS_Club_Events/Unlocking_Creativity_with_Generative_AI.png' 
  },
  { 
    id: 10, 
    title: 'NextGen AI Project Expo', 
    date: '20 Aug 2024', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2024-25',
    desc: 'An exhibition of student-developed AI and data science projects — machine learning models, data analytics solutions, and real-world problem-solving using data-driven approaches.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/NextGen_AI_Project_Expo.jpg' 
  },
  { 
    id: 11, 
    title: 'Code Bonanza', 
    date: '22 Feb 2025', 
    time: 'Full Day', 
    venue: 'Lab', 
    type: 'executed', 
    year: '2024-25',
    desc: 'A coding competition aimed at enhancing students\' problem-solving and programming skills through challenges and real-time coding tasks. Chief Guest: Ms. Sangeetha Jothiraman, Project Manager, CTS.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Code_Bonanza.jpg' 
  },
  { 
    id: 12, 
    title: 'Visionary Insights', 
    date: '22 Feb 2025', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2024-25',
    desc: 'A project competition where students present innovative technical ideas and real-time solutions based on emerging technologies such as AI and Data Science. Chief Guest: Mr. Jagdeesh Gopal, Technical Program Manager.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582687/DS_Club_Events/Visionary_Insights.jpg' 
  },
  // 2023-24
  { 
    id: 13, 
    title: 'Data Visualization Workshop', 
    date: '26 Jul 2023', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2023-24',
    desc: 'A hands-on workshop on data visualization techniques using Python (Matplotlib, Seaborn) and Tableau to transform raw data into meaningful insights. By Dr. Mercy, Rajalakshmi Engineering College.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Data_Visualization_Workshop.jpg' 
  },
  { 
    id: 14, 
    title: 'Data Visualization & Exploration Seminar', 
    date: '24 Jul 2023', 
    time: 'Full Day', 
    venue: 'Seminar Hall', 
    type: 'executed', 
    year: '2023-24',
    desc: 'A seminar focusing on data visualization and exploratory data analysis (EDA) techniques using Python (Pandas, Matplotlib, Seaborn). By Mrs. Priya, Hindustan University.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Data_Visualization_Exploration_Seminar.jpg' 
  },
  // 2022-23
  { 
    id: 15, 
    title: 'Visualytics', 
    date: '08 Aug 2022', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2022-23',
    desc: 'A hands-on session focused on data visualization techniques using modern tools, enabling students to transform raw data into meaningful insights through charts and dashboards.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582687/DS_Club_Events/Visualytics.jpg' 
  },
  { 
    id: 16, 
    title: 'Group Presentation: Data Visualization & Exploration', 
    date: '24 Feb 2023', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2022-23',
    desc: 'Students worked in teams to analyze datasets and present insights using visualization techniques, enhancing analytical, communication, and presentation skills.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/Group_Presentation_Data_Visualization_Exploration.jpg' 
  },
  // 2021-22
  { 
    id: 17, 
    title: 'Orientation Programme', 
    date: '18 Mar 2022', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2021-22',
    desc: 'Orientation session by Mrs. A. Rama Devi, Developer Lead, Global Soft Technologies — introducing students to Data Science concepts, career opportunities, and industry expectations.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Orientation_Programme.jpg' 
  },
  { 
    id: 18, 
    title: 'Data Mining Techniques', 
    date: '28 Mar 2022', 
    time: 'Full Day', 
    venue: 'Campus', 
    type: 'executed', 
    year: '2021-22',
    desc: 'Guest lecture by Dr. K. Sridevi, Professor, Veltech Hightech Engineering College, focusing on data mining methods — classification, clustering, and association rule mining.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Data_Mining_Techniques.jpg' 
  },
  { 
    id: 19, 
    title: 'Workshop: Learning, Modeling & Inference', 
    date: '04 Apr 2022', 
    time: 'Full Day', 
    venue: 'Lab', 
    type: 'executed', 
    year: '2021-22',
    desc: 'Hands-on workshop covering machine learning fundamentals, model building, training, and inference techniques using real-world datasets.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582687/DS_Club_Events/Workshop_Learning_Modeling_Inference.jpg' 
  },
  { 
    id: 20, 
    title: 'Data Science Process & Principles', 
    date: '19 May 2022', 
    time: 'Full Day', 
    venue: 'Seminar Hall', 
    type: 'executed', 
    year: '2021-22',
    desc: 'Session explaining the complete data science lifecycle including data collection, preprocessing, modeling, evaluation, and deployment principles.', 
    img: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Data_Science_Process_Principles.jpg' 
  },
];

const years = ['all', '2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];

export default function Events() {
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [dbEvents, setDbEvents] = useState([]);

  // Registration Modal State
  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [regForm, setRegForm] = useState({ name: '', email: '', rollNo: '', deptYear: '', customResponses: {}, formResponses: {} });
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [viewingPoster, setViewingPoster] = useState(null);
  const [viewingResourcesFor, setViewingResourcesFor] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReg(true);
    try {
      let finalName = regForm.name;
      let finalEmail = regForm.email;
      let finalRoll = regForm.rollNo;
      let finalDept = regForm.deptYear;

      if (registeringEvent.formFields && registeringEvent.formFields.length > 0) {
        registeringEvent.formFields.forEach(f => {
          const l = (f.label || '').toLowerCase();
          const v = regForm.formResponses[f.id];
          if (!v) return;
          if (l.includes('name')) finalName = v;
          else if (l.includes('email') || l.includes('mail')) finalEmail = v;
          else if (l.includes('roll') || l.includes('register')) finalRoll = v;
          else if (l.includes('dept') || l.includes('year') || l.includes('department')) finalDept = v;
        });
      }

      const res = await fetch('/api/event-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: registeringEvent._id || registeringEvent.id,
          eventTitle: registeringEvent.title,
          name: finalName,
          email: finalEmail,
          rollNo: finalRoll,
          deptYear: finalDept,
          customResponses: regForm.customResponses,
          formResponses: regForm.formResponses || {}
        }),
      });
      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch (e) {}
        throw new Error(errData.error || 'Registration failed');
      }
      setRegSuccess(true);
    } catch (err) {
      alert('Error submitting registration: ' + err.message);
    } finally {
      setSubmittingReg(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
        const data = await res.json();
        if (Array.isArray(data)) {
          setDbEvents(data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const isRegistrationOpen = (ev) => {
    if (ev.registrationStatus === 'Closed') return false;
    if (ev.registrationStatus === 'Open') return true;
    const nowStr = new Date().toISOString().slice(0, 10);
    if (ev.regOpenDate && nowStr < ev.regOpenDate) return false;
    if (ev.regCloseDate && nowStr > ev.regCloseDate) return false;
    return true;
  };

  const getRegStatusMessage = (ev) => {
    if (ev.registrationStatus === 'Closed') return '🔴 REGISTRATION CLOSED';
    const nowStr = new Date().toISOString().slice(0, 10);
    if (ev.regOpenDate && nowStr < ev.regOpenDate) return `⏳ OPENS ON ${ev.regOpenDate}`;
    if (ev.regCloseDate && nowStr > ev.regCloseDate) return '🔴 CLOSED (DEADLINE PASSED)';
    return '🔥 REGISTRATION OPEN';
  };

  // Separate DB events into Upcoming vs Completed
  const dbUpcoming = dbEvents.filter(e => e.status === 'Upcoming' || (!e.status && (e.date?.includes('2026') || e.date?.includes('2027'))));
  const dbCompleted = dbEvents.filter(e => e.status === 'Completed' || (!e.status && !(e.date?.includes('2026') || e.date?.includes('2027'))));

  // Merge dbCompleted with static events (avoiding duplicates by title)
  const existingTitles = new Set(events.map(e => e.title.toLowerCase().trim()));
  const extraCompleted = dbCompleted
    .filter(e => !existingTitles.has(e.title?.toLowerCase().trim()))
    .map((e, idx) => ({
      id: `db-${e._id || idx}`,
      title: e.title || 'Event',
      date: e.date || '',
      time: e.time || '10:00 AM',
      venue: e.location || 'Campus',
      type: 'executed',
      year: e.date?.includes('2026') ? '2025-26' : e.date?.includes('2025') ? '2024-25' : '2025-26',
      desc: e.description || '',
      img: e.imageUrl || 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg',
      resources: e.resources || [],
      showResources: e.showResources
    }));

  const mergedEvents = [...extraCompleted, ...events];
  const filteredEvents = mergedEvents.filter(e => filter === 'all' || e.year === filter);
  const displayEvents = showAll ? filteredEvents : filteredEvents.slice(0, 6);

  return (
    <section id="events" className="section bg-alternate">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">EVENT <span className="gradient-text">LOGS</span></h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', marginBottom: '2rem' }}>
          {`> ${mergedEvents.length + dbUpcoming.length} events logged across 5 academic years`}
        </p>
      </motion.div>

      {/* UPCOMING EVENTS SHOWCASE */}
      {dbUpcoming.length > 0 && (
        <div style={{ marginBottom: '4rem', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', justifyContent: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '0.45rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              border: '1px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }}></span>
              LIVE SCHEDULE
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              UPCOMING <span className="gradient-text">HACKATHONS & SEMINARS</span>
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {dbUpcoming.map((ev, i) => (
              <motion.div
                key={ev._id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.9))',
                  borderRadius: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#0b0f19' }}>
                  <img
                    src={ev.imageUrl || 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg'}
                    alt={ev.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onError={(e) => { e.currentTarget.src = 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg'; }}
                  />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, transparent 60%)' }}></div>
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 5 }}>
                    <span style={{
                      background: isRegistrationOpen(ev) ? '#10b981' : 'rgba(239, 68, 68, 0.9)',
                      color: isRegistrationOpen(ev) ? '#000' : '#fff',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.4rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: isRegistrationOpen(ev) ? '0 2px 10px rgba(16, 185, 129, 0.5)' : '0 2px 10px rgba(239, 68, 68, 0.5)'
                    }}>
                      {getRegStatusMessage(ev)}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#34d399', fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> {ev.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> {ev.time || '10:00 AM'}</span>
                  </div>

                  <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: '1.3' }}>
                    {ev.title}
                  </h4>

                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.6rem',
                    padding: '0.6rem 0.85rem',
                    marginBottom: '1rem',
                    fontSize: '0.78rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#93c5fd' }}>
                      <span>📅 Reg Opens:</span> <strong style={{ color: '#fff' }}>{ev.regOpenDate || 'Open Now'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fca5a5' }}>
                      <span>⏳ Deadline:</span> <strong style={{ color: '#fff' }}>{ev.regCloseDate || ev.date || 'Event Day'}</strong>
                    </div>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>
                    {ev.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem', marginTop: 'auto', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                      <MapPin size={14} color="#38bdf8" /> {ev.location || 'Panimalar Engineering College'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {ev.showResources !== false && ev.resources && ev.resources.filter(r => r.isVisible !== false).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setViewingResourcesFor(ev)}
                          style={{
                            background: 'rgba(167, 139, 250, 0.15)',
                            color: '#c4b5fd',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.25)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)'; e.currentTarget.style.color = '#c4b5fd'; }}
                        >
                          📎 Resources
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewingPoster(ev.imageUrl || 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        👁️ View Poster
                      </button>
                      {isRegistrationOpen(ev) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRegisteringEvent(ev);
                            setRegForm({ name: '', email: '', rollNo: '', deptYear: '', customResponses: {}, formResponses: {} });
                            setRegSuccess(false);
                          }}
                          style={{
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            color: '#fff',
                            padding: '0.5rem 1.1rem',
                            borderRadius: '0.5rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s'
                          }}
                        >
                          Join / Register →
                        </button>
                      ) : (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          🔒 Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
          🗄️ COMPLETED EVENT LOG ARCHIVE
        </h3>
      </div>

      <div className={styles.notebookTabs}>
        {years.map((tab, index) => (
          <button 
            key={tab} 
            className={filter === tab ? styles.tabActive : styles.tabBtn}
            onClick={() => { setFilter(tab); setShowAll(false); }}
          >
            <span style={{color: '#676e95'}}>[{index}]: </span> {tab}
          </button>
        ))}
      </div>

      <motion.div className={styles.grid}>
        <AnimatePresence>
          {displayEvents.map(event => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 50, rotateX: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, rotateX: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 70, damping: 15 }}
              className={`${styles.logCard} ${event.type === 'flagship' ? styles.flagshipCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <Terminal size={16} />
                <span>root@ds-club:~/{event.year}</span>
                {event.type === 'flagship' && <span style={{ color: '#39FF14', fontSize: '0.7rem', marginLeft: 'auto' }}>★ FLAGSHIP</span>}
              </div>
              <div className={styles.cardImg}>
                <img
                  src={event.img}
                  alt={event.title}
                  className={styles.cardImgTag}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg'; }}
                />
                <div className={styles.scanline}></div>
              </div>
              <div className={styles.cardBody}>
                <h3>{event.title}</h3>
                <p className={styles.desc}>{event.desc}</p>
                <div className={styles.metaData}>
                  <span><Calendar size={14}/> {event.date}</span>
                  <span><Clock size={14}/> {event.time}</span>
                  <span><MapPin size={14}/> {event.venue}</span>
                </div>
                {event.showResources !== false && event.resources && event.resources.filter(r => r.isVisible !== false).length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setViewingResourcesFor(event)}
                      style={{
                        width: '100%',
                        background: 'rgba(167, 139, 250, 0.15)',
                        color: '#c4b5fd',
                        padding: '0.5rem',
                        borderRadius: '0.4rem',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: '1px solid rgba(167, 139, 250, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.25)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)'; e.currentTarget.style.color = '#c4b5fd'; }}
                    >
                      📎 View Resources
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredEvents.length > 6 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAll(!showAll)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {showAll ? 'SHOW LESS' : `LOAD MORE [${filteredEvents.length - 6} remaining]`}
            <ChevronDown size={16} style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: '0.3s' }}/>
          </button>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {registeringEvent && (
          <div key="event-registration-modal-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                background: 'linear-gradient(145deg, #0f172a, #1e293b)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '1.25rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '550px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.2)',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                color: '#fff',
                textAlign: 'left'
              }}
            >
              <button
                onClick={() => setRegisteringEvent(null)}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff',
                  width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                  fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>

              {regSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginBottom: '0.75rem' }}>
                    Registration Confirmed!
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    You have successfully registered for <strong style={{ color: '#fff' }}>{registeringEvent.title}</strong>.<br />
                    We have logged your details and notified the club admins. See you at the event!
                  </p>
                  <button
                    onClick={() => setRegisteringEvent(null)}
                    style={{
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      color: '#fff', padding: '0.75rem 2rem', borderRadius: '0.6rem',
                      fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    Done / Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.3rem' }}>
                      🔥 OFFICIAL REGISTRATION FORM
                    </span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#fff', lineHeight: '1.3' }}>
                      {registeringEvent.title}
                    </h3>
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#93c5fd' }}>
                        <span>📅 Reg Opens:</span> <strong style={{ color: '#fff' }}>{registeringEvent.regOpenDate || 'Open Now'}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fca5a5' }}>
                        <span>⏳ Deadline:</span> <strong style={{ color: '#fff' }}>{registeringEvent.regCloseDate || registeringEvent.date || 'Event Day'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* DYNAMIC FORM BUILDER OR LEGACY FORM */}
                    {registeringEvent.formFields && registeringEvent.formFields.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {registeringEvent.formFields.map(field => (
                          <div key={field.id}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                              {field.label} {field.required && '*'}
                            </label>
                            {field.type === 'select' ? (
                              <select
                                required={field.required}
                                value={regForm.formResponses?.[field.id] || ''}
                                onChange={(e) => setRegForm({
                                  ...regForm,
                                  formResponses: { ...regForm.formResponses, [field.id]: e.target.value }
                                })}
                                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                              >
                                <option value="" disabled>Select an option...</option>
                                {field.options && field.options.map(opt => opt.trim()).filter(Boolean).map((opt, i) => (
                                  <option key={i} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : field.type === 'file' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input
                                  type="file"
                                  required={field.required && !regForm.formResponses?.[field.id]}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      if (file.size > 2 * 1024 * 1024) {
                                        alert("File size must be under 2MB.");
                                        e.target.value = null;
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setRegForm({
                                          ...regForm,
                                          formResponses: { ...regForm.formResponses, [field.id]: reader.result }
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    } else {
                                      const newResponses = { ...regForm.formResponses };
                                      delete newResponses[field.id];
                                      setRegForm({ ...regForm, formResponses: newResponses });
                                    }
                                  }}
                                  style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                                />
                                {regForm.formResponses?.[field.id] && (
                                  <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>✅ File selected and ready to upload</span>
                                )}
                              </div>
                            ) : field.type === 'textarea' ? (
                              <textarea
                                required={field.required}
                                value={regForm.formResponses?.[field.id] || ''}
                                onChange={(e) => setRegForm({
                                  ...regForm,
                                  formResponses: { ...regForm.formResponses, [field.id]: e.target.value }
                                })}
                                placeholder={`Enter ${field.label}...`}
                                rows={3}
                                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                              />
                            ) : (
                              <input
                                type={field.type}
                                required={field.required}
                                value={regForm.formResponses?.[field.id] || ''}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (field.type === 'tel') val = val.replace(/\D/g, '').slice(0, 10);
                                  setRegForm({
                                    ...regForm,
                                    formResponses: { ...regForm.formResponses, [field.id]: val }
                                  });
                                }}
                                {...(field.type === 'tel' ? { pattern: "[0-9]{10}", maxLength: 10, title: "Please enter exactly 10 digits" } : {})}
                                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={regForm.name}
                            onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={regForm.email}
                            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                            style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                              Register / Roll No *
                            </label>
                            <input
                              type="text"
                              required
                              value={regForm.rollNo}
                              onChange={(e) => setRegForm({ ...regForm, rollNo: e.target.value })}
                              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                              Dept & Year *
                            </label>
                            <input
                              type="text"
                              required
                              value={regForm.deptYear}
                              onChange={(e) => setRegForm({ ...regForm, deptYear: e.target.value })}
                              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                            />
                          </div>
                        </div>

                        {/* CUSTOM QUESTIONS (LEGACY) */}
                        {registeringEvent.customQuestions && registeringEvent.customQuestions.length > 0 && (
                          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              📋 Event-Specific Questions
                            </span>
                            {registeringEvent.customQuestions.map((q, idx) => (
                              <div key={idx}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                                  {q} *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={regForm.customResponses[q] || ''}
                                  onChange={(e) => setRegForm({
                                    ...regForm,
                                    customResponses: { ...regForm.customResponses, [q]: e.target.value }
                                  })}
                                  placeholder={`Your answer for: ${q}`}
                                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setRegisteringEvent(null)}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.7rem 1.5rem', borderRadius: '0.6rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReg}
                      style={{
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        color: '#fff', padding: '0.7rem 2rem', borderRadius: '0.6rem',
                        fontWeight: 700, border: 'none', cursor: submittingReg ? 'wait' : 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', opacity: submittingReg ? 0.7 : 1
                      }}
                    >
                      {submittingReg ? 'Submitting...' : 'Confirm Registration →'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POSTER VIEW MODAL */}
      <AnimatePresence>
        {viewingPoster && (
          <div key="event-poster-view-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }} onClick={() => setViewingPoster(null)}>
            <button
              onClick={() => setViewingPoster(null)}
              style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff',
                width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10001
              }}
            >
              ✕
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={viewingPoster}
              alt="Event Poster Full"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '0.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </AnimatePresence>

      {/* RESOURCES VIEW MODAL */}
      <AnimatePresence>
        {viewingResourcesFor && (
          <div key="event-resources-view-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }} onClick={() => setViewingResourcesFor(null)}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                borderRadius: '1rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingResourcesFor(null)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#94a3b8',
                  width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                  fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: '0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                ✕
              </button>

              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📎 Resources for <span style={{ color: '#a78bfa' }}>{viewingResourcesFor.title}</span>
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                  Download or access the attached files and datasets for this event.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {viewingResourcesFor.resources?.filter(r => r.isVisible !== false).map((res, i) => {
                  const getDownloadUrl = (url) => {
                    if (url && url.includes('res.cloudinary.com') && url.includes('/upload/')) {
                      return url.replace('/upload/', '/upload/fl_attachment/');
                    }
                    return url;
                  };
                  return (
                  <a
                    key={i}
                    href={getDownloadUrl(res.url)}
                    download={res.url && res.url.startsWith('data:') ? res.title : undefined}
                    target={res.url && !res.url.startsWith('data:') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      color: '#e2e8f0',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)'; e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
                  >
                    <div style={{ 
                      background: 'rgba(167, 139, 250, 0.2)', 
                      width: '40px', height: '40px', 
                      borderRadius: '0.5rem', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '1.2rem' 
                    }}>
                      {res.type === 'Dataset' ? '📊' : res.type === 'PDF' ? '📄' : res.type === 'Document' ? '📝' : '🔗'}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.2rem' }}>{res.title || res.type}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {res.type} • {res.url && res.url.startsWith('data:') ? 'Downloadable File' : 'External Link'}
                      </span>
                    </div>
                    <div style={{ color: '#a78bfa' }}>
                      <ExternalLink size={18} />
                    </div>
                  </a>
                  );
                })}
                
                {(!viewingResourcesFor.resources || viewingResourcesFor.resources.filter(r => r.isVisible !== false).length === 0) && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    No resources are currently visible for this event.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
