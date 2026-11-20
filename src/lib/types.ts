import type { Timestamp } from "firebase/firestore";

export type Game = {
  id: string;
  title: string;
  description: string;
  controls?: string;
  category: string;
  tags: string[];
  kind: "html" | "link";
  url?: string;
  thumbnail?: string; // base64 data URL
  featured?: boolean;
  needsStorage?: boolean; // grants allow-same-origin so the game can use localStorage
  likeCount: number;
  playCount: number;
  createdAt?: Timestamp;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  createdAt?: Timestamp;
};

export type ChangeKind = "added" | "improved" | "fixed" | "removed";
export type Changelog = {
  id: string;
  version: string;
  title: string;
  summary?: string;
  entries: { kind: ChangeKind; text: string }[];
  createdAt?: Timestamp;
};

export type Block =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "link"; label: string; url: string }
  | { type: "embed"; url: string; height?: number };

export type Page = {
  id: string; // slug
  title: string;
  blocks: Block[];
  inNav?: boolean;
  updatedAt?: Timestamp;
};

export type Comment = {
  id: string;
  uid: string;
  name: string;
  text: string;
  createdAt?: Timestamp;
};
