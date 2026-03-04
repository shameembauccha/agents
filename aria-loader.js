/**
 * Aria Widget Loader — Simpl'IT Consulting
 *
 * Paste into WordPress via:
 *   Appearance → Theme Editor → footer.php
 *   OR a plugin like "Insert Headers and Footers"
 *
 * <script src="https://shameembauccha.github.io/agents/aria-loader.js" defer></script>
 *
 * SECURITY NOTE:
 *   No API keys are stored here. All AI calls are routed through
 *   the WordPress proxy endpoint defined in PROXY_URL below.
 *   The Gemini key lives only in wp-config.php on the server.
 */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  // All AI requests go through your WordPress proxy — never direct to Gemini.
  const PROXY_URL          = 'https://simplitconsulting.com/wp-json/simplit/v1/aria';
  const EMAILJS_SERVICE    = 'service_rs59uuo';
  const EMAILJS_TEMPLATE   = 'template_el8vjzi';
  const EMAILJS_KEY        = 'htvC-XwdHLSAXmhnv';

  // ── PREVENT DOUBLE LOAD ─────────────────────────────────────
  if (document.getElementById('aria-widget')) return;

  // ── INJECT FONTS ────────────────────────────────────────────
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=DM+Sans"]')) {
    const fontLink = document.createElement('link');
    fontLink.rel  = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(fontLink);
  }

  // ── INJECT STYLES ───────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'aria-styles';
  style.textContent = `
    #aria-widget * { box-sizing: border-box; }

    #aria-widget {
      position: fixed;
      bottom: 90px;
      right: 24px;
      z-index: 999999;
      font-family: 'DM Sans', sans-serif;
    }

    .aria-bubble {
      width: 60px; height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 100%);
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(26,58,92,0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      animation: ariaBubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes ariaBubblePop {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    .aria-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(26,58,92,0.45), 0 0 0 8px rgba(26,58,92,0.08);
    }
    .aria-bubble svg { width: 26px; height: 26px; fill: white; }
    .aria-bubble .aria-icon-close { display: none; }
    .aria-bubble.open .aria-icon-chat  { display: none; }
    .aria-bubble.open .aria-icon-close { display: block; }

    .aria-notif-dot {
      position: absolute; top: 2px; right: 2px;
      width: 14px; height: 14px;
      background: #c8973a; border-radius: 50%;
      border: 2px solid white;
      animation: ariaNotifPop 0.3s cubic-bezier(0.34,1.56,0.64,1) 8s both;
    }
    @keyframes ariaNotifPop {
      from { transform: scale(0); }
      to   { transform: scale(1); }
    }
    .aria-notif-dot.aria-hidden { display: none; }

    .aria-panel {
      position: absolute; bottom: 72px; right: 0;
      width: 380px; height: 560px;
      background: white; border-radius: 16px;
      box-shadow: 0 16px 56px rgba(15,15,15,0.18), 0 4px 16px rgba(15,15,15,0.08);
      display: flex; flex-direction: column; overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0.85) translateY(16px);
      opacity: 0; pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), opacity 0.2s ease;
    }
    .aria-panel.open {
      transform: scale(1) translateY(0);
      opacity: 1; pointer-events: all;
    }
    @media (max-width: 440px) {
      .aria-panel {
        width: calc(100vw - 32px);
        height: calc(100vh - 110px);
      }
    }

    .aria-header {
      background: linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 100%);
      padding: 16px 18px;
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .aria-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(200,151,58,0.2);
      border: 2px solid rgba(200,151,58,0.4);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 1rem; font-weight: 700; color: #e8b85a; flex-shrink: 0;
    }
    .aria-header-info { flex: 1; }
    .aria-agent-name {
      font-family: 'Playfair Display', serif;
      font-size: 0.95rem; font-weight: 600; color: white; line-height: 1.2;
    }
    .aria-agent-status {
      font-size: 0.7rem; color: rgba(255,255,255,0.6);
      display: flex; align-items: center; gap: 5px; margin-top: 2px;
    }
    .aria-agent-status::before {
      content: ''; width: 6px; height: 6px;
      border-radius: 50%; background: #4ade80; flex-shrink: 0;
    }
    .aria-header-btns { display: flex; gap: 8px; }
    .aria-hdr-btn {
      background: rgba(255,255,255,0.1); border: none;
      border-radius: 6px; width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: rgba(255,255,255,0.7); font-size: 0.85rem;
      transition: background 0.15s; font-family: 'DM Sans', sans-serif;
    }
    .aria-hdr-btn:hover { background: rgba(255,255,255,0.2); color: white; }

    .aria-messages {
      flex: 1; overflow-y: auto;
      padding: 16px; display: flex;
      flex-direction: column; gap: 12px;
      scroll-behavior: smooth;
    }
    .aria-messages::-webkit-scrollbar { width: 4px; }
    .aria-messages::-webkit-scrollbar-thumb { background: #d8d3c8; border-radius: 2px; }

    .aria-msg {
      display: flex; gap: 8px; align-items: flex-end;
      animation: ariaMsgIn 0.25s cubic-bezier(0.34,1.2,0.64,1);
    }
    @keyframes ariaMsgIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .aria-msg.aria-user { flex-direction: row-reverse; }

    .aria-msg-av {
      width: 28px; height: 28px; border-radius: 50%;
      background: #f0ede4; border: 1px solid #d8d3c8;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 600; color: #6b6457; flex-shrink: 0;
    }
    .aria-msg-av.aria-av-aria {
      background: linear-gradient(135deg, #1a3a5c, #2d5f8a);
      color: #e8b85a; font-family: 'Playfair Display', serif; border: none;
    }

    .aria-bubble-msg {
      max-width: 78%; padding: 10px 13px;
      border-radius: 14px; font-size: 0.84rem;
      line-height: 1.55; color: #0f0f0f;
    }
    .aria-msg.aria-bot .aria-bubble-msg {
      background: #f0ede4; border-bottom-left-radius: 4px;
    }
    .aria-msg.aria-user .aria-bubble-msg {
      background: #1a3a5c; color: white; border-bottom-right-radius: 4px;
    }
    .aria-bubble-msg p { margin: 0 0 6px; }
    .aria-bubble-msg p:last-child { margin-bottom: 0; }
    .aria-bubble-msg strong { color: #1a3a5c; font-weight: 600; }
    .aria-msg.aria-user .aria-bubble-msg strong { color: #e8b85a; }
    .aria-bubble-msg ul { padding-left: 16px; margin: 6px 0; }
    .aria-bubble-msg li { margin-bottom: 3px; }

    .aria-typing {
      display: flex; gap: 4px; align-items: center; padding: 12px 14px;
    }
    .aria-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #6b6457;
      animation: ariaTyping 1.2s ease-in-out infinite;
    }
    .aria-typing span:nth-child(2) { animation-delay: 0.2s; }
    .aria-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ariaTyping {
      0%,60%,100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .aria-quick-replies {
      display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;
    }
    .aria-qr {
      background: white; border: 1.5px solid #d8d3c8;
      border-radius: 20px; padding: 5px 12px;
      font-size: 0.76rem; color: #1a3a5c;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      font-weight: 500; transition: all 0.15s; white-space: nowrap;
    }
    .aria-qr:hover { background: #1a3a5c; color: white; border-color: #1a3a5c; }

    .aria-lead-card {
      background: linear-gradient(135deg, #1a3a5c, #2d5f8a);
      border-radius: 12px; padding: 14px 16px; margin-top: 4px; color: white;
    }
    .aria-lead-card h4 {
      font-family: 'Playfair Display', serif;
      font-size: 0.9rem; margin: 0 0 6px; font-weight: 600;
    }
    .aria-lead-card p {
      font-size: 0.76rem; opacity: 0.75; margin: 0 0 12px; line-height: 1.5;
    }
    .aria-lead-card input {
      width: 100%; padding: 8px 10px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1); color: white;
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
      margin-bottom: 8px; outline: none;
    }
    .aria-lead-card input::placeholder { color: rgba(255,255,255,0.4); }
    .aria-lead-card input:focus { border-color: #e8b85a; }
    .aria-lead-btns { display: flex; gap: 8px; margin-top: 4px; }
    .aria-lead-submit {
      flex: 1; background: #c8973a; color: white; border: none;
      border-radius: 6px; padding: 8px;
      font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
      font-weight: 600; cursor: pointer; transition: background 0.15s;
    }
    .aria-lead-submit:hover { background: #e8b85a; }
    .aria-lead-skip {
      background: transparent; color: rgba(255,255,255,0.5);
      border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;
      padding: 8px 12px; font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem; cursor: pointer;
    }

    .aria-input-row {
      padding: 12px 14px; border-top: 1px solid #f0ede4;
      display: flex; gap: 8px; align-items: flex-end;
      flex-shrink: 0; background: white;
    }
    .aria-input {
      flex: 1; border: 1.5px solid #d8d3c8; border-radius: 20px;
      padding: 9px 14px; font-family: 'DM Sans', sans-serif;
      font-size: 0.84rem; outline: none; resize: none;
      max-height: 100px; line-height: 1.4;
      transition: border-color 0.15s; background: #f8f6f1;
    }
    .aria-input:focus { border-color: #1a3a5c; background: white; }
    .aria-input::placeholder { color: #b0a898; }
    .aria-send-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: #1a3a5c; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; flex-shrink: 0;
    }
    .aria-send-btn:hover { background: #2d5f8a; transform: scale(1.05); }
    .aria-send-btn:disabled { background: #d8d3c8; cursor: not-allowed; transform: none; }
    .aria-send-btn svg { width: 16px; height: 16px; fill: white; }

    .aria-footer-tag {
      padding: 6px 14px 8px; text-align: center;
      font-size: 0.62rem; color: #b0a898;
      font-family: 'DM Mono', monospace; letter-spacing: 0.06em;
      border-top: 1px solid #f0ede4; flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);

  // ── INJECT HTML ─────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'aria-widget';
  widget.innerHTML = `
    <button class="aria-bubble" id="ariaBubble" aria-label="Chat with Aria">
      <div class="aria-notif-dot aria-hidden" id="ariaNotifDot"></div>
      <svg class="aria-icon-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      <svg class="aria-icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
    <div class="aria-panel" id="ariaPanel">
      <div class="aria-header">
        <div class="aria-avatar">A</div>
        <div class="aria-header-info">
          <div class="aria-agent-name">Aria</div>
          <div class="aria-agent-status">Simpl'IT Oracle Specialist · Online</div>
        </div>
        <div class="aria-header-btns">
          <button class="aria-hdr-btn" id="ariaClearBtn" title="New conversation">↺</button>
          <button class="aria-hdr-btn" id="ariaCloseBtn" title="Close">✕</button>
        </div>
      </div>
      <div class="aria-messages" id="ariaMessages"></div>
      <div class="aria-input-row">
        <textarea class="aria-input" id="ariaInput" placeholder="Ask me anything about Oracle…" rows="1"></textarea>
        <button class="aria-send-btn" id="ariaSendBtn" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="aria-footer-tag">Simpl'IT Consulting · Oracle, Simplified.</div>
    </div>
  `;
  document.body.appendChild(widget);

  // ── LOAD EMAILJS ────────────────────────────────────────────
  const ejsScript = document.createElement('script');
  ejsScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  ejsScript.onload = () => emailjs.init(EMAILJS_KEY);
  document.head.appendChild(ejsScript);

  // ── STATE ───────────────────────────────────────────────────
  let isOpen        = false;
  let isTyping      = false;
  let messageCount  = 0;
  let nudgeShown    = false;
  let leadCaptured  = false;
  let history       = [];

  const SYSTEM_PROMPT = `You are Aria, Simpl'IT Consulting's Oracle specialist assistant, embedded on the Simpl'IT Consulting website.

