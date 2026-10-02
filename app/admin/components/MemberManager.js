"use client";

import { useState, useEffect, useMemo } from 'react';
import { UserPlus, Search, Edit2, Trash2, Shield, Copy, Check, RefreshCw, X, Upload, Download, FileText, AlertCircle, Filter } from 'lucide-react';
import styles from '../Admin.module.css';

export default function MemberManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'AI & Data Science',
    year: '1st Year',
    roleInterest: 'General Member / Participant',
    linkedin: '',
    github: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.members || []);
      setMembers(list);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      department: 'AI & Data Science',
      year: '1st Year',
      roleInterest: 'General Member / Participant',
      linkedin: '',
      github: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingId(m._id || m.memberId);
    setFormData({
      name: m.name || '',
      email: m.email || '',
      department: m.department || 'AI & Data Science',
      year: m.year || '1st Year',
      roleInterest: m.roleInterest || 'General Member / Participant',
      linkedin: m.linkedin || '',
      github: m.github || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        const res = await fetch(`/api/members/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update member');
      } else {
        // Create new
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create member');
      }
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(members.filter(m => String(m._id) !== String(id) && m.memberId !== id));
      } else {
        alert('Failed to delete member');
      }
    } catch (err) {
      alert('Error deleting member: ' + err.message);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const parseBulkInput = (text) => {
    if (!text || !text.trim()) return [];
    const trimmed = text.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    const lines = trimmed.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const firstLine = lines[0].toLowerCase();
    let startIndex = 0;
    if (firstLine.includes('name') && firstLine.includes('email')) {
      startIndex = 1;
    }
    
    const results = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2 && cols[0] && cols[1]) {
        results.push({
          name: cols[0],
          email: cols[1],
          department: cols[2] || 'AI & Data Science',
          year: cols[3] || '1st Year',
          roleInterest: cols[4] || 'General Member / Participant',
          linkedin: cols[5] || '',
          github: cols[6] || ''
        });
      }
    }
    return results;
  };

  const parsedMembersPreview = parseBulkInput(importText);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportText(event.target.result || '');
      setImportError('');
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleCsv = `name,email,department,year,roleInterest,linkedin,github\nAlex Johnson,alex@example.com,AI & Data Science,2nd Year,General Member / Participant,https://linkedin.com/in/alex,https://github.com/alex\nPriya Sharma,priya@example.com,Computer Science,3rd Year,Tech Lead / Developer,,\nRahul Kumar,rahul@example.com,Information Technology,1st Year,General Member / Participant,,`;
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_members_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartImport = async () => {
    if (parsedMembersPreview.length === 0) {
      setImportError('No valid members found to import. Please check your CSV format.');
      return;
    }
    setImporting(true);
    setImportError('');
    try {
      const res = await fetch('/api/members/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: parsedMembersPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`🎉 Successfully bulk imported ${data.count || parsedMembersPreview.length} members! IDs have been generated.`);
        setImportModalOpen(false);
        setImportText('');
        fetchMembers();
      } else {
        setImportError(data.error || 'Failed to import members');
      }
    } catch (err) {
      setImportError('Error importing: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const roleCounts = useMemo(() => {
    const counts = {};
    members.forEach((m) => {
      const r = (m.roleInterest || 'General Member / Participant').trim();
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [members]);

  const availableRoles = useMemo(() => {
    return Object.keys(roleCounts).sort();
  }, [roleCounts]);

  const filteredMembers = members.filter((m) => {
    const memberRole = (m.roleInterest || 'General Member / Participant').trim();
    if (roleFilter !== 'All' && memberRole.toLowerCase() !== roleFilter.toLowerCase()) {
      return false;
    }
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.memberId?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q) ||
      memberRole.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.managerContainer}>
      {/* Top Action Bar */}
      <div className={styles.managerHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '320px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div className={styles.searchBox} style={{ flex: '1 1 260px', maxWidth: '420px' }}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, or DSCAI ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(5, 8, 15, 0.7)',
              border: roleFilter !== 'All' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '0.85rem',
              padding: '0.65rem 0.95rem',
              transition: 'all 0.2s',
              boxShadow: roleFilter !== 'All' ? '0 0 15px rgba(56, 189, 248, 0.25)' : 'none'
            }}
          >
            <Filter size={16} color={roleFilter !== 'All' ? '#38bdf8' : '#64748b'} />
            <span style={{ fontSize: '0.75rem', color: roleFilter !== 'All' ? '#38bdf8' : '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>
              ROLE:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: roleFilter !== 'All' ? '#38bdf8' : '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All" style={{ background: '#0f172a', color: '#fff' }}>
                All Roles ({members.length})
              </option>
              {availableRoles.map((role) => (
                <option key={role} value={role} style={{ background: '#0f172a', color: '#fff' }}>
                  {role} ({roleCounts[role] || 0})
                </option>
              ))}
            </select>
            {roleFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setRoleFilter('All')}
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: 'none',
                  color: '#38bdf8',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0
                }}
                title="Reset Role Filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => { setImportModalOpen(true); setImportError(''); }} className={styles.actionBtn} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
            <Upload size={18} />
            <span>Bulk Import</span>
          </button>
          <button onClick={handleOpenAdd} className={styles.actionBtn}>
            <UserPlus size={18} />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Role Quick-Filter Pills */}
      {availableRoles.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          padding: '0.25rem 0.5rem',
          marginTop: '-0.75rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '0.25rem' }}>
            Quick Filter:
          </span>
          <button
            type="button"
            onClick={() => setRoleFilter('All')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: roleFilter === 'All' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              color: roleFilter === 'All' ? '#38bdf8' : '#94a3b8',
              border: roleFilter === 'All' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: roleFilter === 'All' ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none'
            }}
          >
            All Roles ({members.length})
          </button>
          {availableRoles.map((role) => {
            const isSelected = roleFilter.toLowerCase() === role.toLowerCase();
            return (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none'
                }}
              >
                {role} ({roleCounts[role] || 0})
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className={styles.loadingBox}>
          <RefreshCw size={28} className={styles.spinner} />
          <span>Loading members...</span>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className={styles.emptyTable}>
          <Shield size={40} color="#60a5fa" />
          <h3>{members.length === 0 ? 'No Members Found' : 'No Matching Members Found'}</h3>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 1.25rem 0', maxWidth: '420px', lineHeight: 1.5 }}>
            {members.length === 0
              ? 'Click "Add New Member" to register a student and generate their DSCAIXXXX ID.'
              : `No members match the current filter (${roleFilter !== 'All' ? `Role: "${roleFilter}"` : 'All Roles'}${search ? `, Search: "${search}"` : ''}).`}
          </p>
          {(roleFilter !== 'All' || search) && (
            <button
              type="button"
              onClick={() => { setSearch(''); setRoleFilter('All'); }}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                padding: '0.55rem 1.35rem',
                borderRadius: '0.65rem',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Member ID (DSCAI)</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Department & Year</th>
                <th>Role / Interest</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m._id || m.memberId}>
                  <td>
                    <div className={styles.idCell}>
                      <span className={styles.idText}>{m.memberId}</span>
                      <button
                        onClick={() => handleCopyId(m.memberId)}
                        className={styles.copyIdBtn}
                        title="Copy ID"
                      >
                        {copiedId === m.memberId ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td><strong style={{ color: '#fff' }}>{m.name}</strong></td>
                  <td>{m.email}</td>
                  <td>{m.department} ({m.year})</td>
                  <td>
                    <span
                      className={styles.roleTag}
                      onClick={() => setRoleFilter(m.roleInterest || 'General Member / Participant')}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      title="Click to filter by this role"
                    >
                      {m.roleInterest || 'General Member / Participant'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button onClick={() => handleOpenEdit(m)} className={styles.editBtn} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(m._id || m.memberId)} className={styles.deleteBtn} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Edit Club Member' : 'Register New Member'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {!editingId && (
                <div className={styles.autoIdNotice}>
                  <Shield size={18} color="#60a5fa" />
                  <span>An official unique ID (e.g. <strong>DSCAIXXXX</strong>) will be generated automatically upon saving.</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Swarnalakshmi S"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. student@gmail.com"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Role / Club Position</label>
                <select
                  value={formData.roleInterest}
                  onChange={(e) => setFormData({ ...formData, roleInterest: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(5, 8, 15, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Participant">Participant</option>
                  <option value="General Member / Participant">General Member / Participant</option>
                  <option value="Core Team / Executive">Core Team / Executive</option>
                  <option value="Tech Lead / Developer">Tech Lead / Developer</option>
                  <option value="Designer / Media Lead">Designer / Media Lead</option>
                  <option value="Event Coordinator">Event Coordinator</option>
                  {formData.roleInterest && ![
                    'Participant',
                    'General Member / Participant',
                    'Core Team / Executive',
                    'Tech Lead / Developer',
                    'Designer / Media Lead',
                    'Event Coordinator'
                  ].includes(formData.roleInterest) && (
                    <option value={formData.roleInterest}>{formData.roleInterest}</option>
                  )}
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : editingId ? 'Update Member' : 'Register & Generate ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {importModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1000 }}>
          <div className={styles.modalContent} style={{ maxWidth: '650px', width: '95%', background: '#0f172a', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '1rem', padding: '2rem', color: '#fff' }}>
            <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
                  <Upload size={22} /> Bulk Import Members
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.3rem 0 0 0' }}>
                  Upload a CSV file or paste CSV / JSON text to add multiple students instantly.
                </p>
              </div>
              <button type="button" onClick={() => setImportModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(59, 130, 246, 0.08)', padding: '0.75rem 1rem', borderRadius: '0.6rem', border: '1px dashed rgba(59, 130, 246, 0.3)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block' }}>Step 1: Get Template or Upload File</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Format: name, email, department, year, roleInterest, linkedin, github</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Download size={14} /> Sample CSV
                </button>
                <label style={{ background: '#3b82f6', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
                  <Upload size={14} /> Upload File
                  <input type="file" accept=".csv,.txt,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem' }}>
                Step 2: Paste or Review CSV / JSON Content *
              </label>
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                placeholder={`Alex Johnson, alex@example.com, AI & Data Science, 2nd Year, Member\nPriya Sharma, priya@example.com, Computer Science, 3rd Year, Tech Lead / Developer`}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            {importText && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: parsedMembersPreview.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${parsedMembersPreview.length > 0 ? '#10b981' : '#ef4444'}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {parsedMembersPreview.length > 0 ? (
                  <>
                    <Check size={18} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                      ⚡ Ready to import: <strong style={{ color: '#fff' }}>{parsedMembersPreview.length}</strong> valid members detected! (IDs will be generated automatically).
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} color="#ef4444" />
                    <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>
                      No valid members detected. Make sure each line has at least Name and Email separated by comma.
                    </span>
                  </>
                )}
              </div>
            )}

            {importError && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {importError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartImport}
                disabled={importing || parsedMembersPreview.length === 0}
                style={{
                  background: parsedMembersPreview.length > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : '#334155',
                  color: '#fff',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: parsedMembersPreview.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: parsedMembersPreview.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {importing ? 'Importing...' : `🚀 Import ${parsedMembersPreview.length} Members`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
