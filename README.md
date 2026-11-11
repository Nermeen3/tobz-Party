# Tobz Party

A colourful party game with **50 mini games** (20 in 2D, 30 in 3D) for up to 4 players. Play solo or 2 vs 2 teams, against bots or with friends online.

## Features

- **50 mini games:** kart races with item boxes, soccer, hockey, volleyball, sumo, laser dodging, tower stacking and more.
- **Party scoring:** 1st place gets 10 points, 2nd 8, 3rd 6, 4th 4. The most points after all rounds wins.
- **Modes:** Solo (everyone for themselves) or Teams (2 vs 2, random teams).
- **Characters:** name yourself and pick a colour, hat, glasses, cape and outfit (8 choices each).
- **Online play:** the host opens a room and friends join with a 4-letter code. Empty seats are filled by bots.
- **Kart items:** 🚀 missile, 🧨 TNT, ⚡ turbo, 🛡️ shield, 🌩️ storm.
- **Music:** every mini game has its own original tune (press **M** to mute).

## How to play

Open `index.html` in Chrome, Edge or Firefox. An internet connection is needed the first time, because the 3D engine (three.js) and the online library (PeerJS) load from a CDN.

If your browser blocks the page when opened as a file, run the small local server instead (needs [Node.js](https://nodejs.org)):

```bash
node serve.js
```

Then open http://localhost:8123.

## Controls

| Action | Keys |
| --- | --- |
| Move | WASD or arrow keys |
| Action / jump / use item | Space |
| Second action | Shift |
| Back to lobby | Esc |
| Music on/off | M |

A gamepad also works.

## Put it online with GitHub Pages

1. Create a new repository on GitHub and upload all the files from this folder (keep the `js` folder).
2. Go to **Settings → Pages**.
3. Under **Branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute your game is live at `https://<your-username>.github.io/<repo-name>/`. Share that link with friends so everyone can play online together.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page, menus and styles |
| `js/core.js` | Shared helpers, physics and sound effects |
| `js/chars.js` | Characters and skins |
| `js/g3.js` | 3D drawing layer |
| `js/music.js` | Music for each mini game |
| `js/games2d.js` | The 20 2D mini games |
| `js/games3d_a.js`, `js/games3d_b.js` | The 30 3D mini games |
| `js/main.js` | Menus, party flow, online play |
| `serve.js` | Optional local web server |
