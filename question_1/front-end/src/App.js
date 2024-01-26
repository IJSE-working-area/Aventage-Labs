import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home/Home";
import NewOrder from "./pages/NewOrder/NewOrder";
import Reports from "./pages/Reports/Reports";

function App() {
  return (
    <div >
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/NewOrder" element={<NewOrder/>}/>
          <Route path="/Reports" element={<Reports/>}/>
        </Routes>
      </Router>
   
    </div>
  );
}

export default App;
