"""
QuizMaster — Streamlit edition
A gamified multiple-choice quiz app: category/difficulty selection,
per-question timer, scoring with streak bonuses, result review, and
a form to add your own questions.

Run with:
    streamlit run quizmaster.py
"""

import random
import time
import streamlit as st

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

st.set_page_config(page_title="QuizMaster", page_icon="🎯", layout="centered")

CATEGORIES = [
    "General Knowledge",
    "Science",
    "Technology",
    "Programming",
    "Python",
    "Mathematics",
    "History",
    "Geography",
]

BASE_POINTS = {"Easy": 10, "Medium": 20, "Hard": 30}
TIME_LIMIT = {"Easy": 20, "Medium": 15, "Hard": 12}  # seconds per question
QUESTIONS_PER_QUIZ = 10

QUESTIONS = [
    # General Knowledge
    {"category": "General Knowledge", "difficulty": "Easy", "q": "How many continents are there on Earth?",
     "options": ["5", "6", "7", "8"], "correct": 2,
     "explanation": "There are seven continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America."},
    {"category": "General Knowledge", "difficulty": "Easy", "q": "What is the largest ocean on Earth?",
     "options": ["Atlantic", "Indian", "Arctic", "Pacific"], "correct": 3,
     "explanation": "The Pacific Ocean is the largest and deepest ocean on Earth."},
    {"category": "General Knowledge", "difficulty": "Medium", "q": "Who wrote the play 'Romeo and Juliet'?",
     "options": ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], "correct": 1,
     "explanation": "William Shakespeare wrote 'Romeo and Juliet' around 1595."},
    {"category": "General Knowledge", "difficulty": "Medium", "q": "Which gas do plants absorb from the atmosphere for photosynthesis?",
     "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], "correct": 2,
     "explanation": "Plants absorb carbon dioxide and release oxygen during photosynthesis."},
    {"category": "General Knowledge", "difficulty": "Hard", "q": "What is the currency of Japan?",
     "options": ["Won", "Yuan", "Yen", "Ringgit"], "correct": 2,
     "explanation": "The Japanese Yen (JPY) is the official currency of Japan."},
    {"category": "General Knowledge", "difficulty": "Hard", "q": "Which organ in the human body produces insulin?",
     "options": ["Liver", "Pancreas", "Kidney", "Spleen"], "correct": 1,
     "explanation": "The pancreas produces insulin to regulate blood sugar levels."},

    # Science
    {"category": "Science", "difficulty": "Easy", "q": "What planet is known as the Red Planet?",
     "options": ["Venus", "Mars", "Jupiter", "Saturn"], "correct": 1,
     "explanation": "Mars appears red due to iron oxide (rust) on its surface."},
    {"category": "Science", "difficulty": "Easy", "q": "What is the chemical symbol for water?",
     "options": ["H2O", "CO2", "O2", "NaCl"], "correct": 0,
     "explanation": "Water is composed of two hydrogen atoms and one oxygen atom: H2O."},
    {"category": "Science", "difficulty": "Medium", "q": "What force pulls objects toward the center of the Earth?",
     "options": ["Magnetism", "Friction", "Gravity", "Tension"], "correct": 2,
     "explanation": "Gravity is the force that attracts objects toward Earth's center."},
    {"category": "Science", "difficulty": "Medium", "q": "What is the powerhouse of the cell?",
     "options": ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], "correct": 2,
     "explanation": "Mitochondria generate most of the cell's ATP energy."},
    {"category": "Science", "difficulty": "Hard", "q": "What is the SI unit of electric resistance?",
     "options": ["Volt", "Ohm", "Ampere", "Watt"], "correct": 1,
     "explanation": "Electric resistance is measured in Ohms, named after Georg Ohm."},
    {"category": "Science", "difficulty": "Hard", "q": "Which subatomic particle has no electric charge?",
     "options": ["Proton", "Electron", "Neutron", "Positron"], "correct": 2,
     "explanation": "Neutrons are electrically neutral particles found in atomic nuclei."},

    # Technology
    {"category": "Technology", "difficulty": "Easy", "q": "What does 'CPU' stand for?",
     "options": ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Utility"], "correct": 1,
     "explanation": "CPU stands for Central Processing Unit, the brain of a computer."},
    {"category": "Technology", "difficulty": "Easy", "q": "Which company developed the iPhone?",
     "options": ["Samsung", "Google", "Apple", "Microsoft"], "correct": 2,
     "explanation": "Apple Inc. launched the first iPhone in 2007."},
    {"category": "Technology", "difficulty": "Medium", "q": "What does 'HTTP' stand for?",
     "options": ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Technical Process", "Home Tool Transfer Protocol"], "correct": 0,
     "explanation": "HTTP stands for HyperText Transfer Protocol, used to load web pages."},
    {"category": "Technology", "difficulty": "Medium", "q": "Which company created the Android operating system?",
     "options": ["Apple", "Google", "Microsoft", "Amazon"], "correct": 1,
     "explanation": "Google developed and maintains the Android operating system."},
    {"category": "Technology", "difficulty": "Hard", "q": "What does 'DNS' stand for in networking?",
     "options": ["Domain Name System", "Data Network Service", "Digital Naming Standard", "Direct Node Server"], "correct": 0,
     "explanation": "DNS (Domain Name System) translates domain names into IP addresses."},
    {"category": "Technology", "difficulty": "Hard", "q": "Which protocol is primarily used to secure web traffic?",
     "options": ["FTP", "SMTP", "TLS/SSL", "POP3"], "correct": 2,
     "explanation": "TLS/SSL encrypts data transmitted between a browser and a server."},

    # Programming
    {"category": "Programming", "difficulty": "Easy", "q": "Which symbol is used for single-line comments in JavaScript?",
     "options": ["//", "#", "<!-- -->", "/* */"], "correct": 0,
     "explanation": "JavaScript uses // for single-line comments."},
    {"category": "Programming", "difficulty": "Easy", "q": "What does 'HTML' stand for?",
     "options": ["HyperText Markup Language", "HighText Machine Language", "HyperText Machine Language", "HyperTransfer Markup Language"], "correct": 0,
     "explanation": "HTML stands for HyperText Markup Language, used to structure web pages."},
    {"category": "Programming", "difficulty": "Medium", "q": "Which data structure uses LIFO (Last In, First Out)?",
     "options": ["Queue", "Stack", "Array", "Linked List"], "correct": 1,
     "explanation": "A stack follows the Last In, First Out principle."},
    {"category": "Programming", "difficulty": "Medium", "q": "Which data structure follows FIFO (First In, First Out)?",
     "options": ["Stack", "Queue", "Tree", "Graph"], "correct": 1,
     "explanation": "A queue follows the First In, First Out principle."},
    {"category": "Programming", "difficulty": "Hard", "q": "What is the time complexity of binary search on a sorted array?",
     "options": ["O(n)", "O(n log n)", "O(log n)", "O(1)"], "correct": 2,
     "explanation": "Binary search halves the search space each step, giving O(log n)."},
    {"category": "Programming", "difficulty": "Hard", "q": "Which sorting algorithm has the best average time complexity?",
     "options": ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"], "correct": 2,
     "explanation": "Quick Sort averages O(n log n), better than the O(n^2) others listed."},

    # Python
    {"category": "Python", "difficulty": "Easy", "q": "Which keyword is used to define a function in Python?",
     "options": ["func", "def", "function", "lambda"], "correct": 1,
     "explanation": "Python functions are defined using the 'def' keyword."},
    {"category": "Python", "difficulty": "Easy", "q": "Which of these is a mutable data type in Python?",
     "options": ["Tuple", "String", "List", "Integer"], "correct": 2,
     "explanation": "Lists are mutable in Python, unlike tuples and strings."},
    {"category": "Python", "difficulty": "Medium", "q": "Which programming language is primarily used for data science?",
     "options": ["HTML", "Python", "CSS", "XML"], "correct": 1,
     "explanation": "Python is widely used for data science because of libraries such as NumPy, Pandas, Matplotlib and Scikit-learn."},
    {"category": "Python", "difficulty": "Medium", "q": "What does the 'len()' function do in Python?",
     "options": ["Returns the largest item", "Returns the length of an object", "Rounds a number", "Converts to lowercase"], "correct": 1,
     "explanation": "len() returns the number of items in an object such as a list or string."},
    {"category": "Python", "difficulty": "Hard", "q": "What does a Python decorator do?",
     "options": ["Formats code style", "Wraps a function to extend its behavior", "Deletes a variable", "Compiles Python to C"], "correct": 1,
     "explanation": "Decorators wrap a function, modifying or extending its behavior without changing its code."},
    {"category": "Python", "difficulty": "Hard", "q": "Which module is commonly used for handling dates in Python?",
     "options": ["time", "datetime", "calendar", "os"], "correct": 1,
     "explanation": "The 'datetime' module provides classes for manipulating dates and times."},

    # Mathematics
    {"category": "Mathematics", "difficulty": "Easy", "q": "What is 12 x 8?",
     "options": ["96", "86", "108", "92"], "correct": 0, "explanation": "12 x 8 = 96."},
    {"category": "Mathematics", "difficulty": "Easy", "q": "What is the square root of 81?",
     "options": ["7", "8", "9", "10"], "correct": 2, "explanation": "9 x 9 = 81, so the square root of 81 is 9."},
    {"category": "Mathematics", "difficulty": "Medium", "q": "What is the value of Pi rounded to two decimal places?",
     "options": ["3.12", "3.14", "3.16", "3.18"], "correct": 1, "explanation": "Pi is approximately 3.14159, which rounds to 3.14."},
    {"category": "Mathematics", "difficulty": "Medium", "q": "What is the sum of the interior angles of a triangle?",
     "options": ["90°", "180°", "270°", "360°"], "correct": 1, "explanation": "The interior angles of any triangle always sum to 180°."},
    {"category": "Mathematics", "difficulty": "Hard", "q": "What is the derivative of x^2 with respect to x?",
     "options": ["x", "2x", "x^2", "2"], "correct": 1, "explanation": "Using the power rule, the derivative of x^2 is 2x."},
    {"category": "Mathematics", "difficulty": "Hard", "q": "What is the value of log base 10 of 100?",
     "options": ["1", "2", "10", "100"], "correct": 1, "explanation": "log10(100) = 2, since 10^2 = 100."},

    # History
    {"category": "History", "difficulty": "Easy", "q": "In which year did World War II end?",
     "options": ["1943", "1945", "1947", "1950"], "correct": 1, "explanation": "World War II ended in 1945."},
    {"category": "History", "difficulty": "Easy", "q": "Who was the first President of the United States?",
     "options": ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], "correct": 2,
     "explanation": "George Washington served as the first U.S. President from 1789 to 1797."},
    {"category": "History", "difficulty": "Medium", "q": "Which ancient civilization built the pyramids of Giza?",
     "options": ["Romans", "Greeks", "Egyptians", "Mayans"], "correct": 2, "explanation": "The pyramids of Giza were built by the ancient Egyptians."},
    {"category": "History", "difficulty": "Medium", "q": "The Berlin Wall fell in which year?",
     "options": ["1987", "1989", "1991", "1993"], "correct": 1, "explanation": "The Berlin Wall fell in November 1989."},
    {"category": "History", "difficulty": "Hard", "q": "Who was the first Emperor of Rome?",
     "options": ["Julius Caesar", "Nero", "Augustus", "Constantine"], "correct": 2, "explanation": "Augustus became the first Roman Emperor in 27 BC."},
    {"category": "History", "difficulty": "Hard", "q": "The Treaty of Versailles was signed after which war?",
     "options": ["World War I", "World War II", "Franco-Prussian War", "Napoleonic Wars"], "correct": 0,
     "explanation": "The Treaty of Versailles (1919) formally ended World War I."},

    # Geography
    {"category": "Geography", "difficulty": "Easy", "q": "What is the capital of France?",
     "options": ["Berlin", "Madrid", "Paris", "Rome"], "correct": 2, "explanation": "Paris is the capital and largest city of France."},
    {"category": "Geography", "difficulty": "Easy", "q": "Which is the longest river in the world?",
     "options": ["Amazon", "Nile", "Yangtze", "Mississippi"], "correct": 1,
     "explanation": "The Nile River is traditionally considered the longest river in the world."},
    {"category": "Geography", "difficulty": "Medium", "q": "Which country has the largest population in the world?",
     "options": ["USA", "India", "China", "Indonesia"], "correct": 1,
     "explanation": "As of recent estimates, India has surpassed China as the most populous country."},
    {"category": "Geography", "difficulty": "Medium", "q": "Mount Everest is located in which mountain range?",
     "options": ["Andes", "Alps", "Himalayas", "Rockies"], "correct": 2,
     "explanation": "Mount Everest is part of the Himalayas, on the border of Nepal and Tibet."},
    {"category": "Geography", "difficulty": "Hard", "q": "Which desert is the largest hot desert in the world?",
     "options": ["Gobi", "Kalahari", "Sahara", "Thar"], "correct": 2, "explanation": "The Sahara Desert in Africa is the largest hot desert in the world."},
    {"category": "Geography", "difficulty": "Hard", "q": "Which strait separates Europe and Africa?",
     "options": ["Bering Strait", "Strait of Gibraltar", "Strait of Hormuz", "Bosphorus"], "correct": 1,
     "explanation": "The Strait of Gibraltar separates Spain (Europe) from Morocco (Africa)."},
]

