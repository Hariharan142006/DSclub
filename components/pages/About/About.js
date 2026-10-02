"use client";

import { motion } from 'framer-motion';
import { Target, Flag, Database, Cpu, Network, Binary } from 'lucide-react';
import styles from './About.module.css';

export default function About() {
  const values = [
    { name: 'Data Science', icon: Cpu },
    { name: 'AI & Neural Nets', icon: Network },
    { name: 'Data Pipeline', icon: Database },
    { name: 'Analytics', icon: Binary }
  ];

  return (
    <section id="about" className="section">
      <motion.div 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">ABOUT<span className="gradient-text">_SYS</span></h2>
      </motion.div>

      <div className={styles.grid}>
        <motion.div 
          className={styles.leftCol}
          initial={{ opacity: 0, x: -80, rotateY: 15 }} 
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }} 
          viewport={{ once: true }} 
          transition={{ type: 'spring', stiffness: 60, damping: 15, duration: 0.8 }}
        >
          <div className={styles.introCard}>
            <h3>{`// SYSTEM_ORIGIN`}</h3>
            <p>
              Recognized as the <strong>top club in Panimalar</strong> and the <strong>best club in Panimalar Engineering College</strong> for technology and innovation, the Data Science Club was established on 18.03.2021 in collaboration with Imarticus Learning. We aim to harness the growing importance of data science by fostering technical excellence, competitive hackathons, and analytical thinking among students.
            </p>
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Department of Artificial Intelligence and Data Science, Panimalar Engineering College, Chennai - 600 123
            </p>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={i} className={styles.valueItem}>
                    <div className={styles.iconBox}><Icon size={18} /></div>
                    <span>{v.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={styles.rightCol}
          initial={{ opacity: 0, x: 80, rotateY: -15 }} 
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }} 
          viewport={{ once: true }} 
          transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.2 }}
        >
          <div className={styles.visionMission}>
            <div className={styles.hudCard} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.cardHeader}>
                <Target className="gradient-text" size={28} />
                <h3>[ OBJECTIVE: VISION ]</h3>
              </div>
              <p className={styles.cardText}>
                To empower students with strong capabilities in data science by enabling them to apply advanced techniques, master computational tools, and develop programming expertise, while fostering meaningful collaborations between academia and industry.
              </p>
            </div>
            
            <div className={styles.hudCard}>
              <div className={styles.cardHeader}>
                <Flag className="gradient-text" size={28} />
                <h3>[ DIRECTIVE: MISSION ]</h3>
              </div>
              <p className={styles.cardText}>
                To deliver high-quality education in data science by equipping students with essential technical and analytical skills, enhancing their employability, and providing meaningful exposure to industry practices and real-world applications.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
