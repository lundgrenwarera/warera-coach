import { Route, Routes } from "react-router-dom";
import { CoachPage } from "@/pages/coach";
import { LandingPage } from "@/pages/landing";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/:username" element={<CoachPage />} />
    </Routes>
  );
}
