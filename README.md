
# CraftCopy — Local AI Listing Studio

A side-hustle project for the Hacktoberfest Open-Source AI Challenge.

CraftCopy helps handmade-product sellers, resellers, and independent
shops draft product titles, descriptions, and search tags using an
open-weight AI model in the browser.

## Problem

Small sellers spend time writing product listings for platforms such
as Etsy, Instagram, eBay, and Shopify. Professional copywriting can
be expensive, while manually writing every listing can be repetitive.

CraftCopy aims to make that process faster and more accessible.

## Features

- Responsive website built with HTML, CSS, and JavaScript
- AI-generated product titles
- AI-generated product descriptions
- Search tag suggestions
- Brand tone and target audience inputs
- Editable results
- Copy individual sections or the full listing
- Export listings to a text file
- No AI API key or user account required
- Template fallback if the model cannot load

## Technology stack

- HTML5
- CSS3
- Vanilla JavaScript using ES modules
- Transformers.js
- Xenova/flan-t5-small

## How to run locally

### Requirements

- A Mac, Windows, or Linux computer
- A modern web browser
- Python 3 or the VS Code Live Server extension
- Internet access for the first model download

### Steps

1. Download or clone the project.
2. Open Terminal in the project directory.
3. Start a local development server:

   ```bash
   python3 -m http.server 8000
   ```

4. Open this URL:

   http://localhost:8000

5. Enter your product details and click Generate my listing.

Opening index.html directly may not work because browsers can
restrict JavaScript modules when loaded from a local file.

## How the AI works

CraftCopy loads Transformers.js from jsDelivr and uses the
browser-compatible model Xenova/flan-t5-small.

The model files are downloaded on first use and may be cached by
the browser. Generation happens client-side, so the product details
are not sent to a hosted text-generation API by this application.

First use still requires an internet connection. Reliable offline
operation would require hosting the required JavaScript and model
files locally and testing browser storage and caching.

## Why open innovation matters

### 1. Privacy

Product information is processed in the browser instead of being
sent to a remote text-generation API.

### 2. Cost control

The app has no per-request AI inference API charge. Users still
need a compatible device and may incur internet and electricity costs.

### 3. Freedom to customize

Developers can change the prompt, adjust the workflow, add
specialized product rules, or test compatible open-weight models.

### 4. Reduced vendor lock-in

The project is not tied to one paid AI inference provider or its
pricing changes.

### 5. Learning and collaboration

The source code can be inspected, modified, tested, and extended
by other developers.

## Potential customers

- Handmade-product sellers
- Small Instagram shops
- Vintage resellers
- Independent artists
- Small e-commerce businesses

## Potential business model

A possible service is to help sellers create and polish product
listings in batches.

Example prices to test with customers:

- Starter: 10 listing drafts for ₹199
- Seller package: a larger batch for ₹499

These are proposed test prices, not validated market rates or
actual revenue. Customer interviews and real usage should determine
whether the service is worth paying for.

## Limitations

- The model may produce repetitive or inaccurate wording.
- Performance depends on the device and browser.
- First-time model download requires internet access.
- The app does not publish listings directly to marketplaces.
- Product claims, sizes, materials, and other details must be checked.
- A template fallback is not AI-generated output.

## Future improvements

- Batch listing generation
- CSV import and export
- Saved brand voice profiles
- Image-assisted product descriptions
- Language translation
- Marketplace-specific formatting
- Optional local model selection

## Project structure

```text
sidehustle-ai-listing-studio/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Challenge

Hacktoberfest Open-Source AI Challenge — Side Hustle

The goal is to explore how open-weight models and open-source
tools can help small businesses solve practical problems affordably.

## License

Consider releasing this project under the MIT License after
checking the licenses and terms of the model, model conversion,
and libraries you use.
