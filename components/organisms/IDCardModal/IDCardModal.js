"use client";

import { useState, useEffect } from 'react';
import { X, Shield, Award, Sparkles, Download, Search, CheckCircle2, User, Building, Calendar, Mail, Trophy } from 'lucide-react';
import styles from './IDCardModal.module.css';

export default function IDCardModal({ isOpen, onClose, initialMemberId = null }) {
  const [memberIdInput, setMemberIdInput] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const storedId = initialMemberId || sessionStorage.getItem('dsclub_memberId');
      if (storedId) {
        setMemberIdInput(storedId);
        fetchMemberDetails(storedId);
      } else {
        setMemberData(null);
        setError('');
      }
    }
  }, [isOpen, initialMemberId]);

  const fetchMemberDetails = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/members/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: idToFetch }),
      });
      let data = {};
      try { data = await res.json(); } catch (e) {}
      if (res.ok && (data.success || data.valid || data.member)) {
        const m = data.member || data;
        setMemberData(m);
        sessionStorage.setItem('dsclub_memberId', m.memberId);
        sessionStorage.setItem('dsclub_memberName', m.name);
      } else {
        setError(data.error || 'Invalid Member ID. Please check and try again.');
        setMemberData(null);
      }
    } catch (err) {
      setError('Error verifying ID: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMemberDetails(memberIdInput.trim());
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} style={{ zIndex: 2000 }}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.headerTitleRow}>
            <Shield className={styles.shieldIcon} size={26} />
            <h2>Digital Membership ID Card</h2>
          </div>
          <p>Verify your official identity and check your accumulated data science competition XP.</p>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={memberIdInput}
              onChange={(e) => setMemberIdInput(e.target.value)}
              placeholder="Enter Member ID (e.g. DSCAI4829)"
              required
            />
            <button type="submit" disabled={loading} className={styles.searchBtn}>
              {loading ? 'Checking...' : <><Search size={16} /> Show ID Card</>}
            </button>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </form>

        {/* Display Holographic ID Card */}
        {memberData ? (
          <div className={styles.idCardContainer}>
            <div className={styles.hologramCard}>
              <div className={styles.cardHeader}>
                <div className={styles.collegeBrand}>
                  <img src="/pec-logo.png" alt="PEC" className={styles.pecLogo} />
                  <div style={{ borderLeft: '1px solid rgba(0, 240, 255, 0.3)', paddingLeft: '0.75rem' }}>
                    <span className={styles.collegeName} style={{ color: '#00f0ff', fontSize: '0.95rem' }}>DEPT. OF AI & DATA SCIENCE</span>
                    <span className={styles.deptSub} style={{ color: '#cbd5e1' }}>Official Data Science Club Portal</span>
                  </div>
                </div>
                <img src="/ds-logo.jpg" alt="DS Club" className={styles.dsLogo} />
              </div>

              <div className={styles.cardBanner}>
                <span>OFFICIAL DATA SCIENCE CLUB MEMBER</span>
                <Sparkles size={16} />
              </div>

              <div className={styles.cardBody}>
                <div className={styles.avatarSection}>
                  <div className={styles.avatarCircle}>
                    <User size={48} color="#00f0ff" />
                  </div>
                  <div className={styles.statusTag}>
                    <CheckCircle2 size={12} /> VERIFIED
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <div className={styles.nameLabel}>MEMBER NAME</div>
                  <h3 className={styles.memberName}>{memberData.name}</h3>

                  <div className={styles.idBadgeBox}>
                    <span className={styles.idLabel}>MEMBER ID</span>
                    <span className={styles.idValue}>{memberData.memberId}</span>
                  </div>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <Building size={14} className={styles.detailIcon} />
                      <div>
                        <span>DEPARTMENT</span>
                        <strong>{memberData.department || 'AI & DS'}</strong>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <Calendar size={14} className={styles.detailIcon} />
                      <div>
                        <span>ACADEMIC YEAR</span>
                        <strong>{memberData.year || '1st Year'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.scoreBox}>
                  <Trophy size={20} color="#facc15" />
                  <div>
                    <span className={styles.scoreLabel}>COMPETITION SCORE</span>
                    <span className={styles.scoreValue}>{memberData.score || 0} XP</span>
                  </div>
                </div>

                <div className={styles.barcodeSection}>
                  <div className={styles.barcodeLines}>||| | |||| || | ||| |||| | ||</div>
                  <span className={styles.barcodeText}>AUTH_KEY: {memberData._id?.slice(-8).toUpperCase() || 'DS2026'}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button onClick={() => window.print()} className={styles.printBtn}>
                <Download size={16} /> Print / Save ID Card
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyCardBox}>
            <Award size={48} color="#38bdf8" />
            <h3>No ID Card Selected</h3>
            <p>Enter your <strong>DSCAIXXXX</strong> ID above to render your digital membership badge and current XP ranking.</p>
          </div>
        )}
      </div>
    </div>
  );
}
