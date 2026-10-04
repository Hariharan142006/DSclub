"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import styles from './Gallery.module.css';

const galleryFiles = [
  ...Array.from({ length: 39 }, (_, i) => `https://res.cloudinary.com/k1046cqe/image/upload/f_auto,q_auto/DS_Club_Galley/${i + 1}.jpg`),
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Data_Visualization_Workshop.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/Group_Presentation_Data_Visualization_Exploration.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/NextGen_AI_Project_Expo.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582685/DS_Club_Events/Orientation_Programme.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582691/DS_Club_Events/Unlocking_Creativity_with_Generative_AI.png",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582687/DS_Club_Events/Visionary_Insights.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582687/DS_Club_Events/Visualytics.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582673/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_8.25.35_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582682/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_8.41.06_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582681/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_9.21.02_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582681/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_9.26.01_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582681/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_9.33.53_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582682/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_9.33.54_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582684/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_9.54.57_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582684/DS_Club_Galley/WhatsApp_Image_2026-04-07_at_9.55.10_AM.jpg",
  "https://res.cloudinary.com/k1046cqe/image/upload/v1790582687/DS_Club_Events/Workshop_Learning_Modeling_Inference.jpg"
];

const baseCards = galleryFiles.map((path, i) => ({
  id: i + 1,
  label: `sys.entry_${String(i + 1).padStart(2, '0')}`,
  front: path
}));

export default function Gallery() {
  const [activeIdx, setActiveIdx] = useState(0);

  const nextImg = () => setActiveIdx((activeIdx + 1) % baseCards.length);
  const prevImg = () => setActiveIdx((activeIdx - 1 + baseCards.length) % baseCards.length);

  return (
    <section id="gallery" className="section bg-alternate">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">MEDIA <span className="gradient-text">.CACHE</span></h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', marginBottom: '3rem' }}>
          {`> visual_data_stream_active`}
        </p>
      </motion.div>

      <div className={styles.terminalContainer}>
        <motion.div 
          className={styles.terminalWindow}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Terminal Header */}
          <div className={styles.terminalHeader}>
            <div className={styles.windowControls}>
               <span className={`${styles.dot} ${styles.dotRed}`}></span>
               <span className={`${styles.dot} ${styles.dotYellow}`}></span>
               <span className={`${styles.dot} ${styles.dotGreen}`}></span>
            </div>
            <div className={styles.headerTitle}>~/system/media_viewer.sh</div>
          </div>
          
          <div className={styles.terminalBody}>
            {/* Command Line Mock */}
            <div className={styles.commandLine}>
              <Terminal size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              {`> loading ${baseCards[activeIdx].label} [${activeIdx + 1}/${baseCards.length}]... OK`}
            </div>

            {/* Active Image Viewer */}
            <div className={styles.activeImageContainer}>
              <div className={styles.scanLine}></div>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  src={baseCards[activeIdx].front}
                  alt={`Data Science Club gallery image ${activeIdx + 1}`}
                  className={styles.activeImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.target.dataset.fallback) return;
                    e.target.dataset.fallback = 'true';
                    const num = activeIdx + 1;
                    e.target.src = num <= 32 ? `/Gallery/${num}.jpeg` : `/Gallery/${num}.jpg`;
                  }}
                />
              </AnimatePresence>
            </div>

            {/* Nav Controls */}
            <div className={styles.controls}>
              <button className={styles.navBtn} onClick={prevImg} aria-label="Previous photo">{`< PREV_NODE`}</button>
              <div className={styles.statusText}>STATUS: ONLINE</div>
              <button className={styles.navBtn} onClick={nextImg} aria-label="Next photo">{`NEXT_NODE >`}</button>
            </div>

            {/* Thumbnails */}
            <div className={styles.thumbnails}>
              {baseCards.map((card, idx) => (
                <div 
                  key={card.id} 
                  className={`${styles.thumb} ${idx === activeIdx ? styles.thumbActive : ''}`}
                  onClick={() => setActiveIdx(idx)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveIdx(idx); } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View gallery image ${idx + 1}`}
                >
                  <img 
                    src={card.front} 
                    alt={`DS Club event photo ${idx + 1}`} 
                    className={styles.thumbImg} 
                    loading="lazy" 
                    decoding="async" 
                    onError={(e) => {
                      if (e.target.dataset.fallback) return;
                      e.target.dataset.fallback = 'true';
                      const num = idx + 1;
                      e.target.src = num <= 32 ? `/Gallery/${num}.jpeg` : `/Gallery/${num}.jpg`;
                    }}
                  />
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
