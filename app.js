// ════════════════════════════════════════════════
//  Volt Guard AI  –  app.js
// ════════════════════════════════════════════════

const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ── System Prompt ─────────────────────────────────
const SYSTEM_PROMPT = `You are **Volt Guard AI**, an intelligent AI Agent for Electricity Bill Fraud Detection built for power distribution companies.

Your objective is to analyze electricity billing data, detect suspicious consumption patterns, estimate fraud risk, explain your reasoning, and recommend appropriate actions.

You act as an Electricity Audit Assistant—not as a final decision-maker. Your role is to assist utility officers by identifying bills that require further investigation.

--------------------------------------------------
CAPABILITIES
--------------------------------------------------
You can:
• Analyze electricity consumption trends
• Compare current usage with historical records
• Detect billing anomalies and abnormal consumption patterns
• Identify possible meter tampering indicators
• Estimate fraud risk using explainable AI
• Recommend inspection actions

--------------------------------------------------
ANALYSIS WORKFLOW
--------------------------------------------------

Step 1 – Calculate
Consumption = Current Reading − Previous Reading
• If current < previous → flag "Reading Rollback"
• If consumption is negative → flag "Impossible Reading"

Step 2 – Compare
Calculated Consumption vs Billed Units.
If difference > ~10%, report "Billing Mismatch".

Step 3 – Analyze Historical Consumption
Calculate Average, Maximum, Minimum from history.
Compare current consumption with historical average.
Identify: Sudden Drop / Sudden Spike / Stable Pattern / Gradual Increase / Gradual Decrease.
Calculate percentage change.

Step 4 – Detect Possible Fraud Indicators
• Very low or very high consumption
• Reading rollback / Meter mismatch
• Repeated abnormal pattern
• Large billing difference
• Sudden unexplained decrease or increase
• Illegal connection / Meter bypass / Broken seal indicators

Step 5 – Consider Field Observations
Increase fraud confidence if: Seal Broken, Meter Bypass, Illegal Connection, Reverse Meter, Meter Damaged.

--------------------------------------------------
RISK SCORE (0–100)
--------------------------------------------------
0–20   Very Low
21–40  Low
41–60  Medium
61–80  High
81–100 Critical

Increase score for: Billing mismatch, Historical deviation, Broken seal, Meter bypass, Illegal connection, Reading rollback, Repeated abnormal behavior.

--------------------------------------------------
OUTPUT FORMAT  (always respond in Markdown)
--------------------------------------------------

# ⚡ Consumer Summary
- Consumer ID:
- Category:
- Location:
- Meter Type:
- Billing Month:

---

# 📊 Consumption Analysis
- Previous Reading:
- Current Reading:
- Calculated Consumption:
- Billed Units:
- Difference:
- Historical Average:
- Consumption Trend:

---

# 🚨 Detected Anomalies
(List every anomaly. If none: "No suspicious anomaly detected.")

---

# 📈 Fraud Risk

**Risk Score: XX / 100**

**Risk Level: [Very Low / Low / Medium / High / Critical]**

---

# 💡 AI Explanation
Explain: historical comparison, meter reading validation, billed units comparison, field observations, reasons behind the score. Use simple language.

---

# ✅ Recommendation
(Choose one: No Action Required / Monitor Next Billing Cycle / Schedule Field Inspection / Urgent Meter Inspection / Detailed Energy Audit / Potential Fraud Investigation)

---

# 🏁 Final Verdict
(One concise sentence.)

--------------------------------------------------
RULES
--------------------------------------------------
• Never state that fraud has definitely occurred. Always use: Possible / Potential / Likely / Suspicious / Requires verification.
• Never invent missing values — if required data is missing, ask only for the missing fields.
• Keep responses professional, concise, and easy to understand.
• Do not expose internal reasoning steps.
• Always explain why the bill was flagged.
• If no anomaly exists, clearly state the consumer appears normal while recommending routine monitoring.`;

// ── State ──────────────────────────────────────────
let chatHistory = [];
let analysisHistory = [];
let sidebarOpen = true;
let isLoading = false;

