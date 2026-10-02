"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Terminal, X } from 'lucide-react';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

import styles from './Team.module.css';

const leadership = [
  {
    id: "F-01", name: 'Dr. V. Rathinapriya', role: 'faculty_coordinator',
    bio: 'Faculty Coordinator, Department of AI & Data Science.',
    image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582701/DS_Club_Team_Members_images/Dr._V._Rathinapriya.jpg',
    email: 'rathinapriyavasu02@gmail.com', linkedin: 'https://www.linkedin.com/in/dr-rathinapriya-vasu-65060923/', github: ''
  },
  {
    id: "A-01", name: 'Swarnalakshmi S', role: 'chairperson',
    bio: 'Leading the club\'s strategic vision and operations.',
    image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582715/DS_Club_Team_Members_images/Swarnalakshmi_-_Swarnalakshmi.jpg',
    email: 'swarna.singaravelan@gmail.com',
    linkedin: 'https://www.linkedin.com/in/swarnalakshmi-s',
    github: 'https://github.com/Swarna-2006'
  },
  {
    id: "A-02", name: 'Vijayakrishnan N A', role: 'vice_chairperson',
    bio: 'Supporting leadership and cross-team coordination.',
    image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582704/DS_Club_Team_Members_images/IMG-20260408-WA0001_-_Vijay.jpg',
    email: 'vijayakrishnan0710@gmail.com', linkedin: 'https://www.linkedin.com/in/vijayakrishnan-n-a-2b41632b9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', github: ''
  },
  {
    id: "A-03", name: 'Kheerthana G', role: 'secretary',
    bio: 'Managing club records, communications, and logistics.',
    image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582713/DS_Club_Team_Members_images/IMG_20260323_165121_098_-_Kheerthna_G.webp',
    email: 'kikipec108@gmail.com',
    linkedin: 'https://www.linkedin.com/in/kheerthna-ganesan',
    github: ''
  },
  {
    id: "A-04", name: 'Dhayanand T', role: 'secretary',
    bio: 'Co-managing club documentation and event planning.',
    image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582706/DS_Club_Team_Members_images/IMG_20260118_193930_-_Dhayanand_2418.jpg',
    email: 'dhaya241817@gmail.com', linkedin: 'https://www.linkedin.com/in/dhayanand-t-0078b1378?utm_source=share_via&utm_content=profile&utm_medium=member_android', github: ''
  },
  {
    id: "A-05", name: 'Saravanan P', role: 'chief_tech_lead',
    bio: 'Driving all technical initiatives and development.',
    image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582704/DS_Club_Team_Members_images/IMG-20260404-WA0014_1_-_Saravanan_Prasath.jpg',
    email: 'saravanan.prasath0713@gmail.com', linkedin: 'https://www.linkedin.com/in/saravananprasath/',
    github: 'https://github.com/Saravanan-401'
  },
  {
    id: "A-06", name: 'Rakshini H', role: 'treasurer',
    bio: 'Overseeing club finances and budget allocation.',
    image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582714/DS_Club_Team_Members_images/Rakshini_-_Rakshini_H.jpg',
    email: 'rakshinihpec@gmail.com',
    linkedin: 'https://www.linkedin.com/in/rakshini-h',
    github: 'https://github.com/RakshiniH'
  },
];

