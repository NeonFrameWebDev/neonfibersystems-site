# Neon Fiber Systems — marketing site

The public company website for **Neon Fiber Systems** (product: *Neon Fiber* — fiber buildout
intelligence). Static site, hosted on **GitHub Pages** at **https://neonfibersystems.com**.

The login-gated platform/dashboard lives separately at **https://neonfiber.online** (linked here as
"Client login"). Email (`chad@neonfibersystems.com`) is on Zoho — DNS for mail must not be disturbed.

## Stack
Hand-built static HTML/CSS/JS — **no framework, no build step**. GitHub Pages serves the files as-is.

```
index.html              Landing (multi-section)
how-it-works/           How it works
for-sales/              For fiber sales teams
pricing/                Pricing
company/                Company / about
contact/                Book a pilot (mailto-based form, no backend)
assets/css/site.css     Design system (brand palette: cyan #22D3EE → blue #3B82F6 → violet #A78BFA)
assets/js/site.js       Nav, scroll reveals, hero fiber canvas, the live "flip" demo, mailto form
assets/brand/           Logo lockup, favicon, OG card (from the Neon Fiber brand kit)
CNAME                   neonfibersystems.com  (GitHub Pages custom domain)
robots.txt · sitemap.xml · 404.html
```

## Deploy
Push to `main`; GitHub Pages serves from the repo root. The `CNAME` file binds the custom domain.

DNS (at Namecheap, set via API from the VM): apex `A` → GitHub Pages
`185.199.108–111.153`, `www` CNAME → `neonframewebdev.github.io`. The Zoho mail records
(MX / SPF / DKIM / DMARC) are preserved — `setHosts` is a full replace, so always read existing
records and write them all back plus the new ones.

## Honesty
Per the project mandate: **no fabricated metrics or testimonials.** Numbers shown are qualitative or
safely-true (focus states, carriers tracked, permit-anchoring). The founder quote is a real
attribution, not a fake customer. Swap in live DB-pulled traction later via a small public JSON
endpoint on the VM if desired.
