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
  deleteCertification,
  useCertifications
} from "@/lib/supabase";
import {
  Edit,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CertificationsAdmin() {
  const { isGuest } = useAdminGuest();
  const { certifications, loading, error } = useCertifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (certId, certTitle) => {
    setDeleteLoading(certId);
    setDeleteError("");
    
    const result = await deleteCertification(certId);
    
    if (result.success) {
      window.location.reload();
    } else {
      setDeleteError(result.error);
    }
    
    setDeleteLoading("");
  };

  // Filtrer les certifications
  const filteredCertifications = certifications?.filter(cert => {
    const matchesSearch = cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    
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
        <AlertDescription>Erreur lors du chargement des certifications: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
          <p className="text-gray-600">
            Gérez vos certifications et formations
          </p>
        </div>
        <Link href="/admin/certifications/new" passHref>
          <Button disabled={isGuest}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle certification
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
                placeholder="Rechercher une certification..."
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
                <SelectItem value="completed">Obtenue</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="planned">Planifiée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{certifications?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total certifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {certifications?.filter(c => c.status === 'completed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Obtenues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {certifications?.filter(c => c.status === 'in_progress').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {certifications?.filter(c => c.status === 'planned').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Planifiées</p>
          </CardContent>
        </Card>
      </div>

      {/* Message d'erreur */}
      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {/* Liste des certifications */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCertifications.map((cert) => (
          <Card key={cert.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{cert.title}</CardTitle>
                  <CardDescription>{cert.provider}</CardDescription>
                </div>
                <Badge 
                  className={
                    cert.status === 'completed' ? 'bg-green-600 text-white' :
                    cert.status === 'to_deploy' ? 'bg-emerald-500 text-white' :
                    cert.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-800'
                  }
                >
                  {cert.status === 'completed' ? '✓ Obtenue' : 
                   cert.status === 'to_deploy' ? '🚀 À déployer' :
                   cert.status === 'in_progress' ? '⏳ En cours' : '📋 Planifiée'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                {/* Année */}
                {cert.year && (
                  <div className="text-sm text-muted-foreground">
                    Année: {cert.year}
                  </div>
                )}

                {/* Description */}
                {cert.description_fr && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {cert.description_fr}
                  </p>
                )}

                {/* Liens */}
                {cert.certificate_urls && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(cert.certificate_urls).map(([type, url]) => {
                      const linkLabels = {
                        certificate: 'Certificat',
                        course: 'Cours',
                        verification: 'Vérification',
                        documentation: 'Documentation',
                        tutorials: 'Tutoriels',
                        figma: 'Figma'
                      };
                      return (
                        <a key={type} href={url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {linkLabels[type] || type}
                          </Button>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions - stuck to bottom */}
              <div className="flex gap-2 pt-3 mt-auto border-t">
                  <Link href={`/admin/certifications/edit/${cert.id}`} className="flex-1" passHref>
                    <Button variant="outline" size="sm" className="w-full" disabled={isGuest}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
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
                        <AlertDialogTitle>Supprimer la certification</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la certification "{cert.title}" ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(cert.id, cert.title)}
                          disabled={deleteLoading === cert.id}
                        >
                          {deleteLoading === cert.id ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* État vide */}
      {filteredCertifications.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all" ? "Aucune certification trouvée" : "Aucune certification"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre première certification"
                }
              </p>
              <Link href="/admin/certifications/new" passHref>
                <Button disabled={isGuest}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle certification
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

