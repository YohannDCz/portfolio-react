'use client';

import CertificationDragDrop from "@/components/CertificationDragDrop";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminGuest } from "@/contexts/AdminGuestContext";
import {
  deleteCertification,
  reorderCertifications,
  useCertifications
} from "@/lib/supabase";
import {
  Filter,
  Plus,
  Search
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

  const handleDelete = async (certId: string, certTitle: string) => {
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

  const handleReorder = async (reorderedCertifications: any[]) => {
    try {
      const result = await reorderCertifications(reorderedCertifications);
      if (result.success) {
        // Refresh data or update local state
        window.location.reload();
      } else {
        setDeleteError(result.error);
      }
    } catch (error) {
      setDeleteError("Erreur lors de la réorganisation");
    }
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

      {/* Drag & Drop Certification List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {isGuest
                ? "Mode lecture seule - Réorganisation désactivée"
                : "Glissez-déposez pour réorganiser les certifications"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              L&apos;ordre sera reflété sur la page d&apos;accueil
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredCertifications.length} certification{filteredCertifications.length > 1 ? 's' : ''}
          </Badge>
        </div>

        <CertificationDragDrop
          certifications={filteredCertifications}
          onReorder={handleReorder}
          onDelete={handleDelete}
          deleteLoading={deleteLoading}
          currentLang="fr"
        />
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
