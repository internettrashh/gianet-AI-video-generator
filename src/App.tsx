import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Component from './components/video-generator-vercel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Component />} />
        <Route path="/about" element={<div>About Page</div>} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
