"use client";

import { useState, useEffect } from 'react';
import { Trophy, Plus, Edit2, Trash2, RefreshCw, X, CheckCircle2, Power, Calendar, Clock, Code2, HelpCircle, ShieldAlert, Unlock, Award, Mail, FileText, AlertCircle, Send, Loader2, Play, Pause, Square, Eye, Timer, DownloadCloud, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../Admin.module.css';

export default function ContestManager() {
  const [contests, setContests] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);
  const [selectedContestForRestrictions, setSelectedContestForRestrictions] = useState(null);
  const [selectedContestForLeaderboard, setSelectedContestForLeaderboard] = useState(null);
  const [contestLeaderboardData, setContestLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [previewingCert, setPreviewingCert] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedContestForManage, setSelectedContestForManage] = useState(null);

  useEffect(() => {
    if (selectedContestForManage && contests.length > 0) {
      const targetId = (selectedContestForManage._id || selectedContestForManage.id || '').toString();
      const updated = contests.find(c => {
        const cId = (c._id || c.id || '').toString();
        return cId === targetId;
      });
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedContestForManage)) {
        setSelectedContestForManage(updated);
      }
    }
  }, [contests, selectedContestForManage]);

  useEffect(() => {
    const timerInterval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const [selectedContestForCert, setSelectedContestForCert] = useState(null);
  const [savingCert, setSavingCert] = useState(false);
  const [certFormData, setCertFormData] = useState({
    certificateEnabled: false,
    title: 'CERTIFICATE OF PARTICIPATION',
    subtitle: 'This is proudly presented to',
    bodyText: 'for actively participating in the coding contest [CONTEST_TITLE] organized by the Department of AI & Data Science, Panimalar Engineering College.',
    signatoryName: 'Dr. S. Malathi',
    signatoryTitle: 'HOD - Dept of AI & DS',
    accentColor: '#00f0ff',
    backgroundImageUrl: ''
  });
  const [sendingCertContest, setSendingCertContest] = useState(null);
  const [sendingCertProgress, setSendingCertProgress] = useState(false);
  const [certSendResult, setCertSendResult] = useState(null);
  const [viewingRecipientsContest, setViewingRecipientsContest] = useState(null);
  const [whitelistManualOpen, setWhitelistManualOpen] = useState(false);
  const [manualWhitelistEntry, setManualWhitelistEntry] = useState({ identifier: '', name: '', email: '' });
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [whitelistPreviewData, setWhitelistPreviewData] = useState(null);
  const [showWhitelistPreviewModal, setShowWhitelistPreviewModal] = useState(false);
  const [showWhitelistViewModal, setShowWhitelistViewModal] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showActiveParticipantsModal, setShowActiveParticipantsModal] = useState(false);
  const [activeParticipantSearch, setActiveParticipantSearch] = useState('');
  const [activeParticipantStatusFilter, setActiveParticipantStatusFilter] = useState('ALL');
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedSearchQuery, setCompletedSearchQuery] = useState('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [generatedPdfDocTitle, setGeneratedPdfDocTitle] = useState('');


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    isActive: true,
    leaderboardEnabled: true,
    timerEnabled: false,
    timerDurationMinutes: 60,
    challenges: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const [resContests, resChallenges] = await Promise.all([
        fetch(`/api/contests?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`/api/challenges?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      ]);
      const dataContests = await resContests.json();
      const dataChallenges = await resChallenges.json();

      if (Array.isArray(dataContests)) setContests(dataContests);
      const chList = Array.isArray(dataChallenges) ? dataChallenges : (dataChallenges?.challenges || []);
      setChallenges(chList);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      startTime: '2026-08-01 10:00 AM',
      endTime: '2026-08-05 11:59 PM',
      isActive: true,
      leaderboardEnabled: true,
      timerEnabled: false,
      timerDurationMinutes: 60,
      challenges: []
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (contest) => {
    setEditingId(contest._id);
    setFormData({
      title: contest.title || '',
      description: contest.description || '',
      startTime: contest.startTime || '',
      endTime: contest.endTime || '',
      isActive: contest.isActive !== undefined ? Boolean(contest.isActive) : true,
      leaderboardEnabled: contest.leaderboardEnabled !== undefined ? Boolean(contest.leaderboardEnabled) : true,
      timerEnabled: Boolean(contest.timerEnabled),
      timerDurationMinutes: Number(contest.timerDurationMinutes || 60),
      challenges: Array.isArray(contest.challenges) ? [...contest.challenges] : []
    });
    setModalOpen(true);
  };

  const handleToggleChallenge = (challengeId) => {
    setFormData((prev) => {
      const exists = prev.challenges.includes(challengeId);
      if (exists) {
        return { ...prev, challenges: prev.challenges.filter(id => id !== challengeId) };
      } else {
        return { ...prev, challenges: [...prev.challenges, challengeId] };
      }
    });
  };

  const handleToggleActive = async (contest) => {
    const targetId = contest._id || contest.id;
    try {
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !contest.isActive })
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to toggle contest status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleLeaderboard = async (contest) => {
    const targetId = contest._id || contest.id;
    const currentVal = contest.leaderboardEnabled !== undefined ? Boolean(contest.leaderboardEnabled) : true;
    const newVal = !currentVal;
    try {
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboardEnabled: newVal })
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to toggle contest leaderboard status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleTimer = async (contest) => {
    const targetId = contest._id || contest.id;
    const newVal = !contest.timerEnabled;
    try {
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timerEnabled: newVal })
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to toggle timer status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleStartTimer = async (contest) => {
    const targetId = contest._id || contest.id;
    const remaining = contest.timerRemainingSeconds > 0 ? contest.timerRemainingSeconds : (contest.timerDurationMinutes || 60) * 60;
    try {
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timerStatus: 'running',
          timerLastStartedAt: new Date().toISOString(),
          timerRemainingSeconds: remaining,
          isActive: true
        })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      alert('Error starting timer: ' + err.message);
    }
  };

  const handlePauseTimer = async (contest) => {
    const targetId = contest._id || contest.id;
    let remaining = contest.timerRemainingSeconds || (contest.timerDurationMinutes || 60) * 60;
    if (contest.timerLastStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(contest.timerLastStartedAt).getTime()) / 1000);
      remaining = Math.max(0, remaining - elapsed);
    }
    try {
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timerStatus: 'paused',
          timerRemainingSeconds: remaining,
          timerLastStartedAt: null
        })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      alert('Error pausing timer: ' + err.message);
    }
  };

  const handleStopTimer = async (contest) => {
    if (!confirm('Reset timer to initial duration?')) return;
    const targetId = contest._id || contest.id;
    const durationSecs = (contest.timerDurationMinutes || 60) * 60;
    try {
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timerStatus: 'stopped',
          timerRemainingSeconds: durationSecs,
          timerLastStartedAt: null
        })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      alert('Error resetting timer: ' + err.message);
    }
  };

  const handleEndTimer = async (contest) => {
    if (!confirm('Are you sure you want to end this contest? This will close the arena and stop the timer.')) return;
    const targetId = contest._id || contest.id;
    try {
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timerStatus: 'ended',
          timerRemainingSeconds: 0,
          timerLastStartedAt: null,
          isActive: false
        })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      alert('Error ending contest: ' + err.message);
    }
  };

  const formatRemainingTime = (contest) => {
    let seconds = contest.timerRemainingSeconds !== undefined ? contest.timerRemainingSeconds : (contest.timerDurationMinutes || 60) * 60;
    if (contest.timerStatus === 'running' && contest.timerLastStartedAt) {
      const elapsed = Math.floor((currentTime - new Date(contest.timerLastStartedAt).getTime()) / 1000);
      seconds = Math.max(0, seconds - elapsed);
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletedStudentsList = (contest) => {
    if (!contest) return [];
    const completedSet = new Set((contest.completedMembers || []).map(id => String(id).trim().toUpperCase()));
    const list = [];
    const processedIds = new Set();

    (contest.activeParticipants || []).forEach(p => {
      const pId = String(p.memberId || '').trim().toUpperCase();
      if (!pId) return;
      if (p.status === 'completed' || completedSet.has(pId)) {
        processedIds.add(pId);
        list.push({
          memberId: pId,
          name: p.name || pId,
          score: typeof p.score === 'number' ? p.score : 0,
          completedAt: p.completedAt || p.joinedAt || null,
          status: 'completed'
        });
      }
    });

    completedSet.forEach(id => {
      if (!processedIds.has(id)) {
        processedIds.add(id);
        const wl = (contest.whitelistedStudents || []).find(s => s && String(s.identifier).trim().toUpperCase() === id);
        list.push({
          memberId: id,
          name: wl?.name || id,
          score: 0,
          completedAt: null,
          status: 'completed'
        });
      }
    });

    return list;
  };

  const getCompletedCount = (contest) => {
    if (!contest) return 0;
    return getCompletedStudentsList(contest).length;
  };

  const exportCompletedCSV = (contest) => {
    const list = getCompletedStudentsList(contest);
    if (list.length === 0) {
      alert('No completed students found to export.');
      return;
    }
    const headers = ['#', 'Roll Number / ID', 'Student Name', 'Score', 'Completed At'];
    const rows = list.map((s, idx) => [
      idx + 1,
      `"${s.memberId}"`,
      `"${s.name}"`,
      s.score,
      s.completedAt ? `"${new Date(s.completedAt).toLocaleString()}"` : '"Completed"'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(contest.title || 'Contest').replace(/[^a-z0-9]/gi, '_')}_Completed_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenContestLeaderboard = async (contest) => {
    const targetId = contest._id || contest.id;
    setSelectedContestForLeaderboard(contest);
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/contests/${targetId}/leaderboard?admin=true`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setContestLeaderboardData(data);
      } else {
        setContestLeaderboardData([]);
      }
    } catch (err) {
      alert('Error fetching contest leaderboard: ' + err.message);
      setContestLeaderboardData([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/contests/${editingId}` : '/api/contests';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save contest');
      }

      await fetchData();
      setModalOpen(false);
      setSuccessPopup({
        title: editingId ? 'Contest Updated!' : 'Contest Created!',
        message: editingId
          ? 'The contest details and attached challenge questions have been updated.'
          : 'Your new competition contest has been launched and is now live!'
      });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contest and its leaderboard associations?')) return;
    try {
      const res = await fetch(`/api/contests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContests(contests.filter(c => String(c._id) !== String(id)));
      } else {
        alert('Failed to delete contest');
      }
    } catch (err) {
      alert('Error deleting contest: ' + err.message);
    }
  };

  const handleResetContestLeaderboard = async (contest) => {
    if (!confirm(`⚠️ DANGER: Are you sure you want to RESET the leaderboard for "${contest.title}"? All submissions and scores for this contest will be permanently cleared!`)) {
      return;
    }
    try {
      const res = await fetch('/api/leaderboard/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestId: contest._id || contest.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ ' + data.message);
      } else {
        alert('❌ Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleRemoveRestriction = async (contestId, memberId) => {
    if (!confirm(`Are you sure you want to lift the anti-cheat restriction for Member ID: ${memberId}?`)) return;
    try {
      const res = await fetch('/api/contests/restrict', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestId, memberId })
      });
      const data = await res.json();
      if (res.ok) {
        setContests(prev => prev.map(c => ((c._id && c._id.toString() === contestId.toString()) || (c.id && c.id.toString() === contestId.toString())) ? { ...c, restrictedMembers: data.restrictedMembers } : c));
        setSelectedContestForRestrictions(prev => prev && ((prev._id && prev._id.toString() === contestId.toString()) || (prev.id && prev.id.toString() === contestId.toString())) ? { ...prev, restrictedMembers: data.restrictedMembers } : prev);
        try {
          const localMapStr = localStorage.getItem('dsc_restricted_map');
          if (localMapStr) {
            const localMap = JSON.parse(localMapStr);
            if (localMap[contestId] && Array.isArray(localMap[contestId])) {
              const clean = memberId.toString().trim().toUpperCase();
              localMap[contestId] = localMap[contestId].filter(id => id && id.toString().trim().toUpperCase() !== clean);
              localStorage.setItem('dsc_restricted_map', JSON.stringify(localMap));
            }
          }
        } catch (e) {}
        alert(`✅ Restriction lifted for ${memberId}!`);
      } else {
        alert('❌ Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleOpenRestrictions = async (c) => {
    const cId = (c._id || c.id || '').toString();
    setSelectedContestForRestrictions(c);

    try {
      const ts = Date.now();
      const res = await fetch(`/api/contests?_t=${ts}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setContests(data);
        const updated = data.find(item =>
          (item._id && item._id.toString() === cId) ||
          (item.id && item.id.toString() === cId)
        );
        if (updated) setSelectedContestForRestrictions(updated);
      }
    } catch (e) {}
  };

  const handleOpenCertSettings = (c) => {
    setSelectedContestForCert(c);
    const tmpl = c.certificateTemplate || {};
    setCertFormData({
      certificateEnabled: Boolean(c.certificateEnabled),
      title: tmpl.title || 'CERTIFICATE OF PARTICIPATION',
      subtitle: tmpl.subtitle || 'This is proudly presented to',
      bodyText: tmpl.bodyText || 'for actively participating in the coding contest [CONTEST_TITLE] organized by the Department of AI & Data Science, Panimalar Engineering College.',
      signatoryName: tmpl.signatoryName || 'Dr. S. Malathi',
      signatoryTitle: tmpl.signatoryTitle || 'HOD - Dept of AI & DS',
      accentColor: tmpl.accentColor || '#00f0ff',
      backgroundImageUrl: tmpl.backgroundImageUrl || ''
    });
  };

  const handleCertImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSavingCert(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: reader.result, folder: 'DS_Club_Certificates' })
          });
          const data = await res.json();
          if (data.url) {
            setCertFormData(prev => ({ ...prev, backgroundImageUrl: data.url }));
          } else {
            alert('Upload failed: ' + (data.error || 'Unknown error'));
          }
        } catch (err) {
          alert('Upload failed: ' + err.message);
        } finally {
          setSavingCert(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewCert = async () => {
    if (!selectedContestForCert) return;
    setPreviewingCert(true);
    try {
      const contestPreviewData = {
        ...selectedContestForCert,
        certificateEnabled: certFormData.certificateEnabled,
        certificateTemplate: {
          title: certFormData.title,
          subtitle: certFormData.subtitle,
          bodyText: certFormData.bodyText,
          signatoryName: certFormData.signatoryName,
          signatoryTitle: certFormData.signatoryTitle,
          accentColor: certFormData.accentColor,
          backgroundImageUrl: certFormData.backgroundImageUrl || ''
        }
      };
      const res = await fetch('/api/contests/preview-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contest: contestPreviewData })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        const data = await res.json();
        alert('❌ Failed to preview certificate: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error previewing certificate: ' + err.message);
    } finally {
      setPreviewingCert(false);
    }
  };

  const handleSaveCertSettings = async (e) => {
    e.preventDefault();
    if (!selectedContestForCert) return;
    const targetId = selectedContestForCert._id || selectedContestForCert.id;
    setSavingCert(true);
    try {
      const payload = {
        certificateEnabled: certFormData.certificateEnabled,
        certificateTemplate: {
          title: certFormData.title,
          subtitle: certFormData.subtitle,
          bodyText: certFormData.bodyText,
          signatoryName: certFormData.signatoryName,
          signatoryTitle: certFormData.signatoryTitle,
          accentColor: certFormData.accentColor,
          backgroundImageUrl: certFormData.backgroundImageUrl || ''
        }
      };
      const res = await fetch(`/api/contests/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setContests(prev => prev.map(c => ((c._id && c._id.toString() === targetId.toString()) || (c.id && c.id.toString() === targetId.toString())) ? { ...c, certificateEnabled: updated.certificateEnabled, certificateTemplate: updated.certificateTemplate } : c));
        setSelectedContestForCert(null);
        alert('✅ Certificate settings saved successfully!');
      } else {
        const data = await res.json();
        alert('❌ Failed to save certificate settings: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setSavingCert(false);
    }
  };

  const handleOpenSendCert = (c) => {
    setSendingCertContest(c);
    setCertSendResult(null);
  };

  const handleConfirmSendCerts = async () => {
    if (!sendingCertContest) return;
    const targetId = sendingCertContest._id || sendingCertContest.id;
    setSendingCertProgress(true);
    setCertSendResult(null);
    try {
      const res = await fetch(`/api/contests/${targetId}/send-certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setCertSendResult(data);
        if (data.results) {
          setContests(prev => prev.map(c => ((c._id && c._id.toString() === targetId.toString()) || (c.id && c.id.toString() === targetId.toString())) ? { ...c, certificateRecipients: data.results } : c));
        }
      } else {
        alert('❌ Failed to send certificates: ' + (data.error || 'Unknown error'));
        setSendingCertContest(null);
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
      setSendingCertContest(null);
    } finally {
      setSendingCertProgress(false);
    }
  };

  
  const handleToggleWhitelist = async (contest) => {
    try {
      const newStatus = !contest.whitelistEnabled;
      const res = await fetch(`/api/contests/${contest._id || contest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistEnabled: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setContests(prev => prev.map(c => ((c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedContestForManage && (selectedContestForManage._id === data._id || selectedContestForManage.id === data._id)) {
          setSelectedContestForManage(data);
        }
      } else {
        alert('Failed to toggle whitelist: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleClearWhitelist = async (contest) => {
    if (!confirm('Are you sure you want to clear the entire participant whitelist?')) return;
    try {
      const res = await fetch(`/api/contests/${contest._id || contest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: [] })
      });
      const data = await res.json();
      if (res.ok) {
        setContests(prev => prev.map(c => ((c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedContestForManage && (selectedContestForManage._id === data._id || selectedContestForManage.id === data._id)) {
          setSelectedContestForManage(data);
        }
        alert('Whitelist cleared successfully!');
      } else {
        alert('Failed to clear whitelist: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleExcelUpload = async (e, contest) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingExcel(true);
    
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          const newStudents = [];
          
          data.forEach(row => {
            // Fuzzy match column names
            let identifier = '';
            let name = '';
            
            for (const [key, value] of Object.entries(row)) {
              const k = key.toLowerCase().trim();
              if (k.includes('roll') || k.includes('member id') || k.includes('register number') || k === 'id') {
                if (!identifier) identifier = String(value).trim().toUpperCase();
              }
              if (k.includes('name') || k === 'full name') {
                if (!name) name = String(value).trim();
              }
            }
            
            if (identifier && name) {
              newStudents.push({ identifier, name });
            } else if (identifier) {
              newStudents.push({ identifier, name: 'Unknown Name' });
            }
          });
          
          if (newStudents.length === 0) {
            alert('No valid students found in the Excel sheet. Ensure columns contain "Roll Number" and "Name".');
            setUploadingExcel(false);
            return;
          }
          
          setWhitelistPreviewData({ newStudents, contest });
          setShowWhitelistPreviewModal(true);
          setUploadingExcel(false);
          e.target.value = ''; // Reset file input
        } catch (err) {
          alert('Error processing Excel file: ' + err.message);
          setUploadingExcel(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      alert('Error loading Excel parser: ' + err.message);
      setUploadingExcel(false);
    }
  };

  const handleDownloadDetailedPdfReport = async (contest) => {
    setGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule.autoTable || autoTableModule;
      
      const doc = new jsPDF('landscape'); // Use landscape for detailed report
      
      // Load Logos
      const addImageToPdf = async (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };
      
      const pecLogo = await addImageToPdf('/pec-logo.png');
      const dsLogo = await addImageToPdf('/ds logo.jpg');
      
      if (pecLogo) doc.addImage(pecLogo, 'PNG', 14, 10, 20, 20);
      if (dsLogo) doc.addImage(dsLogo, 'PNG', 263, 10, 20, 20);
      
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(contest.title, 148, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Department of AI & Data Science`, 148, 28, { align: 'center' });
      doc.text(`Detailed Submissions Report`, 148, 34, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(14, 40, 283, 40);
      
      // Fetch Detailed Submissions Data
      const res = await fetch(`/api/contests/${contest._id || contest.id}/submissions`);
      if (!res.ok) throw new Error('Failed to fetch detailed submissions');
      const submissionsData = await res.json();
      
      doc.setFontSize(11);
      doc.text(`Total Submissions: ${submissionsData.length}`, 14, 50);
      doc.text(`Active Participants: ${contest.activeParticipants?.length || 0}`, 148, 50, { align: 'center' });
      
      const tableColumn = ["#", "Member ID", "Challenge", "Type", "Score", "Total Points", "Submitted At"];
      const tableRows = [];
      
      submissionsData.forEach((sub, index) => {
        const rowData = [
          index + 1,
          sub.memberId,
          sub.challengeTitle,
          sub.type.toUpperCase(),
          sub.quizScore || 0,
          sub.totalPoints || 0,
          new Date(sub.createdAt).toLocaleString()
        ];
        tableRows.push(rowData);
      });
      
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 55,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
      } else {
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 55,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
      }
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(`Page ${i} of ${pageCount}`, 283, 200, { align: 'right' });
      }
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
      setGeneratedPdfDocTitle(`${contest.title.replace(/\s+/g, '_')}_Detailed_Report.pdf`);
      setShowPdfPreviewModal(true);
    } catch (error) {
      console.error('Error generating detailed PDF report:', error);
      alert('Failed to generate detailed PDF report.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdfReport = async (contest) => {
    setGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule.autoTable || autoTableModule;
      
      const doc = new jsPDF();
      
      // Load Logos
      const addImageToPdf = async (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };
      
      const pecLogo = await addImageToPdf('/pec-logo.png');
      const dsLogo = await addImageToPdf('/ds logo.jpg');
      
      if (pecLogo) doc.addImage(pecLogo, 'PNG', 14, 10, 20, 20);
      if (dsLogo) doc.addImage(dsLogo, 'PNG', 176, 10, 20, 20);
      
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(contest.title, 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Department of AI & Data Science`, 105, 28, { align: 'center' });
      doc.text(`Contest Report`, 105, 34, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(14, 40, 196, 40);
      
      // Fetch Leaderboard Data
      const res = await fetch(`/api/contests/${contest._id || contest.id}/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const leaderboardData = await res.json();
      
      doc.setFontSize(11);
      doc.text(`Total Submissions: ${leaderboardData.length}`, 14, 50);
      doc.text(`Active Participants: ${contest.activeParticipants?.length || 0}`, 105, 50);
      
      const tableColumn = ["Rank", "Member ID", "Name", "Dept/Role", "Score", "Solved"];
      const tableRows = [];
      
      leaderboardData.forEach((row, index) => {
        const studentData = [
          index + 1,
          row.memberId,
          row.name || 'Unknown',
          row.department || row.role || 'Member',
          row.score,
          `${row.submissionsCount} / ${contest.challenges?.length || 0}`
        ];
        tableRows.push(studentData);
      });
      
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 55,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
      } else {
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 55,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
      }
      
      const pdfBlobUrl = doc.output('bloburl');
      setPdfPreviewUrl(pdfBlobUrl);
      setGeneratedPdfDocTitle(`${contest.title.replace(/\s+/g, '_')}_Report.pdf`);
      setShowPdfPreviewModal(true);
    } catch (err) {
      alert('Error generating PDF: ' + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleConfirmWhitelistImport = async () => {
    if (!whitelistPreviewData) return;
    setUploadingExcel(true);
    try {
      const { newStudents, contest } = whitelistPreviewData;
      const currentList = contest.whitelistedStudents || [];
      const combinedList = [...currentList];
      
      newStudents.forEach(stu => {
        if (!combinedList.some(s => s.identifier.toLowerCase() === stu.identifier.toLowerCase())) {
          combinedList.push(stu);
        }
      });
      
      const res = await fetch(`/api/contests/${contest._id || contest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: combinedList })
      });
      
      const resData = await res.json();
      if (res.ok) {
        setContests(prev => prev.map(c => ((c._id && c._id.toString() === resData._id.toString()) || (c.id && c.id.toString() === resData._id.toString())) ? resData : c));
        if (selectedContestForManage && (selectedContestForManage._id === resData._id || selectedContestForManage.id === resData._id)) {
          setSelectedContestForManage(resData);
        }
        alert(`Successfully imported ${newStudents.length} students to the whitelist!`);
        setShowWhitelistPreviewModal(false);
        setWhitelistPreviewData(null);
      } else {
        alert('Failed to save whitelist: ' + resData.error);
      }
    } catch (err) {
      alert('Error saving whitelist: ' + err.message);
    } finally {
      setUploadingExcel(false);
    }
  };

  const handleSaveManualWhitelistEntry = async () => {
    if (!manualWhitelistEntry.identifier) {
      alert('Roll Number / Member ID is required!');
      return;
    }
    
    try {
      const contest = selectedContestForManage;
      const currentList = contest.whitelistedStudents || [];
      const cleanIdentifier = manualWhitelistEntry.identifier.trim().toUpperCase();
      
      if (currentList.some(s => s && s.identifier && s.identifier.trim().toUpperCase() === cleanIdentifier)) {
        alert('This student is already on the whitelist!');
        return;
      }
      
      const updatedList = [...currentList, { 
        identifier: cleanIdentifier, 
        name: manualWhitelistEntry.name.trim() || 'Manual Entry',
        email: manualWhitelistEntry.email ? manualWhitelistEntry.email.trim() : ''
      }];
      
      const res = await fetch(`/api/contests/${contest._id || contest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: updatedList })
      });
      
      const data = await res.json();
      if (res.ok) {
        setContests(prev => prev.map(c => ((c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedContestForManage && (selectedContestForManage._id === data._id || selectedContestForManage.id === data._id)) {
          setSelectedContestForManage(data);
        }
        setWhitelistManualOpen(false);
        setManualWhitelistEntry({ identifier: '', name: '', email: '' });
      } else {
        alert('Failed to add student: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleRemoveWhitelistedStudent = async (identifier) => {
    if (!confirm(`Are you sure you want to remove student "${identifier}" from the whitelist?`)) return;
    try {
      const contest = selectedContestForManage;
      const currentList = contest.whitelistedStudents || [];
      const updatedList = currentList.filter(s => s && s.identifier && s.identifier.trim().toUpperCase() !== identifier.trim().toUpperCase());
      const res = await fetch(`/api/contests/${contest._id || contest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: updatedList })
      });
      const data = await res.json();
      if (res.ok) {
        setContests(prev => prev.map(c => ((c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedContestForManage && (selectedContestForManage._id === data._id || selectedContestForManage.id === data._id)) {
          setSelectedContestForManage(data);
        }
      } else {
        alert('Failed to remove student: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerHeader}>
        <div>
          <h3>Contests & Hackathons Arena</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Create timed competitions, attach challenge questions, and manage live status.</p>
        </div>

        <button onClick={handleOpenAdd} className={styles.actionBtn}>
          <Plus size={18} />
          <span>Create New Contest</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <RefreshCw size={28} className={styles.spinner} />
          <span>Loading contests...</span>
        </div>
      ) : selectedContestForManage ? (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          {/* Top Navigation & Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <button
                onClick={() => setSelectedContestForManage(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#00f0ff',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  marginBottom: '1.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#00f0ff'; e.currentTarget.style.color = '#000'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#00f0ff'; }}
              >
                <span>⬅ Back to Contests List</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff', margin: 0, background: 'linear-gradient(90deg, #fff, #00f0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {selectedContestForManage.title}
                </h2>
                <span
                  style={{
                    background: selectedContestForManage.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: selectedContestForManage.isActive ? '#10b981' : '#ef4444',
                    border: `1px solid ${selectedContestForManage.isActive ? '#10b981' : '#ef4444'}`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Power size={12} />
                  {selectedContestForManage.isActive ? 'ACTIVE ARENA' : 'CLOSED / INACTIVE'}
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0.6rem 0 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
                {selectedContestForManage.description || 'No detailed description provided.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                  <Calendar size={14} color="#60a5fa" />
                  <strong>Schedule:</strong> {selectedContestForManage.startTime} — {selectedContestForManage.endTime}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                  <Code2 size={14} color="#00f0ff" />
                  <strong>Questions:</strong> {selectedContestForManage.challenges?.length || 0} attached
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleToggleActive(selectedContestForManage)}
                style={{
                  background: selectedContestForManage.isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  borderColor: selectedContestForManage.isActive ? '#ef4444' : '#10b981',
                  color: selectedContestForManage.isActive ? '#ef4444' : '#10b981',
                  border: '1px solid',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Power size={16} />
                <span>{selectedContestForManage.isActive ? 'Deactivate Arena' : 'Activate Arena'}</span>
              </button>
              <button
                onClick={() => handleOpenEdit(selectedContestForManage)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Edit2 size={16} />
                <span>Edit Details</span>
              </button>
            </div>
          </div>

          {/* Settings Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
            {/* CARD 1: Timer & Live Execution Engine */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Timer size={24} color="#00f0ff" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Live Contest Timer</h3>
                  </div>
                  <button
                    onClick={() => handleToggleTimer(selectedContestForManage)}
                    style={{
                      background: selectedContestForManage.timerEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${selectedContestForManage.timerEnabled ? '#00f0ff' : '#64748b'}`,
                      color: selectedContestForManage.timerEnabled ? '#00f0ff' : '#94a3b8',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {selectedContestForManage.timerEnabled ? '⏱️ TIMER: ON' : '⏱️ TIMER: OFF'}
                  </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Control the real-time countdown clock in the student arena. When timer reaches 00:00, submissions are automatically locked.
                </p>

                {selectedContestForManage.timerEnabled ? (
                  <div style={{ background: 'rgba(5, 7, 15, 0.6)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.4rem' }}>
                      Status: <strong style={{ color: selectedContestForManage.timerStatus === 'running' ? '#4ade80' : selectedContestForManage.timerStatus === 'paused' ? '#facc15' : selectedContestForManage.timerStatus === 'ended' ? '#ef4444' : '#64748b' }}>{selectedContestForManage.timerStatus ? selectedContestForManage.timerStatus.toUpperCase() : 'STOPPED'}</strong>
                    </div>
                    <div style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff', textShadow: '0 0 15px rgba(0, 240, 255, 0.5)', letterSpacing: '2px' }}>
                      {formatRemainingTime(selectedContestForManage)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                      Total Duration: {selectedContestForManage.timerDurationMinutes || 60} minutes
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.75rem', color: '#64748b' }}>
                    <Timer size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>Timer Feature Disabled</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Click &quot;TIMER: OFF&quot; above to enable countdown tracking.</div>
                  </div>
                )}
              </div>

              {selectedContestForManage.timerEnabled && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justify: 'center' }}>
                  {selectedContestForManage.timerStatus !== 'running' && (
                    <button
                      onClick={() => handleStartTimer(selectedContestForManage)}
                      style={{ flex: 1, minWidth: '130px', background: '#10b981', color: '#000', fontWeight: 800, padding: '0.65rem', borderRadius: '8px', border: 'none', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s' }}
                    >
                      <Play size={16} /> Start Timer
                    </button>
                  )}
                  {selectedContestForManage.timerStatus === 'running' && (
                    <button
                      onClick={() => handlePauseTimer(selectedContestForManage)}
                      style={{ flex: 1, minWidth: '130px', background: '#facc15', color: '#000', fontWeight: 800, padding: '0.65rem', borderRadius: '8px', border: 'none', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 0 10px rgba(250, 204, 21, 0.3)', transition: 'all 0.2s' }}
                    >
                      <Pause size={16} /> Pause
                    </button>
                  )}
                  <button
                    onClick={() => handleStopTimer(selectedContestForManage)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontWeight: 700, padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Reset timer to full duration"
                  >
                    <Square size={16} /> Reset
                  </button>
                  <button
                    onClick={() => handleEndTimer(selectedContestForManage)}
                    style={{ background: '#ef4444', color: '#fff', fontWeight: 800, padding: '0.65rem 1rem', borderRadius: '8px', border: 'none', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s' }}
                    title="End contest and lock arena"
                  >
                    <Power size={16} /> End Arena
                  </button>
                </div>
              )}
            </div>

            {/* CARD 2: Leaderboard & Anti-Cheat Security */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Trophy size={24} color="#60a5fa" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Standings & Anti-Cheat</h3>
                  </div>
                  <button
                    onClick={() => handleToggleLeaderboard(selectedContestForManage)}
                    style={{
                      background: (selectedContestForManage.leaderboardEnabled !== false) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${(selectedContestForManage.leaderboardEnabled !== false) ? '#3b82f6' : '#64748b'}`,
                      color: (selectedContestForManage.leaderboardEnabled !== false) ? '#60a5fa' : '#94a3b8',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {(selectedContestForManage.leaderboardEnabled !== false) ? '📊 LEADERBOARD: PUBLIC' : '🔒 LEADERBOARD: HIDDEN'}
                  </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Manage student rank visibility and enforce IP/membership anti-cheat restrictions for this tournament arena.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Public Leaderboard View</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{(selectedContestForManage.leaderboardEnabled !== false) ? 'Students can view rankings live.' : 'Rankings hidden from students.'}</div>
                    </div>
                    <button
                      onClick={() => handleOpenContestLeaderboard(selectedContestForManage)}
                      style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.color = '#10b981'; }}
                    >
                      👁️ Admin View
                    </button>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Anti-Cheat Restrictions</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedContestForManage.restrictedMembers?.length || 0} members blocked or restricted.</div>
                    </div>
                    <button
                      onClick={() => handleOpenRestrictions(selectedContestForManage)}
                      style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #f87171', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#f87171'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#f87171'; }}
                    >
                      🛡️ Manage ({selectedContestForManage.restrictedMembers?.length || 0})
                    </button>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '1.1rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Completed Students</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{getCompletedCount(selectedContestForManage)} students submitted or exited this arena.</div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/contests/${selectedContestForManage._id || selectedContestForManage.id}?_t=${Date.now()}`);
                          if (res.ok) {
                            const latest = await res.json();
                            setSelectedContestForManage(latest);
                            setContests(prev => prev.map(c => (c && (c._id || c.id) === (latest._id || latest.id) ? latest : c)));
                          }
                        } catch (err) {}
                        setShowCompletedModal(true);
                      }}
                      style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #34d399', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#34d399'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.color = '#34d399'; }}
                    >
                      🎓 View Completed ({getCompletedCount(selectedContestForManage)})
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleResetContestLeaderboard(selectedContestForManage)}
                  style={{ width: '100%', background: 'rgba(250, 204, 21, 0.15)', border: '1px solid #facc15', color: '#facc15', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#facc15'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(250, 204, 21, 0.15)'; e.currentTarget.style.color = '#facc15'; }}
                >
                  <RefreshCw size={16} /> Reset Leaderboard Scores & Submissions
                </button>
              </div>
            </div>

            {/* CARD 3: Automated Participation Certificates */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Award size={24} color="#facc15" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Participation Certificates</h3>
                  </div>
                  <button
                    onClick={() => handleOpenCertSettings(selectedContestForManage)}
                    style={{
                      background: selectedContestForManage.certificateEnabled ? 'rgba(250, 204, 21, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${selectedContestForManage.certificateEnabled ? '#facc15' : '#64748b'}`,
                      color: selectedContestForManage.certificateEnabled ? '#facc15' : '#94a3b8',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {selectedContestForManage.certificateEnabled ? '🏆 CERTS: ON' : '📜 CERTS: OFF'}
                  </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Configure customized landscape A4 certificates and dispatch them in bulk via email to all active attendees.
                </p>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Certificates Dispatched:</span>
                    <strong style={{ fontSize: '1.15rem', color: '#00f0ff', fontFamily: 'monospace' }}>{selectedContestForManage.certificateRecipients?.length || 0} participants</strong>
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Signatory: <strong>{selectedContestForManage.certificateTemplate?.signatoryName || 'Dr. S. Malathi'}</strong></span>
                    <span>Template: <strong>A4 Landscape</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenCertSettings(selectedContestForManage)}
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', fontWeight: 700, padding: '0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
                  >
                    ⚙️ Template Settings
                  </button>
                  {selectedContestForManage.certificateEnabled && (
                    <button
                      onClick={() => setViewingRecipientsContest(selectedContestForManage)}
                      style={{ flex: 1, background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', fontWeight: 700, padding: '0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#34d399'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(52, 211, 153, 0.15)'; e.currentTarget.style.color = '#34d399'; }}
                    >
                      📋 Recipients ({selectedContestForManage.certificateRecipients?.length || 0})
                    </button>
                  )}
                </div>

                {selectedContestForManage.certificateEnabled && (
                  <button
                    onClick={() => handleOpenSendCert(selectedContestForManage)}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', color: '#000', fontWeight: 800, padding: '0.8rem', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <Mail size={18} /> Send Option (Email to All Attendees)
                  </button>
                )}
              </div>
            </div>

            {/* CARD 4: Attached Challenges & Problem Set */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Code2 size={24} color="#10b981" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Attached Challenges</h3>
                  </div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {selectedContestForManage.challenges?.length || 0} QUESTIONS
                  </span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Coding questions and quizzes currently linked to this competition. Students must solve these to gain XP and rank.
                </p>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '1.75rem' }}>
                  {selectedContestForManage.challenges && selectedContestForManage.challenges.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedContestForManage.challenges.map((chId, idx) => {
                        const chObj = challenges.find(x => (x._id || x.id) === chId);
                        return (
                          <li key={idx}>
                            <strong style={{ color: '#00f0ff' }}>{chObj ? chObj.title : `Challenge ID: ${chId}`}</strong>
                            {chObj && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>({chObj.type || 'code'}, {chObj.difficulty || 'Medium'})</span>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0.5rem' }}>
                      No challenge questions attached to this contest yet.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/contests/${selectedContestForManage._id || selectedContestForManage.id}`);
                      if (res.ok) {
                        const latestContest = await res.json();
                        setSelectedContestForManage(latestContest);
                        setContests(prev => prev.map(c => ((c._id || c.id) === (latestContest._id || latestContest.id) ? latestContest : c)));
                      }
                    } catch (err) {
                      console.error('Failed to fetch latest contest data', err);
                    }
                    setShowActiveParticipantsModal(true);
                  }}
                  style={{ width: '100%', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#3b82f6', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'; e.currentTarget.style.color = '#3b82f6'; }}
                >
                  <Eye size={16} /> View Active Participants ({selectedContestForManage.activeParticipants?.length || 0})
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/contests/${selectedContestForManage._id || selectedContestForManage.id}?_t=${Date.now()}`);
                      if (res.ok) {
                        const latestContest = await res.json();
                        setSelectedContestForManage(latestContest);
                        setContests(prev => prev.map(c => ((c._id || c.id) === (latestContest._id || latestContest.id) ? latestContest : c)));
                      }
                    } catch (err) {}
                    setShowCompletedModal(true);
                  }}
                  style={{ width: '100%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'; e.currentTarget.style.color = '#10b981'; }}
                >
                  <CheckCircle2 size={16} /> View Completed Students ({getCompletedCount(selectedContestForManage)})
                </button>
                <button
                  onClick={() => handleDownloadPdfReport(selectedContestForManage)}
                  disabled={generatingPdf}
                  style={{ width: '100%', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid #ec4899', color: '#ec4899', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: generatingPdf ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', opacity: generatingPdf ? 0.7 : 1 }}
                  onMouseOver={(e) => { if(!generatingPdf) { e.currentTarget.style.background = '#ec4899'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseOut={(e) => { if(!generatingPdf) { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)'; e.currentTarget.style.color = '#ec4899'; } }}
                >
                  <FileText size={16} /> {generatingPdf ? 'Generating Report...' : 'Download PDF Report'}
                </button>
                <button
                  onClick={() => handleDownloadDetailedPdfReport(selectedContestForManage)}
                  disabled={generatingPdf}
                  style={{ width: '100%', background: 'rgba(234, 88, 12, 0.15)', border: '1px solid #ea580c', color: '#ea580c', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: generatingPdf ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', opacity: generatingPdf ? 0.7 : 1 }}
                  onMouseOver={(e) => { if(!generatingPdf) { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseOut={(e) => { if(!generatingPdf) { e.currentTarget.style.background = 'rgba(234, 88, 12, 0.15)'; e.currentTarget.style.color = '#ea580c'; } }}
                >
                  <DownloadCloud size={16} /> {generatingPdf ? 'Generating PDF...' : 'Detailed Submissions Report (PDF)'}
                </button>
                <button
                  onClick={() => handleOpenEdit(selectedContestForManage)}
                  style={{ width: '100%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'; e.currentTarget.style.color = '#10b981'; }}
                >
                  <Edit2 size={16} /> Manage Attached Questions & Dates
                </button>
              </div>
            </div>

            {/* CARD 5: Contest Eligibility & Whitelist */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldAlert size={24} color="#00f0ff" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Participant Whitelist</h3>
                  </div>
                  <button
                    onClick={() => handleToggleWhitelist(selectedContestForManage)}
                    style={{
                      background: selectedContestForManage.whitelistEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${selectedContestForManage.whitelistEnabled ? '#00f0ff' : '#64748b'}`,
                      color: selectedContestForManage.whitelistEnabled ? '#00f0ff' : '#64748b',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {selectedContestForManage.whitelistEnabled ? 'MODE: ON' : 'MODE: OFF'}
                  </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Enforce strict eligibility. If enabled, only students in the imported whitelist can participate. They may use their Member ID or Roll Number to enter.
                </p>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Eligible Students:</span>
                    <strong style={{ fontSize: '1.15rem', color: selectedContestForManage.whitelistEnabled ? '#00f0ff' : '#94a3b8', fontFamily: 'monospace' }}>
                      {selectedContestForManage.whitelistedStudents?.length || 0} students
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    * Excel must contain columns named "Roll Number" (or "Member ID") and "Name".
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setWhitelistSearchQuery('');
                    setShowWhitelistViewModal(true);
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 240, 255, 0.12)',
                    border: '1px solid #00f0ff',
                    color: '#00f0ff',
                    fontWeight: 700,
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#00f0ff'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.12)'; e.currentTarget.style.color = '#00f0ff'; }}
                >
                  <Users size={16} />
                  <span>View Participant List ({selectedContestForManage.whitelistedStudents?.length || 0})</span>
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <label
                    style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, padding: '0.65rem', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', opacity: uploadingExcel ? 0.7 : 1 }}
                  >
                    <DownloadCloud size={16} /> 
                    {uploadingExcel ? 'Importing...' : 'Import Excel'}
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleExcelUpload(e, selectedContestForManage)}
                      disabled={uploadingExcel}
                    />
                  </label>

                  <button
                    onClick={() => setWhitelistManualOpen(true)}
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', fontWeight: 700, padding: '0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
                  >
                    ➕ Manual Entry
                  </button>
                </div>
                
                {selectedContestForManage.whitelistedStudents && selectedContestForManage.whitelistedStudents.length > 0 && (
                  <button
                    onClick={() => handleClearWhitelist(selectedContestForManage)}
                    style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed #ef4444', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                  >
                    🗑️ Clear Whitelist
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : contests.length === 0 ? (
        <div className={styles.emptyTable}>
          <Trophy size={40} color="#00f0ff" />
          <h3>No Contests Found</h3>
          <p>Click &quot;Create New Contest&quot; to launch a competitive coding and quiz tournament.</p>
        </div>
      ) : (
        <div className={styles.cardsList}>
          {contests.map((c) => (
            <div key={c._id || c.id} className={styles.challengeRowCard} style={{ borderLeft: c.isActive ? '4px solid #10b981' : '4px solid #ef4444', transition: 'all 0.2s' }}>
              <div className={styles.challengeRowInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span
                    className={styles.typeBadge}
                    style={{
                      background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: c.isActive ? '#10b981' : '#ef4444',
                      borderColor: c.isActive ? '#10b981' : '#ef4444'
                    }}
                  >
                    <Power size={14} />
                    {c.isActive ? '🟢 Active Arena' : '🔴 Closed / Inactive'}
                  </span>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <Calendar size={14} color="#60a5fa" />
                    {c.startTime} — {c.endTime}
                  </span>
                </div>

                <h4 className={styles.challengeTitle} style={{ fontSize: '1.35rem', color: '#fff', margin: '0.4rem 0 0.5rem 0' }}>{c.title}</h4>
                <p className={styles.challengeDesc} style={{ color: '#cbd5e1', marginBottom: '1.25rem' }}>{c.description || 'No description provided.'}</p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    🏆 Attached: <strong style={{ color: '#00f0ff' }}>{c.challenges?.length || 0}</strong> questions
                  </span>
                  <span style={{ color: '#475569' }}>•</span>
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    ⏱️ Timer: <strong style={{ color: c.timerEnabled ? '#4ade80' : '#94a3b8' }}>{c.timerEnabled ? `${c.timerDurationMinutes || 60}m ON` : 'OFF'}</strong>
                  </span>
                  <span style={{ color: '#475569' }}>•</span>
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    📊 Leaderboard: <strong style={{ color: (c.leaderboardEnabled !== false) ? '#60a5fa' : '#94a3b8' }}>{(c.leaderboardEnabled !== false) ? 'ON' : 'OFF'}</strong>
                  </span>
                  <span style={{ color: '#475569' }}>•</span>
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    📜 Certs: <strong style={{ color: c.certificateEnabled ? '#facc15' : '#94a3b8' }}>{c.certificateEnabled ? `ON (${c.certificateRecipients?.length || 0} sent)` : 'OFF'}</strong>
                  </span>
                </div>
              </div>

              <div className={styles.rowActions} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', justifyContent: 'space-between', width: '100%' }}>
                <button
                  onClick={() => setSelectedContestForManage(c)}
                  style={{
                    background: 'linear-gradient(135deg, #00f0ff, #3b82f6)',
                    color: '#000',
                    fontWeight: 800,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Code2 size={18} />
                  <span>Manage Contest & Settings ➔</span>
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={styles.editBtn}
                    style={{
                      background: c.isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      borderColor: c.isActive ? '#ef4444' : '#10b981',
                      color: c.isActive ? '#ef4444' : '#10b981',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                    title="Toggle Arena Active/Closed"
                  >
                    <Power size={16} />
                    <span>{c.isActive ? 'Turn OFF' : 'Turn ON'}</span>
                  </button>

                  <button onClick={() => handleOpenEdit(c)} className={styles.editBtn} title="Quick Edit Title/Dates" style={{ padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(c._id || c.id)} className={styles.deleteBtn} title="Delete Contest" style={{ padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Contest */}
      <AnimatePresence>
        {modalOpen && (
          <div key="modal-contest-form-overlay" className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={styles.modalCardLarge}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>{editingId ? 'Edit Contest Arena' : 'Launch New Contest'}</h3>
                <button onClick={() => setModalOpen(false)} className={styles.modalCloseBtn}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Contest Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. DATAXSCAPE 2026 Hackathon Warmup"
                      required
                    />
                  </div>

                  <div className={styles.formGroup} style={{ width: '170px' }}>
                    <label>Initial Status</label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    >
                      <option value="active">🟢 Active</option>
                      <option value="inactive">🔴 Closed</option>
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ width: '190px' }}>
                    <label>Leaderboard</label>
                    <select
                      value={formData.leaderboardEnabled !== false ? 'on' : 'off'}
                      onChange={(e) => setFormData({ ...formData, leaderboardEnabled: e.target.value === 'on' })}
                    >
                      <option value="on">📊 ON (Public)</option>
                      <option value="off">🔒 OFF (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Contest Description & Rules</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the contest rules, eligibility, and prize pool..."
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Start Date & Time</label>
                    <input
                      type="text"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      placeholder="e.g. 2026-08-01 10:00 AM"
                      required
                    />
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>End Date & Time</label>
                    <input
                      type="text"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      placeholder="e.g. 2026-08-05 11:59 PM"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow} style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.2)', marginBottom: '1rem', alignItems: 'center' }}>
                  <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.timerEnabled}
                        onChange={(e) => setFormData({ ...formData, timerEnabled: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00f0ff' }}
                      />
                      <span style={{ fontWeight: 800, color: '#00f0ff', fontSize: '0.9rem' }}>⏱️ Enable Live Countdown Timer</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>Participants will see a countdown ticker and cannot submit once time expires.</span>
                  </div>
                  {formData.timerEnabled && (
                    <div className={styles.formGroup} style={{ width: '180px', marginBottom: 0 }}>
                      <label style={{ color: '#00f0ff', fontWeight: 700 }}>Duration (Mins)</label>
                      <input
                        type="number"
                        min={1}
                        max={1440}
                        value={formData.timerDurationMinutes}
                        onChange={(e) => setFormData({ ...formData, timerDurationMinutes: parseInt(e.target.value) || 60 })}
                        required
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #00f0ff', color: '#fff', fontWeight: 800 }}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Select Challenge Questions for this Contest</span>
                    <span style={{ fontSize: '0.8rem', color: '#00f0ff' }}>{formData.challenges.length} selected</span>
                  </label>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
                    Check the boxes below to attach coding problems or quizzes from your library to this contest arena:
                  </p>

                  <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {challenges.length === 0 ? (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No challenges in library yet. Create some in Challenge Manager!</span>
                    ) : (
                      challenges.map(ch => {
                        const isChecked = formData.challenges.includes(ch._id);
                        return (
                          <div
                            key={ch._id}
                            onClick={() => handleToggleChallenge(ch._id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              background: isChecked ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                              border: isChecked ? '1px solid #00f0ff' : '1px solid transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly={true}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <span style={{ fontWeight: 600, color: isChecked ? '#fff' : '#cbd5e1', display: 'block', fontSize: '0.9rem' }}>{ch.title}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {ch.type?.toUpperCase()} • {ch.difficulty}
                                  {ch.isHidden && <span style={{ color: '#ef4444', marginLeft: '6px', fontWeight: 700 }}>• 🔴 Hidden in Library (Contest Only)</span>}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>+{ch.points} PTS</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className={styles.saveBtn}>
                    {saving ? 'Saving...' : editingId ? 'Update Contest Arena' : 'Launch Contest Arena'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {successPopup && (
          <div key="modal-contest-success-overlay" className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setSuccessPopup(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className={styles.successPopupCard} style={{ zIndex: 1000 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.successPopupIcon}>
                <CheckCircle2 size={48} color="#22c55e" />
              </div>
              <h3 className={styles.successPopupTitle}>{successPopup.title}</h3>
              <p className={styles.successPopupMessage}>{successPopup.message}</p>
              <button
                onClick={() => setSuccessPopup(null)}
                className={styles.successPopupBtn}
              >
                Got It!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restriction Management Modal */}
      <AnimatePresence>
        {selectedContestForRestrictions && (
          <div key="modal-contest-restrictions-overlay" className={styles.modalOverlay} style={{ zIndex: 9999, alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(12px)', padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', background: '#0f172a', border: '1px solid #f87171', padding: '2rem', borderRadius: '20px', boxShadow: '0 0 40px rgba(248, 113, 113, 0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={22} color="#f87171" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Restricted Members List</h3>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedContestForRestrictions.title}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenRestrictions(selectedContestForRestrictions)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #475569', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Refresh from Database"
                  >
                    <RefreshCw size={14} />
                    <span>Refresh List</span>
                  </button>
                  <button onClick={() => setSelectedContestForRestrictions(null)} className={styles.closeBtn}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                The following students exceeded the maximum anti-cheat violations (Tab Switching / Leaving Full Screen) and are barred from re-entering this contest arena. Click <strong>Remove Restriction</strong> to unban a member.
              </p>

              {!selectedContestForRestrictions.restrictedMembers || selectedContestForRestrictions.restrictedMembers.length === 0 ? (
                <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #334155' }}>
                  🎉 No restricted members in this contest arena!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedContestForRestrictions.restrictedMembers.map((mId) => (
                    <div key={mId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                          🚫 BANNED
                        </span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{mId}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveRestriction(selectedContestForRestrictions._id || selectedContestForRestrictions.id, mId)}
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 700, padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                      >
                        <Unlock size={14} />
                        <span>Remove Restriction</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedContestForRestrictions(null)} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '0.65rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Contest Leaderboard Modal */}
      <AnimatePresence>
        {selectedContestForLeaderboard && (
          <div key="modal-contest-leaderboard-overlay" className={styles.modalOverlay} style={{ zIndex: 9999, alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(12px)', padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ width: '100%', maxWidth: '750px', maxHeight: '85vh', overflowY: 'auto', background: '#0f172a', border: '1px solid #38bdf8', padding: '2rem', borderRadius: '20px', boxShadow: '0 0 40px rgba(56, 189, 248, 0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={22} color="#38bdf8" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Contest Leaderboard Standings</h3>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedContestForLeaderboard.title}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: selectedContestForLeaderboard.leaderboardEnabled !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: selectedContestForLeaderboard.leaderboardEnabled !== false ? '#10b981' : '#f87171', border: `1px solid ${selectedContestForLeaderboard.leaderboardEnabled !== false ? '#10b981' : '#f87171'}`, padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {selectedContestForLeaderboard.leaderboardEnabled !== false ? '🟢 PUBLIC ON' : '🔴 HIDDEN OFF'}
                  </span>
                  <button
                    onClick={() => handleOpenContestLeaderboard(selectedContestForLeaderboard)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #475569', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Refresh Standings"
                  >
                    <RefreshCw size={14} />
                    <span>Refresh</span>
                  </button>
                  <button onClick={() => setSelectedContestForLeaderboard(null)} className={styles.closeBtn}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {loadingLeaderboard ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <RefreshCw size={32} className={styles.spinner} color="#38bdf8" />
                  <span>Calculating contest scores and standings...</span>
                </div>
              ) : contestLeaderboardData.length === 0 ? (
                <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #334155' }}>
                  🏆 No submissions yet for this contest arena!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {contestLeaderboardData.map((row, index) => (
                    <div key={row.memberId || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: index === 0 ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.15), rgba(30, 41, 59, 0.8))' : '#1e293b', padding: '1rem 1.25rem', borderRadius: '12px', border: index === 0 ? '1px solid #eab308' : '1px solid #334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: index === 0 ? '#eab308' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.05)', color: index < 3 ? '#000' : '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                              #{row.rank || index + 1}
                        </span>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{row.name || 'Student'}</span>
                            <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.1)', color: '#00f0ff', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                              {row.memberId}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                            {row.department || 'DSCAI'} • Solved: <strong style={{ color: '#10b981' }}>{row.submissionsCount || 0}</strong> / {row.totalChallenges || selectedContestForLeaderboard?.challenges?.length || 0}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00f0ff' }}>
                          {row.score} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PTS</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedContestForLeaderboard(null)} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '0.65rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedContestForCert && (
          <div className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => !savingCert && setSelectedContestForCert(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalCardLarge}
              style={{ maxWidth: '700px', width: '95%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 style={{ margin: 0, color: '#facc15', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Award size={22} color="#facc15" />
                  <span>Certificate Settings: {selectedContestForCert.title}</span>
                </h3>
                <button type="button" onClick={() => !savingCert && setSelectedContestForCert(null)} className={styles.modalCloseBtn} disabled={savingCert}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCertSettings} className={styles.modalForm}>
                <div style={{ background: 'rgba(250, 204, 21, 0.08)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '1.05rem', marginBottom: '0.25rem' }}>Enable Certificate Distribution</strong>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Allow admins to generate and send participation emails with PDF certificates</span>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '54px', height: '28px', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={certFormData.certificateEnabled}
                      onChange={e => setCertFormData({ ...certFormData, certificateEnabled: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: certFormData.certificateEnabled ? '#facc15' : '#475569',
                      borderRadius: '34px', transition: '.3s'
                    }}>
                      <span style={{
                        position: 'absolute', height: '22px', width: '22px', left: '3px', bottom: '3px',
                        backgroundColor: '#0f172a', borderRadius: '50%', transition: '.3s',
                        transform: certFormData.certificateEnabled ? 'translateX(26px)' : 'none'
                      }} />
                    </span>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label>Custom Certificate Template Background (Optional)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{
                        background: 'linear-gradient(135deg, #facc15, #eab308)',
                        color: '#0f172a',
                        padding: '0.6rem 1.1rem',
                        borderRadius: '0.6rem',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(250, 204, 21, 0.3)',
                        margin: 0
                      }}>
                        📁 Upload Template Image from PC
                        <input type="file" accept="image/*" onChange={handleCertImageUpload} style={{ display: 'none' }} />
                      </label>
                      {certFormData.backgroundImageUrl && (
                        <button
                          type="button"
                          onClick={() => setCertFormData(prev => ({ ...prev, backgroundImageUrl: '' }))}
                          style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 0.85rem', borderRadius: '0.6rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          🗑️ Remove Custom Template
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>Template URL:</span>
                      <input
                        type="text"
                        value={certFormData.backgroundImageUrl || ''}
                        onChange={(e) => setCertFormData({ ...certFormData, backgroundImageUrl: e.target.value })}
                        placeholder="Paste template image URL or upload file above..."
                      />
                    </div>
                    {certFormData.backgroundImageUrl ? (
                      <div style={{ marginTop: '0.25rem', borderRadius: '0.6rem', overflow: 'hidden', maxHeight: '180px', border: '1px solid rgba(250, 204, 21, 0.4)', background: '#000', position: 'relative', textAlign: 'center' }}>
                        <img
                          src={certFormData.backgroundImageUrl}
                          alt="Certificate Template Preview"
                          style={{ width: '100%', height: '180px', objectFit: 'contain', background: '#0f172a' }}
                        />
                        <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(15, 23, 42, 0.85)', color: '#facc15', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #facc15' }}>
                          ✔️ Custom Template Active
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        💡 Tip: Upload an image in A4 landscape ratio. When set, this image replaces the default dark box and borders, and our engine automatically overlays the student name, score, rank, and signatures on top!
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 1.5 }}>
                    <label>Certificate Main Title</label>
                    <input
                      type="text"
                      value={certFormData.title}
                      onChange={e => setCertFormData({ ...certFormData, title: e.target.value })}
                      placeholder="CERTIFICATE OF PARTICIPATION"
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Subtitle Text</label>
                    <input
                      type="text"
                      value={certFormData.subtitle}
                      onChange={e => setCertFormData({ ...certFormData, subtitle: e.target.value })}
                      placeholder="This is proudly presented to"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Body Description Text (Supports Placeholders)</label>
                  <textarea
                    rows={4}
                    value={certFormData.bodyText}
                    onChange={e => setCertFormData({ ...certFormData, bodyText: e.target.value })}
                    placeholder="for actively participating in..."
                    required
                  />
                  <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '0.85rem', borderRadius: '10px', marginTop: '0.5rem', border: '1px solid #334155', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.4rem' }}>💡 Dynamic Placeholders Available:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <code style={{ background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#facc15', border: '1px solid #475569' }}>[MEMBER_NAME]</code>
                      <code style={{ background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#facc15', border: '1px solid #475569' }}>[CONTEST_TITLE]</code>
                      <code style={{ background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#facc15', border: '1px solid #475569' }}>[DATE]</code>
                      <code style={{ background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#facc15', border: '1px solid #475569' }}>[MEMBER_ID]</code>
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Signatory Name</label>
                    <input
                      type="text"
                      value={certFormData.signatoryName}
                      onChange={e => setCertFormData({ ...certFormData, signatoryName: e.target.value })}
                      placeholder="Dr. S. Malathi"
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Signatory Title</label>
                    <input
                      type="text"
                      value={certFormData.signatoryTitle}
                      onChange={e => setCertFormData({ ...certFormData, signatoryTitle: e.target.value })}
                      placeholder="HOD - Dept of AI & DS"
                      required
                    />
                  </div>
                  <div className={styles.formGroup} style={{ width: '180px' }}>
                    <label>Accent Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={certFormData.accentColor}
                        onChange={e => setCertFormData({ ...certFormData, accentColor: e.target.value })}
                        style={{ width: '42px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={certFormData.accentColor}
                        onChange={e => setCertFormData({ ...certFormData, accentColor: e.target.value })}
                        placeholder="#00f0ff"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={handlePreviewCert}
                    className={styles.saveBtn}
                    disabled={previewingCert || savingCert}
                    style={{ background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff', border: '1px solid #00f0ff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginRight: 'auto' }}
                    title="Generate and view PDF preview in new tab"
                  >
                    {previewingCert ? <Loader2 size={16} className={styles.spinner} /> : <Eye size={16} />}
                    {previewingCert ? 'Generating Preview...' : '👁️ Preview Certificate PDF'}
                  </button>
                  <button type="button" onClick={() => setSelectedContestForCert(null)} className={styles.cancelBtn} disabled={savingCert || previewingCert}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={savingCert || previewingCert} style={{ background: '#facc15', color: '#0f172a', fontWeight: 800 }}>
                    {savingCert ? 'Saving Settings...' : 'Save Certificate Settings'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {sendingCertContest && (
          <div className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => !sendingCertProgress && setSendingCertContest(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalContent}
              style={{ maxWidth: '650px', width: '95%' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Mail size={22} color="#00f0ff" />
                  <span>Send Certificates: {sendingCertContest.title}</span>
                </h3>
                <button onClick={() => !sendingCertProgress && setSendingCertContest(null)} className={styles.closeBtn} disabled={sendingCertProgress}>
                  <X size={18} />
                </button>
              </div>

              {sendingCertProgress ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  <Loader2 size={42} className={styles.spinner} color="#00f0ff" style={{ animation: 'spin 1s linear infinite' }} />
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Generating & Sending Certificates...</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Please wait while PDFs are created and emailed via Brevo. Do not close this window.</p>
                  </div>
                </div>
              ) : certSendResult ? (
                <div>
                  <div style={{
                    background: certSendResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${certSendResult.success ? '#10b981' : '#ef4444'}`,
                    padding: '1.25rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: certSendResult.success ? '#10b981' : '#ef4444', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                      {certSendResult.message || 'Operation Finished'}
                    </h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                      Total Participants: <strong>{certSendResult.totalParticipants || 0}</strong> | Successfully Sent: <strong style={{ color: '#10b981' }}>{certSendResult.sentCount || 0}</strong> | Failed: <strong style={{ color: '#ef4444' }}>{certSendResult.failedCount || 0}</strong>
                    </p>
                  </div>

                  {certSendResult.results && certSendResult.results.length > 0 && (
                    <div style={{ maxHeight: '250px', overflowY: 'auto', background: '#0f172a', padding: '0.75rem', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {certSendResult.results.map((r, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: '#1e293b', borderRadius: '6px' }}>
                          <div>
                            <strong style={{ color: '#fff' }}>{r.name}</strong> <span style={{ color: '#94a3b8' }}>({r.email})</span>
                            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Member ID: {r.memberId || 'N/A'} • Sent: {r.sentAt ? new Date(r.sentAt).toLocaleTimeString() : 'Just now'}</div>
                          </div>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            background: r.status === 'sent' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: r.status === 'sent' ? '#10b981' : '#ef4444'
                          }}>
                            {r.status === 'sent' ? '✅ SENT' : `❌ FAILED: ${r.error}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setSendingCertContest(null)} className={styles.submitBtn} style={{ background: '#00f0ff', color: '#0f172a', fontWeight: 800 }}>
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={24} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ color: '#f87171', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Confirm Bulk Email Dispatch</h4>
                      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                        Are you ready to generate A4 landscape PDF certificates and email them to <strong>all participants</strong> of <strong>{sendingCertContest.title}</strong>? This action will use your Brevo email API quota.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" onClick={() => setSendingCertContest(null)} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSendCerts}
                      className={styles.submitBtn}
                      style={{ background: '#00f0ff', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Send size={16} />
                      <span>Confirm & Send Certificates Now</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {viewingRecipientsContest && (
          <div className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => setViewingRecipientsContest(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalContent}
              style={{ maxWidth: '650px', width: '95%' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Award size={22} color="#34d399" />
                  <span>Certificate Recipients: {viewingRecipientsContest.title}</span>
                </h3>
                <button onClick={() => setViewingRecipientsContest(null)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              {(!viewingRecipientsContest.certificateRecipients || viewingRecipientsContest.certificateRecipients.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <p style={{ margin: 0, fontSize: '1rem' }}>No certificates have been sent for this contest yet.</p>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                    Total Records: <strong style={{ color: '#34d399' }}>{viewingRecipientsContest.certificateRecipients.length}</strong>
                  </p>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', background: '#0f172a', padding: '0.75rem', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {viewingRecipientsContest.certificateRecipients.map((r, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.6rem 0.85rem', background: '#1e293b', borderRadius: '6px' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{r.name || 'Participant'}</strong> <span style={{ color: '#94a3b8' }}>({r.email})</span>
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                            Member ID: {r.memberId || 'N/A'} • Sent: {r.sentAt ? new Date(r.sentAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          background: r.status === 'sent' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: r.status === 'sent' ? '#10b981' : '#ef4444'
                        }}>
                          {r.status === 'sent' ? '✅ SENT' : `❌ FAILED`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setViewingRecipientsContest(null)} className={styles.submitBtn} style={{ background: '#34d399', color: '#0f172a', fontWeight: 800 }}>
                  Close List
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Manual Whitelist Entry */}
      <AnimatePresence>
        {whitelistManualOpen && (
          <div key="modal-whitelist-manual-overlay" className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => setWhitelistManualOpen(false)}>
            <motion.div
              key="modal-whitelist-manual-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '2rem', maxWidth: '400px' }}
            >
              <div className={styles.modalHeader}>
                <h3>Manual Whitelist Entry</h3>
                <button onClick={() => setWhitelistManualOpen(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Roll Number or Member ID *</label>
                  <input
                    type="text"
                    value={manualWhitelistEntry.identifier}
                    onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, identifier: e.target.value.toUpperCase() })}
                    placeholder="e.g. 21104101"
                    className={styles.inputField}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label>Student Name</label>
                  <input
                    type="text"
                    value={manualWhitelistEntry.name}
                    onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className={styles.inputField}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={manualWhitelistEntry.email || ''}
                    onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, email: e.target.value })}
                    placeholder="e.g. johndoe@example.com"
                    className={styles.inputField}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter} style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setWhitelistManualOpen(false)} className={styles.cancelBtn} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleSaveManualWhitelistEntry} className={styles.saveBtn} style={{ flex: 1, padding: '0.75rem', background: '#00f0ff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Add to Whitelist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Whitelist Import Preview */}
      <AnimatePresence>
        {showWhitelistPreviewModal && whitelistPreviewData && (
          <div key="modal-whitelist-preview-overlay" className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => setShowWhitelistPreviewModal(false)}>
            <motion.div
              key="modal-whitelist-preview-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              style={{ maxWidth: '600px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Import Preview ({whitelistPreviewData.newStudents.length} Students)</h3>
                <button onClick={() => setShowWhitelistPreviewModal(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalBody} style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Roll Number / ID</th>
                      <th style={{ padding: '0.5rem' }}>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whitelistPreviewData.newStudents.map((stu, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: '#00f0ff' }}>{stu.identifier}</td>
                        <td style={{ padding: '0.5rem' }}>{stu.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.modalFooter} style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowWhitelistPreviewModal(false)} className={styles.cancelBtn} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleConfirmWhitelistImport} disabled={uploadingExcel} className={styles.saveBtn} style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {uploadingExcel ? <Loader2 size={18} className={styles.spin} /> : <CheckCircle2 size={18} />}
                  Confirm & Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Viewing Whitelisted Participants with Search */}
      <AnimatePresence>
        {showWhitelistViewModal && selectedContestForManage && (
          <div key="modal-whitelist-view-overlay" className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => setShowWhitelistViewModal(false)}>
            <motion.div
              key="modal-whitelist-view-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              style={{ maxWidth: '750px', width: '95%', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(0, 240, 255, 0.3)', boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Users size={22} color="#00f0ff" />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>Whitelisted Participants</h3>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                    {selectedContestForManage.title} • <strong style={{ color: '#00f0ff' }}>{selectedContestForManage.whitelistedStudents?.length || 0}</strong> registered student{(selectedContestForManage.whitelistedStudents?.length || 0) === 1 ? '' : 's'}
                  </span>
                </div>
                <button onClick={() => setShowWhitelistViewModal(false)} className={styles.closeBtn} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody} style={{ padding: '1.25rem 0' }}>
                {/* Search Bar & Quick Add */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search by Roll Number, Name, or Email..."
                      value={whitelistSearchQuery}
                      onChange={(e) => setWhitelistSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 2.2rem 0.7rem 2.4rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#00f0ff'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                    />
                    {whitelistSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setWhitelistSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        title="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setWhitelistManualOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #00f0ff, #0072ff)',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '0.7rem 1.1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Plus size={16} /> Add Student
                  </button>
                </div>

                {/* Filtered Count Display */}
                {(() => {
                  const allStudents = selectedContestForManage.whitelistedStudents || [];
                  const query = whitelistSearchQuery.trim().toLowerCase();
                  const filtered = query
                    ? allStudents.filter(s =>
                        (s && s.identifier && s.identifier.toLowerCase().includes(query)) ||
                        (s && s.name && s.name.toLowerCase().includes(query)) ||
                        (s && s.email && s.email.toLowerCase().includes(query))
                      )
                    : allStudents;

                  if (allStudents.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                        <Users size={40} color="#64748b" style={{ margin: '0 auto 0.75rem auto', display: 'block', opacity: 0.6 }} />
                        <h4 style={{ color: '#cbd5e1', marginBottom: '0.4rem' }}>No Students on Whitelist</h4>
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>Import an Excel sheet or use &quot;Add Student&quot; to authorize participants.</p>
                      </div>
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                        <Search size={36} color="#64748b" style={{ margin: '0 auto 0.75rem auto', display: 'block', opacity: 0.6 }} />
                        <h4 style={{ color: '#cbd5e1', marginBottom: '0.4rem' }}>No Matches Found</h4>
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>No whitelisted students matching &quot;{whitelistSearchQuery}&quot;.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '0.88rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#0b1120', zIndex: 1 }}>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 0.6rem 0.75rem 0.85rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', width: '45px' }}>#</th>
                            <th style={{ padding: '0.75rem 0.75rem', color: '#00f0ff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Roll No / ID</th>
                            <th style={{ padding: '0.75rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student Name</th>
                            <th style={{ padding: '0.75rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</th>
                            <th style={{ padding: '0.75rem 0.85rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right', width: '60px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((stu, idx) => (
                            <tr
                              key={stu.identifier || idx}
                              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <td style={{ padding: '0.65rem 0.6rem 0.65rem 0.85rem', color: '#64748b', fontSize: '0.8rem' }}>{idx + 1}</td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <span style={{ fontFamily: 'monospace', color: '#00f0ff', fontWeight: 700, background: 'rgba(0, 240, 255, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                                  {stu.identifier}
                                </span>
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#f1f5f9' }}>{stu.name || '—'}</td>
                              <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8', fontSize: '0.82rem' }}>{stu.email || '—'}</td>
                              <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWhitelistedStudent(stu.identifier)}
                                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                  title={`Remove ${stu.identifier} from whitelist`}
                                  onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              <div className={styles.modalFooter} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {(() => {
                    const allStudents = selectedContestForManage.whitelistedStudents || [];
                    const query = whitelistSearchQuery.trim().toLowerCase();
                    const filtered = query
                      ? allStudents.filter(s =>
                          (s && s.identifier && s.identifier.toLowerCase().includes(query)) ||
                          (s && s.name && s.name.toLowerCase().includes(query)) ||
                          (s && s.email && s.email.toLowerCase().includes(query))
                        )
                      : allStudents;
                    return `Showing ${filtered.length} of ${allStudents.length} student${allStudents.length === 1 ? '' : 's'}`;
                  })()}
                </span>
                <button
                  type="button"
                  onClick={() => setShowWhitelistViewModal(false)}
                  className={styles.cancelBtn}
                  style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Active Participants */}
      <AnimatePresence>
        {showActiveParticipantsModal && selectedContestForManage && (
          <div key="modal-active-participants-overlay" className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => setShowActiveParticipantsModal(false)}>
            <motion.div
              key="modal-active-participants-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              style={{ maxWidth: '850px', width: '92%', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={22} color="#00f0ff" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Active Test Participants ({selectedContestForManage.activeParticipants?.length || 0})</h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      Live session telemetry, scores, and completion status for this contest.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowActiveParticipantsModal(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar: Search */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    value={activeParticipantSearch}
                    onChange={(e) => setActiveParticipantSearch(e.target.value)}
                    placeholder="Search by Roll Number, Name, or Status..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  {activeParticipantSearch && (
                    <button
                      onClick={() => setActiveParticipantSearch('')}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.15)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { id: 'ALL', label: `All (${selectedContestForManage.activeParticipants?.length || 0})`, color: '#38bdf8' },
                  { id: 'completed', label: `🎓 Completed (${(selectedContestForManage.activeParticipants || []).filter(p => p.status === 'completed' || (selectedContestForManage.completedMembers || []).map(m => m.toUpperCase()).includes((p.memberId || '').toUpperCase())).length})`, color: '#10b981' },
                  { id: 'in_progress', label: `🟢 In Progress (${(selectedContestForManage.activeParticipants || []).filter(p => p.status !== 'completed' && p.status !== 'restricted' && !(selectedContestForManage.completedMembers || []).map(m => m.toUpperCase()).includes((p.memberId || '').toUpperCase())).length})`, color: '#00f0ff' },
                  { id: 'restricted', label: `🔴 Disqualified (${(selectedContestForManage.activeParticipants || []).filter(p => p.status === 'restricted').length})`, color: '#ef4444' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveParticipantStatusFilter(tab.id)}
                    style={{
                      background: activeParticipantStatusFilter === tab.id ? `${tab.color}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${activeParticipantStatusFilter === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`,
                      color: activeParticipantStatusFilter === tab.id ? tab.color : '#94a3b8',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={styles.modalBody} style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem' }}>
                {(() => {
                  const participants = selectedContestForManage.activeParticipants || [];
                  const q = activeParticipantSearch.trim().toLowerCase();

                  const filtered = participants.filter(p => {
                    if (activeParticipantStatusFilter !== 'ALL') {
                      const isCompleted = p.status === 'completed' || (selectedContestForManage.completedMembers || []).map(m => m.toUpperCase()).includes((p.memberId || '').toUpperCase());
                      if (activeParticipantStatusFilter === 'completed' && !isCompleted) return false;
                      if (activeParticipantStatusFilter === 'in_progress' && (isCompleted || p.status === 'restricted')) return false;
                      if (activeParticipantStatusFilter === 'restricted' && p.status !== 'restricted') return false;
                    }
                    if (q) {
                      const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                      const nMatch = p.name && p.name.toLowerCase().includes(q);
                      const sMatch = p.status && p.status.toLowerCase().includes(q);
                      if (!mMatch && !nMatch && !sMatch) return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        {q || activeParticipantStatusFilter !== 'ALL'
                          ? 'No participants found matching the selected filter.'
                          : 'No students have joined this arena yet.'}
                      </div>
                    );
                  }

                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', background: 'rgba(0,0,0,0.2)' }}>
                          <th style={{ padding: '0.6rem 0.75rem', width: '40px' }}>#</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Roll Number / ID</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Student Name</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Score</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Status</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((stu, idx) => {
                          const isCompleted = stu.status === 'completed' || (selectedContestForManage.completedMembers || []).map(m => m.toUpperCase()).includes((stu.memberId || '').toUpperCase());
                          const statusColor = isCompleted ? '#10b981' : stu.status === 'restricted' ? '#ef4444' : '#00f0ff';
                          const statusBg = isCompleted ? 'rgba(16, 185, 129, 0.15)' : stu.status === 'restricted' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 240, 255, 0.15)';
                          const statusLabel = isCompleted ? '✅ Completed' : stu.status === 'restricted' ? '🔴 Disqualified' : '🟢 In Progress';

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{idx + 1}</td>
                              <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                                {stu.memberId}
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                                {stu.name || 'Anonymous'}
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#34d399' }}>
                                {stu.score || 0} pts
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: statusBg, color: statusColor, border: `1px solid ${statusColor}40` }}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                {isCompleted && stu.completedAt
                                  ? new Date(stu.completedAt).toLocaleTimeString()
                                  : stu.joinedAt
                                  ? new Date(stu.joinedAt).toLocaleTimeString()
                                  : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              <div className={styles.modalFooter} style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {(() => {
                    const all = selectedContestForManage.activeParticipants || [];
                    const q = activeParticipantSearch.trim().toLowerCase();
                    const filtered = all.filter(p => {
                      if (activeParticipantStatusFilter !== 'ALL') {
                        const isCompleted = p.status === 'completed' || (selectedContestForManage.completedMembers || []).map(m => m.toUpperCase()).includes((p.memberId || '').toUpperCase());
                        if (activeParticipantStatusFilter === 'completed' && !isCompleted) return false;
                        if (activeParticipantStatusFilter === 'in_progress' && (isCompleted || p.status === 'restricted')) return false;
                        if (activeParticipantStatusFilter === 'restricted' && p.status !== 'restricted') return false;
                      }
                      if (q) {
                        const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                        const nMatch = p.name && p.name.toLowerCase().includes(q);
                        const sMatch = p.status && p.status.toLowerCase().includes(q);
                        if (!mMatch && !nMatch && !sMatch) return false;
                      }
                      return true;
                    });
                    return `Showing ${filtered.length} of ${all.length} participant${all.length === 1 ? '' : 's'}`;
                  })()}
                </span>
                <button
                  type="button"
                  onClick={() => setShowActiveParticipantsModal(false)}
                  className={styles.cancelBtn}
                  style={{ padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated Modal for Completed Students */}
      <AnimatePresence>
        {showCompletedModal && selectedContestForManage && (
          <div key="modal-completed-students-overlay" className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => setShowCompletedModal(false)}>
            <motion.div
              key="modal-completed-students-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              style={{ maxWidth: '850px', width: '92%', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Completed Students ({getCompletedCount(selectedContestForManage)})</h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      All students who have finished or exited this contest arena. Re-entry has been permanently locked.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowCompletedModal(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar: Search */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    value={completedSearchQuery}
                    onChange={(e) => setCompletedSearchQuery(e.target.value)}
                    placeholder="Search by Roll Number or Name..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  {completedSearchQuery && (
                    <button
                      onClick={() => setCompletedSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.modalBody} style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem' }}>
                {(() => {
                  const allCompleted = getCompletedStudentsList(selectedContestForManage);
                  const q = completedSearchQuery.trim().toLowerCase();

                  const filtered = allCompleted.filter(p => {
                    if (q) {
                      const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                      const nMatch = p.name && p.name.toLowerCase().includes(q);
                      if (!mMatch && !nMatch) return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        {q
                          ? 'No completed students found matching the selected search query.'
                          : 'No students have completed or exited this contest arena yet.'}
                      </div>
                    );
                  }

                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', background: 'rgba(0,0,0,0.2)' }}>
                          <th style={{ padding: '0.6rem 0.75rem', width: '40px' }}>#</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Roll Number / ID</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Student Name</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Score</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Status</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Completed Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((stu, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{idx + 1}</td>
                            <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                              {stu.memberId}
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                              {stu.name || 'Anonymous'}
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#34d399' }}>
                              {stu.score} pts
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                ✅ Completed
                              </span>
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                              {stu.completedAt ? new Date(stu.completedAt).toLocaleString() : 'Submitted / Exited'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              <div className={styles.modalFooter} style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {(() => {
                    const allCompleted = getCompletedStudentsList(selectedContestForManage);
                    const q = completedSearchQuery.trim().toLowerCase();
                    const filtered = allCompleted.filter(p => {
                      if (q) {
                        const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                        const nMatch = p.name && p.name.toLowerCase().includes(q);
                        if (!mMatch && !nMatch) return false;
                      }
                      return true;
                    });
                    return `Showing ${filtered.length} of ${allCompleted.length} completed student${allCompleted.length === 1 ? '' : 's'}`;
                  })()}
                </span>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => exportCompletedCSV(selectedContestForManage)}
                    style={{ padding: '0.55rem 1rem', background: '#10b981', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Export completed students list as CSV"
                  >
                    <DownloadCloud size={16} /> Export to CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompletedModal(false)}
                    className={styles.cancelBtn}
                    style={{ padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for PDF Report Preview */}
      <AnimatePresence>
        {showPdfPreviewModal && pdfPreviewUrl && (
          <div key="modal-pdf-preview-overlay" className={styles.modalOverlay} style={{ zIndex: 1050 }} onClick={() => setShowPdfPreviewModal(false)}>
            <motion.div
              key="modal-pdf-preview-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              style={{ width: '90%', maxWidth: '800px', height: '80vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Report Preview</h3>
                <button onClick={() => setShowPdfPreviewModal(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalBody} style={{ flex: 1, padding: '1rem', overflow: 'hidden' }}>
                <iframe src={pdfPreviewUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', backgroundColor: '#fff' }} title="PDF Report Preview" />
              </div>
              <div className={styles.modalFooter} style={{ padding: '1rem', display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button type="button" onClick={() => setShowPdfPreviewModal(false)} className={styles.cancelBtn} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDetailedPdfReport(selectedContestForManage)}
                  disabled={generatingPdf}
                  style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: generatingPdf ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: generatingPdf ? 0.7 : 1 }}
                >
                  <DownloadCloud size={18} /> {generatingPdf ? 'Generating PDF...' : 'Detailed Report (PDF)'}
                </button>
                <a 
                  href={pdfPreviewUrl} 
                  download={generatedPdfDocTitle} 
                  style={{ flex: 1, padding: '0.75rem', background: '#ec4899', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                  onClick={() => setShowPdfPreviewModal(false)}
                >
                  <DownloadCloud size={18} /> Download PDF
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
