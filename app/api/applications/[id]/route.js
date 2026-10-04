
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Application from '@/models/Application';
import Member from '@/models/Member';


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

export async function PUT(request, { params }) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, registerMember } = body;

    await connectToDatabase();

    const application = await Application.findById(id);
    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    if (status) {
      application.status = status;
    }

    let memberCreated = false;
    let assignedMemberId = application.memberId;

    if (status === 'Approved' && registerMember && !application.memberId) {
      // Check if member already exists with this email
      let existingMember = await Member.findOne({ email: application.email });
      if (existingMember) {
        assignedMemberId = existingMember.memberId;
      } else {
        assignedMemberId = await generateUniqueMemberId();
        await Member.create({
          memberId: assignedMemberId,
          name: application.name,
          email: application.email,
          department: application.department || 'AI & Data Science',
          year: application.year || '1st Year',
          roleInterest: 'General Member / Participant',
          linkedin: '',
          github: '',
          score: 0
        });
        memberCreated = true;
      }
      application.memberId = assignedMemberId;
    }

    await application.save();

    return Response.json({
      success: true,
      application,
      memberCreated,
      memberId: assignedMemberId
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return Response.json({ error: 'Failed to update application: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await Application.findByIdAndDelete(id);
    if (!deleted) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return Response.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
