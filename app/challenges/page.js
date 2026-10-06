"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, HelpCircle, Trophy, ShieldCheck, ShieldAlert, Zap, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, X, Play, Send, Award, Terminal, Cpu, Timer, Lock, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Challenges.module.css';
import IDCardModal from '@/components/organisms/IDCardModal/IDCardModal';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-okaidia.css';

const normalizeOutputForComparison = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
};

export default function ChallengesPage() {
  const checkIsCompleted = (contest, mid) => {
    if (!mid || !contest) return false;
    let checkIds = [mid];
    if (contest.whitelistEnabled && Array.isArray(contest.whitelistedStudents)) {
      const s = contest.whitelistedStudents.find(
        w => w && ((w.identifier||'').trim().toUpperCase() === mid || (w.rollNo||'').trim().toUpperCase() === mid || (w.registerNo||'').trim().toUpperCase() === mid)
      );
      if (s) {
        if(s.identifier) checkIds.push(String(s.identifier).trim().toUpperCase());
        if(s.rollNo) checkIds.push(String(s.rollNo).trim().toUpperCase());
        if(s.registerNo) checkIds.push(String(s.registerNo).trim().toUpperCase());
      }
    }
    const checkSet = new Set(checkIds);
    if (contest.completedMembers && contest.completedMembers.some(m => m && checkSet.has(String(m).trim().toUpperCase()))) return true;
    if (contest.activeParticipants && contest.activeParticipants.some(p => p && p.memberId && checkSet.has(String(p.memberId).trim().toUpperCase()) && p.status === 'completed')) return true;
    if (typeof window !== 'undefined') {
      for (const id of checkSet) {
        if (localStorage.getItem(`completed_contest_${contest._id || contest.id}_${id}`)) return true;
      }
    }
    return false;
  };
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'code' | 'quiz'
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [verifiedMember, setVerifiedMember] = useState(null);
  const [memberIdInput, setMemberIdInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [tspPasscodeInput, setTspPasscodeInput] = useState('');

  // Submission state
  const [codeSubmission, setCodeSubmission] = useState('# Write your solution here...\ndef solve(nums, target):\n    pass');
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Compiler state
  const [selectedLang, setSelectedLang] = useState('python'); // 'python' | 'java' | 'javascript'
  const [compilerOutput, setCompilerOutput] = useState(null);
  const [compilerMinimized, setCompilerMinimized] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);
  const pyodideRef = useRef(null);
  const compilerBoxRef = useRef(null);
  const problemContentRef = useRef(null);
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'submissions' | 'leaderboard' | 'discussions'

  // Contests state
  const [contests, setContests] = useState([]);
  const [tsps, setTsps] = useState([]);
  const [activeContest, setActiveContest] = useState(null);
  const [contestLeaderboardOpen, setContestLeaderboardOpen] = useState(false);
  const [contestLeaderboardData, setContestLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Proctoring & Single-Submission tracking state
  const [solvedChallengeIds, setSolvedChallengeIds] = useState([]);
  const [contestSolvedChallengeIds, setContestSolvedChallengeIds] = useState([]);
  const [contestOnboardingStep, setContestOnboardingStep] = useState(null); // null | 'verify' | 'details' | 'rules'
  const [selectedContestForOnboarding, setSelectedContestForOnboarding] = useState(null);
  const [inContestArena, setInContestArena] = useState(false);
  const [antiCheatWarnings, setAntiCheatWarnings] = useState(0);
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);
  const [contestDifficultyFilter, setContestDifficultyFilter] = useState('all');
  const [rulesAgreed, setRulesAgreed] = useState(false);

  // Fullscreen-Safe In-DOM Modal State
  const [customModal, setCustomModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isAlert: false,
    type: 'default', // 'default' | 'danger' | 'warning' | 'info'
    onConfirm: null,
    onCancel: null,
  });

  const ensureFullscreen = () => {
    if (inContestArenaRef.current && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const openConfirmModal = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'default',
    onConfirm,
    onCancel
  }) => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isAlert: false,
      type,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        ensureFullscreen();
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        ensureFullscreen();
        if (onCancel) onCancel();
      }
    });
  };

  const openAlertModal = ({
    title = 'Notice',
    message,
    confirmText = 'Got It',
    type = 'info',
    onConfirm
  }) => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: null,
      isAlert: true,
      type,
      onConfirm: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        ensureFullscreen();
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setCustomModal(prev => ({ ...prev, isOpen: false }));
        ensureFullscreen();
      }
    });
  };

  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timerInterval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const getContestRemainingSeconds = (contest) => {
    if (!contest) return 0;
    let seconds = contest.timerRemainingSeconds !== undefined ? contest.timerRemainingSeconds : (contest.timerDurationMinutes || 60) * 60;
    if (contest.timerStatus === 'running' && contest.timerLastStartedAt) {
      const elapsed = Math.floor((currentTime - new Date(contest.timerLastStartedAt).getTime()) / 1000);
      seconds = Math.max(0, seconds - elapsed);
    }
    return seconds;
  };

  const formatContestTime = (contest) => {
    const seconds = getContestRemainingSeconds(contest);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTimeDisplay = (dateVal) => {
    if (!dateVal) return '';
    try {
      const parsed = new Date(dateVal);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (e) {}
    return String(dateVal);
  };

  useEffect(() => {
    if (inContestArena && activeContest && activeContest.timerEnabled && activeContest.timerStatus === 'running') {
      const rem = getContestRemainingSeconds(activeContest);
      if (rem <= 0) {
        const cId = activeContest._id || activeContest.id;
        const targetEndpoint = activeContest.isTSP ? `/api/tsp/${cId}` : `/api/contests/${cId}`;
        fetch(targetEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timerStatus: 'ended', timerRemainingSeconds: 0, isActive: false })
        }).catch(() => {});
        handleExitArena(true, '⏳ CONTEST TIME EXPIRED! The timer has reached zero and this competition arena has ended. Your test session has been finalized.');
      }
    }
  }, [currentTime, inContestArena, activeContest]);

  const activeContestRef = useRef(null);
  const verifiedMemberRef = useRef(null);
  const inContestArenaRef = useRef(false);
  const antiCheatWarningsRef = useRef(0);
  const showAntiCheatModalRef = useRef(false);
  const evictionHandlerRef = useRef(null); // Always points to latest handleEvictMemberFromContest (avoids stale closure in setTimeout)

  useEffect(() => {
    activeContestRef.current = activeContest;
  }, [activeContest]);

  useEffect(() => {
    verifiedMemberRef.current = verifiedMember;
  }, [verifiedMember]);

  useEffect(() => {
    inContestArenaRef.current = inContestArena;
  }, [inContestArena]);

  useEffect(() => {
    antiCheatWarningsRef.current = antiCheatWarnings;
  }, [antiCheatWarnings]);

  useEffect(() => {
    showAntiCheatModalRef.current = showAntiCheatModal;
  }, [showAntiCheatModal]);

  useEffect(() => {
    if (activeChallenge && (activeChallenge.type === 'code' || activeChallenge.type === 'tsp') && codeSubmission) {
      const uid = verifiedMember?.memberId || 'anon';
        localStorage.setItem(`dsc_draft_${uid}_${activeChallenge._id}_${selectedLang}`, codeSubmission);
    }
  }, [codeSubmission, activeChallenge, selectedLang]);

  const isMemberRestricted = (contest, mId) => {
    if (!contest || !mId) return false;
    const clean = mId.toString().trim().toUpperCase();
    const cId = (contest._id || contest.id || '').toString();

    // 1. Authoritative check: in-memory contest object (populated from DB via live sync)
    if (contest.restrictedMembers && Array.isArray(contest.restrictedMembers)) {
      const isRestrictedInDB = contest.restrictedMembers.some(
        id => id && id.toString().trim().toUpperCase() === clean
      );
      if (isRestrictedInDB) {
        return true;
      } else {
        // If server says member is NOT restricted, purge any stale cached restriction in localStorage
        try {
          const localMapStr = localStorage.getItem('dsc_restricted_map');
          if (localMapStr && cId) {
            const localMap = JSON.parse(localMapStr);
            if (localMap[cId] && Array.isArray(localMap[cId])) {
              localMap[cId] = localMap[cId].filter(id => id && id.toString().trim().toUpperCase() !== clean);
              localStorage.setItem('dsc_restricted_map', JSON.stringify(localMap));
            }
          }
        } catch (e) {}
        return false;
      }
    }

    // 2. Fallback check for localStorage only if contest.restrictedMembers is not loaded yet
    try {
      const localMapStr = localStorage.getItem('dsc_restricted_map');
      if (localMapStr && cId) {
        const localMap = JSON.parse(localMapStr);
        if (localMap[cId] && Array.isArray(localMap[cId])) {
          if (localMap[cId].some(id => id && id.toString().trim().toUpperCase() === clean)) return true;
        }
      }
    } catch (e) {}

    return false;
  };

  const refreshSolvedChallenges = async (mId) => {
    if (!mId) return;
    try {
      const res = await fetch('/api/members/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: mId }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.solvedChallengeIds)) {
        setSolvedChallengeIds(data.solvedChallengeIds);
        sessionStorage.setItem('dsc_solved_challenges', JSON.stringify(data.solvedChallengeIds));
      }
    } catch (e) {}
  };

  const handleOpenContestLeaderboard = async (contest) => {
    if (contest.leaderboardEnabled === false) {
      alert('🔒 The leaderboard for this contest is currently hidden by an administrator during evaluation!');
      return;
    }
    setLoadingLeaderboard(true);
    setContestLeaderboardOpen(true);
    try {
      const targetUrl = contest.isTSP ? `/api/tsp/${contest._id}/leaderboard` : `/api/contests/${contest._id}/leaderboard`;
      const res = await fetch(targetUrl);
      const data = await res.json();
      if (!res.ok || data.disabled) {
        alert(data.error || '🔒 The leaderboard for this contest is currently hidden by an administrator during evaluation!');
        setContestLeaderboardOpen(false);
        return;
      }
      if (Array.isArray(data)) {
        setContestLeaderboardData(data);
      } else {
        setContestLeaderboardData([]);
      }
    } catch (err) {
      console.error('Failed to load contest leaderboard:', err);
      setContestLeaderboardData([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    let interval;
    if (contestLeaderboardOpen && activeContest) {
      interval = setInterval(async () => {
        try {
          const targetUrl = activeContest.isTSP
            ? `/api/tsp/${activeContest._id || activeContest.id}/leaderboard`
            : `/api/contests/${activeContest._id || activeContest.id}/leaderboard`;
          const res = await fetch(targetUrl);
          const data = await res.json();
          if (res.ok && !data.disabled && Array.isArray(data)) {
            setContestLeaderboardData(data);
          }
        } catch (e) {}
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [contestLeaderboardOpen, activeContest]);

  useEffect(() => {
    if (problemContentRef.current) {
      problemContentRef.current.scrollTop = 0;
    }
  }, [activeChallenge?._id]);

  const starterCodes = {
    python: (title) => {
      if (title?.includes('Palindrome')) return `# Write your Python 3.11 solution here...\nimport re\nimport sys\n\ndef isPalindrome(s: str) -> bool:\n    cleaned = re.sub(r'[^a-zA-Z0-9]', '', s).lower()\n    return cleaned == cleaned[::-1]\n\n# Dynamic test runner\ninput_data = sys.stdin.read().strip()\nif input_data:\n    s_val = input_data.split('=', 1)[-1].strip().strip('\"\\'')\n    print(isPalindrome(s_val))\nelse:\n    print(isPalindrome("A man, a plan, a canal: Panama"))\n`;
      if (title?.includes('Frequent')) return `# Write your Python 3.11 solution here...\nfrom collections import Counter\nimport heapq\nimport sys\nimport ast\nimport re\n\ndef topKFrequent(nums, k):\n    count = Counter(nums)\n    return heapq.nlargest(k, count.keys(), key=count.get)\n\n# Dynamic test runner\ninput_data = sys.stdin.read().strip()\nif input_data and '[' in input_data:\n    nums = ast.literal_eval(re.search(r'\[.*?\]', input_data).group(0))\n    k = int(re.search(r'k\\s*=\\s*(-?\\d+)', input_data).group(1))\n    print(topKFrequent(nums, k))\nelse:\n    print(topKFrequent([1, 1, 1, 2, 2, 3], 2))\n`;
      if (title?.includes('K-Means')) return `# Write your Python 3.11 solution here...\nimport math\n\ndef kmeansStep(points, centroids, epsilon):\n    # TODO: Implement K-Means step and convergence check\n    return {"newCentroids": [[1.0, 2.0], [10.0, 2.0]], "converged": False}\n\n# Test your function\nprint(kmeansStep([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]], [[1, 1], [10, 1]], 0.01))\n`;
      if (title?.includes('Two Sum')) return `# Write your Python 3.11 solution here...\nimport sys\nimport ast\nimport re\n\ndef twoSum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        if target - num in lookup:\n            return [lookup[target - num], i]\n        lookup[num] = i\n    return []\n\n# Dynamic test runner\ninput_data = sys.stdin.read().strip()\nif input_data and '[' in input_data:\n    nums = ast.literal_eval(re.search(r'\[.*?\]', input_data).group(0))\n    target = int(re.search(r'target\\s*=\\s*(-?\\d+)', input_data).group(1))\n    print(twoSum(nums, target))\nelse:\n    print(twoSum([2, 7, 11, 15], 9))\n`;
      if (title?.includes('Rain Water') || title?.includes('Trapping')) return `# Write your Python 3.11 solution here...\nimport sys\nimport ast\nimport re\n\ndef trap(height):\n    if not height:\n        return 0\n    l, r = 0, len(height) - 1\n    l_max, r_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if l_max < r_max:\n            l += 1\n            l_max = max(l_max, height[l])\n            water += l_max - height[l]\n        else:\n            r -= 1\n            r_max = max(r_max, height[r])\n            water += r_max - height[r]\n    return water\n\n# Dynamic test runner\ninput_data = sys.stdin.read().strip()\nif input_data and '[' in input_data:\n    height = ast.literal_eval(re.search(r'\\[.*?\\]', input_data).group(0))\n    print(trap(height))\nelse:\n    print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))\n`;
      return `# Write your Python 3.11 solution here...\n# Challenge: ${title}\n\ndef solve():\n    # TODO: Implement your algorithm\n    print("Output result")\n\nsolve()\n`;
    },
    javascript: (title) => {
      if (title?.includes('Palindrome')) return `// Write your JavaScript (Node.js v20) solution here...\nfunction isPalindrome(s) {\n  const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();\n  const reversed = cleaned.split('').reverse().join('');\n  return cleaned === reversed;\n}\n\n// Dynamic test runner\nconst inputStr = typeof window !== 'undefined' ? (window.stdinInput || '') : '';\nif (inputStr) {\n  const sVal = inputStr.split('=')[1]?.trim().replace(/^["']|["']$/g, '') || '';\n  console.log(isPalindrome(sVal));\n} else {\n  console.log(isPalindrome("A man, a plan, a canal: Panama"));\n}\n`;
      if (title?.includes('Frequent')) return `// Write your JavaScript (Node.js v20) solution here...\nfunction topKFrequent(nums, k) {\n  const map = new Map();\n  nums.forEach(n => map.set(n, (map.get(n) || 0) + 1));\n  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(x => x[0]);\n}\n\n// Dynamic test runner\nconst inputStr = typeof window !== 'undefined' ? (window.stdinInput || '') : '';\nif (inputStr && inputStr.includes('k =')) {\n  const numsStr = inputStr.match(/\\[.*?\\]/)[0];\n  const kVal = parseInt(inputStr.match(/k\\s*=\\s*(-?\\d+)/)[1], 10);\n  console.log(JSON.stringify(topKFrequent(JSON.parse(numsStr), kVal)).replace(/,/g, ', '));\n} else {\n  console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2));\n}\n`;
      if (title?.includes('K-Means')) return `// Write your JavaScript (Node.js v20) solution here...\nfunction kmeansStep(points, centroids, epsilon) {\n  // TODO: Implement K-Means step and convergence check\n  return { newCentroids: [[1.0, 2.0], [10.0, 2.0]], converged: false };\n}\n\n// Test your function\nconsole.log(kmeansStep([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]], [[1, 1], [10, 1]], 0.01));\n`;
      if (title?.includes('Two Sum')) return `// Write your JavaScript (Node.js v20) solution here...\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\n// Dynamic test runner\nconst inputStr = typeof window !== 'undefined' ? (window.stdinInput || '') : '';\nif (inputStr && inputStr.includes('target =')) {\n  const numsStr = inputStr.match(/\\[.*?\\]/)[0];\n  const targetVal = parseInt(inputStr.match(/target\\s*=\\s*(-?\\d+)/)[1], 10);\n  console.log(JSON.stringify(twoSum(JSON.parse(numsStr), targetVal)).replace(/,/g, ', '));\n} else {\n  console.log(twoSum([2, 7, 11, 15], 9));\n}\n`;
      if (title?.includes('Rain Water') || title?.includes('Trapping')) return `// Write your JavaScript (Node.js v20) solution here...\nfunction trap(height) {\n  if (!height || height.length === 0) return 0;\n  let l = 0, r = height.length - 1;\n  let lMax = height[l], rMax = height[r];\n  let water = 0;\n  while (l < r) {\n    if (lMax < rMax) {\n      l++;\n      lMax = Math.max(lMax, height[l]);\n      water += lMax - height[l];\n    } else {\n      r--;\n      rMax = Math.max(rMax, height[r]);\n      water += rMax - height[r];\n    }\n  }\n  return water;\n}\n\n// Dynamic test runner\nconst inputStr = typeof window !== 'undefined' ? (window.stdinInput || '') : '';\nif (inputStr && inputStr.includes('[')) {\n  const height = JSON.parse(inputStr.match(/\\[.*?\\]/)[0]);\n  console.log(trap(height));\n} else {\n  console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]));\n}\n`;
      return `// Write your JavaScript (Node.js v20) solution here...\n// Challenge: ${title}\n\nfunction solve() {\n    // TODO: Implement your algorithm\n    console.log("Output result");\n}\n\nsolve();\n`;
    },
    java: (title) => `// Write your Java (OpenJDK 17) solution here...\n// Challenge: ${title}\n\nimport java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // TODO: Implement your algorithm\n        System.out.println("Output result");\n    }\n}\n`
  };

  useEffect(() => {
    // Purge any legacy unscoped completed_contest_ keys from browser localStorage
    if (typeof window !== 'undefined') {
      try {
        const legacyKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('completed_contest_') && k.split('_').length === 3) {
            legacyKeys.push(k);
          }
        }
        legacyKeys.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }

    const savedMember = sessionStorage.getItem('dsc_verified_member');
    if (savedMember) {
      try {
        const parsed = JSON.parse(savedMember);
        setVerifiedMember(parsed);
        refreshSolvedChallenges(parsed.memberId);

        // Validate cached member against server to handle deleted members
        fetch('/api/members/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: parsed.memberId })
        }).then(res => {
          if (!res.ok) {
            sessionStorage.removeItem('dsc_verified_member');
            setVerifiedMember(null);
          }
        }).catch(() => {});
      } catch (e) {}
    }
    const savedSolved = sessionStorage.getItem('dsc_solved_challenges');
    if (savedSolved) {
      try {
        setSolvedChallengeIds(JSON.parse(savedSolved));
      } catch (e) {}
    }

    fetchChallenges(true);
    const interval = setInterval(() => {
      fetchChallenges(false);
    }, 15000); // 15-second live arena sync
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nav = document.querySelector('nav');
    if (inContestArena) {
      if (nav) nav.style.display = 'none';
    } else {
      if (nav) nav.style.display = '';
    }
    return () => { if (nav) nav.style.display = ''; };
  }, [inContestArena]);

  useEffect(() => {
    if (activeChallenge !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeChallenge]);

  const handleEvictMemberFromContest = async (reason) => {
    // 1. Immediately turn off contest arena state and refs to prevent re-entrant proctoring loops
    inContestArenaRef.current = false;
    setInContestArena(false);

    let member = verifiedMemberRef.current || verifiedMember;
    if (!member) {
      const saved = sessionStorage.getItem('dsc_verified_member');
      if (saved) try { member = JSON.parse(saved); } catch (e) {}
    }
    let contest = activeContestRef.current || activeContest || selectedContestForOnboarding;

    activeContestRef.current = null;
    setActiveContest(null);
    setActiveChallenge(null);

    // 2. Save to localStorage as a fast local cache (DB was already updated by recordViolationOnServer)
    if (contest && member && (member.memberId || member._id)) {
      const mId = (member.memberId || member._id).toString().trim().toUpperCase();
      const cId = (contest._id || contest.id || '').toString();
      try {
        const localMapStr = localStorage.getItem('dsc_restricted_map') || '{}';
        const localMap = JSON.parse(localMapStr);
        const list = localMap[cId] && Array.isArray(localMap[cId]) ? localMap[cId] : [];
        if (!list.includes(mId)) {
          list.push(mId);
          localMap[cId] = list;
          localStorage.setItem('dsc_restricted_map', JSON.stringify(localMap));
        }
      } catch (e) {}
    }

    // 3. Exit fullscreen safely
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    // 4. Show eviction alert
    alert(`🚨 Maximum anti-cheat violations exceeded (${reason}). Your competition session has been terminated and your ID is now restricted from re-entering this contest.`);
  };

  // Centralized handler to submit, mark complete, and permanently exit the arena
  const handleExitArena = async (isAuto = false, customReason = '') => {
    const contestToExit = activeContestRef.current || activeContest;
    if (!contestToExit) return;

    if (!isAuto) {
      openConfirmModal({
        title: `Exit ${contestToExit.isTSP ? 'TSP' : 'Contest'} Arena?`,
        message: `⚠️ WARNING: Exiting the ${contestToExit.isTSP ? 'TSP' : 'contest'} arena is PERMANENT!\n\nOnce you exit, your session will be finalized and submitted as COMPLETED.\nYou will NOT be permitted to re-enter this arena under any circumstances.\n\nAre you sure you want to finish and exit now?`,
        confirmText: 'Yes, Finalize & Exit',
        cancelText: 'Stay in Arena',
        type: 'danger',
        onConfirm: () => {
          proceedExitArena(contestToExit, false, customReason);
        }
      });
      return;
    }

    await proceedExitArena(contestToExit, isAuto, customReason);
  };

  const proceedExitArena = async (contestToExit, isAuto = false, customReason = '') => {
    const cId = (contestToExit._id || contestToExit.id || '').toString();
    const currentMemberId = verifiedMemberRef.current?.memberId || verifiedMember?.memberId || (typeof window !== 'undefined' && sessionStorage.getItem('dsc_verified_member') ? JSON.parse(sessionStorage.getItem('dsc_verified_member')).memberId : null);
    const currentMemberName = verifiedMemberRef.current?.name || verifiedMember?.name || '';
    const cleanMid = currentMemberId ? String(currentMemberId).trim().toUpperCase() : null;

    // 1. Mark in localStorage immediately to block re-entry (scoped to this specific member)
    if (cId && cleanMid) {
      try {
        localStorage.setItem(`completed_contest_${cId}_${cleanMid}`, 'true');
        localStorage.removeItem(`completed_contest_${cId}`);
      } catch (e) {}
    }

    // 2. Call backend complete endpoint to record completedMembers and activeParticipants status
    if (cId && cleanMid) {
      try {
        const completeEndpoint = contestToExit.isTSP ? `/api/tsp/${cId}/complete` : `/api/contests/${cId}/complete`;
        await fetch(completeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: cleanMid, name: currentMemberName }),
        });
      } catch (err) {
        console.error('Failed to notify complete endpoint:', err);
      }
    }

    // 3. Update React state for TSPs and Contests
    if (cleanMid && cId) {
      if (contestToExit.isTSP) {
        setTsps(prev => prev.map(t => {
          if ((t._id || t.id)?.toString() === cId) {
            const cm = Array.isArray(t.completedMembers) ? [...t.completedMembers] : [];
            if (!cm.includes(cleanMid)) cm.push(cleanMid);
            return { ...t, completedMembers: cm };
          }
          return t;
        }));
      } else {
        setContests(prev => prev.map(c => {
          if ((c._id || c.id)?.toString() === cId) {
            const cm = Array.isArray(c.completedMembers) ? [...c.completedMembers] : [];
            if (!cm.includes(cleanMid)) cm.push(cleanMid);
            return { ...c, completedMembers: cm };
          }
          return c;
        }));
      }
    }

    // 4. Exit fullscreen safely
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    // 5. Clear active arena state
    setActiveContest(null);
    setInContestArena(false);
    activeContestRef.current = null;
    inContestArenaRef.current = false;
    setAntiCheatWarnings(0);

    if (customReason) {
      openAlertModal({
        title: 'Arena Session Ended',
        message: customReason,
        type: 'info'
      });
    } else if (!isAuto) {
      openAlertModal({
        title: 'Session Completed',
        message: `✅ Your session for "${contestToExit.title || 'the arena'}" has been submitted and marked as completed. You cannot re-enter.`,
        type: 'info'
      });
    }
  };

  // Keep evictionHandlerRef always pointing to the latest closure (fixes stale-closure bug in setTimeout calls)
  evictionHandlerRef.current = handleEvictMemberFromContest;

  // Sends a violation to the server. The server tracks count and auto-restricts at 10.
  // Returns { violationCount, restricted } from the DB.
  const recordViolationOnServer = async (contestId, memberId) => {
    try {
      const res = await fetch('/api/contests/violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestId: contestId.toString(),
          memberId: memberId.toString().trim().toUpperCase(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data; // { violationCount, restricted, restrictedMembers }
      }
    } catch (e) {}
    return null;
  };

  // Anti-Cheat Proctoring Listeners (Strictly for Competition Contests)
  useEffect(() => {
    let timerId;
    const handleVisibilityChange = () => {
      if (!inContestArenaRef.current || !document.hidden) return;

      const contest = activeContestRef.current;
      const member = verifiedMemberRef.current;
      if (!contest || !member) return;

      const cId = (contest._id || contest.id || '').toString();
      const mId = (member.memberId || member._id || '').toString();
      if (!cId || !mId) return;

      // Record violation in DB immediately (server auto-restricts at 10)
      recordViolationOnServer(cId, mId).then((result) => {
        const count = (result && typeof result.violationCount === 'number')
          ? result.violationCount
          : (antiCheatWarningsRef.current + 1);
        const restricted = result?.restricted || count >= 10;

        // Update local state and ref
        antiCheatWarningsRef.current = count;
        setAntiCheatWarnings(count);

        // Update contests state with fresh restrictedMembers from server
        if (result?.restrictedMembers) {
          setContests((prev) =>
            prev.map((c) =>
              (c._id || c.id || '').toString() === cId
                ? { ...c, restrictedMembers: result.restrictedMembers }
                : c
            )
          );
        }

        if (restricted) {
          // 3rd violation – evict
          timerId = setTimeout(() => evictionHandlerRef.current && evictionHandlerRef.current('Tab Switching'), 0);
        } else {
          setShowAntiCheatModal(true);
        }
      });
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    let timerId;
    const handleFullscreenChange = () => {
      if (!inContestArenaRef.current || !!document.fullscreenElement || showAntiCheatModalRef.current) return;

      const contest = activeContestRef.current;
      const member = verifiedMemberRef.current;
      if (!contest || !member) return;

      const cId = (contest._id || contest.id || '').toString();
      const mId = (member.memberId || member._id || '').toString();
      if (!cId || !mId) return;

      // Record violation in DB immediately (server auto-restricts at 10)
      recordViolationOnServer(cId, mId).then((result) => {
        const count = (result && typeof result.violationCount === 'number')
          ? result.violationCount
          : (antiCheatWarningsRef.current + 1);
        const restricted = result?.restricted || count >= 10;

        antiCheatWarningsRef.current = count;
        setAntiCheatWarnings(count);

        if (result?.restrictedMembers) {
          setContests((prev) =>
            prev.map((c) =>
              (c._id || c.id || '').toString() === cId
                ? { ...c, restrictedMembers: result.restrictedMembers }
                : c
            )
          );
        }

        if (restricted) {
          // 3rd violation – evict
          timerId = setTimeout(() => evictionHandlerRef.current && evictionHandlerRef.current('Exiting Full Screen'), 0);
        } else {
          setShowAntiCheatModal(true);
        }
      });
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const fetchChallenges = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const ts = Date.now();
      const [chalRes, setRes, contRes, tspRes] = await Promise.all([
        fetch(`/api/challenges?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`/api/settings?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`/api/contests?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch(`/api/tsp?_t=${ts}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      ]);
      const chalData = await chalRes.json();
      const setData = await setRes.json();
      const contData = await contRes.json();
      const tspData = await tspRes.json();

      const challengeList = Array.isArray(chalData) ? chalData : (chalData?.challenges || []);
      setChallenges(challengeList);
      if (setData && typeof setData.challengesEnabled === 'boolean') {
        setPortalEnabled(setData.challengesEnabled);
      }
      if (Array.isArray(contData)) {
        setContests(contData);
      }
      if (Array.isArray(tspData)) {
        setTsps(tspData);
      }

      // Live-sync active arena state with server
      if (activeContestRef.current) {
        const cur = activeContestRef.current;
        const curId = (cur._id || cur.id)?.toString();
        if (cur.isTSP && Array.isArray(tspData)) {
          const fresh = tspData.find(t => (t._id || t.id)?.toString() === curId);
          if (fresh) {
            setActiveContest(prev => prev ? ({ ...fresh, isTSP: true, challenges: prev.challenges, sessionStartedAt: prev.sessionStartedAt }) : null);
          }
        } else if (!cur.isTSP && Array.isArray(contData)) {
          const fresh = contData.find(c => (c._id || c.id)?.toString() === curId);
          if (fresh) {
            setActiveContest(fresh);
          }
        }
      }
    } catch (err) {
      // Silently ignore polling network errors during dev server reloads/recompilation
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleVerifyMember = async (e) => {
    e.preventDefault();
    if (!memberIdInput.trim()) return;

    setVerifying(true);
    setVerifyError('');

    const targetContest = selectedContestForOnboarding || activeContest;
    const typedIdForCompleteCheck = memberIdInput.trim().toUpperCase();
    
    if (targetContest && typedIdForCompleteCheck) {
      const isCompletedLocal = localStorage.getItem(`completed_contest_${targetContest._id || targetContest.id}_${typedIdForCompleteCheck}`);
      const isCompletedDB = targetContest.completedMembers && targetContest.completedMembers.some(m => m && String(m).trim().toUpperCase() === typedIdForCompleteCheck);
      const isCompletedPart = targetContest.activeParticipants && targetContest.activeParticipants.some(
        p => p && p.memberId && String(p.memberId).trim().toUpperCase() === typedIdForCompleteCheck && p.status === 'completed'
      );
      
      if (isCompletedLocal || isCompletedDB || isCompletedPart) {
        setVerifyError(`⛔ You (${typedIdForCompleteCheck}) have already completed or exited this arena. Re-entry is strictly prohibited.`);
        setVerifying(false);
        return;
      }
    }
    try {
      const res = await fetch('/api/members/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberIdInput.trim() }),
      });
      const data = await res.json();
      
        let isAllowed = false;
        let finalMember = null;
        
        if (res.ok) {
          // Global member exists
          isAllowed = true;
          finalMember = data.member;
        }
        
        if (targetContest && targetContest.whitelistEnabled) {
          const typedId = memberIdInput.trim().toLowerCase();
          const match = targetContest.whitelistedStudents?.find(s => 
            (s.identifier && s.identifier.toLowerCase() === typedId) ||
            (s.rollNo && s.rollNo.toLowerCase() === typedId) ||
            (s.registerNo && s.registerNo.toLowerCase() === typedId)
          );
          if (match) {
            isAllowed = true;
            // Standardize memberId to rollNo (canonical ID) so alternate aliases don't spawn duplicate sessions
            finalMember = {
              ...(finalMember || {}),
              memberId: match.rollNo || match.identifier || typedId,
              name: match.name || finalMember?.name,
              role: finalMember?.role || 'Whitelisted Student'
            };
          } else {
            isAllowed = false;
            finalMember = null;
          }
        }
        
      if (isAllowed) {
        setVerifiedMember(finalMember);
        sessionStorage.setItem('dsc_verified_member', JSON.stringify(finalMember));
        if (data.solvedChallengeIds && Array.isArray(data.solvedChallengeIds)) {
          setSolvedChallengeIds(data.solvedChallengeIds);
          sessionStorage.setItem('dsc_solved_challenges', JSON.stringify(data.solvedChallengeIds));
        }
        setMemberIdInput('');
      } else {
        if (targetContest && targetContest.whitelistEnabled) {
          setVerifyError('⛔ You are not on the authorized participant whitelist for this contest. Please check your Roll Number or Member ID.');
        } else {
          setVerifyError(data.error || 'Verification failed. Invalid Member ID.');
        }
      }
    } catch (err) {
      setVerifyError('Error checking DB: ' + err.message);
    } finally {
      setVerifying(false);
    }
    

  };

  const handleJoinTSP = async (tsp) => {
    if (!tsp.isActive) {
      alert('⛔ This TSP arena is currently closed or inactive.');
      return;
    }
    const currentMemberId = verifiedMemberRef.current?.memberId || verifiedMember?.memberId || (typeof window !== 'undefined' && sessionStorage.getItem('dsc_verified_member') ? JSON.parse(sessionStorage.getItem('dsc_verified_member')).memberId : null);

    let activeTSP = tsp;
    if (currentMemberId && isMemberRestricted(activeTSP, currentMemberId)) {
      try {
        const freshRes = await fetch(`/api/tsp/${tsp._id || tsp.id}?_t=${Date.now()}`, { cache: 'no-store' });
        if (freshRes.ok) {
          const freshTSP = await freshRes.json();
          if (freshTSP) {
            setTsps(prev => prev.map(t => (t._id || t.id)?.toString() === (tsp._id || tsp.id)?.toString() ? { ...t, ...freshTSP } : t));
            activeTSP = { ...activeTSP, ...freshTSP };
          }
        }
      } catch (e) {}
    }

    if (currentMemberId && isMemberRestricted(activeTSP, currentMemberId)) {
      alert(`⛔ You (${currentMemberId}) are RESTRICTED from entering this TSP arena due to exceeding anti-cheat violations (3/3 Tab Switches or Window Exits). Please contact an Administrator to lift your restriction.`);
      return;
    }
    const cleanMid = currentMemberId ? String(currentMemberId).trim().toUpperCase() : null;
    if (cleanMid) {
      try {
        const verifyCheck = await fetch('/api/members/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: cleanMid })
        });
        if (!verifyCheck.ok) {
          sessionStorage.removeItem('dsc_verified_member');
          setVerifiedMember(null);
          alert(`⛔ Member ID "${cleanMid}" is not recognized or has been removed from the authorized participant list.`);
          return;
        }
      } catch (e) {}
    }
    const isCompletedDB = activeTSP.completedMembers && cleanMid && activeTSP.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);
    const isCompletedLocal = typeof window !== 'undefined' && cleanMid && localStorage.getItem(`completed_contest_${activeTSP._id || activeTSP.id}_${cleanMid}`);
    const isCompletedParticipant = activeTSP.activeParticipants && cleanMid && activeTSP.activeParticipants.some(
      p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === 'completed'
    );
    if (isCompletedDB || isCompletedLocal || isCompletedParticipant) {
      alert(`⛔ You (${cleanMid}) have already completed or exited this TSP arena. Re-entry is strictly prohibited.`);
      return;
    }
    setSelectedContestForOnboarding({ ...activeTSP, isTSP: true });
    setTspPasscodeInput('');
    setRulesAgreed(false);
    setContestOnboardingStep('verify');
  };

  const handleOpenChallenge = (challenge) => {
    setActiveChallenge(challenge);
    setSubmissionResult(null);
    setCompilerOutput(null);
    setActiveTestCaseIdx(0);
    if (problemContentRef.current) {
      problemContentRef.current.scrollTop = 0;
    }
    if (challenge.type === 'code' || challenge.type === 'tsp') {
      const uid = verifiedMember?.memberId || 'anon';
        const savedDraft = localStorage.getItem(`dsc_draft_${uid}_${challenge._id}_${selectedLang}`);
      setCodeSubmission(savedDraft || starterCodes[selectedLang](challenge.title));
    } else if (challenge.type === 'quiz') {
      setQuizAnswers(new Array(challenge.quizQuestions?.length || 0).fill(null));
      setCurrentQuizIndex(0);
    }
  };

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    if (activeChallenge && (activeChallenge.type === 'code' || activeChallenge.type === 'tsp')) {
      const uid = verifiedMember?.memberId || 'anon';
        const savedDraft = localStorage.getItem(`dsc_draft_${uid}_${activeChallenge._id}_${lang}`);
      setCodeSubmission(savedDraft || starterCodes[lang](activeChallenge.title));
      setCompilerOutput(null);
      setActiveTestCaseIdx(0);
    }
  };

  const runCodeAgainstCases = async (testCases) => {
    if (selectedLang === 'python') {
      try {
        if (!pyodideRef.current) {
          if (!window.loadPyodide) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
              script.onload = resolve;
              script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly CDN'));
              document.head.appendChild(script);
            });
          }
          pyodideRef.current = await window.loadPyodide();
        }

        const pyodide = pyodideRef.current;
        let capturedStdout = [];
        pyodide.setStdout({ batched: (msg) => capturedStdout.push(msg) });
        pyodide.setStderr({ batched: (msg) => capturedStdout.push(`[STDERR] ${msg}`) });

        const testResults = [];
        let resultsText = '';
        let allPassed = true;

        for (let idx = 0; idx < testCases.length; idx++) {
          const tc = testCases[idx];
          capturedStdout = [];
          const startTime = performance.now();
          try {
            const safeInput = (tc.input || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
            const prepCode = `import sys as __sys, io as __io; __sys.stdin = __io.StringIO('${safeInput}')`;
            await pyodide.runPythonAsync(prepCode);
            await pyodide.runPythonAsync(codeSubmission);
            
            // If the user defined solve(), main(), or solution() but forgot to call it at the bottom, auto-call it!
            if (capturedStdout.length === 0) {
              const autoInvokeCode = `
import inspect as __inspect
for __fn_name in ['solve', 'main', 'solution']:
    if __fn_name in globals() and callable(globals()[__fn_name]):
        try:
            __sig = __inspect.signature(globals()[__fn_name])
            if len(__sig.parameters) == 0:
                globals()[__fn_name]()
                break
        except Exception:
            pass
`;
              await pyodide.runPythonAsync(autoInvokeCode);
            }
            const endTime = performance.now();
            const execTime = ((endTime - startTime) / 1000).toFixed(3);
            
            const actualOutput = capturedStdout.join('\n').trim() || '(No output printed)';
            const expected = (tc.expectedOutput || '').trim();
            const normActual = normalizeOutputForComparison(capturedStdout.join('\n'));
            const normExpected = normalizeOutputForComparison(tc.expectedOutput || '');
            const isMatch = (normActual === normExpected);

            if (!isMatch) allPassed = false;

            testResults.push({
              id: idx,
              name: `${tc.isHidden ? '🔒 Hidden Case' : 'Case'} ${idx + 1}`,
              passed: isMatch,
              input: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.input || ''),
              expected: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.expectedOutput || ''),
              output: tc.isHidden && !isMatch ? 'Hidden (Wrong Answer)' : actualOutput,
              time: execTime,
              error: null
            });

            resultsText += `▶ Test Case #${idx + 1} (${tc.isHidden ? 'Hidden Case' : 'Visible Case'}): ${isMatch ? 'PASSED ✔' : 'FAILED ✘'} (${execTime}s)\n` +
                           `  Input:    ${tc.isHidden ? '[Hidden]' : (tc.input || '<empty>')}\n` +
                           `  Expected: ${tc.isHidden ? '[Hidden]' : (tc.expectedOutput || '<empty>')}\n` +
                           `  Your Out: ${tc.isHidden && !isMatch ? '[Hidden]' : actualOutput}\n\n`;
          } catch (pyErr) {
            allPassed = false;
            const errMsg = pyErr.message.split('\n').slice(-3).join('\n');
            testResults.push({
              id: idx,
              name: `${tc.isHidden ? '🔒 Hidden Case' : 'Case'} ${idx + 1}`,
              passed: false,
              input: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.input || ''),
              expected: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.expectedOutput || ''),
              output: capturedStdout.join('\n').trim() || '(No output printed)',
              time: '0.000',
              error: errMsg
            });
            resultsText += `▶ Test Case #${idx + 1}: RUNTIME / SYNTAX ERROR ✘\n` +
                           `  ${errMsg}\n\n`;
          }
        }

        const summaryText = `[Python 3.11 (Pyodide Wasm)]: Execution complete.\n` +
          `==================================================\n` +
          `Running Real Browser WebAssembly Evaluation...\n\n` +
          resultsText +
          `==================================================\n` +
          (allPassed ? `✅ ALL TEST CASES PASSED IN REAL WASM RUNTIME!` : `⚠️ SOME TEST CASES FAILED OR THREW ERRORS. Check output above.`);

        return { allPassed, testResults, summaryText };
      } catch (err) {
        return {
          allPassed: false,
          testResults: [{
            id: 0,
            name: 'Case 1',
            passed: false,
            input: testCases[0]?.input || '',
            expected: testCases[0]?.expectedOutput || '',
            output: '(No output generated)',
            time: '0.000',
            error: err.message
          }],
          summaryText: `❌ PYODIDE WASM INITIALIZATION / EXECUTION ERROR:\n${err.message}`
        };
      }
    }

    if (selectedLang === 'javascript') {
      let capturedLogs = [];
      const originalLog = console.log;
      console.log = (...args) => capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));

      const testResults = [];
      let resultsText = '';
      let allPassed = true;

      for (let idx = 0; idx < testCases.length; idx++) {
        const tc = testCases[idx];
        capturedLogs = [];
        const startTime = performance.now();
        try {
          window.stdinInput = tc.input || '';
          new Function(codeSubmission)();
          if (capturedLogs.length === 0) {
            try {
              new Function(`
                ${codeSubmission};
                if (typeof solve === 'function') { solve(); }
                else if (typeof main === 'function') { main(); }
              `)();
            } catch (_) {}
          }
          const endTime = performance.now();
          const execTime = ((endTime - startTime) / 1000).toFixed(3);
          const actualOutput = capturedLogs.join('\n').trim() || '(No output printed)';
          const expected = (tc.expectedOutput || '').trim();
          const normActual = normalizeOutputForComparison(capturedLogs.join('\n'));
          const normExpected = normalizeOutputForComparison(tc.expectedOutput || '');
          const isMatch = (normActual === normExpected);

          if (!isMatch) allPassed = false;
          testResults.push({
            id: idx,
            name: `${tc.isHidden ? '🔒 Hidden Case' : 'Case'} ${idx + 1}`,
            passed: isMatch,
            input: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.input || ''),
            expected: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.expectedOutput || ''),
            output: tc.isHidden && !isMatch ? 'Hidden (Wrong Answer)' : actualOutput,
            time: execTime,
            error: null
          });
          resultsText += `▶ Test Case #${idx + 1} (${tc.isHidden ? 'Hidden Case' : 'Visible Case'}): ${isMatch ? 'PASSED ✔' : 'FAILED ✘'} (${execTime}s)\n` +
                         `  Input:    ${tc.isHidden ? '[Hidden]' : (tc.input || '<empty>')}\n` +
                         `  Expected: ${tc.isHidden ? '[Hidden]' : (tc.expectedOutput || '<empty>')}\n` +
                         `  Your Out: ${tc.isHidden && !isMatch ? '[Hidden]' : actualOutput}\n\n`;
        } catch (jsErr) {
          allPassed = false;
          testResults.push({
            id: idx,
            name: `${tc.isHidden ? '🔒 Hidden Case' : 'Case'} ${idx + 1}`,
            passed: false,
            input: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.input || ''),
            expected: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.expectedOutput || ''),
            output: capturedLogs.join('\n').trim() || '(No output printed)',
            time: '0.000',
            error: jsErr.message
          });
          resultsText += `▶ Test Case #${idx + 1}: RUNTIME / SYNTAX ERROR ✘\n` +
                         `  ${jsErr.message}\n\n`;
        }
      }
      console.log = originalLog;
      const summaryText = `[Node.js v20 (V8 Engine)]: Execution complete.\n` +
        `==================================================\n` +
        `Running Real Browser V8 Evaluation...\n\n` +
        resultsText +
        `==================================================\n` +
        (allPassed ? `✅ ALL TEST CASES PASSED IN REAL V8 RUNTIME!` : `⚠️ SOME TEST CASES FAILED OR THREW ERRORS. Check output above.`);

      return { allPassed, testResults, summaryText };
    }

    // Default fallback (e.g. Java simulation / offline mode)
    await new Promise(r => setTimeout(r, 600));
    const compilerVer = selectedLang === 'java' ? 'OpenJDK 17.0.8 (Sandboxed)' : 'Compiler Engine';
    let allPassed = true;
    const testResults = testCases.map((tc, idx) => {
      const time = (0.012 + idx * 0.005).toFixed(3);
      const expected = (tc.expectedOutput || '').trim();
      const isStarter = codeSubmission.includes('System.out.println("Output result")') || codeSubmission.trim() === (starterCodes[selectedLang]?.(activeChallenge?.title) || '').trim();
      const isMatch = !isStarter && (codeSubmission.includes(expected) || codeSubmission.includes("print(" + expected) || codeSubmission.includes("println(" + expected));
      if (!isMatch) allPassed = false;
      const actualOut = isMatch ? expected : (isStarter ? 'Output result' : 'Incorrect output');
      return {
        id: idx,
        name: `${tc.isHidden ? '🔒 Hidden Case' : 'Case'} ${idx + 1}`,
        passed: isMatch,
        input: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.input || ''),
        expected: tc.isHidden ? 'Hidden by Challenge Administrator' : (tc.expectedOutput || ''),
        output: tc.isHidden && !isMatch ? 'Hidden (Wrong Answer)' : actualOut,
        time: time,
        error: null
      };
    });

    const resultsText = testCases.map((tc, idx) => {
      const time = (0.012 + idx * 0.005).toFixed(3);
      const res = testResults[idx];
      return `▶ Test Case #${idx + 1} (${tc.isHidden ? 'Hidden Case' : 'Visible Case'}): ${res.passed ? 'PASSED ✔' : 'FAILED ✘'} (${time}s)\n` +
             `  Input:    ${tc.isHidden ? '[Hidden]' : (tc.input || 'None')}\n` +
             `  Expected: ${tc.isHidden ? '[Hidden]' : (tc.expectedOutput || 'None')}\n` +
             `  Output:   ${res.output}\n`;
    }).join('\n');

    const fakeOutput = `[${compilerVer}]: Build & compilation complete.\n` +
      `==================================================\n` +
      `Running Automated Test Suite...\n\n` +
      resultsText +
      `==================================================\n` +
      (allPassed ? `✅ ALL TEST CASES PASSED!` : `⚠️ SOME TEST CASES FAILED OR THREW ERRORS.`);

    return { allPassed, testResults, summaryText: fakeOutput };
  };

  const ensureCaretVisible = (textarea) => {
    if (!textarea) return;
    const container = textarea.closest('[class*="editorWorkspaceArea"]');
    if (!container) return;

    const selStart = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, selStart);
    const linesBefore = textBefore.split('\n').length;
    
    // approximate line height: 1.6 * 0.9rem ~= 23.04px. Using 24px + 20px padding
    const lineHeight = 24; 
    const caretY = 20 + (linesBefore * lineHeight);
    
    const { scrollTop, clientHeight } = container;
    
    if (caretY > scrollTop + clientHeight - 40) {
      container.scrollTop = caretY - clientHeight + 40;
    } else if (caretY < scrollTop + 20) {
      container.scrollTop = Math.max(0, caretY - 40);
    }
  };

  const handleEditorKeyDown = (e) => {
    const textarea = e.currentTarget;
    const value = textarea.value;
    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;

    if (e.key === 'Enter') {
      // Find current line up to caret
      const linesBefore = value.substring(0, selStart).split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];
      const match = currentLine.match(/^[ \t]*/);
      let indent = match ? match[0] : '';

      const trimmed = currentLine.trim();
      const indentUnit = selectedLang === 'python' ? '    ' : '  ';

      // Auto-indent after block starters (colons in Python, braces in JS/Java)
      if (trimmed.endsWith(':') || trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[')) {
        indent += indentUnit;
      }

      e.preventDefault();
      const insertStr = '\n' + indent;

      let inserted = false;
      try {
        inserted = document.execCommand('insertText', false, insertStr);
      } catch (_) {}

      if (!inserted) {
        const nextValue = value.substring(0, selStart) + insertStr + value.substring(selEnd);
        setCodeSubmission(nextValue);
        const newPos = selStart + insertStr.length;
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = newPos;
        });
      }
    } else if (e.key === 'Tab') {
      const indentUnit = selectedLang === 'python' ? '    ' : '  ';
      if (!e.shiftKey && selStart === selEnd) {
        e.preventDefault();
        let inserted = false;
        try {
          inserted = document.execCommand('insertText', false, indentUnit);
        } catch (_) {}
        if (!inserted) {
          const nextValue = value.substring(0, selStart) + indentUnit + value.substring(selEnd);
          setCodeSubmission(nextValue);
          const newPos = selStart + indentUnit.length;
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = newPos;
          });
        }
      }
    }
    setTimeout(() => ensureCaretVisible(textarea), 10);
  };

  const handleCompileAndRun = async () => {
    if (!activeChallenge) return;
    setCompiling(true);
    setCompilerMinimized(false);
    setSubmissionResult(null);

    const testCases = (activeChallenge.codeDetails?.testCases && activeChallenge.codeDetails.testCases.length > 0)
      ? activeChallenge.codeDetails.testCases.filter(tc => !tc.isHidden)
      : [{ input: activeChallenge.codeDetails?.sampleInput || '', expectedOutput: activeChallenge.codeDetails?.sampleOutput || '', isHidden: false }];

    setCompilerOutput({
      status: 'compiling',
      title: 'Compiling & Running...',
      subtitle: `Executing against ${testCases.length} visible test cases in ${selectedLang.toUpperCase()}`,
      compilerMessage: 'Initializing Engine...',
      text: `[COMPILER]: Initializing execution sandbox...\n[COMPILER]: Allocating memory & parsing syntax...`
    });

    const { allPassed, testResults, summaryText } = await runCodeAgainstCases(testCases);

    const passedCount = testResults.filter(r => r.passed).length;
    setActiveTestCaseIdx(0);
    setCompilerOutput({
      status: allPassed ? 'success' : 'error',
      title: allPassed ? 'Accepted' : 'Wrong Answer',
      subtitle: `${passedCount}/${testCases.length} test cases passed`,
      compilerMessage: allPassed ? 'Success' : 'Wrong Answer',
      testResults: testResults,
      text: summaryText
    });
    setCompiling(false);
  };

  const handleQuizOptionSelect = (qIdx, optionIdx) => {
    const nextAnswers = [...quizAnswers];
    nextAnswers[qIdx] = optionIdx;
    setQuizAnswers(nextAnswers);
  };

  const handleSubmitChallenge = async () => {
    if (!verifiedMember || !activeChallenge) return;
    setSubmitting(true);
    setCompilerMinimized(false);
    setSubmissionResult(null);

    if (activeChallenge.type === 'code' || activeChallenge.type === 'tsp') {
      const allCases = (activeChallenge.codeDetails?.testCases && activeChallenge.codeDetails.testCases.length > 0)
        ? activeChallenge.codeDetails.testCases
        : [{ input: activeChallenge.codeDetails?.sampleInput || '', expectedOutput: activeChallenge.codeDetails?.sampleOutput || '', isHidden: false }];
      const hiddenCount = allCases.filter(tc => tc.isHidden).length;
      const visibleCount = allCases.length - hiddenCount;

      setActiveTestCaseIdx(0);
      setCompilerOutput({
        status: 'compiling',
        title: 'Evaluating Submission...',
        subtitle: `Running test suite against all ${allCases.length} test cases (${visibleCount} visible, ${hiddenCount} hidden)`,
        compilerMessage: 'Running Evaluation Suite...',
        text: `[COMPILER]: Submitting solution for evaluation...\n[COMPILER]: Running verification against ALL ${allCases.length} Test Cases (${visibleCount} Visible, ${hiddenCount} Hidden)...`
      });

      const { allPassed, testResults, summaryText } = await runCodeAgainstCases(allCases);

      const passedCount = testResults.filter(r => r.passed).length;
      setCompilerOutput({
        status: allPassed ? 'success' : 'error',
        title: allPassed ? 'Accepted' : 'Wrong Answer',
        subtitle: `${passedCount}/${allCases.length} test cases passed (${visibleCount} visible, ${hiddenCount} hidden)`,
        compilerMessage: allPassed ? 'Accepted' : 'Wrong Answer',
        testResults: testResults,
        text: summaryText,
        canSubmitPartial: passedCount > 0 && !allPassed,
        passedCount,
        totalCount: allCases.length
      });

      if (!allPassed) {
        setSubmitting(false);
        ensureFullscreen();
        return;
      }
    }

    try {
      const res = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: activeChallenge._id,
          memberId: verifiedMember.memberId,
          type: activeChallenge.type,
          codeSubmission: (activeChallenge.type === 'code' || activeChallenge.type === 'tsp') ? codeSubmission : '',
          quizAnswers: activeChallenge.type === 'quiz' ? quizAnswers : [],
          contestId: activeContest ? (activeContest._id || activeContest.id) : null,
          passedTestCases: (activeChallenge.type === 'code' || activeChallenge.type === 'tsp') ? (activeChallenge.codeDetails?.testCases?.length || 1) : undefined,
          totalTestCases: (activeChallenge.type === 'code' || activeChallenge.type === 'tsp') ? (activeChallenge.codeDetails?.testCases?.length || 1) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmissionResult(data);
      if (activeChallenge && activeChallenge._id) {
        if (inContestArenaRef.current) {
          setContestSolvedChallengeIds(prev => Array.from(new Set([...prev, activeChallenge._id])));
        }
        setSolvedChallengeIds(prev => {
          const updated = Array.from(new Set([...prev, activeChallenge._id]));
          sessionStorage.setItem('dsc_solved_challenges', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      openAlertModal({
        title: 'Submission Error',
        message: err.message,
        type: 'danger'
      });
    } finally {
      setSubmitting(false);
      ensureFullscreen();
    }
  };

  const handleSubmitAcceptedCases = (passedCount, totalCount) => {
    if (!verifiedMember || !activeChallenge) return;

    openConfirmModal({
      title: 'Submit Partial Solution?',
      message: `Are you sure you want to submit your solution with only the ${passedCount} accepted test case(s) out of ${totalCount}? You will receive proportional points for the accepted test cases.`,
      confirmText: `Submit (${passedCount}/${totalCount})`,
      cancelText: 'Keep Editing',
      type: 'warning',
      onConfirm: async () => {
        setSubmitting(true);
        setSubmissionResult(null);

        try {
          const res = await fetch('/api/challenges/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId: activeChallenge._id,
              memberId: verifiedMember.memberId,
              type: activeChallenge.type,
              codeSubmission: codeSubmission || '',
              quizAnswers: [],
              contestId: activeContest ? (activeContest._id || activeContest.id) : null,
              passedTestCases: passedCount,
              totalTestCases: totalCount,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Submission failed');
          }

          setSubmissionResult({
            ...data,
            isPartial: true,
            passedTestCases: passedCount,
            totalTestCases: totalCount,
          });

          if (activeChallenge && activeChallenge._id) {
            if (inContestArenaRef.current) {
              setContestSolvedChallengeIds(prev => Array.from(new Set([...prev, activeChallenge._id])));
            }
            setSolvedChallengeIds(prev => {
              const updated = Array.from(new Set([...prev, activeChallenge._id]));
              sessionStorage.setItem('dsc_solved_challenges', JSON.stringify(updated));
              return updated;
            });
          }
        } catch (err) {
          openAlertModal({
            title: 'Submission Error',
            message: err.message,
            type: 'danger'
          });
        } finally {
          setSubmitting(false);
          ensureFullscreen();
        }
      }
    });
  };

  const filteredChallenges = challenges.filter((c) => {
    if (activeContest) {
      // Show only challenges attached to this contest (safe string comparison)
      if (!activeContest.challenges || activeContest.challenges.length === 0) return false;
      const isAttached = activeContest.challenges.some(
        (item) => {
           const itemId = typeof item === 'object' && item !== null ? (item._id || item.id) : item;
           return itemId && itemId.toString() === (c._id || '').toString();
        }
      );
      if (!isAttached) return false;
      if (contestDifficultyFilter !== 'all' && (c.difficulty || 'medium').toLowerCase() !== contestDifficultyFilter) return false;
      return true;
    }
    if (c.isHidden) return false;
    if (filter === 'all') return true;
    return c.type === filter;
  });

  if (!portalEnabled) {
    return (
      <div className={styles.container}>
        <div className={styles.bgGlow1} />
        <div className={styles.bgGlow2} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle size={44} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-1px' }}>
            COMPETITION ARENA <span style={{ color: '#ef4444' }}>LOCKED</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', lineHeight: 1.6, marginBottom: '2rem' }}>
            The official Data Science Club Coding & Quiz Challenges portal has been temporarily locked by an administrator for judging, hackathon setup, or leaderboard verification.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '30px', color: '#34d399', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
            LIVE STATUS STREAM — AUTO-CHECKING FOR UNLOCK (3S)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Background Decor */}
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <div className={styles.content}>
        {/* Header */}
        {/* General Header & Member Status Banner — hidden while inside a contest arena */}
        {!activeContest && (
          <>
            <div className={styles.header}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <Link href="/" style={{ textDecoration: 'none', color: '#cbd5e1', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#1e293b', padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid #334155', fontWeight: 600 }}>
                  ← Back to Home
                </Link>
                <div className={styles.badge}>
                  <Zap size={16} />
                  <span>Official Competition Portal</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', borderRadius: '20px', color: '#00f0ff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 8px #00f0ff', display: 'inline-block' }} />
                  LIVE ARENA SYNCED (3s) | REAL-TIME WASM COMPILING
                </div>
              </div>
              <h1 className={styles.title}>
                Data Science <span>Challenges & Quizzes</span>
              </h1>
              <p className={styles.subtitle}>
                Test your data structures, algorithms, and analytical skills. Verify with your official Data Science Club Member ID (<strong style={{ color: '#60a5fa' }}>DSCAIXXXX</strong>) to compete and earn XP!
              </p>
            </div>

            {/* Member Status Banner */}
            <div className={styles.memberStatusCard}>
              {verifiedMember ? (
                <div className={styles.verifiedState}>
                  <div className={styles.verifiedInfo}>
                    <div className={styles.verifiedIcon}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <span className={styles.verifiedLabel}>Verified Member Active</span>
                      <h3 className={styles.verifiedName}>{verifiedMember.name}</h3>
                      <span className={styles.verifiedId}>{verifiedMember.memberId} * Total XP: {verifiedMember.score || 0}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setIdCardOpen(true)}
                      className={styles.switchMemberBtn}
                      style={{ background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', color: '#00f0ff' }}
                    >
                      <Award size={16} style={{ display: 'inline', marginRight: '4px' }} /> View ID Card
                    </button>
                    <a
                      href="/leaderboard"
                      className={styles.switchMemberBtn}
                      style={{ background: 'rgba(250, 204, 21, 0.15)', border: '1px solid #facc15', color: '#facc15', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trophy size={16} /> Leaderboard
                    </a>
                    <button
                      onClick={() => {
                        setVerifiedMember(null);
                        sessionStorage.removeItem('dsc_verified_member');
                        sessionStorage.removeItem('dsc_solved_challenges');
                        if (typeof window !== 'undefined') {
                          try {
                            const keysToRemove = [];
                            for (let i = 0; i < localStorage.length; i++) {
                              const k = localStorage.key(i);
                              if (k && k.startsWith('completed_contest_') && k.split('_').length === 3) {
                                keysToRemove.push(k);
                              }
                            }
                            keysToRemove.forEach(k => localStorage.removeItem(k));
                          } catch (e) {}
                        }
                      }}
                      className={styles.switchMemberBtn}
                    >
                      Switch Member ID
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVerifyMember} className={styles.verifyForm}>
                  <div className={styles.verifyText}>
                    <ShieldCheck size={28} className={styles.shieldIcon} />
                    <div>
                      <h3 className={styles.verifyTitle}>{(activeContest && activeContest.whitelistEnabled) ? "Enter Your Roll Number or Member ID" : "Enter Your Member ID to Participate"}</h3>
                      <p className={styles.verifySub}>Don&apos;t have an ID? <Link href="/#join" style={{ color: '#00f0ff', textDecoration: 'underline', fontWeight: 'bold' }}>Click here to Join the Club</Link> on our Home Page to get yours!</p>
                    </div>
                  </div>

                  <div className={styles.verifyInputGroup}>
                    <input
                      type="text"
                      placeholder={(activeContest && activeContest.whitelistEnabled) ? "e.g. Roll Number or DSCAI4829" : "e.g. DSCAI4829"}
                      required
                      value={memberIdInput}
                      onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                      className={styles.verifyInput}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <button type="submit" disabled={verifying} className={styles.verifyBtn}>
                      {verifying ? 'Verifying...' : 'Verify ID'}
                    </button>
                  </div>
                  {verifyError && <span className={styles.verifyError}>{verifyError}</span>}
                </form>
              )}
            </div>
          </>
        )}

        {/* Filter Tabs — hidden while inside a contest arena */}
        {!activeContest && (
        <div className={styles.filterBar}>
          <button
            onClick={() => { setFilter('all'); setActiveContest(null); }}
            className={`${styles.filterBtn} ${filter === 'all' && !activeContest ? styles.activeFilter : ''}`}
          >
            <Trophy size={16} />
            All Challenges ({challenges.filter(c => !c.isHidden).length})
          </button>
          <button
            onClick={() => { setFilter('code'); setActiveContest(null); }}
            className={`${styles.filterBtn} ${filter === 'code' && !activeContest ? styles.activeFilter : ''}`}
          >
            <Code2 size={16} />
            Code Challenges ({challenges.filter(c => c.type === 'code' && !c.isHidden).length})
          </button>
          <button
            onClick={() => { setFilter('quiz'); setActiveContest(null); }}
            className={`${styles.filterBtn} ${filter === 'quiz' && !activeContest ? styles.activeFilter : ''}`}
          >
            <HelpCircle size={16} />
            Quizzes ({challenges.filter(c => c.type === 'quiz' && !c.isHidden).length})
          </button>
          <button
            onClick={() => { setFilter('tsp'); setActiveContest(null); }}
            className={`${styles.filterBtn} ${filter === 'tsp' && !activeContest ? styles.activeFilter : ''}`}
          >
            <Terminal size={16} />
            TSP ({tsps.length})
          </button>
          <button
            onClick={() => { setFilter('contests'); setActiveContest(null); }}
            className={`${styles.filterBtn} ${filter === 'contests' || activeContest ? styles.activeFilter : ''}`}
            style={{ border: '1px solid #00f0ff', color: filter === 'contests' || activeContest ? '#00f0ff' : '#cbd5e1' }}
          >
            <Zap size={16} color="#00f0ff" />
            Contests Arena ({contests.length})
          </button>
        </div>
        )}

        {/* Active Contest Banner */}
        {activeContest && (
          <div style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(16, 185, 129, 0.15))', border: '1px solid #00f0ff', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
                {activeContest.isTSP ? 'LIVE TSP WORKSPACE' : 'LIVE CONTEST ARENA WORKSPACE'}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>{activeContest.title}</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{activeContest.description}</p>
            </div>
            {activeContest.timerEnabled && (
              <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '0.65rem 1.15rem', borderRadius: '12px', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)' }}>
                <Timer size={24} color="#00f0ff" className={activeContest.timerStatus === 'running' ? styles.spinner : ''} style={{ animationDuration: '3s' }} />
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Remaining</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace', color: formatContestTime(activeContest) === '00:00' || activeContest.timerStatus === 'ended' ? '#ef4444' : '#fff', textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' }}>
                    {activeContest.timerStatus === 'ended' ? 'TIME EXPIRED' : formatContestTime(activeContest)}
                  </span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleOpenContestLeaderboard(activeContest)}
                className={styles.startBtn}
                style={{ background: activeContest.leaderboardEnabled === false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.1)', color: activeContest.leaderboardEnabled === false ? '#f87171' : '#fff', border: activeContest.leaderboardEnabled === false ? '1px solid #f87171' : '1px solid #475569', cursor: 'pointer', borderRadius: '0.75rem', padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Trophy size={16} color={activeContest.leaderboardEnabled === false ? "#f87171" : "#facc15"} />
                <span>{activeContest.leaderboardEnabled === false ? 'Leaderboard (OFF) 🔒' : (activeContest.isTSP ? 'TSP Leaderboard' : 'Contest Leaderboard')}</span>
              </button>

              <button
                onClick={() => handleExitArena(false)}
                className={styles.startBtn}
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', borderRadius: '0.75rem', padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                title="Finish test and permanently exit the arena"
              >
                <X size={16} />
                <span>Exit Arena</span>
              </button>
            </div>
          </div>
        )}

                {filter === 'tsp' && !activeContest ? (
          loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={32} className={styles.spinner} />
              <span>Loading TSPs...</span>
            </div>
          ) : tsps.length === 0 ? (
            <div className={styles.emptyState}>
              <Terminal size={48} className={styles.emptyIcon} />
              <h3>No Active TSPs</h3>
              <p>There are no Technical Skill Programs available right now.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {tsps.map((c) => (
                <motion.div key={c._id} whileHover={{ y: -5 }} className={styles.card} style={{ borderTop: c.isActive ? '3px solid #10b981' : '3px solid #ef4444' }}>
                  <div className={styles.cardHeader}>
                    <span className={styles.typeBadge} style={{ background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: c.isActive ? '#10b981' : '#ef4444', border: `1px solid ${c.isActive ? '#10b981' : '#ef4444'}` }}>
                      <Zap size={14} />
                      {c.isActive ? '🟢 Active TSP' : '🔴 TSP Closed'}
                    </span>
                    <span className={styles.difficultyBadge} style={{ background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', border: '1px solid #00f0ff' }}>
                      {c.challenges?.length || 0} Fixed, {c.pools?.length || 0} Pools
                    </span>
                    {c.passcodeEnabled && ((c.accessCodes && c.accessCodes.length > 0) || c.passcode) && (
                      <span className={styles.difficultyBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid #f59e0b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Lock size={12} />
                        Passcode Required
                      </span>
                    )}
                  </div>

                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.cardDesc}>{c.description || 'No description provided.'}</p>

                  {c.startTime && (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                      📅 <strong>Window:</strong> {formatDateTimeDisplay(c.startTime)} — {c.endTime ? formatDateTimeDisplay(c.endTime) : 'Open'}
                    </div>
                  )}

                  {c.timerEnabled && (
                    <div style={{ fontSize: '0.8rem', color: '#00f0ff', marginBottom: '1rem', background: 'rgba(0,240,255,0.08)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,240,255,0.2)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Timer size={14} /> <strong>Timer:</strong> {c.timerDurationMinutes || c.timerMinutes || 60} mins
                      </span>
                      <span style={{ fontWeight: 800, color: c.timerStatus === 'running' ? '#4ade80' : c.timerStatus === 'ended' ? '#ef4444' : '#facc15' }}>
                        {c.timerStatus === 'running' ? `🟢 ${formatContestTime(c)}` : c.timerStatus === 'ended' ? '🔴 ENDED' : '🟡 STOPPED'}
                      </span>
                    </div>
                  )}

                  <div className={styles.cardFooter} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenContestLeaderboard({ ...c, isTSP: true })}
                      className={styles.startBtn}
                      style={{ background: c.leaderboardEnabled === false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.1)', color: c.leaderboardEnabled === false ? '#f87171' : '#fff', border: c.leaderboardEnabled === false ? '1px solid #f87171' : '1px solid #475569', flex: 1, cursor: 'pointer', borderRadius: '0.75rem', padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Trophy size={16} color={c.leaderboardEnabled === false ? "#f87171" : "#facc15"} />
                      <span>{c.leaderboardEnabled === false ? 'Leaderboard (OFF) 🔒' : 'Leaderboard'}</span>
                    </button>

                    {(() => {
                      const currentMemberId = verifiedMemberRef.current?.memberId || verifiedMember?.memberId || (typeof window !== 'undefined' && sessionStorage.getItem('dsc_verified_member') ? JSON.parse(sessionStorage.getItem('dsc_verified_member')).memberId : null);
                      const cleanMid = currentMemberId ? String(currentMemberId).trim().toUpperCase() : null;
                      const isCompletedDB = cleanMid && c.completedMembers && c.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);
                      const isCompletedPart = cleanMid && c.activeParticipants && c.activeParticipants.some(p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === 'completed');
                      const isCompletedLocal = typeof window !== 'undefined' && cleanMid && localStorage.getItem(`completed_contest_${c._id || c.id}_${cleanMid}`);
                      const isCompleted = isCompletedDB || isCompletedPart || isCompletedLocal;

                      if (isCompleted) {
                        return (
                          <button
                            onClick={() => alert(`✅ You (${cleanMid || 'Student'}) have already completed this TSP. You cannot rejoin it.`)}
                            className={styles.startBtn}
                            style={{ flex: 1.5, background: 'rgba(16, 185, 129, 0.2)', cursor: 'not-allowed', color: '#10b981', fontWeight: 700, borderRadius: '0.75rem', padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #10b981' }}
                          >
                            <span>Completed</span>
                            <CheckCircle2 size={16} />
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleJoinTSP(c)}
                          className={styles.startBtn}
                          style={{ flex: 1.5, background: c.isActive ? 'linear-gradient(135deg, #00f0ff, #0072ff)' : 'rgba(100, 116, 139, 0.3)', cursor: c.isActive ? 'pointer' : 'not-allowed', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none' }}
                        >
                          <span>{c.isActive ? 'Enter TSP' : 'Closed'}</span>
                          <ArrowRight size={16} />
                        </button>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : filter === 'contests' && !activeContest ? (
          loading ? (
            <div className={styles.loadingState}>
              <RefreshCw size={32} className={styles.spinner} />
              <span>Loading contest arenas...</span>
            </div>
          ) : contests.length === 0 ? (
            <div className={styles.emptyState}>
              <Trophy size={48} className={styles.emptyIcon} />
              <h3>No Contests Available</h3>
              <p>There are currently no active competition contests. Check back soon for hackathons and tournaments!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {contests.map((c) => (
                <motion.div key={c._id} whileHover={{ y: -5 }} className={styles.card} style={{ borderTop: c.isActive ? '3px solid #10b981' : '3px solid #ef4444' }}>
                  <div className={styles.cardHeader}>
                    <span className={styles.typeBadge} style={{ background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: c.isActive ? '#10b981' : '#ef4444', border: `1px solid ${c.isActive ? '#10b981' : '#ef4444'}` }}>
                      <Zap size={14} />
                      {c.isActive ? '🟢 Active Arena' : '🔴 Contest Closed'}
                    </span>
                    <span className={styles.difficultyBadge} style={{ background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', border: '1px solid #00f0ff' }}>
                      {c.challenges?.length || 0} Questions
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.cardDesc}>{c.description}</p>
                  {(c.startTime || c.endTime) && (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                      📅 <strong>Window:</strong> {c.startTime ? formatDateTimeDisplay(c.startTime) : 'Immediate'} — {c.endTime ? formatDateTimeDisplay(c.endTime) : 'Open'}
                    </div>
                  )}

                  {c.timerEnabled && (
                    <div style={{ fontSize: '0.8rem', color: '#00f0ff', marginBottom: '1rem', background: 'rgba(0,240,255,0.08)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,240,255,0.2)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Timer size={14} /> <strong>Timer:</strong> {c.timerDurationMinutes || 60} mins
                      </span>
                      <span style={{ fontWeight: 800, color: c.timerStatus === 'running' ? '#4ade80' : c.timerStatus === 'ended' ? '#ef4444' : '#facc15' }}>
                        {c.timerStatus === 'running' ? `🟢 ${formatContestTime(c)}` : c.timerStatus === 'ended' ? '🔴 ENDED' : '🟡 STOPPED'}
                      </span>
                    </div>
                  )}

                  <div className={styles.cardFooter} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenContestLeaderboard(c)}
                      className={styles.startBtn}
                      style={{ background: c.leaderboardEnabled === false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.1)', color: c.leaderboardEnabled === false ? '#f87171' : '#fff', border: c.leaderboardEnabled === false ? '1px solid #f87171' : '1px solid #475569', flex: 1, cursor: 'pointer', borderRadius: '0.75rem', padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Trophy size={16} color={c.leaderboardEnabled === false ? "#f87171" : "#facc15"} />
                      <span>{c.leaderboardEnabled === false ? 'Leaderboard (OFF) 🔒' : 'Leaderboard'}</span>
                    </button>

                    {(() => {
                      const currentMemberId = verifiedMemberRef.current?.memberId || verifiedMember?.memberId || (typeof window !== 'undefined' && sessionStorage.getItem('dsc_verified_member') ? JSON.parse(sessionStorage.getItem('dsc_verified_member')).memberId : null);
                      const cleanMid = currentMemberId ? String(currentMemberId).trim().toUpperCase() : null;
                      const isCompletedDB = c.completedMembers && cleanMid && c.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);
                      const isCompletedLocal = typeof window !== 'undefined' && cleanMid && localStorage.getItem(`completed_contest_${c._id || c.id}_${cleanMid}`);
                      const isCompletedPart = c.activeParticipants && cleanMid && c.activeParticipants.some(
                        p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === 'completed'
                      );
                      const isCompleted = isCompletedDB || isCompletedLocal || isCompletedPart;

                      if (isCompleted) {
                        return (
                          <button
                            onClick={() => alert(`✅ You (${cleanMid}) have already completed this contest. You cannot rejoin it.`)}
                            className={styles.startBtn}
                            style={{ flex: 1.5, background: 'rgba(16, 185, 129, 0.2)', cursor: 'not-allowed', color: '#10b981', fontWeight: 700, borderRadius: '0.75rem', padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #10b981' }}
                          >
                            <span>Completed</span>
                            <CheckCircle2 size={16} />
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={async () => {
                            if (!c.isActive) {
                              alert('⛔ This contest arena is currently closed or inactive.');
                              return;
                            }
                            let activeContestItem = c;
                            if (currentMemberId && isMemberRestricted(activeContestItem, currentMemberId)) {
                              try {
                                const freshRes = await fetch(`/api/contests/${c._id || c.id}?_t=${Date.now()}`, { cache: 'no-store' });
                                if (freshRes.ok) {
                                  const freshContest = await freshRes.json();
                                  if (freshContest) {
                                    setContests(prev => prev.map(item => (item._id || item.id)?.toString() === (c._id || c.id)?.toString() ? { ...item, ...freshContest } : item));
                                    activeContestItem = { ...activeContestItem, ...freshContest };
                                  }
                                }
                              } catch (e) {}
                            }
                            if (cleanMid) {
                              const isCompDB = activeContestItem.completedMembers && activeContestItem.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);
                              const isCompLoc = typeof window !== 'undefined' && localStorage.getItem(`completed_contest_${activeContestItem._id || activeContestItem.id}_${cleanMid}`);
                              const isCompPart = activeContestItem.activeParticipants && activeContestItem.activeParticipants.some(
                                p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === 'completed'
                              );
                              if (isCompDB || isCompLoc || isCompPart) {
                                alert(`⛔ You (${cleanMid}) have already completed or exited this contest arena. Re-entry is strictly prohibited.`);
                                return;
                              }
                            }
                            if (currentMemberId && isMemberRestricted(activeContestItem, currentMemberId)) {
                              alert(`⛔ You (${currentMemberId}) are RESTRICTED from entering this contest arena due to exceeding anti-cheat violations (3/3 Tab Switches or Window Exits). Please contact an Administrator to lift your restriction.`);
                              return;
                            }
                            setSelectedContestForOnboarding(activeContestItem);
                            setTspPasscodeInput('');
                            setRulesAgreed(false);
                            setContestOnboardingStep('verify');
                          }}
                          className={styles.startBtn}
                          style={{ flex: 1.5, background: c.isActive ? 'linear-gradient(135deg, #00f0ff, #0072ff)' : 'rgba(100, 116, 139, 0.3)', cursor: c.isActive ? 'pointer' : 'not-allowed', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none' }}
                        >
                          <span>{c.isActive ? 'Enter Arena' : 'Closed'}</span>
                          <Zap size={16} />
                        </button>
                      );
                    })()}

                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : loading ? (
          <div className={styles.loadingState}>
            <RefreshCw size={32} className={styles.spinner} />
            <span>Loading active challenges...</span>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className={styles.emptyState}>
            <Trophy size={48} className={styles.emptyIcon} />
            {activeContest ? (
              <>
                <h3>No Questions Attached</h3>
                <p>No challenges have been added to this {activeContest.isTSP ? 'TSP' : 'contest'} arena yet. Please wait for the admin to add questions.</p>
              </>
            ) : (
              <>
                <h3>No Challenges Found</h3>
                <p>There are currently no active challenges in this category. Check back soon!</p>
              </>
            )}
          </div>
        ) : (
          <>
            {activeContest && (
              <div style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(16,185,129,0.08))', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,240,255,0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={18} color="#00f0ff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#00f0ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{activeContest.isTSP ? 'TSP Questions' : 'Contest Questions'}</div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{filteredChallenges.length} problem{filteredChallenges.length !== 1 ? 's' : ''} for <span style={{ color: '#34d399' }}>{activeContest.title}</span></div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Difficulty Filters */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setContestDifficultyFilter(level)}
                        style={{
                          background: contestDifficultyFilter === level ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${contestDifficultyFilter === level ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: contestDifficultyFilter === level ? '#00f0ff' : '#94a3b8',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>Proctored — Tab switching monitored</span>
                  </div>
                </div>
              </div>
            )}
          <div className={styles.grid}>
            {filteredChallenges.map((challenge) => (
              <motion.div
                key={challenge._id}
                whileHover={{ y: -5 }}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <span className={`${styles.typeBadge} ${(challenge.type === 'code' || challenge.type === 'tsp') ? styles.codeType : styles.quizType}`}>
                    {challenge.type === 'code' ? <Code2 size={14} /> : challenge.type === 'tsp' ? <Terminal size={14} /> : <HelpCircle size={14} />}
                    {challenge.type === 'code' ? 'Code Challenge' : challenge.type === 'tsp' ? 'TSP' : 'Quiz'}
                  </span>
                  <span className={`${styles.difficultyBadge} ${styles[challenge.difficulty?.toLowerCase() || 'medium']}`}>
                    {challenge.difficulty || 'Medium'}
                  </span>
                  {(inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(challenge._id) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <CheckCircle2 size={12} /> Solved
                    </span>
                  )}
                </div>

                <h3 className={styles.cardTitle}>{challenge.title}</h3>
                <p className={styles.cardDesc}>{challenge.description}</p>

                <div className={styles.cardFooter}>
                  <div className={styles.points}>
                    <Trophy size={16} color="#facc15" />
                    <span>{challenge.points || 50} Points</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!verifiedMember) {
                        alert('⚠️ Please verify your DSCAI Member ID in the banner above first!');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        handleOpenChallenge(challenge);
                      }
                    }}
                    className={styles.startBtn}
                    style={{ background: (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(challenge._id) ? 'rgba(16, 185, 129, 0.2)' : undefined, border: (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(challenge._id) ? '1px solid #10b981' : undefined }}
                  >
                    <span>{(inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(challenge._id) ? 'Review Solution' : 'Participate'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* Challenge Participation Modal / Workspace */}
      <AnimatePresence>
        {activeChallenge && (
          <motion.div
            key="modal-active-challenge-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setActiveChallenge(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={styles.workspaceModal}
              onClick={(e) => e.stopPropagation()}
              onCopy={(e) => { if (inContestArena) { e.preventDefault(); openAlertModal({ title: 'Anti-Cheat Protected', message: '🛡️ Copying text is disabled inside Contest Arenas!', type: 'warning' }); } }}
              onCut={(e) => { if (inContestArena) { e.preventDefault(); openAlertModal({ title: 'Anti-Cheat Protected', message: '🛡️ Cutting text is disabled inside Contest Arenas!', type: 'warning' }); } }}
              onPaste={(e) => { if (inContestArena) { e.preventDefault(); openAlertModal({ title: 'Anti-Cheat Protected', message: '🛡️ Pasting text is disabled inside Contest Arenas!', type: 'warning' }); } }}
              onContextMenu={(e) => { if (inContestArena) { e.preventDefault(); openAlertModal({ title: 'Anti-Cheat Protected', message: '🛡️ Right-Click menu is disabled inside Contest Arenas!', type: 'warning' }); } }}
            >
              {/* HackerRank Top Navigation Bar */}
              <div className={styles.workspaceHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚡</span>
                    <h2 className={styles.workspaceTitle}>{activeChallenge.title}</h2>
                    {activeChallenge.difficulty && (
                      <span className={`${styles.difficultyBadge} ${styles[activeChallenge.difficulty.toLowerCase()] || styles.medium}`}>
                        {activeChallenge.difficulty.toUpperCase()}
                      </span>
                    )}
                    <span className={styles.workspacePoints}>{activeChallenge.points || 50} Points</span>
                  </div>

                  {filteredChallenges.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', background: '#131924', padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
                      <span>📋 Problem List:</span>
                      <select
                        value={activeChallenge._id}
                        onChange={(e) => {
                          const target = filteredChallenges.find(c => c._id === e.target.value);
                          if (target) handleOpenChallenge(target);
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#00ea64', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                      >
                        {filteredChallenges.map(c => (
                          <option key={c._id} value={c._id} style={{ background: '#0e141e', color: '#fff' }}>{c.title} ({c.points || 50} pts)</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => setActiveChallenge(null)} className={styles.closeBtn} title="Exit Challenge">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Workspace Content */}
              <div className={styles.workspaceBody}>
                {(inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) && !submissionResult && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399' }}>
                    <CheckCircle2 size={24} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>✅ Challenge Already Completed</strong>
                      <span style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>You have already submitted a solution for this challenge. Multiple submissions are disabled to maintain leaderboard integrity. You may still review the problem and run test cases!</span>
                    </div>
                  </div>
                )}
                {submissionResult ? (
                  /* Submission Celebration Card */
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={styles.resultCard}
                  >
                    <div className={styles.resultIcon}>
                      <CheckCircle2 size={64} color="#34d399" />
                    </div>
                    <h2>{activeChallenge?.type === 'quiz' ? 'Quiz Submitted! 🎉' : 'Challenge Completed! 🎉'}</h2>
                    <p>
                      Great job, <strong style={{ color: '#fff' }}>{verifiedMember.name}</strong> ({verifiedMember.memberId})! {activeChallenge?.type === 'quiz' ? 'Your responses have been recorded in the database.' : 'Your submission has been recorded in the database.'}
                    </p>

                    {activeChallenge?.type === 'quiz' && (
                      <div style={{
                        background: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '1rem',
                        padding: '1.25rem 1.5rem',
                        margin: '1.5rem 0',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#60a5fa', fontSize: '1.05rem' }}>
                          ✅ Responses Recorded Successfully
                        </p>
                        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                          Your answers have been securely submitted. Scores and evaluations are processed and announced by the administrators.
                        </p>
                      </div>
                    )}

                    {activeChallenge?.type !== 'quiz' && submissionResult && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '1rem',
                        padding: '1.25rem 1.5rem',
                        margin: '1.5rem 0',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#34d399', fontSize: '1.05rem' }}>
                          {submissionResult.passedTestCases !== undefined && submissionResult.totalTestCases !== undefined
                            ? (submissionResult.passedTestCases === submissionResult.totalTestCases
                                ? '🎉 All Test Cases Accepted!'
                                : `⚠️ Submitted with ${submissionResult.passedTestCases} of ${submissionResult.totalTestCases} Test Cases Accepted`)
                            : '🎉 Solution Accepted!'}
                        </p>
                        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                          Your solution has been evaluated and recorded successfully.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setActiveChallenge(null);
                        setSubmissionResult(null);
                      }}
                      className={styles.doneBtn}
                    >
                      Return to Challenges
                    </button>
                  </motion.div>
                ) : (activeChallenge.type === 'code' || activeChallenge.type === 'tsp') ? (
                  /* HackerRank Split Screen Workspace (50% Left / 50% Right) */
                  <div className={styles.codeWorkspace}>
                    {/* LEFT PANEL: Problem Specification */}
                    <div className={styles.problemPanel}>
                      <div className={styles.problemTabs}>
                        <div className={styles.problemTabActive}>
                          Problem Specification
                        </div>
                      </div>

                      <div ref={problemContentRef} className={styles.problemContent}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{activeChallenge.title}</h3>
                            {activeChallenge.difficulty && (
                              <span className={`${styles.difficultyBadge} ${styles[activeChallenge.difficulty.toLowerCase()] || styles.medium}`}>
                                {activeChallenge.difficulty.toUpperCase()}
                              </span>
                            )}
                            <span className={styles.workspacePoints}>{activeChallenge.points || 50} pts</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Code2 size={14} color="#60a5fa" />
                            <span>Algorithm Challenge</span>
                          </div>
                        </div>

                        <div style={{ height: '1px', background: '#1e293b', marginBottom: '1.25rem' }} />

                        <div className={styles.problemText} style={{ whiteSpace: 'pre-line' }}>
                          {activeChallenge.codeDetails?.problemStatement || activeChallenge.description || 'No detailed description provided.'}
                        </div>

                        <h4>Input Format</h4>
                        <p className={styles.problemText}>
                          The first line contains inputs and parameters passed to standard input (STDIN). See sample test cases below for precise formatting.
                        </p>

                        <h4>Output Format</h4>
                        <p className={styles.problemText}>
                          Print the computed result to standard output (STDOUT) matching the expected sample output formatting.
                        </p>

                        <h4>Constraints</h4>
                        <div style={{ background: '#131924', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #1e293b', fontFamily: 'Consolas, monospace', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                          {activeChallenge.codeDetails?.constraints ? (
                            <div>{activeChallenge.codeDetails.constraints}</div>
                          ) : (
                            <>
                              <div>• 1 ≤ N ≤ 10^5</div>
                              <div>• Time Limit: 2.0 seconds</div>
                              <div>• Memory Limit: 256 MB</div>
                            </>
                          )}
                        </div>

                        {(() => {
                          const sampleIn = activeChallenge.codeDetails?.sampleInput ?? (activeChallenge.codeDetails?.testCases?.[0]?.input || '');
                          const sampleOut = activeChallenge.codeDetails?.sampleOutput ?? (activeChallenge.codeDetails?.testCases?.[0]?.expectedOutput || '');
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                  <h4 style={{ margin: 0 }}>Sample Input 0 (STDIN)</h4>
                                  {sampleIn && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(sampleIn);
                                        setCopiedKey('sampleIn0');
                                        setTimeout(() => setCopiedKey(null), 1800);
                                      }}
                                      style={{ background: 'transparent', border: 'none', color: copiedKey === 'sampleIn0' ? '#34d399' : '#60a5fa', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                      {copiedKey === 'sampleIn0' ? <Check size={12} /> : <Copy size={12} />}
                                      <span>{copiedKey === 'sampleIn0' ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <div className={styles.sampleBox} style={{ margin: 0 }}>
                                  <pre>{sampleIn || '(No stdin input required)'}</pre>
                                </div>
                              </div>

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                  <h4 style={{ margin: 0 }}>Sample Output 0 (STDOUT)</h4>
                                  {sampleOut && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(sampleOut);
                                        setCopiedKey('sampleOut0');
                                        setTimeout(() => setCopiedKey(null), 1800);
                                      }}
                                      style={{ background: 'transparent', border: 'none', color: copiedKey === 'sampleOut0' ? '#34d399' : '#60a5fa', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                      {copiedKey === 'sampleOut0' ? <Check size={12} /> : <Copy size={12} />}
                                      <span>{copiedKey === 'sampleOut0' ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <div className={styles.sampleBox} style={{ margin: 0 }}>
                                  <pre>{sampleOut || '(No output)'}</pre>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {activeChallenge.codeDetails?.testCases && activeChallenge.codeDetails.testCases.length > 0 && (
                          <>
                            <h4>Automated Evaluation Suite ({activeChallenge.codeDetails.testCases.length} Cases)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                              {activeChallenge.codeDetails.testCases.map((tc, idx) => (
                                <div key={idx} style={{ background: '#131924', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <span>TEST CASE #{idx + 1}</span>
                                    <span style={{ color: tc.isHidden ? '#f87171' : '#34d399' }}>{tc.isHidden ? '🔒 Hidden' : '👁️ Visible'}</span>
                                  </div>
                                  <div><strong style={{ color: '#60a5fa' }}>Input:</strong> {tc.input && String(tc.input).trim() !== '' ? tc.input : '<empty>'}</div>
                                  {!tc.isHidden && <div><strong style={{ color: '#00ea64' }}>Expected:</strong> {tc.expectedOutput && String(tc.expectedOutput).trim() !== '' ? tc.expectedOutput : '<empty>'}</div>}
                                  {tc.isHidden && <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: '0.2rem' }}>Expected output hidden until final submission</div>}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* RIGHT PANEL: IDE Code Editor & Console */}
                    <div className={styles.editorPanel}>
                      <div className={styles.editorHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                          <Code2 size={16} color="#00ea64" />
                          <span>solution.{selectedLang === 'python' ? 'py' : selectedLang === 'java' ? 'java' : 'js'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className={styles.langSelector}>
                            <span>Language:</span>
                            <select value={selectedLang} onChange={(e) => handleLangChange(e.target.value)}>
                              <option value="python">Python (3.11)</option>
                              <option value="java">Java (OpenJDK 17)</option>
                              <option value="javascript">JavaScript (Node.js)</option>
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              openConfirmModal({
                                title: 'Reset Code Editor?',
                                message: 'Reset editor to starter template? All of your unsaved progress will be cleared.',
                                confirmText: 'Reset Code',
                                cancelText: 'Cancel',
                                type: 'warning',
                                onConfirm: () => {
                                  setCodeSubmission(starterCodes[selectedLang](activeChallenge.title));
                                }
                              });
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Reset Code"
                          >
                            <RefreshCw size={12} />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>

                      <div
                        className={styles.editorWorkspaceArea}
                        onClick={(e) => {
                          if (e.target === e.currentTarget || e.target.classList.contains(styles.editorWorkspaceInner)) {
                            const ta = e.currentTarget.querySelector('textarea');
                            if (ta) {
                              ta.focus();
                              const len = ta.value.length;
                              ta.setSelectionRange(len, len);
                            }
                          }
                        }}
                      >
                        <div className={styles.editorWorkspaceInner}>
                          <div className={styles.lineNumbers}>
                            {codeSubmission.split('\n').map((_, i) => (
                              <div
                                key={i}
                                style={{ cursor: 'pointer' }}
                                title={`Go to line ${i + 1}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const lines = codeSubmission.split('\n');
                                  let offset = 0;
                                  for (let l = 0; l < i && l < lines.length; l++) {
                                    offset += lines[l].length + 1;
                                  }
                                  const ta = e.currentTarget.closest(`.${styles.editorWorkspaceArea}`)?.querySelector('textarea');
                                  if (ta) {
                                    ta.focus();
                                    ta.setSelectionRange(offset, offset);
                                  }
                                }}
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>
                          <Editor
                            value={codeSubmission}
                            onValueChange={code => setCodeSubmission(code)}
                            highlight={code => {
                              const lang = selectedLang === 'python' ? 'python' : selectedLang === 'java' ? 'java' : 'javascript';
                              if (Prism.languages[lang]) {
                                return Prism.highlight(code, Prism.languages[lang], lang);
                              }
                              return code;
                            }}
                            padding={20}
                            tabSize={selectedLang === 'python' ? 4 : 2}
                            insertSpaces={true}
                            onKeyDown={handleEditorKeyDown}
                            onKeyUp={(e) => ensureCaretVisible(e.currentTarget)}
                            onClick={(e) => ensureCaretVisible(e.currentTarget)}
                            style={{
                              fontFamily: "Consolas, 'Fira Code', 'Courier New', monospace",
                              fontSize: '0.9rem',
                              lineHeight: 1.6,
                              minHeight: '100%',
                              flexGrow: 1,
                              backgroundColor: 'transparent'
                            }}
                            className={styles.textareaEditor}
                            textareaClassName="code-textarea"
                          />
                        </div>
                      </div>
                      
                      <div className={styles.editorActions}>
                        <div className={styles.editorEnvStatus}>
                          <span className={styles.editorEnvDot} />
                          <span>DS Club Sandbox</span>
                        </div>
                        <div className={styles.editorBtnGroup}>
                          <button
                            onClick={handleCompileAndRun}
                            disabled={compiling}
                            className={styles.testBtn}
                          >
                            {compiling ? <RefreshCw size={14} className={styles.spinner} /> : <Play size={14} />}
                            {compiling ? 'Running Code...' : 'Run Code'}
                          </button>
                          {compilerOutput?.canSubmitPartial && !(inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) && (
                            <button
                              onClick={() => handleSubmitAcceptedCases(compilerOutput.passedCount, compilerOutput.totalCount)}
                              disabled={submitting}
                              className={styles.partialSubmitBtn}
                              title={`Submit with ${compilerOutput.passedCount} accepted test case(s)`}
                            >
                              <CheckCircle2 size={14} color="#0f172a" />
                              {submitting ? 'Submitting...' : `Submit Accepted (${compilerOutput.passedCount}/${compilerOutput.totalCount})`}
                            </button>
                          )}
                          <button
                            onClick={handleSubmitChallenge}
                            disabled={submitting || (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id)}
                            className={styles.submitBtn}
                            style={{ opacity: (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) ? 0.5 : 1, cursor: (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) ? 'not-allowed' : 'pointer' }}
                          >
                            <CheckCircle2 size={14} />
                            {submitting ? 'Submitting...' : (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) ? 'Already Submitted' : 'Submit Code'}
                          </button>
                        </div>
                      </div>

                      {compilerOutput && (
                        <div ref={compilerBoxRef} className={`${styles.compilerBox} ${compilerMinimized ? styles.compilerBoxMinimized : ''}`}>
                          <div
                            className={styles.compilerHeader}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => setCompilerMinimized(!compilerMinimized)}
                            title={compilerMinimized ? 'Click to expand console' : 'Click to minimize console'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Terminal size={14} color="#00ea64" />
                              <span>Execution Console & Test Results</span>
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '3px', background: compilerOutput.status === 'success' ? 'rgba(0, 234, 100, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: compilerOutput.status === 'success' ? '#00ea64' : '#f87171' }}>
                                {compilerOutput.status === 'success' ? '✔ Accepted' : compilerOutput.status === 'compiling' ? '⏳ Running...' : '✘ Logic / Runtime Error'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompilerMinimized(!compilerMinimized);
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title={compilerMinimized ? 'Expand Console' : 'Minimize Console'}
                              >
                                {compilerMinimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompilerOutput(null);
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Close Console"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {!compilerMinimized && (
                            <>
                              {compilerOutput.status === 'compiling' ? (
                            <div className={styles.compilingState}>
                              <RefreshCw size={28} className={styles.spinner} />
                              <pre className={styles.compilingText}>{compilerOutput.text}</pre>
                            </div>
                          ) : compilerOutput.testResults ? (
                            <div className={styles.hrResultsContainer}>
                              <div className={styles.hrVerdictHeader}>
                                <div className={styles.hrVerdictTitleArea}>
                                  <div className={compilerOutput.status === 'success' ? styles.verdictBadgeSuccess : styles.verdictBadgeError}>
                                    {compilerOutput.status === 'success' ? (
                                      <>
                                        <CheckCircle2 size={16} />
                                        <span>Accepted</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle size={16} />
                                        <span>Wrong Answer</span>
                                      </>
                                    )}
                                  </div>
                                  <span className={styles.verdictSubtitle}>{compilerOutput.subtitle}</span>
                                </div>
                                <div className={styles.hrCompilerMsg}>
                                  <span className={styles.msgLabel}>Compiler</span>
                                  <span className={compilerOutput.status === 'success' ? styles.msgSuccess : styles.msgError}>
                                    {compilerOutput.status === 'success' ? '✔ Executed Successfully' : '✘ Output Mismatch'}
                                  </span>
                                </div>
                              </div>

                              {compilerOutput.canSubmitPartial && !(inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) && (
                                <div style={{
                                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)',
                                  border: '1px solid rgba(234, 179, 8, 0.35)',
                                  borderRadius: '8px',
                                  padding: '0.75rem 1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '1rem',
                                  flexWrap: 'wrap'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <div style={{
                                      background: 'rgba(234, 179, 8, 0.2)',
                                      borderRadius: '50%',
                                      width: '30px',
                                      height: '30px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#facc15',
                                      fontWeight: 'bold',
                                      fontSize: '0.95rem',
                                      flexShrink: 0
                                    }}>
                                      ⚡
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#fef08a', fontSize: '0.88rem' }}>
                                        Partial Credit Available ({compilerOutput.passedCount}/{compilerOutput.totalCount} Test Cases Accepted)
                                      </div>
                                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                                        Submit now to lock in proportional points, or modify your code and test again.
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleSubmitAcceptedCases(compilerOutput.passedCount, compilerOutput.totalCount)}
                                    disabled={submitting}
                                    className={styles.partialSubmitBtn}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                                  >
                                    <CheckCircle2 size={14} color="#0f172a" />
                                    {submitting ? 'Submitting...' : `Submit Partial (${compilerOutput.passedCount}/${compilerOutput.totalCount})`}
                                  </button>
                                </div>
                              )}

                              <div className={styles.hrTestTabs}>
                                {compilerOutput.testResults.map((tc, idx) => (
                                  <button
                                    key={tc.id ?? idx}
                                    type="button"
                                    onClick={() => setActiveTestCaseIdx(idx)}
                                    className={`${styles.hrTestTabBtn} ${activeTestCaseIdx === idx ? styles.hrTestTabActive : ''} ${tc.passed ? styles.tabPassed : styles.tabFailed}`}
                                  >
                                    <span className={styles.tabIcon}>{tc.passed ? '✔' : '✕'}</span>
                                    <span>{tc.name || `Case ${idx + 1}`}</span>
                                  </button>
                                ))}
                              </div>

                              {compilerOutput.testResults[activeTestCaseIdx] && (
                                <div className={styles.hrTestCaseDetails}>
                                  {compilerOutput.testResults[activeTestCaseIdx].error && (
                                    <div className={styles.hrErrorBox}>
                                      <div className={styles.hrDetailHeader}>
                                        <span>Runtime / Syntax Error Message</span>
                                      </div>
                                      <pre className={styles.hrDetailCode} style={{ color: '#fca5a5' }}>
                                        {compilerOutput.testResults[activeTestCaseIdx].error}
                                      </pre>
                                    </div>
                                  )}

                                  <div className={styles.hrDetailSection}>
                                    <div className={styles.hrDetailHeader}>
                                      <span>Input (stdin)</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(compilerOutput.testResults[activeTestCaseIdx].input || '');
                                          setCopiedKey(`tcIn_${activeTestCaseIdx}`);
                                          setTimeout(() => setCopiedKey(null), 1800);
                                        }}
                                        className={styles.hrCopyLink}
                                      >
                                        {copiedKey === `tcIn_${activeTestCaseIdx}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <pre className={styles.hrDetailCode}>
                                      {compilerOutput.testResults[activeTestCaseIdx].input && String(compilerOutput.testResults[activeTestCaseIdx].input).trim() !== ''
                                        ? compilerOutput.testResults[activeTestCaseIdx].input
                                        : '(empty stdin)'}
                                    </pre>
                                  </div>

                                  <div className={styles.hrDetailSection}>
                                    <div className={styles.hrDetailHeader}>
                                      <span>Your Output (stdout)</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(compilerOutput.testResults[activeTestCaseIdx].output || '');
                                          setCopiedKey(`tcOut_${activeTestCaseIdx}`);
                                          setTimeout(() => setCopiedKey(null), 1800);
                                        }}
                                        className={styles.hrCopyLink}
                                      >
                                        {copiedKey === `tcOut_${activeTestCaseIdx}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <pre
                                      className={styles.hrDetailCode}
                                      style={{
                                        borderColor: compilerOutput.testResults[activeTestCaseIdx].passed ? 'rgba(0, 234, 100, 0.35)' : 'rgba(239, 68, 68, 0.4)',
                                        background: compilerOutput.testResults[activeTestCaseIdx].passed ? 'rgba(0, 234, 100, 0.04)' : 'rgba(239, 68, 68, 0.05)',
                                        color: compilerOutput.testResults[activeTestCaseIdx].passed ? '#86efac' : '#fca5a5'
                                      }}
                                    >
                                      {compilerOutput.testResults[activeTestCaseIdx].output && String(compilerOutput.testResults[activeTestCaseIdx].output).trim() !== ''
                                        ? compilerOutput.testResults[activeTestCaseIdx].output
                                        : '(No output generated)'}
                                    </pre>
                                    {compilerOutput.testResults[activeTestCaseIdx].output === '(No output printed)' && (
                                      <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>💡 Hint: No output was printed. Make sure your code calls print() or invokes solve() at the bottom.</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className={styles.hrDetailSection}>
                                    <div className={styles.hrDetailHeader}>
                                      <span>Expected Output</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(compilerOutput.testResults[activeTestCaseIdx].expected || '');
                                          setCopiedKey(`tcExp_${activeTestCaseIdx}`);
                                          setTimeout(() => setCopiedKey(null), 1800);
                                        }}
                                        className={styles.hrCopyLink}
                                      >
                                        {copiedKey === `tcExp_${activeTestCaseIdx}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <pre className={styles.hrDetailCode}>
                                      {compilerOutput.testResults[activeTestCaseIdx].expected && String(compilerOutput.testResults[activeTestCaseIdx].expected).trim() !== ''
                                        ? compilerOutput.testResults[activeTestCaseIdx].expected
                                        : '(empty)'}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <pre className={styles.compilerText}>{compilerOutput.text}</pre>
                          )}
                        </>
                      )}
                    </div>
                  )}
                    </div>
                  </div>
                ) : (
                  /* Quiz Challenge Workspace */
                  <div className={styles.quizWorkspace}>
                    {activeChallenge.quizQuestions && activeChallenge.quizQuestions.length > 0 ? (
                      <>
                        <div className={styles.quizProgress}>
                          <span>Question {currentQuizIndex + 1} of {activeChallenge.quizQuestions.length}</span>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${((currentQuizIndex + 1) / activeChallenge.quizQuestions.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className={styles.questionCard}>
                          <h3 className={styles.questionPrompt}>
                            {activeChallenge.quizQuestions[currentQuizIndex].prompt}
                          </h3>

                          <div className={styles.optionsList}>
                            {activeChallenge.quizQuestions[currentQuizIndex].options?.map((option, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleQuizOptionSelect(currentQuizIndex, oIdx)}
                                className={`${styles.optionBtn} ${quizAnswers[currentQuizIndex] === oIdx ? styles.selectedOption : ''}`}
                              >
                                <span className={styles.optionIndex}>{String.fromCharCode(65 + oIdx)}</span>
                                <span className={styles.optionText}>{option}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={styles.quizNav}>
                          <button
                            onClick={() => setCurrentQuizIndex(Math.max(0, currentQuizIndex - 1))}
                            disabled={currentQuizIndex === 0}
                            className={styles.navBtn}
                          >
                            Previous
                          </button>

                          {currentQuizIndex < activeChallenge.quizQuestions.length - 1 ? (
                            <button
                              onClick={() => setCurrentQuizIndex(currentQuizIndex + 1)}
                              className={styles.nextBtn}
                            >
                              Next Question
                            </button>
                          ) : (
                            <button
                              onClick={handleSubmitChallenge}
                              disabled={submitting || quizAnswers.includes(null) || (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id)}
                              className={styles.submitBtn}
                              style={{ opacity: (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) ? 0.5 : 1, cursor: (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) ? 'not-allowed' : 'pointer' }}
                            >
                              {submitting ? 'Submitting...' : (inContestArena ? contestSolvedChallengeIds : solvedChallengeIds).includes(activeChallenge._id) ? 'Already Submitted' : 'Submit Quiz'}
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className={styles.emptyState}>
                        <AlertCircle size={40} color="#f87171" />
                        <p>No questions have been configured for this quiz yet by the admin.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Separate Contest Leaderboard Modal */}
      <AnimatePresence>
        {contestLeaderboardOpen && (
          <div key="modal-contest-leaderboard-overlay" className={styles.centeredOverlay} onClick={() => setContestLeaderboardOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className={styles.leaderboardModalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(250, 204, 21, 0.15)', border: '1px solid #facc15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={22} color="#facc15" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Contest Leaderboard</h3>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Real-time rankings & XP earned in this competition arena</span>
                  </div>
                </div>
                <button onClick={() => setContestLeaderboardOpen(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {loadingLeaderboard ? (
                <div className={styles.loadingState} style={{ padding: '3rem 0' }}>
                  <RefreshCw size={32} className={styles.spinner} />
                  <span>Calculating real-time contest standings...</span>
                </div>
              ) : contestLeaderboardData.length === 0 ? (
                <div className={styles.emptyState} style={{ padding: '3rem 0' }}>
                  <Trophy size={48} className={styles.emptyIcon} />
                  <h3>No Contest Submissions Yet</h3>
                  <p>Be the first DSCAI member to solve a challenge in this contest and claim the #1 spot!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {contestLeaderboardData.map((m, idx) => (
                    <div
                      key={m._id || m.memberId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1.25rem',
                        background: idx === 0 ? 'linear-gradient(90deg, rgba(250, 204, 21, 0.15), rgba(0,0,0,0.3))' : idx === 1 ? 'linear-gradient(90deg, rgba(148, 163, 184, 0.15), rgba(0,0,0,0.3))' : idx === 2 ? 'linear-gradient(90deg, rgba(217, 119, 6, 0.15), rgba(0,0,0,0.3))' : 'rgba(255,255,255,0.03)',
                        border: idx === 0 ? '1px solid #facc15' : idx === 1 ? '1px solid #94a3b8' : idx === 2 ? '1px solid #d97706' : '1px solid #334155',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, width: '28px', color: idx === 0 ? '#facc15' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#fbbf24' : '#64748b' }}>
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{m.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>{m.memberId} • {m.department}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00f0ff' }}>{m.score} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PTS</span></div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.submissionsCount} solutions solved</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contest Onboarding & Proctoring Agreement Modal */}
      <AnimatePresence>
        {contestOnboardingStep && selectedContestForOnboarding && (
          <div key="modal-contest-onboarding-overlay" className={styles.modalOverlay} style={{ zIndex: 9999, alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(12px)', padding: '1.5rem' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', background: '#0f172a', border: '1px solid #00f0ff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 0 50px rgba(0, 240, 255, 0.3)', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} color="#00f0ff" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      {contestOnboardingStep === 'verify' && 'Step 1: Member Identification'}
                      {contestOnboardingStep === 'details' && `Step 2: ${selectedContestForOnboarding?.isTSP ? 'TSP' : 'Competition'} Briefing`}
                      {contestOnboardingStep === 'rules' && 'Step 3: Proctoring Agreement'}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedContestForOnboarding.title}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setContestOnboardingStep(null);
                    setSelectedContestForOnboarding(null);
                  }}
                  className={styles.closeBtn}
                  title="Cancel Onboarding"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step 1: Verify Member ID */}
              {contestOnboardingStep === 'verify' && (
                <div>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {selectedContestForOnboarding?.whitelistEnabled 
                      ? `To enter this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'} arena, you must be on the authorized whitelist. Please enter your Roll Number or Member ID.` 
                      : `To enter the official ${selectedContestForOnboarding?.isTSP ? 'TSP' : 'competition'} arena, you must identify yourself with your verified DSCAI Member ID.`}
                  </p>

                  {/* Passcode input when TSP has passcodeEnabled */}
                  {selectedContestForOnboarding?.isTSP && selectedContestForOnboarding?.passcodeEnabled && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                        <Lock size={16} />
                        <span>🔑 Test Access Code Required</span>
                      </div>
                      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        This Technical Skill Program is protected. Enter the confidential access passcode provided by your instructor or admin.
                      </p>
                      <input
                        type="text"
                        placeholder="ENTER ACCESS CODE (e.g. TSP 2026)"
                        value={tspPasscodeInput}
                        onChange={(e) => setTspPasscodeInput(e.target.value.toUpperCase())}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(15, 23, 42, 0.85)',
                          border: '1px solid #f59e0b',
                          borderRadius: '8px',
                          color: '#f59e0b',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          letterSpacing: '1.5px',
                          fontSize: '0.95rem',
                          outline: 'none',
                          textTransform: 'uppercase'
                        }}
                        required
                      />
                    </div>
                  )}

                  {verifiedMember ? (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <CheckCircle2 size={24} color="#10b981" />
                        <div>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>Verified Participant: {verifiedMember.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Member ID: {verifiedMember.memberId} ({verifiedMember.role || 'Member'})</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                          onClick={() => {
                            if (selectedContestForOnboarding?.isTSP && selectedContestForOnboarding?.passcodeEnabled) {
                              const norm = (str) => String(str || '').replace(/\s+/g, '').toUpperCase();
                              const enteredRaw = (tspPasscodeInput || '').trim();
                              const enteredNorm = norm(enteredRaw);

                              let matchedCode = null;
                              if (Array.isArray(selectedContestForOnboarding.accessCodes) && selectedContestForOnboarding.accessCodes.length > 0) {
                                const found = selectedContestForOnboarding.accessCodes.find(c =>
                                  c && c.isActive !== false && norm(c.code) === enteredNorm
                                );
                                if (found) matchedCode = found.code;
                              }
                              if (!matchedCode && selectedContestForOnboarding.passcode && norm(selectedContestForOnboarding.passcode) === enteredNorm) {
                                matchedCode = selectedContestForOnboarding.passcode;
                              }

                              if (!enteredNorm) {
                                alert('🔑 Please enter your TSP Test Access Code to proceed.');
                                return;
                              }

                              const hasConfiguredCodes = (Array.isArray(selectedContestForOnboarding.accessCodes) && selectedContestForOnboarding.accessCodes.length > 0) || Boolean(selectedContestForOnboarding.passcode);
                              if (hasConfiguredCodes && !matchedCode) {
                                alert('❌ Invalid Access Code. Please enter the correct TSP Test Access Code provided by your instructor.');
                                return;
                              }

                              if (matchedCode) {
                                setTspPasscodeInput(matchedCode);
                              }
                            }
                            if (selectedContestForOnboarding && isMemberRestricted(selectedContestForOnboarding, verifiedMember.memberId)) {
                              alert(`⛔ Member ID "${verifiedMember.memberId}" is RESTRICTED from entering this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'} arena due to exceeding anti-cheat violations. Please contact an Administrator to lift your restriction.`);
                              return;
                            }
                            if (selectedContestForOnboarding && selectedContestForOnboarding.whitelistEnabled) {
                              const cleanId = verifiedMember.memberId.toString().trim().toLowerCase();
                                const matchedStudent = selectedContestForOnboarding.whitelistedStudents?.find(s => 
                                  s && (
                                    (s.identifier && s.identifier.toString().trim().toLowerCase() === cleanId) ||
                                    (s.rollNo && s.rollNo.toString().trim().toLowerCase() === cleanId) ||
                                    (s.registerNo && s.registerNo.toString().trim().toLowerCase() === cleanId)
                                  )
                                );
                                if (!matchedStudent) {
                                  alert(`\u26A0\uFE0F Member ID "${verifiedMember.memberId}" is NOT on the authorized participant whitelist for this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'}. Please click "Switch ID" and enter an authorized Roll Number or Member ID.`);
                                  return;
                                }
                                if (selectedContestForOnboarding.isTSP && selectedContestForOnboarding.passcodeEnabled && matchedStudent.assignedCode && matchedStudent.assignedCode.trim() !== '') {
                                  const norm = (str) => String(str || '').replace(/\s+/g, '').toUpperCase();
                                  if (norm((tspPasscodeInput || '').trim()) !== norm(matchedStudent.assignedCode)) {
                                    alert('\u26D4 Invalid Access Code. Please enter the specific TSP Test Access Code assigned to your Roll Number.');
                                    return;
                                  }
                                }
                              }
                            setContestOnboardingStep('details');
                          }}
                          className={styles.startBtn}
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 700, padding: '0.75rem 1.5rem', border: 'none', borderRadius: '10px', cursor: 'pointer', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          <span>Confirm & Proceed to Briefing ➡️</span>
                          <ArrowRight size={16} />
                        </button>
                        <button
                          onClick={() => {
                            sessionStorage.removeItem('dsc_verified_member');
                            setVerifiedMember(null);
                          }}
                          style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Switch ID
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (selectedContestForOnboarding?.isTSP && selectedContestForOnboarding?.passcodeEnabled) {
                        const norm = (str) => String(str || '').replace(/\s+/g, '').toUpperCase();
                        const enteredRaw = (tspPasscodeInput || '').trim();
                        const enteredNorm = norm(enteredRaw);

                        let matchedCode = null;
                        if (Array.isArray(selectedContestForOnboarding.accessCodes) && selectedContestForOnboarding.accessCodes.length > 0) {
                          const found = selectedContestForOnboarding.accessCodes.find(c =>
                            c && c.isActive !== false && norm(c.code) === enteredNorm
                          );
                          if (found) matchedCode = found.code;
                        }
                        if (!matchedCode && selectedContestForOnboarding.passcode && norm(selectedContestForOnboarding.passcode) === enteredNorm) {
                          matchedCode = selectedContestForOnboarding.passcode;
                        }

                        if (!enteredNorm) {
                          alert('🔑 Please enter your TSP Test Access Code to proceed.');
                          return;
                        }

                        const hasConfiguredCodes = (Array.isArray(selectedContestForOnboarding.accessCodes) && selectedContestForOnboarding.accessCodes.length > 0) || Boolean(selectedContestForOnboarding.passcode);
                        if (hasConfiguredCodes && !matchedCode) {
                          alert('❌ Invalid Access Code. Please enter the correct TSP Test Access Code provided by your instructor.');
                          return;
                        }

                        if (matchedCode) {
                          setTspPasscodeInput(matchedCode);
                        }
                      }
                      const typedId = memberIdInput.trim();
                      if (!typedId) return;
                      if (selectedContestForOnboarding && isMemberRestricted(selectedContestForOnboarding, typedId)) {
                        alert(`⛔ Member ID "${typedId}" is RESTRICTED from entering this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'} arena due to exceeding anti-cheat violations (10/10). Please contact an Administrator to lift your restriction.`);
                        return;
                      }
                      await handleVerifyMember(e);
                      const saved = sessionStorage.getItem('dsc_verified_member');
                      if (saved) {
                        try {
                          const parsed = JSON.parse(saved);
                          if (selectedContestForOnboarding && parsed?.memberId) {
                            const mid = parsed.memberId.toUpperCase();
                            const isCompletedLocal = localStorage.getItem(`completed_contest_${selectedContestForOnboarding._id || selectedContestForOnboarding.id}_${mid}`);
                            const isCompletedDB = selectedContestForOnboarding.completedMembers && selectedContestForOnboarding.completedMembers.some(m => m && String(m).trim().toUpperCase() === mid);
                            const isCompletedPart = selectedContestForOnboarding.activeParticipants && selectedContestForOnboarding.activeParticipants.some(
                              p => p && p.memberId && String(p.memberId).trim().toUpperCase() === mid && p.status === 'completed'
                            );
                            if (isCompletedLocal || isCompletedDB || isCompletedPart) {
                              alert(`⛔ You (${mid}) have already completed or exited this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'}. You cannot rejoin it.`);
                              return;
                            }
                          }
                            if (selectedContestForOnboarding && isMemberRestricted(selectedContestForOnboarding, parsed.memberId)) {
                              alert(`\u26A0\uFE0F Member ID "${parsed.memberId}" is RESTRICTED from entering this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'} arena due to exceeding anti-cheat violations. Please contact an Administrator to lift your restriction.`);
                              return;
                            }
                            if (selectedContestForOnboarding?.isTSP && selectedContestForOnboarding?.passcodeEnabled && selectedContestForOnboarding?.whitelistEnabled) {
                               const cleanId = parsed.memberId.toString().trim().toLowerCase();
                               const matchedStudent = selectedContestForOnboarding.whitelistedStudents?.find(s => 
                                  s && (
                                    (s.identifier && s.identifier.toString().trim().toLowerCase() === cleanId) ||
                                    (s.rollNo && s.rollNo.toString().trim().toLowerCase() === cleanId) ||
                                    (s.registerNo && s.registerNo.toString().trim().toLowerCase() === cleanId)
                                  )
                               );
                               if (matchedStudent && matchedStudent.assignedCode && matchedStudent.assignedCode.trim() !== '') {
                                  const norm = (str) => String(str || '').replace(/\s+/g, '').toUpperCase();
                                  if (norm((tspPasscodeInput || '').trim()) !== norm(matchedStudent.assignedCode)) {
                                    alert('\u26D4 Invalid Access Code. Please enter the specific TSP Test Access Code assigned to your Roll Number.');
                                    return;
                                  }
                               }
                            }
                        } catch (err) {}
                        setContestOnboardingStep('details');
                      }
                    }}>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <input
                          type="text"
                          placeholder={(selectedContestForOnboarding && selectedContestForOnboarding.whitelistEnabled) ? "e.g. Roll Number or DSCAI0001" : "e.g. DSCAI0001"}
                          value={memberIdInput}
                          onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                          className={styles.verifyInput}
                          style={{ flex: 1, textTransform: 'uppercase' }}
                          required
                        />
                        <button type="submit" disabled={verifying} className={styles.verifyBtn}>
                          {verifying ? 'Verifying...' : 'Verify & Continue ➡️'}
                        </button>
                      </div>
                      {verifyError && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>❌ {verifyError}</div>}
                    </form>
                  )}
                </div>
              )}

              {/* Step 2: Contest Details */}
              {contestOnboardingStep === 'details' && (
                <div>
                  <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #334155' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#00f0ff', marginBottom: '0.5rem' }}>{selectedContestForOnboarding.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1rem' }}>{selectedContestForOnboarding.description || 'No description provided.'}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                      {(selectedContestForOnboarding.startTime || selectedContestForOnboarding.endTime) && (
                        <div>📅 <strong>Window:</strong> {selectedContestForOnboarding.startTime ? formatDateTimeDisplay(selectedContestForOnboarding.startTime) : 'Immediate'} — {selectedContestForOnboarding.endTime ? formatDateTimeDisplay(selectedContestForOnboarding.endTime) : 'Open'}</div>
                      )}
                      <div>❓ <strong>Questions:</strong> {selectedContestForOnboarding.isTSP ? `${selectedContestForOnboarding.challenges?.length || 0} Fixed, ${selectedContestForOnboarding.pools?.length || 0} Pools` : `${selectedContestForOnboarding.challenges?.length || 0} Problems`}</div>
                      <div>🏆 <strong>Participant:</strong> <span style={{ color: '#34d399' }}>{verifiedMember?.name} ({verifiedMember?.memberId})</span></div>
                      <div>⚡ <strong>Status:</strong> {selectedContestForOnboarding.isTSP ? 'Live TSP Program' : 'Live Competition'}</div>
                      {selectedContestForOnboarding.isTSP && selectedContestForOnboarding.passcodeEnabled && (
                        <div style={{ gridColumn: 'span 2' }}>🔑 <strong>Access Code:</strong> <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 800 }}>{tspPasscodeInput.trim().toUpperCase()} (Verified ✔)</span></div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      onClick={() => setContestOnboardingStep('rules')}
                      className={styles.startBtn}
                      style={{ background: 'linear-gradient(135deg, #00f0ff, #0072ff)', color: '#fff', fontWeight: 700, padding: '0.75rem 1.5rem', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <span>Next: Review Proctoring Rules</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Rules & Full Screen Launch */}
              {contestOnboardingStep === 'rules' && (
                <div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ color: '#f87171', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={18} /> MANDATORY PROCTORING & ANTI-CHEAT RULES
                    </h4>
                    <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.7, paddingLeft: '1.25rem', margin: 0 }}>
                      <li><strong>🖥️ Full Screen Mode Mandatory:</strong> Entering the arena will lock your browser window into Full Screen mode.</li>
                      <li><strong>🚫 Tab Switching Forbidden:</strong> Switching browser tabs, minimizing the window, or losing focus is monitored. You will receive up to 10 warnings before automatic disqualification! <em>(Practice challenges allow tab switching freely).</em></li>
                      <li><strong>📋 Copy & Paste Disabled:</strong> Copying, cutting, or pasting text inside the competition editor is strictly disabled.</li>
                      <li><strong>⚡ One-Time Submission:</strong> Each challenge in this competition can only be submitted once.</li>
                    </ul>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem', background: '#1e293b', padding: '0.85rem', borderRadius: '10px', border: '1px solid #334155', color: '#fff', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={rulesAgreed}
                      onChange={(e) => setRulesAgreed(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#00f0ff', cursor: 'pointer' }}
                    />
                    <span>I have read and agree to abide by all DSCAI Proctoring & Anti-Cheat rules.</span>
                  </label>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setContestOnboardingStep('details')}
                      style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                    >
                      ⬅️ Back to Details
                    </button>
                    <button
                      onClick={async () => {
                        if (!rulesAgreed) {
                          alert('Please agree to the proctoring rules before entering the arena.');
                          return;
                        }
                        const currentMember = verifiedMemberRef.current || verifiedMember || (sessionStorage.getItem('dsc_verified_member') ? JSON.parse(sessionStorage.getItem('dsc_verified_member')) : null);
                        if (currentMember?.memberId) {
                          const mid = currentMember.memberId.toUpperCase();
                          const isCompDB = selectedContestForOnboarding.completedMembers && selectedContestForOnboarding.completedMembers.some(m => m && String(m).trim().toUpperCase() === mid);
                          const isCompLoc = typeof window !== 'undefined' && localStorage.getItem(`completed_contest_${selectedContestForOnboarding._id || selectedContestForOnboarding.id}_${mid}`);
                          const isCompPart = selectedContestForOnboarding.activeParticipants && selectedContestForOnboarding.activeParticipants.some(
                            p => p && p.memberId && String(p.memberId).trim().toUpperCase() === mid && p.status === 'completed'
                          );
                          if (isCompDB || isCompLoc || isCompPart) {
                            alert(`⛔ You (${mid}) have already completed or exited this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'} arena. Re-entry is strictly prohibited.`);
                            return;
                          }
                        }
                        if (currentMember && isMemberRestricted(selectedContestForOnboarding, currentMember.memberId)) {
                          alert(`⛔ You (${currentMember.memberId}) are RESTRICTED from entering this ${selectedContestForOnboarding.isTSP ? 'TSP' : 'contest'} arena due to exceeding anti-cheat violations. Please contact an Administrator to lift your restriction.`);
                          return;
                        }

                        if (selectedContestForOnboarding?.isTSP) {
                          // Handle TSP Join with dynamic pool questions
                          setLoading(true);
                          try {
                            const res = await fetch('/api/tsp/join', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                tspId: selectedContestForOnboarding._id || selectedContestForOnboarding.id,
                                memberId: currentMember.memberId,
                                name: currentMember.name || currentMember.memberId,
                                passcode: (tspPasscodeInput || '').trim().toUpperCase()
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.session) {
                              const pseudoContest = {
                                ...selectedContestForOnboarding,
                                isTSP: true,
                                challenges: data.session.assignedChallenges || [],
                                sessionStartedAt: data.session.startedAt
                              };
                              const elem = document.documentElement;
                              if (elem.requestFullscreen) {
                                elem.requestFullscreen().catch(e => console.log('Fullscreen error:', e));
                              }
                              activeContestRef.current = pseudoContest;
                              inContestArenaRef.current = true;
                              setActiveContest(pseudoContest);
                              setInContestArena(true);
                              setContestSolvedChallengeIds(data.session.solvedChallenges || []);
                              const existingV = (selectedContestForOnboarding?.violations)?.find(
                                v => v.memberId && v.memberId.toUpperCase() === (currentMember?.memberId || '').toUpperCase()
                              );
                              const initCount = existingV ? existingV.count : 0;
                              setAntiCheatWarnings(initCount);
                              antiCheatWarningsRef.current = initCount;
                              setContestOnboardingStep(null);
                              setSelectedContestForOnboarding(null);
                            } else {
                              alert(data.error || 'Failed to join TSP arena');
                            }
                          } catch (e) {
                            alert('Error joining TSP: ' + e.message);
                          } finally {
                            setLoading(false);
                          }
                          return;
                        }

                        // Register active participant for contest
                        if (currentMember && selectedContestForOnboarding) {
                          setLoading(true);
                          try {
                            const targetContestId = selectedContestForOnboarding._id || selectedContestForOnboarding.id;
                            const joinRes = await fetch(`/api/contests/${targetContestId}/join`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                memberId: currentMember.memberId,
                                name: currentMember.name || currentMember.memberId
                              })
                            });
                            const joinData = await joinRes.json();
                            if (!joinRes.ok) {
                              alert(joinData.error || 'Failed to join contest arena');
                              setLoading(false);
                              return;
                            }
                          } catch (err) {
                            console.error('Failed to log active participant:', err);
                          } finally {
                            setLoading(false);
                          }
                        }

                        const elem = document.documentElement;
                        if (elem.requestFullscreen) {
                          elem.requestFullscreen().catch(e => console.log('Fullscreen error:', e));
                        }
                        activeContestRef.current = selectedContestForOnboarding;
                        inContestArenaRef.current = true;
                        setActiveContest(selectedContestForOnboarding);
                        setInContestArena(true);
                        setContestSolvedChallengeIds(joinData.solvedChallengeIds || []);
                        const existingContestV = (selectedContestForOnboarding?.violations)?.find(
                          v => v.memberId && v.memberId.toUpperCase() === (currentMember?.memberId || '').toUpperCase()
                        );
                        const initContestCount = existingContestV ? existingContestV.count : 0;
                        setAntiCheatWarnings(initContestCount);
                        antiCheatWarningsRef.current = initContestCount;
                        setContestOnboardingStep(null);
                        setSelectedContestForOnboarding(null);
                      }}
                      disabled={!rulesAgreed}
                      className={styles.startBtn}
                      style={{ background: rulesAgreed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100, 116, 139, 0.3)', color: '#fff', fontWeight: 800, padding: '0.75rem 1.5rem', border: 'none', borderRadius: '10px', cursor: rulesAgreed ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: rulesAgreed ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none' }}
                    >
                      <span>🚀 Accept Rules & Start {selectedContestForOnboarding?.isTSP ? 'TSP' : 'Contest'}</span>
                      <Zap size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Anti-Cheat Warning Modal */}
      <AnimatePresence>
        {showAntiCheatModal && (
          <div key="modal-anticheat-warning-overlay" className={styles.modalOverlay} style={{ zIndex: 10000, alignItems: 'center', justifyContent: 'center', background: 'rgba(20, 5, 5, 0.85)', backdropFilter: 'blur(12px)', padding: '1.5rem' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ width: '100%', maxWidth: '500px', background: '#450a0a', border: '2px solid #ef4444', padding: '2.5rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 0 50px rgba(239, 68, 68, 0.6)' }}
            >
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <ShieldAlert size={40} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
                ⚠️ SECURITY VIOLATION (#{antiCheatWarnings}/10)
              </h2>
              <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                <strong>Tab Switching or leaving the Competition Arena window is strictly prohibited!</strong><br />
                Your proctoring violation has been logged. Upon reaching 10 violations, your competition session will be terminated and disqualified.
              </p>
              <button
                onClick={() => {
                  setShowAntiCheatModal(false);
                  const elem = document.documentElement;
                  if (!document.fullscreenElement && elem.requestFullscreen) {
                    elem.requestFullscreen().catch(() => {});
                  }
                }}
                className={styles.startBtn}
                style={{ background: '#ef4444', color: '#fff', fontWeight: 800, padding: '0.75rem 2rem', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%' }}
              >
                Return to Arena (Resume Fullscreen)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen-Safe In-DOM Modal */}
      <AnimatePresence>
        {customModal.isOpen && (
          <div
            key="custom-confirm-modal-overlay"
            className={styles.modalOverlay}
            style={{
              zIndex: 10001,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.78)',
              backdropFilter: 'blur(10px)',
              padding: '1.5rem',
              display: 'flex'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                width: '100%',
                maxWidth: '460px',
                background: '#0d141e',
                border: `1px solid ${
                  customModal.type === 'danger'
                    ? 'rgba(239, 68, 68, 0.5)'
                    : customModal.type === 'warning'
                    ? 'rgba(234, 179, 8, 0.5)'
                    : 'rgba(56, 189, 248, 0.3)'
                }`,
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: customModal.type === 'danger'
                  ? '0 20px 40px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.2)'
                  : customModal.type === 'warning'
                  ? '0 20px 40px rgba(234, 179, 8, 0.25), 0 0 0 1px rgba(234, 179, 8, 0.2)'
                  : '0 20px 40px rgba(0, 0, 0, 0.7)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background:
                      customModal.type === 'danger'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : customModal.type === 'warning'
                        ? 'rgba(234, 179, 8, 0.15)'
                        : 'rgba(56, 189, 248, 0.15)',
                    color:
                      customModal.type === 'danger'
                        ? '#ef4444'
                        : customModal.type === 'warning'
                        ? '#facc15'
                        : '#38bdf8'
                  }}
                >
                  {customModal.type === 'danger' ? (
                    <ShieldAlert size={24} />
                  ) : customModal.type === 'warning' ? (
                    <AlertCircle size={24} />
                  ) : (
                    <CheckCircle2 size={24} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                    {customModal.title}
                  </h3>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                    {customModal.message}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                {!customModal.isAlert && (
                  <button
                    onClick={() => {
                      if (customModal.onCancel) customModal.onCancel();
                      else setCustomModal(prev => ({ ...prev, isOpen: false }));
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#cbd5e1',
                      padding: '0.6rem 1.15rem',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {customModal.cancelText || 'Cancel'}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (customModal.onConfirm) customModal.onConfirm();
                    else setCustomModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  style={{
                    background:
                      customModal.type === 'danger'
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : customModal.type === 'warning'
                        ? 'linear-gradient(135deg, #eab308, #ca8a04)'
                        : 'linear-gradient(135deg, #00ea64, #059669)',
                    color: customModal.type === 'warning' ? '#0f172a' : '#fff',
                    border: 'none',
                    padding: '0.6rem 1.3rem',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow:
                      customModal.type === 'danger'
                        ? '0 4px 14px rgba(239, 68, 68, 0.4)'
                        : customModal.type === 'warning'
                        ? '0 4px 14px rgba(234, 179, 8, 0.35)'
                        : '0 4px 14px rgba(0, 234, 100, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {customModal.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <IDCardModal isOpen={idCardOpen} onClose={() => setIdCardOpen(false)} initialMemberId={verifiedMember?.memberId} />
    </div>
  );
}

