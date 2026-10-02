"use client";

import { useState, useEffect } from 'react';
import { FileText, Check, X, Trash2, Search, UserCheck, Shield, AlertCircle, Clock, CheckCircle2, XCircle, Award, Copy, RefreshCw } from 'lucide-react';
import styles from '../Admin.module.css';

export default function ApplicationManager() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [actionLoading, setActionLoading] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      let data = [];
      try { data = await res.json(); } catch(e) {}
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (app, newStatus, registerMember = false) => {
    setActionLoading(app._id);
    try {
      const res = await fetch(`/api/applications/${app._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, registerMember }),
      });
      let data = {};
      try { data = await res.json(); } catch(e) {}
      if (res.ok) {
        if (data.memberCreated && data.memberId) {
          alert(`🎉 Successfully approved application and registered ${app.name} as an official club member! Assigned ID: ${data.memberId}`);
        } else if (newStatus === 'Approved') {
          alert(`✅ Application approved!${data.memberId ? ` (Member ID: ${data.memberId})` : ''}`);
        } else if (newStatus === 'Rejected') {
          alert(`❌ Application rejected.`);
        }
        fetchApplications();
      } else {
        alert(data.error || 'Failed to update application');
      }
    } catch (err) {
      alert('Error updating application: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this application?')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(applications.filter(a => a._id !== id));
      } else {
        let data = {};
        try { data = await res.json(); } catch(e) {}
        alert(data.error || 'Failed to delete application');
      }
    } catch (err) {
      alert('Error deleting application: ' + err.message);
    }
  };

  const handleCopyId = (idText) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.department?.toLowerCase().includes(search.toLowerCase()) ||
      app.interest?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

  return (
    <div className={styles.managerContainer}>
      {/* Top Header & Search Bar */}
      <div className={styles.managerHeader} style={{ flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search applications by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.35rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setStatusFilter('All')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: 'none', background: statusFilter === 'All' ? '#3b82f6' : 'transparent', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setStatusFilter('Pending')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: 'none', background: statusFilter === 'Pending' ? '#f59e0b' : 'transparent', color: statusFilter === 'Pending' ? '#000' : '#fbbf24', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Clock size={12} /> Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('Approved')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: 'none', background: statusFilter === 'Approved' ? '#10b981' : 'transparent', color: statusFilter === 'Approved' ? '#000' : '#34d399', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <CheckCircle2 size={12} /> Approved ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('Rejected')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: 'none', background: statusFilter === 'Rejected' ? '#ef4444' : 'transparent', color: statusFilter === 'Rejected' ? '#fff' : '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <XCircle size={12} /> Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        <button onClick={fetchApplications} className={styles.addBtn} style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa' }}>
          <RefreshCw size={16} /> Refresh Applications
        </button>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading submitted applications...</span>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className={styles.emptyTable}>
          <FileText size={48} color="#60a5fa" />
          <h3>No Applications Found</h3>
          <p>{statusFilter !== 'All' ? `There are no ${statusFilter.toLowerCase()} applications right now.` : "When students fill out the 'Join The Club' form on the home page, their applications will appear here!"}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Status / Date</th>
                <th>Applicant Details</th>
                <th>Academic Info</th>
                <th>Area of Interest</th>
                <th>Assigned ID</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        width: 'fit-content',
                        background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: app.status === 'Approved' ? '#34d399' : app.status === 'Rejected' ? '#f87171' : '#fbbf24',
                        border: `1px solid ${app.status === 'Approved' ? '#10b981' : app.status === 'Rejected' ? '#ef4444' : '#f59e0b'}`
                      }}>
                        {app.status === 'Approved' ? <CheckCircle2 size={12} /> : app.status === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                        {app.status || 'Pending'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>{app.name}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{app.email}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#e2e8f0', display: 'block' }}>{app.department || 'AI & DS'}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{app.year || '1st Year'}</span>
                  </td>
                  <td>
                    <div style={{ maxWidth: '240px', fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'normal', lineHeight: 1.4, background: 'rgba(15, 23, 42, 0.5)', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {app.interest || <span style={{ color: '#64748b', fontStyle: 'italic' }}>No specific interest noted</span>}
                    </div>
                  </td>
                  <td>
                    {app.memberId ? (
                      <div className={styles.idCell}>
                        <span className={styles.idText} style={{ color: '#38bdf8' }}>{app.memberId}</span>
                        <button
                          onClick={() => handleCopyId(app.memberId)}
                          className={styles.copyIdBtn}
                          title="Copy Member ID"
                        >
                          {copiedId === app.memberId ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>Not assigned yet</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {app.status !== 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(app, 'Approved', true)}
                          disabled={actionLoading === app._id}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s'
                          }}
                          title="Approve & Register Member ID (DSCAIXXXX)"
                        >
                          <UserCheck size={14} />
                          <span>Approve & Register</span>
                        </button>
                      )}

                      {app.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusChange(app, 'Rejected', false)}
                          disabled={actionLoading === app._id}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid #ef4444',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            transition: 'all 0.2s'
                          }}
                          title="Reject Application"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(app._id)}
                        className={styles.deleteBtn}
                        title="Delete Application Record"
                        style={{ marginLeft: '0.2rem' }}
                      >
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
    </div>
  );
}
