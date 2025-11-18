import React from 'react';
import { useLMSStore } from '../../services/store';
import { Eleve } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatDate, formatNiveau, getStatutColor, formatStatut, calculerMoyennePonderee } from '../../utils/helpers';
import { User, Mail, Phone, BookOpen, TrendingUp } from 'lucide-react';

interface EleveDetailProps {
  eleve: Eleve;
  onClose: () => void;
}

export const EleveDetail: React.FC<EleveDetailProps> = ({ eleve, onClose }) => {
  const { progressions, evaluations, modules } = useLMSStore();

  const progressionsEleve = progressions.filter((p) => p.eleveId === eleve.id);
  const evaluationsEleve = evaluations.filter((e) => e.eleveId === eleve.id);

  const moyenneGenerale =
    evaluationsEleve.length > 0
      ? calculerMoyennePonderee(evaluationsEleve)
      : 0;

  return (
    <Modal isOpen={true} onClose={onClose} title="Détail de l'élève" size="xl">
      <div className="space-y-6">
        {/* Informations personnelles */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="text-primary-600" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {eleve.prenom} {eleve.nom}
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="primary">{formatNiveau(eleve.niveau)}</Badge>
                <Badge variant="default">{eleve.classe}</Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{eleve.email}</span>
                </div>
                {eleve.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{eleve.telephone}</span>
                  </div>
                )}
                <div>Né(e) le {formatDate(eleve.dateNaissance)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-gray-700">Modules</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{progressionsEleve.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={20} />
              <span className="text-sm font-medium text-gray-700">Moyenne</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{moyenneGenerale.toFixed(2)}/20</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-purple-600" size={20} />
              <span className="text-sm font-medium text-gray-700">Évaluations</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{evaluationsEleve.length}</p>
          </div>
        </div>

        {/* Progressions par module */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Progression par module</h3>
          {progressionsEleve.length > 0 ? (
            <div className="space-y-3">
              {progressionsEleve.map((progression) => {
                const module = modules.find((m) => m.id === progression.moduleId);
                const evaluationsModule = evaluationsEleve.filter(
                  (e) => e.moduleId === progression.moduleId
                );
                const moyenneModule =
                  evaluationsModule.length > 0
                    ? calculerMoyennePonderee(evaluationsModule)
                    : null;

                return module ? (
                  <div key={progression.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{module.titre}</h4>
                        <p className="text-sm text-gray-500">{module.code}</p>
                      </div>
                      <Badge className={getStatutColor(progression.statut)}>
                        {formatStatut(progression.statut)}
                      </Badge>
                    </div>

                    {moyenneModule !== null && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Moyenne: </span>
                        <span className="text-sm font-bold text-primary-600">
                          {moyenneModule.toFixed(2)}/20
                        </span>
                      </div>
                    )}

                    {progression.competencesValidees.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Compétences validées:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {progression.competencesValidees.map((comp, idx) => (
                            <Badge key={idx} variant="success">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {progression.commentaires && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {progression.commentaires}
                      </p>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucune progression enregistrée
            </p>
          )}
        </div>

        {/* Historique des évaluations */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Historique des évaluations</h3>
          {evaluationsEleve.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Module</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-center">Note</th>
                    <th className="px-4 py-2 text-center">Coef.</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {evaluationsEleve.map((evaluation) => {
                    const module = modules.find((m) => m.id === evaluation.moduleId);
                    return (
                      <tr key={evaluation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{formatDate(evaluation.date)}</td>
                        <td className="px-4 py-2">{module?.code || '-'}</td>
                        <td className="px-4 py-2 capitalize">
                          {evaluation.type.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-2 text-center font-semibold">
                          {evaluation.note}/20
                        </td>
                        <td className="px-4 py-2 text-center">{evaluation.coefficient}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune évaluation enregistrée</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
