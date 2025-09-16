import express from "express";
import path from "path";
import url from "url";
import * as fs from "fs";
import { Query } from "./query.mjs";

const app = express();
const queries = [];

// ----- Helpers -----
const decorate = (answer, correct) => {
  return correct
    ? `<span class="correct-answer">${answer}</span>`
    : `<span class="incorrect-answer">${answer}</span>`;
};

function check(id, answers) {
  const questionObj = queries.find((q) => q.uniqueId === id);
  if (!questionObj) return { status: "Not Found", decoratedAnswers: [] };

  const correctAnswers = questionObj.answers.map((a) => a.toLowerCase().trim());

  const decoratedAnswers = answers.map((a) => {
    const cleaned = a.toLowerCase().trim();
    const isCorrect = correctAnswers.includes(cleaned);
    return decorate(a, isCorrect);
  });

  const count = decoratedAnswers.filter(
    (a) => !a.includes("incorrect-answer")
  ).length;
  const numOfAns = correctAnswers.length;

  let status = "";
  if (numOfAns === count) status = "Correct";
  else if (count === 0) status = "Incorrect";
  else status = "Partially Correct";

  return { status, decoratedAnswers };
}

// ----- App Config -----
const basePath = path.dirname(url.fileURLToPath(import.meta.url));
const publicPath = path.resolve(basePath, "../public");

app.set("view engine", "hbs");
app.set("views", path.resolve(basePath, "../views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

// ----- Load Question Bank -----
const questionBank = fs.readFileSync(
  path.resolve(basePath, "../code-samples/question-bank.json"),
  "utf8"
);
JSON.parse(questionBank).forEach((x) => {
  queries.push(new Query(x.question, x.genre, x.answers));
});

// ----- Routes -----
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.redirect("/quiz");
});

app.get("/questions", (req, res) => {
  let term = req.query.search ? req.query.search.toLowerCase().trim() : "";
  const newQueries = queries.filter(
    (q) =>
      q.question.toLowerCase().includes(term) ||
      q.genre.toLowerCase().includes(term) ||
      q.answers.some((a) => a.toLowerCase().includes(term))
  );
  res.render("questions", { queries: newQueries });
});

app.post("/questions", (req, res) => {
  const newq = req.body;
  const toAdd = new Query(newq.question, newq.genre, newq.answers.split(","));
  queries.push(toAdd);
  res.redirect("/questions");
});

app.get("/quiz", (req, res) => {
  const num = Math.floor(Math.random() * queries.length);
  res.render("quiz", {
    question: queries[num].question,
    id: queries[num].uniqueId,
  });
});

app.post("/quiz", (req, res) => {
  const answ = req.body.answer || "";
  const id = req.body.id;
  const answers = answ.split(",").map((a) => a.trim());

  const { status, decoratedAnswers } = check(id, answers);

  res.render("quiz", {
    question: queries.find((q) => q.uniqueId === id)?.question,
    id,
    result: status,
    answers: answ,
    decoratedAnswers,
  });
});

// ----- Export for Vercel -----
export default app;
