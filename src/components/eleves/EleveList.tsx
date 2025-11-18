import React, { useState } from 'react';
import { useLMSStore } from '../../services/store';
import { Eleve } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { Plus, User, Mail, Phone } from 'lucide-react';
import { formatNiveau, formatDate } from '../../utils/helpers';
import { EleveForm } from './EleveForm';
import { EleveDetail } from './EleveDetail';

export const EleveList: React.FC = () => {
  const { eleves } = useLMSStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [recherche, setRecherche] = useState('');

  const elevesFiltres = eleves.filter((eleve) => {
    const matchRecherche =
      recherche === '' ||
      eleve.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(recherche.toLowerCase()) ||
      eleve.email.toLowerCase().includes(recherche.toLowerCase());
    return matchRecherche;
  });

  const handleEdit = (eleve: Eleve) => {
    setSelectedEleve(eleve);
    setIsFormOpen(true);
  };

  const handleViewDetail = (eleve: Eleve) => {
    setSelectedEleve(eleve);
    setIsDetailOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEleve(null);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedEleve(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suivi des Élèves</h1>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Nouvel Élève
        </Button>
      </div>

      <div className="mb-6">
        <Input
          value={recherche}
          onChange={setRecherche}
          placeholder="Rechercher un élève..."
          className="mb-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elevesFiltres.map((eleve) => (
          <Card key={eleve.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {eleve.prenom} {eleve.nom}
                  </h3>
                  <p className="text-sm text-gray-500">{eleve.classe}</p>
                </div>
              </div>
              <Badge variant="primary">{formatNiveau(eleve.niveau)}</Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span className="truncate">{eleve.email}</span>
              </div>
              {eleve.telephone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{eleve.telephone}</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                Né(e) le {formatDate(eleve.dateNaissance)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleViewDetail(eleve)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Voir détails
              </Button>
              <Button
                onClick={() => handleEdit(eleve)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Modifier
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {elevesFiltres.length === 0 && (
        <div className="text-center py-12">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Aucun élève trouvé</p>
        </div>
      )}

      {isFormOpen && (
        <EleveForm eleve={selectedEleve} onClose={handleCloseForm} />
      )}

      {isDetailOpen && selectedEleve && (
        <EleveDetail eleve={selectedEleve} onClose={handleCloseDetail} />
      )}
    </div>
  );
};