# ---------------------------------------------------------------------------
# Session state initialization
# ---------------------------------------------------------------------------

def init_state():
    defaults = {
        "screen": "home",           # home | quiz | result | add
        "custom_questions": [],
        "quiz": [],
        "q_index": 0,
        "score": 0,
        "streak": 0,
        "best_streak_in_quiz": 0,
        "answers": [],
        "question_start": None,
        "locked": False,
        "selected": None,
        "stats": {
            "total_quizzes": 0,
            "total_questions": 0,
            "correct": 0,
            "incorrect": 0,
            "high_score": 0,
            "best_streak": 0,
        },
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


init_state()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_quiz(category, difficulty):
    pool_source = QUESTIONS + st.session_state.custom_questions
    pool = [
        q for q in pool_source
        if (category == "All" or q["category"] == category) and q["difficulty"] == difficulty
    ]
    if len(pool) < QUESTIONS_PER_QUIZ:
        extra = [
            q for q in pool_source
            if (category == "All" or q["category"] == category) and q["difficulty"] != difficulty
        ]
        pool = pool + extra
    random.shuffle(pool)
    return pool[:QUESTIONS_PER_QUIZ]


def start_quiz(category, difficulty):
    st.session_state.quiz = build_quiz(category, difficulty)
    st.session_state.difficulty_chosen = difficulty
    st.session_state.q_index = 0
    st.session_state.score = 0
    st.session_state.streak = 0
    st.session_state.best_streak_in_quiz = 0
    st.session_state.answers = []
    st.session_state.locked = False
    st.session_state.selected = None
    st.session_state.question_start = time.time()
    st.session_state.screen = "quiz"


def finish_quiz():
    answers = st.session_state.answers
    correct_count = sum(1 for a in answers if a["correct"])
    stats = st.session_state.stats
    total_score = sum(a["points"] for a in answers)
    stats["total_quizzes"] += 1
    stats["total_questions"] += len(answers)
    stats["correct"] += correct_count
    stats["incorrect"] += len(answers) - correct_count
    stats["high_score"] = max(stats["high_score"], total_score)
    stats["best_streak"] = max(stats["best_streak"], st.session_state.best_streak_in_quiz)
    st.session_state.screen = "result"


def submit_answer(option_index):
    """option_index is -1 for a timeout / no answer."""
    if st.session_state.locked:
        return
    st.session_state.locked = True
    st.session_state.selected = option_index

    current_q = st.session_state.quiz[st.session_state.q_index]
    difficulty = current_q["difficulty"]
    limit = TIME_LIMIT[difficulty]
    is_correct = option_index == current_q["correct"]

    elapsed = time.time() - st.session_state.question_start
    time_bonus = max(0, round((1 - elapsed / limit) * 5)) if is_correct else 0
    base = BASE_POINTS[difficulty] if is_correct else 0

    if is_correct:
        st.session_state.streak += 1
    else:
        st.session_state.streak = 0
    streak = st.session_state.streak

    streak_bonus = 0
    if streak == 3:
        streak_bonus = 5
    elif streak == 5:
        streak_bonus = 10
    elif streak >= 10 and streak % 10 == 0:
        streak_bonus = 25

    points = base + time_bonus + streak_bonus

    st.session_state.best_streak_in_quiz = max(st.session_state.best_streak_in_quiz, streak)
    st.session_state.score += points
    st.session_state.answers.append({
        "question": current_q["q"],
        "options": current_q["options"],
        "chosen": option_index,
        "correct_index": current_q["correct"],
        "correct": is_correct,
        "explanation": current_q["explanation"],
        "points": points,
    })


def next_question():
    next_index = st.session_state.q_index + 1
    if next_index >= len(st.session_state.quiz):
        finish_quiz()
    else:
        st.session_state.q_index = next_index
        st.session_state.locked = False
        st.session_state.selected = None
        st.session_state.question_start = time.time()


# ---------------------------------------------------------------------------
# Screens
# ---------------------------------------------------------------------------

def home_screen():
    st.title("🎯 QuizMaster")
    st.caption("Test your knowledge.")

    category = st.selectbox("Category", ["All"] + CATEGORIES)
    difficulty = st.radio("Difficulty", ["Easy", "Medium", "Hard"], horizontal=True, index=1)

    if st.button("Start quiz — 10 questions", type="primary", use_container_width=True):
        start_quiz(category, difficulty)
        st.rerun()

    if st.button("Add your own question", use_container_width=True):
        st.session_state.screen = "add"
        st.rerun()

    st.divider()
    stats = st.session_state.stats
    accuracy = round((stats["correct"] / stats["total_questions"]) * 100) if stats["total_questions"] else 0

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Quizzes played", stats["total_quizzes"])
    c2.metric("Accuracy", f"{accuracy}%")
    c3.metric("High score", stats["high_score"])
    c4.metric("Best streak", stats["best_streak"])

    if st.session_state.custom_questions:
        st.caption(f"{len(st.session_state.custom_questions)} custom question(s) in the pool")


def quiz_screen():
    quiz = st.session_state.quiz
    idx = st.session_state.q_index
    current_q = quiz[idx]
    difficulty = current_q["difficulty"]
    limit = TIME_LIMIT[difficulty]

    st.caption(f"Question {idx + 1} / {len(quiz)}  ·  {current_q['category']}")

    elapsed = time.time() - st.session_state.question_start
    remaining = max(0, limit - elapsed)

    top_col1, top_col2 = st.columns([3, 1])
    with top_col1:
        st.progress(min(1.0, remaining / limit))
    with top_col2:
        st.write(f"⏱ {int(remaining)}s")

    streak_note = f" · Streak {st.session_state.streak}" if st.session_state.streak >= 3 else ""
    st.write(f"**Score: {st.session_state.score}{streak_note}**")

    st.subheader(current_q["q"])

    if not st.session_state.locked:
        for i, opt in enumerate(current_q["options"]):
            if st.button(opt, key=f"opt_{idx}_{i}", use_container_width=True):
                submit_answer(i)
                st.rerun()

        # Auto-refresh to keep the timer moving; time out if limit passed
        if remaining <= 0:
            submit_answer(-1)
            st.rerun()
        else:
            time.sleep(1)
            st.rerun()
    else:
        selected = st.session_state.selected
        for i, opt in enumerate(current_q["options"]):
            if i == current_q["correct"]:
                st.success(f"✔ {opt}")
            elif i == selected:
                st.error(f"✘ {opt}")
            else:
                st.write(opt)

        if selected == current_q["correct"]:
            st.info("Correct.")
        elif selected == -1:
            st.warning("Time's up.")
        else:
            st.info("Not quite.")

        if st.button("Next", type="primary", use_container_width=True):
            next_question()
            st.rerun()


def result_screen():
    answers = st.session_state.answers
    correct_count = sum(1 for a in answers if a["correct"])
    accuracy = round((correct_count / len(answers)) * 100) if answers else 0

    st.title("Quiz complete.")
    st.metric("Total points", st.session_state.score)

    c1, c2, c3 = st.columns(3)
    c1.metric("Accuracy", f"{accuracy}%")
    c2.metric("Correct", correct_count)
    c3.metric("Incorrect", len(answers) - correct_count)

    col1, col2 = st.columns(2)
    with col1:
        if st.button("Play again", type="primary", use_container_width=True):
            st.session_state.screen = "home"
            st.rerun()
    with col2:
        if st.button("Home", use_container_width=True):
            st.session_state.screen = "home"
            st.rerun()

    with st.expander("Review answers"):
        for i, a in enumerate(answers, start=1):
            st.markdown(f"**{i}. {a['question']}**")
            chosen_text = "No answer (time out)" if a["chosen"] == -1 else a["options"][a["chosen"]]
            if a["correct"]:
                st.write(f"Your answer: {chosen_text} ✔")
            else:
                st.write(f"Your answer: {chosen_text} ✘")
                st.write(f"Correct answer: {a['options'][a['correct_index']]}")
            st.caption(a["explanation"])
            st.divider()


def add_question_screen():
    st.title("Add a question.")

    with st.form("add_question_form", clear_on_submit=True):
        category = st.selectbox("Category", CATEGORIES)
        difficulty = st.radio("Difficulty", ["Easy", "Medium", "Hard"], horizontal=True, index=1)
        question_text = st.text_area("Question")
        opt_a = st.text_input("Option A")
        opt_b = st.text_input("Option B")
        opt_c = st.text_input("Option C")
        opt_d = st.text_input("Option D")
        correct = st.radio(
            "Correct answer",
            ["A", "B", "C", "D"],
            horizontal=True,
        )
        explanation = st.text_area("Explanation")

        submitted = st.form_submit_button("Add question", type="primary", use_container_width=True)

        if submitted:
            options = [opt_a, opt_b, opt_c, opt_d]
            if not question_text.strip():
                st.error("Enter a question.")
            elif any(not o.strip() for o in options):
                st.error("Fill in all four options.")
            elif not explanation.strip():
                st.error("Add a short explanation.")
            else:
                st.session_state.custom_questions.append({
                    "category": category,
                    "difficulty": difficulty,
                    "q": question_text.strip(),
                    "options": [o.strip() for o in options],
                    "correct": ["A", "B", "C", "D"].index(correct),
                    "explanation": explanation.strip(),
                })
                st.success("Question added.")

    if st.button("Done", use_container_width=True):
        st.session_state.screen = "home"
        st.rerun()

    if st.session_state.custom_questions:
        st.divider()
        st.caption(f"Your added questions ({len(st.session_state.custom_questions)})")
        for i, q in enumerate(st.session_state.custom_questions):
            col1, col2 = st.columns([5, 1])
            with col1:
                st.write(f"**{q['category']} · {q['difficulty']}**")
                st.write(q["q"])
            with col2:
                if st.button("Remove", key=f"remove_{i}"):
                    st.session_state.custom_questions.pop(i)
                    st.rerun()
            st.divider()


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

screen = st.session_state.screen
if screen == "home":
    home_screen()
elif screen == "quiz":
    quiz_screen()
elif screen == "result":
    result_screen()
elif screen == "add":
    add_question_screen()
