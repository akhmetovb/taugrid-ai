import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#7986CB",
  "#4FC3F7",
  "#4DB6AC",
  "#81C784",
  "#FFD54F",
  "#FF8A65",
  "#A1887F",
];

export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

let _client: Liveblocks | undefined;

export function getLiveblocksClient(): Liveblocks {
  if (!_client) {
    _client = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    });
  }
  return _client;
}
