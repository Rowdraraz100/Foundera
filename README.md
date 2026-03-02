# Foundera — Startup Ecosystem Platform

> **World's First Integrated Platform** connecting **Founders**, **Job Seekers** & **Investors** in one single ecosystem.

---

## 🚀 Overview

Foundera is a web-based startup ecosystem platform that brings together three key players of the startup world:

- **Founders** — Share startup ideas, build teams, create roadmaps, and find investors.
- **Job Seekers** — Discover exciting startup opportunities, apply for roles, and connect with founders.
- **Investors** — Explore promising startups, manage portfolios, and track watchlists.

Each user role gets a dedicated, feature-rich dashboard with real-time data management.

---

## 📁 Project Structure

```
FOUNDERAAI/
├── index.html              # Landing page + Auth (SPA)
├── founder.html            # Founder Dashboard
├── investor.html           # Investor Dashboard
├── jobseeker.html          # Job Seeker Dashboard
├── blog.html               # Blog page
├── about-us.html           # About Us page
├── success-stories.html    # Success Stories page
├── README.md               # Project documentation
│
├── css/
│   ├── common.css          # Shared styles (animations, preloader, navbar, utilities)
│   ├── founder.css         # Founder dashboard styles
│   ├── investor.css        # Investor dashboard styles
│   └── jobseeker.css       # Job seeker dashboard styles
│
├── js/
│   ├── home.js             # Index page SPA logic (auth, views, navigation, rendering)
│   ├── founder.js          # Founder dashboard logic
│   ├── investor.js         # Investor dashboard logic
│   ├── jobseeker.js        # Job seeker dashboard logic
│   ├── navbar.js           # Shared mobile navigation drawer (standalone pages)
│   └── preloader.js        # Shared preloader dismiss script
│
└── images/
    └── founderaLogo.jpeg   # Brand logo / favicon
```

---

## 🛠️ Tech Stack

| Technology       | Purpose                                    |
| ---------------- | ------------------------------------------ |
| **HTML5**        | Semantic page structure                    |
| **Tailwind CSS** | Utility-first styling (CDN)                |
| **Vanilla JS**   | SPA routing, state management, DOM updates |
| **Firebase**     | Authentication, Realtime Database, Analytics |
| **Google Sign-In** | OAuth 2.0 social login                   |
| **Lucide Icons** | SVG icon library                           |
| **Inter Font**   | Google Fonts typography                    |

---

## 📄 Pages

### Landing Page (`index.html`)
- **Single Page Application (SPA)** — state-based rendering with `render()` function
- Hero section with animated orbit visualization
- "Dream to Reality" feature cards
- Vision & Mission section
- "How it Works" step-by-step guide
- Synergy section showing how founders, seekers, and investors connect
- Login / Sign Up forms with email + Google OAuth
- Role selection modal for Google sign-ups

### Founder Dashboard (`founder.html`)
- Sidebar navigation with collapsible mobile menu
- **Overview** — stats cards, recent ideas, quick actions
- **My Ideas** — list, detail view, post new idea
- **Roadmap** — startup progress tracking
- **Find Talent** — browse job seekers by skills
- **Investors** — discover potential investors
- **Profile** — edit founder profile & settings

### Investor Dashboard (`investor.html`)
- Sidebar navigation (indigo theme) with mobile toggle
- **Overview** — portfolio summary, market insights
- **Explore Startups** — browse and filter startups
- **Portfolio** — track invested startups
- **Watchlist** — save interesting startups
- **Founders** — connect with founders directly
- **Profile** — investor profile management

### Job Seeker Dashboard (`jobseeker.html`)
- Sidebar navigation (green theme) with mobile toggle
- **Overview** — job recommendations, stats
- **Jobs** — search and filter job listings
- **Applications** — track application status
- **Saved Jobs** — bookmarked opportunities
- **Founders** — discover startup founders
- **Profile** — resume, skills, experience, certificates

### Static Pages
- **Blog** (`blog.html`) — articles and startup insights
- **About Us** (`about-us.html`) — team, mission, company story
- **Success Stories** (`success-stories.html`) — featured startup journeys

---

## ⚡ Features

- **Responsive Design** — fully optimized for mobile, tablet, and desktop
- **Mobile Hamburger Menu** — animated slide-in drawer on all pages
- **Animated Preloader** — branded loading screen with progress bar
- **Orbit Animation** — interactive hero visualization (centered on mobile)
- **SPA Navigation** — hash-based routing (`#login`, `#signup`) for deep linking
- **Firebase Auth** — email/password authentication with email verification
- **Google OAuth** — one-click sign in with role selection
- **Realtime Database** — user data persisted to Firebase RTDB
- **LocalStorage** — session persistence for dashboard pages
- **Lucide Icons** — consistent SVG icon system across all pages
- **Glass Morphism** — modern glass-card UI elements
- **CSS Animations** — orbit, float, shimmer, slide-up, spring, blob, particle effects

---

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/foundera.git
   cd foundera
   ```

2. **Firebase Configuration**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable **Authentication** (Email/Password + Google provider)
   - Enable **Realtime Database**
   - Replace the Firebase config in `index.html` with your project credentials:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_PROJECT.firebaseapp.com",
         databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
         projectId: "YOUR_PROJECT",
         storageBucket: "YOUR_PROJECT.firebasestorage.app",
         messagingSenderId: "YOUR_SENDER_ID",
         appId: "YOUR_APP_ID",
         measurementId: "YOUR_MEASUREMENT_ID"
     };
     ```

3. **Google Sign-In** (optional)
   - Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com)
   - Replace `YOUR_GOOGLE_CLIENT_ID` in `js/home.js`

4. **Run locally**
   - Open `index.html` in a browser, or use a local server:
     ```bash
     npx serve .
     ```
   - Or use VS Code Live Server extension

---

## 📱 Mobile Responsiveness

- All pages are fully responsive with Tailwind CSS breakpoints
- Mobile hamburger menu with animated slide-in drawer
- Dashboard sidebars collapse into toggleable overlays on small screens
- Orbit animation scales and centers on mobile viewports
- Login/Signup forms stack vertically on mobile

---

## 🔗 Navigation Flow

```
index.html (Home)
  ├── #login → Login Form
  ├── #signup → Sign Up Form
  ├── Dashboard (after login)
  │     ├── Founder → founder.html
  │     ├── Job Seeker → jobseeker.html
  │     └── Investor → investor.html
  ├── blog.html
  ├── about-us.html
  └── success-stories.html
```

---

## 📜 License

This project is proprietary. All rights reserved © 2026 Foundera Inc.
