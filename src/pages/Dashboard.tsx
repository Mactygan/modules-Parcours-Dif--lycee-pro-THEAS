import React from 'react';
import { useLMSStore } from '../services/store';
import { Card } from '../components/common/Card';
import { BookOpen, GraduationCap, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { modules, programmes, eleves, seances } = useLMSStore();

  const stats = [
    {
      title: 'Modules',
      count: modules.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      link: '/modules',
    },
    {
      title: 'Programmes',
      count: programmes.length,
      icon: GraduationCap,
      color: 'bg-purple-500',
      link: '/programmes',
    },
    {
      title: 'Élèves',
      count: eleves.length,
      icon: Users,
      color: 'bg-green-500',
      link: '/eleves',
    },
    {
      title: 'Séances',
      count: seances.length,
      icon: Calendar,
      color: 'bg-orange-500',
      link: '/plannings',
    },
  ];

  const seancesProchaines = seances
    .filter((s) => new Date(s.dateDebut) > new Date() && s.statut === 'planifie')
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <stat.icon className="text-white" size={32} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Prochaines séances</h2>
          {seancesProchaines.length > 0 ? (
            <div className="space-y-3">
              {seancesProchaines.map((seance) => (
                <div
                  key={seance.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Calendar className="text-primary-600 mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{seance.titre}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(seance.dateDebut).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{seance.salle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune séance à venir</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Modules récents</h2>
          {modules.length > 0 ? (
            <div className="space-y-3">
              {modules.slice(0, 5).map((module) => (
                <div
                  key={module.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <BookOpen className="text-primary-600 mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {module.code} - {module.titre}
                    </h3>
                    <p className="text-sm text-gray-600">{module.dureeHeures}h</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun module créé</p>
          )}
        </Card>
      </div>
    </div>
  );
};
