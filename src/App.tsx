import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import { ThemeProvider } from "./context/ThemeContext";
import Loader from "./Components/loader";
import ErrorBoundary from "./ErrorBoundary";

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
              <Loader size={48} color="#0f172a" />
            </div>
          }
        >
          <RouterProvider router={Router} />
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
