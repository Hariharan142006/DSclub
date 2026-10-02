
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Challenge from '@/models/Challenge';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const defaultCodeChallenges = [
  {
    title: "Valid Palindrome (Data Cleaning)",
    description: "In NLP preprocessing, cleaning text by removing non-alphanumeric characters and checking symmetry is a fundamental skill. Determine if a string is a palindrome after cleanup.",
    type: "code",
    difficulty: "Easy",
    points: 50,
    codeDetails: {
      problemStatement: "Write a function isPalindrome(s) that takes a string s, removes all punctuation, spaces, and special symbols, converts all characters to lowercase, and returns true if it reads the same forward and backward, or false otherwise.\n\nExample 1:\nInput: s = \"A man, a plan, a canal: Panama\"\nOutput: true\nExplanation: \"amanaplanacanalpanama\" is a palindrome.\n\nExample 2:\nInput: s = \"race a car\"\nOutput: false\nExplanation: \"raceacar\" is not a palindrome.",
      sampleInput: "s = \"A man, a plan, a canal: Panama\"",
      sampleOutput: "true",
      testCases: [
        { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isHidden: false },
        { input: "race a car", expectedOutput: "false", isHidden: false }
      ]
    }
  },
  {
    title: "Top K Frequent Elements (Data Aggregation)",
    description: "In feature engineering and exploratory data analysis, identifying the most frequent categorical values or tokens is essential. Return the k most frequent elements from an array.",
    type: "code",
    difficulty: "Medium",
    points: 100,
    codeDetails: {
      problemStatement: "Write a function topKFrequent(nums, k) that takes an array of integers nums and an integer k, and returns the k most frequent elements. You may return the answer in any order.\n\nExample 1:\nInput: nums = [1, 1, 1, 2, 2, 3], k = 2\nOutput: [1, 2]\nExplanation: 1 appears 3 times and 2 appears 2 times, making them the top 2 most frequent elements.\n\nExample 2:\nInput: nums = [1], k = 1\nOutput: [1]\n\nConstraint: Try designing an algorithm with a time complexity better than O(n log n).",
      sampleInput: "nums = [1, 1, 1, 2, 2, 3], k = 2",
      sampleOutput: "[1, 2]",
      testCases: [
        { input: "nums = [1, 1, 1, 2, 2, 3], k = 2", expectedOutput: "[1, 2]", isHidden: false },
        { input: "nums = [1], k = 1", expectedOutput: "[1]", isHidden: false }
      ]
    }
  },
  {
    title: "K-Means Clustering Step & Convergence (ML Algorithms)",
    description: "Implement the core centroid update and convergence check of the K-Means clustering unsupervised learning algorithm from scratch.",
    type: "code",
    difficulty: "Hard",
    points: 200,
    codeDetails: {
      problemStatement: "Write a function kmeansStep(points, centroids, epsilon) where:\n- points is a 2D array of [x, y] data coordinates.\n- centroids is a 2D array of k initial [x, y] cluster centers.\n- epsilon is a float threshold (e.g., 0.01).\n\nYour algorithm must:\n1. Assign each data point to its closest centroid using squared Euclidean distance: (x1 - x2)^2 + (y1 - y2)^2.\n2. Compute the new coordinates for each centroid by taking the average (mean) of all points assigned to that cluster. If a cluster has 0 assigned points, keep its coordinates unchanged.\n3. Check if the algorithm has converged: compare each old centroid to its new position. If the Euclidean distance moved by EVERY centroid is strictly less than epsilon, convergence is reached.\n\nReturn an object (or dictionary) with two keys:\n- newCentroids: 2D array of updated centroid coordinates (rounded to 2 decimal places).\n- converged: boolean (true if all centroids moved less than epsilon, false otherwise).\n\nExample:\nInput: points = [[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]], centroids = [[1, 1], [10, 1]], epsilon = 0.01\nOutput: {\"newCentroids\": [[1.0, 2.0], [10.0, 2.0]], \"converged\": false}",
      sampleInput: "points = [[1,2],[1,4],[1,0],[10,2],[10,4],[10,0]], centroids = [[1,1],[10,1]], epsilon = 0.01",
      sampleOutput: "{\"newCentroids\": [[1.0, 2.0], [10.0, 2.0]], \"converged\": false}",
      testCases: [
        { input: "points = [[1,2],[1,4],[1,0],[10,2],[10,4],[10,0]], centroids = [[1,1],[10,1]], epsilon = 0.01", expectedOutput: "{\"newCentroids\": [[1.0, 2.0], [10.0, 2.0]], \"converged\": false}", isHidden: false }
      ]
    }
  },
  {
    title: "Two Sum Data Structure Challenge",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    type: "code",
    difficulty: "Easy",
    points: 50,
    codeDetails: {
      problemStatement: "Write a function twoSum(nums, target) that finds two numbers in the array that sum up to target.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
      sampleInput: "nums = [2, 7, 11, 15], target = 9",
      sampleOutput: "[0, 1]",
      testCases: [
        { input: "nums = [2, 7, 11, 15], target = 9", expectedOutput: "[0, 1]", isHidden: false },
        { input: "nums = [3, 2, 4], target = 6", expectedOutput: "[1, 2]", isHidden: false }
      ]
    }
  }
];

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;
    const skip = (page - 1) * limit;

    let total = await Challenge.countDocuments({});

    // Seed initial demo challenges only if DB is completely empty
    if (total === 0) {
      await Challenge.insertMany(defaultCodeChallenges);
      total = await Challenge.countDocuments({});
    }

    const challenges = await Challenge.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit);

    if (searchParams.has('page') || searchParams.has('paginate')) {
      return Response.json({ challenges, total, page, totalPages }, { headers: noCacheHeaders });
    }

    return Response.json(challenges, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return Response.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { title, description, type, difficulty, points, codeDetails, quizQuestions } = body;

    if (!title || !description || !type) {
      return Response.json({ error: 'Title, description, and type are required' }, { status: 400 });
    }

    const cleanedCodeDetails = type === 'code' ? (codeDetails || {}) : {};
    const cleanedQuizQuestions = type === 'quiz' ? (quizQuestions || []).filter(q => q && q.prompt && q.prompt.trim() !== '') : [];

    if (type === 'quiz' && cleanedQuizQuestions.length === 0) {
      return Response.json({ error: 'At least one valid quiz question with a prompt is required for Quiz challenges' }, { status: 400 });
    }

    await connectToDatabase();

    const newChallenge = await Challenge.create({
      title,
      description,
      type,
      difficulty: difficulty || 'Medium',
      points: points || 50,
      isHidden: body.isHidden || false,
      codeDetails: cleanedCodeDetails,
      quizQuestions: cleanedQuizQuestions
    });

    return Response.json(newChallenge, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return Response.json({ error: 'Failed to create challenge: ' + error.message }, { status: 500 });
  }
}
