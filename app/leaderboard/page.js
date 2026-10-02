"use client";

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, RefreshCw, ShieldAlert, ArrowLeft, User, Sparkles, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './Leaderboard.module.css';

export default function LeaderboardPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState('--:--:--');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard(page, true);
    const interval = setInterval(() => {
      fetchLeaderboard(page, false);
    }, 60000); // 60-second live telemetry polling (reduced from 15s to save bandwidth)
    return () => clearInterval(interval);
  }, [page]);

  const fetchLeaderboard = async (currentPage, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?page=${currentPage}&limit=50`);
      const data = await res.json();
      if (res.ok && data.members) {
        setMembers(data.members);
        setTotalPages(data.totalPages);
        setError('');
        setLastSynced(new Date().toLocaleTimeString());
      } else if (showLoading) {
        setError(data.error || 'Failed to load leaderboard standings.');
      }
    } catch (err) {
      if (showLoading) setError('Error fetching standings: ' + err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.heroSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div className={styles.heroBadge}>
            <Trophy size={18} color="#facc15" />
            <span>OFFICIAL COMPETITION STANDINGS</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '20px', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
            <Radio size={14} className={styles.spinner} style={{ animationDuration: '3s' }} />
            LIVE TELEMETRY STREAM — AUTO-SYNCING (3s) | LAST SYNC: {lastSynced}
          </div>
        </div>
        <h1 className={styles.heroTitle}>CLUB LEADERBOARD</h1>
        <p className={styles.heroSub}>
          Top performing Data Science Club members ranked by total competition points, hackathon victories, and quiz scores.
        </p>
      </div>

      <div className={styles.contentBox}>
        {loading ? (
          <div className={styles.loadingBox}>
            <RefreshCw size={32} className={styles.spinner} />
            <span>Calculating live rankings...</span>
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <ShieldAlert size={48} color="#ef4444" />
            <h3>Leaderboard Unavailable</h3>
            <p>{error}</p>
            <Link href="/" className={styles.backBtn}>
              <ArrowLeft size={16} /> Return to Homepage
            </Link>
          </div>
        ) : members.length === 0 ? (
          <div className={styles.emptyBox}>
            <Award size={48} color="#38bdf8" />
            <h3>No Ranked Members Yet</h3>
            <p>Participate in active code challenges or quizzes to earn XP and claim the #1 spot!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {page === 1 && members.length >= 1 && (
              <div className={styles.podiumGrid}>
                {/* Rank 2 */}
                {members[1] ? (
                  <div className={`${styles.podiumCard} ${styles.rank2}`}>
                    <div className={styles.medalBadge} style={{ background: '#94a3b8' }}>#2</div>
                    <div className={styles.podiumAvatar}>
                      <User size={32} color="#94a3b8" />
                    </div>
                    <h3 className={styles.podiumName}>{members[1].name}</h3>
                    <span className={styles.podiumDept}>{members[1].department || 'AI & DS'}</span>
                    <div className={styles.podiumScore}>{members[1].score || 0} XP</div>
                  </div>
                ) : <div />}

                {/* Rank 1 */}
                <div className={`${styles.podiumCard} ${styles.rank1}`}>
                  <div className={styles.crownTag}><Sparkles size={14} /> CHAMPION</div>
                  <div className={styles.medalBadge} style={{ background: '#facc15', color: '#000' }}>#1</div>
                  <div className={styles.podiumAvatar} style={{ border: '2px solid #facc15' }}>
                    <Trophy size={36} color="#facc15" />
                  </div>
                  <h3 className={styles.podiumName}>{members[0].name}</h3>
                  <span className={styles.podiumDept}>{members[0].department || 'AI & DS'}</span>
                  <div className={styles.podiumScore} style={{ color: '#facc15' }}>{members[0].score || 0} XP</div>
                </div>

                {/* Rank 3 */}
                {members[2] ? (
                  <div className={`${styles.podiumCard} ${styles.rank3}`}>
                    <div className={styles.medalBadge} style={{ background: '#d97706' }}>#3</div>
                    <div className={styles.podiumAvatar}>
                      <User size={32} color="#d97706" />
                    </div>
                    <h3 className={styles.podiumName}>{members[2].name}</h3>
                    <span className={styles.podiumDept}>{members[2].department || 'AI & DS'}</span>
                    <div className={styles.podiumScore}>{members[2].score || 0} XP</div>
                  </div>
                ) : <div />}
              </div>
            )}

            {/* Standings List */}
            <div className={styles.tableWrapper}>
              <table className={styles.standingsTable}>
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>MEMBER NAME</th>
                    <th>ID</th>
                    <th>DEPARTMENT / YEAR</th>
                    <th>TOTAL SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {members.map((m, idx) => (
                      <motion.tr
                        key={m._id || m.memberId || `member-${idx}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className={page === 1 && idx < 3 ? styles.topRow : ''}
                      >
                        <td className={styles.rankCell}>
                          {page === 1 && idx === 0 ? (
                            <span className={styles.badge1}>🥇 1st</span>
                          ) : page === 1 && idx === 1 ? (
                            <span className={styles.badge2}>🥈 2nd</span>
                          ) : page === 1 && idx === 2 ? (
                            <span className={styles.badge3}>🥉 3rd</span>
                          ) : (
                            <span className={styles.badgeStandard}>#{(page - 1) * 50 + idx + 1}</span>
                          )}
                        </td>
                        <td className={styles.nameCell}>
                          <strong>{m.name}</strong>
                          {m.roleInterest && <span className={styles.roleSub}>{m.roleInterest}</span>}
                        </td>
                        <td className={styles.idCell}>
                          <code>{m.memberId}</code>
                        </td>
                        <td className={styles.deptCell}>
                          {m.department || 'AI & DS'} ({m.year || '1st Year'})
                        </td>
                        <td className={styles.scoreCell}>
                          <strong>{m.score || 0}</strong> <span className={styles.xpTag}>XP</span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '0.5rem 1rem', background: '#334155', color: 'white', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, border: 'none', fontWeight: 600 }}
                >
                  Previous
                </button>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, border: 'none', fontWeight: 600 }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
