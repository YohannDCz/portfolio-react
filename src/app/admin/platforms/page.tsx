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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminGuest } from "@/contexts/AdminGuestContext";
import {
  createFreelancePlatform,
  deleteFreelancePlatform,
  updateFreelancePlatform,
  useFreelancePlatforms
} from "@/lib/supabase";
import {
  Edit,
  ExternalLink,
  Globe,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";

const PREDEFINED_PLATFORMS = [
  {
    name: 'Malt',
    url: 'https://malt.fr',
    description_fr: 'Plateforme française de freelance tech',
    description_en: 'French tech freelance platform',
    rating: 4.5,
    reviews_count: 150
  },
  {
    name: 'Upwork',
    url: 'https://upwork.com',
    description_fr: 'Plateforme internationale de freelance',
    description_en: 'International freelance platform',
    rating: 4.2,
    reviews_count: 89
  },
  {
    name: 'Freelancer',
    url: 'https://freelancer.com',
    description_fr: 'Marketplace global pour freelances',
    description_en: 'Global marketplace for freelancers',
    rating: 4.0,
    reviews_count: 45
  },
  {
    name: 'Fiverr',
    url: 'https://fiverr.com',
    description_fr: 'Plateforme de services créatifs',
    description_en: 'Creative services platform',
    rating: 4.3,
    reviews_count: 76
  },
  {
    name: '99designs',
    url: 'https://99designs.com',
    description_fr: 'Plateforme spécialisée en design',
    description_en: 'Design specialized platform',
    rating: 4.1,
    reviews_count: 32
  }
];

interface FormData {
  name: string;
  url: string;
  description_fr: string;
  description_en: string;
  description_hi: string;
  description_ar: string;
  rating: number;
  reviews_count: number;
}

interface PredefinedPlatform {
  name: string;
  url: string;
  description_fr: string;
  description_en: string;
  rating: number;
  reviews_count: number;
}

export default function PlatformsAdmin() {
  const { isGuest } = useAdminGuest();
  const { platforms, loading, error } = useFreelancePlatforms();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");

  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    description_fr: '',
    description_en: '',
    description_hi: '',
    description_ar: '',
    rating: 0,
    reviews_count: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description_fr: '',
      description_en: '',
      description_hi: '',
      description_ar: '',
      rating: 0,
      reviews_count: 0
    });
    setEditingPlatform(null);
    setShowAddForm(false);
  };

  const startEdit = (platform: any) => {
    setFormData({
      name: platform.name || '',
      url: platform.url || '',
      description_fr: platform.description_fr || '',
      description_en: platform.description_en || '',
      description_hi: platform.description_hi || '',
      description_ar: platform.description_ar || '',
      rating: platform.rating || 0,
      reviews_count: platform.reviews_count || 0
    });
    setEditingPlatform(platform.id);
    setShowAddForm(false);

    // Scroll vers le haut pour voir le formulaire d'édition
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(editingPlatform ? 'update' : 'create');
    setActionError("");

    if (!formData.name.trim() || !formData.url.trim()) {
      setActionError("Le nom et l'URL sont obligatoires");
      setActionLoading("");
      return;
    }

    let result;
    if (editingPlatform) {
      result = await updateFreelancePlatform(editingPlatform, formData);
    } else {
      result = await createFreelancePlatform(formData);
    }

    if (result.success) {
      resetForm();
      window.location.reload();
    } else {
      setActionError(result.error);
    }

    setActionLoading("");
  };

  const handleDelete = async (platformId: string, platformName: string) => {
    setActionLoading(platformId);
    setActionError("");

    const result = await deleteFreelancePlatform(platformId);

    if (result.success) {
      window.location.reload();
    } else {
      setActionError(result.error);
    }

    setActionLoading("");
  };

  const addPredefinedPlatform = async (predefinedPlatform: PredefinedPlatform) => {
    setActionLoading('predefined');
    const result = await createFreelancePlatform(predefinedPlatform);
    if (result.success) {
      window.location.reload();
    } else {
      setActionError(result.error);
    }
    setActionLoading("");
  };

  // Filtrer les plateformes
  const filteredPlatforms = platforms?.filter(platform => {
    const matchesSearch = platform.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.description_fr?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  // Plateformes prédéfinies non encore ajoutées
  const availablePredefined = PREDEFINED_PLATFORMS.filter(predefined =>
    !platforms?.some(platform => platform.name.toLowerCase() === predefined.name.toLowerCase())
  );

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

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
        <AlertDescription>Erreur lors du chargement des plateformes: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plateformes Freelance</h1>
          <p className="text-gray-600">
            Gérez vos profils sur les plateformes de freelance
          </p>
        </div>
        <Button onClick={() => {
          setShowAddForm(!showAddForm);
          if (!showAddForm) {
            // Scroll vers le haut pour voir le formulaire
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }}
          disabled={isGuest}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle plateforme
        </Button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {(showAddForm || editingPlatform) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPlatform ? 'Modifier la plateforme' : 'Nouvelle plateforme'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset disabled={isGuest} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la plateforme *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="ex: Malt"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">URL du profil *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="https://malt.fr/profile/username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Note (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                      placeholder="4.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviews_count">Nombre d&apos;avis</Label>
                    <Input
                      id="reviews_count"
                      type="number"
                      min="0"
                      value={formData.reviews_count}
                      onChange={(e) => handleInputChange('reviews_count', parseInt(e.target.value) || 0)}
                      placeholder="150"
                    />
                  </div>
                </div>

                {/* Descriptions multilingues */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="description_fr">Description (Français)</Label>
                    <Textarea
                      id="description_fr"
                      value={formData.description_fr}
                      onChange={(e) => handleInputChange('description_fr', e.target.value)}
                      placeholder="Description de votre profil sur cette plateforme..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_en">Description (Anglais)</Label>
                    <Textarea
                      id="description_en"
                      value={formData.description_en}
                      onChange={(e) => handleInputChange('description_en', e.target.value)}
                      placeholder="Description of your profile on this platform..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_hi">Description (Hindi)</Label>
                    <Textarea
                      id="description_hi"
                      value={formData.description_hi}
                      onChange={(e) => handleInputChange('description_hi', e.target.value)}
                      placeholder="इस प्लेटफॉर्म पर आपकी प्रोफ़ाइल का विवरण..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_ar">Description (Arabe)</Label>
                    <Textarea
                      id="description_ar"
                      value={formData.description_ar}
                      onChange={(e) => handleInputChange('description_ar', e.target.value)}
                      placeholder="وصف ملفك الشخصي على هذه المنصة..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={actionLoading === 'create' || actionLoading === 'update' || isGuest}>
                    <Save className="w-4 h-4 mr-2" />
                    {actionLoading === 'create' || actionLoading === 'update' ? 'Sauvegarde...' :
                      editingPlatform ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plateformes suggérées */}
      {availablePredefined.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plateformes suggérées</CardTitle>
            <CardDescription>
              Cliquez pour ajouter rapidement des plateformes populaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {availablePredefined.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{platform.name}</h4>
                    <p className="text-sm text-gray-600">{platform.description_fr}</p>
                    {renderStars(platform.rating)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPredefinedPlatform(platform)}
                    disabled={actionLoading === 'predefined' || isGuest}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une plateforme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{platforms?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total plateformes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {Math.round((platforms?.reduce((sum, p) => sum + (p.rating || 0), 0) / (platforms?.length || 1)) * 10) / 10 || 0}
            </div>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {platforms?.reduce((sum, p) => sum + (p.reviews_count || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total avis</p>
          </CardContent>
        </Card>
      </div>

      {/* Message d'erreur */}
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Liste des plateformes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlatforms.map((platform) => (
          <Card key={platform.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {platform.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {platform.description_fr}
                  </CardDescription>
                </div>
                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Note et avis */}
                <div className="flex items-center justify-between">
                  {renderStars(platform.rating || 0)}
                  <Badge variant="secondary" className="text-xs">
                    {platform.reviews_count || 0} avis
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEdit(platform)}
                    disabled={isGuest}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>

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
                        <AlertDialogTitle>Supprimer la plateforme</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la plateforme {`"${platform.name}"`} ?
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(platform.id, platform.name)}
                          disabled={actionLoading === platform.id}
                        >
                          {actionLoading === platform.id ? "Suppression..." : "Supprimer"}
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
      {filteredPlatforms.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "Aucune plateforme trouvée" : "Aucune plateforme"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Commencez par ajouter vos plateformes freelance"
                }
              </p>
              <Button onClick={() => {
                setShowAddForm(true);
                // Scroll vers le haut pour voir le formulaire
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
                disabled={isGuest}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle plateforme
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
