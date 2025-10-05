# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Finder Frontend

This is the **frontend** for the Finder application, built with **React** and **Vite**. It communicates with the backend API to manage users, communities, and apartments.

---

## Project Structure

├── .env
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── public
│ └── vite.svg
├── src
│ ├── main.jsx
│ ├── App.jsx
│ ├── api
│ │ ├── auth.js
│ │ └── index.js
│ ├── components
│ │ ├── Alert.jsx
│ │ ├── ApartmentModel.jsx
│ │ ├── Nav.jsx
│ │ └── PrivateRoute.jsx
│ ├── pages
│ │ ├── ApartmentsList.jsx
│ │ ├── ApartmentDetail.jsx
│ │ ├── CommunitiesList.jsx
│ │ ├── CommunityDetail.jsx
│ │ ├── Home.jsx
│ │ ├── Login.jsx
│ │ ├── Register.jsx
│ │ └── UsersList.jsx
│ └── styles.css

yaml
Copy code

---

## Prerequisites

- Node.js v18+
- npm

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/Mahanth-ls9/finder-frontend.git
cd finder-frontend
Install dependencies

bash
Copy code
npm install
Create environment variables

Create a .env file in the root folder:

bash
Copy code
VITE_API_URL=http://localhost:8080/api
VITE_API_URL should point to your backend API URL.

Run the development server

bash
Copy code
npm run dev
The frontend will run at: http://localhost:5173

Build for production

bash
Copy code
npm run build
Output files will be in the dist/ folder.

Serve using any static file server.

Usage
Access the app in your browser: http://localhost:5173

Use the forms to register, login, and navigate to protected pages.

JWT tokens are handled internally for API requests to secured backend endpoints.

Notes
Ensure your backend allows CORS requests from http://localhost:5173.

Private routes require authentication using JWT.

API calls are defined in the /src/api folder.

Styling is in styles.css and can be customized.
