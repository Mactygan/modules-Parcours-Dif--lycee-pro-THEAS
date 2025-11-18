import React, { useState } from 'react';
import { useLMSStore } from '../../services/store';
import { SeanceCours } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Select } from '../common/Select';
import { Plus, Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { formatDateTime, getStatutColor, formatStatut } from '../../utils/helpers';
import { PlanningForm } from './PlanningForm';

export const PlanningList: React.FC = () => {
  const { seances, classes, modules } = useLMSStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState<SeanceCours | null>(null);
  const [classeFiltre, setClasseFiltre] = useState('');
  const [typeFiltre, setTypeFiltre] = useState('');

  const seancesFiltrees = seances
    .filter((seance) => {
      const matchClasse = classeFiltre === '' || seance.classeId === classeFiltre;
      const matchType = typeFiltre === '' || seance.type === typeFiltre;
      return matchClasse && matchType;
    })
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());

  const handleEdit = (seance: SeanceCours) => {
    setSelectedSeance(seance);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSeance(null);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cours: 'bg-blue-100 text-blue-800',
      tp: 'bg-green-100 text-green-800',
      td: 'bg-purple-100 text-purple-800',
      examen: 'bg-red-100 text-red-800',
      projet: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Planning des Séances</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Nouvelle Séance
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Select
          value={classeFiltre}
          onChange={setClasseFiltre}
          options={classes.map((c) => ({ value: c.id, label: c.nom }))}
          placeholder="Toutes les classes"
          className="w-64 mb-0"
        />
        <Select
          value={typeFiltre}
          onChange={setTypeFiltre}
          options={[
            { value: 'cours', label: 'Cours' },
            { value: 'tp', label: 'TP' },
            { value: 'td', label: 'TD' },
            { value: 'examen', label: 'Examen' },
            { value: 'projet', label: 'Projet' },
          ]}
          placeholder="Tous les types"
          className="w-64 mb-0"
        />
      </div>

      <div className="space-y-4">
        {seancesFiltrees.map((seance) => {
          const classe = classes.find((c) => c.id === seance.classeId);
          const module = modules.find((m) => m.id === seance.moduleId);

          return (
            <Card key={seance.id} onClick={() => handleEdit(seance)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-primary-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">{seance.titre}</h3>
                    <Badge className={getTypeColor(seance.type)}>
                      {seance.type.toUpperCase()}
                    </Badge>
                    <Badge className={getStatutColor(seance.statut)}>
                      {formatStatut(seance.statut)}
                    </Badge>
                  </div>

                  {seance.description && (
                    <p className="text-gray-600 text-sm mb-3">{seance.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{formatDateTime(seance.dateDebut)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>Fin: {formatDateTime(seance.dateFin)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{seance.salle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      <span>{seance.enseignant}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    {classe && (
                      <Badge variant="default">{classe.nom}</Badge>
                    )}
                    {module && (
                      <span className="text-gray-600">
                        Module: <span className="font-semibold">{module.code}</span>
                      </span>
                    )}
                  </div>

                  {seance.ressources && seance.ressources.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      {seance.ressources.length} ressource(s) disponible(s)
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {seancesFiltrees.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Aucune séance planifiée</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            Planifier une séance
          </Button>
        </div>
      )}

      {isModalOpen && (
        <PlanningForm seance={selectedSeance} onClose={handleCloseModal} />
      )}
    </div>
  );
};
