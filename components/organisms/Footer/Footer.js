"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaLinkedin as Linkedin, FaInstagram as Instagram, FaEnvelope as EmailIcon } from 'react-icons/fa';
import styles from './Footer.module.css';
import IDCardModal from '../IDCardModal/IDCardModal';

export default function Footer() {
  const pathname = usePathname();
  const [idCardOpen, setIdCardOpen] = useState(false);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/challenges')) {
    return null;
  }

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.brandCol}>
              <h2 className="gradient-text">Data Science Club</h2>
              <p className={styles.tagline}>Learn, Build, Analyze, Innovate</p>
              <p className={styles.desc}>
                Empowering students at Panimalar Engineering College with data-driven skills for the future of technology.
              </p>
              <div className={styles.socials}>
                <a href="https://www.linkedin.com/company/datascienceclubpec" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
                <a href="https://www.instagram.com/datascienceclub_pec" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
                <a href="mailto:pecdatascienceclub@gmail.com" aria-label="Email"><EmailIcon size={20} /></a>
              </div>
            </div>

            <div className={styles.linksCol}>
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#events">Events</a></li>
                <li><a href="#gallery">Gallery</a></li>
              </ul>
            </div>

            <div className={styles.linksCol}>
              <h4>Member Portal</h4>
              <ul>
                <li><a href="/challenges">Challenges Arena</a></li>
                <li><a href="/leaderboard">Global Leaderboard</a></li>
                <li>
                  <button onClick={() => setIdCardOpen(true)} className={styles.idCardBtn}>
                    View ID Card
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.bottomBar}>
            <p>&copy; {new Date().getFullYear()} Data Science Club, Panimalar Engineering College. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <IDCardModal isOpen={idCardOpen} onClose={() => setIdCardOpen(false)} />
    </>
  );
}
