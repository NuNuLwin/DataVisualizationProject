import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
// import InstitutionCollaboration from "./pages/InstitutionCollaboration";
// import CoAuthorship from "./pages/CoAuthorship";

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* <Route path="/" element={<InstitutionCollaboration />} /> */}
            {/* <Route path="/" element={<CoAuthorship />} /> */}
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
