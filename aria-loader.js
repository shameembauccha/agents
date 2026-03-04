/**
 * Aria Widget Loader — Simpl'IT Consulting
 * Paste this into WordPress via Appearance → Theme Editor → footer.php
 * or via a plugin like "Insert Headers and Footers"
 *
 * <script src="https://shameembauccha.github.io/agents/aria-loader.js" defer></script>
 */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  const PROXY_URL       = 'https://simplitconsulting.com/wp-json/simplit/v1/aria';
  const EMAILJS_SERVICE   = 'service_rs59uuo';
  const EMAILJS_TEMPLATE  = 'template_el8vjzi';
  const EMAILJS_KEY       = 'htvC-XwdHLSAXmhnv';

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
      position: fixed; bottom: 90px; right: 24px;
      width: 460px;
      height: min(680px, calc(100vh - 110px));
      background: white; border-radius: 16px;
      box-shadow: 0 16px 56px rgba(15,15,15,0.18), 0 4px 16px rgba(15,15,15,0.08);
      display: flex; flex-direction: column; overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0.85) translateY(16px);
      opacity: 0; pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), opacity 0.2s ease;
      z-index: 999998;
    }
    .aria-panel.open {
      transform: scale(1) translateY(0);
      opacity: 1; pointer-events: all;
    }
    @media (max-width: 480px) {
      .aria-panel {
        width: calc(100vw - 16px);
        height: calc(100dvh - 90px);
        right: 8px;
        bottom: 76px;
      }
    }

    .aria-header {
      background: linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 100%);
      padding: 12px 14px;
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    .aria-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(200,151,58,0.2);
      border: 2px solid rgba(200,151,58,0.4);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 0.9rem; font-weight: 700; color: #e8b85a; flex-shrink: 0;
    }
    .aria-header-info { flex: 1; min-width: 0; }
    .aria-agent-name {
      font-family: 'Playfair Display', serif;
      font-size: 0.9rem; font-weight: 600; color: white; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .aria-agent-status {
      font-size: 0.65rem; color: rgba(255,255,255,0.6);
      display: flex; align-items: center; gap: 4px; margin-top: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .aria-agent-status::before {
      content: ''; width: 5px; height: 5px;
      border-radius: 50%; background: #4ade80; flex-shrink: 0;
    }
    .aria-header-btns { display: flex; gap: 5px; flex-shrink: 0; }
    .aria-hdr-btn {
      background: rgba(255,255,255,0.1); border: none;
      border-radius: 6px; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: rgba(255,255,255,0.7); font-size: 0.8rem;
      transition: background 0.15s; font-family: 'DM Sans', sans-serif;
      flex-shrink: 0;
    }
    .aria-hdr-btn:hover { background: rgba(255,255,255,0.2); color: white; }

    .aria-qr-dropdown-wrap { position: relative; }
    .aria-qr-dropdown {
      display: none; position: absolute; bottom: 38px; right: 0;
      background: white; border-radius: 10px; min-width: 250px;
      box-shadow: 0 8px 32px rgba(15,15,15,0.15); padding: 8px 0;
      z-index: 99999; max-height: 340px; overflow-y: auto;
    }
    .aria-qr-dropdown.open { display: block; }
    .aria-qr-drop-label {
      font-size: 0.62rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: #b0a898;
      font-family: 'DM Mono', monospace;
      padding: 6px 14px 4px;
    }
    .aria-qr-drop-item {
      display: block; width: 100%; text-align: left;
      background: none; border: none; padding: 7px 14px;
      font-size: 0.8rem; color: #1a3a5c; cursor: pointer;
      font-family: 'DM Sans', sans-serif; line-height: 1.4;
      transition: background 0.12s;
    }
    .aria-qr-drop-item:hover { background: #f0ede4; }

    .aria-transcript-card {
      background: linear-gradient(135deg, #1a3a5c, #2d5f8a);
      border-radius: 12px; padding: 14px 16px; margin-top: 4px; color: white;
    }
    .aria-transcript-card h4 {
      font-family: 'Playfair Display', serif;
      font-size: 0.9rem; margin: 0 0 6px; font-weight: 600;
    }
    .aria-transcript-card p {
      font-size: 0.76rem; opacity: 0.75; margin: 0 0 10px; line-height: 1.5;
    }
    .aria-transcript-card input {
      width: 100%; padding: 8px 10px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1); color: white;
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
      margin-bottom: 8px; outline: none;
    }
    .aria-transcript-card input::placeholder { color: rgba(255,255,255,0.4); }
    .aria-transcript-card input:focus { border-color: #e8b85a; }
    .aria-transcript-btns { display: flex; gap: 8px; margin-top: 4px; }
    .aria-transcript-submit {
      flex: 1; background: #c8973a; color: white; border: none;
      border-radius: 6px; padding: 8px;
      font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
      font-weight: 600; cursor: pointer; transition: background 0.15s;
    }
    .aria-transcript-submit:hover { background: #e8b85a; }
    .aria-transcript-skip {
      background: transparent; color: rgba(255,255,255,0.5);
      border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;
      padding: 8px 12px; font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem; cursor: pointer;
    }

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
    .aria-bubble-msg p { margin-bottom: 6px; }
    .aria-bubble-msg p:last-child { margin-bottom: 0; }
    .aria-bubble-msg strong { color: #1a3a5c; font-weight: 600; }
    .aria-msg.aria-user .aria-bubble-msg strong { color: #e8b85a; }
    .aria-bubble-msg ul { padding-left: 16px; margin: 6px 0; }
    .aria-bubble-msg li { margin-bottom: 3px; }
    .aria-bubble-msg a { color: #c8973a; text-decoration: underline; text-underline-offset: 2px; }
    .aria-bubble-msg a:hover { color: #1a3a5c; }

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

    .aria-qr-block { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .aria-qr-group { display: flex; flex-direction: column; gap: 6px; }
    .aria-qr-label {
      font-size: 0.65rem; font-weight: 600; letter-spacing: 0.07em;
      text-transform: uppercase; color: #b0a898;
      font-family: 'DM Mono', monospace;
    }

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
      max-height: 100px; line-height: 1.4; color: #1a1a1a;
      transition: border-color 0.15s; background: #f8f6f1;
      -webkit-text-fill-color: #1a1a1a;
    }
    .aria-input:focus { border-color: #1a3a5c; background: white; color: #1a1a1a; -webkit-text-fill-color: #1a1a1a; }
    .aria-input::placeholder { color: #b0a898; -webkit-text-fill-color: #b0a898; }
    .aria-send-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: #1a3a5c; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; flex-shrink: 0;
    }
    .aria-send-btn:hover { background: #2d5f8a; transform: scale(1.05); }
    .aria-send-btn:disabled { background: #d8d3c8; cursor: not-allowed; transform: none; }
    .aria-send-btn svg { width: 16px; height: 16px; fill: white; }

    .aria-icon-action {
      width: 32px; height: 32px; border-radius: 8px;
      background: #f0ede4; border: 1.5px solid #d8d3c8;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; transition: all 0.15s;
      padding: 0;
    }
    .aria-icon-action:hover { background: #e8e3d8; border-color: #1a3a5c; }
    .aria-icon-action svg { width: 16px; height: 16px; fill: #6b6457; }
    .aria-icon-action.recording {
      background: #fee2e2; border-color: #ef4444;
      animation: ariaPulse 1s ease-in-out infinite;
    }
    .aria-icon-action.recording svg { fill: #ef4444; }
    @keyframes ariaPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
      50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
    }
    .aria-icon-action.has-file { background: #e8f5e9; border-color: #4ade80; }
    .aria-icon-action.has-file svg { fill: #16a34a; }

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
          <div class="aria-qr-dropdown-wrap" id="ariaQrWrap">
            <button class="aria-hdr-btn" id="ariaQrToggle" title="Suggested questions">?</button>
            <div class="aria-qr-dropdown" id="ariaQrDropdown">
              <div class="aria-qr-drop-label">Discover us</div>
              <button class="aria-qr-drop-item">Let us help you find your way →</button>
              <button class="aria-qr-drop-item">Who is Simpl'IT?</button>
              <button class="aria-qr-drop-item">What does Simpl'IT do?</button>
              <button class="aria-qr-drop-item">What makes Simpl'IT different?</button>
              <div class="aria-qr-drop-label" style="margin-top:8px;">Common questions</div>
              <button class="aria-qr-drop-item">Can you help with EBS to Cloud migration?</button>
              <button class="aria-qr-drop-item">Our go-live went wrong — can you help?</button>
              <button class="aria-qr-drop-item">How much does an implementation cost?</button>
              <button class="aria-qr-drop-item">How is AI changing Oracle?</button>
            </div>
          </div>
          <button class="aria-hdr-btn" id="ariaTranscriptBtn" title="Email me this conversation">✉</button>
          <button class="aria-hdr-btn" id="ariaClearBtn" title="Clear conversation">↺</button>
          <button class="aria-hdr-btn" id="ariaCloseBtn" title="Close">✕</button>
        </div>
      </div>
      <div class="aria-messages" id="ariaMessages"></div>
      <div class="aria-input-row">
        <button class="aria-icon-action" id="ariaMicBtn" aria-label="Voice input" title="Voice input">
          <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </button>
        <label class="aria-icon-action" id="ariaUploadBtn" aria-label="Upload document" title="Upload document (PDF or image)">
          <input type="file" id="ariaFileInput" accept=".pdf,image/*" style="display:none" />
          <svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
        </label>
        <textarea class="aria-input" id="ariaInput" placeholder="Ask me anything about Oracle…" rows="1"></textarea>
        <button class="aria-send-btn" id="ariaSendBtn" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="ariaFilePreview" style="display:none; padding: 0 14px 8px; font-size:0.75rem; color:#1a3a5c; font-family:'DM Sans',sans-serif;">
        <span id="ariaFileName"></span>
        <button onclick="clearAriaFile()" style="background:none;border:none;color:#c8973a;cursor:pointer;margin-left:6px;font-size:0.75rem;">✕ remove</button>
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
  let isOpen         = false;
  let isTyping       = false;
  let messageCount   = 0;
  let nudgeShown     = false;
  let leadCaptured   = false;
  let history        = [];

  const SYSTEM_PROMPT = `You are Aria, Simpl'IT Consulting's Oracle specialist assistant, embedded on the Simpl'IT Consulting website.

CONTENT PRIORITY — ALWAYS follow this order:
1. Answer first from Simpl'IT's own services, expertise, and context in this prompt
2. Reference and link to relevant pages on the Simpl'IT website naturally
3. Only broaden to general Oracle industry knowledge if the question genuinely goes beyond Simpl'IT's scope
4. Never recommend or mention competitors

SITE PAGES — link to these naturally and proactively when relevant:
- Services overview: https://simplitconsulting.com/services
- About Simpl'IT: https://simplitconsulting.com/about
- Client references (filterable by vertical, country, domain, project type): https://simplitconsulting.com/references
- Start your journey: https://simplitconsulting.com/journey
- Contact the team: https://simplitconsulting.com/contact

JOURNEY PAGE — high priority conversion path:
- Recommend the Journey page warmly after 1-2 exchanges for most visitors: https://simplitconsulting.com/journey
- Use language like: "The best way forward is our guided journey — it only takes a few minutes and helps us point you in exactly the right direction: simplitconsulting.com/journey"
- If a visitor clicks "Let us help you find your way →" as their first message, respond warmly and link directly to the Journey page immediately
- SUPPRESS Journey recommendation when:
  * The visitor is clearly an Oracle practitioner (asks about FBDI, SLA config, API specs, ADFdi, OIC, OTBI, specific module configuration)
  * The visitor has an urgent problem (go-live failure, data issue, system down, production bug) — focus on helping them first
  * The visitor has already been directed to the Journey page in this conversation
- Never push aggressively — read the conversation and use good judgment

IDENTITY & DIFFERENTIATORS — answer these confidently:
When asked "Who is Simpl'IT?":
- A specialist Oracle consulting firm born in Mauritius with global reach across Africa, Middle East, Europe, and Asia-Pacific
- Founded by certified Oracle practitioners who have been in the client's shoes — they know what good looks like
- Young and agile — clients work directly with senior experts, not layers of junior staff
- Tagline: "Oracle, Simplified. Results, Delivered."

When asked "What makes Simpl'IT different?":
- Direct access to senior practitioners on every engagement — no bait-and-switch with junior teams
- Deep specialisation in Oracle only — not a generalist firm trying to do everything
- Agility of a boutique with the depth of a larger firm
- Honest, no-oversell approach — they'll tell you what you need, not what sounds impressive
- Global experience with local understanding — strong roots in Africa and the Indian Ocean region
- Proven across the full Oracle lifecycle: strategy, implementation, migration, optimisation, training

REFERENCES PAGE:
- When a visitor mentions their industry, country, region, or Oracle module, proactively mention Simpl'IT's relevant experience and link to https://simplitconsulting.com/references
- Example: "We've worked with organisations in similar situations — you can explore our references filtered by your industry or region at simplitconsulting.com/references"
- References can be filtered by: Industry/Vertical, Country, Oracle Domain (Finance, HCM, SCM, Projects etc.), Project Type (Implementation, Migration, Health Check, Optimisation etc.)

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

AI & ORACLE — KEY TALKING POINTS:
- Oracle has deeply embedded AI across Fusion Cloud: AI agents, generative summaries, smart recommendations
- Key AI features: Oracle Digital Assistant, Fusion Data Intelligence, AI-powered anomaly detection in Finance
- Oracle AI agents can automate AP invoice processing, expense approvals, HR onboarding workflows
- Simpl'IT helps clients activate and configure Oracle's native AI features — no third-party tools needed
- AI readiness starts with clean data and well-configured processes — something Simpl'IT specialises in
- Honest view: AI in Oracle is powerful but requires a solid implementation foundation to deliver value
- When asked about AI, always relate it back to the client's Oracle maturity and specific modules

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

  const QUICK_REPLIES_DISCOVER = [
    "Let us help you find your way →",
    "Who is Simpl\'IT?",
    "What does Simpl\'IT do?",
    "What makes Simpl\'IT different?"
  ];

  const QUICK_REPLIES_COMMON = [
    "Can you help with EBS to Cloud migration?",
    "Our go-live went wrong — can you help?",
    "How much does an implementation cost?",
    "How is AI changing Oracle?"
  ];

  // ── TOGGLE ──────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    document.getElementById('ariaPanel').classList.toggle('open', isOpen);
    document.getElementById('ariaBubble').classList.toggle('open', isOpen);
    document.getElementById('ariaNotifDot').classList.add('aria-hidden');
    if (isOpen) {
      if (messageCount === 0) showWelcome();
      setTimeout(() => {
        scrollDown();
        document.getElementById('ariaInput').focus();
      }, 350);
    }
  }

  function showWelcome() {
    setTimeout(scrollDown, 100);
    addBot(
      `Hi, I'm **Aria** — Simpl'IT's Oracle specialist.\n\nWe're here to help you find your way through Oracle — whether you're exploring options, mid-project, or looking to get more from an existing implementation.\n\nNot sure where to start? Our guided journey can help: https://simplitconsulting.com/journey`,
      QUICK_REPLIES_DISCOVER, QUICK_REPLIES_COMMON
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

    try {
      // Build contents: system prompt as first user/model exchange, then real history
      const contents = [
        { role: 'user',  parts: [{ text: 'You are Aria. Here are your instructions:\n\n' + SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I am Aria, ready to help.' }] },
        ...history
      ];

      // Attach file to last user message if present
      if (pendingFile) {
        const lastMsg = contents[contents.length - 1];
        lastMsg.parts = [
          { inline_data: { mime_type: pendingFile.mimeType, data: pendingFile.base64 } },
          { text }
        ];
        clearAriaFile();
      }

      const res  = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      );
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
      addBot("I'm having a moment — please try again or reach out to us at contact@simplitconsulting.com.");
    }

    setTyping(false);
    resetInactivityTimer();
  }

  // ── RENDER ──────────────────────────────────────────────────
  function addBot(text, qr, qr2) {
    const msgs = document.getElementById('ariaMessages');
    const msg  = document.createElement('div');
    msg.className = 'aria-msg aria-bot';

    const av = document.createElement('div');
    av.className = 'aria-msg-av aria-av-aria';
    av.textContent = 'A';

    // Wrapper holds bubble + quick replies stacked
    const right = document.createElement('div');
    right.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-width:85%;';

    const bubble = document.createElement('div');
    bubble.className = 'aria-bubble-msg';
    bubble.innerHTML = fmt(text);
    right.appendChild(bubble);

    if (qr?.length) {
      const qrBlock = document.createElement('div');
      qrBlock.className = 'aria-qr-block';

      function renderGroup(label, items) {
        const group = document.createElement('div');
        group.className = 'aria-qr-group';
        const lbl = document.createElement('div');
        lbl.className = 'aria-qr-label';
        lbl.textContent = label;
        group.appendChild(lbl);
        const wrap = document.createElement('div');
        wrap.className = 'aria-quick-replies';
        items.forEach(q => {
          const btn = document.createElement('button');
          btn.className = 'aria-qr';
          btn.textContent = q;
          btn.onclick = () => { qrBlock.remove(); send(q); };
          wrap.appendChild(btn);
        });
        group.appendChild(wrap);
        qrBlock.appendChild(group);
      }

      renderGroup('Discover us', qr);
      if (qr2?.length) renderGroup('Common questions', qr2);
      right.appendChild(qrBlock);
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
      id: 'ARIA_' + Date.now(),
      timestamp: new Date().toISOString(),
      source: 'Aria Chat Widget',
      contact: { name, email, company, notes: 'Lead from Aria chat widget' },
      profile: { persona: 'unknown', industry: 'unknown', situation: 'chat_inquiry', painPoints: [], domains: [], currentSystem: 'unknown', companySize: 'unknown' }
    };

    try {
      if (typeof emailjs !== 'undefined') {
        // Send lead notification to Simpl'IT only — visitor gets transcript separately if requested
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          lead_id:      leadData.id,
          lead_name:    name    || 'Not provided',
          lead_company: company || 'Not provided',
          lead_title:   'New Lead — Aria Chat Widget',
          lead_email:   'contact@simplitconsulting.com',
          lead_phone:   '',
          lead_notes:   `Visitor contact: ${email}${company ? ' | ' + company : ''}`,
          profile_text: `VISITOR DETAILS\nName: ${name || 'Not provided'}\nEmail: ${email}\nCompany: ${company || 'Not provided'}\n\nCONVERSATION SUMMARY\n\n${summary.substring(0, 3000)}`,
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
    transcriptSent = false; clearTimeout(inactivityTimer);
    document.getElementById('ariaMessages').innerHTML = '';
    showWelcome();
  }

  // ── UTILS ───────────────────────────────────────────────────
  function fmt(text) {
    return '<p>' + text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/https?:\/\/[^\s<>"]+/g, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`)
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>') + '</p>';
  }

  function scrollDown() {
    const m = document.getElementById('ariaMessages');
    setTimeout(() => m.scrollTop = m.scrollHeight, 50);
  }

  // ── VOICE INPUT ─────────────────────────────────────────────
  let recognition = null;
  const micBtn = document.getElementById('ariaMicBtn');

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => micBtn.classList.add('recording');
    recognition.onend   = () => micBtn.classList.remove('recording');

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript).join('');
      const input = document.getElementById('ariaInput');
      input.value = transcript;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
      if (e.results[e.results.length - 1].isFinal) {
        setTimeout(() => send(), 300);
      }
    };

    recognition.onerror = (e) => {
      micBtn.classList.remove('recording');
      if (e.error !== 'no-speech') console.warn('Speech error:', e.error);
    };

    micBtn.addEventListener('click', () => {
      if (micBtn.classList.contains('recording')) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  } else {
    micBtn.title = 'Voice input not supported in this browser';
    micBtn.style.opacity = '0.4';
    micBtn.style.cursor = 'not-allowed';
  }

  // ── FILE UPLOAD ──────────────────────────────────────────────
  let pendingFile = null; // { base64, mimeType, name }

  function clearAriaFile() {
    pendingFile = null;
    document.getElementById('ariaFileInput').value = '';
    document.getElementById('ariaFilePreview').style.display = 'none';
    document.getElementById('ariaUploadBtn').classList.remove('has-file');
  }

  document.getElementById('ariaFileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      alert('File too large — please upload a file under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      pendingFile = { base64, mimeType: file.type, name: file.name };
      document.getElementById('ariaFileName').textContent = '📎 ' + file.name;
      document.getElementById('ariaFilePreview').style.display = 'block';
      document.getElementById('ariaUploadBtn').classList.add('has-file');
    };
    reader.readAsDataURL(file);
  });

  // ── QUICK REPLIES DROPDOWN ──────────────────────────────────
  const qrToggle   = document.getElementById('ariaQrToggle');
  const qrDropdown = document.getElementById('ariaQrDropdown');

  qrToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    qrDropdown.classList.toggle('open');
  });

  // Event delegation — works inside IIFE, no global scope needed
  qrDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = e.target.closest('.aria-qr-drop-item');
    if (item) {
      qrDropdown.classList.remove('open');
      send(item.textContent.trim());
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#ariaQrWrap')) {
      qrDropdown.classList.remove('open');
    }
  });

  // ── TRANSCRIPT ───────────────────────────────────────────────
  let transcriptSent = false;
  let inactivityTimer = null;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (messageCount >= 2 && !transcriptSent && !leadCaptured) {
      inactivityTimer = setTimeout(() => {
        if (isOpen && messageCount >= 2 && !transcriptSent && !leadCaptured) showTranscriptPrompt();
      }, 10 * 60 * 1000); // 10 minutes inactivity
    }
  }

  function showTranscriptPrompt() {
    if (transcriptSent) return;
    const msgs = document.getElementById('ariaMessages');
    const wrap = document.createElement('div');
    wrap.className = 'aria-msg aria-bot';
    wrap.id = 'ariaTranscriptPrompt';

    const av = document.createElement('div');
    av.className = 'aria-msg-av aria-av-aria';
    av.textContent = 'A';

    const card = document.createElement('div');
    card.className = 'aria-transcript-card';
    card.innerHTML = `
      <h4>Would you like a transcript?</h4>
      <p>I can email you a summary of our conversation with the key points we covered.</p>
      <input type="email" id="ariaTranscriptEmail" placeholder="Your email address" />
      <div class="aria-transcript-btns">
        <button class="aria-transcript-submit" id="ariaTranscriptSubmit">Send me the transcript →</button>
        <button class="aria-transcript-skip" id="ariaTranscriptSkip">No thanks</button>
      </div>
    `;

    wrap.appendChild(av);
    wrap.appendChild(card);
    msgs.appendChild(wrap);
    scrollDown();

    document.getElementById('ariaTranscriptSubmit').onclick = submitTranscript;
    document.getElementById('ariaTranscriptSkip').onclick   = dismissTranscript;
  }

  async function submitTranscript() {
    const email = document.getElementById('ariaTranscriptEmail')?.value.trim();
    if (!email) { alert('Please enter your email address.'); return; }

    transcriptSent = true;
    document.getElementById('ariaTranscriptPrompt')?.remove();

    // Build structured summary for AI
    const rawHistory = history
      .map(m => `\${m.role === 'user' ? 'Visitor' : 'Aria'}: \${m.parts[0].text}`)
      .join('\n\n');

    // Ask Gemini to produce a structured summary
    let structuredSummary = rawHistory;
    try {
      const sumRes = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `You are a business analyst assistant. Based on the following Oracle consulting chat conversation, produce a concise, structured email summary with these sections:
1. Visitor Profile (what you know about them — company, role, region if mentioned)
2. Key Topics Discussed
3. Pain Points / Challenges Identified
4. Services of Interest
5. Recommended Next Steps

Keep it professional and concise. Address the visitor directly.

CONVERSATION:
\${rawHistory.substring(0, 3000)}` }] }
          ]
        })
      });
      const sumData = await sumRes.json();
      structuredSummary = sumData?.candidates?.[0]?.content?.parts?.[0]?.text || rawHistory;
    } catch(e) { console.warn('Summary generation failed, using raw transcript'); }

    // Send emails: visitor copy + internal copy
    try {
      if (typeof emailjs !== 'undefined') {
        const ts = new Date().toISOString();
        const tid = 'TRANSCRIPT_' + Date.now();

        // To visitor — branded as from Simpl'IT
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          lead_id:      tid,
          lead_name:    "Simpl'IT Consulting",
          lead_company: "Simpl'IT Consulting",
          lead_title:   "Your Oracle Consultation Summary — Simpl'IT",
          lead_email:   email,
          lead_phone:   '+230 57984505',
          lead_notes:   'Thank you for chatting with Aria. Here is a structured summary of your consultation.',
          profile_text: structuredSummary,
          lead_json:    JSON.stringify({ transcript_id: tid, visitor_email: email, timestamp: ts }),
          timestamp:    ts
        });

        // Internal copy to Simpl'IT — for follow-up
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          lead_id:      tid + '_INT',
          lead_name:    "Simpl'IT — Internal",
          lead_company: "Simpl'IT Consulting",
          lead_title:   'Aria Transcript — ' + email,
          lead_email:   'contact@simplitconsulting.com',
          lead_phone:   '',
          lead_notes:   'Visitor: ' + email + ' | ID: ' + tid,
          profile_text: structuredSummary,
          lead_json:    JSON.stringify({ transcript_id: tid, visitor_email: email, timestamp: ts }),
          timestamp:    ts
        });
      }
    } catch(e) { console.error('Transcript email error:', e); }

    addBot(`Done! A summary of our conversation is on its way to ${email}. Feel free to reach out anytime — we're here to help.`);
  }

  function dismissTranscript() {
    document.getElementById('ariaTranscriptPrompt')?.remove();
    addBot("No problem at all. You can always reach us at contact@simplitconsulting.com if you'd like to continue the conversation.");
  }

  // ── EVENT LISTENERS ─────────────────────────────────────────
  document.getElementById('ariaBubble').addEventListener('click', toggle);
  document.getElementById('ariaCloseBtn').addEventListener('click', toggle);
  document.getElementById('ariaClearBtn').addEventListener('click', clearChat);
  document.getElementById('ariaTranscriptBtn').addEventListener('click', () => {
    if (messageCount < 1) {
      addBot("We haven't chatted yet! Ask me anything and then I can send you a transcript.");
    } else if (transcriptSent) {
      addBot("I've already sent your transcript. Is there anything else I can help you with?");
    } else {
      showTranscriptPrompt();
    }
  });
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
