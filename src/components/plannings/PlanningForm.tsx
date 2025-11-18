import React, { useState, useEffect } from 'react';
import { useLMSStore } from '../../services/store';
import { SeanceCours } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { generateId } from '../../utils/helpers';

interface PlanningFormProps {
  seance: SeanceCours | null;
  onClose: () => void;
}

export const PlanningForm: React.FC<PlanningFormProps> = ({ seance, onClose }) => {
  const { addSeance, updateSeance, modules, classes } = useLMSStore();
  const [formData, setFormData] = useState<Partial<SeanceCours>>({
    moduleId: '',
    titre: '',
    description: '',
    dateDebut: new Date(),
    dateFin: new Date(),
    salle: '',
    enseignant: '',
    classeId: '',
    type: 'cours',
    ressources: [],
    statut: 'planifie',
  });
  const [ressourceInput, setRessourceInput] = useState('');

  useEffect(() => {
    if (seance) {
      setFormData(seance);
    }
  }, [seance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (seance) {
      updateSeance(seance.id, formData);
    } else {
      const newSeance: SeanceCours = {
        ...formData,
        id: generateId(),
        ressources: formData.ressources || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SeanceCours;
      addSeance(newSeance);
    }

    onClose();
  };

  const addRessource = () => {
    if (ressourceInput.trim()) {
      setFormData({
        ...formData,
        ressources: [...(formData.ressources || []), ressourceInput.trim()],
      });
      setRessourceInput('');
    }
  };

  const removeRessource = (index: number) => {
    setFormData({
      ...formData,
      ressources: formData.ressources?.filter((_, i) => i !== index),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={seance ? 'Modifier la séance' : 'Nouvelle séance'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Titre de la séance"
          value={formData.titre || ''}
          onChange={(value) => setFormData({ ...formData, titre: value })}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Module"
            value={formData.moduleId || ''}
            onChange={(value) => setFormData({ ...formData, moduleId: value })}
            options={modules.map((m) => ({ value: m.id, label: `${m.code} - ${m.titre}` }))}
            required
          />
          <Select
            label="Classe"
            value={formData.classeId || ''}
            onChange={(value) => setFormData({ ...formData, classeId: value })}
            options={classes.map((c) => ({ value: c.id, label: c.nom }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={formData.type || ''}
            onChange={(value) => setFormData({ ...formData, type: value as any })}
            options={[
              { value: 'cours', label: 'Cours' },
              { value: 'tp', label: 'TP' },
              { value: 'td', label: 'TD' },
              { value: 'examen', label: 'Examen' },
              { value: 'projet', label: 'Projet' },
            ]}
            required
          />
          <Select
            label="Statut"
            value={formData.statut || ''}
            onChange={(value) => setFormData({ ...formData, statut: value as any })}
            options={[
              { value: 'planifie', label: 'Planifié' },
              { value: 'en_cours', label: 'En cours' },
              { value: 'termine', label: 'Terminé' },
              { value: 'annule', label: 'Annulé' },
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date et heure de début"
            type="datetime-local"
            value={
              formData.dateDebut instanceof Date
                ? formData.dateDebut.toISOString().slice(0, 16)
                : ''
            }
            onChange={(value) => setFormData({ ...formData, dateDebut: new Date(value) })}
            required
          />
          <Input
            label="Date et heure de fin"
            type="datetime-local"
            value={
              formData.dateFin instanceof Date
                ? formData.dateFin.toISOString().slice(0, 16)
                : ''
            }
            onChange={(value) => setFormData({ ...formData, dateFin: new Date(value) })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Salle"
            value={formData.salle || ''}
            onChange={(value) => setFormData({ ...formData, salle: value })}
            required
          />
          <Input
            label="Enseignant"
            value={formData.enseignant || ''}
            onChange={(value) => setFormData({ ...formData, enseignant: value })}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ressources pédagogiques
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={ressourceInput}
              onChange={setRessourceInput}
              placeholder="Nom du fichier ou lien"
              className="mb-0"
            />
            <Button type="button" onClick={addRessource} variant="secondary">
              Ajouter
            </Button>
          </div>
          <div className="space-y-1">
            {formData.ressources?.map((ressource, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-sm">{ressource}</span>
                <button
                  type="button"
                  onClick={() => removeRessource(index)}
                  className="text-gray-600 hover:text-gray-800"
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
            {seance ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
