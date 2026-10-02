"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, Zap, Calendar, Trophy, ToggleLeft, ToggleRight, ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, Server, Activity, ArrowUpRight, PlusCircle, Award, Code2, Clock, Cpu, ShieldAlert, Terminal, Play, Check, Database, FileText } from 'lucide-react';
import styles from '../Admin.module.css';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ members: 0, applications: 0, challenges: 0, events: 0 });
  const [challengesEnabled, setChallengesEnabled] = useState(true);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [antiCheatEnabled, setAntiCheatEnabled] = useState(true);
  const [joinMemberEnabled, setJoinMemberEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [cheatLoading, setCheatLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData(false, false);

    // Silent 30s background telemetry polling to reduce server load
    const syncTimer = setInterval(() => {
      fetchDashboardData(false, true);
    }, 30000);

    return () => {
      clearInterval(syncTimer);
    };
  }, []);

  const fetchDashboardData = async (isManualSync = false, isSilent = false) => {
    if (!isSilent) setLoading(true);

    try {
      const safeFetch = (url) => fetch(url, { cache: 'no-store' }).catch(() => null);

      const [membersRes, applicationsRes, challengesRes, eventsRes, settingsRes] = await Promise.all([
        safeFetch('/api/members'),
        safeFetch('/api/applications'),
        safeFetch('/api/challenges'),
        safeFetch('/api/events'),
        safeFetch('/api/settings')
      ]);

      const safeJson = async (res, fallback) => {
        if (!res || !res.ok) return fallback;
        try {
          return await res.json();
        } catch {
          return fallback;
        }
      };

      const [members, applications, challenges, events, settings] = await Promise.all([
        safeJson(membersRes, []),
        safeJson(applicationsRes, []),
        safeJson(challengesRes, []),
        safeJson(eventsRes, []),
        safeJson(settingsRes, {})
      ]);

      const memberCount = Array.isArray(members) ? members.length : (members?.total ?? members?.members?.length ?? 0);
      const applicationCount = Array.isArray(applications) ? applications.length : (applications?.length ?? 0);
      const challengeCount = Array.isArray(challenges) ? challenges.length : (challenges?.total ?? challenges?.challenges?.length ?? 0);
      const eventCount = Array.isArray(events) ? events.length : (events?.length ?? 0);

      setStats({
        members: memberCount,
        applications: applicationCount,
        challenges: challengeCount,
        events: eventCount
      });

      if (settings) {
        if (typeof settings.challengesEnabled === 'boolean') setChallengesEnabled(settings.challengesEnabled);
        if (typeof settings.leaderboardEnabled === 'boolean') setLeaderboardEnabled(settings.leaderboardEnabled);
        if (typeof settings.antiCheatEnabled === 'boolean') setAntiCheatEnabled(settings.antiCheatEnabled);
        if (typeof settings.joinMemberEnabled === 'boolean') setJoinMemberEnabled(settings.joinMemberEnabled);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key, currentValue, setVal, setLoadingState) => {
    setLoadingState(true);
    const nextVal = !currentValue;
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: nextVal }),
      });
      const data = await res.json();
      if (res.ok) {
        setVal(nextVal);
      } else {
        alert(data.error || 'Failed to toggle setting');
      }
    } catch (err) {
      alert('Error toggling setting: ' + err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleResetGlobalLeaderboard = async () => {
    if (!confirm('⚠️ DANGER: Are you sure you want to RESET the Global Club Leaderboard? All student XP will be reset to 0 and all submissions cleared!')) {
      return;
    }
    try {
      const res = await fetch('/api/leaderboard/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ global: true })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ ' + data.message);
        fetchDashboardData(true, false);
      } else {
        alert('❌ Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <RefreshCw size={36} className={styles.spinner} color="#60a5fa" />
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>Synchronizing Telemetry...</span>
        <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Connecting to Panimalar AI Core & MongoDB Cloud Database</span>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. MASTER LIVE WEBSITE SWITCHES (3-COLUMN MATRIX) */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleBox}>
          <Activity size={20} color="#facc15" />
          <h3>Master Live Website Switches</h3>
        </div>
        <span>Instant MongoDB synchronization without server restart</span>
      </div>

      <div className={styles.controlsGrid3Col}>
        {/* Switch 1: Challenges Portal */}
        <div className={`${styles.controlPod} ${challengesEnabled ? styles.podActiveGlowYellow : styles.podInactiveAlert}`}>
          <div className={styles.podHeader}>
            <div className={`${styles.controlIconBox} ${challengesEnabled ? styles.iconYellow : styles.iconDim}`}>
              <Zap size={24} color={challengesEnabled ? "#facc15" : "#94a3b8"} />
            </div>
            <span className={`${styles.statusBadge} ${challengesEnabled ? styles.statusOn : styles.statusOff}`}>
              {challengesEnabled ? '🟢 PUBLIC ONLINE' : '🔴 DISABLED (HIDDEN)'}
            </span>
          </div>

          <div className={styles.podBody}>
            <h4>⚡ Challenges Portal</h4>
            <p>Controls visibility of the **⚡ Challenges** navigation button & full-screen IDE competition suite.</p>
          </div>

          <div className={styles.podFooter}>
            <button
              onClick={() => handleToggleSetting('challengesEnabled', challengesEnabled, setChallengesEnabled, setToggleLoading)}
              disabled={toggleLoading}
              className={`${styles.podToggleBtn} ${challengesEnabled ? styles.podBtnOn : styles.podBtnOff}`}
            >
              {challengesEnabled ? <ToggleRight size={28} color="#34d399" /> : <ToggleLeft size={28} color="#94a3b8" />}
              <span>{toggleLoading ? 'Syncing...' : challengesEnabled ? 'Turn OFF Portal' : 'Turn ON Portal'}</span>
            </button>
          </div>
        </div>

        {/* Switch 2: Live Leaderboard */}
        <div className={`${styles.controlPod} ${leaderboardEnabled ? styles.podActiveGlowBlue : styles.podInactiveAlert}`}>
          <div className={styles.podHeader}>
            <div className={`${styles.controlIconBox} ${leaderboardEnabled ? styles.iconBlue : styles.iconDim}`}>
              <Trophy size={24} color={leaderboardEnabled ? "#38bdf8" : "#94a3b8"} />
            </div>
            <span className={`${styles.statusBadge} ${leaderboardEnabled ? styles.statusOn : styles.statusOff}`}>
              {leaderboardEnabled ? '🟢 PUBLIC ONLINE' : '🔴 DISABLED (HIDDEN)'}
            </span>
          </div>

          <div className={styles.podBody}>
            <h4>🏆 Live Leaderboard</h4>
            <p>Controls student access to the **🏆 Leaderboard** standings. Turn off during secret hackathon evaluations!</p>
          </div>

          <div className={styles.podFooter}>
            <button
              onClick={() => handleToggleSetting('leaderboardEnabled', leaderboardEnabled, setLeaderboardEnabled, setLeadLoading)}
              disabled={leadLoading}
              className={`${styles.podToggleBtn} ${leaderboardEnabled ? styles.podBtnOn : styles.podBtnOff}`}
            >
              {leaderboardEnabled ? <ToggleRight size={28} color="#34d399" /> : <ToggleLeft size={28} color="#94a3b8" />}
              <span>{leadLoading ? 'Syncing...' : leaderboardEnabled ? 'Hide Standings' : 'Show Standings'}</span>
            </button>
          </div>
        </div>

        {/* Switch 3: AI Anti-Cheat / Strict Code Guard */}
        <div className={`${styles.controlPod} ${antiCheatEnabled ? styles.podActiveGlowGreen : styles.podInactiveAlert}`}>
          <div className={styles.podHeader}>
            <div className={`${styles.controlIconBox} ${antiCheatEnabled ? styles.iconGreen : styles.iconDim}`}>
              <ShieldCheck size={24} color={antiCheatEnabled ? "#34d399" : "#94a3b8"} />
            </div>
            <span className={`${styles.statusBadge} ${antiCheatEnabled ? styles.statusOn : styles.statusOff}`}>
              {antiCheatEnabled ? '🟢 STRICT GUARD ON' : '🔴 RELAXED MODE'}
            </span>
          </div>

          <div className={styles.podBody}>
            <h4>🛡️ AI Code Sandbox Guard</h4>
            <p>Enforces strict memory limit checks, timeout sandboxing, and automated test case verification in IDE.</p>
          </div>

          <div className={styles.podFooter}>
            <button
              onClick={() => handleToggleSetting('antiCheatEnabled', antiCheatEnabled, setAntiCheatEnabled, setCheatLoading)}
              disabled={cheatLoading}
              className={`${styles.podToggleBtn} ${antiCheatEnabled ? styles.podBtnOn : styles.podBtnOff}`}
            >
              {antiCheatEnabled ? <ToggleRight size={28} color="#34d399" /> : <ToggleLeft size={28} color="#94a3b8" />}
              <span>{cheatLoading ? 'Syncing...' : antiCheatEnabled ? 'Relax Verification' : 'Enforce Guard'}</span>
            </button>
          </div>
        </div>

        {/* Switch 4: Join Member Option */}
        <div className={`${styles.controlPod} ${joinMemberEnabled ? styles.podActiveGlowBlue : styles.podInactiveAlert}`}>
          <div className={styles.podHeader}>
            <div className={`${styles.controlIconBox} ${joinMemberEnabled ? styles.iconBlue : styles.iconDim}`}>
              <UserPlus size={24} color={joinMemberEnabled ? "#38bdf8" : "#94a3b8"} />
            </div>
            <span className={`${styles.statusBadge} ${joinMemberEnabled ? styles.statusOn : styles.statusOff}`}>
              {joinMemberEnabled ? '🟢 PUBLIC ONLINE' : '🔴 DISABLED (HIDDEN)'}
            </span>
          </div>

          <div className={styles.podBody}>
            <h4>🤝 Join Member Portal</h4>
            <p>Controls visibility of the **Join Member** button in the navbar for new club registrations.</p>
          </div>

          <div className={styles.podFooter}>
            <button
              onClick={() => handleToggleSetting('joinMemberEnabled', joinMemberEnabled, setJoinMemberEnabled, setJoinLoading)}
              disabled={joinLoading}
              className={`${styles.podToggleBtn} ${joinMemberEnabled ? styles.podBtnOn : styles.podBtnOff}`}
            >
              {joinMemberEnabled ? <ToggleRight size={28} color="#34d399" /> : <ToggleLeft size={28} color="#94a3b8" />}
              <span>{joinLoading ? 'Syncing...' : joinMemberEnabled ? 'Hide Button' : 'Show Button'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TELEMETRY STATS PODS (GAMIFIED ANALYTICS) */}
      <div className={styles.sectionHeader} style={{ marginTop: '0.5rem' }}>
        <div className={styles.sectionTitleBox}>
          <Server size={20} color="#60a5fa" />
          <h3>System Analytics & Suite Launchpad</h3>
        </div>
        <span>Click any telemetry pod to immediately jump into its management suite</span>
      </div>

      <div className={styles.telemetryGrid}>
        {/* Pod 1: Members */}
        <div className={styles.telemetryCard} onClick={() => onNavigate('members')}>
          <div className={styles.statGlowBlue} />
          <div className={styles.telemetryHeader}>
            <div className={styles.telemetryIconBoxBlue}><Users size={24} color="#60a5fa" /></div>
            <span className={styles.telemetryBadgeBlue}>100% VERIFIED ID CARDS</span>
          </div>
          <div className={styles.telemetryBody}>
            <span className={styles.telemetryLabel}>REGISTERED CLUB MEMBERS</span>
            <div className={styles.telemetryNumber}>{stats.members}</div>
            <div className={styles.telemetryProgressBar}>
              <div className={styles.telemetryProgressFillBlue} style={{ width: '100%' }} />
            </div>
          </div>
          <div className={styles.telemetryFooter}>
            <span>LAUNCH MEMBER ROSTER</span>
            <ArrowUpRight size={18} className={styles.telemetryArrow} />
          </div>
        </div>

        {/* Pod 2: Applications */}
        <div className={styles.telemetryCard} onClick={() => onNavigate('applications')}>
          <div className={styles.statGlowBlue} style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }} />
          <div className={styles.telemetryHeader}>
            <div className={styles.telemetryIconBoxBlue} style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7' }}><FileText size={24} color="#c084fc" /></div>
            <span className={styles.telemetryBadgeBlue} style={{ color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.1)' }}>ONBOARDING PIPELINE</span>
          </div>
          <div className={styles.telemetryBody}>
            <span className={styles.telemetryLabel}>SUBMITTED APPLICATIONS</span>
            <div className={styles.telemetryNumber}>{stats.applications}</div>
            <div className={styles.telemetryProgressBar}>
              <div className={styles.telemetryProgressFillBlue} style={{ width: '100%', background: 'linear-gradient(90deg, #a855f7, #c084fc)' }} />
            </div>
          </div>
          <div className={styles.telemetryFooter}>
            <span>LAUNCH APPLICATION MANAGER</span>
            <ArrowUpRight size={18} className={styles.telemetryArrow} />
          </div>
        </div>

        {/* Pod 2: Challenges */}
        <div className={styles.telemetryCard} onClick={() => onNavigate('challenges')}>
          <div className={styles.statGlowYellow} />
          <div className={styles.telemetryHeader}>
            <div className={styles.telemetryIconBoxYellow}><Code2 size={24} color="#facc15" /></div>
            <span className={styles.telemetryBadgeYellow}>FULL-SCREEN IDE READY</span>
          </div>
          <div className={styles.telemetryBody}>
            <span className={styles.telemetryLabel}>DEPLOYED CODING SUITES</span>
            <div className={styles.telemetryNumber}>{stats.challenges}</div>
            <div className={styles.telemetryProgressBar}>
              <div className={styles.telemetryProgressFillYellow} style={{ width: '85%' }} />
            </div>
          </div>
          <div className={styles.telemetryFooter}>
            <span>LAUNCH IDE COMPETITIONS</span>
            <ArrowUpRight size={18} className={styles.telemetryArrow} />
          </div>
        </div>

        {/* Pod 3: Events */}
        <div className={styles.telemetryCard} onClick={() => onNavigate('events')}>
          <div className={styles.statGlowGreen} />
          <div className={styles.telemetryHeader}>
            <div className={styles.telemetryIconBoxGreen}><Calendar size={24} color="#34d399" /></div>
            <span className={styles.telemetryBadgeGreen}>SYMPOSIUM BANNERS</span>
          </div>
          <div className={styles.telemetryBody}>
            <span className={styles.telemetryLabel}>HACKATHONS & WORKSHOPS</span>
            <div className={styles.telemetryNumber}>{stats.events}</div>
            <div className={styles.telemetryProgressBar}>
              <div className={styles.telemetryProgressFillGreen} style={{ width: '90%' }} />
            </div>
          </div>
          <div className={styles.telemetryFooter}>
            <span>LAUNCH EVENT MANAGER</span>
            <ArrowUpRight size={18} className={styles.telemetryArrow} />
          </div>
        </div>
      </div>

      {/* 4. LEADERBOARD RESET ACTION BANNER */}
      <div className={styles.sectionHeader} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionTitleBox}>
          <ShieldAlert size={20} color="#ef4444" />
          <h3>Danger Zone: Leaderboard & Score Reset</h3>
        </div>
        <span>Reset global club standings and clear test submissions</span>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.8))', border: '1px solid #ef4444', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 0 25px rgba(239, 68, 68, 0.2)' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            🔴 GLOBAL LEADERBOARD RESET
          </div>
          <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>Reset Global Club Leaderboard Standings</h4>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            This action resets all registered members&apos; XP to <strong style={{ color: '#facc15' }}>0 XP</strong>, clears solved challenges lists, and wipes test submissions from the database. Use this before starting a new semester or tournament season!
          </p>
        </div>
        <button
          onClick={handleResetGlobalLeaderboard}
          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)', transition: 'all 0.2s' }}
        >
          <RefreshCw size={18} />
          <span>Reset Global Leaderboard to 0 XP</span>
        </button>
      </div>
    </div>
  );
}
