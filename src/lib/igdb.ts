import "server-only";

export type GameSummary = {
  id: number;
  slug: string;
  name: string;
  summary: string | null;
  coverUrl: string | null;
  releaseDate: string | null;
  genres: string[];
  platforms: string[];
  rating: number | null;
  popularity: number | null;
};

type IgdbGame = {
  id: number;
  slug?: string;
  name: string;
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
  total_rating_count?: number;
  version_parent?: number;
  game_type?: number;
  cover?: { image_id: string };
  genres?: { name: string }[];
  platforms?: { name: string }[];
};

type TokenState = {
  value: string;
  expiresAt: number;
};

let tokenState: TokenState | null = null;

export const fallbackGames: GameSummary[] = [
  {
    id: 121,
    slug: "minecraft",
    name: "Minecraft",
    summary:
      "Build, explore, and survive in a world made entirely from blocks.",
    coverUrl: null,
    releaseDate: "2011-11-18T00:00:00.000Z",
    genres: ["Adventure", "Sandbox"],
    platforms: ["PC", "Console", "Mobile"],
    rating: 84,
    popularity: 100,
  },
  {
    id: 119133,
    slug: "elden-ring",
    name: "Elden Ring",
    summary:
      "Rise, Tarnished, and journey through the Lands Between in a vast action RPG.",
    coverUrl: null,
    releaseDate: "2022-02-25T00:00:00.000Z",
    genres: ["RPG", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    rating: 94,
    popularity: 98,
  },
  {
    id: 119171,
    slug: "baldurs-gate-3",
    name: "Baldur's Gate 3",
    summary:
      "Gather your party and return to the Forgotten Realms in a story-rich RPG.",
    coverUrl: null,
    releaseDate: "2023-08-03T00:00:00.000Z",
    genres: ["RPG", "Strategy"],
    platforms: ["PC", "PlayStation", "Xbox"],
    rating: 96,
    popularity: 96,
  },
  {
    id: 113112,
    slug: "hades",
    name: "Hades",
    summary:
      "Defy the god of the dead as you hack and slash out of the Underworld.",
    coverUrl: null,
    releaseDate: "2020-09-17T00:00:00.000Z",
    genres: ["Roguelike", "Action"],
    platforms: ["PC", "Console"],
    rating: 93,
    popularity: 94,
  },
  {
    id: 251950,
    slug: "balatro",
    name: "Balatro",
    summary:
      "A hypnotically satisfying poker-inspired deckbuilder about powerful synergies.",
    coverUrl: null,
    releaseDate: "2024-02-20T00:00:00.000Z",
    genres: ["Card Game", "Roguelike"],
    platforms: ["PC", "Console", "Mobile"],
    rating: 91,
    popularity: 93,
  },
  {
    id: 17000,
    slug: "stardew-valley",
    name: "Stardew Valley",
    summary:
      "Turn an overgrown field into a thriving farm and become part of a small town.",
    coverUrl: null,
    releaseDate: "2016-02-26T00:00:00.000Z",
    genres: ["Simulator", "RPG"],
    platforms: ["PC", "Console", "Mobile"],
    rating: 90,
    popularity: 91,
  },
  {
    id: 1942,
    slug: "hollow-knight",
    name: "Hollow Knight",
    summary:
      "Descend into a beautifully ruined kingdom of insects and heroes.",
    coverUrl: null,
    releaseDate: "2017-02-24T00:00:00.000Z",
    genres: ["Platform", "Adventure"],
    platforms: ["PC", "Console"],
    rating: 90,
    popularity: 89,
  },
  {
    id: 24919,
    slug: "celeste",
    name: "Celeste",
    summary:
      "Help Madeline survive her inner demons on a journey to the top of Celeste Mountain.",
    coverUrl: null,
    releaseDate: "2018-01-25T00:00:00.000Z",
    genres: ["Platform", "Indie"],
    platforms: ["PC", "Console"],
    rating: 91,
    popularity: 87,
  },
  {
    id: 27220,
    slug: "disco-elysium",
    name: "Disco Elysium",
    summary:
      "Become a singular detective in a groundbreaking open-world role-playing game.",
    coverUrl: null,
    releaseDate: "2019-10-15T00:00:00.000Z",
    genres: ["RPG", "Adventure"],
    platforms: ["PC", "Console"],
    rating: 92,
    popularity: 85,
  },
  {
    id: 11133,
    slug: "outer-wilds",
    name: "Outer Wilds",
    summary:
      "Explore a solar system trapped in an endless time loop and uncover its mystery.",
    coverUrl: null,
    releaseDate: "2019-05-28T00:00:00.000Z",
    genres: ["Adventure", "Puzzle"],
    platforms: ["PC", "Console"],
    rating: 89,
    popularity: 83,
  },
  {
    id: 7346,
    slug: "the-legend-of-zelda-breath-of-the-wild",
    name: "The Legend of Zelda: Breath of the Wild",
    summary:
      "Step into a world of discovery, exploration, and adventure across Hyrule.",
    coverUrl: null,
    releaseDate: "2017-03-03T00:00:00.000Z",
    genres: ["Adventure", "Action"],
    platforms: ["Nintendo Switch", "Wii U"],
    rating: 97,
    popularity: 82,
  },
  {
    id: 26758,
    slug: "red-dead-redemption-2",
    name: "Red Dead Redemption 2",
    summary:
      "An epic tale of life in America's unforgiving heartland at the dawn of a new age.",
    coverUrl: null,
    releaseDate: "2018-10-26T00:00:00.000Z",
    genres: ["Adventure", "Shooter"],
    platforms: ["PC", "PlayStation", "Xbox"],
    rating: 96,
    popularity: 80,
  },
];

function hasCredentials() {
  return Boolean(process.env.IGDB_CLIENT_ID && process.env.IGDB_CLIENT_SECRET);
}

async function getAccessToken() {
  if (tokenState && tokenState.expiresAt > Date.now() + 60_000) {
    return tokenState.value;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("IGDB is not configured.");

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not authenticate with IGDB.");

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenState = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return tokenState.value;
}

async function queryIgdb(body: string) {
  const clientId = process.env.IGDB_CLIENT_ID;
  if (!clientId) throw new Error("IGDB is not configured.");
  const token = await getAccessToken();

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    },
    body,
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error(`IGDB returned ${response.status}.`);
  return (await response.json()) as IgdbGame[];
}

const fields =
  "fields id,slug,name,summary,first_release_date,total_rating,total_rating_count,version_parent,game_type,cover.image_id,genres.name,platforms.name;";

function isStandaloneListing(game: IgdbGame) {
  return game.version_parent == null && game.game_type !== 14;
}

function logFallback(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown IGDB error";
  console.warn(`${context}: ${message}`);
}

export function normalizeIgdbGame(game: IgdbGame): GameSummary {
  return {
    id: game.id,
    slug: game.slug ?? String(game.id),
    name: game.name,
    summary: game.summary ?? null,
    coverUrl: game.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null,
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString()
      : null,
    genres: game.genres?.map((genre) => genre.name).slice(0, 3) ?? [],
    platforms:
      game.platforms?.map((platform) => platform.name).slice(0, 5) ?? [],
    rating: game.total_rating ?? null,
    popularity: game.total_rating_count ?? null,
  };
}

export async function getPopularGames() {
  if (!hasCredentials()) return fallbackGames;

  try {
    const games = await queryIgdb(
      `${fields} where cover != null & total_rating_count > 50; sort total_rating_count desc; limit 30;`,
    );
    return games.filter(isStandaloneListing).slice(0, 12).map(normalizeIgdbGame);
  } catch (error) {
    logFallback("IGDB popular games fallback", error);
    return fallbackGames;
  }
}

export async function searchGames(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  if (!hasCredentials()) {
    const lowerQuery = normalizedQuery.toLowerCase();
    return fallbackGames.filter((game) =>
      `${game.name} ${game.genres.join(" ")}`.toLowerCase().includes(lowerQuery),
    );
  }

  try {
    const escaped = normalizedQuery.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
    const games = await queryIgdb(
      `search "${escaped}"; ${fields} where cover != null; limit 100;`,
    );
    return games.filter(isStandaloneListing).slice(0, 20).map(normalizeIgdbGame);
  } catch (error) {
    logFallback("IGDB search fallback", error);
    return [];
  }
}

export async function getGame(gameId: number) {
  const fallback = fallbackGames.find((game) => game.id === gameId) ?? null;
  if (!hasCredentials()) return fallback;

  try {
    const games = await queryIgdb(`${fields} where id = ${gameId}; limit 1;`);
    return games[0] ? normalizeIgdbGame(games[0]) : fallback;
  } catch (error) {
    logFallback("IGDB game fallback", error);
    return fallback;
  }
}
