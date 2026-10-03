"use client";

import { useState, useEffect } from 'react';
import { Trophy, Plus, Edit2, Trash2, RefreshCw, X, CheckCircle2, Power, Calendar, Clock, Code2, HelpCircle, ShieldAlert, Unlock, FileText, AlertCircle, Loader2, Play, Pause, Square, Eye, Timer, DownloadCloud, UploadCloud, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../Admin.module.css';

export default function TSPManager() {
  const [tsps, setTSPs] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);
  const [selectedTSPForRestrictions, setSelectedTSPForRestrictions] = useState(null);
  const [selectedTSPForLeaderboard, setSelectedTSPForLeaderboard] = useState(null);
  const [tspLeaderboardData, setTSPLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedTSPForManage, setSelectedTSPForManage] = useState(null);

  useEffect(() => {
    if (selectedTSPForManage && tsps.length > 0) {
      const targetId = (selectedTSPForManage._id || selectedTSPForManage.id || '').toString();
      const updated = tsps.find(c => {
        const cId = (c._id || c.id || '').toString();
        return cId === targetId;
      });
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTSPForManage)) {
        setSelectedTSPForManage(updated);
      }
    }
  }, [tsps, selectedTSPForManage]);

  useEffect(() => {
    const timerInterval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timerInterval);
  }, []);
  const [whitelistManualOpen, setWhitelistManualOpen] = useState(false);
  const [manualWhitelistEntry, setManualWhitelistEntry] = useState({ rollNo: '', name: '', registerNo: '', email: '', identifier: '' });
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [whitelistPreviewData, setWhitelistPreviewData] = useState(null);
  const [showWhitelistPreviewModal, setShowWhitelistPreviewModal] = useState(false);
  const [showWhitelistViewModal, setShowWhitelistViewModal] = useState(false);
  const [whitelistSearchQuery, setWhitelistSearchQuery] = useState('');
  const [whitelistCodeFilter, setWhitelistCodeFilter] = useState('ALL');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showActiveParticipantsModal, setShowActiveParticipantsModal] = useState(false);
  const [activeParticipantSearch, setActiveParticipantSearch] = useState('');
  const [activeParticipantCodeFilter, setActiveParticipantCodeFilter] = useState('ALL');
  const [activeParticipantStatusFilter, setActiveParticipantStatusFilter] = useState('ALL');
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedSearchQuery, setCompletedSearchQuery] = useState('');
  const [completedCodeFilter, setCompletedCodeFilter] = useState('ALL');
  const [newAccessCodeInput, setNewAccessCodeInput] = useState('');
  const [newAccessCodeLabel, setNewAccessCodeLabel] = useState('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [generatedPdfDocTitle, setGeneratedPdfDocTitle] = useState('');
  const [showReportExportModal, setShowReportExportModal] = useState(false);
  const [reportScope, setReportScope] = useState('ALL'); // 'ALL' or 'CODE'
  const [selectedReportCode, setSelectedReportCode] = useState('');
  const [manualReportCodeInput, setManualReportCodeInput] = useState('');
  const [exportingReportType, setExportingReportType] = useState(null); // 'excel' | 'pdf' | null

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    isActive: true,
    leaderboardEnabled: true,
    timerEnabled: false,
    timerDurationMinutes: 60,
    passcodeEnabled: false,
    passcode: '',
    accessCodes: [],
    pools: [],
    challenges: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const [resTSPs, resChallenges] = await Promise.all([
        fetch(`/api/tsp?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`/api/challenges?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      ]);
      const dataTSPs = await resTSPs.json();
      const dataChallenges = await resChallenges.json();

      if (Array.isArray(dataTSPs)) setTSPs(dataTSPs);
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
      passcodeEnabled: false,
      passcode: '',
      accessCodes: [],
      pools: [],
      challenges: []
    });
    setNewAccessCodeInput('');
    setNewAccessCodeLabel('');
    setModalOpen(true);
  };

  const handleOpenEdit = (tsp) => {
    setEditingId(tsp._id);
    let codes = [];
    if (Array.isArray(tsp.accessCodes) && tsp.accessCodes.length > 0) {
      codes = tsp.accessCodes.map(c => ({
        code: c.code || '',
        label: c.label || '',
        isActive: c.isActive !== false
      }));
    } else if (tsp.passcode && tsp.passcode.trim()) {
      codes = [{ code: tsp.passcode.trim(), label: 'Default Code', isActive: true }];
    }

    setFormData({
      title: tsp.title || '',
      description: tsp.description || '',
      startTime: tsp.startTime || '',
      endTime: tsp.endTime || '',
      isActive: tsp.isActive !== undefined ? Boolean(tsp.isActive) : true,
      leaderboardEnabled: tsp.leaderboardEnabled !== undefined ? Boolean(tsp.leaderboardEnabled) : true,
      timerEnabled: Boolean(tsp.timerEnabled),
      timerDurationMinutes: Number(tsp.timerDurationMinutes || 60),
      passcodeEnabled: Boolean(tsp.passcodeEnabled),
      passcode: tsp.passcode || (codes[0]?.code || ''),
      accessCodes: codes,
      pools: Array.isArray(tsp.pools) ? tsp.pools.map(p => ({
        ...p,
        pointsPerQuestion: p.type === 'quiz' ? 1 : (Number(p.pointsPerQuestion) || 10)
      })) : [],
      challenges: Array.isArray(tsp.challenges) ? [...tsp.challenges] : []
    });
    setNewAccessCodeInput('');
    setNewAccessCodeLabel('');
    setModalOpen(true);
  };

  const handleAddAccessCode = () => {
    const code = (newAccessCodeInput || '').trim().toUpperCase();
    if (!code) {
      alert('Please enter an Access Code (e.g. TSP 2026).');
      return;
    }
    const currentList = Array.isArray(formData.accessCodes) ? formData.accessCodes : [];
    if (currentList.some(c => c.code && c.code.trim().toUpperCase() === code)) {
      alert(`Access Code "${code}" is already in the list.`);
      return;
    }
    const updatedCodes = [
      ...currentList,
      { code, label: (newAccessCodeLabel || '').trim(), isActive: true }
    ];
    setFormData(prev => ({
      ...prev,
      accessCodes: updatedCodes,
      passcode: updatedCodes[0]?.code || ''
    }));
    setNewAccessCodeInput('');
    setNewAccessCodeLabel('');
  };

  const handleRemoveAccessCode = (idxToRemove) => {
    const updatedCodes = (formData.accessCodes || []).filter((_, idx) => idx !== idxToRemove);
    setFormData(prev => ({
      ...prev,
      accessCodes: updatedCodes,
      passcode: updatedCodes[0]?.code || ''
    }));
  };

  const handleExportWhitelistExcel = async (tsp, filteredList) => {
    try {
      const XLSX = await import('xlsx');
      if (!filteredList || filteredList.length === 0) {
        alert('No students to export.');
        return;
      }

      const rows = filteredList.map((stu, index) => ({
        'S.No': index + 1,
        'Roll No / ID': stu.rollNo || stu.identifier || '',
        'Name': stu.name || 'Unknown',
        'Register No': stu.registerNo || '',
        'Mail ID': stu.email || '',
        'Assigned Code': stu.assignedCode || 'ANY'
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 15 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Whitelist');
      const cleanTitle = (tsp.title || 'TSP').replace(/[^a-zA-Z0-9]/g, '_');
      XLSX.writeFile(workbook, `${cleanTitle}_Whitelist.xlsx`);
    } catch (error) {
      console.error('Error exporting whitelist Excel:', error);
      alert('Failed to export Excel.');
    }
  };

  const handleExportWhitelistPDF = async (tsp, filteredList) => {
    setGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule.autoTable || autoTableModule;
      
      if (!filteredList || filteredList.length === 0) {
        alert('No students to export.');
        setGeneratingPdf(false);
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Whitelisted Participants - ${tsp.title || 'TSP'}`, 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total Filtered Students: ${filteredList.length}`, 14, 28);

      const tableData = filteredList.map((stu, i) => [
        i + 1,
        stu.rollNo || stu.identifier || '—',
        stu.name || 'Unknown',
        stu.registerNo || '—',
        stu.email || '—',
        stu.assignedCode || 'ANY'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['#', 'Roll No', 'Name', 'Register No', 'Mail ID', 'Assigned Code']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      const cleanTitle = (tsp.title || 'TSP').replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`${cleanTitle}_Whitelist.pdf`);
    } catch (error) {
      console.error('Error exporting whitelist PDF:', error);
      alert('Failed to export PDF.');
    }
    setGeneratingPdf(false);
  };

  const handleExportParticipantsExcel = async (tsp, specificCode = null) => {
    try {
      const XLSX = await import('xlsx');
      const allParticipants = tsp.activeParticipants || [];
      const filterTarget = specificCode && specificCode !== 'ALL' ? specificCode.trim().toUpperCase() : null;
      const filtered = filterTarget
        ? allParticipants.filter(p => (p.passcodeUsed || '').trim().toUpperCase() === filterTarget)
        : allParticipants;

      if (filtered.length === 0) {
        alert(filterTarget ? `No students found who entered code "${specificCode}".` : 'No participants recorded yet.');
        return;
      }

      const rows = filtered.map((stu, index) => {
        const matchedObj = (tsp.accessCodes || []).find(
          c => c.code && c.code.trim().toUpperCase() === (stu.passcodeUsed || '').trim().toUpperCase()
        );
        const label = matchedObj ? matchedObj.label : '';

        return {
          '#': index + 1,
          'Roll Number / ID': stu.memberId,
          'Student Name': stu.name || 'Anonymous',
          'Access Code Used': stu.passcodeUsed || (tsp.passcodeEnabled ? 'N/A' : 'Open Arena'),
          'Batch / Label': label || '—',
          'Score (PTS)': stu.score ?? 0,
          'Status': stu.status === 'completed' ? 'Completed' : stu.status === 'restricted' ? 'Disqualified' : 'In Progress',
          'Joined At': stu.joinedAt ? new Date(stu.joinedAt).toLocaleString() : '—',
          'Completed At': stu.completedAt ? new Date(stu.completedAt).toLocaleString() : '—'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 20 },
        { wch: 26 },
        { wch: 20 },
        { wch: 20 },
        { wch: 14 },
        { wch: 16 },
        { wch: 24 },
        { wch: 24 }
      ];

      const workbook = XLSX.utils.book_new();
      const sheetName = filterTarget ? filterTarget.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 31) : 'Participants';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const cleanTitle = (tsp.title || 'TSP').replace(/[^a-zA-Z0-9]/g, '_');
      const suffix = filterTarget ? `_${filterTarget.replace(/[^a-zA-Z0-9]/g, '_')}` : '_All_Codes';
      XLSX.writeFile(workbook, `${cleanTitle}${suffix}_Data.xlsx`);
    } catch (err) {
      console.error('Export Excel error:', err);
      alert('Error exporting Excel: ' + err.message);
    }
  };

  const handleExportPerformanceReportExcel = async (tsp, scope, targetCode) => {
    if (!tsp) return;
    setExportingReportType('excel');
    try {
      const XLSX = await import('xlsx');
      const cleanCode = scope === 'CODE' ? (targetCode || '').trim().toUpperCase() : 'ALL';
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}/report?passcode=${encodeURIComponent(cleanCode)}&_t=${Date.now()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch performance report data');
      }
      const data = await res.json();
      const students = data.students || [];

      if (students.length === 0) {
        alert(cleanCode !== 'ALL' ? `No students found for access code "${cleanCode}".` : 'No participant records found to export.');
        return;
      }

      const rows = students.map(stu => ({
        'S.No': stu.sNo,
        'Name': stu.name || 'Anonymous',
        'Roll Number': stu.rollNo || stu.memberId,
        'Register Number': stu.registerNo || '—',
        'Score in Easy (out of max)': `${stu.scoreEasy} / ${stu.maxEasy}`,
        'Score in Medium': stu.scoreMedium ?? 0,
        'Number of test cases satisfied in Medium': `${stu.mediumTestCasesPassed} / ${stu.mediumTestCasesTotal}`,
        'Score in Hard': stu.scoreHard ?? 0,
        'Number of test cases satisfied in Hard': `${stu.hardTestCasesPassed} / ${stu.hardTestCasesTotal}`,
        'Total Score': stu.totalScore ?? 0,
        'Access Code Used': stu.passcodeUsed || '—',
        'Status': stu.status || 'In Progress'
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 8 },  // S.No
        { wch: 28 }, // Name
        { wch: 18 }, // Roll Number
        { wch: 20 }, // Register Number
        { wch: 28 }, // Score in Easy (out of max)
        { wch: 18 }, // Score in Medium
        { wch: 40 }, // Number of test cases satisfied in Medium
        { wch: 16 }, // Score in Hard
        { wch: 38 }, // Number of test cases satisfied in Hard
        { wch: 14 }, // Total Score
        { wch: 20 }, // Access Code Used
        { wch: 16 }  // Status
      ];

      const workbook = XLSX.utils.book_new();
      const sheetName = cleanCode !== 'ALL' ? cleanCode.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 31) : 'Performance_Report';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const cleanTitle = (tsp.title || 'TSP').replace(/[^a-zA-Z0-9]/g, '_');
      const suffix = cleanCode !== 'ALL' ? `_${cleanCode.replace(/[^a-zA-Z0-9]/g, '_')}` : '_All_Students';
      XLSX.writeFile(workbook, `${cleanTitle}${suffix}_Performance_Report.xlsx`);
      setShowReportExportModal(false);
    } catch (err) {
      console.error('Export Performance Excel error:', err);
      alert('Error exporting Excel report: ' + err.message);
    } finally {
      setExportingReportType(null);
    }
  };

  const handleExportPerformanceReportPDF = async (tsp, scope, targetCode) => {
    if (!tsp) return;
    setExportingReportType('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule.autoTable || autoTableModule;

      const cleanCode = scope === 'CODE' ? (targetCode || '').trim().toUpperCase() : 'ALL';
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}/report?passcode=${encodeURIComponent(cleanCode)}&_t=${Date.now()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch performance report data');
      }
      const data = await res.json();
      const students = data.students || [];

      if (students.length === 0) {
        alert(cleanCode !== 'ALL' ? `No students found for access code "${cleanCode}".` : 'No participant records found to export.');
        return;
      }

      const doc = new jsPDF('landscape');

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

      if (pecLogo) doc.addImage(pecLogo, 'PNG', 14, 8, 20, 20);
      if (dsLogo) doc.addImage(dsLogo, 'PNG', 263, 8, 20, 20);

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(tsp.title, 148, 16, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Department of AI & Data Science`, 148, 23, { align: 'center' });
      doc.setFont("helvetica", "bold");
      doc.text(`Student Performance & Results Report`, 148, 29, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.line(14, 33, 283, 33);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Scope: ${cleanCode === 'ALL' ? 'All Students (Full Attendance)' : `Access Code: ${cleanCode}`}`, 14, 39);
      doc.text(`Total Candidates: ${students.length}`, 148, 39, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, 283, 39, { align: 'right' });

      const tableColumn = [
        "S.No",
        "Name",
        "Roll No",
        "Register No",
        "Score in Easy (out of)",
        "Score (Med)",
        "Medium Test Cases",
        "Score (Hard)",
        "Hard Test Cases",
        "Total",
        "Status"
      ];

      const tableRows = students.map(stu => [
        stu.sNo,
        stu.name || 'Anonymous',
        stu.rollNo || stu.memberId,
        stu.registerNo || '—',
        `${stu.scoreEasy} / ${stu.maxEasy}`,
        stu.scoreMedium ?? 0,
        `${stu.mediumTestCasesPassed} / ${stu.mediumTestCasesTotal}`,
        stu.scoreHard ?? 0,
        `${stu.hardTestCasesPassed} / ${stu.hardTestCasesTotal}`,
        stu.totalScore ?? 0,
        stu.status || 'In Progress'
      ]);

      const autoTableOptions = {
        head: [tableColumn],
        body: tableRows,
        startY: 43,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { halign: 'left', cellWidth: 40 },
          2: { halign: 'center', cellWidth: 26 },
          3: { halign: 'center', cellWidth: 28 },
          4: { halign: 'center', cellWidth: 30 },
          5: { halign: 'center', cellWidth: 22 },
          6: { halign: 'center', cellWidth: 28 },
          7: { halign: 'center', cellWidth: 22 },
          8: { halign: 'center', cellWidth: 28 },
          9: { halign: 'center', cellWidth: 16 },
          10: { halign: 'center', cellWidth: 18 }
        }
      };

      if (typeof doc.autoTable === 'function') {
        doc.autoTable(autoTableOptions);
      } else {
        autoTable(doc, autoTableOptions);
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 283, 204, { align: 'right' });
      }

      const cleanTitle = (tsp.title || 'TSP').replace(/[^a-zA-Z0-9]/g, '_');
      const suffix = cleanCode !== 'ALL' ? `_${cleanCode.replace(/[^a-zA-Z0-9]/g, '_')}` : '_All_Students';
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
      setGeneratedPdfDocTitle(`${cleanTitle}${suffix}_Performance_Report.pdf`);
      setShowPdfPreviewModal(true);
      setShowReportExportModal(false);
    } catch (err) {
      console.error('Export Performance PDF error:', err);
      alert('Error generating PDF report: ' + err.message);
    } finally {
      setExportingReportType(null);
    }
  };

  const handleExportParticipantsCSV = (tsp, specificCode = null) => {
    try {
      const allParticipants = tsp.activeParticipants || [];
      const filterTarget = specificCode && specificCode !== 'ALL' ? specificCode.trim().toUpperCase() : null;
      const filtered = filterTarget
        ? allParticipants.filter(p => (p.passcodeUsed || '').trim().toUpperCase() === filterTarget)
        : allParticipants;

      if (filtered.length === 0) {
        alert(filterTarget ? `No students found who entered code "${specificCode}".` : 'No participants recorded yet.');
        return;
      }

      const headers = ['#', 'Roll Number / ID', 'Student Name', 'Access Code Used', 'Batch Label', 'Score (PTS)', 'Status', 'Joined At', 'Completed At'];
      const rows = filtered.map((stu, index) => {
        const matchedObj = (tsp.accessCodes || []).find(
          c => c.code && c.code.trim().toUpperCase() === (stu.passcodeUsed || '').trim().toUpperCase()
        );
        const label = matchedObj ? matchedObj.label : '';
        return [
          index + 1,
          `"${(stu.memberId || '').replace(/"/g, '""')}"`,
          `"${(stu.name || '').replace(/"/g, '""')}"`,
          `"${(stu.passcodeUsed || '').replace(/"/g, '""')}"`,
          `"${(label || '').replace(/"/g, '""')}"`,
          stu.score ?? 0,
          stu.status === 'completed' ? 'Completed' : stu.status === 'restricted' ? 'Disqualified' : 'In Progress',
          stu.joinedAt ? `"${new Date(stu.joinedAt).toLocaleString()}"` : '""',
          stu.completedAt ? `"${new Date(stu.completedAt).toLocaleString()}"` : '""'
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanTitle = (tsp.title || 'TSP').replace(/[^a-zA-Z0-9]/g, '_');
      const suffix = filterTarget ? `_${filterTarget.replace(/[^a-zA-Z0-9]/g, '_')}` : '_All_Codes';
      link.setAttribute('href', url);
      link.setAttribute('download', `${cleanTitle}${suffix}_Data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export CSV error:', err);
      alert('Error exporting CSV: ' + err.message);
    }
  };

  const handleAddPool = () => {
    setFormData(prev => ({
      ...prev,
      pools: [...prev.pools, {
        id: Math.random().toString(36).substr(2, 9),
        type: 'quiz',
        difficulty: 'Easy',
        count: 1,
        pointsPerQuestion: 1,
        availableChallenges: []
      }]
    }));
  };

  const handleRemovePool = (poolId) => {
    setFormData(prev => ({
      ...prev,
      pools: prev.pools.filter(p => p.id !== poolId)
    }));
  };

  const handleUpdatePool = (poolId, field, value) => {
    setFormData(prev => ({
      ...prev,
      pools: prev.pools.map(p => {
        if (p.id !== poolId) return p;
        if (field === 'type') {
          return {
            ...p,
            type: value,
            pointsPerQuestion: value === 'quiz' ? 1 : (Number(p.pointsPerQuestion) > 1 ? Number(p.pointsPerQuestion) : 10)
          };
        }
        return { ...p, [field]: value };
      })
    }));
  };

  const handleSelectAllPool = (poolId, type, difficulty, selectAll) => {
    setFormData(prev => ({
      ...prev,
      pools: prev.pools.map(p => {
        if (p.id === poolId) {
          if (selectAll) {
            const allMatchingIds = (challenges || []).filter(c => c && c.type === type && c.difficulty === difficulty).map(c => c ? c._id : null).filter(Boolean);
            return { ...p, availableChallenges: allMatchingIds };
          } else {
            return { ...p, availableChallenges: [] };
          }
        }
        return p;
      })
    }));
  };

  const handleTogglePoolChallenge = (poolId, challengeId) => {
    setFormData(prev => ({
      ...prev,
      pools: prev.pools.map(p => {
        if (p.id === poolId) {
          const exists = p.availableChallenges.includes(challengeId);
          return {
            ...p,
            availableChallenges: exists 
              ? p.availableChallenges.filter(id => id !== challengeId)
              : [...p.availableChallenges, challengeId]
          };
        }
        return p;
      })
    }));
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

  const getCompletedStudentsList = (tsp) => {
    if (!tsp) return [];
    const completedSet = new Set((tsp.completedMembers || []).map(id => String(id).trim().toUpperCase()));
    const list = [];
    const processedIds = new Set();

    (tsp.activeParticipants || []).forEach(p => {
      const pId = String(p.memberId || '').trim().toUpperCase();
      if (!pId) return;
      if (p.status === 'completed' || completedSet.has(pId)) {
        processedIds.add(pId);
        list.push({
          memberId: pId,
          name: p.name || pId,
          passcodeUsed: p.passcodeUsed || '',
          score: typeof p.score === 'number' ? p.score : 0,
          completedAt: p.completedAt || p.joinedAt || null,
          status: 'completed'
        });
      }
    });

    completedSet.forEach(id => {
      if (!processedIds.has(id)) {
        processedIds.add(id);
        const wl = (tsp.whitelistedStudents || []).find(s => s && String(s.identifier).trim().toUpperCase() === id);
        list.push({
          memberId: id,
          name: wl?.name || id,
          passcodeUsed: '',
          score: 0,
          completedAt: null,
          status: 'completed'
        });
      }
    });

    return list;
  };

  const getCompletedCount = (tsp) => {
    if (!tsp) return 0;
    return getCompletedStudentsList(tsp).length;
  };

  const exportCompletedCSV = (tsp) => {
    const list = getCompletedStudentsList(tsp);
    if (list.length === 0) {
      alert('No completed students found to export.');
      return;
    }
    const headers = ['#', 'Roll Number / ID', 'Student Name', 'Access Code / Batch', 'Score', 'Completed At'];
    const rows = list.map((s, idx) => [
      idx + 1,
      `"${s.memberId}"`,
      `"${s.name}"`,
      `"${s.passcodeUsed || 'N/A'}"`,
      s.score,
      s.completedAt ? `"${new Date(s.completedAt).toLocaleString()}"` : '"Completed"'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(tsp.title || 'TSP').replace(/[^a-z0-9]/gi, '_')}_Completed_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleActive = async (tsp) => {
    const targetId = tsp._id || tsp.id;
    try {
      const res = await fetch(`/api/tsp/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tsp.isActive })
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to toggle tsp status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleLeaderboard = async (tsp) => {
    const targetId = tsp._id || tsp.id;
    const currentVal = tsp.leaderboardEnabled !== undefined ? Boolean(tsp.leaderboardEnabled) : true;
    const newVal = !currentVal;
    try {
      const res = await fetch(`/api/tsp/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboardEnabled: newVal })
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to toggle tsp leaderboard status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleTimer = async (tsp) => {
    const targetId = tsp._id || tsp.id;
    const newVal = !tsp.timerEnabled;
    try {
      const res = await fetch(`/api/tsp/${targetId}`, {
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

  const handleStartTimer = async (tsp) => {
    const targetId = tsp._id || tsp.id;
    const remaining = tsp.timerRemainingSeconds > 0 ? tsp.timerRemainingSeconds : (tsp.timerDurationMinutes || 60) * 60;
    try {
      const res = await fetch(`/api/tsp/${targetId}`, {
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

  const handlePauseTimer = async (tsp) => {
    const targetId = tsp._id || tsp.id;
    let remaining = tsp.timerRemainingSeconds || (tsp.timerDurationMinutes || 60) * 60;
    if (tsp.timerLastStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(tsp.timerLastStartedAt).getTime()) / 1000);
      remaining = Math.max(0, remaining - elapsed);
    }
    try {
      const res = await fetch(`/api/tsp/${targetId}`, {
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

  const handleStopTimer = async (tsp) => {
    if (!confirm('Reset timer to initial duration?')) return;
    const targetId = tsp._id || tsp.id;
    const durationSecs = (tsp.timerDurationMinutes || 60) * 60;
    try {
      const res = await fetch(`/api/tsp/${targetId}`, {
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

  const handleEndTimer = async (tsp) => {
    if (!confirm('Are you sure you want to end this tsp? This will close the arena and stop the timer.')) return;
    const targetId = tsp._id || tsp.id;
    try {
      const res = await fetch(`/api/tsp/${targetId}`, {
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
      alert('Error ending tsp: ' + err.message);
    }
  };

  const formatRemainingTime = (tsp) => {
    let seconds = tsp.timerRemainingSeconds !== undefined ? tsp.timerRemainingSeconds : (tsp.timerDurationMinutes || 60) * 60;
    if (tsp.timerStatus === 'running' && tsp.timerLastStartedAt) {
      const elapsed = Math.floor((currentTime - new Date(tsp.timerLastStartedAt).getTime()) / 1000);
      seconds = Math.max(0, seconds - elapsed);
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenTSPLeaderboard = async (tsp) => {
    const targetId = tsp._id || tsp.id;
    setSelectedTSPForLeaderboard(tsp);
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/tsp/${targetId}/leaderboard?admin=true`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTSPLeaderboardData(data);
      } else {
        setTSPLeaderboardData([]);
      }
    } catch (err) {
      alert('Error fetching tsp leaderboard: ' + err.message);
      setTSPLeaderboardData([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/tsp/${editingId}` : '/api/tsp';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save tsp');
      }

      await fetchData();
      setModalOpen(false);
      setSuccessPopup({
        title: editingId ? 'TSP Updated!' : 'TSP Created!',
        message: editingId
          ? 'The tsp details and attached challenge questions have been updated.'
          : 'Your new competition tsp has been launched and is now live!'
      });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tsp and its leaderboard associations?')) return;
    try {
      const res = await fetch(`/api/tsp/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTSPs(tsps.filter(c => c && String(c._id) !== String(id)));
      } else {
        alert('Failed to delete tsp');
      }
    } catch (err) {
      alert('Error deleting tsp: ' + err.message);
    }
  };

  const handleResetTSPLeaderboard = async (tsp) => {
    if (!confirm(`⚠️ DANGER: Are you sure you want to RESET the leaderboard for "${tsp.title}"? All submissions and scores for this tsp will be permanently cleared!`)) {
      return;
    }
    try {
      const res = await fetch('/api/leaderboard/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tspId: tsp._id || tsp.id })
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

  const handleRemoveRestriction = async (tspId, memberId) => {
    if (!confirm(`Are you sure you want to lift the anti-cheat restriction for Member ID: ${memberId}?`)) return;
    try {
      const res = await fetch('/api/tsp/restrict', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tspId, memberId })
      });
      const data = await res.json();
      if (res.ok) {
        setTSPs(prev => prev.map(c => (c && (c._id && c._id.toString() === tspId.toString()) || (c.id && c.id.toString() === tspId.toString())) ? { ...c, restrictedMembers: data.restrictedMembers } : c));
        setSelectedTSPForRestrictions(prev => prev && ((prev._id && prev._id.toString() === tspId.toString()) || (prev.id && prev.id.toString() === tspId.toString())) ? { ...prev, restrictedMembers: data.restrictedMembers } : prev);
        try {
          const localMapStr = localStorage.getItem('dsc_restricted_map');
          if (localMapStr) {
            const localMap = JSON.parse(localMapStr);
            if (localMap[tspId] && Array.isArray(localMap[tspId])) {
              const clean = memberId.toString().trim().toUpperCase();
              localMap[tspId] = localMap[tspId].filter(id => id && id.toString().trim().toUpperCase() !== clean);
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
    setSelectedTSPForRestrictions(c);

    try {
      const ts = Date.now();
      const res = await fetch(`/api/tsp?_t=${ts}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setTSPs(data);
        const updated = data.find(item =>
          (item._id && item._id.toString() === cId) ||
          (item.id && item.id.toString() === cId)
        );
        if (updated) setSelectedTSPForRestrictions(updated);
      }
    } catch (e) {}
  };

  const handleToggleWhitelist = async (tsp) => {
    try {
      const newStatus = !tsp.whitelistEnabled;
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistEnabled: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setTSPs(prev => prev.map(c => (c && (c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedTSPForManage && (selectedTSPForManage._id === data._id || selectedTSPForManage.id === data._id)) {
          setSelectedTSPForManage(data);
        }
      } else {
        alert('Failed to toggle whitelist: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleClearWhitelist = async (tsp) => {
    if (!confirm('Are you sure you want to clear the entire participant whitelist?')) return;
    try {
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: [] })
      });
      const data = await res.json();
      if (res.ok) {
        setTSPs(prev => prev.map(c => (c && (c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedTSPForManage && (selectedTSPForManage._id === data._id || selectedTSPForManage.id === data._id)) {
          setSelectedTSPForManage(data);
        }
        alert('Whitelist cleared successfully!');
      } else {
        alert('Failed to clear whitelist: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleExcelUpload = async (e, tsp, prefilledBatchCode = null) => {
    const file = e.target.files[0];
    if (!file) return;
    
    let batchCode = prefilledBatchCode;
    if (batchCode === null) {
      const batchCodeInput = window.prompt("Optional: Enter an Access Code to assign to all students in this Excel file.\n(Leave blank if your Excel file already has an 'AssignedCode' column)");
      batchCode = (batchCodeInput || '').trim().toUpperCase();
    }
    
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
            let rollNo = '';
            let registerNo = '';
            let name = '';
            let email = '';
              let assignedCode = batchCode;
            
            for (const [key, value] of Object.entries(row)) {
              const k = key.toLowerCase().trim();
              if (k.includes('roll') || k.includes('rollno') || k.includes('roll no')) {
                if (!rollNo) rollNo = String(value).trim().toUpperCase();
              }
              if (k.includes('register') || k.includes('regno') || k.includes('reg no') || k.includes('reg_no')) {
                if (!registerNo) registerNo = String(value).trim().toUpperCase();
              }
              if (k.includes('member id') || k === 'id') {
                if (!identifier) identifier = String(value).trim().toUpperCase();
              }
              if (k.includes('name') || k === 'full name') {
                if (!name) name = String(value).trim();
              }
              if (k.includes('email') || k.includes('mail')) {
                if (!email) email = String(value).trim();
              }
            }
            
            identifier = rollNo || registerNo || identifier;
            if (identifier) {
              newStudents.push({
                identifier,
                rollNo: rollNo || identifier,
                registerNo: registerNo || '',
                name: name || 'Unknown Name',
                email: email || '',
                  assignedCode: assignedCode || ''
              });
            }
          });
          
          if (newStudents.length === 0) {
            alert('No valid students found in the Excel sheet. Ensure columns contain "Roll Number" and "Name".');
            setUploadingExcel(false);
            return;
          }
          
          setWhitelistPreviewData({ newStudents, tsp });
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

  const handleDownloadDetailedPdfReport = async (tsp) => {
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
      doc.text(tsp.title, 148, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Department of AI & Data Science`, 148, 28, { align: 'center' });
      doc.text(`Detailed Submissions Report`, 148, 34, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(14, 40, 283, 40);
      
      // Fetch Detailed Submissions Data
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}/submissions`);
      if (!res.ok) throw new Error('Failed to fetch detailed submissions');
      const submissionsData = await res.json();
      
      doc.setFontSize(11);
      doc.text(`Total Submissions: ${submissionsData.length}`, 14, 50);
      doc.text(`Active Participants: ${tsp.activeParticipants?.length || 0}`, 148, 50, { align: 'center' });
      
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
      setGeneratedPdfDocTitle(`${tsp.title.replace(/\s+/g, '_')}_Detailed_Report.pdf`);
      setShowPdfPreviewModal(true);
    } catch (error) {
      console.error('Error generating detailed PDF report:', error);
      alert('Failed to generate detailed PDF report.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdfReport = async (tsp) => {
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
      doc.text(tsp.title, 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Department of AI & Data Science`, 105, 28, { align: 'center' });
      doc.text(`TSP Report`, 105, 34, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(14, 40, 196, 40);
      
      // Fetch Leaderboard Data
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const leaderboardData = await res.json();
      
      doc.setFontSize(11);
      doc.text(`Total Submissions: ${leaderboardData.length}`, 14, 50);
      doc.text(`Active Participants: ${tsp.activeParticipants?.length || 0}`, 105, 50);
      
      const tableColumn = ["Rank", "Member ID", "Name", "Dept/Role", "Score", "Solved"];
      const tableRows = [];
      
      leaderboardData.forEach((row, index) => {
        const studentData = [
          index + 1,
          row.memberId,
          row.name || 'Unknown',
          row.department || row.role || 'Member',
          row.score,
          `${row.submissionsCount} / ${(tsp.challenges?.length || 0) + (tsp.pools?.reduce((s, p) => s + (Number(p.count) || 0), 0) || 0)}`
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
      setGeneratedPdfDocTitle(`${tsp.title.replace(/\s+/g, '_')}_Report.pdf`);
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
      const { newStudents, tsp } = whitelistPreviewData;
      const currentList = tsp.whitelistedStudents || [];
      const combinedList = [...currentList];
      
      newStudents.forEach(stu => {
        if (!combinedList.some(s => s.identifier.toLowerCase() === stu.identifier.toLowerCase())) {
          combinedList.push(stu);
        }
      });
      
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: combinedList })
      });
      
      const resData = await res.json();
      if (res.ok) {
        setTSPs(prev => prev.map(c => (c && (c._id && c._id.toString() === resData._id.toString()) || (c.id && c.id.toString() === resData._id.toString())) ? resData : c));
        if (selectedTSPForManage && (selectedTSPForManage._id === resData._id || selectedTSPForManage.id === resData._id)) {
          setSelectedTSPForManage(resData);
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
    const cleanRollNo = (manualWhitelistEntry.rollNo || manualWhitelistEntry.identifier || '').trim().toUpperCase();
    const cleanName = (manualWhitelistEntry.name || '').trim();
    const cleanRegisterNo = (manualWhitelistEntry.registerNo || '').trim().toUpperCase();
    const cleanEmail = (manualWhitelistEntry.email || '').trim();

    if (!cleanRollNo) {
      alert('ROLLno is required!');
      return;
    }
    if (!cleanName) {
      alert('Name is required!');
      return;
    }
    if (!cleanRegisterNo) {
      alert('Register Number is required!');
      return;
    }
    
    try {
      const tsp = selectedTSPForManage;
      const currentList = tsp.whitelistedStudents || [];
      
      const isDuplicate = currentList.some(s => {
        if (!s) return false;
        const sRoll = (s.rollNo || s.identifier || '').trim().toUpperCase();
        const sReg = (s.registerNo || '').trim().toUpperCase();
        return (cleanRollNo && sRoll === cleanRollNo) || (cleanRegisterNo && sReg === cleanRegisterNo);
      });

      if (isDuplicate) {
        alert('This student (ROLLno or Register Number) is already on the whitelist!');
        return;
      }
      
      const updatedList = [...currentList, { 
        identifier: cleanRollNo,
        rollNo: cleanRollNo,
        name: cleanName,
        registerNo: cleanRegisterNo,
        email: cleanEmail,
          assignedCode: (manualWhitelistEntry.assignedCode || '').trim()
      }];
      
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: updatedList })
      });
      
      const data = await res.json();
      if (res.ok) {
        setTSPs(prev => prev.map(c => (c && (c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedTSPForManage && (selectedTSPForManage._id === data._id || selectedTSPForManage.id === data._id)) {
          setSelectedTSPForManage(data);
        }
        setWhitelistManualOpen(false);
        setManualWhitelistEntry({ rollNo: '', name: '', registerNo: '', email: '', identifier: '', assignedCode: '' });
      } else {
        alert('Failed to add student: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleRemoveWhitelistedStudent = async (identifier, registerNo) => {
    if (!confirm(`Are you sure you want to remove student "${identifier}" from the whitelist?`)) return;
    try {
      const tsp = selectedTSPForManage;
      const currentList = tsp.whitelistedStudents || [];
      const updatedList = currentList.filter(s => {
        if (!s) return false;
        const sRoll = (s.rollNo || s.identifier || '').trim().toUpperCase();
        const sReg = (s.registerNo || '').trim().toUpperCase();
        if (identifier && sRoll === String(identifier).trim().toUpperCase()) return false;
        if (registerNo && sReg === String(registerNo).trim().toUpperCase()) return false;
        return true;
      });
      const res = await fetch(`/api/tsp/${tsp._id || tsp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelistedStudents: updatedList })
      });
      const data = await res.json();
      if (res.ok) {
        setTSPs(prev => prev.map(c => (c && (c._id && c._id.toString() === data._id.toString()) || (c.id && c.id.toString() === data._id.toString())) ? data : c));
        if (selectedTSPForManage && (selectedTSPForManage._id === data._id || selectedTSPForManage.id === data._id)) {
          setSelectedTSPForManage(data);
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
          <h3>TSPs & Hackathons Arena</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Create timed competitions, attach challenge questions, and manage live status.</p>
        </div>

        <button onClick={handleOpenAdd} className={styles.actionBtn}>
          <Plus size={18} />
          <span>Create New TSP</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <RefreshCw size={28} className={styles.spinner} />
          <span>Loading tsps...</span>
        </div>
      ) : selectedTSPForManage ? (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          {/* Top Navigation & Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <button
                onClick={() => setSelectedTSPForManage(null)}
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
                <span>⬅ Back to TSPs List</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fff', margin: 0, background: 'linear-gradient(90deg, #fff, #00f0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {selectedTSPForManage.title}
                </h2>
                <span
                  style={{
                    background: selectedTSPForManage.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: selectedTSPForManage.isActive ? '#10b981' : '#ef4444',
                    border: `1px solid ${selectedTSPForManage.isActive ? '#10b981' : '#ef4444'}`,
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
                  {selectedTSPForManage.isActive ? 'ACTIVE ARENA' : 'CLOSED / INACTIVE'}
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0.6rem 0 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
                {selectedTSPForManage.description || 'No detailed description provided.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                  <Calendar size={14} color="#60a5fa" />
                  <strong>Schedule:</strong> {selectedTSPForManage.startTime} — {selectedTSPForManage.endTime}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                  <Code2 size={14} color="#00f0ff" />
                  <strong>Questions:</strong> {selectedTSPForManage.challenges?.length || 0} Fixed, {selectedTSPForManage.pools?.length || 0} Pools
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleToggleActive(selectedTSPForManage)}
                style={{
                  background: selectedTSPForManage.isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: `1px solid ${selectedTSPForManage.isActive ? '#ef4444' : '#10b981'}`,
                  color: selectedTSPForManage.isActive ? '#ef4444' : '#10b981',
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
                <span>{selectedTSPForManage.isActive ? 'Deactivate Arena' : 'Activate Arena'}</span>
              </button>
              <button
                onClick={() => handleOpenEdit(selectedTSPForManage)}
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

          {/* Access Codes & Batches Hub */}
          <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  🔑
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>TSP Test Access Codes & Batches</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    {selectedTSPForManage.passcodeEnabled
                      ? `${(selectedTSPForManage.accessCodes?.length || (selectedTSPForManage.passcode ? 1 : 0))} Active Access Code${(selectedTSPForManage.accessCodes?.length || (selectedTSPForManage.passcode ? 1 : 0)) === 1 ? '' : 's'}`
                      : '🔓 Open Entry (No Passcode Required)'
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleExportParticipantsExcel(selectedTSPForManage, 'ALL')}
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <DownloadCloud size={14} /> Download All Data (Excel)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedTSPForManage)}
                  style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#f59e0b', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Edit2 size={14} /> Manage Codes
                </button>
              </div>
            </div>

            {selectedTSPForManage.passcodeEnabled && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {(() => {
                  let codesList = [];
                  if (Array.isArray(selectedTSPForManage.accessCodes) && selectedTSPForManage.accessCodes.length > 0) {
                    codesList = selectedTSPForManage.accessCodes;
                  } else if (selectedTSPForManage.passcode) {
                    codesList = [{ code: selectedTSPForManage.passcode, label: 'Default Code' }];
                  }

                  if (codesList.length === 0) {
                    return (
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem' }}>
                        Passcode protection enabled, but no codes created yet. Click "Manage Codes" to add codes.
                      </div>
                    );
                  }

                  return codesList.map((cObj, cIdx) => {
                    const cCode = (cObj.code || '').trim().toUpperCase();
                    const whitelistedCount = (selectedTSPForManage.whitelistedStudents || []).filter(s => (s.assignedCode || '').trim().toUpperCase() === cCode).length;
                      const candidatesCount = (selectedTSPForManage.activeParticipants || []).filter(
                      p => (p.passcodeUsed || '').trim().toUpperCase() === cCode
                    ).length;

                    return (
                      <div key={cIdx} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#f59e0b', fontSize: '1rem', letterSpacing: '1px' }}>
                              {cCode}
                            </span>
                            {cObj.label && (
                              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                {cObj.label}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem', fontWeight: 600 }}>
                              👥 {whitelistedCount} Assigned • {candidatesCount} Participated
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cCode);
                              alert(`📋 Copied access code "${cCode}" to clipboard!`);
                            }}
                            title="Copy code to clipboard"
                            style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportParticipantsExcel(selectedTSPForManage, cCode)}
                            title={`Download Excel for ${cCode}`}
                            style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.4rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <DownloadCloud size={12} /> Excel
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Settings Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
            {/* CARD 1: Timer & Live Execution Engine */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Timer size={24} color="#00f0ff" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Live TSP Timer</h3>
                  </div>
                  <button
                    onClick={() => handleToggleTimer(selectedTSPForManage)}
                    style={{
                      background: selectedTSPForManage.timerEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${selectedTSPForManage.timerEnabled ? '#00f0ff' : '#64748b'}`,
                      color: selectedTSPForManage.timerEnabled ? '#00f0ff' : '#94a3b8',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {selectedTSPForManage.timerEnabled ? '⏱️ TIMER: ON' : '⏱️ TIMER: OFF'}
                  </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Control the real-time countdown clock in the student arena. When timer reaches 00:00, submissions are automatically locked.
                </p>

                {selectedTSPForManage.timerEnabled ? (
                  <div style={{ background: 'rgba(5, 7, 15, 0.6)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.4rem' }}>
                      Status: <strong style={{ color: selectedTSPForManage.timerStatus === 'running' ? '#4ade80' : selectedTSPForManage.timerStatus === 'paused' ? '#facc15' : selectedTSPForManage.timerStatus === 'ended' ? '#ef4444' : '#64748b' }}>{selectedTSPForManage.timerStatus ? selectedTSPForManage.timerStatus.toUpperCase() : 'STOPPED'}</strong>
                    </div>
                    <div style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff', textShadow: '0 0 15px rgba(0, 240, 255, 0.5)', letterSpacing: '2px' }}>
                      {formatRemainingTime(selectedTSPForManage)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                      Total Duration: {selectedTSPForManage.timerDurationMinutes || 60} minutes
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

              {selectedTSPForManage.timerEnabled && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justify: 'center' }}>
                  {selectedTSPForManage.timerStatus !== 'running' && (
                    <button
                      onClick={() => handleStartTimer(selectedTSPForManage)}
                      style={{ flex: 1, minWidth: '130px', background: '#10b981', color: '#000', fontWeight: 800, padding: '0.65rem', borderRadius: '8px', border: 'none', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s' }}
                    >
                      <Play size={16} /> Start Timer
                    </button>
                  )}
                  {selectedTSPForManage.timerStatus === 'running' && (
                    <button
                      onClick={() => handlePauseTimer(selectedTSPForManage)}
                      style={{ flex: 1, minWidth: '130px', background: '#facc15', color: '#000', fontWeight: 800, padding: '0.65rem', borderRadius: '8px', border: 'none', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 0 10px rgba(250, 204, 21, 0.3)', transition: 'all 0.2s' }}
                    >
                      <Pause size={16} /> Pause
                    </button>
                  )}
                  <button
                    onClick={() => handleStopTimer(selectedTSPForManage)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontWeight: 700, padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Reset timer to full duration"
                  >
                    <Square size={16} /> Reset
                  </button>
                  <button
                    onClick={() => handleEndTimer(selectedTSPForManage)}
                    style={{ background: '#ef4444', color: '#fff', fontWeight: 800, padding: '0.65rem 1rem', borderRadius: '8px', border: 'none', display: 'inline-flex', alignItems: 'center', justify: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s' }}
                    title="End tsp and lock arena"
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
                    onClick={() => handleToggleLeaderboard(selectedTSPForManage)}
                    style={{
                      background: (selectedTSPForManage.leaderboardEnabled !== false) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${(selectedTSPForManage.leaderboardEnabled !== false) ? '#3b82f6' : '#64748b'}`,
                      color: (selectedTSPForManage.leaderboardEnabled !== false) ? '#60a5fa' : '#94a3b8',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {(selectedTSPForManage.leaderboardEnabled !== false) ? '📊 LEADERBOARD: PUBLIC' : '🔒 LEADERBOARD: HIDDEN'}
                  </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Manage student rank visibility and enforce IP/membership anti-cheat restrictions for this tournament arena.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Public Leaderboard View</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{(selectedTSPForManage.leaderboardEnabled !== false) ? 'Students can view rankings live.' : 'Rankings hidden from students.'}</div>
                    </div>
                    <button
                      onClick={() => handleOpenTSPLeaderboard(selectedTSPForManage)}
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
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedTSPForManage.restrictedMembers?.length || 0} members blocked or restricted.</div>
                    </div>
                    <button
                      onClick={() => handleOpenRestrictions(selectedTSPForManage)}
                      style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #f87171', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#f87171'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#f87171'; }}
                    >
                      🛡️ Manage ({selectedTSPForManage.restrictedMembers?.length || 0})
                    </button>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '1.1rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Completed Students</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{getCompletedCount(selectedTSPForManage)} students submitted or exited this arena.</div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/tsp/${selectedTSPForManage._id || selectedTSPForManage.id}?_t=${Date.now()}`);
                          if (res.ok) {
                            const latestTSP = await res.json();
                            setSelectedTSPForManage(latestTSP);
                            setTSPs(prev => prev.map(c => (c && (c._id || c.id) === (latestTSP._id || latestTSP.id) ? latestTSP : c)));
                          }
                        } catch (err) {}
                        setShowCompletedModal(true);
                      }}
                      style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #34d399', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#34d399'; e.currentTarget.style.color = '#000'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.color = '#34d399'; }}
                    >
                      🎓 View Completed ({getCompletedCount(selectedTSPForManage)})
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleResetTSPLeaderboard(selectedTSPForManage)}
                  style={{ width: '100%', background: 'rgba(250, 204, 21, 0.15)', border: '1px solid #facc15', color: '#facc15', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#facc15'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(250, 204, 21, 0.15)'; e.currentTarget.style.color = '#facc15'; }}
                >
                  <RefreshCw size={16} /> Reset Leaderboard Scores & Submissions
                </button>
              </div>
            </div>

            {/* CARD 3: Attached Challenges & Problem Set */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Code2 size={24} color="#10b981" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Attached Challenges</h3>
                  </div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {(selectedTSPForManage.challenges?.length || 0) + (selectedTSPForManage.pools?.reduce((s, p) => s + (Number(p.count) || 0), 0) || 0)} QUESTIONS
                  </span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Coding questions and quizzes currently linked to this competition. Students must solve these to gain XP and rank.
                </p>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.75rem' }}>
                  {((selectedTSPForManage.challenges && selectedTSPForManage.challenges.length > 0) || (selectedTSPForManage.pools && selectedTSPForManage.pools.length > 0)) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {selectedTSPForManage.challenges && selectedTSPForManage.challenges.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                            📌 Fixed Questions ({selectedTSPForManage.challenges.length})
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {selectedTSPForManage.challenges.map((chId, idx) => {
                              const cleanId = (chId?._id || chId || '').toString();
                              const chObj = (challenges || []).find(x => x && (x._id || x.id || '').toString() === cleanId);
                              return (
                                <li key={idx}>
                                  <strong style={{ color: '#00f0ff' }}>{chObj ? chObj.title : `Challenge ID: ${cleanId}`}</strong>
                                  {chObj && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>({chObj.type || 'code'}, {chObj.difficulty || 'Medium'})</span>}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {selectedTSPForManage.pools && selectedTSPForManage.pools.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                            🎲 Dynamic Question Pools ({selectedTSPForManage.pools.length})
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {selectedTSPForManage.pools.map((p, pIdx) => (
                              <li key={p.id || pIdx}>
                                <strong style={{ color: '#fbbf24' }}>Pick {p.count} question{p.count > 1 ? 's' : ''}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.4rem' }}>
                                  ({p.difficulty} {p.type?.toUpperCase()}) • {p.type === 'quiz' ? '1 mark each (Standard)' : `${p.pointsPerQuestion || 10} marks each (Common)`} — {p.availableChallenges?.length || 0} candidate problems
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0.5rem' }}>
                      No challenge questions or dynamic pools attached to this TSP yet.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/tsp/${selectedTSPForManage._id || selectedTSPForManage.id}`);
                      if (res.ok) {
                        const latestTSP = await res.json();
                        setSelectedTSPForManage(latestTSP);
                        setTSPs(prev => prev.map(c => (c && (c._id || c.id) === (latestTSP._id || latestTSP.id) ? latestTSP : c)));
                      }
                    } catch (err) {
                      console.error('Failed to fetch latest tsp data', err);
                    }
                    setShowActiveParticipantsModal(true);
                  }}
                  style={{ width: '100%', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#3b82f6', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'; e.currentTarget.style.color = '#3b82f6'; }}
                >
                  <Eye size={16} /> View Active Participants ({selectedTSPForManage.activeParticipants?.length || 0})
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/tsp/${selectedTSPForManage._id || selectedTSPForManage.id}?_t=${Date.now()}`);
                      if (res.ok) {
                        const latestTSP = await res.json();
                        setSelectedTSPForManage(latestTSP);
                        setTSPs(prev => prev.map(c => (c && (c._id || c.id) === (latestTSP._id || latestTSP.id) ? latestTSP : c)));
                      }
                    } catch (err) {}
                    setShowCompletedModal(true);
                  }}
                  style={{ width: '100%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'; e.currentTarget.style.color = '#10b981'; }}
                >
                  <CheckCircle2 size={16} /> View Completed Students ({getCompletedCount(selectedTSPForManage)})
                </button>
                <button
                  onClick={() => {
                    setReportScope('ALL');
                    setSelectedReportCode('');
                    setManualReportCodeInput('');
                    setShowReportExportModal(true);
                  }}
                  disabled={exportingReportType !== null}
                  style={{ width: '100%', background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 114, 255, 0.2))', border: '1px solid #00f0ff', color: '#00f0ff', fontWeight: 800, padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: exportingReportType !== null ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)' }}
                  onMouseOver={(e) => { if(!exportingReportType) { e.currentTarget.style.background = '#00f0ff'; e.currentTarget.style.color = '#000'; } }}
                  onMouseOut={(e) => { if(!exportingReportType) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 114, 255, 0.2))'; e.currentTarget.style.color = '#00f0ff'; } }}
                >
                  <DownloadCloud size={18} /> {exportingReportType ? `Generating ${exportingReportType.toUpperCase()}...` : 'Download Performance Report (Excel & PDF)'}
                </button>
                <button
                  onClick={() => handleDownloadPdfReport(selectedTSPForManage)}
                  disabled={generatingPdf}
                  style={{ width: '100%', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid #ec4899', color: '#ec4899', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: generatingPdf ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', opacity: generatingPdf ? 0.7 : 1 }}
                  onMouseOver={(e) => { if(!generatingPdf) { e.currentTarget.style.background = '#ec4899'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseOut={(e) => { if(!generatingPdf) { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)'; e.currentTarget.style.color = '#ec4899'; } }}
                >
                  <FileText size={16} /> {generatingPdf ? 'Generating Report...' : 'Download PDF Report'}
                </button>
                <button
                  onClick={() => handleDownloadDetailedPdfReport(selectedTSPForManage)}
                  disabled={generatingPdf}
                  style={{ width: '100%', background: 'rgba(234, 88, 12, 0.15)', border: '1px solid #ea580c', color: '#ea580c', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: generatingPdf ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', opacity: generatingPdf ? 0.7 : 1 }}
                  onMouseOver={(e) => { if(!generatingPdf) { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseOut={(e) => { if(!generatingPdf) { e.currentTarget.style.background = 'rgba(234, 88, 12, 0.15)'; e.currentTarget.style.color = '#ea580c'; } }}
                >
                  <DownloadCloud size={16} /> {generatingPdf ? 'Generating PDF...' : 'Detailed Submissions Report (PDF)'}
                </button>
                <button
                  onClick={() => handleOpenEdit(selectedTSPForManage)}
                  style={{ width: '100%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 800, padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'; e.currentTarget.style.color = '#10b981'; }}
                >
                  <Edit2 size={16} /> Manage Attached Questions & Dates
                </button>
              </div>
            </div>

            {/* CARD 5: TSP Eligibility & Whitelist */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justify: 'space-between', boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldAlert size={24} color="#00f0ff" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Participant Whitelist</h3>
                  </div>
                  <button
                    onClick={() => handleToggleWhitelist(selectedTSPForManage)}
                    style={{
                      background: selectedTSPForManage.whitelistEnabled ? 'rgba(0, 240, 255, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      border: `1px solid ${selectedTSPForManage.whitelistEnabled ? '#00f0ff' : '#64748b'}`,
                      color: selectedTSPForManage.whitelistEnabled ? '#00f0ff' : '#64748b',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {selectedTSPForManage.whitelistEnabled ? 'MODE: ON' : 'MODE: OFF'}
                  </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Enforce strict eligibility. If enabled, only students in the imported whitelist can participate. They may use their Member ID or Roll Number to enter.
                </p>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.1rem', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Eligible Students:</span>
                    <strong style={{ fontSize: '1.15rem', color: selectedTSPForManage.whitelistEnabled ? '#00f0ff' : '#94a3b8', fontFamily: 'monospace' }}>
                      {selectedTSPForManage.whitelistedStudents?.length || 0} students
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
                  <span>View Participant List ({selectedTSPForManage.whitelistedStudents?.length || 0})</span>
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
                      onChange={(e) => handleExcelUpload(e, selectedTSPForManage)}
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
                
                {selectedTSPForManage.whitelistedStudents && selectedTSPForManage.whitelistedStudents.length > 0 && (
                  <button
                    onClick={() => handleClearWhitelist(selectedTSPForManage)}
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
      ) : tsps.length === 0 ? (
        <div className={styles.emptyTable}>
          <Trophy size={40} color="#00f0ff" />
          <h3>No TSPs Found</h3>
          <p>Click &quot;Create New TSP&quot; to launch a competitive coding and quiz tournament.</p>
        </div>
      ) : (
        <div className={styles.cardsList}>
          {tsps.map((c) => (
            <div key={c._id || c.id} className={styles.challengeRowCard} style={{ borderLeft: c.isActive ? '4px solid #10b981' : '4px solid #ef4444', transition: 'all 0.2s' }}>
              <div className={styles.challengeRowInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span
                    className={styles.typeBadge}
                    style={{
                      background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: c.isActive ? '#10b981' : '#ef4444',
                      border: `1px solid ${c.isActive ? '#10b981' : '#ef4444'}`
                    }}
                  >
                    <Power size={14} />
                    {c.isActive ? '🟢 Active Arena' : '🔴 Closed / Inactive'}
                  </span>

                  {c.passcodeEnabled && (
                    <span
                      className={styles.typeBadge}
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        border: '1px solid #f59e0b'
                      }}
                    >
                      🔑 {c.accessCodes && c.accessCodes.length > 0
                        ? `${c.accessCodes.length} Code${c.accessCodes.length === 1 ? '' : 's'}`
                        : c.passcode
                        ? `Code: ${c.passcode}`
                        : 'Passcode Active'}
                    </span>
                  )}

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <Calendar size={14} color="#60a5fa" />
                    {c.startTime} — {c.endTime}
                  </span>
                </div>

                <h4 className={styles.challengeTitle} style={{ fontSize: '1.35rem', color: '#fff', margin: '0.4rem 0 0.5rem 0' }}>{c.title}</h4>
                <p className={styles.challengeDesc} style={{ color: '#cbd5e1', marginBottom: '1.25rem' }}>{c.description || 'No description provided.'}</p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    🏆 Questions: <strong style={{ color: '#00f0ff' }}>{c.challenges?.length || 0} Fixed, {c.pools?.length || 0} Pools</strong>
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
                    🔑 Codes: <strong style={{ color: c.passcodeEnabled ? '#f59e0b' : '#94a3b8' }}>
                      {c.passcodeEnabled
                        ? (c.accessCodes && c.accessCodes.length > 0)
                          ? c.accessCodes.map(x => x.code).join(', ')
                          : (c.passcode || 'Enabled')
                        : 'None (Open)'}
                    </strong>
                  </span>
                </div>
              </div>

              <div className={styles.rowActions} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', justifyContent: 'space-between', width: '100%' }}>
                <button
                  onClick={() => setSelectedTSPForManage(c)}
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
                  <span>Manage TSP & Settings ➔</span>
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={styles.editBtn}
                    style={{
                      background: c.isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${c.isActive ? '#ef4444' : '#10b981'}`,
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
                  <button onClick={() => handleDelete(c._id || c.id)} className={styles.deleteBtn} title="Delete TSP" style={{ padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit TSP */}
      <AnimatePresence>
        {modalOpen && (
          <div key="modal-tsp-form-overlay" className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={styles.modalCardLarge}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>{editingId ? 'Edit TSP Arena' : 'Launch New TSP'}</h3>
                <button onClick={() => setModalOpen(false)} className={styles.modalCloseBtn}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>TSP Title</label>
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
                  <label>TSP Description & Rules</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the tsp rules, eligibility, and prize pool..."
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

                <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: formData.passcodeEnabled ? '1rem' : 0 }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: 0 }}>
                        <input
                          type="checkbox"
                          checked={formData.passcodeEnabled}
                          onChange={(e) => setFormData({ ...formData, passcodeEnabled: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#f59e0b' }}
                        />
                        <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.95rem' }}>🔑 Require Test Access Codes (Multiple Codes / Batches)</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                        Create one or multiple confidential access codes (e.g. <code>TSP 2026</code>, <code>TSP 2027</code>). Students entering a code will have their test data saved under that code.
                      </span>
                    </div>
                    {formData.passcodeEnabled && (
                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {(formData.accessCodes || []).length} Code{(formData.accessCodes || []).length === 1 ? '' : 's'} Configured
                      </span>
                    )}
                  </div>

                  {formData.passcodeEnabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {/* Add Code Inputs */}
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ flex: 1.5, minWidth: '160px' }}>
                          <label style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                            Access Code * (e.g. TSP 2026)
                          </label>
                          <input
                            type="text"
                            value={newAccessCodeInput}
                            onChange={(e) => setNewAccessCodeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddAccessCode();
                              }
                            }}
                            placeholder="e.g. TSP 2026"
                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #f59e0b', color: '#f59e0b', fontWeight: 800, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                          />
                        </div>
                        <div style={{ flex: 2, minWidth: '180px' }}>
                          <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                            Batch / Label (Optional, e.g. Batch 2026)
                          </label>
                          <input
                            type="text"
                            value={newAccessCodeLabel}
                            onChange={(e) => setNewAccessCodeLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddAccessCode();
                              }
                            }}
                            placeholder="e.g. Batch 2026 / Section A"
                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #475569', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const randomCode = 'TSP ' + (new Date().getFullYear() + Math.floor(Math.random() * 2));
                            setNewAccessCodeInput(randomCode);
                          }}
                          style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#00f0ff', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                          title="Generate a suggestion"
                        >
                          🎲 Suggest
                        </button>
                        <button
                          type="button"
                          onClick={handleAddAccessCode}
                          style={{ background: '#f59e0b', border: 'none', color: '#000', fontWeight: 800, padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Plus size={16} /> Add Code
                        </button>
                      </div>

                      {/* Display existing codes list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                        {(!formData.accessCodes || formData.accessCodes.length === 0) ? (
                          <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            ⚠️ No access codes added yet. Enter a code above and click "+ Add Code".
                          </div>
                        ) : (
                          formData.accessCodes.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem' }}>
                                  🔑 {item.code}
                                </span>
                                {item.label && (
                                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                                    🏷️ {item.label}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAccessCode(idx)}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                title="Remove access code"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Select Fixed Challenges (Given to ALL Candidates)</span>
                    <span style={{ fontSize: '0.8rem', color: '#00f0ff' }}>{(formData.challenges || []).length} selected</span>
                  </label>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
                    Check the boxes below to attach coding problems or quizzes that EVERY student in this TSP must solve.
                  </p>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {challenges.length === 0 ? (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No challenges in library yet.</span>
                    ) : (
                      challenges.filter(Boolean).map(ch => {
                        const isChecked = (formData.challenges || []).includes(ch._id);
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
                            <input type="checkbox" checked={isChecked} readOnly style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <span style={{ fontWeight: 600, color: isChecked ? '#fff' : '#cbd5e1', display: 'block', fontSize: '0.9rem' }}>{ch.title}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{ch.type?.toUpperCase()} • {ch.difficulty}</span>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>+{ch.points} PTS</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label>Question Pools (Randomization Rules)</label>
                      <button type="button" onClick={handleAddPool} className={styles.addBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        <Plus size={14} /> Add Pool
                      </button>
                    </div>
                    
                    {formData.pools && formData.pools.map((pool, idx) => (
                      <div key={pool.id} style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: '600', color: '#00f0ff' }}>Pool {idx + 1}</span>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#94a3b8' }}>
                              {pool.type === 'quiz' 
                                ? `Quiz: ${pool.count || 1} question(s) • 1 mark each (Standard)` 
                                : `Code: ${pool.count || 1} problem(s) • ${pool.pointsPerQuestion || 10} marks each (Common)`}
                            </span>
                          </div>
                          <button type="button" onClick={() => handleRemovePool(pool.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                            <label>Type</label>
                            <select value={pool.type} onChange={(e) => handleUpdatePool(pool.id, 'type', e.target.value)}>
                              <option value="quiz">Quiz</option>
                              <option value="code">Code</option>
                              <option value="tsp">TSP</option>
                            </select>
                          </div>
                          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                            <label>Difficulty</label>
                            <select value={pool.difficulty} onChange={(e) => handleUpdatePool(pool.id, 'difficulty', e.target.value)}>
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                            <label>Count to Select</label>
                            <input type="number" min="1" value={pool.count} onChange={(e) => handleUpdatePool(pool.id, 'count', Number(e.target.value) || 1)} />
                          </div>
                          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{pool.type === 'quiz' ? 'Marks / Question' : 'Marks per Question'}</span>
                              {pool.type === 'quiz' && (
                                <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Standard</span>
                              )}
                            </label>
                            <input 
                              type="number" 
                              min="1" 
                              value={pool.type === 'quiz' ? 1 : (pool.pointsPerQuestion || 10)} 
                              disabled={pool.type === 'quiz'}
                              onChange={(e) => handleUpdatePool(pool.id, 'pointsPerQuestion', Math.max(1, Number(e.target.value) || 1))}
                              placeholder={pool.type === 'quiz' ? '1 (Standard)' : 'e.g. 20'}
                              style={{
                                border: `1px solid ${pool.type === 'quiz' ? '#334155' : '#00f0ff'}`,
                                color: pool.type === 'quiz' ? '#94a3b8' : '#00f0ff',
                                fontWeight: 'bold',
                                background: pool.type === 'quiz' ? 'rgba(255,255,255,0.03)' : undefined,
                                cursor: pool.type === 'quiz' ? 'not-allowed' : 'text'
                              }}
                            />
                            <span style={{ fontSize: '0.68rem', color: pool.type === 'quiz' ? '#64748b' : '#38bdf8', marginTop: '0.2rem', display: 'block' }}>
                              {pool.type === 'quiz' ? 'Standard 1 mark per question' : 'Admin common mark for all coding problems in this pool'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Select Available Challenges ({(pool.availableChallenges || []).length} selected):</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="button" onClick={() => handleSelectAllPool(pool.id, pool.type, pool.difficulty, true)} style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>Select All</button>
                              <button type="button" onClick={() => handleSelectAllPool(pool.id, pool.type, pool.difficulty, false)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>Clear All</button>
                            </div>
                          </div>
                          <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', borderRadius: '8px', padding: '0.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {challenges.filter(ch => ch && ch.type === pool.type && ch.difficulty === pool.difficulty).map(ch => {
                              if (!ch) return null;
                              const isChecked = (pool.availableChallenges || []).includes(ch._id);
                              return (
                                <div 
                                  key={ch._id} 
                                  onClick={() => handleTogglePoolChallenge(pool.id, ch._id)}
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
                                  <input type="checkbox" checked={isChecked} readOnly style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                      <span style={{ fontWeight: 600, color: isChecked ? '#fff' : '#cbd5e1', display: 'block', fontSize: '0.85rem' }}>{ch.title}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: pool.type === 'quiz' ? '#34d399' : '#00f0ff', fontWeight: 700 }}>
                                      +{pool.type === 'quiz' ? 1 : (pool.pointsPerQuestion || 10)} PTS {pool.type === 'quiz' ? '(1 mark standard)' : '(Common Mark)'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!formData.pools || formData.pools.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: '#0f172a', borderRadius: '8px' }}>
                        No pools added. Users will get 0 questions.
                      </div>
                    )}
                  </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className={styles.saveBtn}>
                    {saving ? 'Saving...' : editingId ? 'Update TSP Arena' : 'Launch TSP Arena'}
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
          <div key="modal-tsp-success-overlay" className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setSuccessPopup(null)}>
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
        {selectedTSPForRestrictions && (
          <div key="modal-tsp-restrictions-overlay" className={styles.modalOverlay} style={{ zIndex: 9999, alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(12px)', padding: '1.5rem' }}>
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
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedTSPForRestrictions.title}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenRestrictions(selectedTSPForRestrictions)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #475569', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Refresh from Database"
                  >
                    <RefreshCw size={14} />
                    <span>Refresh List</span>
                  </button>
                  <button onClick={() => setSelectedTSPForRestrictions(null)} className={styles.closeBtn}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                The following students exceeded the maximum anti-cheat violations (Tab Switching / Leaving Full Screen) and are barred from re-entering this tsp arena. Click <strong>Remove Restriction</strong> to unban a member.
              </p>

              {!selectedTSPForRestrictions.restrictedMembers || selectedTSPForRestrictions.restrictedMembers.length === 0 ? (
                <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #334155' }}>
                  🎉 No restricted members in this tsp arena!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedTSPForRestrictions.restrictedMembers.map((mId) => (
                    <div key={mId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                          🚫 BANNED
                        </span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{mId}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveRestriction(selectedTSPForRestrictions._id || selectedTSPForRestrictions.id, mId)}
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
                <button onClick={() => setSelectedTSPForRestrictions(null)} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '0.65rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin TSP Leaderboard Modal */}
      <AnimatePresence>
        {selectedTSPForLeaderboard && (
          <div key="modal-tsp-leaderboard-overlay" className={styles.modalOverlay} style={{ zIndex: 9999, alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(12px)', padding: '1.5rem' }}>
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
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>TSP Leaderboard Standings</h3>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedTSPForLeaderboard.title}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: selectedTSPForLeaderboard.leaderboardEnabled !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: selectedTSPForLeaderboard.leaderboardEnabled !== false ? '#10b981' : '#f87171', border: `1px solid ${selectedTSPForLeaderboard.leaderboardEnabled !== false ? '#10b981' : '#f87171'}`, padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {selectedTSPForLeaderboard.leaderboardEnabled !== false ? '🟢 PUBLIC ON' : '🔴 HIDDEN OFF'}
                  </span>
                  <button
                    onClick={() => handleOpenTSPLeaderboard(selectedTSPForLeaderboard)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #475569', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Refresh Standings"
                  >
                    <RefreshCw size={14} />
                    <span>Refresh</span>
                  </button>
                  <button onClick={() => setSelectedTSPForLeaderboard(null)} className={styles.closeBtn}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {loadingLeaderboard ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <RefreshCw size={32} className={styles.spinner} color="#38bdf8" />
                  <span>Calculating tsp scores and standings...</span>
                </div>
              ) : tspLeaderboardData.length === 0 ? (
                <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #334155' }}>
                  🏆 No submissions yet for this tsp arena!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tspLeaderboardData.map((row, index) => (
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
                            {row.department || 'DSCAI'} • Solved: <strong style={{ color: '#10b981' }}>{row.submissionsCount || 0}</strong> / {row.totalChallenges || selectedTSPForLeaderboard?.challenges?.length || 0}
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
                <button onClick={() => setSelectedTSPForLeaderboard(null)} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '0.65rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  Close Window
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
              style={{ padding: '2rem', maxWidth: '440px', width: '92%' }}
            >
              <div className={styles.modalHeader}>
                <h3>Manual Whitelist Entry</h3>
                <button onClick={() => setWhitelistManualOpen(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                    ROLLno <span style={{ color: '#00f0ff' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={manualWhitelistEntry.rollNo || ''}
                    onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, rollNo: e.target.value.toUpperCase(), identifier: e.target.value.toUpperCase() })}
                    placeholder="e.g. 21104101"
                    className={styles.inputField}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Name <span style={{ color: '#00f0ff' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={manualWhitelistEntry.name || ''}
                    onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className={styles.inputField}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Register Number <span style={{ color: '#00f0ff' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={manualWhitelistEntry.registerNo || ''}
                    onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, registerNo: e.target.value.toUpperCase() })}
                    placeholder="e.g. 211421104101"
                    className={styles.inputField}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                    Mail ID <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={manualWhitelistEntry.email || ''}
                    onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, email: e.target.value })}
                    placeholder="e.g. johndoe@example.com"
                    className={styles.inputField}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
                  />
                </div>
                  <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0', fontSize: '0.88rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Assigned Passcode <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'normal' }}>(Optional)</span>
                    </label>
                    <select
                        value={manualWhitelistEntry.assignedCode || ''}
                        onChange={(e) => setManualWhitelistEntry({ ...manualWhitelistEntry, assignedCode: e.target.value })}
                        className={styles.inputField}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
                      >
                        <option value="" style={{ background: '#0f172a', color: '#cbd5e1' }}>-- No Specific Code --</option>
                        {(() => {
                          let codes = [];
                          if (Array.isArray(selectedTSPForManage?.accessCodes) && selectedTSPForManage.accessCodes.length > 0) {
                            codes = selectedTSPForManage.accessCodes;
                          } else if (selectedTSPForManage?.passcode) {
                            codes = [{ code: selectedTSPForManage.passcode, label: 'Default Code' }];
                          }
                          return codes.map((c, idx) => (
                            <option key={idx} value={c.code} style={{ background: '#0f172a', color: '#fff' }}>
                              {c.code} {c.label ? `(${c.label})` : ''}
                            </option>
                          ));
                        })()}
                      </select>
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
                      <th style={{ padding: '0.5rem', color: '#00f0ff' }}>ROLL No</th>
                      <th style={{ padding: '0.5rem' }}>Name</th>
                      <th style={{ padding: '0.5rem', color: '#a78bfa' }}>Register No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whitelistPreviewData.newStudents.map((stu, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: '#00f0ff' }}>{stu.rollNo || stu.identifier}</td>
                        <td style={{ padding: '0.5rem' }}>{stu.name}</td>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: '#c4b5fd' }}>{stu.registerNo || '—'}</td>
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
        {showWhitelistViewModal && selectedTSPForManage && (
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
                    {selectedTSPForManage.title} • <strong style={{ color: '#00f0ff' }}>{selectedTSPForManage.whitelistedStudents?.length || 0}</strong> registered student{(selectedTSPForManage.whitelistedStudents?.length || 0) === 1 ? '' : 's'}
                  </span>
                </div>
                <button onClick={() => setShowWhitelistViewModal(false)} className={styles.closeBtn} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody} style={{ padding: '1.25rem 0' }}>
                {/* Search Bar & Quick Add */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search by Roll No, Name, Register No, or Mail ID..."
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
                      onFocus={(e) => { e.target.style.border = '1px solid #00f0ff'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)'; }}
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
                  
                  <select
                    value={whitelistCodeFilter}
                    onChange={(e) => setWhitelistCodeFilter(e.target.value)}
                    style={{
                      padding: '0.7rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      minWidth: '120px'
                    }}
                  >
                    <option value="ALL" style={{ background: '#0f172a' }}>All Codes</option>
                    {(() => {
                      let codes = [];
                      if (Array.isArray(selectedTSPForManage?.accessCodes) && selectedTSPForManage.accessCodes.length > 0) {
                        codes = selectedTSPForManage.accessCodes;
                      } else if (selectedTSPForManage?.passcode) {
                        codes = [{ code: selectedTSPForManage.passcode, label: 'Default Code' }];
                      }
                      return codes.map((c, idx) => (
                        <option key={idx} value={c.code} style={{ background: '#0f172a' }}>{c.code}</option>
                      ));
                    })()}
                  </select>

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
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={16} /> Add Student
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const allStudents = selectedTSPForManage.whitelistedStudents || [];
                      const query = whitelistSearchQuery.trim().toLowerCase();
                      const wFilter = whitelistCodeFilter !== 'ALL' ? whitelistCodeFilter : null;
                      const filtered = allStudents.filter(s => {
                        const matchQuery = query ? ((s.rollNo || s.identifier || '').toLowerCase().includes(query) || (s.name || '').toLowerCase().includes(query) || (s.registerNo || '').toLowerCase().includes(query) || (s.email || '').toLowerCase().includes(query)) : true;
                        const matchCode = wFilter ? ((s.assignedCode || '').trim().toUpperCase() === wFilter) : true;
                        return matchQuery && matchCode;
                      });
                      handleExportWhitelistPDF(selectedTSPForManage, filtered);
                    }}
                    disabled={generatingPdf}
                    style={{ padding: '0.55rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {generatingPdf ? <Loader2 size={14} className={styles.spin} /> : <FileText size={14} />} PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allStudents = selectedTSPForManage.whitelistedStudents || [];
                      const query = whitelistSearchQuery.trim().toLowerCase();
                      const wFilter = whitelistCodeFilter !== 'ALL' ? whitelistCodeFilter : null;
                      const filtered = allStudents.filter(s => {
                        const matchQuery = query ? ((s.rollNo || s.identifier || '').toLowerCase().includes(query) || (s.name || '').toLowerCase().includes(query) || (s.registerNo || '').toLowerCase().includes(query) || (s.email || '').toLowerCase().includes(query)) : true;
                        const matchCode = wFilter ? ((s.assignedCode || '').trim().toUpperCase() === wFilter) : true;
                        return matchQuery && matchCode;
                      });
                      handleExportWhitelistExcel(selectedTSPForManage, filtered);
                    }}
                    style={{ padding: '0.55rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <DownloadCloud size={14} /> Excel
                  </button>
                </div>

                {/* Filtered Count Display */}
                {(() => {
                  const allStudents = selectedTSPForManage.whitelistedStudents || [];
                  const query = whitelistSearchQuery.trim().toLowerCase();
                  const wFilter = whitelistCodeFilter !== 'ALL' ? whitelistCodeFilter : null;
                      const filtered = allStudents.filter(s => {
                        const matchQuery = query ? ((s.rollNo || s.identifier || '').toLowerCase().includes(query) || (s.name || '').toLowerCase().includes(query) || (s.registerNo || '').toLowerCase().includes(query) || (s.email || '').toLowerCase().includes(query)) : true;
                        const matchCode = wFilter ? ((s.assignedCode || '').trim().toUpperCase() === wFilter) : true;
                        return matchQuery && matchCode;
                      });if (allStudents.length === 0) {
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
                            <th style={{ padding: '0.75rem 0.75rem', color: '#00f0ff', fontSize: '0.75rem', textTransform: 'uppercase' }}>ROLL No</th>
                            <th style={{ padding: '0.75rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Name</th>
                            <th style={{ padding: '0.75rem 0.75rem', color: '#a78bfa', fontSize: '0.75rem', textTransform: 'uppercase' }}>Register No</th>
                            <th style={{ padding: '0.75rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Mail ID</th>
                              <th style={{ padding: '0.75rem 0.75rem', color: '#f59e0b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Assigned Code</th>
                            <th style={{ padding: '0.75rem 0.85rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right', width: '60px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((stu, idx) => (
                            <tr
                              key={stu._id || stu.identifier || idx}
                              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <td style={{ padding: '0.65rem 0.6rem 0.65rem 0.85rem', color: '#64748b', fontSize: '0.8rem' }}>{idx + 1}</td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                <span style={{ fontFamily: 'monospace', color: '#00f0ff', fontWeight: 700, background: 'rgba(0, 240, 255, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                                  {stu.rollNo || stu.identifier}
                                </span>
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#f1f5f9' }}>{stu.name || '—'}</td>
                              <td style={{ padding: '0.65rem 0.75rem' }}>
                                {stu.registerNo ? (
                                  <span style={{ fontFamily: 'monospace', color: '#c4b5fd', background: 'rgba(167, 139, 250, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.2)', fontSize: '0.82rem' }}>
                                    {stu.registerNo}
                                  </span>
                                ) : (
                                  <span style={{ color: '#64748b', fontSize: '0.82rem' }}>—</span>
                                )}
                              </td>
                              <td style={{ padding: '0.65rem 0.75rem', color: '#94a3b8', fontSize: '0.82rem' }}>{stu.email || '—'}</td>
                                <td style={{ padding: '0.65rem 0.75rem' }}>
                                  {stu.assignedCode ? (
                                    <span style={{ fontFamily: 'monospace', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.82rem', fontWeight: 700 }}>
                                      {stu.assignedCode}
                                    </span>
                                  ) : (
                                    <span style={{ color: '#64748b', fontSize: '0.82rem' }}>ANY</span>
                                  )}
                                </td>
                              <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWhitelistedStudent(stu.identifier, stu.registerNo)}
                                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                  title={`Remove ${stu.rollNo || stu.identifier} from whitelist`}
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
                    const allStudents = selectedTSPForManage.whitelistedStudents || [];
                    const query = whitelistSearchQuery.trim().toLowerCase();
                    const wFilter = whitelistCodeFilter !== 'ALL' ? whitelistCodeFilter : null;
                      const filtered = allStudents.filter(s => {
                        const matchQuery = query ? ((s.rollNo || s.identifier || '').toLowerCase().includes(query) || (s.name || '').toLowerCase().includes(query) || (s.registerNo || '').toLowerCase().includes(query) || (s.email || '').toLowerCase().includes(query)) : true;
                        const matchCode = wFilter ? ((s.assignedCode || '').trim().toUpperCase() === wFilter) : true;
                        return matchQuery && matchCode;
                      });return `Showing ${filtered.length} of ${allStudents.length} student${allStudents.length === 1 ? '' : 's'}`;
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
        {showActiveParticipantsModal && selectedTSPForManage && (
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
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Active Test Participants ({selectedTSPForManage.activeParticipants?.length || 0})</h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      Live session telemetry, code verification, scores, and completion status.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowActiveParticipantsModal(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar: Search + Access Code Filter */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 2, minWidth: '220px' }}>
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

                {/* Filter by Access Code */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <select
                    value={activeParticipantCodeFilter}
                    onChange={(e) => setActiveParticipantCodeFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      color: '#f59e0b',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL">All Codes ({selectedTSPForManage.activeParticipants?.length || 0})</option>
                    {(() => {
                      const codes = [];
                      (selectedTSPForManage.accessCodes || []).forEach(c => {
                        const codeStr = (c?.code || '').trim().toUpperCase();
                        if (codeStr && !codes.includes(codeStr)) codes.push(codeStr);
                      });
                      (selectedTSPForManage.activeParticipants || []).forEach(p => {
                        const pu = (p?.passcodeUsed || '').trim().toUpperCase();
                        if (pu && !codes.includes(pu)) codes.push(pu);
                      });
                      return codes.map(c => {
                        const count = (selectedTSPForManage.activeParticipants || []).filter(
                          p => (p?.passcodeUsed || '').trim().toUpperCase() === c
                        ).length;
                        return (
                          <option key={c} value={c}>
                            🔑 {c} ({count})
                          </option>
                        );
                      });
                    })()}
                  </select>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.15)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { id: 'ALL', label: `All (${selectedTSPForManage.activeParticipants?.length || 0})`, color: '#38bdf8' },
                  { id: 'completed', label: `🎓 Completed (${(selectedTSPForManage.activeParticipants || []).filter(p => p.status === 'completed' || (selectedTSPForManage.completedMembers || []).map(m => m.toUpperCase()).includes((p.memberId || '').toUpperCase())).length})`, color: '#10b981' },
                  { id: 'in_progress', label: `🟢 In Progress (${(selectedTSPForManage.activeParticipants || []).filter(p => p.status !== 'completed' && p.status !== 'restricted' && !(selectedTSPForManage.completedMembers || []).map(m => m.toUpperCase()).includes((p.memberId || '').toUpperCase())).length})`, color: '#00f0ff' },
                  { id: 'restricted', label: `🔴 Disqualified (${(selectedTSPForManage.activeParticipants || []).filter(p => p.status === 'restricted').length})`, color: '#ef4444' }
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
                  const participants = selectedTSPForManage.activeParticipants || [];
                  const q = activeParticipantSearch.trim().toLowerCase();
                  const targetCode = activeParticipantCodeFilter.trim().toUpperCase();

                  const filtered = participants.filter(p => {
                    if (targetCode !== 'ALL') {
                      if ((p.passcodeUsed || '').trim().toUpperCase() !== targetCode) return false;
                    }
                    if (activeParticipantStatusFilter !== 'ALL') {
                      const isCompleted = p.status === 'completed' || (selectedTSPForManage.completedMembers || []).map(m => m.toUpperCase()).includes((p.memberId || '').toUpperCase());
                      if (activeParticipantStatusFilter === 'completed' && !isCompleted) return false;
                      if (activeParticipantStatusFilter === 'in_progress' && (isCompleted || p.status === 'restricted')) return false;
                      if (activeParticipantStatusFilter === 'restricted' && p.status !== 'restricted') return false;
                    }
                    if (q) {
                      const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                      const nMatch = p.name && p.name.toLowerCase().includes(q);
                      const sMatch = p.status && p.status.toLowerCase().includes(q);
                      const pMatch = p.passcodeUsed && p.passcodeUsed.toLowerCase().includes(q);
                      if (!mMatch && !nMatch && !sMatch && !pMatch) return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        {q || targetCode !== 'ALL'
                          ? `No participants found matching the selected filter.`
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
                          <th style={{ padding: '0.6rem 0.75rem' }}>Code & Batch</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Score</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Status</th>
                          <th style={{ padding: '0.6rem 0.75rem' }}>Join Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((stu, idx) => {
                          const statusColor = stu.status === 'completed'
                            ? '#10b981'
                            : stu.status === 'restricted'
                            ? '#ef4444'
                            : '#00f0ff';
                          const statusBg = stu.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : stu.status === 'restricted'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(0, 240, 255, 0.15)';
                          const statusLabel = stu.status === 'completed'
                            ? '✅ Completed'
                            : stu.status === 'restricted'
                            ? '🔴 Disqualified'
                            : '🟢 In Progress';

                          const matchedObj = (selectedTSPForManage.accessCodes || []).find(
                            c => c.code && c.code.trim().toUpperCase() === (stu.passcodeUsed || '').trim().toUpperCase()
                          );

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s' }}>
                              <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{idx + 1}</td>
                              <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                                {stu.memberId}
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                                {stu.name || 'Anonymous'}
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                {stu.passcodeUsed ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                                      🔑 {stu.passcodeUsed}
                                    </span>
                                    {matchedObj?.label && (
                                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                        ({matchedObj.label})
                                      </span>
                                    )}
                                  </div>
                                ) : selectedTSPForManage.passcodeEnabled ? (
                                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>N/A (Pre-code)</span>
                                ) : (
                                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Open Arena</span>
                                )}
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: (stu.score > 0 ? '#4ade80' : '#94a3b8') }}>
                                {stu.score ?? 0} pts
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <span style={{ background: statusBg, color: statusColor, padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                {stu.joinedAt ? new Date(stu.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              <div className={styles.modalFooter} style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {(() => {
                    const all = selectedTSPForManage.activeParticipants || [];
                    const q = activeParticipantSearch.trim().toLowerCase();
                    const targetCode = activeParticipantCodeFilter.trim().toUpperCase();
                    const filtered = all.filter(p => {
                      if (targetCode !== 'ALL') {
                        if ((p.passcodeUsed || '').trim().toUpperCase() !== targetCode) return false;
                      }
                      if (q) {
                        const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                        const nMatch = p.name && p.name.toLowerCase().includes(q);
                        const sMatch = p.status && p.status.toLowerCase().includes(q);
                        const pMatch = p.passcodeUsed && p.passcodeUsed.toLowerCase().includes(q);
                        if (!mMatch && !nMatch && !sMatch && !pMatch) return false;
                      }
                      return true;
                    });
                    return (
                      <>
                        Showing {filtered.length} of {all.length} participant{all.length === 1 ? '' : 's'}
                        {activeParticipantCodeFilter !== 'ALL' && <strong style={{ color: '#f59e0b' }}> for code &quot;{activeParticipantCodeFilter}&quot;</strong>}
                      </>
                    );
                  })()}
                </span>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleExportParticipantsCSV(selectedTSPForManage, activeParticipantCodeFilter)}
                    style={{ padding: '0.55rem 0.95rem', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Export currently filtered list as CSV"
                  >
                    <FileText size={14} /> Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportParticipantsExcel(selectedTSPForManage, activeParticipantCodeFilter)}
                    style={{ padding: '0.55rem 1rem', background: '#10b981', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Export currently filtered list as Excel (.xlsx)"
                  >
                    <DownloadCloud size={16} /> Export Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActiveParticipantsModal(false)}
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

      {/* Dedicated Modal for Completed Students */}
      <AnimatePresence>
        {showCompletedModal && selectedTSPForManage && (
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
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Completed Students ({getCompletedCount(selectedTSPForManage)})</h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      All students who have finished or exited this TSP arena. Re-entry has been permanently locked.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowCompletedModal(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar: Search + Code Filter */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 2, minWidth: '220px' }}>
                  <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    value={completedSearchQuery}
                    onChange={(e) => setCompletedSearchQuery(e.target.value)}
                    placeholder="Search by Roll Number, Name, or Batch..."
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

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <select
                    value={completedCodeFilter}
                    onChange={(e) => setCompletedCodeFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '8px',
                      color: '#34d399',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL">All Batches / Codes</option>
                    {(() => {
                      const allCompleted = getCompletedStudentsList(selectedTSPForManage);
                      const codes = [];
                      allCompleted.forEach(p => {
                        const pu = (p.passcodeUsed || '').trim().toUpperCase();
                        if (pu && !codes.includes(pu)) codes.push(pu);
                      });
                      return codes.map(c => (
                        <option key={c} value={c}>🔑 {c}</option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className={styles.modalBody} style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem' }}>
                {(() => {
                  const allCompleted = getCompletedStudentsList(selectedTSPForManage);
                  const q = completedSearchQuery.trim().toLowerCase();
                  const targetCode = completedCodeFilter.trim().toUpperCase();

                  const filtered = allCompleted.filter(p => {
                    if (targetCode !== 'ALL') {
                      if ((p.passcodeUsed || '').trim().toUpperCase() !== targetCode) return false;
                    }
                    if (q) {
                      const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                      const nMatch = p.name && p.name.toLowerCase().includes(q);
                      const pMatch = p.passcodeUsed && p.passcodeUsed.toLowerCase().includes(q);
                      if (!mMatch && !nMatch && !pMatch) return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        {q || targetCode !== 'ALL'
                          ? 'No completed students found matching the selected search/filter.'
                          : 'No students have completed or exited this TSP arena yet.'}
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
                          <th style={{ padding: '0.6rem 0.75rem' }}>Code & Batch</th>
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
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              {stu.passcodeUsed ? (
                                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                                  🔑 {stu.passcodeUsed}
                                </span>
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Default</span>
                              )}
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
                    const allCompleted = getCompletedStudentsList(selectedTSPForManage);
                    const q = completedSearchQuery.trim().toLowerCase();
                    const targetCode = completedCodeFilter.trim().toUpperCase();
                    const filtered = allCompleted.filter(p => {
                      if (targetCode !== 'ALL' && (p.passcodeUsed || '').trim().toUpperCase() !== targetCode) return false;
                      if (q) {
                        const mMatch = p.memberId && p.memberId.toLowerCase().includes(q);
                        const nMatch = p.name && p.name.toLowerCase().includes(q);
                        const pMatch = p.passcodeUsed && p.passcodeUsed.toLowerCase().includes(q);
                        if (!mMatch && !nMatch && !pMatch) return false;
                      }
                      return true;
                    });
                    return `Showing ${filtered.length} of ${allCompleted.length} completed student${allCompleted.length === 1 ? '' : 's'}`;
                  })()}
                </span>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => exportCompletedCSV(selectedTSPForManage)}
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
                  onClick={() => handleDownloadDetailedPdfReport(selectedTSPForManage)}
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

      {/* Modal for TSP Performance Report Export (Excel & PDF) */}
      <AnimatePresence>
        {showReportExportModal && selectedTSPForManage && (
          <div key="modal-report-export-overlay" className={styles.modalOverlay} style={{ zIndex: 1100, overflowY: 'auto', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => !exportingReportType && setShowReportExportModal(false)}>
            <motion.div
              key="modal-report-export-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modalContent}
              style={{ width: '94%', maxWidth: '640px', maxHeight: '90vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(0, 240, 255, 0.4)', boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={styles.modalHeader} style={{ flexShrink: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>
                    <DownloadCloud size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>Export TSP Performance Report</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Generate reports with Easy/Medium/Hard breakdown & test cases satisfied</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={exportingReportType !== null}
                  onClick={() => setShowReportExportModal(false)}
                  className={styles.closeBtn}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className={styles.modalBody} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', flex: 1 }}>
                {/* Competition info pill */}
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Arena</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00f0ff' }}>{selectedTSPForManage.title}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Participants</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
                      👥 {(selectedTSPForManage.activeParticipants || []).length} Students
                    </div>
                  </div>
                </div>

                {/* Filter Scope Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
                    1. Choose Report Scope / Filter:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {/* Option: All Students */}
                    <div
                      onClick={() => {
                        setReportScope('ALL');
                        setSelectedReportCode('');
                        setManualReportCodeInput('');
                      }}
                      style={{
                        background: reportScope === 'ALL' ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: reportScope === 'ALL' ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, color: reportScope === 'ALL' ? '#00f0ff' : '#cbd5e1', fontSize: '0.95rem' }}>
                          All Students
                        </span>
                        <input
                          type="radio"
                          name="reportScope"
                          checked={reportScope === 'ALL'}
                          onChange={() => {
                            setReportScope('ALL');
                            setSelectedReportCode('');
                            setManualReportCodeInput('');
                          }}
                          style={{ accentColor: '#00f0ff' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        Download entire participant roster across all batches & codes
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginTop: '0.25rem' }}>
                        {(selectedTSPForManage.activeParticipants || []).length} students recorded
                      </span>
                    </div>

                    {/* Option: Filter by Access Code */}
                    <div
                      onClick={() => setReportScope('CODE')}
                      style={{
                        background: reportScope === 'CODE' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: reportScope === 'CODE' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, color: reportScope === 'CODE' ? '#f59e0b' : '#cbd5e1', fontSize: '0.95rem' }}>
                          By Access Code
                        </span>
                        <input
                          type="radio"
                          name="reportScope"
                          checked={reportScope === 'CODE'}
                          onChange={() => setReportScope('CODE')}
                          style={{ accentColor: '#f59e0b' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        Select or enter a valid access code to export only that batch
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginTop: '0.25rem' }}>
                        {(selectedTSPForManage.accessCodes?.length || (selectedTSPForManage.passcode ? 1 : 0))} code(s) available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Access Code Selector / Input when reportScope === 'CODE' */}
                {reportScope === 'CODE' && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                      🔑 Select or Enter Valid Access Code:
                    </div>

                    {/* Pre-existing codes dropdown */}
                    {Array.isArray(selectedTSPForManage.accessCodes) && selectedTSPForManage.accessCodes.length > 0 && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                          Select from Existing Arena Codes:
                        </label>
                        <select
                          value={selectedReportCode}
                          onChange={(e) => {
                            setSelectedReportCode(e.target.value);
                            setManualReportCodeInput('');
                          }}
                          style={{
                            width: '100%',
                            background: '#0f172a',
                            border: '1px solid #f59e0b',
                            color: '#fff',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        >
                          <option value="">-- Choose Access Code --</option>
                          {selectedTSPForManage.accessCodes.map((cObj, idx) => {
                            const cCode = (cObj.code || '').trim().toUpperCase();
                            const count = (selectedTSPForManage.activeParticipants || []).filter(
                              p => (p.passcodeUsed || '').trim().toUpperCase() === cCode
                            ).length;
                            return (
                              <option key={idx} value={cCode}>
                                {cCode} {cObj.label ? `(${cObj.label})` : ''} — {count} student{count === 1 ? '' : 's'}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {/* Manual input fallback */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        Or Type Valid Access Code:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MORNING, BATCH-A, TSP2026"
                        value={manualReportCodeInput}
                        onChange={(e) => {
                          setManualReportCodeInput(e.target.value.toUpperCase());
                          setSelectedReportCode('');
                        }}
                        style={{
                          width: '100%',
                          background: '#0f172a',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          fontFamily: 'monospace',
                          letterSpacing: '1px'
                        }}
                      />
                    </div>

                    {/* Preview matching count */}
                    {(() => {
                      const effCode = (manualReportCodeInput || selectedReportCode || '').trim().toUpperCase();
                      if (!effCode) {
                        return (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Please pick or type a code to verify candidate count.
                          </div>
                        );
                      }
                      const matchCount = (selectedTSPForManage.activeParticipants || []).filter(
                        p => (p.passcodeUsed || '').trim().toUpperCase() === effCode
                      ).length;
                      return (
                        <div style={{ fontSize: '0.8rem', color: matchCount > 0 ? '#10b981' : '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {matchCount > 0 ? '✅' : '⚠️'} {matchCount} student{matchCount === 1 ? '' : 's'} participated under code &quot;{effCode}&quot;
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Structure Breakdown Preview Note */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  <strong style={{ color: '#00f0ff' }}>📋 Columns included in both Excel & PDF:</strong><br />
                  S.No • Name • Roll Number • Register Number • Score in Easy (out of max) • Score in Medium • Number of test cases satisfied in Medium • Score in Hard • Number of test cases satisfied in Hard • Total Score • Status
                </div>
              </div>

              {/* Footer with Format Actions */}
              <div className={styles.modalFooter} style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', background: '#0b1120' }}>
                <button
                  type="button"
                  disabled={exportingReportType !== null}
                  onClick={() => setShowReportExportModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Excel Export Button */}
                  <button
                    type="button"
                    disabled={exportingReportType !== null}
                    onClick={() => {
                      const effCode = (manualReportCodeInput || selectedReportCode || '').trim().toUpperCase();
                      if (reportScope === 'CODE' && !effCode) {
                        alert('Please select or enter a valid Access Code first.');
                        return;
                      }
                      handleExportPerformanceReportExcel(selectedTSPForManage, reportScope, effCode);
                    }}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      color: '#000',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: exportingReportType !== null ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      opacity: exportingReportType !== null ? 0.7 : 1,
                      boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <DownloadCloud size={16} />
                    {exportingReportType === 'excel' ? 'Exporting Excel...' : 'Download Excel (.xlsx)'}
                  </button>

                  {/* PDF Export Button */}
                  <button
                    type="button"
                    disabled={exportingReportType !== null}
                    onClick={() => {
                      const effCode = (manualReportCodeInput || selectedReportCode || '').trim().toUpperCase();
                      if (reportScope === 'CODE' && !effCode) {
                        alert('Please select or enter a valid Access Code first.');
                        return;
                      }
                      handleExportPerformanceReportPDF(selectedTSPForManage, reportScope, effCode);
                    }}
                    style={{
                      background: '#ec4899',
                      border: 'none',
                      color: '#fff',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: exportingReportType !== null ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      opacity: exportingReportType !== null ? 0.7 : 1,
                      boxShadow: '0 0 15px rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    <FileText size={16} />
                    {exportingReportType === 'pdf' ? 'Generating PDF...' : 'Download PDF (.pdf)'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}










