"use client";

import { useState, useEffect } from 'react';
import { Zap, Plus, Edit2, Trash2, Code2, HelpCircle, RefreshCw, X, PlusCircle, MinusCircle, CheckCircle2, Eye, EyeOff, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../Admin.module.css';

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'code', // 'code' | 'quiz'
    difficulty: 'Medium',
    points: 50,
    isHidden: false,
    codeDetails: {
      problemStatement: '',
      sampleInput: '',
      sampleOutput: ''
    },
    quizQuestions: [
      {
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0
      }
    ]
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/challenges?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.challenges || []);
      setChallenges(list);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      type: 'code',
      difficulty: 'Medium',
      points: 50,
      isHidden: false,
      codeDetails: {
        problemStatement: '',
        sampleInput: '',
        sampleOutput: '',
        testCases: [
          { input: '', expectedOutput: '', isHidden: false }
        ]
      },
      quizQuestions: [
        {
          prompt: '',
          options: ['', '', '', ''],
          correctIndex: 0
        }
      ]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      title: c.title || '',
      description: c.description || '',
      type: c.type || 'code',
      difficulty: c.difficulty || 'Medium',
      points: c.points || 50,
      isHidden: c.isHidden || false,
      codeDetails: {
        problemStatement: c.codeDetails?.problemStatement || '',
        sampleInput: c.codeDetails?.sampleInput || '',
        sampleOutput: c.codeDetails?.sampleOutput || '',
        testCases: c.codeDetails?.testCases?.length ? c.codeDetails.testCases : [
          { input: c.codeDetails?.sampleInput || '', expectedOutput: c.codeDetails?.sampleOutput || '', isHidden: false }
        ]
      },
      quizQuestions: c.quizQuestions?.length ? c.quizQuestions : [
        {
          prompt: '',
          options: ['', '', '', ''],
          correctIndex: 0
        }
      ]
    });
    setModalOpen(true);
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      quizQuestions: [
        ...formData.quizQuestions,
        { prompt: '', options: ['', '', '', ''], correctIndex: 0 }
      ]
    });
  };

  const handleRemoveQuestion = (idx) => {
    if (formData.quizQuestions.length <= 1) return;
    const updated = formData.quizQuestions.filter((_, i) => i !== idx);
    setFormData({ ...formData, quizQuestions: updated });
  };

  const handleQuestionChange = (idx, field, val) => {
    const updated = [...formData.quizQuestions];
    updated[idx][field] = val;
    setFormData({ ...formData, quizQuestions: updated });
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updated = [...formData.quizQuestions];
    updated[qIdx].options[optIdx] = val;
    setFormData({ ...formData, quizQuestions: updated });
  };

  const handleAddTestCase = () => {
    setFormData({
      ...formData,
      codeDetails: {
        ...formData.codeDetails,
        testCases: [
          ...(formData.codeDetails.testCases || []),
          { input: '', expectedOutput: '', isHidden: false }
        ]
      }
    });
  };

  const handleRemoveTestCase = (idx) => {
    const updated = (formData.codeDetails.testCases || []).filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      codeDetails: { ...formData.codeDetails, testCases: updated }
    });
  };

  const handleTestCaseChange = (idx, field, val) => {
    const updated = [...(formData.codeDetails.testCases || [])];
    updated[idx][field] = val;
    setFormData({
      ...formData,
      codeDetails: { ...formData.codeDetails, testCases: updated }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        codeDetails: formData.type === 'code' ? formData.codeDetails : {},
        quizQuestions: formData.type === 'quiz' ? formData.quizQuestions.filter(q => q && q.prompt && q.prompt.trim() !== '') : []
      };

      if (editingId) {
        const res = await fetch(`/api/challenges/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to update challenge');
        }
      } else {
        const res = await fetch('/api/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to create challenge');
        }
      }
      setModalOpen(false);
      fetchChallenges();
      setSuccessPopup({
        title: editingId ? 'Challenge Updated!' : 'Challenge Published!',
        message: editingId
          ? 'Your modifications have been updated in the Competition Library.'
          : 'Your new challenge has been created and is now live on the Competition Portal!'
      });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    try {
      const res = await fetch(`/api/challenges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChallenges(challenges.filter(c => String(c._id) !== String(id)));
      } else {
        alert('Failed to delete challenge');
      }
    } catch (err) {
      alert('Error deleting challenge: ' + err.message);
    }
  };

  const handleToggleVisibility = async (c) => {
    try {
      const newStatus = !c.isHidden;
      // Optimistic update for immediate UI response
      setChallenges(challenges.map(ch => String(ch._id) === String(c._id) ? { ...ch, isHidden: newStatus } : ch));

      const res = await fetch(`/api/challenges/${c._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: newStatus })
      });
      if (!res.ok) {
        alert('Failed to update challenge visibility on server');
        fetchChallenges(); // revert on failure
      }
    } catch (err) {
      alert('Error toggling visibility: ' + err.message);
      fetchChallenges();
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    if (!c) return false;
    if (filterType !== 'All' && (c.type || '').toLowerCase() !== filterType.toLowerCase()) return false;
    if (filterDifficulty !== 'All' && (c.difficulty || '').toLowerCase() !== filterDifficulty.toLowerCase()) return false;
    return true;
  });

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerHeader}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div>
            <h3>COMPETITION LIBRARY</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Create coding problems and interactive quizzes for students.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TYPE</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #334155', color: '#fff', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="All">All</option>
                <option value="Code">Code</option>
                <option value="Quiz">Quiz</option>
                <option value="TSP">TSP</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>DIFFICULTY</label>
              <select 
                value={filterDifficulty} 
                onChange={(e) => setFilterDifficulty(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #334155', color: '#fff', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleOpenAdd} className={styles.actionBtn}>
          <Plus size={18} />
          <span>Add New Challenge</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>
          <RefreshCw size={28} className={styles.spinner} />
          <span>Loading challenges...</span>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className={styles.emptyTable}>
          <Zap size={40} color="#facc15" />
          <h3>No Challenges Found</h3>
          <p>Click &quot;Add New Challenge&quot; to create a Code Challenge or an Interactive Quiz.</p>
        </div>
      ) : (
        <div className={styles.cardsList}>
          {filteredChallenges.map((c) => (
            <div key={c._id} className={styles.challengeRowCard} style={{ borderLeft: c.isHidden ? '4px solid #ef4444' : '4px solid #10b981' }}>
              <div className={styles.challengeRowInfo}>
                <span className={`${styles.typeBadge} ${c.type === 'code' ? styles.codeType : styles.quizType}`}>
                  {c.type === 'code' ? <Code2 size={16} /> : <HelpCircle size={16} />}
                  {c.type === 'code' ? 'Code Challenge' : 'Quiz Challenge'}
                </span>
                <span className={`${styles.difficultyTag} ${styles[c.difficulty?.toLowerCase() || 'medium']}`}>
                  {c.difficulty || 'Medium'} • {c.points || 50} Points
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    background: c.isHidden ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: c.isHidden ? '#ef4444' : '#10b981',
                    border: `1px solid ${c.isHidden ? '#ef4444' : '#10b981'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  {c.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  {c.isHidden ? '🔴 Hidden Question' : '🟢 Published'}
                </span>
                <h4 className={styles.challengeTitle}>{c.title}</h4>
                <p className={styles.challengeDesc}>{c.description}</p>
              </div>

              <div className={styles.rowActions}>
                <button
                  onClick={() => handleToggleVisibility(c)}
                  className={styles.editBtn}
                  style={{
                    background: c.isHidden ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    borderColor: c.isHidden ? '#ef4444' : '#10b981',
                    color: c.isHidden ? '#ef4444' : '#10b981',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                  title={c.isHidden ? "Click to Show / Publish question" : "Click to Hide question from practice library"}
                >
                  {c.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{c.isHidden ? 'Show Question' : 'Hide Question'}</span>
                </button>
                <button onClick={() => handleOpenEdit(c)} className={styles.editBtn} title="Edit Challenge">
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(c._id)} className={styles.deleteBtn} title="Delete Challenge">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Challenge */}
      <AnimatePresence>
        {modalOpen && (
          <div key="modal-challenge-form-overlay" className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={styles.modalCardLarge}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>{editingId ? 'Edit Challenge' : 'Create New Challenge'}</h3>
                <button onClick={() => setModalOpen(false)} className={styles.modalCloseBtn}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.typeSelector}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'code' })}
                    className={`${styles.typeBtn} ${formData.type === 'code' ? styles.typeBtnActive : ''}`}
                  >
                    <Code2 size={20} />
                    <span>Code Challenge</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'quiz' })}
                    className={`${styles.typeBtn} ${formData.type === 'quiz' ? styles.typeBtnActive : ''}`}
                  >
                    <HelpCircle size={20} />
                    <span>Quiz Challenge</span>
                  </button>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <label>Challenge Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Two Sum Data Structure Problem"
                    />
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Points Awarded</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                      min={10}
                      max={500}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1.2 }}>
                    <label>Question Visibility</label>
                    <select
                      value={formData.isHidden ? 'hidden' : 'published'}
                      onChange={(e) => setFormData({ ...formData, isHidden: e.target.value === 'hidden' })}
                    >
                      <option value="published">🟢 Published (Show)</option>
                      <option value="hidden">🔴 Hidden (Hide Question)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Brief Description *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Summary of the challenge for the preview card..."
                  />
                </div>

                {formData.type === 'code' ? (
                  <div className={styles.codeBuilder}>
                    <h4>Code Problem Details</h4>
                    <div className={styles.formGroup}>
                      <label>Full Problem Statement</label>
                      <textarea
                        rows={4}
                        value={formData.codeDetails.problemStatement}
                        onChange={(e) => setFormData({
                          ...formData,
                          codeDetails: { ...formData.codeDetails, problemStatement: e.target.value }
                        })}
                        placeholder="Detailed explanation of requirements, constraints, and hints..."
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Sample Input</label>
                        <input
                          type="text"
                          value={formData.codeDetails.sampleInput}
                          onChange={(e) => setFormData({
                            ...formData,
                            codeDetails: { ...formData.codeDetails, sampleInput: e.target.value }
                          })}
                          placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Sample Output</label>
                        <input
                          type="text"
                          value={formData.codeDetails.sampleOutput}
                          onChange={(e) => setFormData({
                            ...formData,
                            codeDetails: { ...formData.codeDetails, sampleOutput: e.target.value }
                          })}
                          placeholder="e.g. [0, 1]"
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ margin: 0, color: '#60a5fa', fontSize: '0.95rem' }}>Automated Test Cases</h4>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Add test cases to be evaluated when members compile & submit</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTestCase}
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid #3b82f6',
                            color: '#60a5fa',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}
                        >
                          <PlusCircle size={14} /> Add Test Case
                        </button>
                      </div>

                      {(formData.codeDetails.testCases || []).map((tc, idx) => (
                        <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>Test Case #{idx + 1}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer', margin: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={tc.isHidden || false}
                                  onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                                />
                                Hidden Test Case (Only tested on Submit)
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveTestCase(idx)}
                                style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                                title="Remove test case"
                              >
                                <MinusCircle size={16} />
                              </button>
                            </div>
                          </div>
                          <div className={styles.formRow} style={{ gap: '1rem', marginBottom: 0 }}>
                            <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Input</label>
                              <input
                                type="text"
                                value={tc.input || ''}
                                onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                                placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
                                style={{ marginBottom: 0 }}
                              />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Expected Output</label>
                              <input
                                type="text"
                                value={tc.expectedOutput || ''}
                                onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                placeholder="e.g. [0, 1]"
                                style={{ marginBottom: 0 }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.quizBuilder}>
                    <div className={styles.quizBuilderHeader}>
                      <h4>Multiple Choice Questions</h4>
                      <button type="button" onClick={handleAddQuestion} className={styles.addQBtn}>
                        <PlusCircle size={16} />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {formData.quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className={styles.questionEditorCard}>
                        <div className={styles.qCardHeader}>
                          <span>Question #{qIdx + 1}</span>
                          {formData.quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className={styles.removeQBtn}
                            >
                              <MinusCircle size={16} />
                            </button>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <input
                            type="text"
                            required
                            placeholder="Enter question prompt..."
                            value={q.prompt}
                            onChange={(e) => handleQuestionChange(qIdx, 'prompt', e.target.value)}
                          />
                        </div>

                        <div className={styles.optionsGrid}>
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={styles.optionInputRow}>
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={q.correctIndex === oIdx}
                                onChange={() => handleQuestionChange(qIdx, 'correctIndex', oIdx)}
                                title="Mark as correct answer"
                              />
                              <input
                                type="text"
                                required
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                        <span className={styles.correctHint}>Select the radio button next to the correct option.</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className={styles.saveBtn}>
                    {saving ? 'Saving...' : editingId ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup Window */}
      <AnimatePresence>
        {successPopup && (
          <div key="modal-challenge-success-overlay" className={styles.modalOverlay} style={{ zIndex: 1000 }} onClick={() => setSuccessPopup(null)}>
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
                Awesome, Got It!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
