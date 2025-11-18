import React, { useState, useEffect } from 'react';
import { useLMSStore } from '../../services/store';
import { Eleve } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { generateId, validerEmail, validerTelephone } from '../../utils/helpers';

interface EleveFormProps {
  eleve: Eleve | null;
  onClose: () => void;
}

export const EleveForm: React.FC<EleveFormProps> = ({ eleve, onClose }) => {
  const { addEleve, updateEleve } = useLMSStore();
  const [formData, setFormData] = useState<Partial<Eleve>>({
    nom: '',
    prenom: '',
    dateNaissance: new Date(),
    email: '',
    telephone: '',
    classe: '',
    niveau: 'BAC_PRO',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eleve) {
      setFormData(eleve);
    }
  }, [eleve]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom?.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (formData.email && !validerEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.telephone && !validerTelephone(formData.telephone)) {
      newErrors.telephone = 'Téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (eleve) {
      updateEleve(eleve.id, formData);
    } else {
      const newEleve: Eleve = {
        ...formData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Eleve;
      addEleve(newEleve);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={eleve ? 'Modifier l\'élève' : 'Nouvel élève'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom"
            value={formData.nom || ''}
            onChange={(value) => setFormData({ ...formData, nom: value })}
            error={errors.nom}
            required
          />
          <Input
            label="Prénom"
            value={formData.prenom || ''}
            onChange={(value) => setFormData({ ...formData, prenom: value })}
            error={errors.prenom}
            required
          />
        </div>

        <Input
          label="Date de naissance"
          type="date"
          value={
            formData.dateNaissance instanceof Date
              ? formData.dateNaissance.toISOString().split('T')[0]
              : ''
          }
          onChange={(value) => setFormData({ ...formData, dateNaissance: new Date(value) })}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(value) => setFormData({ ...formData, email: value })}
          error={errors.email}
          required
        />

        <Input
          label="Téléphone"
          type="tel"
          value={formData.telephone || ''}
          onChange={(value) => setFormData({ ...formData, telephone: value })}
          error={errors.telephone}
          placeholder="06 12 34 56 78"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Classe"
            value={formData.classe || ''}
            onChange={(value) => setFormData({ ...formData, classe: value })}
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

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" onClick={onClose} variant="secondary">
            Annuler
          </Button>
          <Button type="submit">
            {eleve ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
