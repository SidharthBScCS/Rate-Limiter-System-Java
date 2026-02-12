import "./App.css";
import { useEffect, useState } from "react";
import Navigator from "./Navigator";
import HeroBanner from "./HeroBanner";
import RowSection from "./RowSection";
import Footer from "./Footer";
import LoadingSpinner from "./LoadingSpinner";
import LandingPage from "./LandingPage";
import { fetchMe, loginUser, logoutUser, registerUser } from "./api/auth";
import {
  getHomeMovies,
} from "./api/movies";

const AUTH_STORAGE_KEY = "netflix_clone_auth_user";

const sectionConfig = [
  { title: "Trending Now", large: true, key: "trending" },
  { title: "Top Rated", key: "topRated" },
  { title: "Only on Netflix", key: "netflixOriginals" },
  { title: "Action & Adventure", key: "action" },
];

function readStoredUser() {
  try {
    const value = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.name || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sections, setSections] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = readStoredUser();
        if (stored) {
          setCurrentUser(stored);
        }

        const user = await fetchMe();
        const authenticatedUser = {
          name: user.fullName,
          email: user.email,
          mode: "login",
        };
        setCurrentUser(authenticatedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (!currentUser || isCheckingAuth) {
      return;
    }

    async function loadMovies() {
      try {
        setError("");
        setIsLoading(true);

        const movieBundle = await getHomeMovies();
        const results = sectionConfig.map((section) => ({
          title: section.title,
          large: section.large,
          movies: movieBundle[section.key] || [],
        }));

        setSections(results);
        const heroSource = results[0]?.movies || [];
        const hero =
          heroSource.find((movie) => movie.backdrop_path || movie.poster_path) ||
          heroSource[0] ||
          null;
        setHeroMovie(hero);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load movies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, [currentUser, isCheckingAuth]);

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const handleLogin = async ({ email, password }) => {
    const user = await loginUser({ email, password });
    handleAuthenticated({
      name: user.fullName,
      email: user.email,
      mode: "login",
    });
  };

  const handleRegister = async ({ fullName, email, password }) => {
    const user = await registerUser({ fullName, email, password });
    handleAuthenticated({
      name: user.fullName,
      email: user.email,
      mode: "login",
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Force local logout even when the backend session already expired.
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setCurrentUser(null);
      setSections([]);
      setHeroMovie(null);
      setActiveNav("Home");
      setError("");
    }
  };

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="app">
      <Navigator
        activeNav={activeNav}
        onNavClick={handleNavClick}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="app__content">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <HeroBanner movie={heroMovie} />
            {error ? (
              <div className="app__error">
                {error}
                <button className="app__retry" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : null}
            {sections.map((section) => (
              <RowSection
                key={section.title}
                title={section.title}
                movies={section.movies}
                large={section.large}
              />
            ))}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
