const fs = require('fs');
let lines = fs.readFileSync('app/challenges/page.js', 'utf8').split('\n');

const helper = `export default function ChallengesPage() {
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
        if (localStorage.getItem(\`completed_contest_\${contest._id || contest.id}_\${id}\`)) return true;
      }
    }
    return false;
  };`;

// Find index of export default function ChallengesPage
const topIdx = lines.findIndex(l => l.includes('export default function ChallengesPage() {'));
if (topIdx !== -1) {
  lines[topIdx] = helper;
}

// 1. Line 792
const idx1 = lines.findIndex(l => l.includes('const isCompletedLocal = localStorage.getItem(\`completed_contest_${targetContest._id || targetContest.id}_${typedIdForCompleteCheck}\`);'));
if (idx1 !== -1 && lines[idx1+6].includes('if (isCompletedLocal || isCompletedDB || isCompletedPart) {')) {
  lines.splice(idx1, 7, '      if (checkIsCompleted(targetContest, typedIdForCompleteCheck)) {');
}

// 2. Line 901
const idx2 = lines.findIndex(l => l.includes('const isCompletedDB = activeTSP.completedMembers && cleanMid && activeTSP.completedMembers.some'));
if (idx2 !== -1 && lines[idx2+4].includes('if (isCompletedDB || isCompletedLocal || isCompletedParticipant) {')) {
  lines.splice(idx2, 5, '    if (checkIsCompleted(activeTSP, cleanMid)) {');
}

// 3. Line 1851
const idx3 = lines.findIndex(l => l.includes('const isCompletedDB = c.completedMembers && cleanMid && c.completedMembers.some'));
if (idx3 !== -1 && lines[idx3+4].includes('const isCompleted = isCompletedDB || isCompletedLocal || isCompletedPart;')) {
  lines.splice(idx3, 5, '                      const isCompleted = checkIsCompleted(c, cleanMid);');
}

// 4. Line 3054
const idx4 = lines.findIndex(l => l.includes('const isCompletedLocal = localStorage.getItem(\`completed_contest_${selectedContestForOnboarding._id || selectedContestForOnboarding.id}_${mid}\`);'));
if (idx4 !== -1 && lines[idx4+4].includes('if (isCompletedLocal || isCompletedDB || isCompletedPart) {')) {
  lines.splice(idx4, 5, '                            if (checkIsCompleted(selectedContestForOnboarding, mid)) {');
}

// 5. Line 1886
const idx5 = lines.findIndex(l => l.includes('const isCompDB = activeContestItem.completedMembers && activeContestItem.completedMembers.some'));
if (idx5 !== -1 && lines[idx5+4].includes('if (isCompDB || isCompLoc || isCompPart) {')) {
  lines.splice(idx5, 5, '                              if (checkIsCompleted(activeContestItem, cleanMid)) {');
}

// 6. Line 3169
const idx6 = lines.findIndex(l => l.includes('const isCompDB = selectedContestForOnboarding.completedMembers && selectedContestForOnboarding.completedMembers.some'));
if (idx6 !== -1 && lines[idx6+4].includes('if (isCompDB || isCompLoc || isCompPart) {')) {
  lines.splice(idx6, 5, '                          if (checkIsCompleted(selectedContestForOnboarding, mid)) {');
}

// 7. Missing one more? Let's find all isCompletedDB definitions
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const isCompletedDB = cleanMid && c.completedMembers && c.completedMembers.some')) {
    if (lines[i+3].includes('const isCompleted = isCompletedDB || isCompletedPart || isCompletedLocal;')) {
      lines.splice(i, 4, '                      const isCompleted = checkIsCompleted(c, cleanMid);');
    }
  }
}

fs.writeFileSync('app/challenges/page.js', lines.join('\n'), 'utf8');
console.log('Successfully completed replacements');
