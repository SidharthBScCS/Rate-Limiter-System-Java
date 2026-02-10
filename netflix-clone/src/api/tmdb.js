const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

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
