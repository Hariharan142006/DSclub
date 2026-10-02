"use client";

import { motion } from 'framer-motion';
import { BookOpen, Code, Trophy, Mic, Rocket, Briefcase } from 'lucide-react';
import styles from './Workshops.module.css';

const activities = [
  { icon: BookOpen, title: "Weekly Learning Circles", desc: "Peer-to-peer study sessions for ML basics." },
  { icon: Code, title: "Live Coding Sessions", desc: "Hands-on coding walkthroughs." },
  { icon: Trophy, title: "Kaggle Practice", desc: "Team up to solve datasets and win." },
  { icon: Mic, title: "Guest Lectures", desc: "Insights from industry professionals." },
  { icon: Rocket, title: "Mini Project Sprints", desc: "Build a project in 2 weeks." },
  { icon: Briefcase, title: "Career Guidance", desc: "Resume building and mock interviews." },
];

export default function Workshops() {
  return (
    <section className="section">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">Workshops & <span className="gradient-text">Activities</span></h2>
      </motion.div>

      <div className={styles.scrollWrapper}>
        <div className={styles.scrollContainer}>
          {activities.map((act, i) => {
            const Icon = act.icon;
            return (
              <motion.div 
                key={i} 
                className={styles.card}
                initial={{ opacity: 0, x: 80, rotateY: -20, scale: 0.85 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 70, damping: 14, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className={styles.iconBox}><Icon size={24} /></div>
                <h3>{act.title}</h3>
                <p>{act.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