const teams = [
  {
    name: 'Digital Outreach',
    members: [

      {
        id: "D-02", name: 'Yogesh T', role: 'digital_outreach_lead',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582688/DS_Club_Team_Members_images/20251205_063241_-_Yogesh_T.jpg',
        email: 'yyogesh2905@gmail.com',
        linkedin: 'https://www.linkedin.com/in/yogesh-t-3b381a312',
        github: 'https://github.com/yyogesh2905'
      },
    ]
  },
  {
    name: 'Community & PR',
    members: [
      {
        id: "C-01", name: 'Kalaimagal S', role: 'community_engagement_lead',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582692/DS_Club_Team_Members_images/Image_-_Kalaimagal_S.jpg',
        email: 'skalaimagal323@gmail.com',
        linkedin: 'https://www.linkedin.com/in/kalaimagal23',
        github: ''
      },
      {
        id: "C-02", name: 'Antony Amala Trinita J', role: 'public_relations_lead',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582716/DS_Club_Team_Members_images/SAVE_20260406_202539_-_J.Antony_Amala_Trinita.jpg',
        email: 'jantonyamalatrinita@gmail.com',
        linkedin: 'https://www.linkedin.com/in/antony-amala-trinita',
        github: 'https://github.com/jantonyamalatrinita'
      },
      {
        id: "C-03", name: 'Mohanakumaran K', role: 'public_relations_lead',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582703/DS_Club_Team_Members_images/IMG-20260118-WA0035_-_Mohanakumaran_K.jpg',
        email: 'mohanakumarank78@gmail.com',
        linkedin: 'https://www.linkedin.com/in/mohanakumaran-k-pm7887',
        github: 'https://github.com/Mohanakumaran0708K'
      },
    ]
  },
  {
    name: 'Editorial & Reporting',
    members: [
      {
        id: "E-01", name: 'Kalpana Reddy D', role: 'editorial_lead',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582714/DS_Club_Team_Members_images/photo-resume_-_Kalpana_Reddy.jpg',
        email: 'Kalpanareddy.ai@gmail.com',
        linkedin: 'https://www.linkedin.com/in/kalpanareddy22',
        github: 'https://github.com/KalpanaReddy-22'
      },
      {
        id: "E-02", name: 'Dharshini S', role: 'editorial_lead',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582709/DS_Club_Team_Members_images/IMG_20260326_132621_-_DHARSHINI_S.jpg',
        email: 'dhars0906@gmail.com',
        linkedin: 'https://www.linkedin.com/in/dharshini-s-378833293',
        github: 'https://github.com/Dhars-19'
      },
    ]
  },
  {
    name: 'Alumni & Industry',
    members: [
      {
        id: "I-01", name: 'Mohammed Aathif Khan A', role: 'alumni_industry_liaison',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582707/DS_Club_Team_Members_images/IMG_0816_-_Aathif.jpg',
        email: 'aathifkhan5382@gmail.com',
        linkedin: 'https://www.linkedin.com/in/mohammed-aathif06',
        github: ''
      },

      {
        id: "I-03", name: 'Anandakumar R K', role: 'alumni_industry_liaison',
        image: null,
        email: '', linkedin: '', github: ''
      },
    ]
  },

  {
    name: 'Event Coordinators',
    members: [
      {
        id: "V-01", name: 'Dinesh P', role: 'creative_event_coordinator',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582706/DS_Club_Team_Members_images/IMG_20260116_172127_066_2_-_Dinesh.jpg',
        email: 'dinesh353500@gmail.com',
        linkedin: 'https://www.linkedin.com/in/dinesh-p-608b43328',
        github: ''
      },
      {
        id: "V-02", name: 'Hari Haran K', role: 'tech_event_coordinator',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582715/DS_Club_Team_Members_images/WhatsApp_Image_2026-02-02_at_8.57.15_PM_-_HARI_HARAN_K.jpg',
        email: 'hariharank142006@gmail.com',
        linkedin: 'https://www.linkedin.com/in/hari-haran-k-194777338/',
        github: 'https://github.com/Hariharan142006'
      },
      {
        id: "V-03", name: 'Gauthamkumar U', role: 'tech_event_coordinator',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582692/DS_Club_Team_Members_images/Gauthamkumar_U.jpg',
        email: 'gautham3177@gmail.com', 
        linkedin: 'https://www.linkedin.com/in/u-gautham-kumar-596147314?utm_source=share_via&utm_content=profile&utm_medium=member_android', 
        github: 'https://github.com/TIGERZEONX'
      },
      {
        id: "V-04", name: 'Geattam Dhanush', role: 'team_ops_coordinator',
        image: null,
        email: '', linkedin: '', github: ''
      },
      {
        id: "V-05", name: 'Amudala Bhaddresh', role: 'finance_event_coordinator',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582703/DS_Club_Team_Members_images/IMG-20250829-WA0009_-_Bhaddresh_Amudala.jpg',
        email: 'bhaddreshamudala@gmail.com',
        linkedin: 'https://www.linkedin.com/in/bhaddresh-amudala-344324328',
        github: ''
      },
      {
        id: "V-06", name: 'Gokul M', role: 'capture_crew_coordinator',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582693/DS_Club_Team_Members_images/2545bdcc-6815-4329-b6be-22270b82b7ee_-_Gokul_1.jpg',
        email: 'gokulmoorthi237@gmail.com', linkedin: 'https://www.linkedin.com/in/gokul-m-28aba5339?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', github: ''
      },
      {
        id: "V-07", name: 'Sriram K', role: 'tech_event_coordinator',
        image: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582704/DS_Club_Team_Members_images/IMG-20260123-WA0032_1_-_Sriram_Kalaikumar.jpg',
        email: 'sriramkalaikumar@gmail.com',
        linkedin: 'https://www.linkedin.com/in/sriram-kalaikumar-41b8a6328',
        github: 'https://github.com/sriramk-ui'
      },
    ]
  }
];

