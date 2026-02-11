import "./RowSection.css";
import { tmdbImageUrl } from "./api/tmdb";

function RowSection({ title, movies = [], large = false }) {
  const visibleMovies = movies.slice(0, 4);

  return (
    <section className="row">
      <h3 className="row__title">{title}</h3>
      <div className="row__track">
        {visibleMovies.map((movie, index) => {
          const movieTitle =
            movie.title || movie.name || movie.original_title || "Untitled";
          const imagePath = movie.backdrop_path || movie.poster_path;
          const imageUrl = tmdbImageUrl(imagePath);
          const releaseDate = movie.release_date || movie.first_air_date || "";
          const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
          const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

          return (
            <article
              key={`${title}-${movie.id || movieTitle}-${index}`}
              className={`row__card ${large ? "row__card--large" : ""}`}
            >
              {imageUrl ? (
                <div
                  className="row__poster"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                <div className="row__poster row__poster--fallback" />
              )}

              <div className="row__gradient" />
              <h4>{movieTitle}</h4>
              <div className="row__meta">
                <span>{year || "New"}</span>
                {rating ? <span className="row__rating">* {rating}</span> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RowSection;