// ── Init ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderWelcome();
  document.getElementById("userInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  // Responsive: collapse sidebar on small screens
  if (window.innerWidth <= 640) {
    sidebarOpen = false;
    document.getElementById("sidebar").classList.remove("visible");
    document.getElementById("mainWrapper").classList.add("full");
  }
});

// ── Sidebar toggle ─────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const wrapper = document.getElementById("mainWrapper");
  if (window.innerWidth <= 640) {
    sidebar.classList.toggle("visible");
  } else {
    sidebarOpen = !sidebarOpen;
    sidebar.classList.toggle("hidden", !sidebarOpen);
    wrapper.classList.toggle("full", !sidebarOpen);
  }
}

document.getElementById("sidebarClose").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  const wrapper = document.getElementById("mainWrapper");
  if (window.innerWidth <= 640) {
    sidebar.classList.remove("visible");
  } else {
    sidebarOpen = false;
    sidebar.classList.add("hidden");
    wrapper.classList.add("full");
  }
});

// ── Panel switching ────────────────────────────────
function showPanel(name) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("panel" + capitalise(name)).classList.add("active");
  document.getElementById("btn" + capitalise(name)).classList.add("active");
  if (name === "history") renderHistory();
}

function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Welcome ────────────────────────────────────────
function renderWelcome() {
  const area = document.getElementById("chatArea");
  area.innerHTML = `
  <div class="welcome-card">
    <h1>⚡ Volt Guard AI</h1>
    <p>Intelligent Electricity Bill Fraud Detection<br>
    Describe a consumer billing case or use the <strong>Bill Analyser</strong> form to get an instant AI fraud risk report.</p>
    <div class="welcome-chips">
      <div class="chip" onclick="useChip(this)">Analyse a suspicious bill</div>
      <div class="chip" onclick="useChip(this)">What is a reading rollback?</div>
      <div class="chip" onclick="useChip(this)">How is fraud risk scored?</div>
      <div class="chip" onclick="useChip(this)">Consumer with broken seal</div>
    </div>
  </div>`;
}

function useChip(el) {
  document.getElementById("userInput").value = el.textContent;
  document.getElementById("userInput").focus();
}

// ── Chat ───────────────────────────────────────────
async function sendMessage() {
  const inputEl = document.getElementById("userInput");
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  inputEl.value = "";
  appendMsg("user", text);
  chatHistory.push({ role: "user", content: text });

  await callGroq();
}

