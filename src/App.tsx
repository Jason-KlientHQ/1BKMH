import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";

const Explore = lazy(() => import("./pages/Explore.tsx"));

function hasAppDeepLink(search: string): boolean {
  const params = new URLSearchParams(search);
  return (
    params.has("b") ||
    params.has("dest") ||
    params.has("fly") ||
    params.has("mode") ||
    params.has("hull") ||
    params.has("orbits") ||
    params.has("accuracy") ||
    params.has("origin")
  );
}

function RootRoute() {
  const { search } = useLocation();
  if (hasAppDeepLink(search)) {
    return <Navigate to={`/explore${search}`} replace />;
  }
  return <Landing />;
}

const PageLoader = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-[#04050c] text-sm text-muted-foreground">
    Loading…
  </div>
);

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;