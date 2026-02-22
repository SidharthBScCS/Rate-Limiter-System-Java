import "./RowSection.css";
import { imageUrl } from "./api/movies";

function RowSection({ title, movies = [], large = false }) {
  const visibleMovies = movies.slice(0, 12);

  return (
    <section className="row">
      <h3 className="row__title">{title}</h3>
      <div className="row__track">
        {visibleMovies.map((movie, index) => {
          const movieTitle = movie.title || movie.name || movie.original_title || "Untitled";
          const imagePath = large
            ? movie.poster_path || movie.backdrop_path
            : movie.backdrop_path || movie.poster_path;
          const movieImageUrl = imageUrl(imagePath);

          return (
            <article key={`${title}-${movie.id}-${index}`} className={`row__card ${large ? "row__card--large" : ""}`}>
              {movieImageUrl ? (
                <div className="row__poster" style={{ backgroundImage: `url(${movieImageUrl})` }} />
              ) : (
                <div className="row__poster row__poster--fallback" />
              )}
              <div className="row__hover">
                <p>{movieTitle}</p>
              </div>
            </article>
          );
        })}

        {visibleMovies.length === 0 ? <div className="row__empty">No titles available.</div> : null}
      </div>
    </section>
  );
}

export default RowSection;
