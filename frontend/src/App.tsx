import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CreateEvent } from './pages/CreateEvent';
import { EventView } from './pages/EventView';
import { Admin } from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/event/:id" element={<EventView />} />
        <Route path="/s/:id" element={<EventView />} />
        <Route path="/event/:id/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
