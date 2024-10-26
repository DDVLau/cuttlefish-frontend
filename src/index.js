import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from './App';
import ErrorPage from './pages/ErrorPage';
import CompletePage from './pages/CompletePage';
import SurveyPage from './pages/SurveyPage';
import TutorialPage from './pages/TutorialPage';
import HomeContent from './HomeContent';
// import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeContent />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/app",
        element: <App />,
    },
    {
        path: "/complete-page",
        element: <CompletePage />,
    },
    {
        path: "/tutorial",
        element: <TutorialPage />,
    },
    {
        path: "/survey",
        element: <SurveyPage />,
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);