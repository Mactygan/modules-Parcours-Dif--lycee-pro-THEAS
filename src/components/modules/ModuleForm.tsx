import React, { useState, useEffect } from 'react';
import { useLMSStore } from '../../services/store';
import { Module } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { generateId } from '../../utils/helpers';

interface ModuleFormProps {
  module: Module | null;
  onClose: () => void;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({ module, onClose }) => {
  const { addModule, updateModule } = useLMSStore();
  const [formData, setFormData] = useState<Partial<Module>>({
    code: '',
    titre: '',
    description: '',
    dureeHeures: 0,
    niveau: 'BAC_PRO',
    competences: [],
    prerequis: [],
  });
  const [competenceInput, setCompetenceInput] = useState('');
  const [prerequisInput, setPrerequisInput] = useState('');

  useEffect(() => {
    if (module) {
      setFormData(module);
    }
  }, [module]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (module) {
      updateModule(module.id, formData);
    } else {
      const newModule: Module = {
        ...formData,
        id: generateId(),
        competences: formData.competences || [],
        prerequis: formData.prerequis || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Module;
      addModule(newModule);
    }

    onClose();
  };

  const addCompetence = () => {
    if (competenceInput.trim()) {
      setFormData({
        ...formData,
        competences: [...(formData.competences || []), competenceInput.trim()],
      });
      setCompetenceInput('');
    }
  };

  const removeCompetence = (index: number) => {
    setFormData({
      ...formData,
      competences: formData.competences?.filter((_, i) => i !== index),
    });
  };

  const addPrerequis = () => {
    if (prerequisInput.trim()) {
      setFormData({
        ...formData,
        prerequis: [...(formData.prerequis || []), prerequisInput.trim()],
      });
      setPrerequisInput('');
    }
  };

  const removePrerequis = (index: number) => {
    setFormData({
      ...formData,
      prerequis: formData.prerequis?.filter((_, i) => i !== index),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={module ? 'Modifier le module' : 'Nouveau module'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code du module"
            value={formData.code || ''}
            onChange={(value) => setFormData({ ...formData, code: value })}
            required
          />
          <Select
            label="Niveau"
            value={formData.niveau || ''}
            onChange={(value) => setFormData({ ...formData, niveau: value as any })}
            options={[
              { value: 'CAP', label: 'CAP' },
              { value: 'BAC_PRO', label: 'Bac Pro' },
              { value: 'BTS', label: 'BTS' },
            ]}
            required
          />
        </div>

        <Input
          label="Titre du module"
          value={formData.titre || ''}
          onChange={(value) => setFormData({ ...formData, titre: value })}
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

        <Input
          label="Durée (heures)"
          type="number"
          value={String(formData.dureeHeures || '')}
          onChange={(value) => setFormData({ ...formData, dureeHeures: parseInt(value) || 0 })}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Compétences</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={competenceInput}
              onChange={setCompetenceInput}
              placeholder="Ajouter une compétence"
              className="mb-0"
            />
            <Button type="button" onClick={addCompetence} variant="secondary">
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.competences?.map((comp, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {comp}
                <button
                  type="button"
                  onClick={() => removeCompetence(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={prerequisInput}
              onChange={setPrerequisInput}
              placeholder="Ajouter un prérequis"
              className="mb-0"
            />
            <Button type="button" onClick={addPrerequis} variant="secondary">
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.prerequis?.map((pre, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {pre}
                <button
                  type="button"
                  onClick={() => removePrerequis(index)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose} variant="secondary">
            Annuler
          </Button>
          <Button type="submit">
            {module ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
