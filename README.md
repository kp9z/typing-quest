# TypeQuest

A tiny 3D arcade game for practicing home-row reflexes. Type the letter on the next block to dash forward, break it, and unlock a wider set of keys as your score climbs.

## Play

```bash
npm ci
npm start
```

Open `http://localhost:5173`, select **Start quest**, then type the highlighted key. On phones and tablets, tap the target card to open the keyboard.

## What changed

- One consistent input path for physical and on-screen keyboards
- Responsive HUD and start/game-over states
- Original TypeQuest character and refreshed scene art
- Fixed target selection, player drift, resize handling, and event cleanup
- Automated tests, dependency auditing, locked Docker installs, and weekly Dependabot updates

## Development

```bash
npm test       # game-rule tests
npm run build  # production bundle
npm run check  # audit, test, and build
```

The project uses [Three.js](https://threejs.org/) and [Vite](https://vite.dev/). The game is intentionally asset-light: the scene, character, effects, and letter textures are generated in code.

## Docker

```bash
docker build -t typing-quest .
docker run --rm -p 8080:8080 typing-quest
```

Then open `http://localhost:8080`.

## License

MIT
