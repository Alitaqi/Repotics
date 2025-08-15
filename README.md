📂 public/
   ├── favicon.ico
   ├── robots.txt
   ├── ... any static files that don’t get processed by Vite

📂 src/
   📂 assets/              # Images, fonts, static SVGs
       ├── logo.svg
       └── images/
   
   📂 components/          # Reusable UI components (buttons, cards, modals, etc.)
       ├── ui/             # Shadcn, Radix, Tailwind-styled UI components
       ├── layout/         # Navbar, Footer, Sidebar, etc.
       └── custom/         # Your own custom reusable components
   
   📂 features/            # Redux slices + related components
       ├── auth/           # Authentication-related state + components
       ├── products/       # Example feature
       └── users/          # Example feature
   
   📂 pages/               # Pages used in React Router
       ├── Home.jsx
       ├── About.jsx
       ├── Contact.jsx
       └── NotFound.jsx

   📂 lib/                 # Config files, helpers, and utilities
       ├── axios.js        # Axios instance with baseURL + interceptors
       ├── constants.js    # App-wide constants
       ├── helpers.js      # Utility functions
       └── redux/          # Store configuration
           ├── store.js
           └── apiSlice.js (for RTK Query later)

   📂 styles/              # Global CSS, Tailwind config overrides
       ├── globals.css
       └── variables.css

   App.jsx                 # App shell — only handles layout + routes
   main.jsx                # ReactDOM.createRoot and wraps App in Providers
   index.css               # Tailwind base styles (if not inside globals.css)

📄 package.json
📄 vite.config.js
📄 tailwind.config.js





















----------------------------------
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.