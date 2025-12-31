# LeaseLens 🛡️

AI-powered lease agreement analyzer that helps renters spot hidden risks before signing.

## 🌟 Features

- **AI Analysis** - Scans every clause of your lease agreement
- **Legal Compliance** - Cross-references UK housing laws (Tenant Fees Act 2019, etc.)
- **Risk Detection** - Identifies hidden fees, unfair terms, and red flags
- **Instant Results** - Get comprehensive analysis in seconds
- **No App Required** - Web version works directly in your browser

## 🏗️ Project Structure

```
leaselens/
├── backend/          # Bun + Hono API server
│   ├── src/
│   │   ├── routes/   # API endpoints (scans, payments, user)
│   │   └── lib/      # Gemini AI, Supabase, Prisma
│   └── prisma/       # Database schema
│
├── frontend/         # React Native + Expo mobile app
│   ├── app/          # Expo Router screens
│   ├── components/   # Shared components
│   └── lib/          # API clients, utilities
│
└── web/              # Next.js 16 web application
    ├── src/
    │   ├── app/      # Pages (login, scan, results)
    │   └── components/ # UI components (Dashboard, Onboarding)
    └── public/       # Static assets
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- Supabase account
- Google AI API key (Gemini)

### Environment Variables

Create `.env` files in each directory:

```env
# backend/.env
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_AI_API_KEY=your_gemini_api_key

# web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the Backend

```bash
cd backend
bun install
bun run dev
```

### Running the Web App

```bash
cd web
bun install
bun run dev
```

### Running the Mobile App

```bash
cd frontend
bun install
bunx expo start
```

## 🛠️ Tech Stack

### Backend

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL + Prisma
- **Auth**: Supabase
- **AI**: Google Gemini

### Web

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **State**: TanStack Query

### Mobile

- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind)

## 💳 Payments

- Web: Gumroad (pay-per-scan, no subscription)
- Mobile: In-app purchases (when published)

## 📄 License

MIT

---

Built with ❤️ for renters everywhere.
