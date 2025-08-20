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

# Step 1: Make sure ali is pushed
git add .
git commit -m "Feature: short description"
git push origin ali

# Step 2: Switch to main & update it
git checkout main
git pull origin main

# Step 3: Merge ali → main
git merge ali

# Step 4: Push updated main
git push origin main

# Step 5: Update ali for next task
git checkout ali
git merge main



---------------------------------------------------------------------------

Profile module:

things that will be in this module are as follow

1. each person will have unique profile that will work on basis on cookies
2. the profile will have access control if the profile=user logged in we will allow them to add post directly from thier page and allow cahning of things 
3. make a preson and give him access to government and then just go and put control so if a person is verified then just show extra report button staic for now
3. profile data will be posts from backend so if we get ai setup the data of post will automatically become perfect but that means this feature will not be finished unless we get the ai api properly set up
followes popup

Settings:
then i will mmke setting tab where user will be able to properly change its detaiils and mayeb btton for pushed like a toggle idk and for sms we wil take number and i dont think we need anyother things in settings for now

post page: popup with comments and pagination too
Now:

feed
notifaction section
search page
....reptoing page
....missing person reprot page
....missing eprson page

----------------------
Future:
dashboard see module in reqs and this AI Analytics and Suggestions for Law Enforcement Agencies too
ladnign page
Real-Time Alerts 
heamap  see module in res Interactive Heatmap & Statistics 
fast api ai lagani hai
heatmap, real time alerts and dashbord all require us to have proper data 











----------------------------------
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
