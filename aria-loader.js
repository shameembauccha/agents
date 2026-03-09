/**
 * Aria Widget Loader - Simpl'IT Consulting
 * https://shameembauccha.github.io/agents/aria-loader.js
 */
(function () {
  'use strict';

  if (document.getElementById('aria-widget')) return;

  // -- CONFIG --------------------------------------------------
  var PROXY_URL      = 'https://simplitconsulting.com/wp-json/simplit/v1/aria';
  var ANALYTICS_URL  = 'https://simplitconsulting.com/wp-json/simplit/v1/aria-event';
  var SESSION_ANALYTICS_ID = 'aria_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);

  function ariaTrack(event, data) {
    // 1. Log to WordPress DB
    var payload = {
      event:     event,
      sessionId: SESSION_ANALYTICS_ID,
      pageUrl:   window.location.href,
      pageTitle: document.title,
      ga4ClientId: SESSION_ANALYTICS_ID
    };
    if (data) {
      if (data.message) { payload.message = data.message.substring(0, 500); payload.role = data.role || ''; }
      if (data.metadata) payload.metadata = data.metadata;
    }
    fetch(ANALYTICS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(function(){});

    // GA4 fired server-side via proxy
  }

  var MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ];
  var modelIndex = 0;

  // Deep-link service map  -  exact URLs for every service
  var SERVICE_LINKS = {
    // Pre-Project
    'roadmap':    'https://simplitconsulting.com/services/?group=pre&svc=roadmap',
    'strategy':   'https://simplitconsulting.com/services/?group=pre&svc=roadmap',
    'bizcase':    'https://simplitconsulting.com/services/?group=pre&svc=bizcase',
    'business case': 'https://simplitconsulting.com/services/?group=pre&svc=bizcase',
    'vendor':     'https://simplitconsulting.com/services/?group=pre&svc=vendor',
    'rfp':        'https://simplitconsulting.com/services/?group=pre&svc=rfp',
    'contract':   'https://simplitconsulting.com/services/?group=pre&svc=contract',
    // Delivery
    'implementation': 'https://simplitconsulting.com/services/?group=delivery&svc=impl',
    'impl':       'https://simplitconsulting.com/services/?group=delivery&svc=impl',
    'upgrade':    'https://simplitconsulting.com/services/?group=delivery&svc=upgrade',
    'migration':  'https://simplitconsulting.com/services/?group=delivery&svc=upgrade',
    'architecture': 'https://simplitconsulting.com/services/?group=delivery&svc=arch',
    'data migration': 'https://simplitconsulting.com/services/?group=delivery&svc=datamig',
    'governance': 'https://simplitconsulting.com/services/?group=delivery&svc=pgov',
    'staff augmentation': 'https://simplitconsulting.com/services/?group=delivery&svc=staff',
    'staffing':   'https://simplitconsulting.com/services/?group=delivery&svc=staff',
    // Post-Project
    'rescue':     'https://simplitconsulting.com/services/?group=post&svc=rescue',
    'amo':        'https://simplitconsulting.com/services/?group=post&svc=rescue',
    'optimisation': 'https://simplitconsulting.com/services/?group=post&svc=optimise',
    'optimization': 'https://simplitconsulting.com/services/?group=post&svc=optimise',
    'health check': 'https://simplitconsulting.com/services/?group=post&svc=health',
    'healthcheck': 'https://simplitconsulting.com/services/?group=post&svc=health',
    'health':     'https://simplitconsulting.com/services/?group=post&svc=health',
    'managed support': 'https://simplitconsulting.com/services/?group=post&svc=msupport',
    'support':    'https://simplitconsulting.com/services/?group=post&svc=msupport',
    'training':   'https://simplitconsulting.com/services/?group=post&svc=training',
    'licence':    'https://simplitconsulting.com/services/?group=post&svc=licence',
    'license':    'https://simplitconsulting.com/services/?group=post&svc=licence',
    // Specialist
    'dev':        'https://simplitconsulting.com/services/?group=specialist&svc=dev',
    'development': 'https://simplitconsulting.com/services/?group=specialist&svc=dev',
    'analytics':  'https://simplitconsulting.com/services/?group=specialist&svc=analytics',
    'reporting':  'https://simplitconsulting.com/services/?group=specialist&svc=analytics',
    'grc':        'https://simplitconsulting.com/services/?group=specialist&svc=grc',
    'compliance': 'https://simplitconsulting.com/services/?group=specialist&svc=grc',
    'expert':     'https://simplitconsulting.com/services/?group=specialist&svc=expert',
    'ask an expert': 'https://simplitconsulting.com/services/?group=specialist&svc=expert'
  };
  var EMAILJS_SVC    = 'service_rs59uuo';
  var EMAILJS_TPL    = 'template_el8vjzi';
  var EMAILJS_KEY    = 'htvC-XwdHLSAXmhnv';

  // -- FONTS ---------------------------------------------------
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=DM"]')) {
    var fl = document.createElement('link');
    fl.rel  = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(fl);
  }

  // -- STYLES --------------------------------------------------
  var style = document.createElement('style');
  style.id = 'aria-styles';
  style.textContent = [
    '#aria-widget * { box-sizing: border-box; }',
    '@media (prefers-color-scheme: dark) { .aria-panel { background: #1e2535 !important; } .aria-messages { background: #1e2535; } .aria-msg.aria-bot .aria-bubble-msg { background: #2a3548 !important; color: #e8e4dc !important; } .aria-input-row { background: #1e2535 !important; border-color: #2a3548 !important; } .aria-input { background: #2a3548 !important; border-color: #3a4a6b !important; color: #e8e4dc !important; } .aria-input:focus { background: #2a3548 !important; } .aria-footer-tag { border-color: #2a3548 !important; } }',
    '#aria-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999999; font-family: DM Sans, sans-serif; }',

    '.aria-bubble { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 100%); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(26,58,92,0.35); transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; animation: ariaBubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1); }',
    '@keyframes ariaBubblePop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
    '.aria-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(26,58,92,0.45); }',
    '.aria-bubble::before { content: "Ask me about Oracle"; position: absolute; right: 70px; bottom: 50%; transform: translateY(50%); background: #1a3a5c; color: white; font-size: 0.75rem; white-space: nowrap; padding: 6px 12px; border-radius: 20px; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; font-family: DM Sans, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }',
    '.aria-bubble:hover::before { opacity: 1; }',
    '.aria-bubble.open::before { display: none; }',
    '.aria-bubble svg { width: 26px; height: 26px; fill: white; }',
    '.aria-bubble .aria-icon-close { display: none; }',
    '.aria-bubble.open .aria-icon-chat { display: none; }',
    '.aria-bubble.open .aria-icon-close { display: block; }',

    '.aria-notif-dot { position: absolute; top: 2px; right: 2px; width: 14px; height: 14px; background: #c8973a; border-radius: 50%; border: 2px solid white; }',
    '.aria-notif-dot.aria-hidden { display: none; }',

    '.aria-panel { position: fixed; bottom: 90px; right: 24px; width: 500px; height: 760px; max-height: calc(100vh - 100px); background: white; border-radius: 16px; box-shadow: 0 16px 56px rgba(15,15,15,0.18); display: flex; flex-direction: column; overflow: hidden; transform-origin: bottom right; transform: scale(0.85) translateY(16px); opacity: 0; pointer-events: none; transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), opacity 0.2s ease; z-index: 999998; }',
    '.aria-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }',
    '.aria-panel.minimised .aria-messages, .aria-panel.minimised .aria-input-row, .aria-panel.minimised .aria-footer-tag, .aria-panel.minimised #ariaAttachPreview { display: none !important; }',
    '.aria-panel.minimised { height: auto !important; }',
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
    '.aria-wa-btn { display: inline-flex; align-items: center; gap: 6px; background: #25d366; color: white; border: none; border-radius: 8px; padding: 8px 14px; font-family: DM Sans, sans-serif; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-top: 8px; text-decoration: none; }',
    '.aria-wa-btn:hover { background: #1fb855; }',

    '.aria-input-row { padding: 12px 14px; border-top: 1px solid #f0ede4; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; background: white; }',
    '.aria-input { flex: 1; border: 1.5px solid #d8d3c8; border-radius: 20px; padding: 9px 14px; font-family: DM Sans, sans-serif; font-size: 0.84rem; outline: none; resize: none; max-height: 100px; line-height: 1.4; color: #1a1a1a; background: #f8f6f1; transition: border-color 0.15s; }',
    '.aria-input:focus { border-color: #1a3a5c; background: white; color: #1a1a1a; }',
    '.aria-input::placeholder { color: #b0a898; }',
    '.aria-send-btn { width: 36px; height: 36px; border-radius: 50%; background: #1a3a5c; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }',
    '.aria-icon-btn { width: 32px; height: 32px; border-radius: 50%; background: none; border: 1.5px solid #d8d3c8; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; color: #6b6457; }',
    '.aria-icon-btn:hover { background: #f0ede4; border-color: #b0a898; }',
    '.aria-icon-btn.recording { background: #fee2e2; border-color: #ef4444; color: #ef4444; animation: ariaPulse 1s ease-in-out infinite; }',
    '@keyframes ariaPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }',
    '.aria-icon-btn svg { width: 15px; height: 15px; fill: currentColor; }',
    '.aria-attach-preview { display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: #f0ede4; border-radius: 10px; margin: 0 14px 6px; font-size: 0.75rem; color: #1a3a5c; }',
    '.aria-attach-preview button { background: none; border: none; cursor: pointer; color: #b0a898; font-size: 0.85rem; padding: 0 2px; }',
    '.aria-send-btn:hover { background: #2d5f8a; }',
    '.aria-send-btn:disabled { background: #d8d3c8; cursor: not-allowed; }',
    '.aria-send-btn svg { width: 16px; height: 16px; fill: white; }',

    '.aria-footer-tag { padding: 6px 14px 8px; text-align: center; font-size: 0.62rem; color: #b0a898; font-family: DM Mono, monospace; letter-spacing: 0.06em; border-top: 1px solid #f0ede4; flex-shrink: 0; }',
    '.aria-copy-btn { background: none; border: none; cursor: pointer; color: #b0a898; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; transition: all 0.15s; margin-top: 2px; align-self: flex-start; }',
    '.aria-copy-btn:hover { color: #1a3a5c; background: #f0ede4; }'
  ].join('\n');
  document.head.appendChild(style);

  // -- HTML ----------------------------------------------------
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
    + '<button class="aria-hdr-btn" id="ariaMinBtn" title="Minimise">&#8722;</button>'
    + '<button class="aria-hdr-btn" id="ariaCloseBtn" title="Close">&#10005;</button>'
    + '</div>'
    + '</div>'
    + '<div class="aria-messages" id="ariaMessages"></div>'
    + '<div id="ariaAttachPreview" style="display:none;" class="aria-attach-preview">'
    + '<span id="ariaAttachName"></span>'
    + '<button id="ariaAttachRemove">&#10005;</button>'
    + '</div>'
    + '<div class="aria-input-row">'
    + '<button class="aria-icon-btn" id="ariaMicBtn" title="Voice input"><svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button>'
    + '<input type="file" id="ariaFileInput" accept="image/*,.pdf" style="display:none;" />'
    + '<button class="aria-icon-btn" id="ariaAttachBtn" title="Attach file"><svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg></button>'
    + '<textarea class="aria-input" id="ariaInput" placeholder="Ask me anything about Oracle..." rows="1"></textarea>'
    + '<button class="aria-send-btn" id="ariaSendBtn"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>'
    + '</div>'
    + '<div class="aria-footer-tag">Simpl\'IT Consulting &middot; Oracle, Simplified. &middot; Powered by Gemini</div>'
    + '</div>'
    + '<div class="aria-qr-menu" id="ariaQrMenu"></div>';
  document.body.appendChild(widget);

  // -- EMAILJS -------------------------------------------------
  var ejs = document.createElement('script');
  ejs.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  ejs.onload = function() { emailjs.init(EMAILJS_KEY); };
  document.head.appendChild(ejs);

  // -- STATE ---------------------------------------------------
  var isOpen          = false;
  var isTyping        = false;
  var messageCount    = 0;
  var nudgeShown      = false;
  var journeyNudged   = false;
  var leadCaptured    = false;
  var emailSent       = false;
  var emailSending    = false;
  var transcriptShown = false;
  var visitorName     = '';
  var visitorEmail    = '';
  var visitorCompany  = '';
  var inactivityTimer = null;
  var history         = [];
  var attachedFile    = null;

  // Detect language
  var userLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  var isFrench = userLang.indexOf('fr') === 0;

  var SYSTEM_PROMPT = 'You are Aria, Simpl\'IT Consulting\'s Oracle specialist assistant.\n\n'
    + (isFrench ? 'LANGUAGE: The visitor\'s browser is set to French. Respond in French unless they write to you in English first.\n\n' : '')
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
    + 'BEHAVIOUR:\n'
    + '- Responses must be SHORT: 2-4 sentences max unless listing. Never write walls of text.\n'
    + '- Be direct and specific. Cut filler phrases like "Great question" or "Certainly".\n'
    + '- Cite real facts from Simpl\'IT knowledge only. Never invent case studies or project references.\n'
    + '- If unsure, say so honestly. Trust is built by accuracy not confidence.\n'
    + '- Plain language unless visitor is clearly technical.\n'
    + '- No oversell. Help the visitor understand their options.\n\n'
    + 'PAGE NAVIGATION:\n'
    + '- You receive the current page URL and a snippet of visible content with each message.\n'
    + '- Use this to give contextual help: explain page sections, guide to relevant pages, answer page-specific questions.\n'
    + '- Always use full URLs when linking: https://simplitconsulting.com/[page]\n\n'
    + 'SERVICE DEEP LINKS  -  always link to the exact service, never just /services/:\n'
    + 'Pre-Project: Roadmap https://simplitconsulting.com/services/?group=pre&svc=roadmap | Business Case ?group=pre&svc=bizcase | Vendor Eval ?group=pre&svc=vendor | RFP ?group=pre&svc=rfp | Contract ?group=pre&svc=contract\n'
    + 'Delivery: Implementation ?group=delivery&svc=impl | Upgrade/Migration ?group=delivery&svc=upgrade | Architecture ?group=delivery&svc=arch | Data Migration ?group=delivery&svc=datamig | Governance ?group=delivery&svc=pgov | Staffing ?group=delivery&svc=staff\n'
    + 'Post-Project: Rescue/AMO ?group=post&svc=rescue | Optimisation ?group=post&svc=optimise | Health Check ?group=post&svc=health | Managed Support ?group=post&svc=msupport | Training ?group=post&svc=training | Licence Review ?group=post&svc=licence\n'
    + 'Specialist: Dev/Extensions ?group=specialist&svc=dev | Analytics ?group=specialist&svc=analytics | GRC ?group=specialist&svc=grc | Ask an Expert ?group=specialist&svc=expert\n\n'
    + 'JOURNEY INVITE  -  trigger naturally when: visitor describes a pain point, asks about cost/timeline, mentions they are stuck, or asks which service fits them. '
    + 'Say something like: "The quickest way to get a concrete answer is our 2-min Guided Journey  -  https://simplitconsulting.com/journey/ It maps your situation to the right service and gives you a roadmap."';

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

  // Contextual chips by page/URL
  function getContextChips() {
    var url   = window.location.href.toLowerCase();
    var path  = window.location.pathname.toLowerCase();
    var query = window.location.search.toLowerCase();

    // Services - group level
    if (url.indexOf('group=pre') !== -1) return [
      'What is a Roadmap and Strategy engagement?',
      'How do you help with vendor selection?',
      'What does RFP support look like?',
      'How long does pre-project advisory take?'
    ];
    if (url.indexOf('group=delivery') !== -1) return [
      'What does a typical implementation look like?',
      'How do you handle EBS to Cloud migration?',
      'What is programme governance?',
      'Do you offer staff augmentation?'
    ];
    if (url.indexOf('group=post') !== -1) return [
      'What is a health check and how long does it take?',
      'Can you rescue a failing project?',
      'What does post go-live optimisation cover?',
      'What is included in managed support?'
    ];
    if (url.indexOf('group=specialist') !== -1) return [
      'What Oracle extensions and dev do you offer?',
      'How can you help with analytics and reporting?',
      'What does GRC and compliance cover?',
      'How does Ask an Expert work?'
    ];
    // Services - specific service
    if (url.indexOf('svc=health') !== -1) return [
      'What does a Fusion health check cover?',
      'How long does a health check take?',
      'What happens after the health check?',
      'How much does a health check cost?'
    ];
    if (url.indexOf('svc=rescue') !== -1) return [
      'How quickly can you mobilise for a rescue?',
      'What does AMO cover?',
      'Have you rescued Oracle Fusion projects before?',
      'What are the signs a project needs rescuing?'
    ];
    if (url.indexOf('svc=upgrade') !== -1) return [
      'What is involved in an EBS to Cloud migration?',
      'How long does an upgrade typically take?',
      'What are the risks of migrating to Fusion?',
      'Do you handle data migration too?'
    ];
    if (url.indexOf('svc=impl') !== -1) return [
      'What is your implementation methodology?',
      'How many consultants would be on my project?',
      'What modules do you specialise in?',
      'What does a typical timeline look like?'
    ];
    if (url.indexOf('svc=training') !== -1) return [
      'What Oracle training do you offer?',
      'Do you offer end-user training post go-live?',
      'Can training be delivered remotely?',
      'What is covered in enablement programmes?'
    ];
    // Journey page
    if (path.indexOf('/journey') !== -1) return [
      'What happens after I complete the journey?',
      'How long does the advisory session take?',
      'What will I get out of this?',
      'I am already on Oracle - what is the fast-track?'
    ];
    // Blog / Architecture / AI series
    if (path.indexOf('/blog') !== -1 || path.indexOf('/series') !== -1 || path.indexOf('/architecture') !== -1 || path.indexOf('/ai-series') !== -1) return [
      'Can you explain this article in plain English?',
      'How does this apply to my Oracle project?',
      'What services relate to this topic?',
      'Where can I learn more about this?'
    ];
    // Contact page
    if (path.indexOf('/contact') !== -1) return [
      'What is the best way to reach your team?',
      'How quickly do you respond to enquiries?',
      'Can I book a call directly?',
      'Where are you based?'
    ];
    // Values page
    if (path.indexOf('/values') !== -1) return [
      'What makes Simpl\'IT different from big consultancies?',
      'How do you work with clients?',
      'Do you work globally?',
      'Can you share client references?'
    ];
    // Home / default
    return QR_COMMON;
  }

  function updateContextChips() {
    // No-op for now - chips shown at welcome or page-change message
  }

  // -- Session persistence --------------------------------------
  var SESSION_KEY = 'aria_session';
  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        history:       history,
        messageCount:  messageCount,
        leadCaptured:  leadCaptured,
        emailSent:     emailSent,
        nudgeShown:    nudgeShown,
        journeyNudged: journeyNudged,
        visitorName:   visitorName,
        visitorEmail:  visitorEmail,
        visitorCompany:visitorCompany,
        lastPage:      window.location.href
      }));
    } catch(e) {}
  }
  function restoreSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      var s = JSON.parse(raw);
      history        = s.history        || [];
      messageCount   = s.messageCount   || 0;
      leadCaptured   = s.leadCaptured   || false;
      emailSent      = s.emailSent      || false;
      nudgeShown     = s.nudgeShown     || false;
      journeyNudged  = s.journeyNudged  || false;
      visitorName    = s.visitorName    || '';
      visitorEmail   = s.visitorEmail   || '';
      visitorCompany = s.visitorCompany || '';
      return { restored: true, lastPage: s.lastPage || '' };
    } catch(e) { return false; }
  }

  // -- TOGGLE --------------------------------------------------
  function toggle() {
    isOpen = !isOpen;
    document.getElementById('ariaPanel').classList.toggle('open', isOpen);
    document.getElementById('ariaBubble').classList.toggle('open', isOpen);
    document.getElementById('ariaNotifDot').classList.add('aria-hidden');
    if (isOpen) {
      ariaTrack('widget_open');
      if (messageCount === 0) {
        var restored = restoreSession();
        if (restored && history.length > 0) {
          replayHistory();
          if (restored.lastPage && restored.lastPage !== window.location.href) {
            var pg = document.title.replace(/ [-|] Simpl.*$/i, '').trim();
            setTimeout(function() {
              addBot('I see you have moved to **' + pg + '**. Happy to continue - or ask me anything about this page.', getContextChips());
            }, 400);
          } else {
            updateContextChips();
          }
        } else {
          showWelcome();
        }
      }
      setTimeout(function() {
        scrollDown();
        document.getElementById('ariaInput').focus();
      }, 300);
    }
  }

  function replayHistory() {
    var msgs = document.getElementById('ariaMessages');
    if (!msgs) return;
    msgs.innerHTML = '';
    for (var i = 0; i < history.length; i++) {
      var entry = history[i];
      if (entry.role === 'user') {
        var parts = entry.parts || [];
        var txt = parts[0] ? parts[0].text || '' : '';
        if (txt) addUser(txt, true);
      } else if (entry.role === 'model') {
        var parts = entry.parts || [];
        var txt = parts[0] ? parts[0].text || '' : '';
        if (txt) addBot(txt, null, null, true);
      }
    }
    scrollDown();
  }

  function showWelcome() {
    var hr = new Date().getHours();
    var greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    var returning = localStorage.getItem('aria_visited');
    var chips = getContextChips();
    var msg = returning
      ? greet + '! Welcome back. Ready to continue exploring Oracle with Simpl\'IT?\n\nOr start fresh - https://simplitconsulting.com/journey'
      : greet + '! I\'m **Aria** - Simpl\'IT\'s Oracle specialist.\n\nWe\'re here to help you find your way through Oracle - whether you\'re exploring, mid-project, or looking to get more from an existing implementation.\n\nNot sure where to start? https://simplitconsulting.com/journey';
    localStorage.setItem('aria_visited', '1');
    addBot(msg, QR_DISCOVER, chips);
  }

  // -- SEND ----------------------------------------------------
  function send(override) {
    var input = document.getElementById('ariaInput');
    var text  = (override || input.value).trim();
    if (!text || isTyping) return;
    if (!override) { input.value = ''; input.style.height = 'auto'; }

    addUser(text);
    messageCount++;
    setTyping(true);


    if (attachedFile) {
      history[history.length - 1] = { role: 'user', parts: [
        { inline_data: { mime_type: attachedFile.mimeType, data: attachedFile.data } },
        { text: text }
      ]};
      attachedFile = null;
      var prev = document.getElementById('ariaAttachPreview');
      if (prev) prev.style.display = 'none';
    }

    // Level 1: current page context
    var pageCtx = 'CURRENT PAGE: ' + document.title + ' | URL: ' + window.location.href;

    // Level 2: scrape visible main content (capped at 2000 chars)
    var pageContent = '';
    var mainEl = document.querySelector('main') || document.querySelector('article') || document.querySelector('.entry-content') || document.querySelector('#content') || document.body;
    if (mainEl) {
      var raw = mainEl.innerText || '';
      // Strip excessive whitespace
      raw = raw.replace(/\s+/g, ' ').trim();
      // Remove widget text itself to avoid confusion
      var widgetEl = document.getElementById('aria-widget');
      if (widgetEl) {
        var widgetText = widgetEl.innerText || '';
        raw = raw.replace(widgetText, '').trim();
      }
      pageContent = raw.substring(0, 800);
    }

    var siteCtx = pageCtx;
    if (pageContent) siteCtx += '\n\nVISIBLE PAGE CONTENT (use to answer page-specific questions):\n' + pageContent;
    if (visitorName) siteCtx += '\n\nVISITOR NAME: ' + visitorName + ' - use their first name naturally in responses.';

    var contents = [
      { role: 'user',  parts: [{ text: 'You are Aria. Instructions:\n\n' + SYSTEM_PROMPT + '\n\n' + siteCtx }] },
      { role: 'model', parts: [{ text: 'Understood. I am Aria, ready to help.' }] }
    ].concat(history);

    function tryModel(idx, contents) {
      if (idx >= MODELS.length) {
        addBot('Our AI is taking a breather right now. Reach us directly at contact@simplitconsulting.com or call +230 57984505  -  we respond within the hour.');
        setTyping(false);
        return;
      }
      fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contents, model: MODELS[idx], pageUrl: window.location.href })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.error && data.error.code === 429) {
          modelIndex = idx + 1;
          tryModel(modelIndex, contents);
          return;
        }
        var reply = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text)
          || 'I\'m having a moment - please try again or reach out at contact@simplitconsulting.com.';
        addBot(reply);
        history.push({ role: 'model', parts: [{ text: reply }] });
        ariaTrack('message_received', { message: reply.substring(0, 200), role: 'aria' });
        if (messageCount >= 3 && !nudgeShown && !leadCaptured) {
          nudgeShown = true;
          setTimeout(showNudge, 800);
        }
        // Smart journey trigger - detect intent from visitor message
        if (!journeyNudged && !leadCaptured && messageCount >= 2) {
          var lm = msg.toLowerCase();
          var jt = ['stuck','not sure','which service','where to start','cost','how much','timeline','how long','problem','issue','migration','upgrade','rescue','failing','behind schedule','over budget','what do you recommend','what should'];
          if (jt.some(function(kw) { return lm.indexOf(kw) !== -1; })) {
            journeyNudged = true;
            setTimeout(function() {
              ariaTrack('journey_nudge');
            addBot('Based on what you have shared, our 2-min Guided Journey would map the right path for you: https://simplitconsulting.com/journey/');
            }, 1200);
          }
        }
        saveSession();
        setTyping(false);
        resetInactivity();
      })
      .catch(function() {
        modelIndex = idx + 1;
        ariaTrack('model_fallback', { metadata: { from: MODELS[idx], to: MODELS[idx+1] || 'none' } });
        tryModel(modelIndex, contents);
      });
    }
    tryModel(modelIndex, contents);
  }

  // -- RENDER --------------------------------------------------
  function addBot(text, qr, qr2, silent) {
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

    // Copy button
    var copyBtn = document.createElement('button');
    copyBtn.className = 'aria-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = function() {
      var txt = bubble.innerText || bubble.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(function() {
          copyBtn.textContent = 'Copied!';
          setTimeout(function() { copyBtn.textContent = 'Copy'; }, 1500);
        });
      }
    };
    right.appendChild(copyBtn);

    if (qr && qr.length) {
      var qrBlock = document.createElement('div');
      qrBlock.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin-top:4px;';
      function makeGroup(label, items) {
        var g = document.createElement('div');
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
            btn.onclick = (function(qText) {
              return function() {
                ariaTrack('chip_clicked', { message: qText, role: 'user' });
                qrBlock.remove();
                send(qText);
              };
            })(q);
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

  function addUser(text, silent) {
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
    if (!silent) {
      history.push({ role: 'user', parts: [{ text: text }] });
      ariaTrack('message_sent', { message: text, role: 'user' });
    }
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
      bubble._slowTimer = setTimeout(function() {
        var st = bubble.querySelector('.aria-slow-msg');
        if (!st) {
          var d = document.createElement('div');
          d.className = 'aria-slow-msg';
          d.style.cssText = 'font-size:0.72rem;color:#b0a898;margin-top:5px;';
          d.textContent = 'Still working on this...';
          bubble.appendChild(d);
        }
      }, 12000);
      msg.appendChild(av);
      msg.appendChild(bubble);
      msgs.appendChild(msg);
      scrollDown();
    } else if (!val && existing) {
      var b = existing.querySelector('.aria-bubble-msg');
      if (b && b._slowTimer) clearTimeout(b._slowTimer);
      existing.remove();
    }
  }

  // -- NUDGE ---------------------------------------------------
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
    ariaTrack('lead_captured', { metadata: { name: name, company: company } });
    // WhatsApp handoff
    setTimeout(function() {
      var msgs = document.getElementById('ariaMessages');
      var waWrap = document.createElement('div');
      waWrap.className = 'aria-msg aria-bot';
      var waAv = document.createElement('div');
      waAv.className = 'aria-msg-av aria-av-aria';
      waAv.textContent = 'A';
      var waBubble = document.createElement('div');
      waBubble.className = 'aria-bubble-msg';
      waBubble.innerHTML = 'Prefer to chat right now? <br><a class="aria-wa-btn" id="ariaWaBtn" href="https://wa.me/23057984505" target="_blank" rel="noopener">&#128172; Continue on WhatsApp</a>';
      setTimeout(function() {
        var waBtn = document.getElementById('ariaWaBtn');
        if (waBtn) waBtn.addEventListener('click', function() { ariaTrack('whatsapp_clicked'); });
      }, 100);
      waWrap.appendChild(waAv);
      waWrap.appendChild(waBubble);
      msgs.appendChild(waWrap);
      scrollDown();
    }, 1500);
  }

  function dismissNudge() {
    var el = document.getElementById('ariaLeadNudge');
    if (el) el.remove();
    addBot('No problem - I\'m here whenever you need me.');
  }

  // -- EMAIL ---------------------------------------------------
  function sendEmail(toEmail, toName, toCompany) {
    if (emailSent || emailSending) return;
    emailSending = true;
    emailSent    = true;
    var conv = '';
    for (var i = 0; i < history.length; i++) {
      conv += (history[i].role === 'user' ? 'Visitor' : 'Aria') + ': ' + history[i].parts[0].text + '\n\n';
    }
    var ts  = new Date().toISOString();
    var tid = 'ARIA_' + Date.now();
    var nm  = toName    || 'Visitor';
    var co  = toCompany || '';
    // Build summary from conversation history directly - no extra API call
    var summary = 'CONVERSATION SUMMARY\n\n';
    summary += 'Visitor: ' + (nm || toEmail) + (co ? ' | ' + co : '') + '\n\n';
    summary += 'FULL CONVERSATION:\n\n' + conv;
    dispatchEmails(tid, ts, toEmail, nm, co, summary);
  }

  function dispatchEmails(tid, ts, toEmail, nm, co, summary) {
    if (typeof emailjs === 'undefined') return;
    var note = 'Visitor: ' + toEmail + (co ? ' | ' + co : '');
    emailjs.send(EMAILJS_SVC, EMAILJS_TPL, {
      lead_id:      tid,
      lead_name:    nm,
      lead_company: co,
      lead_phone:   '+230 57984505',
      lead_notes:   note,
      profile_text: summary,
      lead_json:    JSON.stringify({ id: tid, visitor: toEmail, ts: ts }),
      timestamp:    ts,
      lead_title:   'Oracle Consultation Summary - Simpl\'IT',
      lead_email:   toEmail,
      reply_to:     'contact@simplitconsulting.com',
      cc_email:     ''
    });
  }

  // -- TRANSCRIPT ----------------------------------------------
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

  // -- CLEAR ---------------------------------------------------
  function clearChat() {
    history = []; messageCount = 0; nudgeShown = false; journeyNudged = false; leadCaptured = false;
    try { sessionStorage.removeItem(SESSION_KEY); } catch(e) {}
    emailSent = false; emailSending = false; transcriptShown = false;
    visitorName = ''; visitorEmail = ''; visitorCompany = '';
    clearTimeout(inactivityTimer);
    document.getElementById('ariaMessages').innerHTML = '';
    showWelcome();
  }

  // -- FORMAT --------------------------------------------------
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

  // -- EVENTS --------------------------------------------------
  setTimeout(function() {

    document.getElementById('ariaBubble').addEventListener('click', toggle);
    document.getElementById('ariaCloseBtn').addEventListener('click', toggle);
    document.getElementById('ariaMinBtn').addEventListener('click', function() {
      var panel = document.getElementById('ariaPanel');
      panel.classList.toggle('minimised');
      this.textContent = panel.classList.contains('minimised') ? '+' : '-';
    });
    document.getElementById('ariaClearBtn').addEventListener('click', clearChat);
    document.getElementById('ariaSendBtn').addEventListener('click', function() { send(); });

    document.getElementById('ariaInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    document.getElementById('ariaInput').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

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
      var btn = document.getElementById('ariaQrBtn');
      var rect = btn.getBoundingClientRect();
      menu.style.right     = (window.innerWidth - rect.right) + 'px';
      menu.style.top       = (rect.bottom + 6) + 'px';
      menu.style.transform = 'none';
      menu.style.display   = 'block';
    });

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

    // -- MIC ---------------------------------------------------
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var micBtn = document.getElementById('ariaMicBtn');
    if (SR) {
      var recognition = new SR();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      var isRecording = false;
      micBtn.addEventListener('click', function() {
        if (isRecording) {
          recognition.stop();
        } else {
          try { recognition.start(); } catch(e) { return; }
          isRecording = true;
          micBtn.classList.add('recording');
          micBtn.title = 'Listening... click to stop';
        }
      });
      recognition.onresult = function(e) {
        var transcript = e.results[0][0].transcript;
        document.getElementById('ariaInput').value = transcript;
        isRecording = false;
        micBtn.classList.remove('recording');
        micBtn.title = 'Voice input';
        send(transcript);
      };
      recognition.onerror = recognition.onend = function() {
        isRecording = false;
        micBtn.classList.remove('recording');
        micBtn.title = 'Voice input';
      };
    } else {
      micBtn.title = 'Voice not supported in this browser';
      micBtn.style.opacity = '0.4';
      micBtn.style.cursor = 'not-allowed';
    }

    // -- ATTACHMENT --------------------------------------------
    var attachBtn  = document.getElementById('ariaAttachBtn');
    var fileInput  = document.getElementById('ariaFileInput');
    var attachPrev = document.getElementById('ariaAttachPreview');
    var attachName = document.getElementById('ariaAttachName');
    var attachRem  = document.getElementById('ariaAttachRemove');
    attachBtn.addEventListener('click', function() { fileInput.click(); });
    fileInput.addEventListener('change', function() {
      var file = fileInput.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { alert('File too large. Max 10MB.'); return; }
      var reader = new FileReader();
      reader.onload = function(e) {
        var base64 = e.target.result.split(',')[1];
        attachedFile = { data: base64, mimeType: file.type, name: file.name };
        attachName.textContent = file.name;
        attachPrev.style.display = 'flex';
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });
    attachRem.addEventListener('click', function() {
      attachedFile = null;
      attachPrev.style.display = 'none';
      attachName.textContent = '';
    });

    setTimeout(function() {
      var dot = document.getElementById('ariaNotifDot');
      if (dot) dot.classList.remove('aria-hidden');
    }, 8000);

    // Placeholder rotation
    var placeholders = [
      'Ask me anything about Oracle...',
      'Ask about EBS to Cloud migration...',
      'Ask about implementation costs...',
      'What Oracle modules do you use?',
      'Ask about post go-live support...',
      'How can Simpl\'IT help you?'
    ];
    var phIdx = 0;
    setInterval(function() {
      var inp = document.getElementById('ariaInput');
      if (inp && inp !== document.activeElement && !inp.value) {
        phIdx = (phIdx + 1) % placeholders.length;
        inp.placeholder = placeholders[phIdx];
      }
    }, 3000);

  }, 0);

})();
