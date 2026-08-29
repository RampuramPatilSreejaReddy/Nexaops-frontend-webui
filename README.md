# NexaOps Web UI

NexaOps Web UI is a React dashboard for monitoring operational workflows. It brings together job status, SLA risk, resource usage, cost signals, active alerts, integrations, runbooks, and workspace settings in one interface.

## Tech stack

- React 18 and Vite
- Tailwind CSS
- React Router
- Axios for API communication
- Recharts and Lucide React

## Prerequisites

- Node.js 18 or newer
- npm
- A NexaOps API server (optional for the built-in demo data)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   Copy-Item .env.example .env
   ```

3. Set `VITE_API_URL` in `.env` to the API base URL. The default is `http://localhost:8000`.

4. Start the development server:

   ```bash
   npm run dev
   ```

Vite will print the local URL, typically `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates an optimized production build in `dist/`. |
| `npm run preview` | Serves the production build locally. |

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8000` | Base URL for the NexaOps backend API. |

## Features

- Filterable job-run monitoring with status and workflow views
- Dashboard metrics for success rate, incidents, SLA compliance, resource utilization, and cost
- Failed-job resolution drawer with suggested AI remediation actions
- Operational workspace areas for incidents, integrations, runbooks, and settings
- JWT-aware API client that automatically includes the stored token and signs users out after unauthorized responses
- Fallback dashboard and job data for an informative UI when the backend is unavailable

## API integration

The UI sends requests to `VITE_API_URL` and stores authentication state in browser local storage:

- `nexaops_token` — JWT sent as a Bearer token
- `nexaops_user` — signed-in user details

The frontend expects backend endpoints for authentication, jobs, and dashboard data. See `src/api/` for the client modules and request definitions.

## Docker

Build and run the development container:

```bash
docker build -t nexaops-web-ui .
docker run --rm -p 3000:3000 -e VITE_API_URL=http://host.docker.internal:8000 nexaops-web-ui
```

Then open `http://localhost:3000`.

## Project structure

```text
src/
├── api/          # Axios client and API modules
├── components/   # Navigation and sign-in UI
├── pages/        # Jobs, dashboard, and workspace screens
├── App.jsx       # Application layout and page selection
└── main.jsx      # React entry point
```

## Production build

```bash
npm run build
npm run preview
```

## License

This project is private and has no license specified.
