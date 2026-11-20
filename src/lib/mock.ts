// Dev/preview fixtures. Only used when the build is made with NEXT_PUBLIC_MOCK=1.
import type { Timestamp } from "firebase/firestore";
import type { Game, Announcement, Changelog, Page } from "./types";
import { SAMPLES } from "./samples";

export const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";
const ts = (daysAgo: number) => ({ toDate: () => new Date(Date.now() - daysAgo * 864e5) }) as unknown as Timestamp;

const rows: [string, string, number, number][] = [
  ["Green Snake", "Arcade", 42, 1310], ["Memory Match", "Puzzle", 31, 980], ["Tile Tumble", "Puzzle", 18, 540],
  ["Block Blitz", "Action", 27, 870], ["Orbit Run", "Platformer", 9, 310], ["Pixel Pong", "Sports", 22, 760],
  ["Lava Leap", "Platformer", 35, 1120], ["Word Wiggle", "Puzzle", 12, 420], ["Turbo Drift", "Racing", 51, 1900],
  ["Slime Siege", "Strategy", 7, 240], ["Cookie Factory", "Idle", 15, 610], ["Court Kings", "Sports", 11, 380],
  ["Dungeon Dash", "Action", 29, 940], ["Sky Sweeper", "Arcade", 6, 190], ["Hex Harvest", "Strategy", 4, 120], ["Zig Zag Zoom", "Racing", 19, 650],
];
export const MOCK_GAMES: Game[] = rows.map(([title, category, likeCount, playCount], i) => ({
  id: `g${i}`, title, category, likeCount, playCount, kind: "html", tags: [category.toLowerCase(), "free"],
  description: `${title} is a quick browser game. Jump in, play a round, beat your best.`, controls: "Arrow keys or WASD to move. Space for action.",
  featured: i === 8, createdAt: ts(i * 2),
}));
export const MOCK_NEWS: Announcement[] = [
  { id: "n1", title: "Fullscreen button is live", body: "Every game now has a real fullscreen button. Works on phones too.", pinned: true, createdAt: ts(1) },
  { id: "n2", title: "Six new games this week", body: "Racing and strategy games are in. Tell me what to add next in the comments.", createdAt: ts(4) },
];
export const MOCK_LOGS: Changelog[] = [
  { id: "c1", version: "1.2", title: "Search and shelves", summary: "Finding games is much faster now.", createdAt: ts(2), entries: [{ kind: "added", text: "Live search suggestions in the top bar" }, { kind: "improved", text: "Game page layout, bigger player" }, { kind: "fixed", text: "Likes not saving on some accounts" }] },
  { id: "c0", version: "1.1", title: "Comments", createdAt: ts(9), entries: [{ kind: "added", text: "Comments on every game" }, { kind: "removed", text: "Old ad slot" }] },
];
export const MOCK_PAGES: Page[] = [{ id: "about", title: "About", inNav: true, blocks: [{ type: "heading", text: "About this site" }, { type: "text", text: "Free browser games, no installs. Made for the break between classes." }] }];
export const MOCK_HTML = SAMPLES[0].html;
