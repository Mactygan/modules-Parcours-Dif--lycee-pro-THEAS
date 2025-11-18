import { create } from 'zustand';
import {
  Module,
  Programme,
  Eleve,
  ProgressionEleve,
  Evaluation,
  SeanceCours,
  Classe,
} from '../types';

interface LMSStore {
  // Modules
  modules: Module[];
  addModule: (module: Module) => void;
  updateModule: (id: string, module: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  getModule: (id: string) => Module | undefined;

  // Programmes
  programmes: Programme[];
  addProgramme: (programme: Programme) => void;
  updateProgramme: (id: string, programme: Partial<Programme>) => void;
  deleteProgramme: (id: string) => void;
  getProgramme: (id: string) => Programme | undefined;

  // Élèves
  eleves: Eleve[];
  addEleve: (eleve: Eleve) => void;
  updateEleve: (id: string, eleve: Partial<Eleve>) => void;
  deleteEleve: (id: string) => void;
  getEleve: (id: string) => Eleve | undefined;

  // Progressions
  progressions: ProgressionEleve[];
  addProgression: (progression: ProgressionEleve) => void;
  updateProgression: (id: string, progression: Partial<ProgressionEleve>) => void;
  deleteProgression: (id: string) => void;
  getProgressionsByEleve: (eleveId: string) => ProgressionEleve[];
  getProgressionsByModule: (moduleId: string) => ProgressionEleve[];

  // Évaluations
  evaluations: Evaluation[];
  addEvaluation: (evaluation: Evaluation) => void;
  updateEvaluation: (id: string, evaluation: Partial<Evaluation>) => void;
  deleteEvaluation: (id: string) => void;
  getEvaluationsByEleve: (eleveId: string) => Evaluation[];
  getEvaluationsByModule: (moduleId: string) => Evaluation[];

  // Séances
  seances: SeanceCours[];
  addSeance: (seance: SeanceCours) => void;
  updateSeance: (id: string, seance: Partial<SeanceCours>) => void;
  deleteSeance: (id: string) => void;
  getSeance: (id: string) => SeanceCours | undefined;
  getSeancesByClasse: (classeId: string) => SeanceCours[];
  getSeancesByModule: (moduleId: string) => SeanceCours[];

  // Classes
  classes: Classe[];
  addClasse: (classe: Classe) => void;
  updateClasse: (id: string, classe: Partial<Classe>) => void;
  deleteClasse: (id: string) => void;
  getClasse: (id: string) => Classe | undefined;
}

export const useLMSStore = create<LMSStore>((set, get) => ({
  // État initial
  modules: [],
  programmes: [],
  eleves: [],
  progressions: [],
  evaluations: [],
  seances: [],
  classes: [],

  // Actions pour les modules
  addModule: (module) =>
    set((state) => ({ modules: [...state.modules, module] })),

  updateModule: (id, moduleUpdate) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === id ? { ...m, ...moduleUpdate, updatedAt: new Date() } : m
      ),
    })),

  deleteModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
    })),

  getModule: (id) => get().modules.find((m) => m.id === id),

  // Actions pour les programmes
  addProgramme: (programme) =>
    set((state) => ({ programmes: [...state.programmes, programme] })),

  updateProgramme: (id, programmeUpdate) =>
    set((state) => ({
      programmes: state.programmes.map((p) =>
        p.id === id ? { ...p, ...programmeUpdate, updatedAt: new Date() } : p
      ),
    })),

  deleteProgramme: (id) =>
    set((state) => ({
      programmes: state.programmes.filter((p) => p.id !== id),
    })),

  getProgramme: (id) => get().programmes.find((p) => p.id === id),

  // Actions pour les élèves
  addEleve: (eleve) =>
    set((state) => ({ eleves: [...state.eleves, eleve] })),

  updateEleve: (id, eleveUpdate) =>
    set((state) => ({
      eleves: state.eleves.map((e) =>
        e.id === id ? { ...e, ...eleveUpdate, updatedAt: new Date() } : e
      ),
    })),

  deleteEleve: (id) =>
    set((state) => ({
      eleves: state.eleves.filter((e) => e.id !== id),
    })),

  getEleve: (id) => get().eleves.find((e) => e.id === id),

  // Actions pour les progressions
  addProgression: (progression) =>
    set((state) => ({ progressions: [...state.progressions, progression] })),

  updateProgression: (id, progressionUpdate) =>
    set((state) => ({
      progressions: state.progressions.map((p) =>
        p.id === id ? { ...p, ...progressionUpdate, updatedAt: new Date() } : p
      ),
    })),

  deleteProgression: (id) =>
    set((state) => ({
      progressions: state.progressions.filter((p) => p.id !== id),
    })),

  getProgressionsByEleve: (eleveId) =>
    get().progressions.filter((p) => p.eleveId === eleveId),

  getProgressionsByModule: (moduleId) =>
    get().progressions.filter((p) => p.moduleId === moduleId),

  // Actions pour les évaluations
  addEvaluation: (evaluation) =>
    set((state) => ({ evaluations: [...state.evaluations, evaluation] })),

  updateEvaluation: (id, evaluationUpdate) =>
    set((state) => ({
      evaluations: state.evaluations.map((e) =>
        e.id === id ? { ...e, ...evaluationUpdate, updatedAt: new Date() } : e
      ),
    })),

  deleteEvaluation: (id) =>
    set((state) => ({
      evaluations: state.evaluations.filter((e) => e.id !== id),
    })),

  getEvaluationsByEleve: (eleveId) =>
    get().evaluations.filter((e) => e.eleveId === eleveId),

  getEvaluationsByModule: (moduleId) =>
    get().evaluations.filter((e) => e.moduleId === moduleId),

  // Actions pour les séances
  addSeance: (seance) =>
    set((state) => ({ seances: [...state.seances, seance] })),

  updateSeance: (id, seanceUpdate) =>
    set((state) => ({
      seances: state.seances.map((s) =>
        s.id === id ? { ...s, ...seanceUpdate, updatedAt: new Date() } : s
      ),
    })),

  deleteSeance: (id) =>
    set((state) => ({
      seances: state.seances.filter((s) => s.id !== id),
    })),

  getSeance: (id) => get().seances.find((s) => s.id === id),

  getSeancesByClasse: (classeId) =>
    get().seances.filter((s) => s.classeId === classeId),

  getSeancesByModule: (moduleId) =>
    get().seances.filter((s) => s.moduleId === moduleId),

  // Actions pour les classes
  addClasse: (classe) =>
    set((state) => ({ classes: [...state.classes, classe] })),

  updateClasse: (id, classeUpdate) =>
    set((state) => ({
      classes: state.classes.map((c) =>
        c.id === id ? { ...c, ...classeUpdate, updatedAt: new Date() } : c
      ),
    })),

  deleteClasse: (id) =>
    set((state) => ({
      classes: state.classes.filter((c) => c.id !== id),
    })),

  getClasse: (id) => get().classes.find((c) => c.id === id),
}));
