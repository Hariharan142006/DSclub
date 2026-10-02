import { verifyAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Challenge from '@/models/Challenge';

const quizzes = [
  {
    title: "Python Basics: Lists",
    description: "Test your knowledge on Python list operations.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which of the following methods adds an element to the end of a list?",
        options: ["insert()", "append()", "push()", "add()"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Data Science: Pandas DataFrames",
    description: "Basic operations on Pandas DataFrames.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "How do you select the first 5 rows of a DataFrame named df?",
        options: ["df.first(5)", "df.top(5)", "df.head(5)", "df.start(5)"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "Machine Learning: Supervised vs Unsupervised",
    description: "Identify the type of machine learning.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "K-Means Clustering is an example of which type of learning?",
        options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Semi-supervised Learning"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Python: Dictionaries",
    description: "Understanding Python dictionaries.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which of the following is the correct syntax to create an empty dictionary?",
        options: ["{}", "[]", "()", "dict[]"],
        correctIndex: 0
      }
    ]
  },
  {
    title: "Statistics: Mean, Median, Mode",
    description: "Basic statistical concepts.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which measure of central tendency is most affected by outliers?",
        options: ["Mean", "Median", "Mode", "Range"],
        correctIndex: 0
      }
    ]
  },
  {
    title: "Machine Learning: Evaluation Metrics",
    description: "Metrics for evaluating models.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "What does the F1 score measure?",
        options: ["Accuracy only", "Precision only", "Recall only", "Harmonic mean of Precision and Recall"],
        correctIndex: 3
      }
    ]
  },
  {
    title: "Python: Lambda Functions",
    description: "Using anonymous functions in Python.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "How do you define a lambda function that squares a number x?",
        options: ["lambda x: x**2", "def lambda(x): x**2", "lambda(x) = x**2", "lambda x -> x**2"],
        correctIndex: 0
      }
    ]
  },
  {
    title: "Data Visualization: Matplotlib",
    description: "Creating plots in Python.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which function is used to create a scatter plot in matplotlib.pyplot?",
        options: ["plot()", "scatter()", "dot()", "points()"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Deep Learning: Activation Functions",
    description: "Neural network activation functions.",
    type: "quiz",
    difficulty: "Hard",
    points: 30,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which activation function outputs a value between 0 and 1?",
        options: ["ReLU", "Tanh", "Sigmoid", "Leaky ReLU"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "SQL Basics: SELECT",
    description: "Querying data using SQL.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which keyword is used to return only distinct (different) values?",
        options: ["UNIQUE", "DISTINCT", "DIFFERENT", "SET"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Machine Learning: Overfitting",
    description: "Understanding model generalization.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which of the following techniques is NOT typically used to prevent overfitting?",
        options: ["Cross-validation", "Increasing model complexity", "Regularization", "Early stopping"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Python: Exception Handling",
    description: "Handling errors in Python.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which block of code is always executed, regardless of whether an exception occurs or not?",
        options: ["try", "except", "finally", "catch"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "Statistics: p-value",
    description: "Hypothesis testing concepts.",
    type: "quiz",
    difficulty: "Hard",
    points: 30,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "A p-value less than the significance level (e.g., 0.05) implies:",
        options: ["Accept the null hypothesis", "Reject the null hypothesis", "The results are insignificant", "The model is overfitted"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Data Science: Missing Data",
    description: "Handling null values.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "In Pandas, which method is used to fill missing values?",
        options: ["dropna()", "fillna()", "replace_null()", "impute()"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Machine Learning: Decision Trees",
    description: "Tree-based algorithms.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "What metric is commonly used to decide the best split in a Decision Tree classifier?",
        options: ["Mean Squared Error", "Gini Impurity", "R-squared", "Cosine Similarity"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Python: Strings",
    description: "String manipulation in Python.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which method converts all characters in a string to lowercase?",
        options: ["lower()", "down()", "to_lower()", "lowercase()"],
        correctIndex: 0
      }
    ]
  },
  {
    title: "Deep Learning: Optimizers",
    description: "Training neural networks.",
    type: "quiz",
    difficulty: "Hard",
    points: 30,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which optimizer combines the advantages of AdaGrad and RMSProp?",
        options: ["SGD", "Adam", "Momentum", "Adadelta"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Data Manipulation: NumPy Arrays",
    description: "Working with NumPy.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "How do you get the shape of a NumPy array named 'arr'?",
        options: ["arr.size()", "arr.shape", "len(arr)", "arr.dim"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Machine Learning: PCA",
    description: "Dimensionality reduction.",
    type: "quiz",
    difficulty: "Hard",
    points: 30,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Principal Component Analysis (PCA) is primarily used for:",
        options: ["Classification", "Regression", "Dimensionality Reduction", "Clustering"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "SQL: JOINs",
    description: "Combining tables.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which JOIN returns all records when there is a match in either left or right table?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        correctIndex: 3
      }
    ]
  },
  {
    title: "Python: Sets",
    description: "Python set operations.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which of the following is NOT a characteristic of a Python set?",
        options: ["Unordered", "Mutable", "Allows duplicate elements", "Iterable"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "Machine Learning: Ensembles",
    description: "Random Forests and Boosting.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Random Forest is an example of which ensemble technique?",
        options: ["Boosting", "Bagging", "Stacking", "Cascading"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Deep Learning: CNNs",
    description: "Convolutional Neural Networks.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "What is the primary purpose of a pooling layer in a CNN?",
        options: ["Increase the number of parameters", "Reduce spatial dimensions", "Introduce non-linearity", "Compute the loss"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "Python: Comprehensions",
    description: "List comprehensions.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "What will `[x for x in range(5) if x % 2 == 0]` evaluate to?",
        options: ["[1, 3, 5]", "[0, 1, 2, 3, 4]", "[0, 2, 4]", "[2, 4]"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "Data Science: Regular Expressions",
    description: "Pattern matching in strings.",
    type: "quiz",
    difficulty: "Hard",
    points: 30,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "In RegEx, what does the character `^` match?",
        options: ["End of a string", "Any single character", "Start of a string", "One or more occurrences"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "Statistics: Distributions",
    description: "Probability distributions.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which distribution is often used to model the number of independent events occurring in a fixed interval of time?",
        options: ["Normal Distribution", "Binomial Distribution", "Poisson Distribution", "Uniform Distribution"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "Machine Learning: Regularization",
    description: "L1 vs L2 regularization.",
    type: "quiz",
    difficulty: "Hard",
    points: 30,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Lasso Regression uses which type of penalty?",
        options: ["L1 penalty", "L2 penalty", "Elastic Net penalty", "No penalty"],
        correctIndex: 0
      }
    ]
  },
  {
    title: "Python: Tuples",
    description: "Tuple properties.",
    type: "quiz",
    difficulty: "Easy",
    points: 10,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which of the following is true about tuples in Python?",
        options: ["They are mutable", "They are created using square brackets []", "They are immutable", "They can only contain integers"],
        correctIndex: 2
      }
    ]
  },
  {
    title: "Deep Learning: RNNs",
    description: "Recurrent Neural Networks.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "What problem do LSTMs (Long Short-Term Memory networks) solve in standard RNNs?",
        options: ["Overfitting", "Vanishing gradient problem", "High memory usage", "Slow training speed"],
        correctIndex: 1
      }
    ]
  },
  {
    title: "SQL: Grouping",
    description: "Aggregations in SQL.",
    type: "quiz",
    difficulty: "Medium",
    points: 20,
    isHidden: false,
    quizQuestions: [
      {
        prompt: "Which clause is used to filter records after an aggregation (e.g., COUNT or SUM) has taken place?",
        options: ["WHERE", "ORDER BY", "HAVING", "LIMIT"],
        correctIndex: 2
      }
    ]
  }
];

export async function GET(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    await connectToDatabase();
    
    // Check existing quiz titles to prevent duplicates
    const existingChallenges = await Challenge.find({ type: 'quiz' }).select('title').lean();
    const existingTitles = new Set(existingChallenges.map(c => c.title));

    const newQuizzes = quizzes.filter(q => !existingTitles.has(q.title));

    if (newQuizzes.length === 0) {
      return NextResponse.json({ success: true, message: 'All quizzes already seeded. No new quizzes added.' });
    }

    await Challenge.insertMany(newQuizzes);
    
    return NextResponse.json({ success: true, message: `Successfully inserted ${newQuizzes.length} new quiz challenges!` });
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
