"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Terminal, Database, Activity, Code2 } from 'lucide-react';
import styles from './Hero.module.css';

const stats = [
  { id: 'usr_cnt', label: 'MEMBERS', value: '500+', status: 'ONLINE' },
  { id: 'evt_log', label: 'EVENTS', value: '25+', status: 'COMPLETED' },
  { id: 'yrs_run', label: 'YEARS', value: '5', status: 'ACTIVE' },
  { id: 'hck_hrs', label: 'HACKATHON', value: '24H', status: 'NATIONAL' },
];

export default function Hero() {
  const [text, setText] = useState('');
  const fullText = "Initializing Data Models...";
  
  useEffect(() => {
    let currentText = '';
    let i = 0;
    const interval = setInterval(() => {
      currentText += fullText[i];
      setText(currentText);
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className={styles.heroSection}>
      <div className={styles.gridContainer}>
        <div className={styles.textContent}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.terminalHeader}>
              <Terminal size={16} className="gradient-text"/>
              <span>SYSTEM.BOOT()</span>
            </div>

            <div style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '20px', padding: '6px 16px', fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px', boxShadow: '0 0 15px rgba(56, 189, 248, 0.15)' }}>
              ★ Recognized as the Top Club & Best Tech Club in Panimalar Engineering College ★
            </div>
            
            <h1 className={styles.title}>
              <span className={styles.typewriter}>{text}</span><span className={styles.cursor}>_</span>
              <br/>
              <span className="gradient-text">DATA SCIENCE CLUB</span>
            </h1>
            
            <p className={styles.subtitle}>
              {`> _Panimalar Engineering College`}
              <br/>
              {`> Dept. of AI & Data Science | Est. 2021`}
              <br/>
              {`> Welcome to the nexus of innovation.`}
            </p>
            
            <div className={styles.actions}>
              <a href="#contact" className="btn btn-primary">[ EXECUTE: JOIN ]</a>
              <a href="#events" className="btn btn-secondary">{`< READ: EVENTS />`}</a>
            </div>
          </motion.div>

          <motion.div 
            className={styles.stats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {stats.map((stat, idx) => (
              <div key={idx} className={styles.statLine}>
                <span className={styles.statId}>[{stat.id}]:</span>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statStatus}>[{stat.status}]</span>
              </div>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          className={styles.visualContent}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className={styles.codeMockup}>
            <div className={styles.mockupHeader}>
              <span className={styles.redDot}></span>
              <span className={styles.yellowDot}></span>
              <span className={styles.greenDot}></span>
              <span className={styles.headerTitle}>~/workspace/train_model.py</span>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.codeLine}><span className={styles.keyword}>import</span> tensorflow <span className={styles.keyword}>as</span> tf</div>
              <div className={styles.codeLine}><span className={styles.keyword}>import</span> pandas <span className={styles.keyword}>as</span> pd</div>
              <br/>
              <div className={styles.codeLine}><span className={styles.comment}># Load spatial parameters</span></div>
              <div className={styles.codeLine}>model = tf.keras.Sequential([</div>
              <div className={styles.codeLine}>  tf.keras.layers.Dense(<span className={styles.number}>128</span>, activation=<span className={styles.string}>&apos;relu&apos;</span>),</div>
              <div className={styles.codeLine}>  tf.keras.layers.Dropout(<span className={styles.number}>0.2</span>),</div>
              <div className={styles.codeLine}>  tf.keras.layers.Dense(<span className={styles.number}>10</span>, activation=<span className={styles.string}>&apos;softmax&apos;</span>)</div>
              <div className={styles.codeLine}>])</div>
              <br/>
              <div className={styles.codeLine}>model.compile(optimizer=<span className={styles.string}>&apos;adam&apos;</span>, loss=<span className={styles.string}>&apos;sparse_categorical_crossentropy&apos;</span>)</div>
              <motion.div 
                className={styles.codeLine}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className={styles.comment}>Epoch 1/50: 100% |██████████| [Loss: 0.0412, Accuracy: 0.985]</span>
              </motion.div>
            </div>
            
            <motion.div 
              className={styles.floatingWidget}
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <Activity size={20} className="gradient-text"/>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sys.Load</span>
                <p>Normal</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <a href="#about" className={styles.scrollIndicator} aria-label="Scroll to about section">
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown size={32} />
        </motion.div>
      </a>
    </section>
  );
}
