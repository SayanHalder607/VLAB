import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SimulatorWorkspace } from './components/SimulatorWorkspace';
import { useStore } from './utils/store';
import React from 'react';

// Wrapper for simulator page to grab param
const SimulatorRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const experiments = useStore(state => state.experiments);

  const isUuid = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

  if (isUuid) {
    const mockExperiment: any = {
      id: -1,
      title: 'Loading Circuit...',
      description: 'Your Supabase design is loading...',
      platform: 'Arduino',
      keyComponents: [],
      defaultCode: '',
      defaultComponents: [],
      defaultWires: [],
    };
    return (
      <SimulatorWorkspace
        experiment={mockExperiment}
        circuitId={id}
        onBack={() => navigate('/dashboard')}
      />
    );
  }

  const experiment = experiments.find(e => e.id === Number(id));

  if (!experiment) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SimulatorWorkspace
      experiment={experiment}
      onBack={() => navigate('/dashboard')}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/simulator/:id" element={<SimulatorRouteWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
