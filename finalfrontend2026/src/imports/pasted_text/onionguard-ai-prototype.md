Improve the existing **OnionGuard AI** mobile app prototype without redesigning it from scratch.

Keep the existing:

* Green agricultural visual theme
* Typography
* Card style
* Navigation
* Overall layout and branding
* Professional government/agriculture application feel

The main goal is to make the prototype clearly demonstrate the **AI computer-vision functionality required by Smart India Hackathon PS-26031**.

## 1. Add an AI Detection Result Screen

Add a new screen immediately after the AI Analysis screen.

Title:
**AI Detection Results**

Show a realistic photograph of multiple onions arranged together.

Overlay AI detection bounding boxes around individual onions.

Use clear labels:

* Healthy
* Damaged
* Rotten
* Sprouted
* Undersized

Use subtle visual indicators rather than excessive colors.

Below the image show:

**20 Onions Detected**

* Healthy: 15
* Damaged: 2
* Rotten: 1
* Sprouted: 1
* Undersized: 1

Also show:

**Average Diameter: 5.4 cm**

Add a button:
**Continue to Quality Assessment**

The screen should make it immediately obvious that computer vision is analyzing individual onions.

## 2. Add a Size Measurement Screen

Create a screen showing how the system determines onion size.

Show:

* Onion image
* Reference/calibration marker
* Measured diameter
* Size distribution

Example:

Average Diameter: **5.4 cm**

Size Distribution:

* Below 4.5 cm — 10%
* 4.5–6.5 cm — 82%
* Above 6.5 cm — 8%

Add a simple visual chart.

Include:
**Size Compliance: 82%**

Button:
**View Quality Assessment**

## 3. Improve the Quality Assessment Screen

Make this the main result screen.

Show a large circular quality score:

**87 / 100**

Then prominently display:

**Grade A — 82%**

**URS — 18%**

Add a visual comparison/chart for Grade A vs URS.

Create a defect breakdown:

* Damaged — 8%
* Rotten — 5%
* Sprouted — 5%
* Undersized — 10%

Use clear status indicators.

## 4. Add “Why This Grade?” Section

Add an explainable AI section:

**Why this grade?**

✓ Majority of onions are within the acceptable size range
✓ Low percentage of damaged onions
✓ Low percentage of rotten onions
✓ No significant quality deviation detected

⚠ Some sprouted and undersized onions detected

The explanation should look like an actual decision-support system, not generic AI text.

## 5. Add AI Confidence

For individual detections, show confidence where appropriate.

Example:

Rotten
**96% confidence**

Sprouted
**91% confidence**

Healthy
**97% confidence**

Do not make the confidence numbers visually dominant.

## 6. Improve the Final Report Screen

Make the report look like an official digital inspection record.

Include:

**ONION QUALITY INSPECTION REPORT**

Report ID: OQA-2026-00124
Batch ID: BATCH-4521
Date & Time: 23 Aug 2026
Procurement Center: Ghaziabad Center
Inspector: Rajesh Kumar
Sample Size: 20 onions

Then:

Grade A: **82%**
URS: **18%**
Quality Score: **87/100**

Add:

* Defect summary
* Size compliance
* Inspection image
* AI assessment
* QR code for report verification

Buttons:
**Download PDF**
**Share Report**
**Verify Report**

## 7. Improve the Dashboard

Keep the current dashboard design but make the statistics more relevant.

Show:

**Today's Inspections**
24

**Average Grade A**
84%

**Average URS**
16%

**Reports Generated**
24

Make **Start New Inspection** the most prominent action.

Add a Recent Inspections section with:

Batch ID | Grade A | Quality Score | Date

## 8. Improve the Capture Screen

Make the camera screen look like a real field inspection tool.

Show:

* Camera preview
* Sample area guide
* Reference-size marker
* Lighting quality indicator
* Number of onions detected

Add guidance:

**“Place onions on a flat surface and ensure all onions are visible.”**

Show:
**Lighting: Good ✓**

**Onions detected: 20**

Primary button:
**Analyze Sample**

## 9. Add Processing States

Create a realistic AI processing sequence:

1. Detecting onions ✓
2. Measuring size ✓
3. Detecting defects ✓
4. Classifying quality ✓
5. Calculating Grade A / URS ✓
6. Generating report

Use subtle animation/progress indicators.

## 10. Prototype Navigation

Connect the prototype:

Dashboard
→ Start New Inspection
→ Sample Details
→ Camera Capture
→ AI Analysis
→ AI Detection Results
→ Size Measurement
→ Quality Assessment
→ Final Report
→ Report History
→ Report Details

## Important Design Principle

Do NOT make the app look like a generic AI chatbot.

This is an **AI-powered agricultural procurement inspection system**.

The prototype must communicate this story visually:

**Capture → Detect → Measure → Classify → Grade → Explain → Report**

Prioritize the AI detection, measurable quality parameters, explainable grading, and digital report.

Do not add unnecessary features such as chatbots, weather, e-commerce, social features, or excessive profile functionality.

Make the final prototype look realistic enough that it could be demonstrated to a government procurement officer.
