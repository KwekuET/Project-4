const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const LIST_FILE = __dirname + "/accounts.json";

// Make the account list if it doesn't exist yet
if (!fs.existsSync(LIST_FILE)) fs.writeFileSync(LIST_FILE, "[]");

// Only these files can be opened by visitors (keeps accounts.json private)
const pages = ["index.html", "newaccount.html", "form.html", "records.html", "style.css"];
pages.forEach(page => {
  app.get("/" + page, (req, res) => res.sendFile(__dirname + "/" + page));
});
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

function readList() {
  return JSON.parse(fs.readFileSync(LIST_FILE));
}

function accountFile(id) {
  return __dirname + "/account" + id + ".json";
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
  const file = "account" + id + ".json";

  const account = { id: id, username: req.body.username, password: req.body.password, form: null };
  fs.writeFileSync(accountFile(id), JSON.stringify(account, null, 2));

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
  const account = JSON.parse(fs.readFileSync(accountFile(Number(req.params.id))));
  res.json(account.form);
});

// Save one account's form answers
app.post("/form/:id", (req, res) => {
  const file = accountFile(Number(req.params.id));
  const account = JSON.parse(fs.readFileSync(file));
  account.form = req.body;
  fs.writeFileSync(file, JSON.stringify(account, null, 2));
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => console.log("Running at http://localhost:3000"));
