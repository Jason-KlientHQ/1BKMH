import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing.tsx";
import Explore from "./pages/Explore.tsx";
import NotFound from "./pages/NotFound.tsx";

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

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;