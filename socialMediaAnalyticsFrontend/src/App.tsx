import { Routes, Route, Navigate } from 'react-router-dom';
import TopUsers from './components/ToppUsers';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/topusers" />} />
      <Route path="/topusers" element={<TopUsers />} />
    </Routes>
  );
};

export default App;
