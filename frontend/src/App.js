import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/index";

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
