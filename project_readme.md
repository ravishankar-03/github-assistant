# Github Assistant 🚀

> **AI-Powered Triage & Workflow Automation Engine for Open-Source Maintainers.**

Maintainer Copilot reduces the triage overhead of busy open-source projects. Powered by **Google Gemini** and connected directly to the **GitHub REST API**, it automates duplicate bug clustering, screens for incomplete issue reports, summarizes pull requests, and streams real-time diagnostic progress to your dashboard via Server-Sent Events (SSE).

## 🎯 The Core Problem & What Maintainer Copilot Does

Popular open-source repositories receive dozens of new issues and pull requests every single day. Maintainers spend hours manually reading, filtering, and replying instead of building features.

**Maintainer Copilot turns hours of repetitive triage into a 2-minute automated review:**

### 1. 🔍 AI Bug Detective (Duplicate Issue Detection)

* **The Problem:** 10 different contributors report the exact same bug using completely different words (e.g., *"Login not working"* vs. *"Auth token returns 401 on refresh"*). Maintainers waste time diagnosing the same issue repeatedly.

* **The Solution:** Gemini analyzes the underlying technical symptoms across all issues, groups them into semantic clusters, identifies the canonical report, and recommends merging duplicates.

### 2. 📋 Incomplete Issue Screening (6-Point Quality Gate)

* **The Problem:** Contributors frequently submit vague reports like *"App crashes on start"* without reproduction steps, error logs, or environment details.

* **The Solution:** Automatically audits incoming issues against 6 critical completeness checks (repro steps, environment, error logs, expected behavior, minimal code sample, system info). If an issue fails, it generates a polite, actionable 1-click template asking the contributor for specific missing details.

### 3. 🔀 Smart Pull Request Risk Review

* **The Problem:** Line-by-line manual code reviews across multiple PRs create a massive maintainer bottleneck.

* **The Solution:** Ingests live PR diffs and branch targets to generate high-level blast-radius summaries, highlighting potential breaking changes and areas needing test coverage before you dive into the code.

## 🌟 Key Platform Features

* **⚡ Real-Time SSE Pipeline:** No frozen spinners. Analyses are broken into discrete stages with an animated progress bar, live terminal logs, and cancellation control.

* **🛡️ Strict Live GitHub Ingestion:** Fetches real issues, metadata, and diffs with explicit rate-limit warnings (60 req/hr unauthenticated vs. 5,000 req/hr authenticated). No silent fallbacks to mock data.

* **💬 Copilot Chat Assistant:** An interactive conversational assistant tailored for maintainer workflows and repo triage queries.

* **🔒 Explicit Demo Mode:** Safely test and explore the platform using curated mock fixtures when GitHub rate limits are reached.

## 🛠️ Architecture & Tech Stack

* **Frontend:** React, Vite, TypeScript, Tailwind CSS

* **Backend:** Node.js, Express, Server-Sent Events (`text/event-stream`)

* **AI Engine:** Google Gemini API (`@google/genai`)

* **API Integration:** GitHub REST API (`@octokit/rest`)

## 📂 Project Structure

```
├── backend/
│   ├── server.js               # Express server with SSE stream endpoint (/api/repository/stream-analyze)
│   ├── package.json            # Backend dependencies & run scripts
│   └── .env.local              # Backend environment variables (Gemini key, GitHub token)
├── frontend/
│   ├── index.html              # Frontend entry HTML
│   ├── index.tsx               # Client bootstrap entry
│   ├── App.tsx                 # Main dashboard UI shell with tab navigation
│   ├── types.ts                # Shared TypeScript interfaces (Issues, PRs, SSE Events)
│   ├── vite.config.ts          # Vite build & proxy configuration
│   ├── package.json            # Frontend dependencies & scripts
│   ├── components/
│   │   ├── Header.tsx              # Repo input, status badge, token modal trigger
│   │   ├── LiveProgressModal.tsx   # Real-time SSE progress bar, stage checklist & terminal log
│   │   ├── OverviewTab.tsx         # Health metrics, quick actions & repo overview
│   │   ├── DuplicateDetectorTab.tsx# AI semantic duplicate clusters & canonical groupings
│   │   ├── CompletenessTab.tsx     # 6-point criteria checker & one-click comment templates
│   │   ├── PrPipelineTab.tsx       # Live PR reviews, risk analysis & diff metrics
│   │   ├── CopilotChatTab.tsx      # Interactive AI maintainer assistant chat
│   │   └── TokenSettingsModal.tsx  # GitHub PAT & Demo Mode configuration modal
│   ├── hooks/
│   │   └── useStreamAnalysis.ts    # Custom hook handling EventSource SSE connection & stage transitions
│   └── services/
│       ├── githubClient.ts         # Live GitHub REST API service with rate-limit handling
│       ├── aiAnalysis.ts           # Gemini API prompt templates and triage schemas
│       └── demoFixtures.ts         # Explicit fallback demo fixtures for offline exploration
├── README.md
└── package.json

```

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `v18.0.0` or higher

* **npm** or **pnpm**

* **Google Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/)

* *(Optional)* **GitHub Personal Access Token (PAT)**: For lifting unauthenticated rate limits from 60 req/hr to 5,000 req/hr.

### Installation & Setup

#### 1. Setup Backend

Navigate to `backend/` and install dependencies:

```
cd backend
npm install

```

Configure environment variables in `backend/.env.local`:

```
PORT=REDACTED
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here # Optional: raises limit to REDACTED req/hr

```

Start the backend server:

```
npm start

```

The backend server will run on `http://localhost:REDACTED`.

#### 2. Setup Frontend

In a separate terminal, navigate to `frontend/`:

```
cd frontend
npm install
npm run dev

```

Open `http://localhost:5173` in your browser.

## 📡 Live SSE Workflow

When you click **Analyze Repository**, the client establishes an EventSource connection to `/api/repository/stream-analyze`:

| Stage | Step Identifier | Description | 
| ----- | ----- | ----- | 
| **1** | `repo_validation` | Verifies repository accessibility, retrieves star/fork counts, and checks rate-limit quota. | 
| **2** | `issue_ingestion` | Fetches active issues directly from GitHub REST API (filtering out pull requests). | 
| **3** | `pr_pipeline` | Ingests recent pull requests, base/head branches, and file diff statistics. | 
| **4** | `duplicate_detection` | Gemini analyzes issue bodies to detect semantic duplicates and canonical roots. | 
| **5** | `completeness_screening` | Screens issues against 6-point reproduction and context criteria. | 
| **6** | `finalization` | Packages the analyzed payload and renders the dashboard tabs. | 

## 🔐 Rate Limits & Explicit Demo Mode

* **Public GitHub Limit:** 60 requests/hr per IP address without a token.

* **Authenticated Limit:** 5,000 requests/hr when providing a GitHub Personal Access Token in the **Settings** modal.

* **Demo Mode:** If you do not have a token or have reached your quota, you can toggle **Demo Mode** in the Settings modal to explore Maintainer Copilot with curated sample data.

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.