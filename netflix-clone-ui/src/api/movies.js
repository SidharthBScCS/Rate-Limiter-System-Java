const BACKEND_BASE_URL = import.meta.env.VITE_NETFLIX_AUTH_BASE_URL || "";

async function fetchMovies(path) {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (response.status === 429) {
    throw new Error(payload.message || payload.status_message || "Too Many Requests");
  }
  if (response.status === 401) {
    throw new Error(payload.message || payload.status_message || "Not authenticated");
  }
  if (!response.ok) {
    throw new Error(payload.message || payload.status_message || `Movies request failed: ${response.status}`);
  }

  return (payload.results || []).filter(
    (item) => item && (item.backdrop_path || item.poster_path),
  );
}

async function fetchHomeMovies() {
  const response = await fetch(`${BACKEND_BASE_URL}/api/movies/home`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (response.status === 429) {
    throw new Error(payload.message || payload.status_message || "Too Many Requests");
  }
  if (response.status === 401) {
    throw new Error(payload.message || payload.status_message || "Not authenticated");
  }
  if (!response.ok) {
    throw new Error(payload.message || payload.status_message || `Movies request failed: ${response.status}`);
  }

  return {
    trending: (payload.trending || []).filter((item) => item && (item.backdrop_path || item.poster_path)),
    topRated: (payload.topRated || []).filter((item) => item && (item.backdrop_path || item.poster_path)),
    netflixOriginals: (payload.netflixOriginals || []).filter(
      (item) => item && (item.backdrop_path || item.poster_path),
    ),
    action: (payload.action || []).filter((item) => item && (item.backdrop_path || item.poster_path)),
    comedy: (payload.comedy || []).filter((item) => item && (item.backdrop_path || item.poster_path)),
    horror: (payload.horror || []).filter((item) => item && (item.backdrop_path || item.poster_path)),
    romance: (payload.romance || []).filter((item) => item && (item.backdrop_path || item.poster_path)),
    documentaries: (payload.documentaries || []).filter(
      (item) => item && (item.backdrop_path || item.poster_path),
    ),
  };
}

export const imageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return "";
};

export const getTrending = () => fetchMovies("/api/movies/trending");
export const getTopRated = () => fetchMovies("/api/movies/top-rated");
export const getNetflixOriginals = () => fetchMovies("/api/movies/netflix-originals");
export const getActionMovies = () => fetchMovies("/api/movies/action");
export const getComedyMovies = () => fetchMovies("/api/movies/comedy");
export const getHorrorMovies = () => fetchMovies("/api/movies/horror");
export const getRomanceMovies = () => fetchMovies("/api/movies/romance");
export const getDocumentaryMovies = () => fetchMovies("/api/movies/documentaries");
export const getPremiumMovies = () => fetchMovies("/api/movies/premium");
export const getHomeMovies = () => fetchHomeMovies();
