# Getting Started — read this one first

Written assuming you have never run a Python project from a terminal. If you already
know this stuff, skip to `prototype/README.md`.

---

## Part 1 — What did I actually give you?

Two things:

| | What it is | When you use it |
|---|---|---|
| **`PROJECT_PLAN.md`** | A written document. Datasets, timeline, risks, what to build. No code. | Read it. Show your guide/supervisor. It becomes your project proposal. |
| **`prototype/`** | Working Python code. A tiny, fake-data version of your whole project. | Run it. Play with it. Then gradually replace the fake parts with real ones. |

### The most important thing to understand about the prototype

**It does not use real data.** It invents fake tomato photos and fake mandi prices.

That sounds useless. It isn't, and here's why. Your project has 4 parts that must
connect: camera → grading → quality math → price advice. Most students build part 1,
then part 2, then discover in week 11 that the parts don't fit together and panic.

The prototype is all 4 parts **already connected and working**, with cardboard where the
real components go. So you never have to wonder "will this fit together?" — it already
does. Your job becomes replacing cardboard with real parts, one at a time, and the thing
keeps working the whole way.

Think of it as the wiring in a house before the appliances arrive.

---

## Part 2 — Run it (about 10 minutes)

### Step 1: Open a terminal

- **Windows:** Start menu → type `cmd` → open Command Prompt
- **Mac:** Cmd+Space → type `terminal` → Enter
- **Linux:** Ctrl+Alt+T

A terminal is a window where you type commands instead of clicking. That's all it is.

### Step 2: Go into the project folder

Type `cd `, then the path to the `prototype` folder, then Enter:

```
cd path/to/veggrade/prototype
```

**Shortcut:** type `cd ` (with a space), then drag the `prototype` folder from your file
manager into the terminal window. It fills in the path for you. Press Enter.

To confirm you're in the right place, type `dir` (Windows) or `ls` (Mac/Linux). You
should see `run_pipeline.py`, `playground.py`, and some folders.

### Step 3: Check your computer is ready

```
python check_setup.py
```

This changes nothing. It just looks at your system and reports back in plain English.

- **All green `[OK]`** → move to Step 4.
- **Red `[FAIL]` about missing packages** → it prints the exact `pip install ...` command
  to copy-paste. Run that, then run `check_setup.py` again.
