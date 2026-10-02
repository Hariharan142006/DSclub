"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Achievements.module.css';
import { useInView } from 'react-intersection-observer';
import { Activity } from 'lucide-react';

const metrics = [
  { label: 'total_members', target: 500, suffix: '+' },
  { label: 'events_conducted', target: 20, suffix: '+' },
  { label: 'academic_years', target: 5, suffix: '' },
  { label: 'office_bearers', target: 26, suffix: '' },
  { label: 'hackathon_hours', target: 24, suffix: 'H' },
];

function Counter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, target]);

  return (
    <div ref={ref} className={styles.counter}>
      <span className={styles.count}>{count}{suffix}</span>
      <span className={styles.blinker}>_</span>
    </div>
  );
}

export default function Achievements() {
  return (
    <section className="section bg-alternate">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">GLOBAL <span className="gradient-text">.TELEMETRY</span></h2>
      </motion.div>

      <div className={styles.grid}>
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            className={styles.metricCard}
            initial={{ opacity: 0, x: -60, rotateY: 15, scale: 0.85 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 70, damping: 13, delay: i * 0.1 }}
          >
            <div className={styles.cardTop}>
              <Activity size={14} className={styles.pulseIcon} />
              <span className={styles.status}>LIVE</span>
            </div>
            
            <div className={styles.dataReadout}>
              <Counter target={m.target} suffix={m.suffix} />
            </div>
            <p className={styles.label}>{`> ${m.label}`}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
