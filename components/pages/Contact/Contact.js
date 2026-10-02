"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { FiLinkedin, FiInstagram } from 'react-icons/fi';
import styles from './Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    year: '1st Year',
    department: '',
    interest: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', year: '1st Year', department: '', interest: '' });
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Error submitting application: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h2 className="section-title">Join <span className="gradient-text">The Club</span></h2>
      </motion.div>

      <div className={styles.grid}>
        <motion.div 
          className={styles.infoCol}
          initial={{ opacity: 0, x: -80, rotateY: 15 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }}
        >
          <h3>Ready to Decode the Future?</h3>
          <p>
            Become a part of the most active tech community at Panimalar Engineering College. 
            Whether you want to build models, perform data analysis, or win hackathons—this is your launchpad.
          </p>

          <div className={styles.contactDetails}>
            <a href="mailto:pecdatascienceclub@gmail.com" className={styles.detailItem}>
              <Mail className="gradient-text" size={24} />
              <div>
                <h4>Email Us</h4>
                <span>pecdatascienceclub@gmail.com</span>
              </div>
            </a>
            <div className={styles.detailItem}>
              <MapPin className="gradient-text" size={24} />
              <div>
                <h4>Find Us</h4>
                <span>AI&DS Block I, Panimalar Engineering College</span>
              </div>
            </div>
          </div>

          <div className={styles.socialLinks}>
            <a href="https://www.linkedin.com/company/datascienceclubpec" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
              <FiLinkedin size={20} /> <span>LinkedIn</span>
            </a>
            <a href="https://www.instagram.com/datascienceclub_pec" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
              <FiInstagram size={20} /> <span>Instagram</span>
            </a>
          </div>
        </motion.div>

        <motion.div 
          className={styles.formCol}
          initial={{ opacity: 0, y: 80, rotateX: 10, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.15 }}
        >
          {submitted ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '1rem', padding: '2.5rem 2rem', textAlign: 'center', color: '#fff' }}>
              <CheckCircle2 size={56} color="#34d399" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginBottom: '0.75rem' }}>Application Submitted!</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Thank you for applying to join Panimalar Data Science Club! Your application has been received and sent directly to our Admin Dashboard for review.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className={`btn btn-primary ${styles.submitBtn}`}
                style={{ margin: '0 auto', display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }}
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="name">Full Name *</label>
                <input type="text" id="name" placeholder="Your Name" required value={formData.name} onChange={handleChange} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" placeholder="your@email.com" required value={formData.email} onChange={handleChange} />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="year">Year of Study *</label>
                  <select id="year" required value={formData.year} onChange={handleChange}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="department">Department *</label>
                  <input type="text" id="department" placeholder="e.g., AI&DS" required value={formData.department} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="interest">Area of Interest</label>
                <textarea id="interest" rows="3" placeholder="Tell us what you're interested in..." value={formData.interest} onChange={handleChange}></textarea>
              </div>

              <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
