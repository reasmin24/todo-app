# Todo App

A simple, free-tier-friendly todo app built with [Next.js](https://nextjs.org/) (App Router) and React. All state lives in your browser via `localStorage` — no database, no server code — so it deploys entirely as static output on Vercel's free plan with zero usage costs.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

## Features

- Add, toggle, and delete todos
- Filter by All / Active / Completed
- Clear completed items in one click
- Live "items left" counter
- Todos persist in `localStorage`
- Fully static, client-side rendering — cheap to host anywhere

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm start
```

The build output is fully static (`○ (Static)`), ready for deployment.

## Deploy to Vercel

This project is optimized for Vercel's free (Hobby) tier:

- No server-side functions — nothing to bill per invocation
- Static prerendering out of the box
- Client-side persistence means no database to provision

Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new), or run:

```bash
npm i -g vercel
vercel
```

## Tech

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript** (strict)
- **CSS** — plain global stylesheet, no UI framework needed