function MemberAvatar({ member }) {
  if (member.image) {
    return (
      <div className={styles.imgWrapper}>
        <img
          src={member.image}
          alt={member.name}
          className={styles.img}
          loading="lazy"
        />
        <div className={styles.imgOverlay} />
      </div>
    );
  }
  return (
    <div className={styles.imgWrapper}>
      <div className={styles.avatarPlaceholder}>
        {(member?.name || 'Unknown').split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
    </div>
  );
}

function LeaderCard({ member, index }) {
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 50, rotateX: 15, scale: 0.88 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 70, damping: 13, delay: index * 0.08 }}
      whileHover={{
        y: showTerminal ? 0 : -12,
        scale: showTerminal ? 1 : 1.06,
        rotateX: showTerminal ? 0 : 5,
        rotateY: showTerminal ? 0 : 5
      }}
      onClick={() => setShowTerminal(!showTerminal)}
      style={{ cursor: 'pointer', transformStyle: 'preserve-3d' }}
    >
      <div className={styles.cardTopBar}>
        <span className={styles.idTag}>[{member.id}]</span>
        <div className={showTerminal ? styles.statusDotActive : styles.statusDot}></div>
      </div>

      <MemberAvatar member={member} />

      <div className={styles.info}>
        <h3>{member.name}</h3>
        <span className={styles.role}>{`~/${member.role}`}</span>
        <p className={styles.bio}>{member.bio}</p>
      </div>

      <TerminalOverlay member={member} isVisible={showTerminal} onClose={() => setShowTerminal(false)} />
    </motion.div>
  );
}

function TerminalOverlay({ member, isVisible, onClose }) {
  const [textStage, setTextStage] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const t0 = setTimeout(() => setTextStage(0), 0);
      const t1 = setTimeout(() => setTextStage(1), 300);
      const t2 = setTimeout(() => setTextStage(2), 700);
      return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isVisible]);

  const hasAnySocial = member.email || member.linkedin || member.github;

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          key={`team-term-${member.id || 'curr'}`}
          className={`${styles.terminalOverlay} ${styles.terminalGlitch}`}
        >
          <div className={styles.termHeader}>
            <Terminal size={14} />
            <span>root@nodes_sys: {member.id}</span>
            <button
              className={styles.closeBtn}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="Close terminal"
            >
              <X size={16} />
            </button>
          </div>
          <div className={styles.termBody}>
            <p className={styles.termLine}>{'>'} Extracting entity data...</p>
            {textStage >= 1 && <p className={styles.termLine}>{'>'} Neural link established.</p>}
            {textStage >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {hasAnySocial ? (
                  <>
                    <p className={styles.termLine}>{'>'} Auth OK. Connections:</p>
                    <div className={styles.terminalSocials}>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className={styles.termIcon} onClick={(e) => e.stopPropagation()}>
                          <FiMail size={20} /> <span>SECURE_MAIL</span>
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noreferrer" className={styles.termIcon} onClick={(e) => e.stopPropagation()}>
                          <FiLinkedin size={20} /> <span>LINKEDIN_CONNECT</span>
                        </a>
                      )}
                      {member.github && (
                        <a href={member.github.startsWith('http') ? member.github : `https://${member.github}`} target="_blank" rel="noreferrer" className={styles.termIcon} onClick={(e) => e.stopPropagation()}>
                          <FiGithub size={20} /> <span>GITHUB_PROFILE</span>
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <p className={styles.termLine}>{'>'} No external links available.</p>
                )}
              </motion.div>
            )}
            <span className={styles.cursor}>_</span>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function NodeCard({ member, i }) {
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, rotateY: i % 2 === 0 ? 12 : -12 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 80, damping: 14, delay: i * 0.05 }}
      whileHover={{
        y: showTerminal ? 0 : -10,
        scale: showTerminal ? 1 : 1.05,
        rotateX: showTerminal ? 0 : 5,
        rotateY: showTerminal ? 0 : -5
      }}
      onClick={() => setShowTerminal(!showTerminal)}
      style={{ cursor: 'pointer', transformStyle: 'preserve-3d' }}
    >
      <div className={styles.cardTopBar}>
        <span className={styles.idTag}>[{member.id}]</span>
        <div className={showTerminal ? styles.statusDotActive : styles.statusDot}></div>
      </div>

      <MemberAvatar member={member} />

      <div className={styles.info}>
        <h3>{member.name}</h3>
        <span className={styles.role}>{`~/${member.role}`}</span>
      </div>

      <TerminalOverlay member={member} isVisible={showTerminal} onClose={() => setShowTerminal(false)} />
    </motion.div>
  );
}

export default function Team() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="team" className="section">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">CORE <span className="gradient-text">.NODES</span></h2>
      </motion.div>

      {/* Leadership Grid */}
      <div className={styles.grid}>
        {leadership.map((member, i) => (
          <LeaderCard key={member.id} member={member} index={i} />
        ))}
      </div>

      {/* Expandable Team Groups */}
      <motion.div
        style={{ textAlign: 'center', margin: '2rem 0 1rem' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => setShowAll(!showAll)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {showAll ? 'COLLAPSE' : 'EXPAND'} TEAM NETWORK [{teams.reduce((a, t) => a + t.members.length, 0)} NODES]
          {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </motion.div>

      <AnimatePresence>
        {showAll && (
          <motion.div
            key="team-network-all"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            style={{ overflow: 'hidden' }}
          >
            {teams.map((team, tIdx) => (
              <div key={tIdx} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--accent-cyan)' }}>
                  {`> ${team.name.toUpperCase()}`}
                </h3>
                <div className={styles.grid}>
                  {team.members.map((member, i) => (
                    <NodeCard key={member.id} member={member} i={i} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
