const fs = require('fs');
let content = fs.readFileSync('app/challenges/page.js', 'utf8');

// We can just use a global regex to replace the complex block.
// Let's just find the pattern and replace it.

content = content.replace(/const isCompletedDB = targetContest\.completedMembers.*?if \(isCompletedLocal \|\| isCompletedDB \|\| isCompletedPart\) \{/gs, 'if (checkIsCompleted(targetContest, typedIdForCompleteCheck)) {');
content = content.replace(/const isCompletedLocal = localStorage\.getItem.*?if \(isCompletedLocal \|\| isCompletedDB \|\| isCompletedPart\) \{/gs, 'if (checkIsCompleted(targetContest, typedIdForCompleteCheck)) {');

content = content.replace(/const isCompletedDB = activeTSP\.completedMembers.*?if \(isCompletedDB \|\| isCompletedLocal \|\| isCompletedParticipant\) \{/gs, 'if (checkIsCompleted(activeTSP, cleanMid)) {');

content = content.replace(/const isCompletedDB = cleanMid && c\.completedMembers.*?const isCompleted = isCompletedDB \|\| isCompletedPart \|\| isCompletedLocal;/gs, 'const isCompleted = checkIsCompleted(c, cleanMid);');

content = content.replace(/const isCompletedDB = c\.completedMembers.*?const isCompleted = isCompletedDB \|\| isCompletedLocal \|\| isCompletedPart;/gs, 'const isCompleted = checkIsCompleted(c, cleanMid);');

content = content.replace(/const isCompletedLocal = localStorage\.getItem.*?if \(isCompletedLocal \|\| isCompletedDB \|\| isCompletedPart\) \{/gs, 'if (checkIsCompleted(selectedContestForOnboarding, mid)) {');

content = content.replace(/const isCompDB = activeContestItem\.completedMembers.*?if \(isCompDB \|\| isCompLoc \|\| isCompPart\) \{/gs, 'if (checkIsCompleted(activeContestItem, cleanMid)) {');

content = content.replace(/const isCompDB = selectedContestForOnboarding\.completedMembers.*?if \(isCompDB \|\| isCompLoc \|\| isCompPart\) \{/gs, 'if (checkIsCompleted(selectedContestForOnboarding, mid)) {');

fs.writeFileSync('app/challenges/page.js', content, 'utf8');
