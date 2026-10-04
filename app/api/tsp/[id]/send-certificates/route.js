import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import Submission from '@/models/Submission';
import Member from '@/models/Member';
import { generateContestCertificatePdf, sendContestCertificateEmail } from '@/lib/email';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request, { params }) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await connectToDatabase();

    const tsp = await TSP.findById(id);
    if (!tsp) {
      return Response.json({ error: 'TSP not found' }, { status: 404 });
    }

    if (!tsp.certificateEnabled) {
      return Response.json({ 
        error: 'Certificates are not currently enabled for this TSP. Please enable them in Certificate Settings first.' 
      }, { status: 400 });
    }

    // Fetch all submissions for this TSP
    const tspSubmissions = await Submission.find({ contestId: id });
    const allMembers = await Member.find({});

    if (!tspSubmissions || tspSubmissions.length === 0) {
      return Response.json({ 
        error: 'No submissions found for this TSP yet. Cannot generate certificates without participants.' 
      }, { status: 400 });
    }

    // Aggregate highest score per challenge for each member in this TSP
    const memberScores = {};
    tspSubmissions.forEach(sub => {
      if (!sub.memberId) return;
      const mId = String(sub.memberId).toLowerCase();
      const cId = String(sub.challengeId);
      const score = Number(sub.quizScore != null ? sub.quizScore : (sub.totalPoints || 0));

      if (!memberScores[mId]) {
        memberScores[mId] = {};
      }
      if (memberScores[mId][cId] === undefined || score > memberScores[mId][cId]) {
        memberScores[mId][cId] = score;
      }
    });

    // Build participant list with total scores
    const participants = [];
    allMembers.forEach(m => {
      if (!m.memberId || !m.email) return;
      const mId = String(m.memberId).toLowerCase();
      if (memberScores[mId]) {
        const scoresMap = memberScores[mId];
        const totalScore = Object.values(scoresMap).reduce((sum, val) => sum + val, 0);
        participants.push({
          member: m,
          score: totalScore
        });
      }
    });

    if (participants.length === 0) {
      return Response.json({ 
        error: 'No registered members with valid email addresses found among TSP submissions.' 
      }, { status: 400 });
    }

    // Sort descending by score
    participants.sort((a, b) => b.score - a.score || (a.member.name || '').localeCompare(b.member.name || ''));

    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    for (let i = 0; i < participants.length; i++) {
      const { member } = participants[i];

      try {
        const pdfBuffer = await generateContestCertificatePdf(member, tsp);
        const sendRes = await sendContestCertificateEmail(member, tsp, pdfBuffer);

        if (sendRes.success) {
          sentCount++;
          results.push({ memberId: member.memberId || 'N/A', email: member.email, name: member.name, status: 'sent', sentAt: new Date() });
        } else {
          failedCount++;
          results.push({ memberId: member.memberId || 'N/A', email: member.email, name: member.name, status: 'failed', error: sendRes.error, sentAt: new Date() });
        }
      } catch (err) {
        failedCount++;
        results.push({ memberId: member.memberId || 'N/A', email: member.email, name: member.name, status: 'failed', error: err.message, sentAt: new Date() });
      }
    }

    try {
      await TSP.findByIdAndUpdate(id, {
        $set: { certificateRecipients: results }
      });
    } catch (dbErr) {
      console.error('Error saving certificate recipients to TSP db:', dbErr);
    }

    return Response.json({
      success: true,
      message: `Completed sending certificates. Sent: ${sentCount}, Failed: ${failedCount}`,
      totalParticipants: participants.length,
      sentCount,
      failedCount,
      results
    });
  } catch (error) {
    console.error('Error sending TSP certificates:', error);
    return Response.json({ error: 'Failed to process and send TSP certificates: ' + error.message }, { status: 500 });
  }
}