function appendMsg(role, text) {
  const area = document.getElementById("chatArea");
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const avatar = role === "user" ? "👤" : "⚡";
  const rendered = role === "ai" ? marked.parse(text) : escapeHtml(text);
  el.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div>
      <div class="msg-bubble">${rendered}</div>
      <div class="msg-time">${now}</div>
    </div>`;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
  return el;
}

function appendTyping() {
  const area = document.getElementById("chatArea");
  const el = document.createElement("div");
  el.className = "msg ai";
  el.id = "typingIndicator";
  el.innerHTML = `
    <div class="msg-avatar">⚡</div>
    <div>
      <div class="msg-bubble">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>`;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

async function callGroq(systemOverride) {
  isLoading = true;
  setStatus("loading");
  setSendDisabled(true);
  appendTyping();

  const messages = [
    { role: "system", content: systemOverride || SYSTEM_PROMPT },
    ...chatHistory
  ];

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No response received.";

    removeTyping();
    appendMsg("ai", reply);
    chatHistory.push({ role: "assistant", content: reply });
    setStatus("online");

  } catch (err) {
    removeTyping();
    appendMsg("ai", `⚠️ **Error:** ${escapeHtml(err.message)}\n\nPlease check your API key and network connection.`);
    setStatus("offline");
  } finally {
    isLoading = false;
    setSendDisabled(false);
  }
}

// ── Form Analyser ──────────────────────────────────
function analyseForm() {
  const vals = getFormValues();
  if (!vals) return;

  // Build structured prompt from form values
  const prompt = buildFormPrompt(vals);

  // Save to history
  analysisHistory.unshift({
    id: vals.consumerID || "Unknown",
    category: vals.category,
    location: vals.location,
    time: new Date().toLocaleString(),
    prompt
  });

  // Switch to chat and send
  showPanel("chat");
  chatHistory.push({ role: "user", content: prompt });
  appendMsg("user", prompt);
  callGroq();
}

function getFormValues() {
  const req = ["fConsumerID", "fCategory", "fPrevReading", "fCurrReading", "fBilledUnits"];
  for (const id of req) {
    if (!document.getElementById(id).value.trim()) {
      alert(`Please fill in the required field: ${document.getElementById(id).previousElementSibling.textContent.replace(" *", "")}`);
      document.getElementById(id).focus();
      return null;
    }
  }
  return {
    consumerID: document.getElementById("fConsumerID").value.trim(),
    category: document.getElementById("fCategory").value,
    location: document.getElementById("fLocation").value.trim() || "Not specified",
    meterType: document.getElementById("fMeterType").value || "Not specified",
    billingMonth: document.getElementById("fBillingMonth").value || "Not specified",
    prevReading: document.getElementById("fPrevReading").value.trim(),
    currReading: document.getElementById("fCurrReading").value.trim(),
    billedUnits: document.getElementById("fBilledUnits").value.trim(),
    history: document.getElementById("fHistory").value.trim(),
    observation: document.getElementById("fObservation").value,
    notes: document.getElementById("fNotes").value.trim()
  };
}

function buildFormPrompt(v) {
  let p = `Please perform a complete electricity bill fraud analysis for the following consumer:\n\n`;
  p += `**Consumer ID:** ${v.consumerID}\n`;
  p += `**Consumer Category:** ${v.category}\n`;
  p += `**Location:** ${v.location}\n`;
  p += `**Meter Type:** ${v.meterType}\n`;
  p += `**Billing Month:** ${v.billingMonth}\n`;
  p += `**Previous Meter Reading:** ${v.prevReading} kWh\n`;
  p += `**Current Meter Reading:** ${v.currReading} kWh\n`;
  p += `**Billed Units:** ${v.billedUnits} kWh\n`;
  if (v.history) p += `**Historical Monthly Consumption (kWh):** ${v.history}\n`;
  p += `**Field Observation:** ${v.observation}\n`;
  if (v.notes) p += `**Additional Notes:** ${v.notes}\n`;
  p += `\nPlease analyse the above data and provide a detailed fraud risk report.`;
  return p;
}

function resetForm() {
  ["fConsumerID", "fCategory", "fLocation", "fMeterType", "fBillingMonth",
    "fPrevReading", "fCurrReading", "fBilledUnits", "fHistory", "fNotes"].forEach(id => {
      document.getElementById(id).value = "";
    });
  document.getElementById("fObservation").value = "Normal";
}

// ── History ────────────────────────────────────────
function renderHistory() {
  const list = document.getElementById("historyList");
  if (!analysisHistory.length) {
    list.innerHTML = `<p class="muted" style="margin-top:12px">No analyses yet this session. Use the Bill Analyser form to get started.</p>`;
    return;
  }
  list.innerHTML = analysisHistory.map((h, i) => `
    <div class="history-item" onclick="openHistory(${i})">
      <div class="history-item-header">
        <span class="history-item-id">🆔 ${h.id}</span>
        <span class="history-item-time">${h.time}</span>
      </div>
      <div class="history-item-meta">${h.category} · ${h.location}</div>
    </div>`).join("");
}

function openHistory(i) {
  const h = analysisHistory[i];
  document.getElementById("userInput").value = h.prompt;
  showPanel("chat");
}

// ── Utilities ──────────────────────────────────────
function clearChat() {
  chatHistory = [];
  renderWelcome();
}

function setStatus(state) {
  const el = document.getElementById("topbarStatus");
  const labels = { online: "Online", loading: "Analysing…", offline: "Offline" };
  const dotClass = { online: "online", loading: "loading", offline: "offline" };
  el.innerHTML = `<span class="dot ${dotClass[state]}"></span> ${labels[state]}`;
}

function setSendDisabled(v) {
  document.querySelector(".send-btn").disabled = v;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
