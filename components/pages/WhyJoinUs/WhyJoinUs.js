"use client";

import { motion } from 'framer-motion';
import { Settings, Layers, Code2, Cpu, HardDrive, TerminalSquare } from 'lucide-react';
import styles from './WhyJoinUs.module.css';

const reasons = [
  { icon: TerminalSquare, title: "Execution Environment", desc: "Gain root access to practical workshops and coding pipelines." },
  { icon: Layers, title: "Neural Constructs", desc: "Deploy industry-grade architectures that bypass standard limits." },
  { icon: Code2, title: "Datathon Operations", desc: "Test optimization under pressure in competitive datathons." },
  { icon: Cpu, title: "Compute Nodes", desc: "Form clusters with peers to process complex problem sets together." },
  { icon: HardDrive, title: "Data Repositories", desc: "Store and access exclusive datasets and deep learning resources." },
  { icon: Settings, title: "Admin Protocols", desc: "Receive direct configuration guidance from alumni and industry admins." },
];

export default function WhyJoinUs() {
  return (
    <section className="section bg-alternate">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }}
      >
        <h2 className="section-title">WHY JOIN <span className="gradient-text">.US</span></h2>
      </motion.div>


      <div className={styles.grid}>
        {reasons.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div 
              key={idx}
              className={styles.techCard}
              initial={{ opacity: 0, y: 60, rotateX: 15, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 80, damping: 12, delay: idx * 0.08 }}
              whileHover={{ y: -8, borderColor: 'var(--accent-cyan)', scale: 1.02 }}
            >
              <div className={styles.iconWrapper}><Icon size={24} /></div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className={styles.cornerTr}></div>
              <div className={styles.cornerBl}></div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
