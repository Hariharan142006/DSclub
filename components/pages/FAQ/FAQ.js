"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

const faqs = [
  { q: "Who can join the club?", a: "The physical club is primarily open to all students of Panimalar Engineering College, regardless of their department or year. We believe data science is interdisciplinary!" },
  { q: "Do I need prior coding experience?", a: "Not at all. We have beginner-friendly sessions starting from the absolute basics of Python and logic building." },
  { q: "How often are events conducted?", a: "We conduct hands-on learning sessions every week, and major events like hackathons or guest lectures once a month." },
  { q: "Is it open to all departments?", a: "Yes! Whether you are from CSE, ECE, Mechanical, or IT, data is everywhere. We highly encourage cross-disciplinary learning." },
  { q: "How can I become a core member?", a: "Core member selections are held at the beginning of the academic year based on your past contributions, project showcase, and a short interview." }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="section bg-alternate">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
      </motion.div>

      <div className={styles.faqList}>
        {faqs.map((faq, i) => (
          <motion.div 
            key={i} 
            className={styles.faqItem}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80, damping: 15, delay: i * 0.08 }}
          >
            <button className={styles.questionBtn} onClick={() => toggle(i)} aria-expanded={openIdx === i}>
              <span className={styles.qText}>{faq.q}</span>
              <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} className={styles.iconBox}>
                <ChevronDown size={20} />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div 
                  key={`faq-ans-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={styles.answerBox}
                >
                  <p>{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
