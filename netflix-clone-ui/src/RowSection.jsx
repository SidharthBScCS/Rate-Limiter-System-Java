import "./RowSection.css";
import { imageUrl } from "./api/movies";

function RowSection({ title, movies = [], large = false }) {
  const visibleMovies = movies.slice(0, 4);
  const isFeatured = title === "Trending Now";

  return (
    <section className={`row ${isFeatured ? "row--featured" : ""}`}>
      <div className="row__header">
        <div className="row__title-wrapper">
          <h3 className="row__title">{title}</h3>
          {isFeatured && <span className="row__title-badge">HOT</span>}
        </div>
        <button type="button" className="row__view-all" aria-label={`View all titles in ${title}`}>
          View All <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <div className="row__track-wrap">
        <div className="row__track">
          {visibleMovies.map((movie, index) => {
            const movieTitle = movie.title || movie.name || movie.original_title || "Untitled";
            const imagePath = large
              ? movie.poster_path || movie.backdrop_path
              : movie.backdrop_path || movie.poster_path;
            const movieImageUrl = imageUrl(imagePath);
            const releaseDate = movie.release_date || movie.first_air_date || "";
            const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
            const isTopRated = Number(rating) >= 8.0;

            return (
              <article
                key={`${title}-${movie.id}-${index}`}
                className={`row__card ${large ? "row__card--large" : ""}`}
              >
                {isTopRated && <span className="row__top-rank">TOP {index + 1}</span>}
                <span className="row__index">{index + 1}</span>

                {movieImageUrl ? (
                  <div
                    className="row__poster"
                    style={{ backgroundImage: `url(${movieImageUrl})` }}
                  />
                ) : (
                  <div className="row__poster row__poster--fallback" />
                )}

                <div className="row__gradient" />
                <div className="row__content">
                  <h4 className="row__title-small">{movieTitle}</h4>
                  <div className="row__meta">
                    <span className="row__year">{year || "New"}</span>
                    {rating && (
                      <span className="row__rating">
                        {rating} <span aria-hidden="true">&#9733;</span>
                      </span>
                    )}
                  </div>
                  <div className="row__quick-actions">
                    <button type="button" className="row__qa-btn" aria-label={`Play ${movieTitle}`}>
                      &#9654;
                    </button>
                    <button
                      type="button"
                      className="row__qa-btn"
                      aria-label={`Add ${movieTitle} to list`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="row__qa-btn"
                      aria-label={`More info about ${movieTitle}`}
                    >
                      &#9432;
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {visibleMovies.length === 0 && (
            <div className="row__empty">No titles available in this section</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RowSection;
