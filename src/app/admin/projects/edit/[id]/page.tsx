'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminGuest } from '@/contexts/AdminGuestContext';
import { useTranslation } from '@/hooks/useTranslation';
import { getProject, updateProject, uploadImageAndGetPublicUrl } from '@/lib/supabase';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';

// TypeScript imports et interfaces
import type { Project } from '@/types';

interface ProjectFormData {
  external_id: string;
  title_fr: string;
  title_en: string;
  title_ar: string;
  title_hi: string;
  description_fr: string;
  description_en: string;
  description_hi: string;
  description_ar: string;
  category: string[];
  tags: string[];
  stars: number;
  link: string;
  github_url: string;
  figma_url: string;
  image_url: string;
  status: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
  featured: boolean;
  is_mega_project: boolean;
  stack: string;
  priority: number;
  sort_order: number;
}

const CATEGORIES: readonly string[] = ['web', 'mobile', 'design', 'autre'] as const;
const TECH_TAGS: readonly string[] = [
  'React',
  'Vue.js',
  'Angular',
  'Next.js',
  'Nuxt.js',
  'Node.js',
  'Express',
  'PHP',
  'Laravel',
  'Python',
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'TypeScript',
  'JavaScript',
  'HTML',
  'CSS',
  'Sass',
  'Tailwind CSS',
  'Bootstrap',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Firebase',
  'Supabase',
  'Docker',
  'AWS',
] as const;

