const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const LIST_FILE = "data/accounts.json";

function readList() {
  return JSON.parse(fs.readFileSync(LIST_FILE));
}

// Login: read the account list and look for a match
app.post("/login", (req, res) => {
  const list = readList();
  const account = list.find(a => a.username === req.body.username && a.password === req.body.password);
  if (account) {
    res.json({ ok: true, id: account.id });
  } else {
    res.json({ ok: false });
  }
});

// New account: make the account file, then add it to the list
app.post("/newaccount", (req, res) => {
  const list = readList();
  const id = list.length + 1;
  const file = "data/accounts/" + id + ".json";

  const account = { id: id, username: req.body.username, password: req.body.password, form: null };
  fs.writeFileSync(file, JSON.stringify(account, null, 2));

  list.push({ id: id, username: req.body.username, password: req.body.password, file: file });
  fs.writeFileSync(LIST_FILE, JSON.stringify(list, null, 2));

  res.json({ id: id });
});

// All account IDs (for the records drop-down)
app.get("/ids", (req, res) => {
  res.json(readList().map(a => a.id));
});

// Get one account's form answers (no password)
app.get("/form/:id", (req, res) => {
  const account = JSON.parse(fs.readFileSync("data/accounts/" + req.params.id + ".json"));
  res.json(account.form);
});

// Save one account's form answers
app.post("/form/:id", (req, res) => {
  const file = "data/accounts/" + req.params.id + ".json";
  const account = JSON.parse(fs.readFileSync(file));
  account.form = req.body;
  fs.writeFileSync(file, JSON.stringify(account, null, 2));
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => console.log("Running at http://localhost:3000"));
