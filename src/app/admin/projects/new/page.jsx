'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/supabase";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ['web', 'mobile', 'design', 'autre'];
const TECH_TAGS = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js',
  'Node.js', 'Express', 'PHP', 'Laravel', 'Python',
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Sass',
  'Tailwind CSS', 'Bootstrap', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Firebase', 'Supabase', 'Docker', 'AWS'
];

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // État du formulaire
  const [formData, setFormData] = useState({
    external_id: '',
    title_fr: '',
    title_en: '',
    title_hi: '',
    title_ar: '',
    description_fr: '',
    description_en: '',
    description_hi: '',
    description_ar: '',
    category: [],
    tags: [],
    stars: 0,
    link: '',
    github_url: '',
    image_url: '',
    status: 'completed',
    is_mega_project: false,
    stack: '',
    priority: 1,
    sort_order: 0
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (category, checked) => {
    setFormData(prev => ({
      ...prev,
      category: checked 
        ? [...prev.category, category]
        : prev.category.filter(c => c !== category)
    }));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation basique
    if (!formData.title_fr || !formData.title_en) {
      setError("Les titres en français et anglais sont obligatoires");
      setLoading(false);
      return;
    }

    if (formData.category.length === 0) {
      setError("Sélectionnez au moins une catégorie");
      setLoading(false);
      return;
    }

    const result = await createProject(formData);

    if (result.success) {
      router.push('/admin/projects');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Projet</h1>
          <p className="text-gray-600">Ajoutez un nouveau projet à votre portfolio</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Détails de base du projet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="external_id">ID externe (optionnel)</Label>
                <Input
                  id="external_id"
                  value={formData.external_id}
                  onChange={(e) => handleInputChange('external_id', e.target.value)}
                  placeholder="ex: np1, mega1, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_fr">Titre (Français) *</Label>
                <Input
                  id="title_fr"
                  value={formData.title_fr}
                  onChange={(e) => handleInputChange('title_fr', e.target.value)}
                  placeholder="Nom du projet en français"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_en">Titre (Anglais) *</Label>
                <Input
                  id="title_en"
                  value={formData.title_en}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  placeholder="Nom du projet en anglais"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_hi">Titre (Hindi)</Label>
                <Input
                  id="title_hi"
                  value={formData.title_hi}
                  onChange={(e) => handleInputChange('title_hi', e.target.value)}
                  placeholder="Nom du projet en hindi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_ar">Titre (Arabe)</Label>
                <Input
                  id="title_ar"
                  value={formData.title_ar}
                  onChange={(e) => handleInputChange('title_ar', e.target.value)}
                  placeholder="Nom du projet en arabe"
                />
              </div>
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Descriptions</CardTitle>
              <CardDescription>
                Descriptions multilingues du projet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description_fr">Description (Français)</Label>
                <Textarea
                  id="description_fr"
                  value={formData.description_fr}
                  onChange={(e) => handleInputChange('description_fr', e.target.value)}
                  placeholder="Description du projet en français"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">Description (Anglais)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => handleInputChange('description_en', e.target.value)}
                  placeholder="Description du projet en anglais"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_hi">Description (Hindi)</Label>
                <Textarea
                  id="description_hi"
                  value={formData.description_hi}
                  onChange={(e) => handleInputChange('description_hi', e.target.value)}
                  placeholder="Description du projet en hindi"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ar">Description (Arabe)</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => handleInputChange('description_ar', e.target.value)}
                  placeholder="Description du projet en arabe"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Catégories et technologies */}
        <Card>
          <CardHeader>
            <CardTitle>Catégories et Technologies</CardTitle>
            <CardDescription>
              Classification et technologies utilisées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Catégories */}
            <div className="space-y-2">
              <Label>Catégories *</Label>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.category.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                    />
                    <Label htmlFor={category} className="capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Technologies utilisées</Label>
              <div className="flex gap-2">
                <Select value="" onValueChange={addTag}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner une technologie" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECH_TAGS.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Autre technologie"
                    className="w-40"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(newTag)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Tags sélectionnés */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres du projet */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>
                Configuration du projet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="planned">Planifié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stars">Nombre d'étoiles</Label>
                <Input
                  id="stars"
                  type="number"
                  min="0"
                  value={formData.stars}
                  onChange={(e) => handleInputChange('stars', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_mega_project"
                  checked={formData.is_mega_project}
                  onCheckedChange={(checked) => handleInputChange('is_mega_project', checked)}
                />
                <Label htmlFor="is_mega_project">Mega Projet</Label>
              </div>

              {formData.is_mega_project && (
                <div className="space-y-2">
                  <Label htmlFor="stack">Stack principal</Label>
                  <Select value={formData.stack} onValueChange={(value) => handleInputChange('stack', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la stack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="React Native">React Native</SelectItem>
                      <SelectItem value="Flutter">Flutter</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                      <SelectItem value="Node.js">Node.js</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liens</CardTitle>
              <CardDescription>
                URLs et liens du projet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link">Lien du projet</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">Lien GitHub</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image du projet</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              <Link href="/admin/projects">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer le projet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
