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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminGuest } from "@/contexts/AdminGuestContext";
import {
  createSkill,
  deleteSkill,
  updateSkill,
  useSkills
} from "@/lib/supabase";
import {
  Code,
  Edit,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";

const SKILL_CATEGORIES = [
  'frontend',
  'backend',
  'mobile',
  'database',
  'devops',
  'design',
  'tools',
  'other'
];

const PREDEFINED_SKILLS = [
  // Frontend
  { name: 'React', category: 'frontend', level: 90 },
  { name: 'Vue.js', category: 'frontend', level: 85 },
  { name: 'Angular', category: 'frontend', level: 75 },
  { name: 'Next.js', category: 'frontend', level: 85 },
  { name: 'TypeScript', category: 'frontend', level: 80 },
  { name: 'JavaScript', category: 'frontend', level: 90 },
  { name: 'HTML/CSS', category: 'frontend', level: 95 },
  { name: 'Tailwind CSS', category: 'frontend', level: 90 },

  // Backend
  { name: 'Node.js', category: 'backend', level: 85 },
  { name: 'PHP', category: 'backend', level: 80 },
  { name: 'Python', category: 'backend', level: 75 },
  { name: 'Laravel', category: 'backend', level: 80 },
  { name: 'Express.js', category: 'backend', level: 85 },

  // Mobile
  { name: 'React Native', category: 'mobile', level: 80 },
  { name: 'Flutter', category: 'mobile', level: 75 },
  { name: 'Swift', category: 'mobile', level: 60 },
  { name: 'Kotlin', category: 'mobile', level: 60 },

  // Database
  { name: 'PostgreSQL', category: 'database', level: 85 },
  { name: 'MySQL', category: 'database', level: 80 },
  { name: 'MongoDB', category: 'database', level: 75 },
  { name: 'Firebase', category: 'database', level: 80 },
  { name: 'Supabase', category: 'database', level: 85 },

  // DevOps
  { name: 'Docker', category: 'devops', level: 70 },
  { name: 'AWS', category: 'devops', level: 65 },
  { name: 'Git', category: 'devops', level: 90 },
  { name: 'GitHub Actions', category: 'devops', level: 75 },

  // Design
  { name: 'Figma', category: 'design', level: 80 },
  { name: 'Adobe XD', category: 'design', level: 70 },
  { name: 'Photoshop', category: 'design', level: 75 },

  // Tools
  { name: 'VS Code', category: 'tools', level: 95 },
  { name: 'Postman', category: 'tools', level: 85 },
  { name: 'Notion', category: 'tools', level: 80 }
];

interface FormData {
  name: string;
  category: string;
  level: number;
}

interface PredefinedSkill {
  name: string;
  category: string;
  level: number;
}

export default function SkillsAdmin() {
  const { isGuest } = useAdminGuest();
  const { skills, loading, error } = useSkills();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");

  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'frontend',
    level: 50
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'frontend',
      level: 50
    });
    setEditingSkill(null);
    setShowAddForm(false);
  };

  const startEdit = (skill: any) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level
    });
    setEditingSkill(skill.id);
    setShowAddForm(false);

    // Scroll vers le haut pour voir le formulaire d'édition
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(editingSkill ? 'update' : 'create');
    setActionError("");

    if (!formData.name.trim()) {
      setActionError("Le nom de la compétence est obligatoire");
      setActionLoading("");
      return;
    }

    // Debug: Log the form data being submitted
    console.log('Submitting skill data:', formData);

    let result;
    if (editingSkill) {
      result = await updateSkill(editingSkill, formData);
    } else {
      result = await createSkill(formData);
    }

    // Debug: Log the result
    console.log('Skill creation/update result:', result);

    if (result.success) {
      resetForm();
      window.location.reload();
    } else {
      setActionError(result.error);
    }

    setActionLoading("");
  };

  const handleDelete = async (skillId: string, skillName: string) => {
    setActionLoading(skillId);
    setActionError("");

    const result = await deleteSkill(skillId);

    if (result.success) {
      window.location.reload();
    } else {
      setActionError(result.error);
    }

    setActionLoading("");
  };

  const addPredefinedSkill = async (predefinedSkill: PredefinedSkill) => {
    setActionLoading('predefined');
    const result = await createSkill(predefinedSkill);
    if (result.success) {
      window.location.reload();
    } else {
      setActionError(result.error);
    }
    setActionLoading("");
  };

  // Filtrer les compétences
  const filteredSkills = skills?.filter(skill => {
    const matchesSearch = skill.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  // Compétences prédéfinies non encore ajoutées
  const availablePredefined = PREDEFINED_SKILLS.filter(predefined =>
    !skills?.some(skill => skill.name.toLowerCase() === predefined.name.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      frontend: 'bg-blue-100 text-blue-800',
      backend: 'bg-green-100 text-green-800',
      mobile: 'bg-purple-100 text-purple-800',
      database: 'bg-orange-100 text-orange-800',
      devops: 'bg-red-100 text-red-800',
      design: 'bg-pink-100 text-pink-800',
      tools: 'bg-gray-100 text-gray-800',
      other: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || colors.other;
  };

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'text-green-600';
    if (level >= 75) return 'text-blue-600';
    if (level >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erreur lors du chargement des compétences: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compétences</h1>
          <p className="text-gray-600">
            Gérez vos compétences techniques et leur niveau
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
          Nouvelle compétence
        </Button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {(showAddForm || editingSkill) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset disabled={isGuest} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la compétence *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ex: React"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Niveau (0-100)</Label>
                    <Input
                      id="level"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.level}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseInt(value, 10);
                        setFormData(prev => ({
                          ...prev,
                          level: isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue))
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={actionLoading === 'create' || actionLoading === 'update' || isGuest}>
                    <Save className="w-4 h-4 mr-2" />
                    {actionLoading === 'create' || actionLoading === 'update' ? 'Sauvegarde...' :
                      editingSkill ? 'Mettre à jour' : 'Ajouter'}
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

      {/* Compétences prédéfinies */}
      {availablePredefined.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compétences suggérées</CardTitle>
            <CardDescription>
              Cliquez pour ajouter rapidement des compétences courantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availablePredefined.slice(0, 10).map((skill) => (
                <Button
                  key={skill.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addPredefinedSkill(skill)}
                  disabled={actionLoading === 'predefined' || isGuest}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {skill.name} ({skill.level}%)
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une compétence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Code className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {SKILL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{skills?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total compétences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {skills?.filter(s => s.level >= 90).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Expert (90%+)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {skills?.filter(s => s.level >= 75 && s.level < 90).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Avancé (75-89%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {Math.round(skills?.reduce((sum, s) => sum + s.level, 0) / (skills?.length || 1)) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Niveau moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Message d'erreur */}
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Liste des compétences */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSkills.map((skill) => (
          <Card key={skill.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <Badge className={`text-xs ${getCategoryColor(skill.category)}`}>
                      {skill.category}
                    </Badge>
                  </div>
                  <div className={`text-lg font-bold ${getLevelColor(skill.level)}`}>
                    {skill.level}%
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${skill.level >= 90 ? 'bg-green-500' :
                        skill.level >= 75 ? 'bg-blue-500' :
                          skill.level >= 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEdit(skill)}
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
                        <AlertDialogTitle>Supprimer la compétence</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la compétence "{skill.name}" ?
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(skill.id, skill.name)}
                          disabled={actionLoading === skill.id || isGuest}
                        >
                          {actionLoading === skill.id ? "Suppression..." : "Supprimer"}
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
      {filteredSkills.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Code className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || categoryFilter !== "all" ? "Aucune compétence trouvée" : "Aucune compétence"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || categoryFilter !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter vos premières compétences"
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
                Nouvelle compétence
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
