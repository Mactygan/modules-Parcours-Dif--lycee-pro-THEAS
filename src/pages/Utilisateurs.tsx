import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, UserPlus, Search } from "lucide-react";
import { User, Role } from '@/types';
import { useToast } from "@/hooks/use-toast";

const Utilisateurs: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // État pour le formulaire d'ajout/modification d'utilisateur
  const [formPrenom, setFormPrenom] = useState('');
  const [formNom, setFormNom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>('enseignant');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers = users.filter(user => 
    user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ouvrir le formulaire d'ajout d'utilisateur
  const handleAddUser = () => {
    setFormPrenom('');
    setFormNom('');
    setFormEmail('');
    setFormRole('enseignant');
    setFormPassword('');
    setFormError('');
    setIsAddUserOpen(true);
  };

  // Ouvrir le formulaire de modification d'utilisateur
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormPrenom(user.prenom);
    setFormNom(user.nom);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword('');
    setFormError('');
    setIsEditUserOpen(true);
  };

  // Ouvrir la confirmation de suppression d'utilisateur
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserOpen(true);
  };

  // Validation du formulaire
  const validateForm = (isEdit: boolean) => {
    if (!formPrenom || !formNom || !formEmail || !formRole) {
      setFormError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    if (!isEdit && !formPassword) {
      setFormError('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return false;
    }
    
    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      setFormError('Veuillez entrer une adresse email valide');
      return false;
    }
    
    return true;
  };

  // Soumettre le formulaire d'ajout d'utilisateur
  const handleAddUserSubmit = () => {
    if (!validateForm(false)) return;
    
    // Vérifier si l'email existe déjà
    if (users.some(user => user.email.toLowerCase() === formEmail.toLowerCase())) {
      setFormError('Cette adresse email est déjà utilisée');
      return;
    }
    
    addUser({
      prenom: formPrenom,
      nom: formNom,
      email: formEmail,
      role: formRole,
    });
    
    setIsAddUserOpen(false);
  };

  // Soumettre le formulaire de modification d'utilisateur
  const handleEditUserSubmit = () => {
    if (!selectedUser || !validateForm(true)) return;
    
    // Vérifier si l'email existe déjà (sauf pour l'utilisateur en cours)
    if (users.some(user => 
      user.id !== selectedUser.id && 
      user.email.toLowerCase() === formEmail.toLowerCase()
    )) {
      setFormError('Cette adresse email est déjà utilisée');
      return;
    }
    
    updateUser(selectedUser.id, {
      prenom: formPrenom,
      nom: formNom,
      email: formEmail,
      role: formRole,
    });
    
    setIsEditUserOpen(false);
  };

  // Confirmer la suppression d'un utilisateur
  const handleDeleteUserConfirm = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    setIsDeleteUserOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">Administrez les utilisateurs de la plateforme</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.nom}</TableCell>
                    <TableCell>{user.prenom}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? 'Administrateur' : 'Enseignant'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditUser(user)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteUser(user)}
                          className="text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal d'ajout d'utilisateur */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur pour la plateforme
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="required">Prénom</Label>
                <Input
                  id="prenom"
                  value={formPrenom}
                  onChange={(e) => setFormPrenom(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="required">Nom</Label>
                <Input
                  id="nom"
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="required">Email</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="required">Rôle</Label>
              <Select 
                value={formRole} 
                onValueChange={(value) => setFormRole(value as Role)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enseignant">Enseignant</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="required">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required
              />
            </div>
            
            {formError && (
              <div className="text-sm font-medium text-destructive">{formError}</div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddUserSubmit}>
              Créer l'utilisateur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de modification d'utilisateur */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prenom" className="required">Prénom</Label>
                <Input
                  id="edit-prenom"
                  value={formPrenom}
                  onChange={(e) => setFormPrenom(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nom" className="required">Nom</Label>
                <Input
                  id="edit-nom"
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="required">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="required">Rôle</Label>
              <Select 
                value={formRole} 
                onValueChange={(value) => setFormRole(value as Role)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enseignant">Enseignant</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nouveau mot de passe (laisser vide pour ne pas modifier)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
            </div>
            
            {formError && (
              <div className="text-sm font-medium text-destructive">{formError}</div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditUserSubmit}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression d'utilisateur */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <p className="font-medium">{selectedUser.prenom} {selectedUser.nom}</p>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUserConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Utilisateurs;
