# SayMyTech Developers — Company Website

React + Vite + Tailwind v4 + Framer Motion. Dual-path site (clients + product users)
with a real AI assistant ("Ask SayMyTech") backed by a Netlify serverless function
calling the Claude API.

## Run locally
npm install
npm run dev

## Deploy (Netlify)
1. Push this to a GitHub repo (or drag-and-drop the `dist` folder after `npm run build`).
2. Connect the repo in Netlify — it will auto-detect the `netlify/functions` folder.
3. In Netlify → Site settings → Environment variables, add:
   ANTHROPIC_API_KEY = your key from console.anthropic.com
4. Deploy. The "Ask SayMyTech" widget will go live automatically once the key is set.

## Structure
- src/components — Nav, Hero, DualPath, Products, Process, About, Contact, Footer, AskSayMyTech, KitengeDivider
- netlify/functions/chat.js — serverless AI backend (never exposes the API key to the browser)
- src/index.css — design tokens (colors, fonts) as Tailwind v4 @theme vars

## Still to do before this feels "done"
- Wire the Contact form to a real destination (Netlify Forms, email, or a CRM)
- Swap placeholder product taglines for real screenshots/links once ready
- Add a real page (or modal) per product if you want deep-linkable product pages
