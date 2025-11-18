import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profil: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Vous devez être connecté pour accéder à votre profil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profil utilisateur</h1>
        <p className="text-muted-foreground">Consultez et modifiez vos informations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations d'identification sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input value={currentUser.prenom} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={currentUser.nom} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentUser.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Input
                value={currentUser.role === 'admin' ? 'Administrateur' : 'Enseignant'}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profil;