ABOUT SIMPL'IT CONSULTING:
- Specialist Oracle consulting firm headquartered in Port Louis, Mauritius
- Global reach: Africa, Middle East, Europe, Asia-Pacific
- Tagline: "Oracle, Simplified. Results, Delivered."
- Founded by certified Oracle experts with deep hands-on implementation experience
- Young, agile firm — clients get direct access to senior practitioners, not junior teams
- Contact: contact@simplitconsulting.com | +230 57984505 | 23 James Anderson Forrester Street, Port Louis

SERVICES (full scope):
1. Oracle Fusion Cloud & EBS Implementation — end-to-end across all modules
2. EBS to Fusion Cloud Migration — structured migration with data, process, and cutover management
3. Upgrade & Transformation — version upgrades and business process transformation
4. Post Go-Live Optimisation — fixing underperforming implementations, quick wins
5. Health Check — independent review of Oracle landscape, configuration, controls
6. Advisory — Oracle strategy, roadmap, architecture decisions
7. Assistance à la Maîtrise d'Ouvrage (AMO) — owner's representative, protecting client interests during projects
8. Training — custom training and Oracle-certified courses for Fusion and EBS
9. Development — custom RICE objects, integrations, extensions, OIC
10. RFP & Vendor Selection — drafting RFPs, evaluating vendors, selecting implementation partners
11. Project Management — full programme management for Oracle projects
12. KPI Achievement & Optimisation — helping clients reach their target KPIs post-implementation

