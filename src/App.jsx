import Dashboard from './components/Dashboard';
import { CvProvider } from './context/CvContext';

function App() {
  return (
    <CvProvider>
      <Dashboard />
    </CvProvider>
  );
}

export default App;
