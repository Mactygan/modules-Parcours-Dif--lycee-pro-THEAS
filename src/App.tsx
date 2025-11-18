import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { Dashboard } from './pages/Dashboard';
import { ModuleList } from './components/modules/ModuleList';
import { ProgrammeList } from './components/programmes/ProgrammeList';
import { EleveList } from './components/eleves/EleveList';
import { PlanningList } from './components/plannings/PlanningList';
import { useLMSStore } from './services/store';
import {
  mockModules,
  mockProgrammes,
  mockEleves,
  mockClasses,
  mockSeances,
  mockProgressions,
  mockEvaluations,
} from './utils/mockData';

function App() {
  const {
    modules,
    programmes,
    eleves,
    classes,
    seances,
    progressions,
    evaluations,
    addModule,
    addProgramme,
    addEleve,
    addClasse,
    addSeance,
    addProgression,
    addEvaluation,
  } = useLMSStore();

  // Initialiser les données de démonstration au premier chargement
  useEffect(() => {
    if (modules.length === 0) {
      mockModules.forEach((m) => addModule(m));
    }
    if (programmes.length === 0) {
      mockProgrammes.forEach((p) => addProgramme(p));
    }
    if (eleves.length === 0) {
      mockEleves.forEach((e) => addEleve(e));
    }
    if (classes.length === 0) {
      mockClasses.forEach((c) => addClasse(c));
    }
    if (seances.length === 0) {
      mockSeances.forEach((s) => addSeance(s));
    }
    if (progressions.length === 0) {
      mockProgressions.forEach((p) => addProgression(p));
    }
    if (evaluations.length === 0) {
      mockEvaluations.forEach((e) => addEvaluation(e));
    }
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules" element={<ModuleList />} />
          <Route path="/programmes" element={<ProgrammeList />} />
          <Route path="/eleves" element={<EleveList />} />
          <Route path="/plannings" element={<PlanningList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
