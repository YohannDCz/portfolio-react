'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminGuest } from "@/contexts/AdminGuestContext";
import {
    deleteProject,
    useAllProjectsProgress,
    useProjects
} from "@/lib/supabase";
import {
    CheckSquare,
    Edit,
    ExternalLink,
    Filter,
    Plus,
    Search,
    Star,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProjectsAdmin() {
  const { isGuest } = useAdminGuest();
  const { projects, loading, error } = useProjects();
  const { progressData, loading: progressLoading } = useAllProjectsProgress();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (projectId, projectTitle) => {
    setDeleteLoading(projectId);
    setDeleteError("");
    
    const result = await deleteProject(projectId);
    
    if (result.success) {
      // Recharger la page pour actualiser les données
      window.location.reload();
    } else {
      setDeleteError(result.error);
    }
    
    setDeleteLoading("");
  };

  // Filtrer les projets
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description_fr?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erreur lors du chargement des projets: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600">
            Gérez vos projets et réalisations
          </p>
        </div>
        <Link href="/admin/projects/new" passHref>
          <Button disabled={isGuest}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="planned">Planifié</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{projects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total projets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {projects?.filter(p => p.status === 'completed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Terminés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {projects?.filter(p => p.featured).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Projets mis en avant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {projects?.reduce((sum, p) => sum + (p.stars || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total étoiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Message d'erreur */}
      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {/* Liste des projets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {project.title_fr}
                    {project.featured && (
                      <Badge variant="secondary" className="text-xs">
                        EN AVANT
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mb-2">
                    {project.description_fr}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4" />
                  {project.stars}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Catégories et tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.category?.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {project.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Statut et Progression */}
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={
                        project.status === 'completed' ? 'bg-green-600 text-white' :
                        project.status === 'in_progress' ? 'bg-yellow-500 text-black dark:text-white' :
                        'bg-gray-200 text-gray-800'
                      }
                    >
                      {project.status === 'completed' ? 'Terminé' : 
                       project.status === 'in_progress' ? 'En cours' : 'Planifié'}
                    </Badge>
                    
                    {project.link && project.link !== '#' && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>

                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t flex gap-2">
                  <Link href={`/admin/projects/edit/${project.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" disabled={isGuest}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                  
                  <Link href={`/admin/kanban?project=${project.id}`}>
                    <Button variant="outline" size="sm" title="Gérer les tâches">
                      <CheckSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isGuest}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer le projet "{project.title_fr}" ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(project.id, project.title_fr)}
                          disabled={deleteLoading === project.id}
                        >
                          {deleteLoading === project.id ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* État vide */}
      {filteredProjects.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all" ? "Aucun projet trouvé" : "Aucun projet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre premier projet"
                }
              </p>
              <Link href="/admin/projects/new">
                <Button disabled={isGuest}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau projet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
