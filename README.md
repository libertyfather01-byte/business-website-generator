# Liberty Self - Site Builder AI

An advanced, client-side business website generator that empowers users to create professional, branded websites in seconds.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (includes `npx`)

### How to Launch
Run the `Start-SiteBuilder.bat` file or use the terminal:
```bash
npm start
```
The application will be available at `http://localhost:8081`.

## 📁 Project Structure
- `index.html`: Landing and onboarding page.
- `app.html`: Core website generator dashboard.
- `js/app.js`: Main application logic.
- `css/style.css`: Premium design system styles.
- `sw.js` & `manifest.json`: Progressive Web App (PWA) configuration for offline access and installation.

## 🛡️ Isolation
This project is configured to run on **Port 8081** to ensure it does not interfere with other local projects like MandateHub (typically on Port 3000). 
- **LocalStorage**: Data is isolated by port origin, so changes here will not affect other projects on localhost.
- **Port Conflict**: Standardized on 8081 to avoid common developer ports.

## 🛠️ Key Features
- Industry-specific templates.
- Real-time split-screen preview.
- Local persistence via `localStorage`.
- One-click HTML export.
