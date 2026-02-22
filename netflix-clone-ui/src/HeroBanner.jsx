import "./HeroBanner.css";
import { imageUrl } from "./api/movies";

function HeroBanner({ movie }) {
  const title = movie?.title || movie?.name || "Featured Title";
  const description =
    movie?.overview ||
    "Discover trending stories from around the world, updated from a live movie database.";
  const backdrop = imageUrl(movie?.backdrop_path || movie?.poster_path);
  const heroStyle = backdrop ? { "--hero-bg-image": `url(${backdrop})` } : {};

  return (
    <section className="hero" style={heroStyle}>
      <div className="hero__overlay">
        <p className="hero__meta">NETFLIX ORIGINAL</p>
        <h2 className="hero__title">{title}</h2>
        <p className="hero__description">{description}</p>
        <div className="hero__actions">
          <button type="button" className="hero__button hero__button--play">
            Play
          </button>
          <button type="button" className="hero__button hero__button--info">
            More Info
          </button>
        </div>
      </div>
      <div className="hero__fade-bottom" />
    </section>
  );
}

export default HeroBanner;
