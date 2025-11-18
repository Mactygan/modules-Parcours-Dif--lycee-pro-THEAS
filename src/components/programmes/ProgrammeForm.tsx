import React, { useState, useEffect } from 'react';
import { useLMSStore } from '../../services/store';
import { Programme } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { generateId } from '../../utils/helpers';

interface ProgrammeFormProps {
  programme: Programme | null;
  onClose: () => void;
}

export const ProgrammeForm: React.FC<ProgrammeFormProps> = ({ programme, onClose }) => {
  const { addProgramme, updateProgramme, modules } = useLMSStore();
  const [formData, setFormData] = useState<Partial<Programme>>({
    nom: '',
    description: '',
    niveau: 'BAC_PRO',
    annee: new Date().getFullYear(),
    modules: [],
    objectifs: [],
    dureeTotal: 0,
  });
  const [objectifInput, setObjectifInput] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');

  useEffect(() => {
    if (programme) {
      setFormData(programme);
    }
  }, [programme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (programme) {
      updateProgramme(programme.id, formData);
    } else {
      const newProgramme: Programme = {
        ...formData,
        id: generateId(),
        modules: formData.modules || [],
        objectifs: formData.objectifs || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Programme;
      addProgramme(newProgramme);
    }

    onClose();
  };

  const addObjectif = () => {
    if (objectifInput.trim()) {
      setFormData({
        ...formData,
        objectifs: [...(formData.objectifs || []), objectifInput.trim()],
      });
      setObjectifInput('');
    }
  };

  const removeObjectif = (index: number) => {
    setFormData({
      ...formData,
      objectifs: formData.objectifs?.filter((_, i) => i !== index),
    });
  };

  const addModule = () => {
    if (selectedModuleId && !formData.modules?.includes(selectedModuleId)) {
      setFormData({
        ...formData,
        modules: [...(formData.modules || []), selectedModuleId],
      });
      setSelectedModuleId('');
    }
  };

  const removeModule = (moduleId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules?.filter((id) => id !== moduleId),
    });
  };

  const availableModules = modules.filter(
    (m) => !formData.modules?.includes(m.id) && m.niveau === formData.niveau
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={programme ? 'Modifier le programme' : 'Nouveau programme'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nom du programme"
          value={formData.nom || ''}
          onChange={(value) => setFormData({ ...formData, nom: value })}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Niveau"
            value={formData.niveau || ''}
            onChange={(value) => setFormData({ ...formData, niveau: value as any, modules: [] })}
            options={[
              { value: 'CAP', label: 'CAP' },
              { value: 'BAC_PRO', label: 'Bac Pro' },
              { value: 'BTS', label: 'BTS' },
            ]}
            required
          />
          <Input
            label="Année"
            type="number"
            value={String(formData.annee || '')}
            onChange={(value) => setFormData({ ...formData, annee: parseInt(value) || 0 })}
            required
          />
        </div>

        <Input
          label="Durée totale (heures)"
          type="number"
          value={String(formData.dureeTotal || '')}
          onChange={(value) => setFormData({ ...formData, dureeTotal: parseInt(value) || 0 })}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Modules</label>
          <div className="flex gap-2 mb-2">
            <Select
              value={selectedModuleId}
              onChange={setSelectedModuleId}
              options={availableModules.map((m) => ({ value: m.id, label: `${m.code} - ${m.titre}` }))}
              placeholder="Sélectionner un module"
              className="flex-1 mb-0"
            />
            <Button type="button" onClick={addModule} variant="secondary">
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {formData.modules?.map((moduleId) => {
              const module = modules.find((m) => m.id === moduleId);
              return module ? (
                <div
                  key={moduleId}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <span className="text-sm">
                    <span className="font-semibold">{module.code}</span> - {module.titre}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeModule(moduleId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={objectifInput}
              onChange={setObjectifInput}
              placeholder="Ajouter un objectif"
              className="mb-0"
            />
            <Button type="button" onClick={addObjectif} variant="secondary">
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {formData.objectifs?.map((obj, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-blue-50 p-2 rounded"
              >
                <span className="text-sm">{obj}</span>
                <button
                  type="button"
                  onClick={() => removeObjectif(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose} variant="secondary">
            Annuler
          </Button>
          <Button type="submit">
            {programme ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
