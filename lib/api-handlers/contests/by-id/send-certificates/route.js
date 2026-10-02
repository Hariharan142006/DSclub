
import { connectToDatabase } from '@/lib/db';
import Contest from '@/models/Contest';
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

    const contest = await Contest.findById(id);
    if (!contest) {
      return Response.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (!contest.certificateEnabled) {
      return Response.json({ 
        error: 'Certificates are not currently enabled for this contest. Please enable them in Award / Certificate Settings first.' 
      }, { status: 400 });
    }

    // Fetch all submissions for this contest
    const contestSubmissions = await Submission.find({ contestId: id });
    const uniqueMemberIds = [...new Set(contestSubmissions.map(s => String(s.memberId).toLowerCase()))];
    const allMembers = await Member.find({
      memberId: { $in: uniqueMemberIds.map(id => new RegExp(`^${id}$`, 'i')) }
    });

    if (!contestSubmissions || contestSubmissions.length === 0) {
      return Response.json({ 
        error: 'No challenge submissions found for this contest yet. Cannot generate certificates without participants.' 
      }, { status: 400 });
    }

    // Aggregate highest score per challenge for each member in this contest
    const memberScores = {}; // memberId -> { [challengeId]: maxScore }
    contestSubmissions.forEach(sub => {
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
        error: 'No registered members with valid email addresses found among contest submissions.' 
      }, { status: 400 });
    }

    // Sort descending by score to assign ranks
    participants.sort((a, b) => b.score - a.score || (a.member.name || '').localeCompare(b.member.name || ''));

    // Generate PDFs and send emails sequentially / in batches to respect rate limits
    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    for (let i = 0; i < participants.length; i++) {
      const rank = i + 1;
      const { member, score } = participants[i];

      try {
        const pdfBuffer = await generateContestCertificatePdf(member, contest);
        const sendRes = await sendContestCertificateEmail(member, contest, pdfBuffer);

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
      await Contest.findByIdAndUpdate(id, {
        $set: { certificateRecipients: results }
      });
    } catch (dbErr) {
      console.error('Error saving certificate recipients to contest db:', dbErr);
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
    console.error('Error sending contest certificates:', error);
    return Response.json({ error: 'Failed to process and send contest certificates: ' + error.message }, { status: 500 });
  }
}
