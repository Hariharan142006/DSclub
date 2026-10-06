const fs = require('fs');
let content = fs.readFileSync('app/challenges/page.js', 'utf8');

const helper = \export default function ChallengesPage() {
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
        if (localStorage.getItem(\\\completed_contest_\_\\\\)) return true;
      }
    }
    return false;
  };\;

if (!content.includes('const checkIsCompleted =')) {
  content = content.replace('export default function ChallengesPage() {', helper);
}

// Block 1
content = content.replace(
  'const isCompletedLocal = localStorage.getItem(\completed_contest__\);\\n      const isCompletedDB = targetContest.completedMembers && targetContest.completedMembers.some(m => m && String(m).trim().toUpperCase() === typedIdForCompleteCheck);\\n      const isCompletedPart = targetContest.activeParticipants && targetContest.activeParticipants.some(\\n        p => p && p.memberId && String(p.memberId).trim().toUpperCase() === typedIdForCompleteCheck && p.status === \\'completed\\'\\n      );\\n      \\n      if (isCompletedLocal || isCompletedDB || isCompletedPart) {',
  'if (checkIsCompleted(targetContest, typedIdForCompleteCheck)) {'
);

// Block 2
content = content.replace(
  'const isCompletedDB = activeTSP.completedMembers && cleanMid && activeTSP.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);\\n    const isCompletedLocal = typeof window !== \\'undefined\\' && cleanMid && localStorage.getItem(\completed_contest__\);\\n    const isCompletedParticipant = activeTSP.activeParticipants && cleanMid && activeTSP.activeParticipants.some(\\n      p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === \\'completed\\'\\n    );\\n    if (isCompletedDB || isCompletedLocal || isCompletedParticipant) {',
  'if (checkIsCompleted(activeTSP, cleanMid)) {'
);

// Block 3
content = content.replace(
  'const isCompletedDB = cleanMid && c.completedMembers && c.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);\\n                      const isCompletedPart = cleanMid && c.activeParticipants && c.activeParticipants.some(p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === \\'completed\\');\\n                      const isCompletedLocal = typeof window !== \\'undefined\\' && cleanMid && localStorage.getItem(\completed_contest__\);\\n                      const isCompleted = isCompletedDB || isCompletedPart || isCompletedLocal;',
  'const isCompleted = checkIsCompleted(c, cleanMid);'
);

// Block 4
content = content.replace(
  'const isCompletedDB = c.completedMembers && cleanMid && c.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);\\n                      const isCompletedLocal = typeof window !== \\'undefined\\' && cleanMid && localStorage.getItem(\completed_contest__\);\\n                      const isCompletedPart = c.activeParticipants && cleanMid && c.activeParticipants.some(\\n                        p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === \\'completed\\'\\n                      );\\n                      const isCompleted = isCompletedDB || isCompletedLocal || isCompletedPart;',
  'const isCompleted = checkIsCompleted(c, cleanMid);'
);

// Block 5
content = content.replace(
  'const isCompDB = activeContestItem.completedMembers && activeContestItem.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMid);\\n                              const isCompLoc = typeof window !== \\'undefined\\' && localStorage.getItem(\completed_contest__\);\\n                              const isCompPart = activeContestItem.activeParticipants && activeContestItem.activeParticipants.some(\\n                                p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMid && p.status === \\'completed\\'\\n                              );\\n                              if (isCompDB || isCompLoc || isCompPart) {',
  'if (checkIsCompleted(activeContestItem, cleanMid)) {'
);

// Block 6
content = content.replace(
  'const isCompletedLocal = localStorage.getItem(\completed_contest__\);\\n                            const isCompletedDB = selectedContestForOnboarding.completedMembers && selectedContestForOnboarding.completedMembers.some(m => m && String(m).trim().toUpperCase() === mid);\\n                            const isCompletedPart = selectedContestForOnboarding.activeParticipants && selectedContestForOnboarding.activeParticipants.some(\\n                              p => p && p.memberId && String(p.memberId).trim().toUpperCase() === mid && p.status === \\'completed\\'\\n                            );\\n                            if (isCompletedLocal || isCompletedDB || isCompletedPart) {',
  'if (checkIsCompleted(selectedContestForOnboarding, mid)) {'
);

// Block 7
content = content.replace(
  'const isCompDB = selectedContestForOnboarding.completedMembers && selectedContestForOnboarding.completedMembers.some(m => m && String(m).trim().toUpperCase() === mid);\\n                          const isCompLoc = typeof window !== \\'undefined\\' && localStorage.getItem(\completed_contest__\);\\n                          const isCompPart = selectedContestForOnboarding.activeParticipants && selectedContestForOnboarding.activeParticipants.some(\\n                            p => p && p.memberId && String(p.memberId).trim().toUpperCase() === mid && p.status === \\'completed\\'\\n                          );\\n                          if (isCompDB || isCompLoc || isCompPart) {',
  'if (checkIsCompleted(selectedContestForOnboarding, mid)) {'
);

fs.writeFileSync('app/challenges/page.js', content, 'utf8');
