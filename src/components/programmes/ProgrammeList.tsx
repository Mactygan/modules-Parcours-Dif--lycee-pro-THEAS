import React, { useState } from 'react';
import { useLMSStore } from '../../services/store';
import { Programme } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Plus, GraduationCap, Clock } from 'lucide-react';
import { formatNiveau } from '../../utils/helpers';
import { ProgrammeForm } from './ProgrammeForm';

export const ProgrammeList: React.FC = () => {
  const { programmes, modules } = useLMSStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);

  const handleEdit = (programme: Programme) => {
    setSelectedProgramme(programme);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgramme(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Programmes Pédagogiques</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Nouveau Programme
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programmes.map((programme) => (
          <Card key={programme.id} onClick={() => handleEdit(programme)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-primary-600" size={24} />
                <Badge variant="primary">{formatNiveau(programme.niveau)}</Badge>
              </div>
              <span className="text-sm text-gray-500">{programme.annee}</span>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">{programme.nom}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{programme.description}</p>

            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
              <Clock size={16} />
              <span>{programme.dureeTotal}h au total</span>
            </div>

            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {programme.modules.length} module(s)
              </p>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Objectifs :</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {programme.objectifs.slice(0, 2).map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-primary-600">•</span>
                    <span className="line-clamp-1">{obj}</span>
                  </li>
                ))}
                {programme.objectifs.length > 2 && (
                  <li className="text-gray-500">+{programme.objectifs.length - 2} autre(s)</li>
                )}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {programmes.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Aucun programme créé</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            Créer le premier programme
          </Button>
        </div>
      )}

      {isModalOpen && (
        <ProgrammeForm programme={selectedProgramme} onClose={handleCloseModal} />
      )}
    </div>
  );
};
