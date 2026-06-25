# WorldCupPath 2026 — Design System

## Brand Direction

WorldCupPath 2026 is a premium football tournament simulator. The UI should feel like a mix of:
- FIFA broadcast graphics
- ESPN tournament dashboards
- Apple Sports cleanliness
- Linear/Vercel-level spacing and typography

The app should feel credible, fast, and analytical.

## Core Feeling

Words the UI should communicate:
- elite
- global
- tactical
- predictive
- broadcast-ready
- clean
- data-rich but not cluttered

Avoid:
- toy-like fantasy sports UI
- neon gaming dashboard overload
- generic SaaS cards
- random gradients
- crowded spreadsheet layouts

## Color System

Primary background:
- deep navy / near-black sports broadcast feel

Surface layers:
- slightly lighter navy cards
- subtle borders
- soft elevation only when needed

Accent colors:
- use sparingly for active states, probability highlights, qualification status, and important calls to action

Status colors:
- qualified
- eliminated
- at risk
- neutral
- pending

Never rely on color alone. Always pair status color with text or icon labels.

## Typography

Use a clean modern sans-serif.
Hierarchy should be strong:
- page title: confident and compact
- section headers: clear
- table labels: readable
- stats: bold but not oversized
- secondary metadata: muted but legible

Avoid long centered paragraphs.

## Layout

Use dashboard-style layouts:
- strong top summary area
- card-based sections
- sticky or persistent context where useful
- tables for standings/fixtures
- charts for probability comparisons
- responsive grid on desktop
- stacked cards on mobile

Spacing should feel intentional and premium.

## Components

### Cards

Cards should have:
- subtle border
- consistent padding
- clear title
- useful content density
- no unnecessary shadows

### Tables

Tables should:
- support scanning
- align numbers cleanly
- keep team names readable
- show status clearly
- work on mobile through responsive layout or alternate card view

### Charts

Charts should:
- prioritize interpretation over decoration
- include labels
- include percentages
- avoid confusing legends
- use consistent scales
- use skeleton states when loading

### Buttons

Buttons should:
- have obvious hierarchy
- use clear labels
- avoid vague CTAs like “Submit” when a specific action is better
- have visible hover/focus states

## Motion

Motion should feel like Apple Sports / broadcast graphics:
- subtle transitions
- fast but not jarring
- useful reveal animations
- no distracting looping animations

## Accessibility

- WCAG AA contrast
- keyboard navigable controls
- visible focus rings
- semantic headings
- readable font sizes
- charts must have text equivalents where possible

## Page Quality Bar

A finished page should pass this checklist:
- Does it look like a real sports analytics product?
- Is the main user action obvious?
- Can a user understand the page in 5 seconds?
- Are probabilities and standings easy to compare?
- Does it work on mobile?
- Are empty/loading/error states handled?
- Would this look good in a GitHub portfolio demo video?
