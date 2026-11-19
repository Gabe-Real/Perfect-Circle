# Perfect Circle Bot

A joke Chrome extension that draws a near-perfect circle on
[neal.fun's Draw a Perfect Circle](https://neal.fun/perfect-circle/).

Made for a video. It's a bot, so the score isn't a real one.

## Install

1. Download or clone this repo.
2. Go to `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this folder.

## Use

1. Open https://neal.fun/perfect-circle/
2. Click the extension icon and press **Draw circle**, or press **Alt + Shift + C**.

- **Wobble** — 0 is flawless. Turn it up a little for a more believable 96–99%.
- **Draw time** — how long the circle takes to draw.

## Notes

- It uses Chrome's debugger API to send real mouse movements, so Chrome
  shows a "started debugging this browser" bar at the top while it draws.
- Close DevTools on that tab first, or it can't attach.
- Only runs on neal.fun/perfect-circle.
