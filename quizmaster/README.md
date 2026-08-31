# QuizMaster

A gamified multiple-choice quiz app (category/difficulty selection, timer,
scoring with streak bonuses, result review, and a form to add your own
questions).

## Run it locally

Requirements: [Node.js](https://nodejs.org) 18+ installed.

```bash
# 1. Unzip this folder, then open a terminal inside it
cd quizmaster

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the URL it prints (usually **http://localhost:5173**) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to `dist/`, which you can deploy to any
static host (Vercel, Netlify, GitHub Pages, etc.).

## Project structure

```
quizmaster/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        # React entry point
    └── QuizMaster.jsx  # The app itself
```
