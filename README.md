# Petra International Grants Dashboard

International grants discovery and management dashboard for Petra Christian University (Universitas Kristen Petra). A single-page web application that helps faculty and staff browse, filter, and track international grant opportunities, with an administrative console for managing the grant catalog.

## Features

- **Dashboard** — overview of active opportunities, deadlines, and key metrics
- **Browse Grants** — searchable, filterable catalog of international grants
- **Calendar** — deadline-driven calendar view
- **By Faculty** — grants grouped by faculty / discipline
- **Grant Matching** — surface relevant opportunities based on profile
- **Bookmarks** — save grants of interest
- **Analytics** — charts and aggregated insights (powered by Chart.js)
- **Admin Console** — manage grants, archive entries, view activity log
- **Dark mode**, mobile-responsive layout, global search with suggestions, toast notifications

## Tech Stack

- HTML + vanilla JavaScript (no build step)
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- [Chart.js](https://www.chartjs.org/) for analytics charts
- [Lucide](https://lucide.dev/) icon set
- [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

## Project Structure

```
.
├── index.html         # App shell, layout, modals
├── css/
│   └── style.css      # Custom styles on top of Tailwind
├── js/
│   └── main.js        # Application logic, routing, rendering
├── data/
│   └── database.json  # Grants catalog and seed data
└── assets/            # Static assets
```

## Running Locally

The app is fully static. Serve the project root with any static file server, for example:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

Then open `http://localhost:8000` in a browser.

> Opening `index.html` directly via `file://` may fail to load `data/database.json` due to browser CORS rules — use a local server.

## Administration

Use the **Admin Login** link in the sidebar to access the admin console, manage grants, browse the archive, and view the activity log.

---

© Universitas Kristen Petra · International Office
