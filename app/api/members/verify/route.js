
import { connectToDatabase } from '@/lib/db';
import Member from '@/models/Member';
import Submission from '@/models/Submission';
import Contest from '@/models/Contest';
import TSP from '@/models/TSP';
import { safeString, escapeRegex } from '@/lib/apiHelpers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return Response.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const cleanId = safeString(memberId).toUpperCase();

    await connectToDatabase();

    // 1. Search in global Member collection (case-insensitive)
    let member = await Member.findOne({
      memberId: { $regex: new RegExp(`^${escapeRegex(cleanId)}$`, 'i') }
    });

    // 2. If not found in Member collection, check if student is authorized in any TSP or Contest whitelist
    if (!member) {
      const idRegex = new RegExp(`^${escapeRegex(cleanId)}$`, 'i');
      
      const tspWithStudent = await TSP.findOne({
        $or: [
          { 'whitelistedStudents.identifier': { $regex: idRegex } },
          { 'whitelistedStudents.rollNo': { $regex: idRegex } },
          { 'whitelistedStudents.registerNo': { $regex: idRegex } }
        ]
      });
      let student = tspWithStudent?.whitelistedStudents?.find(
        s => (s.identifier && s.identifier.toUpperCase() === cleanId) ||
             (s.rollNo && s.rollNo.toUpperCase() === cleanId) ||
             (s.registerNo && s.registerNo.toUpperCase() === cleanId)
      );

      if (!student) {
        const contestWithStudent = await Contest.findOne({
          $or: [
            { 'whitelistedStudents.identifier': { $regex: idRegex } },
            { 'whitelistedStudents.rollNo': { $regex: idRegex } },
            { 'whitelistedStudents.registerNo': { $regex: idRegex } }
          ]
        });
        student = contestWithStudent?.whitelistedStudents?.find(
          s => (s.identifier && s.identifier.toUpperCase() === cleanId) ||
               (s.rollNo && s.rollNo.toUpperCase() === cleanId) ||
               (s.registerNo && s.registerNo.toUpperCase() === cleanId)
        );
      }

      if (student) {
        // Create a virtual member object for the session so they can participate
        // without adding them to the global Members database
        member = {
          memberId: cleanId,
          name: student.name || cleanId,
          email: student.email || '',
          department: 'Restricted Participant',
          year: 'N/A',
          roleInterest: 'Participant',
          score: 0,
          isVirtual: true // Flag to indicate they are not a real club member
        };
      }
    }

    if (!member) {
      return Response.json({ error: 'Invalid Member ID. Please check and try again.' }, { status: 404 });
    }

    const submissions = await Submission.find({
      memberId: { $regex: new RegExp(`^${escapeRegex(cleanId)}$`, 'i') }
    });
    const solvedChallengeIds = submissions.map(s => s.challengeId.toString());

    return Response.json({ success: true, member, solvedChallengeIds });
  } catch (error) {
    console.error('Error verifying member ID:', error);
    return Response.json({ error: 'Verification failed' }, { status: 500 });
  }
}
