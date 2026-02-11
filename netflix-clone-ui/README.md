# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Rate Limiter Integration

To route Netflix clone requests through your distributed rate limiter, add a `.env` file in `netflix-clone`:

```env
VITE_TMDB_API_KEY=your_tmdb_key
VITE_RATE_LIMITER_BASE_URL=http://localhost:8080
VITE_RATE_LIMITER_API_KEY=api_key_generated_in_rate_limiter_ui
```

Behavior:

- If `VITE_RATE_LIMITER_BASE_URL` and `VITE_RATE_LIMITER_API_KEY` are set, each movie fetch first calls `POST /api/ratelimit/check` on the limiter backend.
- If the limiter returns `429`, the UI shows a rate-limit error.
- If limiter env vars are missing, the clone falls back to direct TMDB calls.
