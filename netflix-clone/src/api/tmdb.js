const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const RATE_LIMITER_BASE_URL = import.meta.env.VITE_RATE_LIMITER_BASE_URL || "";
const RATE_LIMITER_API_KEY = import.meta.env.VITE_RATE_LIMITER_API_KEY || "";

function buildUrl(path, params = {}) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const searchParams = new URLSearchParams({
    api_key: apiKey || "",
    language: "en-US",
    ...params,
  });

  return `${TMDB_BASE_URL}${path}?${searchParams.toString()}`;
}

async function fetchMovies(path, params) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_TMDB_API_KEY in environment variables.");
  }

  await checkRateLimit();

  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []).filter(
    (item) => item && (item.backdrop_path || item.poster_path),
  );
}

export const tmdbImageUrl = (path) => {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE_URL}${path}`;
};

export const getTrending = () => fetchMovies("/trending/movie/week");
export const getTopRated = () => fetchMovies("/movie/top_rated");
export const getNetflixOriginals = () =>
  fetchMovies("/discover/tv", {
    with_networks: "213",
    sort_by: "popularity.desc",
  });
export const getActionMovies = () =>
  fetchMovies("/discover/movie", {
    with_genres: "28",
    sort_by: "popularity.desc",
  });

async function checkRateLimit() {
  if (!RATE_LIMITER_BASE_URL || !RATE_LIMITER_API_KEY) {
    return;
  }

  const response = await fetch(`${RATE_LIMITER_BASE_URL}/api/ratelimit/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": RATE_LIMITER_API_KEY,
    },
  });

  if (response.status === 429) {
    throw new Error("Rate limit exceeded. Please wait and retry.");
  }

  if (!response.ok) {
    throw new Error(`Rate limiter request failed: ${response.status}`);
  }
}
