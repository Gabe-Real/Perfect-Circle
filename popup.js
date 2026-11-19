const $ = (id) => document.getElementById(id);
const wobble = $("wobble"), speed = $("speed");
const wobbleVal = $("wobbleVal"), speedVal = $("speedVal");
const btn = $("draw"), msg = $("msg");

function show() {
  wobbleVal.textContent = wobble.value === "0" ? "0 (flawless)" : wobble.value;
  speedVal.textContent = (speed.value / 1000).toFixed(1) + "s";
}

chrome.storage.local.get({ wobble: 0, speed: 900 }, (s) => {
  wobble.value = s.wobble; speed.value = s.speed; show();
});
wobble.addEventListener("input", () => { show(); chrome.storage.local.set({ wobble: Number(wobble.value) }); });
speed.addEventListener("input", () => { show(); chrome.storage.local.set({ speed: Number(speed.value) }); });

btn.addEventListener("click", () => {
  btn.disabled = true; msg.className = "msg"; msg.textContent = "Drawing…";
  chrome.runtime.sendMessage({ type: "draw" }, (res) => {
    btn.disabled = false;
    if (res && res.ok) { msg.textContent = "Done."; }
    else { msg.className = "msg err"; msg.textContent = (res && res.error) || "Something went wrong."; }
  });
});
