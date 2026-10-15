# TechNest Care

- `frontend/` — React + Vite + TypeScript (deploy to Vercel, root directory `frontend`)
- `backend/` — Express API using Supabase (deploy to Render, root directory `backend`)

## Local development

```bash
# terminal 1
cd backend && cp .env.example .env && npm install && npm run dev   # http://localhost:4000

# terminal 2
cd frontend && cp .env.example .env.local && npm install && npm run dev   # http://localhost:5173
```

Fill in the Supabase values in both env files. Run the SQL in `backend/sql/` in order in the Supabase SQL editor.
