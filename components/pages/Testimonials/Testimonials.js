"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonials = [
  { text: "Joining this club was the best decision of my college life. The mentorship I received helped me secure an internship as a Data Analyst.", name: "Aarav S.", role: "3rd Year, IT Dept.", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&fit=crop" },
  { text: "The hackathons are intense but incredibly rewarding. I built my first end-to-end ML pipeline here.", name: "Sita R.", role: "4th Year, CSE Dept.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&fit=crop" },
  { text: "From knowing zero Python to building neural networks, the weekly sessions are structured perfectly for beginners.", name: "Rohan M.", role: "2nd Year, AI&DS Dept.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&fit=crop" },
  { text: "An amazing community. We don't just learn data science; we learn how to think critically about data.", name: "Anita K.", role: "3rd Year, ECE Dept.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&fit=crop" }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">Member <span className="gradient-text">Experiences</span></h2>
      </motion.div>

      <div className={styles.sliderContainer}>
        <button className={styles.navBtn} onClick={prev} aria-label="Previous testimonial"><ChevronLeft size={24}/></button>

        <div className={styles.sliderWindow}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 60, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, x: -60, scale: 0.9, rotateY: 10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className={styles.testimonialCard}
            >
              <Quote className={styles.quoteIcon} size={40} />
              <p className={styles.quoteText}>&quot;{testimonials[index].text}&quot;</p>
              
              <div className={styles.author}>
                <img src={testimonials[index].img} alt={testimonials[index].name} className={styles.avatar} />
                <div>
                  <h3 style={{ fontSize: '1rem' }}>{testimonials[index].name}</h3>
                  <span>{testimonials[index].role}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button className={styles.navBtn} onClick={next} aria-label="Next testimonial"><ChevronRight size={24}/></button>
      </div>
      
      <div className={styles.dots}>
        {testimonials.map((_, i) => (
          <button 
            key={i} 
            className={`${styles.dot} ${i === index ? styles.activeDot : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