export default function EditProject(): JSX.Element {
  const { isGuest } = useAdminGuest();
  const router = useRouter();
  const params = useParams();
  const id: string | undefined = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // State variables avec typage TypeScript complet
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);

  // État du formulaire avec typage TypeScript
  const [formData, setFormData] = useState<ProjectFormData>({
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
    figma_url: '',
    image_url: '',
    status: 'completed',
    featured: false,
    is_mega_project: false,
    stack: '',
    priority: 1,
    sort_order: 0,
  });

  const [newTag, setNewTag] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { translateFields, translating } = useTranslation();

  // Récupérer le projet à éditer avec typage TypeScript
  useEffect(() => {
    const fetchProject = async (): Promise<void> => {
      if (!id) {
        setError('ID du projet manquant');
        setFetchLoading(false);
        return;
      }

      setFetchLoading(true);
      setError('');

      const result = await getProject(id);

      if (result.success) {
        setProject(result.data || null);
        setFormData({
          external_id: result.data?.external_id || '',
          title_fr: result.data?.title_fr || '',
          title_en: result.data?.title_en || '',
          title_hi: result.data?.title_hi || '',
          title_ar: result.data?.title_ar || '',
          description_fr: result.data?.description_fr || '',
          description_en: result.data?.description_en || '',
          description_hi: result.data?.description_hi || '',
          description_ar: result.data?.description_ar || '',
          category: result.data?.category || [],
          tags: result.data?.tags || [],
          stars: result.data?.stars || 0,
          link: result.data?.link || '',
          github_url: result.data?.github_url || '',
          figma_url: result.data?.figma_url || '',
          image_url: result.data?.image_url || '',
          status: result.data?.status || 'completed',
          featured: result.data?.featured || false,
          is_mega_project: result.data?.is_mega_project || false,
          stack: result.data?.stack || '',
          priority: result.data?.priority || 1,
          sort_order: result.data?.sort_order || 0,
        });
      } else {
        setError(`Erreur lors du chargement du projet: ${result.error}`);
      }

      setFetchLoading(false);
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleInputChange = (field: keyof ProjectFormData, value: any): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      category: checked
        ? [...prev.category, category]
        : prev.category.filter((c) => c !== category),
    }));
  };

  const addTag = (tag: string): void => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string): void => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation basique
    if (!formData.title_fr || !formData.title_en) {
      setError('Les titres en français et anglais sont obligatoires');
      setLoading(false);
      return;
    }

    if (formData.category.length === 0) {
      setError('Sélectionnez au moins une catégorie');
      setLoading(false);
      return;
    }

    let payload = { ...formData };
    if (imageFile) {
      const upload = await uploadImageAndGetPublicUrl({
        bucket: 'images',
        folder: 'projects',
        file: imageFile,
      });
      if (!upload.success) {
        setError(upload.error || "Erreur lors de l'upload de l'image");
        setLoading(false);
        return;
      }
      payload.image_url = upload.url || '';
    }

    if (!id) {
      setError('ID du projet manquant');
      setLoading(false);
      return;
    }

    const result = await updateProject(id, payload);

    if (result.success) {
      router.push('/admin/projects');
    } else {
      setError(result.error || 'Erreur lors de la mise à jour du projet');
    }

    setLoading(false);
  };

  const handleAutoTranslate = async () => {
    const fieldMappings = [
      {
        sourceField: 'title_fr',
        targetFields: ['title_en', 'title_hi', 'title_ar'],
      },
      {
        sourceField: 'title_en',
        targetFields: ['title_fr', 'title_hi', 'title_ar'],
      },
      {
        sourceField: 'description_fr',
        targetFields: ['description_en', 'description_hi', 'description_ar'],
      },
      {
        sourceField: 'description_en',
        targetFields: ['description_fr', 'description_hi', 'description_ar'],
      },
    ];

    const result = await translateFields(
      formData as Record<string, any>,
      setFormData as React.Dispatch<React.SetStateAction<Record<string, any>>>,
      fieldMappings,
      true,
    );

    if (result.success) {
      // console.log(`✅ Translated ${result.translated} fields - Page will refresh soon!`)
    } else if (result.error) {
      // console.error('❌ Translation failed:', result.error)
    }
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier le Projet</h1>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier le Projet</h1>
            <p className="text-gray-600">Erreur lors du chargement</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Modifier le Projet</h1>
          <p className="text-gray-600">
            Modifiez les informations de &quot;{project?.title_fr}&rdquo;
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isGuest} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Détails de base du projet</CardDescription>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoTranslate}
                    disabled={translating}
                  >
                    {translating ? 'Traduction...' : 'Traduire automatiquement'}
                  </Button>
                </div>
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
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_ar">Titre (Arabe)</Label>
                  <Input
                    id="title_ar"
                    value={formData.title_ar}
                    onChange={(e) => handleInputChange('title_ar', e.target.value)}
                    placeholder="Nom du projet en arabe"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Descriptions</CardTitle>
                <CardDescription>Descriptions multilingues du projet</CardDescription>
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
                    disabled
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
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Catégories et technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Catégories et Technologies</CardTitle>
              <CardDescription>Classification et technologies utilisées</CardDescription>
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
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category, Boolean(checked))
                        }
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
                      {TECH_TAGS.filter((tag) => !formData.tags.includes(tag)).map((tag) => (
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
                      disabled={isGuest}
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
                <CardDescription>Configuration du projet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="to_deploy">À déployer</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="planned">Planifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stars">Nombre d&rsquo;étoiles</Label>
                  <Input
                    id="stars"
                    type="number"
                    min="0"
                    value={formData.stars}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Handle empty string or non-numeric input
                      if (value === '' || value === null || value === undefined) {
                        handleInputChange('stars', 0);
                      } else {
                        const numValue = parseInt(value, 10);
                        handleInputChange('stars', isNaN(numValue) ? 0 : numValue);
                      }
                    }}
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <Label htmlFor="featured">Nouveau Projet (Mettre en avant)</Label>
                </div>

                {formData.is_mega_project && (
                  <div className="space-y-2">
                    <Label htmlFor="stack">Stack principal</Label>
                    <Select
                      value={formData.stack}
                      onValueChange={(value) => handleInputChange('stack', value)}
                    >
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
                <CardDescription>URLs et liens du projet</CardDescription>
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
                  <Label htmlFor="figma_url">Lien Figma</Label>
                  <Input
                    id="figma_url"
                    type="url"
                    value={formData.figma_url}
                    onChange={(e) => handleInputChange('figma_url', e.target.value)}
                    placeholder="https://figma.com/file/..."
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
                  <div className="grid gap-2">
                    <Label htmlFor="image_file">ou téléverser une image</Label>
                    <Input
                      id="image_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
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
                <Button type="submit" disabled={loading || isGuest}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour le projet'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </fieldset>
      </form>
    </div>
  );
}
