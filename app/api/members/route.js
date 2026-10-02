
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Member from '@/models/Member';
import { sendWelcomeEmail } from '@/lib/email';
import { safeString } from '@/lib/apiHelpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to generate unique random DSCAI Member ID (e.g., DSCAI4829)
async function generateUniqueMemberId() {
  let randomNum = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
  let id = `DSCAI${randomNum}`;
  while (await Member.findOne({ memberId: id })) {
    randomNum = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
    id = `DSCAI${randomNum}`;
  }
  return id;
}

export async function GET(req) {
  const authError = verifyAdmin(req);
  if (authError) return authError;
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;
    const skip = (page - 1) * limit;

    const total = await Member.countDocuments({});
    const members = await Member.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit);

    if (searchParams.has('page') || searchParams.has('paginate')) {
      return Response.json({ members, total, page, totalPages });
    }

    return Response.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return Response.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, department, year, roleInterest, linkedin, github } = body;

    if (!name || !email) {
      return Response.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanEmail = safeString(email).toLowerCase();

    const existingMember = await Member.findOne({ email: cleanEmail });
    if (existingMember) {
      return Response.json({ error: 'A member with this email already exists.', memberId: existingMember.memberId }, { status: 409 });
    }

    const memberId = await generateUniqueMemberId();
    const newMember = await Member.create({
      memberId,
      name,
      email: cleanEmail,
      department: department || 'AI & Data Science',
      year: year || '1st Year',
      roleInterest: roleInterest || 'Member',
      linkedin: linkedin || '',
      github: github || ''
    });

    // Send welcome email with ID card — awaited so errors surface in logs
    try {
      const emailResult = await sendWelcomeEmail(newMember);
      if (emailResult.success) {
        console.log('[Email] ✅ Welcome email sent to', newMember.email, '| MessageId:', emailResult.messageId);
      } else {
        console.error('[Email] ❌ Failed:', emailResult.error);
      }
    } catch (emailErr) {
      console.error('[Email] ❌ Unexpected error:', emailErr?.message || emailErr);
    }

    return Response.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return Response.json({ error: 'Failed to create member: ' + error.message }, { status: 500 });
  }
}
