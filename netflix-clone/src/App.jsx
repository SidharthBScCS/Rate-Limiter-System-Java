import "./App.css";
import { useEffect, useState } from "react";
import Navigator from "./Navigator";
import HeroBanner from "./HeroBanner";
import RowSection from "./RowSection";
import Footer from "./Footer";
import LoadingSpinner from "./LoadingSpinner";
import {
  getActionMovies,
  getNetflixOriginals,
  getTopRated,
  getTrending,
} from "./api/tmdb";

const sectionConfig = [
  { title: "Trending Now", large: true, fetcher: getTrending },
  { title: "Top Rated", fetcher: getTopRated },
  { title: "Only on Netflix", fetcher: getNetflixOriginals },
  { title: "Action & Adventure", fetcher: getActionMovies },
];

function App() {
  const [sections, setSections] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
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
  }, []);

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
