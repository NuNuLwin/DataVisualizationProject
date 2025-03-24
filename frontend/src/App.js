import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import InstitutionCollaboration from "./pages/InstitutionCollaboration";
function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/" element={<InstitutionCollaboration />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
