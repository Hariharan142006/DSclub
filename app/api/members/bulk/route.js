
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Member from '@/models/Member';
import { sendWelcomeEmail } from '@/lib/email';
import { safeString } from '@/lib/apiHelpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to generate unique random DSCAI Member ID for bulk import
async function generateRandomMemberId(usedIds = new Set()) {
  let randomNum = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
  let id = `DSCAI${randomNum}`;
  while (usedIds.has(id) || await Member.findOne({ memberId: id })) {
    randomNum = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
    id = `DSCAI${randomNum}`;
  }
  usedIds.add(id);
  return id;
}

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { members } = body;

    if (!Array.isArray(members) || members.length === 0) {
      return Response.json({ error: 'Please provide an array of members to import' }, { status: 400 });
    }

    await connectToDatabase();

    const addedMembers = [];
    const usedIds = new Set();
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.email) continue;
      const existingMember = await Member.findOne({ email: safeString(m.email).toLowerCase() });
      if (existingMember) continue;
      const memberId = await generateRandomMemberId(usedIds);
      const newMember = await Member.create({
        memberId,
        name: safeString(m.name),
        email: safeString(m.email),
        department: m.department || 'AI & Data Science',
        year: m.year || '1st Year',
        roleInterest: m.roleInterest || 'General Member / Participant',
        linkedin: m.linkedin || '',
        github: m.github || ''
      });
      addedMembers.push(newMember);
      sendWelcomeEmail(newMember).catch(err => console.error('[BulkImport Email]', err.message));
    }

    return Response.json({ success: true, count: addedMembers.length, members: addedMembers }, { status: 201 });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return Response.json({ error: 'Failed to bulk import members: ' + error.message }, { status: 500 });
  }
}
