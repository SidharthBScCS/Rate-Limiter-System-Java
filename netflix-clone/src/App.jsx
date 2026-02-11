import "./App.css";
import { useEffect, useState } from "react";
import Navigator from "./Navigator";
import HeroBanner from "./HeroBanner";
import RowSection from "./RowSection";
import Footer from "./Footer";
import LoadingSpinner from "./LoadingSpinner";
import LandingPage from "./LandingPage";
import { loginUser, registerUser } from "./api/auth";
import {
  getActionMovies,
  getNetflixOriginals,
  getTopRated,
  getTrending,
} from "./api/tmdb";

const AUTH_STORAGE_KEY = "netflix_clone_auth_user";

const sectionConfig = [
  { title: "Trending Now", large: true, fetcher: getTrending },
  { title: "Top Rated", fetcher: getTopRated },
  { title: "Only on Netflix", fetcher: getNetflixOriginals },
  { title: "Action & Adventure", fetcher: getActionMovies },
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
  const [currentUser, setCurrentUser] = useState(() => readStoredUser());
  const [sections, setSections] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    async function loadMovies() {
      try {
        setError("");
        setIsLoading(true);

        const results = await Promise.all(
          sectionConfig.map(async (section) => ({
            title: section.title,
            large: section.large,
            movies: await section.fetcher(),
          })),
        );

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
  }, [currentUser]);

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

  const handleGuest = () => {
    handleAuthenticated({
      name: "Guest",
      email: "guest@local",
      mode: "guest",
    });
  };

  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} onRegister={handleRegister} onGuest={handleGuest} />;
  }

  return (
    <div className="app">
      <Navigator activeNav={activeNav} onNavClick={handleNavClick} />
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
