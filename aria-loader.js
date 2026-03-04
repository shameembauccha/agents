/**
 * Aria Widget Loader - Simpl'IT Consulting
 * https://shameembauccha.github.io/agents/aria-loader.js
 */
(function () {
  'use strict';

  if (document.getElementById('aria-widget')) return;

  // ── CONFIG ──────────────────────────────────────────────────
  var PROXY_URL      = 'https://simplitconsulting.com/wp-json/simplit/v1/aria';
  var EMAILJS_SVC    = 'service_rs59uuo';
  var EMAILJS_TPL    = 'template_el8vjzi';
  var EMAILJS_KEY    = 'htvC-XwdHLSAXmhnv';

  // ── FONTS ───────────────────────────────────────────────────
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=DM"]')) {
    var fl = document.createElement('link');
    fl.rel  = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(fl);
  }

  // ── STYLES ──────────────────────────────────────────────────
  var style = document.createElement('style');
  style.id = 'aria-styles';
  style.textContent = [
    '#aria-widget * { box-sizing: border-box; }',
    '#aria-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999999; font-family: DM Sans, sans-serif; }',

    '.aria-bubble { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 100%); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(26,58,92,0.35); transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; animation: ariaBubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1); }',
    '@keyframes ariaBubblePop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
    '.aria-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(26,58,92,0.45); }',
    '.aria-bubble svg { width: 26px; height: 26px; fill: white; }',
    '.aria-bubble .aria-icon-close { display: none; }',
    '.aria-bubble.open .aria-icon-chat { display: none; }',
    '.aria-bubble.open .aria-icon-close { display: block; }',

    '.aria-notif-dot { position: absolute; top: 2px; right: 2px; width: 14px; height: 14px; background: #c8973a; border-radius: 50%; border: 2px solid white; }',
    '.aria-notif-dot.aria-hidden { display: none; }',

    '.aria-panel { position: fixed; bottom: 90px; right: 24px; width: 460px; height: 680px; max-height: calc(100vh - 110px); background: white; border-radius: 16px; box-shadow: 0 16px 56px rgba(15,15,15,0.18); display: flex; flex-direction: column; overflow: hidden; transform-origin: bottom right; transform: scale(0.85) translateY(16px); opacity: 0; pointer-events: none; transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), opacity 0.2s ease; z-index: 999998; }',
    '.aria-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }',
    '@media (max-width: 520px) { .aria-panel { width: calc(100vw - 16px); right: 8px; bottom: 80px; height: calc(100vh - 100px); max-height: none; } }',

    '.aria-header { background: linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 100%); padding: 12px 14px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; position: relative; }',
    '.aria-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(200,151,58,0.2); border: 2px solid rgba(200,151,58,0.4); display: flex; align-items: center; justify-content: center; font-family: Playfair Display, serif; font-size: 0.9rem; font-weight: 700; color: #e8b85a; flex-shrink: 0; }',
    '.aria-header-info { flex: 1; min-width: 0; }',
    '.aria-agent-name { font-family: Playfair Display, serif; font-size: 0.9rem; font-weight: 600; color: white; }',
    ".aria-agent-status { font-size: 0.65rem; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 4px; margin-top: 2px; }",
    '.aria-agent-status::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }',
    '.aria-header-btns { display: flex; gap: 5px; flex-shrink: 0; }',
    '.aria-hdr-btn { background: rgba(255,255,255,0.1); border: none; border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,0.8); font-size: 0.82rem; font-weight: 700; transition: background 0.15s; flex-shrink: 0; }',
    '.aria-hdr-btn:hover { background: rgba(255,255,255,0.2); color: white; }',

    '.aria-qr-menu { display: none; position: fixed; background: white; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); padding: 8px 0; z-index: 9999999; min-width: 260px; max-height: 360px; overflow-y: auto; }',

    '.aria-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }',
    '.aria-messages::-webkit-scrollbar { width: 4px; }',
    '.aria-messages::-webkit-scrollbar-thumb { background: #d8d3c8; border-radius: 2px; }',

    '.aria-msg { display: flex; gap: 8px; align-items: flex-end; animation: ariaMsgIn 0.25s ease; }',
    '@keyframes ariaMsgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',
    '.aria-msg.aria-user { flex-direction: row-reverse; }',
    '.aria-msg-av { width: 28px; height: 28px; border-radius: 50%; background: #f0ede4; border: 1px solid #d8d3c8; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; color: #6b6457; flex-shrink: 0; }',
    '.aria-msg-av.aria-av-aria { background: linear-gradient(135deg, #1a3a5c, #2d5f8a); color: #e8b85a; font-family: Playfair Display, serif; border: none; }',

    '.aria-bubble-msg { max-width: 78%; padding: 10px 13px; border-radius: 14px; font-size: 0.84rem; line-height: 1.55; color: #0f0f0f; }',
    '.aria-msg.aria-bot .aria-bubble-msg { background: #f0ede4; border-bottom-left-radius: 4px; }',
    '.aria-msg.aria-user .aria-bubble-msg { background: #1a3a5c; color: white; border-bottom-right-radius: 4px; }',
    '.aria-bubble-msg p { margin: 0 0 6px; } .aria-bubble-msg p:last-child { margin-bottom: 0; }',
    '.aria-bubble-msg strong { color: #1a3a5c; font-weight: 600; }',
    '.aria-msg.aria-user .aria-bubble-msg strong { color: #e8b85a; }',
    '.aria-bubble-msg ul { padding-left: 16px; margin: 6px 0; } .aria-bubble-msg li { margin-bottom: 3px; }',
    '.aria-bubble-msg a { color: #c8973a; text-decoration: underline; }',
    '.aria-bubble-msg a:hover { color: #1a3a5c; }',

    '.aria-typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; }',
    '.aria-typing span { width: 6px; height: 6px; border-radius: 50%; background: #6b6457; animation: ariaTyping 1.2s ease-in-out infinite; }',
    '.aria-typing span:nth-child(2) { animation-delay: 0.2s; } .aria-typing span:nth-child(3) { animation-delay: 0.4s; }',
    '@keyframes ariaTyping { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }',

    '.aria-quick-replies { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }',
    '.aria-qr { background: white; border: 1.5px solid #d8d3c8; border-radius: 20px; padding: 5px 12px; font-size: 0.76rem; color: #1a3a5c; cursor: pointer; font-family: DM Sans, sans-serif; font-weight: 500; transition: all 0.15s; white-space: nowrap; }',
    '.aria-qr:hover { background: #1a3a5c; color: white; border-color: #1a3a5c; }',

    '.aria-lead-card { background: linear-gradient(135deg, #1a3a5c, #2d5f8a); border-radius: 12px; padding: 14px 16px; margin-top: 4px; color: white; }',
    '.aria-lead-card h4 { font-family: Playfair Display, serif; font-size: 0.9rem; margin: 0 0 6px; font-weight: 600; }',
    '.aria-lead-card p { font-size: 0.76rem; opacity: 0.75; margin: 0 0 12px; line-height: 1.5; }',
    '.aria-lead-card input { width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; font-family: DM Sans, sans-serif; font-size: 0.82rem; margin-bottom: 8px; outline: none; }',
    '.aria-lead-card input::placeholder { color: rgba(255,255,255,0.5); }',
    '.aria-lead-card input:focus { border-color: #e8b85a; }',
    '.aria-lead-btns { display: flex; gap: 8px; margin-top: 4px; }',
    '.aria-lead-submit { flex: 1; background: #c8973a; color: white; border: none; border-radius: 6px; padding: 8px; font-family: DM Sans, sans-serif; font-size: 0.8rem; font-weight: 600; cursor: pointer; }',
    '.aria-lead-submit:hover { background: #e8b85a; }',
    '.aria-lead-skip { background: transparent; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 8px 12px; font-family: DM Sans, sans-serif; font-size: 0.78rem; cursor: pointer; }',

    '.aria-input-row { padding: 12px 14px; border-top: 1px solid #f0ede4; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; background: white; }',
    '.aria-input { flex: 1; border: 1.5px solid #d8d3c8; border-radius: 20px; padding: 9px 14px; font-family: DM Sans, sans-serif; font-size: 0.84rem; outline: none; resize: none; max-height: 100px; line-height: 1.4; color: #1a1a1a; background: #f8f6f1; transition: border-color 0.15s; }',
    '.aria-input:focus { border-color: #1a3a5c; background: white; color: #1a1a1a; }',
    '.aria-input::placeholder { color: #b0a898; }',
    '.aria-send-btn { width: 36px; height: 36px; border-radius: 50%; background: #1a3a5c; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }',
    '.aria-send-btn:hover { background: #2d5f8a; }',
    '.aria-send-btn:disabled { background: #d8d3c8; cursor: not-allowed; }',
    '.aria-send-btn svg { width: 16px; height: 16px; fill: white; }',

    '.aria-footer-tag { padding: 6px 14px 8px; text-align: center; font-size: 0.62rem; color: #b0a898; font-family: DM Mono, monospace; letter-spacing: 0.06em; border-top: 1px solid #f0ede4; flex-shrink: 0; }'
  ].join('\n');
  document.head.appendChild(style);

  // ── HTML ────────────────────────────────────────────────────
  var widget = document.createElement('div');
  widget.id = 'aria-widget';
  widget.innerHTML = '<button class="aria-bubble" id="ariaBubble" aria-label="Chat with Aria">'
    + '<div class="aria-notif-dot aria-hidden" id="ariaNotifDot"></div>'
    + '<svg class="aria-icon-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>'
    + '<svg class="aria-icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
    + '</button>'
    + '<div class="aria-panel" id="ariaPanel">'
    + '<div class="aria-header">'
    + '<div class="aria-avatar">A</div>'
    + '<div class="aria-header-info"><div class="aria-agent-name">Aria</div><div class="aria-agent-status">Simpl\'IT Oracle Specialist &middot; Online</div></div>'
    + '<div class="aria-header-btns">'
    + '<button class="aria-hdr-btn" id="ariaQrBtn" title="Suggested questions">?</button>'
    + '<button class="aria-hdr-btn" id="ariaTranscriptBtn" title="Email conversation">&#9993;</button>'
    + '<button class="aria-hdr-btn" id="ariaClearBtn" title="New conversation">&#8635;</button>'
    + '<button class="aria-hdr-btn" id="ariaCloseBtn" title="Close">&#10005;</button>'
    + '</div>'
    + '</div>'
    + '<div class="aria-messages" id="ariaMessages"></div>'
    + '<div class="aria-input-row">'
    + '<textarea class="aria-input" id="ariaInput" placeholder="Ask me anything about Oracle..." rows="1"></textarea>'
    + '<button class="aria-send-btn" id="ariaSendBtn"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>'
    + '</div>'
    + '<div class="aria-footer-tag">Simpl\'IT Consulting &middot; Oracle, Simplified.</div>'
    + '</div>'
    + '<div class="aria-qr-menu" id="ariaQrMenu"></div>';
  document.body.appendChild(widget);

  // ── EMAILJS ─────────────────────────────────────────────────
  var ejs = document.createElement('script');
  ejs.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  ejs.onload = function() { emailjs.init(EMAILJS_KEY); };
  document.head.appendChild(ejs);

  // ── STATE ───────────────────────────────────────────────────
  var isOpen        = false;
  var isTyping      = false;
  var messageCount  = 0;
  var nudgeShown    = false;
  var leadCaptured  = false;
  var emailSent     = false;
  var transcriptShown = false;
  var visitorName   = '';
  var visitorEmail  = '';
  var visitorCompany = '';
  var inactivityTimer = null;
  var history       = [];

  var SYSTEM_PROMPT = 'You are Aria, Simpl\'IT Consulting\'s Oracle specialist assistant.\n\n'
    + 'ABOUT SIMPL\'IT:\n'
    + '- Specialist Oracle consulting firm, Port Louis, Mauritius\n'
    + '- Global reach: Africa, Middle East, Europe, Asia-Pacific\n'
    + '- Tagline: Oracle, Simplified. Results, Delivered.\n'
    + '- Direct access to senior practitioners, no junior teams\n'
    + '- Contact: contact@simplitconsulting.com | +230 57984505\n\n'
    + 'SERVICES:\n'
    + '1. Oracle Fusion Cloud & EBS Implementation\n'
    + '2. EBS to Fusion Cloud Migration\n'
    + '3. Upgrade & Transformation\n'
    + '4. Post Go-Live Optimisation\n'
    + '5. Health Check\n'
    + '6. Advisory\n'
    + '7. AMO (Assistance a la Maitrise d\'Ouvrage)\n'
    + '8. Training\n'
    + '9. Development (RICE, OIC, integrations)\n'
    + '10. RFP & Vendor Selection\n'
    + '11. Project Management\n'
    + '12. KPI Achievement & Optimisation\n\n'
    + 'ORACLE DOMAINS: Finance (GL,AP,AR,FA,CM), SCM, Manufacturing, HCM, Projects, Analytics (OTBI,OAC), Integration (OIC,FBDI,REST)\n\n'
    + 'TIMELINES: Small impl 4-8mo, Mid impl 8-14mo, EBS-Fusion migration 6-18mo, Health check 2-5wk\n\n'
    + 'INVESTMENT (USD indicative): Health check $8K-$80K, Impl $80K-$5M+, Migration $60K-$4M+, Training $5K-$250K\n\n'
    + 'IDENTITY: Oracle-only specialists, agile boutique depth, honest no-oversell, proven full Oracle lifecycle\n\n'
    + 'AI & ORACLE: Oracle has embedded AI in Fusion Cloud - AI agents, generative summaries, anomaly detection. '
    + 'Simpl\'IT helps activate native Oracle AI. AI readiness requires clean data and solid implementation foundation.\n\n'
    + 'SITE PAGES: /services, /about, /references (filter by vertical/country/domain), /journey (primary conversion), /contact\n\n'
    + 'JOURNEY: After 2-3 exchanges guide visitors to https://simplitconsulting.com/journey - skip if visitor is technical or has urgent issue.\n\n'
    + 'BEHAVIOUR: Warm, expert, plain language. No jargon unless visitor is technical. Honest, no oversell. '
    + 'Short focused responses. Bullet points only when listing. Never invent project references.';

  var QR_DISCOVER = [
    'Let us help you find your way',
    'Who is Simpl\'IT?',
    'What does Simpl\'IT do?',
    'What makes Simpl\'IT different?'
  ];
  var QR_COMMON = [
    'Can you help with EBS to Cloud migration?',
    'Our go-live went wrong - can you help?',
    'How much does an implementation cost?',
    'How is AI changing Oracle?'
  ];

  // ── TOGGLE ──────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    document.getElementById('ariaPanel').classList.toggle('open', isOpen);
    document.getElementById('ariaBubble').classList.toggle('open', isOpen);
    document.getElementById('ariaNotifDot').classList.add('aria-hidden');
    if (isOpen) {
      if (messageCount === 0) showWelcome();
      setTimeout(function() {
        scrollDown();
        document.getElementById('ariaInput').focus();
      }, 300);
    }
  }

  function showWelcome() {
    addBot(
      'Hi, I\'m **Aria** - Simpl\'IT\'s Oracle specialist.\n\nWe\'re here to help you find your way through Oracle - whether you\'re exploring, mid-project, or looking to get more from an existing implementation.\n\nNot sure where to start? https://simplitconsulting.com/journey',
      QR_DISCOVER, QR_COMMON
    );
  }

  // ── SEND ────────────────────────────────────────────────────
  function send(override) {
    var input = document.getElementById('ariaInput');
    var text  = (override || input.value).trim();
    if (!text || isTyping) return;
    if (!override) { input.value = ''; input.style.height = 'auto'; }

    addUser(text);
    messageCount++;
    setTyping(true);
    history.push({ role: 'user', parts: [{ text: text }] });

    var contents = [
      { role: 'user',  parts: [{ text: 'You are Aria. Instructions:\n\n' + SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I am Aria, ready to help.' }] }
    ].concat(history);

    fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var reply = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text)
        || 'I\'m having a moment - please try again or reach out at contact@simplitconsulting.com.';
      addBot(reply);
      history.push({ role: 'model', parts: [{ text: reply }] });
      if (messageCount >= 3 && !nudgeShown && !leadCaptured) {
        nudgeShown = true;
        setTimeout(showNudge, 800);
      }
      setTyping(false);
      resetInactivity();
    })
    .catch(function() {
      addBot('I\'m having a moment - please try again or reach out at contact@simplitconsulting.com.');
      setTyping(false);
    });
  }

  // ── RENDER ──────────────────────────────────────────────────
  function addBot(text, qr, qr2) {
    var msgs = document.getElementById('ariaMessages');
    var msg  = document.createElement('div');
    msg.className = 'aria-msg aria-bot';

    var av = document.createElement('div');
    av.className = 'aria-msg-av aria-av-aria';
    av.textContent = 'A';

    var right = document.createElement('div');
    right.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-width:85%;';

    var bubble = document.createElement('div');
    bubble.className = 'aria-bubble-msg';
    bubble.innerHTML = fmt(text);
    right.appendChild(bubble);

    if (qr && qr.length) {
      var qrBlock = document.createElement('div');
      qrBlock.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin-top:4px;';

      function makeGroup(label, items) {
        var g   = document.createElement('div');
        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:0.65rem;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:#b0a898;margin-bottom:4px;';
        lbl.textContent = label;
        g.appendChild(lbl);
        var wrap = document.createElement('div');
        wrap.className = 'aria-quick-replies';
        for (var i = 0; i < items.length; i++) {
          (function(q) {
            var btn = document.createElement('button');
            btn.className = 'aria-qr';
            btn.textContent = q;
            btn.onclick = function() { qrBlock.remove(); send(q); };
            wrap.appendChild(btn);
          })(items[i]);
        }
        g.appendChild(wrap);
        qrBlock.appendChild(g);
      }

      makeGroup('Discover us', qr);
      if (qr2 && qr2.length) makeGroup('Common questions', qr2);
      right.appendChild(qrBlock);
    }

    msg.appendChild(av);
    msg.appendChild(right);
    msgs.appendChild(msg);
    scrollDown();
  }

  function addUser(text) {
    var msgs = document.getElementById('ariaMessages');
    var msg  = document.createElement('div');
    msg.className = 'aria-msg aria-user';
    var av = document.createElement('div');
    av.className = 'aria-msg-av';
    av.textContent = 'You';
    var bubble = document.createElement('div');
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
    var existing = document.getElementById('ariaTypingMsg');
    if (val && !existing) {
      var msgs = document.getElementById('ariaMessages');
      var msg  = document.createElement('div');
      msg.className = 'aria-msg aria-bot';
      msg.id = 'ariaTypingMsg';
      var av = document.createElement('div');
      av.className = 'aria-msg-av aria-av-aria';
      av.textContent = 'A';
      var bubble = document.createElement('div');
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
    var msgs = document.getElementById('ariaMessages');
    var wrap = document.createElement('div');
    wrap.className = 'aria-msg aria-bot';
    wrap.id = 'ariaLeadNudge';
    var av = document.createElement('div');
    av.className = 'aria-msg-av aria-av-aria';
    av.textContent = 'A';
    var card = document.createElement('div');
    card.className = 'aria-lead-card';
    card.innerHTML = '<h4>Talk to the team directly</h4>'
      + '<p>It sounds like Simpl\'IT could genuinely help. Want us to follow up?</p>'
      + '<input type="text" id="ariaLN" placeholder="Your name" />'
      + '<input type="email" id="ariaLE" placeholder="Your email address" />'
      + '<input type="text" id="ariaLC" placeholder="Your company (optional)" />'
      + '<div class="aria-lead-btns">'
      + '<button class="aria-lead-submit" id="ariaLeadSubmit">Connect me with Simpl\'IT</button>'
      + '<button class="aria-lead-skip" id="ariaLeadSkip">Not now</button>'
      + '</div>';
    wrap.appendChild(av);
    wrap.appendChild(card);
    msgs.appendChild(wrap);
    scrollDown();
    document.getElementById('ariaLeadSubmit').onclick = submitLead;
    document.getElementById('ariaLeadSkip').onclick   = dismissNudge;
  }

  function submitLead() {
    var name    = document.getElementById('ariaLN').value.trim();
    var email   = document.getElementById('ariaLE').value.trim();
    var company = document.getElementById('ariaLC').value.trim();
    if (!email) { alert('Please enter your email address.'); return; }
    leadCaptured   = true;
    visitorName    = name;
    visitorEmail   = email;
    visitorCompany = company;
    var el = document.getElementById('ariaLeadNudge');
    if (el) el.remove();
    var g = name ? ', ' + name.split(' ')[0] : '';
    addBot('Thank you' + g + '! Our team will be in touch within 24 hours.');
    sendEmail(email, name, company);
  }

  function dismissNudge() {
    var el = document.getElementById('ariaLeadNudge');
    if (el) el.remove();
    addBot('No problem - I\'m here whenever you need me.');
  }

  // ── EMAIL ───────────────────────────────────────────────────
  function sendEmail(toEmail, toName, toCompany) {
    if (emailSent) return;
    emailSent = true;

    var conv = '';
    for (var i = 0; i < history.length; i++) {
      conv += (history[i].role === 'user' ? 'Visitor' : 'Aria') + ': ' + history[i].parts[0].text + '\n\n';
    }

    var ts  = new Date().toISOString();
    var tid = 'ARIA_' + Date.now();
    var nm  = toName    || 'Visitor';
    var co  = toCompany || '';

    // Ask Gemini for structured summary then send emails
    fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{
        role: 'user',
        parts: [{ text: 'Summarise this Oracle consulting chat professionally with sections: 1.Visitor Profile 2.Key Topics 3.Pain Points 4.Services of Interest 5.Next Steps. Address visitor directly.\n\nCHAT:\n' + conv.substring(0, 3000) }]
      }]})
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var summary = (d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0].text) || conv;
      dispatchEmails(tid, ts, toEmail, nm, co, summary);
    })
    .catch(function() { dispatchEmails(tid, ts, toEmail, nm, co, conv); });
  }

  function dispatchEmails(tid, ts, toEmail, nm, co, summary) {
    if (typeof emailjs === 'undefined') return;
    var note = 'Visitor: ' + toEmail + (co ? ' | ' + co : '');
    var base = {
      lead_id:      tid,
      lead_name:    nm,
      lead_company: co,
      lead_phone:   '+230 57984505',
      lead_notes:   note,
      profile_text: summary,
      lead_json:    JSON.stringify({ id: tid, visitor: toEmail, ts: ts }),
      timestamp:    ts
    };
    // 1. To visitor - from Simpl'IT
    emailjs.send(EMAILJS_SVC, EMAILJS_TPL, Object.assign({}, base, {
      lead_title: 'Your Oracle Consultation Summary - Simpl\'IT',
      lead_email: toEmail
    }));
    // 2. contact@simplitconsulting.com
    emailjs.send(EMAILJS_SVC, EMAILJS_TPL, Object.assign({}, base, {
      lead_title: 'Aria Lead - ' + toEmail,
      lead_email: 'contact@simplitconsulting.com'
    }));
    // 3. shameembauccha@simplitconsulting.com
    emailjs.send(EMAILJS_SVC, EMAILJS_TPL, Object.assign({}, base, {
      lead_title: 'Aria Lead - ' + toEmail,
      lead_email: 'shameembauccha@simplitconsulting.com'
    }));
  }

  // ── TRANSCRIPT PROMPT ────────────────────────────────────────
  function showTranscriptPrompt() {
    if (transcriptShown || emailSent) return;
    transcriptShown = true;
    var msgs = document.getElementById('ariaMessages');
    var wrap = document.createElement('div');
    wrap.className = 'aria-msg aria-bot';
    wrap.id = 'ariaTranscriptCard';
    var av = document.createElement('div');
    av.className = 'aria-msg-av aria-av-aria';
    av.textContent = 'A';
    var card = document.createElement('div');
    card.className = 'aria-lead-card';
    card.innerHTML = '<h4>Get a summary of this conversation</h4>'
      + '<p>I can email you a structured summary of what we discussed.</p>'
      + '<input type="email" id="ariaTEmail" placeholder="Your email address" />'
      + '<div class="aria-lead-btns">'
      + '<button class="aria-lead-submit" id="ariaTSubmit">Send me the summary</button>'
      + '<button class="aria-lead-skip" id="ariaTSkip">No thanks</button>'
      + '</div>';
    wrap.appendChild(av);
    wrap.appendChild(card);
    msgs.appendChild(wrap);
    scrollDown();
    document.getElementById('ariaTSubmit').onclick = function() {
      var em = document.getElementById('ariaTEmail').value.trim();
      if (!em) { alert('Please enter your email.'); return; }
      wrap.remove();
      sendEmail(em, visitorName, visitorCompany);
      addBot('Done! Your summary is on its way to ' + em + '.');
    };
    document.getElementById('ariaTSkip').onclick = function() {
      wrap.remove();
      addBot('No problem - reach us at contact@simplitconsulting.com.');
    };
  }

  function resetInactivity() {
    clearTimeout(inactivityTimer);
    if (messageCount >= 2 && !emailSent) {
      inactivityTimer = setTimeout(function() {
        if (messageCount >= 2 && !emailSent) showTranscriptPrompt();
      }, 10 * 60 * 1000);
    }
  }

  // ── CLEAR ───────────────────────────────────────────────────
  function clearChat() {
    history = []; messageCount = 0; nudgeShown = false; leadCaptured = false;
    emailSent = false; transcriptShown = false; visitorName = ''; visitorEmail = ''; visitorCompany = '';
    clearTimeout(inactivityTimer);
    document.getElementById('ariaMessages').innerHTML = '';
    showWelcome();
  }

  // ── FORMAT ──────────────────────────────────────────────────
  function fmt(text) {
    return '<p>' + text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/https?:\/\/[^\s<>"]+/g, function(u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; })
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>') + '</p>';
  }

  function scrollDown() {
    var m = document.getElementById('ariaMessages');
    setTimeout(function() { m.scrollTop = m.scrollHeight; }, 50);
  }

  // ── EVENTS ──
  setTimeout(function() {
    document.getElementById('ariaBubble').addEventListener('click', toggle);
    document.getElementById('ariaCloseBtn').addEventListener('click', toggle);
    document.getElementById('ariaClearBtn').addEventListener('click', clearChat);
    document.getElementById('ariaSendBtn').addEventListener('click', function() { send(); });
  
    document.getElementById('ariaInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    document.getElementById('ariaInput').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  
    // ? button - question menu
    document.getElementById('ariaQrBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      var menu = document.getElementById('ariaQrMenu');
      if (menu.style.display === 'block') { menu.style.display = 'none'; return; }
      menu.innerHTML = '';
  
      function addSection(label, items) {
        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:0.62rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#b0a898;padding:6px 14px 3px;';
        lbl.textContent = label;
        menu.appendChild(lbl);
        for (var i = 0; i < items.length; i++) {
          (function(q) {
            var btn = document.createElement('button');
            btn.style.cssText = 'display:block;width:100%;text-align:left;background:none;border:none;padding:8px 14px;font-size:0.82rem;color:#1a3a5c;cursor:pointer;line-height:1.4;';
            btn.textContent = q;
            btn.onmouseover = function() { this.style.background = '#f0ede4'; };
            btn.onmouseout  = function() { this.style.background = 'none'; };
            btn.onclick = function(ev) { ev.stopPropagation(); menu.style.display = 'none'; send(q); };
            menu.appendChild(btn);
          })(items[i]);
        }
      }
  
      addSection('Discover us', QR_DISCOVER);
      addSection('Common questions', QR_COMMON);
  
      // Position menu above the ? button
      var btn = document.getElementById('ariaQrBtn');
      var rect = btn.getBoundingClientRect();
      menu.style.right = (window.innerWidth - rect.right) + 'px';
      menu.style.top   = (rect.top - 8) + 'px';
      menu.style.transform = 'translateY(-100%)';
      menu.style.display = 'block';
    });
  
    // Transcript button
    document.getElementById('ariaTranscriptBtn').addEventListener('click', function() {
      if (messageCount < 1) {
        addBot('We haven\'t chatted yet - ask me anything first!');
      } else if (emailSent) {
        addBot('Already sent! Is there anything else I can help with?');
      } else {
        showTranscriptPrompt();
      }
    });
  
    document.addEventListener('click', function() {
      var m = document.getElementById('ariaQrMenu');
      if (m) m.style.display = 'none';
    });
  
    setTimeout(function() {
      var dot = document.getElementById('ariaNotifDot');
      if (dot) dot.classList.remove('aria-hidden');
    }, 8000);
  
  }, 0);
})();
