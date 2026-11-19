// draws a perfect circle using chrome's debugger api, so to the page sees it like a normal mouse drag lol

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getSettings() {
  const s = await chrome.storage.local.get({ wobble: 0, speed: 900 });
  return { wobble: Number(s.wobble) || 0, speed: Number(s.speed) || 900 };
}

function measurePage() {
  const canvases = [...document.querySelectorAll("canvas")];
  let rect = null;
  for (const c of canvases) {
    const r = c.getBoundingClientRect();
    if (r.width > 200 && r.height > 200 && (!rect || r.width * r.height > rect.width * rect.height)) rect = r;
  }
  if (!rect) rect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  return {
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2,
    size: Math.min(rect.width, rect.height, window.innerWidth, window.innerHeight)
  };
}

function buildPoints(cx, cy, radius, wobble) {
  const amp = (wobble / 100) * radius * 0.06;
  const p1 = Math.random() * Math.PI * 2, p2 = Math.random() * Math.PI * 2;
  const start = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
  const total = Math.PI * 2 + 0.12;
  const steps = 140;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = start + (total * i) / steps;
    const r = radius + amp * (0.6 * Math.sin(2 * t + p1) + 0.4 * Math.sin(3 * t + p2));
    pts.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
  }
  return pts;
}

async function drawOnTab(tabId) {
  const [{ result: m }] = await chrome.scripting.executeScript({ target: { tabId }, func: measurePage });
  const { wobble, speed } = await getSettings();
  const radius = Math.max(110, m.size * 0.32);
  const pts = buildPoints(m.cx, m.cy, radius, wobble);
  const delay = Math.max(2, Math.round(speed / pts.length));

  const target = { tabId };
  await chrome.debugger.attach(target, "1.3");
  const send = (type, p, extra = {}) =>
    chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
      type, x: p.x, y: p.y, button: "left", clickCount: 1, ...extra
    });

  try {
    await send("mouseMoved", pts[0], { buttons: 0, button: "none" });
    await send("mousePressed", pts[0], { buttons: 1 });
    for (let i = 1; i < pts.length; i++) {
      await send("mouseMoved", pts[i], { buttons: 1 });
      await sleep(delay);
    }
    await send("mouseReleased", pts[pts.length - 1], { buttons: 0 });
  } finally {
    await sleep(50);
    try { await chrome.debugger.detach(target); } catch (e) {}
  }
}

async function run() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || !tab.url.startsWith("https://neal.fun/perfect-circle")) {
    return { ok: false, error: "Open neal.fun/perfect-circle first." };
  }
  try {
    await drawOnTab(tab.id);
    return { ok: true };
  } catch (e) {
    const msg = String(e && e.message || e);
    if (msg.includes("Another debugger")) return { ok: false, error: "Close DevTools on that tab, then try again." };
    return { ok: false, error: msg };
  }
}

chrome.commands.onCommand.addListener((cmd) => { if (cmd === "draw-circle") run(); });
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg && msg.type === "draw") { run().then(reply); return true; }
});
