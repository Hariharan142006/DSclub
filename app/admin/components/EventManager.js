"use client";

import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, MapPin, Clock, RefreshCw, X, Users, Download, FileText } from 'lucide-react';
import styles from '../Admin.module.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '2026-08-15',
    time: '10:00 AM',
    location: 'Panimalar Engineering College Auditorium',
    description: '',
    imageUrl: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg',
    status: 'Upcoming',
    customQuestions: [],
    formFields: []
  });

  // Registrations state
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [viewingRegsFor, setViewingRegsFor] = useState(null);
  const [registrationsList, setRegistrationsList] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const handleViewRegistrations = async (ev) => {
    setViewingRegsFor(ev);
    setLoadingRegs(true);
    try {
      const res = await fetch(`/api/event-registrations?eventId=${ev._id || ev.id}`);
      const data = await res.json();
      setRegistrationsList(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Failed to load registrations: ' + err.message);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleExportCSV = () => {
    if (!registrationsList.length) return alert('No registrations to export.');

    const hasForm = viewingRegsFor?.formFields?.length > 0;
    let headers, rows;

    if (hasForm) {
      headers = [...viewingRegsFor.formFields.map(f => f.label), 'Registered At'];
      rows = registrationsList.map(r => {
        const getVal = (f) => {
          if (r.formResponses && r.formResponses[f.id]) return r.formResponses[f.id];
          const l = (f.label || '').toLowerCase();
          if (l.includes('name')) return r.name;
          if (l.includes('email') || l.includes('mail')) return r.email;
          if (l.includes('roll') || l.includes('register')) return r.rollNo;
          if (l.includes('dept') || l.includes('year') || l.includes('department')) return r.deptYear;
          return '';
        };

        const rowData = viewingRegsFor.formFields.map(f => {
           const val = getVal(f) || '';
           const exportVal = (typeof val === 'string' && val.startsWith('data:')) ? '[File Uploaded in App]' : val;
           return `"${String(exportVal).replace(/"/g, '""')}"`;
        });
        rowData.push(`"${new Date(r.registeredAt || r.createdAt).toLocaleString()}"`);
        return rowData;
      });
    } else {
      const allCustomQs = Array.from(new Set(registrationsList.flatMap(r => Object.keys(r.customResponses || {}))));
      headers = ['Name', 'Email', 'Roll No', 'Dept / Year', 'Registered At', ...allCustomQs];
      rows = registrationsList.map(r => [
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.rollNo || '').replace(/"/g, '""')}"`,
        `"${(r.deptYear || '').replace(/"/g, '""')}"`,
        `"${new Date(r.registeredAt || r.createdAt).toLocaleString()}"`,
        ...allCustomQs.map(q => `"${((r.customResponses && r.customResponses[q]) || '').replace(/"/g, '""')}"`)
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(viewingRegsFor?.title || 'Event').replace(/[^a-z0-9]/gi, '_')}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (!registrationsList.length) return alert('No registrations to export.');
    const doc = new jsPDF('landscape');
    
    const loadImgAsBase64 = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
             const img = new Image();
             img.onload = () => resolve({ dataUrl: reader.result, w: img.width, h: img.height });
             img.onerror = () => resolve(null);
             img.src = reader.result;
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Error loading image:", err);
        return null;
      }
    };

    const pecLogo = await loadImgAsBase64('/pec-logo.png');
    const dsLogo = await loadImgAsBase64('/ds%20logo.jpg');

    if (pecLogo) {
      const h = 18;
      const w = (pecLogo.w / pecLogo.h) * h;
      doc.addImage(pecLogo.dataUrl, 'PNG', 14, 8, w, h);
    }
    
    if (dsLogo) {
      const h = 18;
      const w = (dsLogo.w / dsLogo.h) * h;
      doc.addImage(dsLogo.dataUrl, 'JPEG', 283 - w, 8, w, h); // A4 landscape width is ~297mm
    }

    doc.setFontSize(16);
    doc.text(`Registrations for ${viewingRegsFor?.title || 'Event'}`, 14, 32);
    doc.setFontSize(10);
    doc.text(`Total Registered: ${registrationsList.length}`, 14, 38);

    const hasForm = viewingRegsFor?.formFields?.length > 0;
    let head = [];
    let body = [];

    if (hasForm) {
      head = [['#', ...viewingRegsFor.formFields.map(f => f.label), 'Registered At']];
      body = registrationsList.map((r, idx) => {
        const getVal = (f) => {
          if (r.formResponses && r.formResponses[f.id]) return r.formResponses[f.id];
          const l = (f.label || '').toLowerCase();
          if (l.includes('name')) return r.name;
          if (l.includes('email') || l.includes('mail')) return r.email;
          if (l.includes('roll') || l.includes('register')) return r.rollNo;
          if (l.includes('dept') || l.includes('year') || l.includes('department')) return r.deptYear;
          return '';
        };

        const rowData = viewingRegsFor.formFields.map(f => {
           const val = getVal(f) || '';
           return (typeof val === 'string' && val.startsWith('data:')) ? '[File Uploaded in App]' : val;
        });
        return [idx + 1, ...rowData, new Date(r.registeredAt || r.createdAt).toLocaleDateString()];
      });
    } else {
      const allCustomQs = Array.from(new Set(registrationsList.flatMap(r => Object.keys(r.customResponses || {}))));
      head = [['#', 'Name', 'Email', 'Roll No', 'Dept / Year', 'Registered At', ...allCustomQs]];
      body = registrationsList.map((r, idx) => [
        idx + 1,
        r.name || '',
        r.email || '',
        r.rollNo || '',
        r.deptYear || '',
        new Date(r.registeredAt || r.createdAt).toLocaleDateString(),
        ...allCustomQs.map(q => ((r.customResponses && r.customResponses[q]) || ''))
      ]);
    }

    autoTable(doc, {
      startY: 44,
      head: head,
      body: body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 165, 233] },
    });

    doc.save(`${(viewingRegsFor?.title || 'Event').replace(/[^a-z0-9]/gi, '_')}_Registrations.pdf`);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      date: '2026-08-15',
      time: '10:00 AM',
      location: 'Panimalar Engineering College Auditorium',
      description: '',
      imageUrl: 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg',
      status: 'Upcoming',
      customQuestions: [],
      formFields: [],
      regOpenDate: '',
      regCloseDate: '',
      registrationStatus: 'Auto',
      resources: [],
      showResources: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (e) => {
    setEditingId(e._id);
    setFormData({
      title: e.title || '',
      date: e.date || '',
      time: e.time || '10:00 AM',
      location: e.location || 'Panimalar Engineering College Auditorium',
      description: e.description || '',
      imageUrl: e.imageUrl || 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg',
      status: e.status || 'Upcoming',
      customQuestions: e.customQuestions || [],
      formFields: e.formFields || [],
      regOpenDate: e.regOpenDate || '',
      regCloseDate: e.regCloseDate || '',
      registrationStatus: e.registrationStatus || 'Auto',
      resources: e.resources || [],
      showResources: e.showResources !== false
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (ev) => {
    const newStatus = ev.status === 'Completed' ? 'Upcoming' : 'Completed';
    const newRegStatus = newStatus === 'Completed' ? 'Closed' : (ev.registrationStatus || 'Auto');
    try {
      const res = await fetch(`/api/events/${ev._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, registrationStatus: newRegStatus }),
      });
      if (res.ok) {
        setEvents(events.map(item => item._id === ev._id ? { ...item, status: newStatus, registrationStatus: newRegStatus } : item));
      } else {
        alert('Failed to update event status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleToggleRegStatus = async (ev) => {
    const isClosed = ev.registrationStatus === 'Closed';
    const newRegStatus = isClosed ? 'Open' : 'Closed';
    try {
      const res = await fetch(`/api/events/${ev._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationStatus: newRegStatus }),
      });
      if (res.ok) {
        setEvents(events.map(item => item._id === ev._id ? { ...item, registrationStatus: newRegStatus } : item));
      } else {
        alert('Failed to update registration status');
      }
    } catch (err) {
      alert('Error updating registration status: ' + err.message);
    }
  };

  const handleToggleResources = async (ev) => {
    const newShowRes = ev.showResources === false ? true : false;
    try {
      const res = await fetch(`/api/events/${ev._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showResources: newShowRes }),
      });
      if (res.ok) {
        setEvents(events.map(item => item._id === ev._id ? { ...item, showResources: newShowRes } : item));
      } else {
        alert('Failed to update resources visibility');
      }
    } catch (err) {
      alert('Error updating resources visibility: ' + err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSaving(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: reader.result, folder: 'DS_Club_Events' })
          });
          const data = await res.json();
          if (data.url) {
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
          } else {
            alert('Upload failed: ' + (data.error || 'Unknown error'));
          }
        } catch (err) {
          alert('Upload error: ' + err.message);
        } finally {
          setSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResourceUpload = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64 storage
      alert("File is too large (max 2MB). For larger datasets, please use a Google Drive/Kaggle link.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newRes = [...(formData.resources || [])];
      newRes[idx].url = reader.result;
      if (file.type.includes('pdf')) newRes[idx].type = 'PDF';
      else if (file.type.includes('spreadsheet') || file.type.includes('csv')) newRes[idx].type = 'Dataset';
      else newRes[idx].type = 'Document';
      setFormData(prev => ({ ...prev, resources: newRes }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/events/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update event');
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create event');
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => String(e._id) !== String(id)));
      } else {
        alert('Failed to delete event');
      }
    } catch (err) {
      alert('Error deleting event: ' + err.message);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerHeader}>
        <div>
          <h3>Club Events & Hackathons</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Schedule and promote upcoming data science activities.</p>
        </div>

        <button onClick={handleOpenAdd} className={styles.actionBtn}>
          <Plus size={18} />
          <span>Add New Event</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <RefreshCw size={28} className={styles.spinner} />
          <span>Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className={styles.emptyTable}>
          <Calendar size={40} color="#34d399" />
          <h3>No Events Found</h3>
          <p>Click &quot;Add New Event&quot; to schedule an upcoming club hackathon or seminar.</p>
        </div>
      ) : (
        <div className={styles.eventGrid}>
          {events.map((ev) => (
            <div key={ev._id} className={styles.eventAdminCard}>
              <div className={styles.eventImageWrapper}>
                <img
                  src={ev.imageUrl || 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg'}
                  alt={ev.title}
                  className={styles.eventImg}
                  onError={(e) => { e.currentTarget.src = 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg'; }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                  <span style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '2rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: ev.status === 'Completed' ? 'rgba(100, 116, 139, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {ev.status === 'Completed' ? '⚪ COMPLETED' : '🟢 UPCOMING'}
                  </span>
                </div>
              </div>

              <div className={styles.eventAdminInfo}>
                <div className={styles.eventMetaRow}>
                  <span className={styles.eventDateTag}><Calendar size={14} /> {ev.date}</span>
                  <span className={styles.eventTimeTag}><Clock size={14} /> {ev.time}</span>
                </div>
                <h4 className={styles.eventTitle}>{ev.title}</h4>
                <p className={styles.eventLocation}><MapPin size={14} /> {ev.location}</p>
                {(ev.regOpenDate || ev.regCloseDate) && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {ev.regOpenDate && <span>📅 Open: <strong style={{ color: '#38bdf8' }}>{ev.regOpenDate}</strong></span>}
                    {ev.regCloseDate && <span>⏳ Last Date: <strong style={{ color: '#f87171' }}>{ev.regCloseDate}</strong></span>}
                  </div>
                )}
                <p className={styles.eventDesc}>{ev.description}</p>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.1)', background: ev.registrationStatus === 'Closed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}>
                <button
                  onClick={() => handleToggleRegStatus(ev)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: ev.registrationStatus === 'Closed' ? '#f87171' : '#60a5fa',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: '0.2s'
                  }}
                  title="Click to toggle between Registration Open and Closed"
                >
                  <RefreshCw size={15} />
                  <span>{ev.registrationStatus === 'Closed' ? '🔒 Reg: CLOSED (Click to OPEN)' : '🟢 Reg: OPEN (Click to CLOSE)'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.1)', background: ev.showResources === false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(167, 139, 250, 0.15)' }}>
                <button
                  onClick={() => handleToggleResources(ev)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: ev.showResources === false ? '#f87171' : '#a78bfa',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: '0.2s'
                  }}
                  title="Click to toggle Event Resources visibility on public page"
                >
                  <RefreshCw size={15} />
                  <span>{ev.showResources === false ? '🚫 Resources: HIDDEN (Click to SHOW)' : '📎 Resources: VISIBLE (Click to HIDE)'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <button
                  onClick={() => handleViewRegistrations(ev)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#34d399',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: '0.2s'
                  }}
                >
                  <Users size={16} />
                  <span>View Registrations / Responses</span>
                </button>
              </div>

              <div className={styles.eventCardActions}>
                <button
                  onClick={() => handleToggleStatus(ev)}
                  style={{
                    flex: 1.3,
                    padding: '0.85rem 0.5rem',
                    background: 'transparent',
                    border: 'none',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    color: ev.status === 'Completed' ? '#34d399' : '#facc15',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: '0.2s'
                  }}
                  title="Toggle Event Status between Upcoming and Completed"
                >
                  <RefreshCw size={14} />
                  <span>{ev.status === 'Completed' ? 'Make Upcoming' : 'Make Completed'}</span>
                </button>
                <button onClick={() => handleOpenEdit(ev)} className={styles.editBtnFull} style={{ flex: 1 }}>
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(ev._id)} className={styles.deleteBtnFull} style={{ flex: 0.7 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Event */}
      {modalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Edit Club Event' : 'Schedule New Event'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label>Event Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. DATAXSCAPE 2K26 National Hackathon"
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1.2 }}>
                  <label>Status *</label>
                  <select
                    value={formData.status || 'Upcoming'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ fontWeight: 700, color: formData.status === 'Completed' ? '#94a3b8' : '#34d399' }}
                  >
                    <option value="Upcoming">🟢 Upcoming Event</option>
                    <option value="Completed">⚪ Completed Event</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 09:00 AM"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Venue / Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. PEC Auditorium / AI Lab"
                />
              </div>

              <div className={styles.formRow} style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.8rem', borderRadius: '0.6rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div className={styles.formGroup}>
                  <label style={{ color: '#60a5fa', fontSize: '0.82rem' }}>Registration Open Date</label>
                  <input
                    type="date"
                    value={formData.regOpenDate}
                    onChange={(e) => setFormData({ ...formData, regOpenDate: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label style={{ color: '#f87171', fontSize: '0.82rem' }}>Registration Last Date (Deadline)</label>
                  <input
                    type="date"
                    value={formData.regCloseDate}
                    onChange={(e) => setFormData({ ...formData, regCloseDate: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label style={{ color: '#34d399', fontSize: '0.82rem' }}>Registration Status</label>
                  <select
                    value={formData.registrationStatus || 'Auto'}
                    onChange={(e) => setFormData({ ...formData, registrationStatus: e.target.value })}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="Auto">🤖 Auto (Based on Dates)</option>
                    <option value="Open">🟢 Manually Open</option>
                    <option value="Closed">🔴 Manually Closed</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Banner Image (Upload PC File OR Paste URL)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: '#fff',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '0.6rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      margin: 0
                    }}>
                      📁 Upload Banner Image from PC
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    {formData.imageUrl && formData.imageUrl.startsWith('data:image') && (
                      <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>✔️ Custom image ready!</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>Image URL:</span>
                    <input
                      type="text"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Paste image URL (https://... or /Events/...)"
                      style={{ flexGrow: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                    />
                  </div>
                  {formData.imageUrl && (
                    <div style={{ marginTop: '0.25rem', borderRadius: '0.6rem', overflow: 'hidden', maxHeight: '130px', border: '1px solid rgba(255,255,255,0.15)', background: '#000', position: 'relative' }}>
                      <img
                        src={formData.imageUrl}
                        alt="Banner Preview"
                        style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = 'https://res.cloudinary.com/k1046cqe/image/upload/v1790582686/DS_Club_Events/DATAXSCAPE_2K26.jpg'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Event Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about event schedule, speakers, and registration..."
                />
              </div>

              {/* FORM BUILDER SECTION */}
              <div className={styles.formGroup} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: '800' }}>
                  📋 Full Registration Form Builder
                </label>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.75rem' }}>
                  Define all the fields for the registration form. If left empty, a default form (Name, Email, Roll No, Dept) will be used.
                </span>

                {formData.formFields && formData.formFields.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {formData.formFields.map((field, idx) => (
                      <div key={idx} style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...formData.formFields];
                              newFields[idx].label = e.target.value;
                              setFormData({ ...formData, formFields: newFields });
                            }}
                            placeholder="Field Label (e.g. Full Name)"
                            style={{ flex: 2, padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '0.85rem' }}
                          />
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const newFields = [...formData.formFields];
                              newFields[idx].type = e.target.value;
                              setFormData({ ...formData, formFields: newFields });
                            }}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontSize: '0.85rem' }}
                          >
                            <option value="text">Short Text</option>
                            <option value="email">Email</option>
                            <option value="number">Number</option>
                            <option value="tel">Phone</option>
                            <option value="textarea">Long Text</option>
                            <option value="select">Dropdown</option>
                            <option value="file">File Upload</option>
                          </select>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => {
                                const newFields = [...formData.formFields];
                                newFields[idx].required = e.target.checked;
                                setFormData({ ...formData, formFields: newFields });
                              }}
                            />
                            Required
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newFields = formData.formFields.filter((_, i) => i !== idx);
                              setFormData({ ...formData, formFields: newFields });
                            }}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {field.type === 'select' && (
                          <div style={{ marginTop: '0.75rem', paddingLeft: '0.5rem', borderLeft: '2px solid #38bdf8' }}>
                            <input
                              type="text"
                              value={field.options ? field.options.join(',') : ''}
                              onChange={(e) => {
                                const newFields = [...formData.formFields];
                                newFields[idx].options = e.target.value.split(',');
                                setFormData({ ...formData, formFields: newFields });
                              }}
                              placeholder="Comma separated options (e.g. Option 1, Option 2)"
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '0.8rem' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      formFields: [
                        ...(formData.formFields || []),
                        { id: Date.now().toString(), label: '', type: 'text', required: true, options: [] }
                      ]
                    });
                  }}
                  style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', width: '100%' }}
                >
                  <Plus size={16} /> Add Custom Form Field
                </button>
              </div>

              {/* RESOURCES SECTION */}
              <div className={styles.formGroup} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: '800' }}>
                  📎 Event Resources (Datasets, PDFs, Links)
                </label>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.75rem' }}>
                  Add resources for this event. These will appear on the public event card if visible.
                </span>

                {formData.resources && formData.resources.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {formData.resources.map((res, idx) => (
                      <div key={idx} style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <input
                            type="text"
                            value={res.title || ''}
                            onChange={(e) => {
                              const newRes = [...formData.resources];
                              newRes[idx].title = e.target.value;
                              setFormData({ ...formData, resources: newRes });
                            }}
                            placeholder="Resource Title (e.g. Starter Dataset)"
                            style={{ flex: 2, padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '0.85rem' }}
                          />
                          <select
                            value={res.type || 'Dataset'}
                            onChange={(e) => {
                              const newRes = [...formData.resources];
                              newRes[idx].type = e.target.value;
                              setFormData({ ...formData, resources: newRes });
                            }}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', fontSize: '0.85rem' }}
                          >
                            <option value="Dataset">Dataset</option>
                            <option value="PDF">PDF</option>
                            <option value="Document">Document</option>
                            <option value="Link">External Link</option>
                          </select>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: res.isVisible !== false ? '#34d399' : '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>
                            <input
                              type="checkbox"
                              checked={res.isVisible !== false}
                              onChange={(e) => {
                                const newRes = [...formData.resources];
                                newRes[idx].isVisible = e.target.checked;
                                setFormData({ ...formData, resources: newRes });
                              }}
                            />
                            {res.isVisible !== false ? 'Visible' : 'Hidden'}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newRes = formData.resources.filter((_, i) => i !== idx);
                              setFormData({ ...formData, resources: newRes });
                            }}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={res.url || ''}
                            onChange={(e) => {
                              const newRes = [...formData.resources];
                              newRes[idx].url = e.target.value;
                              setFormData({ ...formData, resources: newRes });
                            }}
                            placeholder="Enter Google Drive / Kaggle link..."
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '0.8rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>OR</span>
                          <label style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Upload File (Max 2MB)
                            <input type="file" onChange={(e) => handleResourceUpload(idx, e)} style={{ display: 'none' }} />
                          </label>
                        </div>
                        {res.url && res.url.startsWith('data:') && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#34d399' }}>✓ File uploaded and ready</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      resources: [
                        ...(formData.resources || []),
                        { title: '', type: 'Dataset', url: '', isVisible: true }
                      ]
                    });
                  }}
                  style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.4)', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', width: '100%' }}
                >
                  <Plus size={16} /> Add Resource
                </button>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : editingId ? 'Update Event' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATIONS VIEWER MODAL */}
      {viewingRegsFor && (
        <div className={styles.modalOverlay} style={{ zIndex: 10000 }}>
          <div className={styles.modalContent} style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  👥 EVENT REGISTRATIONS LOG
                </span>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>{viewingRegsFor.title}</h3>
              </div>
              <button onClick={() => setViewingRegsFor(null)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.4rem 1rem', borderRadius: '2rem', fontWeight: 800, fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    Total Registered: {registrationsList.length}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={handleExportCSV}
                    disabled={!registrationsList.length}
                    style={{
                      background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
                      color: '#fff', padding: '0.55rem 1.25rem', borderRadius: '0.6rem',
                      fontWeight: 700, border: 'none', cursor: registrationsList.length ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
                      opacity: registrationsList.length ? 1 : 0.5, boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                    }}
                  >
                    <Download size={16} /> Export CSV (Excel)
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={!registrationsList.length}
                    style={{
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                      color: '#fff', padding: '0.55rem 1.25rem', borderRadius: '0.6rem',
                      fontWeight: 700, border: 'none', cursor: registrationsList.length ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
                      opacity: registrationsList.length ? 1 : 0.5, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <FileText size={16} /> Export PDF
                  </button>
                </div>
              </div>

              {loadingRegs ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading registrations...</div>
              ) : registrationsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Users size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>No Registrations Yet</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                    When students register for this event on the website, their responses will appear right here!
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8' }}>
                        <th style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>#</th>
                        {viewingRegsFor?.formFields?.length > 0 ? (
                          viewingRegsFor.formFields.map(f => (
                            <th key={f.id} style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{f.label}</th>
                          ))
                        ) : (
                          <>
                            <th style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>Student Name</th>
                            <th style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>Email Address</th>
                            <th style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>Roll Number</th>
                            <th style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>Dept & Year</th>
                            <th style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>Custom Answers</th>
                          </>
                        )}
                        <th style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrationsList.map((reg, idx) => {
                        const hasForm = viewingRegsFor?.formFields?.length > 0;

                        // Fallback logic if reg was submitted before custom fields were introduced
                        const getVal = (f) => {
                          if (reg.formResponses && reg.formResponses[f.id]) return reg.formResponses[f.id];
                          const l = (f.label || '').toLowerCase();
                          if (l.includes('name')) return reg.name;
                          if (l.includes('email') || l.includes('mail')) return reg.email;
                          if (l.includes('roll') || l.includes('register')) return reg.rollNo;
                          if (l.includes('dept') || l.includes('year') || l.includes('department')) return reg.deptYear;
                          return null;
                        };

                        return (
                          <tr key={reg._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.8rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                            
                            {hasForm ? (
                              viewingRegsFor.formFields.map(f => {
                                const v = getVal(f);
                                return (
                                  <td key={f.id} style={{ padding: '0.8rem 1rem', color: '#cbd5e1' }}>
                                    {typeof v === 'string' && v.startsWith('data:') ? (
                                      <a href={v} download={`${f.label}-file`} style={{ color: '#34d399', textDecoration: 'underline' }}>Download File</a>
                                    ) : (
                                      v || <span style={{ color: '#64748b', fontStyle: 'italic' }}>-</span>
                                    )}
                                  </td>
                                );
                              })
                            ) : (
                              <>
                                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#fff' }}>{reg.name || <span style={{ color: '#64748b', fontStyle: 'italic' }}>-</span>}</td>
                                <td style={{ padding: '0.8rem 1rem', color: '#cbd5e1' }}>{reg.email || <span style={{ color: '#64748b', fontStyle: 'italic' }}>-</span>}</td>
                                <td style={{ padding: '0.8rem 1rem', color: '#a855f7', fontWeight: 600 }}>{reg.rollNo || <span style={{ color: '#64748b', fontStyle: 'italic' }}>-</span>}</td>
                                <td style={{ padding: '0.8rem 1rem', color: '#cbd5e1' }}>{reg.deptYear || <span style={{ color: '#64748b', fontStyle: 'italic' }}>-</span>}</td>
                                <td style={{ padding: '0.8rem 1rem', color: '#cbd5e1' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {reg.customResponses && Object.entries(reg.customResponses).map(([k, v], i) => (
                                      <span key={`c-${i}`} style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>
                                        <strong style={{ color: '#38bdf8' }}>{k}:</strong> {v}
                                      </span>
                                    ))}
                                    {(!reg.customResponses || Object.keys(reg.customResponses).length === 0) && (
                                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>None</span>
                                    )}
                                  </div>
                                </td>
                              </>
                            )}

                            <td style={{ padding: '0.8rem 1rem', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {new Date(reg.registeredAt || reg.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setViewingRegsFor(null)} className={styles.saveBtn} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
