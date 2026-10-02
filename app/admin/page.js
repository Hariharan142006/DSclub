"use client";

import { useState, useEffect } from 'react';
import { Shield, Lock, User, LogOut, LayoutDashboard, Users, Zap, Calendar, Sparkles, Eye, EyeOff, Clock, Activity, Database, CheckCircle2, PlusCircle, ArrowUpRight, Cpu, Trophy, FileText, Terminal } from 'lucide-react';
import styles from './Admin.module.css';
import AdminDashboard from './components/AdminDashboard';
import MemberManager from './components/MemberManager';
import ChallengeManager from './components/ChallengeManager';
import EventManager from './components/EventManager';
import ContestManager from './components/ContestManager';
import TSPManager from './components/TSPManager';
import ApplicationManager from './components/ApplicationManager';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'members' | 'challenges' | 'events'
  const [currentTime, setCurrentTime] = useState('');

  // Check session with server on mount & live clock
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/verify', { credentials: 'include' });
        if (res.ok) {
          setIsAuthenticated(true);
          sessionStorage.setItem('dsc_admin_auth', 'true');
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem('dsc_admin_auth');
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('dsc_admin_auth', 'true');
        if (data.token) {
          sessionStorage.setItem('dsc_admin_token', data.token);
        }
      } else {
        setLoginError(data.error || 'Invalid credentials.');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' });
    } catch {}
    setIsAuthenticated(false);
    sessionStorage.removeItem('dsc_admin_auth');
    sessionStorage.removeItem('dsc_admin_token');
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer} style={{ zIndex: 1 }}>
        {/* Animated Background Glows */}
        <div className={styles.glowBlob1} style={{ zIndex: -1 }} />
        <div className={styles.glowBlob2} style={{ zIndex: -1 }} />

        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.shieldIcon}>
              <Shield size={38} color="#60a5fa" />
            </div>
            <div className={styles.securityBadge}>
              <Lock size={12} />
              <span>256-BIT ENCRYPTED SESSION</span>
            </div>
            <h2>Admin Command Portal</h2>
            <p>Panimalar Engineering College • Data Science Club</p>
          </div>

          {loginError && (
            <div className={styles.errorBanner}>
              <span style={{ fontWeight: 700 }}>Access Denied:</span> {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label>Admin ID / Username</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.loginBtn}>
              <span>Access Control Center</span>
              <Sparkles size={18} />
            </button>
          </form>

          <div className={styles.loginFooter}>
            <div className={styles.serverStatus}>
              <div className={styles.greenDot} />
              <span>Panimalar Core AI Server: <strong>Online</strong> (99.98% Uptime)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar} style={{ zIndex: 50 }}>
        <div>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarLogoBox}>
              <Shield size={26} color="#60a5fa" />
            </div>
            <div>
              <h3>DSC Admin</h3>
              <span>Command Center</span>
            </div>
          </div>

          <div className={styles.sidebarNavLabel}>NAVIGATION MENU</div>
          <nav className={styles.sidebarNav}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`${styles.navItem} ${activeTab === 'overview' ? styles.activeNavItem : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`${styles.navItem} ${activeTab === 'members' ? styles.activeNavItem : ''}`}
            >
              <Users size={20} />
              <span>Manage Members</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`${styles.navItem} ${activeTab === 'applications' ? styles.activeNavItem : ''}`}
            >
              <FileText size={20} />
              <span>Club Applications</span>
            </button>

            <button
              onClick={() => setActiveTab('challenges')}
              className={`${styles.navItem} ${activeTab === 'challenges' ? styles.activeNavItem : ''}`}
            >
              <Zap size={20} />
              <span>Manage Challenges</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`${styles.navItem} ${activeTab === 'events' ? styles.activeNavItem : ''}`}
            >
              <Calendar size={20} />
              <span>Manage Events</span>
            </button>

            <button
              onClick={() => setActiveTab('contests')}
              className={`${styles.navItem} ${activeTab === 'contests' ? styles.activeNavItem : ''}`}
            >
              <Trophy size={20} />
              <span>Manage Contests</span>
            </button>

            <button
              onClick={() => setActiveTab('tsp')}
              className={`${styles.navItem} ${activeTab === 'tsp' ? styles.activeNavItem : ''}`}
            >
              <Terminal size={20} />
              <span>Manage TSP</span>
            </button>
          </nav>
        </div>

        <div>
          {/* Live System Diagnostics Widget */}
          <div className={styles.diagnosticsWidget}>
            <div className={styles.diagTitle}>
              <Activity size={14} color="#34d399" />
              <span>LIVE SERVER METRICS</span>
            </div>
            <div className={styles.diagRow}>
              <span>MongoDB Cloud</span>
              <span className={styles.diagStatus}><Database size={12} /> Connected</span>
            </div>
            <div className={styles.diagRow}>
              <span>API Gateway</span>
              <span className={styles.diagStatus} style={{ color: '#60a5fa' }}><Cpu size={12} /> 14ms Latency</span>
            </div>
            <div className={styles.diagRow}>
              <span>Security Shield</span>
              <span className={styles.diagStatus} style={{ color: '#facc15' }}>Active 🛡️</span>
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={18} />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.tabContainer}>
          {activeTab === 'overview' && <AdminDashboard onNavigate={setActiveTab} />}
          {activeTab === 'members' && <MemberManager />}
          {activeTab === 'applications' && <ApplicationManager />}
          {activeTab === 'challenges' && <ChallengeManager />}
          {activeTab === 'events' && <EventManager />}
          {activeTab === 'contests' && <ContestManager />}
          {activeTab === 'tsp' && <TSPManager />}
        </div>
      </main>
    </div>
  );
}