ORACLE DOMAINS COVERED:
- Finance: GL, AP, AR, Fixed Assets, Cash Management, Expense Management
- Supply Chain: Procurement, Inventory, Order Management, Shipping
- Manufacturing: Work in Process, Bills of Material, Planning
- HCM: Core HR, Payroll, Talent Management, Absence Management
- Projects: Project Costing, Project Billing, Project Management
- Analytics: OTBI, FRS, Oracle Analytics Cloud (OAC)
- Integration: Oracle Integration Cloud (OIC), FBDI, REST/SOAP APIs
- Both Oracle Fusion Cloud and Oracle EBS (R12 and earlier)

ORACLE EXPERTISE — KEY TOPICS YOU CAN DISCUSS:
- GL Architecture: Chart of Accounts design, Balancing Segments, Ledger Sets, Secondary Ledgers, Reporting Currencies, SLA rules
- Period close process and optimisation
- Data migration strategies (FBDI, ADFdi, REST APIs)
- EBS to Fusion differences and migration considerations
- Oracle Cloud quarterly update management
- Subledger Accounting (SLA) configuration
- Intercompany and consolidation
- Implementation methodology: waterfall vs agile, phased vs big bang
- Testing strategy: SIT, UAT, regression
- Change management and user adoption
- Project governance, RAID logs, steering committees

