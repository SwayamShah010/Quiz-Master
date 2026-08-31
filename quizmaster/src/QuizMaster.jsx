import React, { useState, useEffect, useRef, useCallback } from "react";

/* ---------------------------------------------------------
   QuizMaster — MVP per PRD (Sections 5,6,7,9,10,11,13,16,17,29)
   Categories, difficulty, 10-question quiz, timer, scoring,
   feedback, result screen, review answers, session stats.
--------------------------------------------------------- */

const CATEGORIES = [
  "General Knowledge",
  "Science",
  "Technology",
  "Programming",
  "Python",
  "Mathematics",
  "History",
  "Geography",
];

const BASE_POINTS = { Easy: 10, Medium: 20, Hard: 30 };
const TIME_LIMIT = { Easy: 20, Medium: 15, Hard: 12 }; // seconds per question

// Bank of questions, tagged by category + difficulty
const QUESTIONS = [
  // General Knowledge
  { category: "General Knowledge", difficulty: "Easy", q: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correct: 2, explanation: "There are seven continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America." },
  { category: "General Knowledge", difficulty: "Easy", q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, explanation: "The Pacific Ocean is the largest and deepest ocean on Earth." },
  { category: "General Knowledge", difficulty: "Medium", q: "Who wrote the play 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], correct: 1, explanation: "William Shakespeare wrote 'Romeo and Juliet' around 1595." },
  { category: "General Knowledge", difficulty: "Medium", q: "Which gas do plants absorb from the atmosphere for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, explanation: "Plants absorb carbon dioxide and release oxygen during photosynthesis." },
  { category: "General Knowledge", difficulty: "Hard", q: "What is the currency of Japan?", options: ["Won", "Yuan", "Yen", "Ringgit"], correct: 2, explanation: "The Japanese Yen (JPY) is the official currency of Japan." },
  { category: "General Knowledge", difficulty: "Hard", q: "Which organ in the human body produces insulin?", options: ["Liver", "Pancreas", "Kidney", "Spleen"], correct: 1, explanation: "The pancreas produces insulin to regulate blood sugar levels." },

  // Science
  { category: "Science", difficulty: "Easy", q: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1, explanation: "Mars appears red due to iron oxide (rust) on its surface." },
  { category: "Science", difficulty: "Easy", q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "O2", "NaCl"], correct: 0, explanation: "Water is composed of two hydrogen atoms and one oxygen atom: H2O." },
  { category: "Science", difficulty: "Medium", q: "What force pulls objects toward the center of the Earth?", options: ["Magnetism", "Friction", "Gravity", "Tension"], correct: 2, explanation: "Gravity is the force that attracts objects toward Earth's center." },
  { category: "Science", difficulty: "Medium", q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correct: 2, explanation: "Mitochondria generate most of the cell's ATP energy." },
  { category: "Science", difficulty: "Hard", q: "What is the SI unit of electric resistance?", options: ["Volt", "Ohm", "Ampere", "Watt"], correct: 1, explanation: "Electric resistance is measured in Ohms, named after Georg Ohm." },
  { category: "Science", difficulty: "Hard", q: "Which subatomic particle has no electric charge?", options: ["Proton", "Electron", "Neutron", "Positron"], correct: 2, explanation: "Neutrons are electrically neutral particles found in atomic nuclei." },

  // Technology
  { category: "Technology", difficulty: "Easy", q: "What does 'CPU' stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Utility"], correct: 1, explanation: "CPU stands for Central Processing Unit, the brain of a computer." },
  { category: "Technology", difficulty: "Easy", q: "Which company developed the iPhone?", options: ["Samsung", "Google", "Apple", "Microsoft"], correct: 2, explanation: "Apple Inc. launched the first iPhone in 2007." },
  { category: "Technology", difficulty: "Medium", q: "What does 'HTTP' stand for?", options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Technical Process", "Home Tool Transfer Protocol"], correct: 0, explanation: "HTTP stands for HyperText Transfer Protocol, used to load web pages." },
  { category: "Technology", difficulty: "Medium", q: "Which company created the Android operating system?", options: ["Apple", "Google", "Microsoft", "Amazon"], correct: 1, explanation: "Google developed and maintains the Android operating system." },
  { category: "Technology", difficulty: "Hard", q: "What does 'DNS' stand for in networking?", options: ["Domain Name System", "Data Network Service", "Digital Naming Standard", "Direct Node Server"], correct: 0, explanation: "DNS (Domain Name System) translates domain names into IP addresses." },
  { category: "Technology", difficulty: "Hard", q: "Which protocol is primarily used to secure web traffic?", options: ["FTP", "SMTP", "TLS/SSL", "POP3"], correct: 2, explanation: "TLS/SSL encrypts data transmitted between a browser and a server." },

  // Programming
  { category: "Programming", difficulty: "Easy", q: "Which symbol is used for single-line comments in JavaScript?", options: ["//", "#", "<!-- -->", "/* */"], correct: 0, explanation: "JavaScript uses // for single-line comments." },
  { category: "Programming", difficulty: "Easy", q: "What does 'HTML' stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "HyperText Machine Language", "HyperTransfer Markup Language"], correct: 0, explanation: "HTML stands for HyperText Markup Language, used to structure web pages." },
  { category: "Programming", difficulty: "Medium", q: "Which data structure uses LIFO (Last In, First Out)?", options: ["Queue", "Stack", "Array", "Linked List"], correct: 1, explanation: "A stack follows the Last In, First Out principle." },
  { category: "Programming", difficulty: "Medium", q: "Which data structure follows FIFO (First In, First Out)?", options: ["Stack", "Queue", "Tree", "Graph"], correct: 1, explanation: "A queue follows the First In, First Out principle." },
  { category: "Programming", difficulty: "Hard", q: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], correct: 2, explanation: "Binary search halves the search space each step, giving O(log n)." },
  { category: "Programming", difficulty: "Hard", q: "Which sorting algorithm has the best average time complexity?", options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"], correct: 2, explanation: "Quick Sort averages O(n log n), better than the O(n²) others listed." },

  // Python
  { category: "Python", difficulty: "Easy", q: "Which keyword is used to define a function in Python?", options: ["func", "def", "function", "lambda"], correct: 1, explanation: "Python functions are defined using the 'def' keyword." },
  { category: "Python", difficulty: "Easy", q: "Which of these is a mutable data type in Python?", options: ["Tuple", "String", "List", "Integer"], correct: 2, explanation: "Lists are mutable in Python, unlike tuples and strings." },
  { category: "Python", difficulty: "Medium", q: "Which programming language is primarily used for data science?", options: ["HTML", "Python", "CSS", "XML"], correct: 1, explanation: "Python is widely used for data science because of libraries such as NumPy, Pandas, Matplotlib and Scikit-learn." },
  { category: "Python", difficulty: "Medium", q: "What does the 'len()' function do in Python?", options: ["Returns the largest item", "Returns the length of an object", "Rounds a number", "Converts to lowercase"], correct: 1, explanation: "len() returns the number of items in an object such as a list or string." },
  { category: "Python", difficulty: "Hard", q: "What does a Python decorator do?", options: ["Formats code style", "Wraps a function to extend its behavior", "Deletes a variable", "Compiles Python to C"], correct: 1, explanation: "Decorators wrap a function, modifying or extending its behavior without changing its code." },
  { category: "Python", difficulty: "Hard", q: "Which module is commonly used for handling dates in Python?", options: ["time", "datetime", "calendar", "os"], correct: 1, explanation: "The 'datetime' module provides classes for manipulating dates and times." },

  // Mathematics
  { category: "Mathematics", difficulty: "Easy", q: "What is 12 × 8?", options: ["96", "86", "108", "92"], correct: 0, explanation: "12 × 8 = 96." },
  { category: "Mathematics", difficulty: "Easy", q: "What is the square root of 81?", options: ["7", "8", "9", "10"], correct: 2, explanation: "9 × 9 = 81, so the square root of 81 is 9." },
  { category: "Mathematics", difficulty: "Medium", q: "What is the value of Pi rounded to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], correct: 1, explanation: "Pi is approximately 3.14159, which rounds to 3.14." },
  { category: "Mathematics", difficulty: "Medium", q: "What is the sum of the interior angles of a triangle?", options: ["90°", "180°", "270°", "360°"], correct: 1, explanation: "The interior angles of any triangle always sum to 180°." },
  { category: "Mathematics", difficulty: "Hard", q: "What is the derivative of x² with respect to x?", options: ["x", "2x", "x²", "2"], correct: 1, explanation: "Using the power rule, the derivative of x² is 2x." },
  { category: "Mathematics", difficulty: "Hard", q: "What is the value of log₁₀(100)?", options: ["1", "2", "10", "100"], correct: 1, explanation: "log₁₀(100) = 2, since 10² = 100." },

  // History
  { category: "History", difficulty: "Easy", q: "In which year did World War II end?", options: ["1943", "1945", "1947", "1950"], correct: 1, explanation: "World War II ended in 1945." },
  { category: "History", difficulty: "Easy", q: "Who was the first President of the United States?", options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], correct: 2, explanation: "George Washington served as the first U.S. President from 1789 to 1797." },
  { category: "History", difficulty: "Medium", q: "Which ancient civilization built the pyramids of Giza?", options: ["Romans", "Greeks", "Egyptians", "Mayans"], correct: 2, explanation: "The pyramids of Giza were built by the ancient Egyptians." },
  { category: "History", difficulty: "Medium", q: "The Berlin Wall fell in which year?", options: ["1987", "1989", "1991", "1993"], correct: 1, explanation: "The Berlin Wall fell in November 1989." },
  { category: "History", difficulty: "Hard", q: "Who was the first Emperor of Rome?", options: ["Julius Caesar", "Nero", "Augustus", "Constantine"], correct: 2, explanation: "Augustus became the first Roman Emperor in 27 BC." },
  { category: "History", difficulty: "Hard", q: "The Treaty of Versailles was signed after which war?", options: ["World War I", "World War II", "Franco-Prussian War", "Napoleonic Wars"], correct: 0, explanation: "The Treaty of Versailles (1919) formally ended World War I." },

  // Geography
  { category: "Geography", difficulty: "Easy", q: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correct: 2, explanation: "Paris is the capital and largest city of France." },
  { category: "Geography", difficulty: "Easy", q: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1, explanation: "The Nile River is traditionally considered the longest river in the world." },
  { category: "Geography", difficulty: "Medium", q: "Which country has the largest population in the world?", options: ["USA", "India", "China", "Indonesia"], correct: 1, explanation: "As of recent estimates, India has surpassed China as the most populous country." },
  { category: "Geography", difficulty: "Medium", q: "Mount Everest is located in which mountain range?", options: ["Andes", "Alps", "Himalayas", "Rockies"], correct: 2, explanation: "Mount Everest is part of the Himalayas, on the border of Nepal and Tibet." },
  { category: "Geography", difficulty: "Hard", q: "Which desert is the largest hot desert in the world?", options: ["Gobi", "Kalahari", "Sahara", "Thar"], correct: 2, explanation: "The Sahara Desert in Africa is the largest hot desert in the world." },
  { category: "Geography", difficulty: "Hard", q: "Which strait separates Europe and Africa?", options: ["Bering Strait", "Strait of Gibraltar", "Strait of Hormuz", "Bosphorus"], correct: 1, explanation: "The Strait of Gibraltar separates Spain (Europe) from Morocco (Africa)." },
];

const QUESTIONS_PER_QUIZ = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(category, difficulty, customQuestions = []) {
  const allQuestions = [...QUESTIONS, ...customQuestions];
  let pool = allQuestions.filter(
    (q) => (category === "All" || q.category === category) && q.difficulty === difficulty
  );
  if (pool.length < QUESTIONS_PER_QUIZ) {
    // top up with other difficulties in same category so a quiz can always run
    const extra = allQuestions.filter(
      (q) => (category === "All" || q.category === category) && q.difficulty !== difficulty
    );
    pool = [...pool, ...extra];
  }
  const chosen = shuffle(pool).slice(0, QUESTIONS_PER_QUIZ);
  return chosen.map((q) => ({ ...q, shuffledOptions: q.options }));
}

const ACCENT = "#3D5A80";
const ACCENT_DARK = "#293241";
const CORRECT_COLOR = "#3B8264";
const WRONG_COLOR = "#B23A48";
const BG = "#F7F5F0";
const CARD = "#FFFFFF";

export default function QuizMaster() {
  const [screen, setScreen] = useState("home"); // home | quiz | result | add
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("Medium");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreakInQuiz, setBestStreakInQuiz] = useState(0);
  const [answers, setAnswers] = useState([]); // {q, chosen, correct, points}
  const [timeLeft, setTimeLeft] = useState(0);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    correct: 0,
    incorrect: 0,
    highScore: 0,
    bestStreak: 0,
  });

  const timerRef = useRef(null);
  const questionStartRef = useRef(0);

  const startQuiz = () => {
    const built = buildQuiz(category, difficulty, customQuestions);
    setQuiz(built);
    setQIndex(0);
    setSelected(null);
    setLocked(false);
    setScore(0);
    setStreak(0);
    setBestStreakInQuiz(0);
    setAnswers([]);
    setScreen("quiz");
  };

  const currentQ = quiz[qIndex];
  const limit = TIME_LIMIT[difficulty];

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const finishQuiz = useCallback(
    (finalAnswers) => {
      clearTimer();
      const correctCount = finalAnswers.filter((a) => a.correct).length;
      setStats((prev) => {
        const totalScore = finalAnswers.reduce((s, a) => s + a.points, 0);
        return {
          totalQuizzes: prev.totalQuizzes + 1,
          totalQuestions: prev.totalQuestions + finalAnswers.length,
          correct: prev.correct + correctCount,
          incorrect: prev.incorrect + (finalAnswers.length - correctCount),
          highScore: Math.max(prev.highScore, totalScore),
          bestStreak: Math.max(prev.bestStreak, bestStreakInQuiz),
        };
      });
      setScreen("result");
    },
    [bestStreakInQuiz]
  );

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (locked || !currentQ) return;
      setLocked(true);
      setSelected(optionIndex);
      clearTimer();

      const isCorrect = optionIndex === currentQ.correct;
      const elapsed = (Date.now() - questionStartRef.current) / 1000;
      const timeBonus = isCorrect ? Math.max(0, Math.round((1 - elapsed / limit) * 5)) : 0;
      const base = isCorrect ? BASE_POINTS[currentQ.difficulty] : 0;

      let newStreak = streak;
      let streakBonus = 0;
      if (isCorrect) {
        newStreak = streak + 1;
        if (newStreak === 3) streakBonus = 5;
        if (newStreak === 5) streakBonus = 10;
        if (newStreak >= 10 && newStreak % 10 === 0) streakBonus = 25;
      } else {
        newStreak = 0;
      }

      const points = base + timeBonus + streakBonus;
      const record = {
        question: currentQ.q,
        options: currentQ.options,
        chosen: optionIndex,
        correctIndex: currentQ.correct,
        correct: isCorrect,
        explanation: currentQ.explanation,
        points,
      };

      setStreak(newStreak);
      setBestStreakInQuiz((b) => Math.max(b, newStreak));
      setScore((s) => s + points);
      setAnswers((prev) => [...prev, record]);
    },
    [locked, currentQ, streak, limit]
  );

  // advance after a short delay once locked
  useEffect(() => {
    if (!locked) return;
    const t = setTimeout(() => {
      setQIndex((idx) => {
        const next = idx + 1;
        if (next >= quiz.length) {
          // finishQuiz uses latest answers via functional access
          setAnswers((finalAnswers) => {
            finishQuiz(finalAnswers);
            return finalAnswers;
          });
        } else {
          setSelected(null);
          setLocked(false);
        }
        return next >= quiz.length ? idx : next;
      });
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  // timer per question
  useEffect(() => {
    if (screen !== "quiz" || !currentQ || locked) return;
    setTimeLeft(limit);
    questionStartRef.current = Date.now();
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          handleAnswer(-1); // time's up, no selection
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, screen]);

  useEffect(() => clearTimer, []);

  const accuracy = stats.totalQuestions
    ? Math.round((stats.correct / stats.totalQuestions) * 100)
    : 0;

  return (
    <div
      style={{
        minHeight: "600px",
        background: BG,
        fontFamily: "'Georgia', 'Iowan Old Style', serif",
        color: ACCENT_DARK,
        padding: "32px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <header style={{ marginBottom: 28, textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: 1,
              color: ACCENT,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              marginBottom: 4,
            }}
          >
            QuizMaster
          </div>
          <h1
            style={{
              fontSize: 30,
              margin: 0,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {screen === "home" && "Test your knowledge."}
            {screen === "quiz" && (currentQ ? currentQ.category : "")}
            {screen === "result" && "Quiz complete."}
            {screen === "add" && "Add a question."}
          </h1>
        </header>

        {screen === "home" && (
          <HomeScreen
            category={category}
            setCategory={setCategory}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStart={startQuiz}
            stats={stats}
            accuracy={accuracy}
            customCount={customQuestions.length}
            onGoAdd={() => setScreen("add")}
          />
        )}

        {screen === "add" && (
          <AddQuestionScreen
            onAdd={(q) => setCustomQuestions((prev) => [...prev, q])}
            onDone={() => setScreen("home")}
            customQuestions={customQuestions}
            onRemove={(idx) =>
              setCustomQuestions((prev) => prev.filter((_, i) => i !== idx))
            }
          />
        )}

        {screen === "quiz" && currentQ && (
          <QuizScreen
            currentQ={currentQ}
            qIndex={qIndex}
            total={quiz.length}
            timeLeft={timeLeft}
            limit={limit}
            score={score}
            streak={streak}
            selected={selected}
            locked={locked}
            onAnswer={handleAnswer}
          />
        )}

        {screen === "result" && (
          <ResultScreen
            answers={answers}
            score={score}
            onPlayAgain={startQuiz}
            onHome={() => setScreen("home")}
          />
        )}
      </div>
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 20,
        border: `1px solid ${active ? ACCENT : "#D8D3C7"}`,
        background: active ? ACCENT : "transparent",
        color: active ? "#fff" : ACCENT_DARK,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 13,
        cursor: "pointer",
        marginRight: 8,
        marginBottom: 8,
        transition: "background 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

function HomeScreen({ category, setCategory, difficulty, setDifficulty, onStart, stats, accuracy, customCount, onGoAdd }) {
  return (
    <div style={{ background: CARD, borderRadius: 8, padding: 24, border: "1px solid #E7E2D6" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={sectionLabel}>Category</div>
        <div>
          <Pill active={category === "All"} onClick={() => setCategory("All")}>
            All
          </Pill>
          {CATEGORIES.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Pill>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={sectionLabel}>Difficulty</div>
        <div>
          {["Easy", "Medium", "Hard"].map((d) => (
            <Pill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d}
            </Pill>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        style={{
          width: "100%",
          padding: "14px 0",
          background: ACCENT_DARK,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          cursor: "pointer",
          marginBottom: 24,
        }}
      >
        Start quiz — 10 questions
      </button>

      <button
        onClick={onGoAdd}
        style={{
          width: "100%",
          padding: "12px 0",
          background: "transparent",
          color: ACCENT_DARK,
          border: "1px solid #D8D3C7",
          borderRadius: 6,
          fontSize: 14,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          cursor: "pointer",
          marginBottom: 24,
        }}
      >
        Add your own question{customCount > 0 ? ` (${customCount} added)` : ""}
      </button>

      <div
        style={{
          borderTop: "1px solid #E7E2D6",
          paddingTop: 16,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <div style={sectionLabel}>Your stats</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Stat label="Quizzes played" value={stats.totalQuizzes} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="High score" value={stats.highScore} />
          <Stat label="Best streak" value={stats.bestStreak} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 90 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT_DARK }}>{value}</div>
      <div style={{ fontSize: 12, color: "#8A8574" }}>{label}</div>
    </div>
  );
}

const sectionLabel = {
  fontSize: 12,
  color: "#8A8574",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  marginBottom: 8,
};

function QuizScreen({ currentQ, qIndex, total, timeLeft, limit, score, streak, selected, locked, onAnswer }) {
  const pct = (timeLeft / limit) * 100;
  return (
    <div style={{ background: CARD, borderRadius: 8, padding: 24, border: "1px solid #E7E2D6" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: 13,
          color: "#8A8574",
          marginBottom: 10,
        }}
      >
        <span>
          Question {qIndex + 1} / {total}
        </span>
        <span>Score: {score}{streak >= 3 ? ` · Streak ${streak}` : ""}</span>
      </div>

      <div style={{ height: 4, background: "#EFEBE0", borderRadius: 2, marginBottom: 20 }}>
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, pct)}%`,
            background: timeLeft <= 5 ? WRONG_COLOR : ACCENT,
            borderRadius: 2,
            transition: "width 1s linear",
          }}
        />
      </div>

      <p style={{ fontSize: 20, lineHeight: 1.4, marginBottom: 20 }}>{currentQ.q}</p>

      <div>
        {currentQ.options.map((opt, i) => {
          let bg = "#FBFAF6";
          let border = "#D8D3C7";
          let color = ACCENT_DARK;
          if (locked) {
            if (i === currentQ.correct) {
              bg = "#E4F1EA";
              border = CORRECT_COLOR;
              color = CORRECT_COLOR;
            } else if (i === selected) {
              bg = "#F6E5E6";
              border = WRONG_COLOR;
              color = WRONG_COLOR;
            }
          }
          return (
            <button
              key={i}
              disabled={locked}
              onClick={() => onAnswer(i)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "13px 16px",
                marginBottom: 10,
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 6,
                color,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 15,
                cursor: locked ? "default" : "pointer",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {locked && (
        <p style={{ fontSize: 13, color: "#8A8574", fontFamily: "'Helvetica Neue', Arial, sans-serif", marginTop: 4 }}>
          {selected === currentQ.correct ? "Correct." : selected === -1 ? "Time's up." : "Not quite."}
        </p>
      )}
    </div>
  );
}

function ResultScreen({ answers, score, onPlayAgain, onHome }) {
  const [showReview, setShowReview] = useState(false);
  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy = Math.round((correctCount / answers.length) * 100);

  return (
    <div style={{ background: CARD, borderRadius: 8, padding: 24, border: "1px solid #E7E2D6" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: ACCENT_DARK }}>{score}</div>
        <div style={{ fontSize: 13, color: "#8A8574", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
          total points
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Correct" value={correctCount} />
        <Stat label="Incorrect" value={answers.length - correctCount} />
      </div>

      {!showReview ? (
        <div>
          <button onClick={() => setShowReview(true)} style={secondaryBtn}>
            Review answers
          </button>
          <button onClick={onPlayAgain} style={primaryBtn}>
            Play again
          </button>
          <button onClick={onHome} style={secondaryBtn}>
            Home
          </button>
        </div>
      ) : (
        <div>
          {answers.map((a, i) => (
            <div
              key={i}
              style={{
                borderTop: "1px solid #E7E2D6",
                padding: "14px 0",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {i + 1}. {a.question}
              </div>
              <div style={{ fontSize: 13, color: a.correct ? CORRECT_COLOR : WRONG_COLOR, marginBottom: 4 }}>
                Your answer: {a.chosen === -1 ? "No answer (time out)" : a.options[a.chosen]}
              </div>
              {!a.correct && (
                <div style={{ fontSize: 13, color: CORRECT_COLOR, marginBottom: 4 }}>
                  Correct answer: {a.options[a.correctIndex]}
                </div>
              )}
              <div style={{ fontSize: 13, color: "#6B6656" }}>{a.explanation}</div>
            </div>
          ))}
          <button onClick={onPlayAgain} style={{ ...primaryBtn, marginTop: 16 }}>
            Play again
          </button>
          <button onClick={onHome} style={secondaryBtn}>
            Home
          </button>
        </div>
      )}
    </div>
  );
}

function AddQuestionScreen({ onAdd, onDone, customQuestions, onRemove }) {
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    difficulty: "Medium",
    q: "",
    options: ["", "", "", ""],
    correct: 0,
    explanation: "",
  });
  const [error, setError] = useState("");

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateOption = (i, value) =>
    setForm((f) => {
      const options = [...f.options];
      options[i] = value;
      return { ...f, options };
    });

  const handleSubmit = () => {
    if (!form.q.trim()) return setError("Enter a question.");
    if (form.options.some((o) => !o.trim())) return setError("Fill in all four options.");
    if (!form.explanation.trim()) return setError("Add a short explanation.");
    setError("");
    onAdd({
      category: form.category,
      difficulty: form.difficulty,
      q: form.q.trim(),
      options: form.options.map((o) => o.trim()),
      correct: form.correct,
      explanation: form.explanation.trim(),
    });
    setForm({
      category: form.category,
      difficulty: form.difficulty,
      q: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
    });
  };

  return (
    <div style={{ background: CARD, borderRadius: 8, padding: 24, border: "1px solid #E7E2D6" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Category</div>
        <select
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          style={inputStyle}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Difficulty</div>
        <div>
          {["Easy", "Medium", "Hard"].map((d) => (
            <Pill key={d} active={form.difficulty === d} onClick={() => update("difficulty", d)}>
              {d}
            </Pill>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Question</div>
        <textarea
          value={form.q}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Which data structure follows FIFO?"
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Options — select the correct one</div>
        {form.options.map((opt, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <input
              type="radio"
              name="correct"
              checked={form.correct === i}
              onChange={() => update("correct", i)}
              style={{ flexShrink: 0 }}
            />
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Explanation</div>
        <textarea
          value={form.explanation}
          onChange={(e) => update("explanation", e.target.value)}
          placeholder="Why is this the correct answer?"
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {error && (
        <p style={{ color: WRONG_COLOR, fontSize: 13, fontFamily: "'Helvetica Neue', Arial, sans-serif", marginBottom: 12 }}>
          {error}
        </p>
      )}

      <button onClick={handleSubmit} style={primaryBtn}>
        Add question
      </button>
      <button onClick={onDone} style={secondaryBtn}>
        Done
      </button>

      {customQuestions.length > 0 && (
        <div style={{ borderTop: "1px solid #E7E2D6", marginTop: 16, paddingTop: 16 }}>
          <div style={sectionLabel}>Your added questions ({customQuestions.length})</div>
          {customQuestions.map((q, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "8px 0",
                borderTop: i > 0 ? "1px solid #F0EDE3" : "none",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              <div style={{ fontSize: 13, color: ACCENT_DARK, paddingRight: 10 }}>
                <span style={{ color: "#8A8574" }}>
                  {q.category} · {q.difficulty}
                </span>
                <br />
                {q.q}
              </div>
              <button
                onClick={() => onRemove(i)}
                style={{
                  border: "none",
                  background: "none",
                  color: WRONG_COLOR,
                  cursor: "pointer",
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #D8D3C7",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  color: ACCENT_DARK,
  marginBottom: 8,
  boxSizing: "border-box",
  background: "#FBFAF6",
};

const primaryBtn = {
  display: "block",
  width: "100%",
  padding: "13px 0",
  background: ACCENT_DARK,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 15,
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  cursor: "pointer",
  marginBottom: 10,
};

const secondaryBtn = {
  display: "block",
  width: "100%",
  padding: "13px 0",
  background: "transparent",
  color: ACCENT_DARK,
  border: "1px solid #D8D3C7",
  borderRadius: 6,
  fontSize: 15,
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  cursor: "pointer",
  marginBottom: 10,
};
