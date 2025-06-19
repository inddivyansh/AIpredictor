import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import NationalNews from "./pages/NationalNews";
import AIPrediction from "./pages/AIPrediction";
import Impact from "./pages/Impact";
import GlobalNews from "./pages/GlobalNews";
import Suggestions from "./pages/Suggestions";

function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-900 text-white min-h-screen">
        {/* Sidebar */}
        <Sidebar />

        <div className="flex flex-col flex-1 p-4 mt-0">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/nationalnews" element={<NationalNews />} />
            <Route path="/aiprediction" element={<AIPrediction />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/globalnews" element={<GlobalNews />} />
            <Route path="/suggestions" element={<Suggestions />} />

            {/* Redirect root to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