PROJECT MANAGEMENT & TIMELINES (indicative):
- New implementation small org: 4-8 months
- New implementation mid-size: 8-14 months
- EBS to Fusion migration: 6-18 months depending on complexity
- Health check: 2-5 weeks
- Post go-live optimisation: 4-12 weeks
- Training programme: 1-6 weeks

INVESTMENT RANGES (USD, indicative):
- Health check: $8K-$80K depending on size
- Post go-live optimisation: $15K-$250K
- New implementation: $80K-$5M+ depending on scope and size
- Migration: $60K-$4M+
- Training: $5K-$250K
- Advisory: $8K-$250K

YOUR PERSONA AND BEHAVIOUR:
- You are warm, confident, and expert — like a trusted senior Oracle consultant
- You speak plainly — no jargon unless the person is clearly technical
- You adapt language: business tone for executives, technical depth for consultants
- You are honest — if something is complex or uncertain, you say so
- You never oversell — you help the person understand their options
- You ask clarifying questions when needed — one at a time
- Keep responses focused and conversational — no walls of text
- Use short paragraphs. Bullet points only when listing multiple items.
- Never make up specific project references
- If asked something outside your knowledge, say so and offer to connect them with the team`;

  const QUICK_REPLIES_INITIAL = [
    "What does Simpl'IT do?",
    "Oracle EBS vs Fusion Cloud",
    "How long does an implementation take?",
    "What is AMO?"
  ];

  // ── TOGGLE ──────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    document.getElementById('ariaPanel').classList.toggle('open', isOpen);
    document.getElementById('ariaBubble').classList.toggle('open', isOpen);
    document.getElementById('ariaNotifDot').classList.add('aria-hidden');
    if (isOpen) {
      if (messageCount === 0) showWelcome();
      setTimeout(() => document.getElementById('ariaInput').focus(), 300);
    }
  }

  function showWelcome() {
    addBot(
      `Hi, I'm **Aria** — Simpl'IT's Oracle specialist.\n\nI can help you understand Oracle Fusion and EBS, think through your project, explore our services, or answer any questions you have. What's on your mind?`,
      QUICK_REPLIES_INITIAL
    );
  }

  // ── SEND ────────────────────────────────────────────────────
  async function send(override) {
    const input = document.getElementById('ariaInput');
    const text  = (override || input.value).trim();
    if (!text || isTyping) return;
    if (!override) { input.value = ''; input.style.height = 'auto'; }

    addUser(text);
    messageCount++;
    setTyping(true);
    history.push({ role: 'user', parts: [{ text }] });

    // Build contents: system prompt as first user/model exchange, then real history
    const contents = [
      { role: 'user',  parts: [{ text: 'You are Aria. Here are your instructions:\n\n' + SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I am Aria, ready to help.' }] },
      ...history
    ];

    try {
      const res  = await fetch(PROXY_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contents })
      });
      const data  = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "I'm having a moment — please try again or reach out at contact@simplitconsulting.com.";

      addBot(reply);
      history.push({ role: 'model', parts: [{ text: reply }] });

      if (messageCount >= 3 && !nudgeShown && !leadCaptured) {
        nudgeShown = true;
        setTimeout(showNudge, 800);
      }
    } catch (e) {
      console.error('Aria error:', e);
      addBot("I'm having a moment — please try again or reach out to us at contact@simplitconsulting.com.");
    }

    setTyping(false);
  }

  // ── RENDER ──────────────────────────────────────────────────
  function addBot(text, qr) {
    const msgs = document.getElementById('ariaMessages');
    const msg  = document.createElement('div');
    msg.className = 'aria-msg aria-bot';

    const av = document.createElement('div');
    av.className = 'aria-msg-av aria-av-aria';
    av.textContent = 'A';

    const right = document.createElement('div');
    right.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-width:85%;';

    const bubble = document.createElement('div');
    bubble.className = 'aria-bubble-msg';
    bubble.innerHTML = fmt(text);
    right.appendChild(bubble);

    if (qr?.length) {
      const qrWrap = document.createElement('div');
      qrWrap.className = 'aria-quick-replies';
      qr.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'aria-qr';
        btn.textContent = q;
        btn.onclick = () => { qrWrap.remove(); send(q); };
        qrWrap.appendChild(btn);
      });
      right.appendChild(qrWrap);
    }

    msg.appendChild(av);
    msg.appendChild(right);
    msgs.appendChild(msg);
    scrollDown();
  }

  function addUser(text) {
    const msgs = document.getElementById('ariaMessages');
    const msg  = document.createElement('div');
    msg.className = 'aria-msg aria-user';

    const av = document.createElement('div');
    av.className = 'aria-msg-av';
    av.textContent = 'You';

    const bubble = document.createElement('div');
    bubble.className = 'aria-bubble-msg';
    bubble.textContent = text;

    msg.appendChild(av);
    msg.appendChild(bubble);
    msgs.appendChild(msg);
    scrollDown();
  }

  function setTyping(val) {
    isTyping = val;
    document.getElementById('ariaSendBtn').disabled = val;
    const existing = document.getElementById('ariaTypingMsg');
    if (val && !existing) {
      const msgs = document.getElementById('ariaMessages');
      const msg  = document.createElement('div');
      msg.className = 'aria-msg aria-bot';
      msg.id = 'ariaTypingMsg';
      const av = document.createElement('div');
      av.className = 'aria-msg-av aria-av-aria';
      av.textContent = 'A';
      const bubble = document.createElement('div');
      bubble.className = 'aria-bubble-msg';
      bubble.innerHTML = '<div class="aria-typing"><span></span><span></span><span></span></div>';
      msg.appendChild(av);
      msg.appendChild(bubble);
      msgs.appendChild(msg);
      scrollDown();
    } else if (!val && existing) {
      existing.remove();
    }
  }

  // ── NUDGE ───────────────────────────────────────────────────
  function showNudge() {
    const msgs = document.getElementById('ariaMessages');
    const wrap = document.createElement('div');
    wrap.className = 'aria-msg aria-bot';
    wrap.id = 'ariaLeadNudge';

    const av = document.createElement('div');
    av.className = 'aria-msg-av aria-av-aria';
    av.textContent = 'A';

    const card = document.createElement('div');
    card.className = 'aria-lead-card';
    card.innerHTML = `
      <h4>Talk to the team directly</h4>
      <p>It sounds like Simpl'IT could genuinely help. Want us to follow up with you?</p>
      <input type="text"  id="ariaLN" placeholder="Your name" />
      <input type="email" id="ariaLE" placeholder="Your email address" />
      <input type="text"  id="ariaLC" placeholder="Your company (optional)" />
      <div class="aria-lead-btns">
        <button class="aria-lead-submit" id="ariaLeadSubmit">Connect me with Simpl'IT →</button>
        <button class="aria-lead-skip"   id="ariaLeadSkip">Not now</button>
      </div>
    `;

    wrap.appendChild(av);
    wrap.appendChild(card);
    msgs.appendChild(wrap);
    scrollDown();

    document.getElementById('ariaLeadSubmit').onclick = submitLead;
    document.getElementById('ariaLeadSkip').onclick   = dismissNudge;
  }

  async function submitLead() {
    const name    = document.getElementById('ariaLN').value.trim();
    const email   = document.getElementById('ariaLE').value.trim();
    const company = document.getElementById('ariaLC').value.trim();
    if (!email) { alert('Please enter your email address.'); return; }

    leadCaptured = true;

    const summary = history
      .map(m => `${m.role === 'user' ? 'Visitor' : 'Aria'}: ${m.parts[0].text}`)
      .join('\n\n');

    const leadData = {
      id:        'ARIA_' + Date.now(),
      timestamp: new Date().toISOString(),
      source:    'Aria Chat Widget',
      contact:   { name, email, company, notes: 'Lead from Aria chat widget' },
      profile:   { persona: 'unknown', industry: 'unknown', situation: 'chat_inquiry', painPoints: [], domains: [], currentSystem: 'unknown', companySize: 'unknown' }
    };

    try {
      if (typeof emailjs !== 'undefined') {
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          lead_id:      leadData.id,
          lead_name:    name    || 'Not provided',
          lead_company: company || 'Not provided',
          lead_title:   'Aria Chat Inquiry',
          lead_email:   email,
          lead_phone:   '',
          lead_notes:   'Lead from Aria chat widget',
          profile_text: `Source: Aria Chat Widget\n\nConversation:\n\n${summary.substring(0, 1500)}`,
          lead_json:    JSON.stringify(leadData, null, 2),
          timestamp:    leadData.timestamp
        });
      }
    } catch (e) { console.error('Aria lead error:', e); }

    document.getElementById('ariaLeadNudge')?.remove();
    addBot(`Thank you${name ? ', ' + name.split(' ')[0] : ''}! Our team will be in touch within 24 hours. Feel free to keep asking me anything.`);
  }

  function dismissNudge() {
    document.getElementById('ariaLeadNudge')?.remove();
    addBot("No problem at all — I'm here whenever you need me. What else can I help you with?");
  }

  // ── CLEAR ───────────────────────────────────────────────────
  function clearChat() {
    history = []; messageCount = 0; nudgeShown = false; leadCaptured = false;
    document.getElementById('ariaMessages').innerHTML = '';
    showWelcome();
  }

  // ── UTILS ───────────────────────────────────────────────────
  function fmt(text) {
    return '<p>' + text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,   '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g,   '<br>') + '</p>';
  }

  function scrollDown() {
    const m = document.getElementById('ariaMessages');
    setTimeout(() => m.scrollTop = m.scrollHeight, 50);
  }

  // ── EVENT LISTENERS ─────────────────────────────────────────
  document.getElementById('ariaBubble').addEventListener('click', toggle);
  document.getElementById('ariaCloseBtn').addEventListener('click', toggle);
  document.getElementById('ariaClearBtn').addEventListener('click', clearChat);
  document.getElementById('ariaSendBtn').addEventListener('click', () => send());

  document.getElementById('ariaInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  document.getElementById('ariaInput').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // Show notif dot after 8s
  setTimeout(() => {
    document.getElementById('ariaNotifDot')?.classList.remove('aria-hidden');
  }, 8000);

})();
