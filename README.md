# مخطط الشؤون المالية الشخصية (React + Tailwind CSS v4)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

- `src/lib/finance.js` – pure calculation logic (events, 30-day and 12-month summaries)
- `src/hooks/useStoredState.js` – localStorage-backed state
- `src/components/` – Overview, BalanceChart, Calendar, DataEditor
- Colors are CSS variables in `src/index.css` exposed to Tailwind via `@theme`; dark mode follows the system setting.

## Deploy to Vercel

```bash
npx vercel login      # once
npm run deploy:preview
npm run deploy        # production
```

Or import the Git repo in the Vercel dashboard; `vercel.json` already sets the Vite build and `dist` output.
