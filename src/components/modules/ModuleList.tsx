import React, { useState } from 'react';
import { useLMSStore } from '../../services/store';
import { Module } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Plus, Search, BookOpen, Clock } from 'lucide-react';
import { formatNiveau } from '../../utils/helpers';
import { ModuleForm } from './ModuleForm';

export const ModuleList: React.FC = () => {
  const { modules } = useLMSStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [recherche, setRecherche] = useState('');
  const [niveauFiltre, setNiveauFiltre] = useState('');

  const modulesFiltres = modules.filter((module) => {
    const matchRecherche =
      recherche === '' ||
      module.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      module.code.toLowerCase().includes(recherche.toLowerCase());
    const matchNiveau = niveauFiltre === '' || module.niveau === niveauFiltre;
    return matchRecherche && matchNiveau;
  });

  const handleEdit = (module: Module) => {
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modules de Formation</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Nouveau Module
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <Input
            value={recherche}
            onChange={setRecherche}
            placeholder="Rechercher un module..."
            className="mb-0"
          />
        </div>
        <Select
          value={niveauFiltre}
          onChange={setNiveauFiltre}
          options={[
            { value: 'CAP', label: 'CAP' },
            { value: 'BAC_PRO', label: 'Bac Pro' },
            { value: 'BTS', label: 'BTS' },
          ]}
          placeholder="Tous les niveaux"
          className="w-64 mb-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulesFiltres.map((module) => (
          <Card key={module.id} onClick={() => handleEdit(module)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="text-primary-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900">{module.code}</h3>
              </div>
              <Badge variant="primary">{formatNiveau(module.niveau)}</Badge>
            </div>

            <h4 className="text-xl font-semibold text-gray-800 mb-2">{module.titre}</h4>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>

            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
              <Clock size={16} />
              <span>{module.dureeHeures}h</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {module.competences.slice(0, 3).map((comp, idx) => (
                <Badge key={idx} variant="default">
                  {comp}
                </Badge>
              ))}
              {module.competences.length > 3 && (
                <Badge variant="default">+{module.competences.length - 3}</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {modulesFiltres.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun module trouvé</p>
        </div>
      )}

      {isModalOpen && (
        <ModuleForm module={selectedModule} onClose={handleCloseModal} />
      )}
    </div>
  );
};