- **`python: command not found`** → try `python3` instead of `python` everywhere in this
  guide. If that also fails, install Python from [python.org](https://python.org) and
  tick **"Add Python to PATH"** during installation.

### Step 4: Run the whole thing

```
python run_pipeline.py --fast
```

Takes ~15 seconds. You'll see it work through Stage A, Stage B, Stage C.

`--fast` uses fewer images and fewer test runs. Perfect while learning. Drop it
(`python run_pipeline.py`) for the slower, more accurate version — about 40 seconds —
when you want numbers to put in your report.

### Step 5: Look at the result

Open `prototype/outputs/report.html` by double-clicking it. It opens in your browser.

That report is your project, in miniature, running end to end.

---

## Part 3 — Now play with it

This is where you actually learn what the system does.

```
python playground.py
```

It prints a plain-English walkthrough of one lot: quality, market price, which buyer to
sell to, and whether to sell now or wait.

**Now change something.** Open `playground.py` in any text editor (Notepad works;
[VS Code](https://code.visualstudio.com) is much nicer). Near the top you'll find a block
marked `SETTINGS`. Change this:

```python
LOT_CONDITION = {
    "fresh":        0.30,
    "ripe":         0.28,
    ...
}
```

to a badly damaged lot:

```python
LOT_CONDITION = {
    "fresh":        0.05,
    "ripe":         0.10,
    "unripe":       0.05,
    "bruised":      0.20,
    "pest_damaged": 0.25,
    "infected":     0.20,
    "rotten":       0.15,
}
```

(The numbers must add up to 1.0 — the script checks and tells you if they don't.)

Save, run `python playground.py` again. **The recommended buyer changes.** Good lots go
to direct consumers who pay a premium. Bad lots must be dumped on a middleman
immediately, because they rot faster than the premium can pay for the wait.

That flip is the entire argument of your project. Everything else is machinery to
compute which side of it you're on.

**Other experiments worth doing:**

| Change | What you'll learn |
|---|---|
| `COMMODITY = "Potato"` | Potatoes rot slowly, so waiting becomes attractive. Compare with tomato. |
| `LOT_QUINTALS = 5` | Small lots can go entirely to high-margin buyers. Volume caps stop big ones. |
| `RISK_AVERSION = 1.4` | A farmer with a loan due sells now even when waiting looks better on average. |
| `HORIZON_DAYS = 21` | Long waits get destroyed by spoilage. |

Nothing you type in `playground.py` can break the rest of the project.

---

## Part 4 — What the code files are

You do not need to understand all of these. Here's the map so you know where to look.

```
prototype/
├── check_setup.py      Run first. Checks your computer.
├── playground.py       Your sandbox. Change settings, see results.
├── run_pipeline.py     Runs everything, builds the HTML report.
│
├── data/loaders.py     Makes the FAKE prices and FAKE photos.   <-- replace later
├── vision/grader.py    STAGE A: looks at a photo, guesses condition.  <-- replace later
├── lot/estimator.py    STAGE B: sample of 40 -> quality of all 500 kg, with error bars
├── pricing/forecast.py STAGE C1: predicts the price 7 days out
└── pricing/router.py   STAGE C2: works out which buyer pays most
```

The two marked `<-- replace later` are the **seams**: the deliberately-fake parts you swap
for real ones. The rest is real logic you can keep.

### Why "seams" matter

`vision/grader.py` currently guesses conditions using simple colour and texture rules. It
is not a neural network. But it exposes exactly the same two functions a real neural
network would:

```python
grader.predict_proba(images)   # returns probabilities for each condition
grader.confusion_matrix_normalised()
```

So when you build your real CNN in week 6, you make it provide those same two functions,
delete the old file, and **everything downstream keeps working with zero changes.** Same
story for prices in `data/loaders.py`.

This is the single most useful idea in the whole codebase. It's why you can build the
parts in any order.

---

## Part 5 — Your first four real tasks

In order. Do not skip #1.

### 1. Start collecting real prices — today, seriously

The government's price API (data.gov.in) only gives you **today's** prices. Not history.
Every day you wait is a day of data you can never get back. Miss a month and your
forecasting model has a month-shaped hole in it.

Register at [data.gov.in](https://data.gov.in) for a free API key, then write a small
script that downloads today's prices and appends them to a CSV. Set it to run daily.

Ask me for this script — it's about 30 lines and I'll write it for you.

Meanwhile, download the Kaggle backfill for history going back to 2023:
`arjunyadav99/indian-agricultural-mandi-prices-20232025`

### 2. Swap in real prices

Replace `synthetic_prices()` in `data/loaders.py` with a function that reads your CSV.
Keep the same column names. The rest of the project won't notice the difference.

### 3. Get real photos

Public Kaggle datasets first (listed in `PROJECT_PLAN.md` §3.2). But you **must** also
shoot your own at Ghaziabad or Hapur mandi — public datasets are clean single items on
white backgrounds, and your model will fall apart on a real crate under a tarpaulin.

Best single experiment, and it's cheap: buy 3 kg of tomatoes, photograph the same ones
every day for 10 days as they rot. That gives you a labelled decay series almost nobody
else has.

### 4. Build the real CNN

Week 6 in the plan. Transfer learning on MobileNetV3. Match the two-function interface
above and drop it in.

---

## Part 6 — Honest warnings

Things in this prototype that are **fake and must not go in your report as findings**:

- **All prices are invented.** Realistic-shaped, but invented.
- **All photos are drawn shapes**, not real vegetables.
- **`QUALITY_WEIGHTS`** (in `data/loaders.py`) — how much a bruise reduces value — is made
  up. Get real numbers from Agmarknet's grade-price spreads, or by asking 10 traders.
- **The `CHANNELS` table** (in `pricing/router.py`) — commission rates, transport costs — is
  made up. Get real numbers from APMC published rates and trader interviews.

If you invent the weights and then "prove" the system prices lots correctly, you've proven
nothing — it's circular reasoning, and an examiner will catch it. This is the single most
likely way this project gets marked down.

### One result you should keep, not hide

When you run the pipeline, the price forecast section says the **naive** model won — that
simply guessing "tomorrow's price = today's price" beat both machine learning models.

That is a real and normal result for daily commodity prices. Do not delete it. Instead
notice what's underneath: the gradient boosting model got **~62% directional accuracy**
(did the price go up or down?) where naive can't answer at all. For a sell-or-wait
decision, direction is what pays. That's your argument, and it's a much more sophisticated
one than "my model has low error."

---

## Stuck?

| Message | Fix |
|---|---|
| `python: command not found` | Use `python3`. Or install Python and tick "Add to PATH". |
| `ModuleNotFoundError: No module named 'sklearn'` | `pip install -r requirements.txt` |
| `ModuleNotFoundError: No module named 'data'` | You're in the wrong folder. `cd` into `prototype` first. |
| `can't open file 'run_pipeline.py'` | Same — wrong folder. Run `ls` or `dir` to check. |
| Report looks broken / no images | Open the actual `outputs/report.html` file in a browser. The PNGs must sit beside it. |

Tell me what the error says and I'll sort it out.
