import "./HeroBanner.css";
import { tmdbImageUrl } from "./api/tmdb";

function HeroBanner({ movie }) {
  const title = movie?.title || movie?.name || "Featured Title";
  const description =
    movie?.overview ||
    "Discover trending stories from around the world, updated from a live movie database.";
  const backdrop = tmdbImageUrl(movie?.backdrop_path || movie?.poster_path);
  const mediaType = movie?.media_type === "tv" ? "NETFLIX SERIES" : "NETFLIX MOVIE";
  const heroStyle = backdrop ? { "--hero-bg-image": `url(${backdrop})` } : {};

  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie?.release_date
    ? new Date(movie.release_date).getFullYear()
    : movie?.first_air_date
      ? new Date(movie.first_air_date).getFullYear()
      : null;

  return (
    <section className="hero" style={heroStyle}>
      <div className="hero__overlay">
        <div className="hero__meta">
          <p className="hero__tag">{mediaType}</p>
          {rating ? <span className="hero__badge hero__badge--rating">* {rating}</span> : null}
          {year ? <span className="hero__badge">{year}</span> : null}
        </div>

        <h2 className="hero__title">{title}</h2>
        <p className="hero__description">{description}</p>

        <div className="hero__actions">
          <button className="hero__button hero__button--play">
            <span className="hero__button-content">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2L14 8L4 14V2Z" />
              </svg>
              Play
            </span>
          </button>
          <button className="hero__button hero__button--info">
            <span className="hero__button-content">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1C4.134 1 1 4.134 1 8c0 3.866 3.134 7 7 7 3.866 0 7-3.134 7-7 0-3.866-3.134-7-7-7Zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm2 7H6v-1h1V8H6V7h2v3h1V8h1v3Z" />
              </svg>
              More Info
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
