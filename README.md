# Garda Samudra Nusantara Website

Next.js website for Garda Samudra Nusantara with responsive division pages,
product highlights, partnership CTA, navbar, and footer.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Inquiry Email Setup

Copy `.env.example` to `.env.local`, then fill in:

```txt
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=GSN Inquiry <inquiry@your-verified-domain.com>
```

`RESEND_FROM_EMAIL` should use a sender/domain verified in Resend.

## NusaBot AI Setup

NusaBot works with the local GSN knowledge base by default. To enable AI-powered
answers, add these values to `.env.local`:

```txt
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

The website calls `/api/nusabot` from the chat UI. If `OPENAI_API_KEY` is not
configured, the assistant automatically falls back to the built-in GSN product
knowledge so the chat remains usable.

## Structure

```txt
app/
  globals.css
  layout.jsx
  page.jsx
components/
  DivisionPage.jsx
  Footer.jsx
  Navbar.jsx
  ProductSection.jsx
data/
  company.js
```

The site uses regular CSS instead of Tailwind, so the UI does not require a
separate styling framework setup.
