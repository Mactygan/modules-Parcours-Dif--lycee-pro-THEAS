import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  // Rediriger vers la page appropriée
  if (isAuthenticated) {
    return <Navigate to="/calendrier" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
