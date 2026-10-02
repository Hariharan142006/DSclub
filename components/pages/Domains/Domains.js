"use client";

import { motion } from 'framer-motion';
import { Activity, BarChart2, Brain, CheckSquare, Database, LineChart, Network, Terminal } from 'lucide-react';
import styles from './Domains.module.css';

const domains = [
  { icon: Brain, title: "machine_learning", desc: "Build predictive models and algorithms that learn from data." },
  { icon: BarChart2, title: "data_analytics", desc: "Analyze raw data to uncover trends and actionable insights." },
  { icon: LineChart, title: "data_visualization", desc: "Create interactive dashboards and visual data stories." },
  { icon: Network, title: "artificial_intelligence", desc: "Explore neural networks, NLP, and computer vision." },
  { icon: Terminal, title: "python_programming", desc: "Master the core programming language for data science." },
  { icon: Activity, title: "research_and_innovation", desc: "Publish papers and contribute to cutting-edge tech." },
  { icon: Database, title: "business_intelligence", desc: "Transform data into strategic business decisions." },
  { icon: CheckSquare, title: "competitive_programming", desc: "Sharpen algorithmic thinking and problem solving." }
];

export default function Domains() {
  return (
    <section className="section">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">ACTIVE <span className="gradient-text">DOMAINS</span></h2>
      </motion.div>

      <div className={styles.grid}>
        {domains.map((domain, i) => {
          const Icon = domain.icon;
          return (
            <motion.div 
              key={i} 
              className={styles.domainNode}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60, rotateY: i % 2 === 0 ? 20 : -20, scale: 0.85 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 70, damping: 14, delay: i * 0.07 }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <div className={styles.nodeHeader}>
                <Icon size={18} className={styles.iconNode} />
                <span className={styles.nodeTitle}>{domain.title}.py</span>
              </div>
              <div className={styles.nodeBody}>
                <span className={styles.hash}># </span>
                <p>{domain.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
