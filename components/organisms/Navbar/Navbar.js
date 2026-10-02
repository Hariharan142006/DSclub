"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Shield, Zap, UserPlus, Trophy } from 'lucide-react';
import styles from './Navbar.module.css';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import JoinModal from '../JoinModal/JoinModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [challengesEnabled, setChallengesEnabled] = useState(true);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [joinMemberEnabled, setJoinMemberEnabled] = useState(true);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    if (nextCount >= 7) {
      setLogoClickCount(0);
      router.push('/admin');
    } else {
      setLogoClickCount(nextCount);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data) {
          if (typeof data.challengesEnabled === 'boolean') {
            setChallengesEnabled(data.challengesEnabled);
          }
          if (typeof data.leaderboardEnabled === 'boolean') {
            setLeaderboardEnabled(data.leaderboardEnabled);
          }
          if (typeof data.joinMemberEnabled === 'boolean') {
            setJoinMemberEnabled(data.joinMemberEnabled);
          }
        }
      } catch (err) {
        // Silently ignore polling network errors during dev server reloads/recompilation
      }
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 60000); // Polling every 60s for real-time live toggle updates
    return () => clearInterval(interval);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/challenges')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Events', href: '/#events' },
    { name: 'Gallery', href: '/#gallery' },
    { name: 'Team', href: '/#team' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <>
      <nav className={clsx(styles.navbar, { [styles.scrolled]: isScrolled })} style={{ zIndex: 1000 }}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Link href="/#home"><img src="/pec-logo.png" alt="Panimalar Engineering College" className={styles.collegeLogo} onClick={handleLogoClick} /></Link>
          </div>

          <div className={styles.desktopNav}>
            {challengesEnabled && (
              <Link href="/challenges" className={styles.challengesBtn}>
                <Zap size={16} className={styles.zapIcon} />
                <span>Challenges</span>
              </Link>
            )}

            {leaderboardEnabled && (
              <Link href="/leaderboard" className={styles.leaderboardBtn}>
                <Trophy size={16} />
                <span>Leaderboard</span>
              </Link>
            )}

            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={styles.navLink}>
                {link.name}
              </Link>
            ))}

            {joinMemberEnabled && (
              <button
                onClick={() => setJoinModalOpen(true)}
                className={clsx("btn btn-primary", styles.joinBtn)}
              >
                <UserPlus size={16} />
                <span>Join Member</span>
              </button>
            )}

            <img 
              src="/ds logo.jpg" 
              alt="Data Science Club" 
              className={styles.dsLogo} 
              onClick={handleLogoClick}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Data Science Club"
            />
          </div>

          <div className={styles.mobileActions}>
            <img 
              src="/ds logo.jpg" 
              alt="Data Science Club" 
              className={styles.dsLogo} 
              onClick={handleLogoClick}
              style={{ cursor: 'pointer', userSelect: 'none', marginRight: '0.75rem' }}
              title="Data Science Club"
            />
            <button
              className={styles.hamburger}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-nav-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.mobileMenu}
            >
              {challengesEnabled && (
                <Link
                  href="/challenges"
                  className={styles.mobileChallengesBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Zap size={18} />
                  <span>Challenges</span>
                </Link>
              )}

              {leaderboardEnabled && (
                <Link
                  href="/leaderboard"
                  className={styles.mobileLeaderboardBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy size={18} />
                  <span>Leaderboard</span>
                </Link>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {joinMemberEnabled && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setJoinModalOpen(true);
                  }}
                  className={clsx("btn btn-primary", styles.mobileBtn)}
                >
                  <UserPlus size={18} />
                  <span>Join Member</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <JoinModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </>
  );
}
