'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCertification, updateCertification } from "@/lib/supabase";
import { ArrowLeft, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCertification() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [certification, setCertification] = useState(null);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    year: '',
    status: 'planned',
    description_fr: '',
    description_en: '',
    description_hi: '',
    description_ar: ''
  });

  // URLs des liens
  const [urls, setUrls] = useState({
    certificate: '',
    course: '',
    verification: '',
    documentation: '',
    tutorials: ''
  });

  // Récupérer la certification à éditer
  useEffect(() => {
    const fetchCertification = async () => {
      setFetchLoading(true);
      setError("");
      
      const result = await getCertification(id);
      
      if (result.success) {
        const cert = result.data;
        setCertification(cert);
        
        setFormData({
          title: cert.title || '',
          provider: cert.provider || '',
          year: cert.year || '',
          status: cert.status || 'planned',
          description_fr: cert.description_fr || '',
          description_en: cert.description_en || '',
          description_hi: cert.description_hi || '',
          description_ar: cert.description_ar || ''
        });

        // Extraire les URLs des certificate_urls JSON
        if (cert.certificate_urls) {
          setUrls({
            certificate: cert.certificate_urls.certificate || '',
            course: cert.certificate_urls.course || '',
            verification: cert.certificate_urls.verification || '',
            documentation: cert.certificate_urls.documentation || '',
            tutorials: cert.certificate_urls.tutorials || ''
          });
        }
      } else {
        setError(`Erreur lors du chargement de la certification: ${result.error}`);
      }
      
      setFetchLoading(false);
    };

    if (id) {
      fetchCertification();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUrlChange = (type, value) => {
    setUrls(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const removeUrl = (type) => {
    setUrls(prev => ({
      ...prev,
      [type]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation basique
    if (!formData.title) {
      setError("Le titre est obligatoire");
      setLoading(false);
      return;
    }

    // Filtrer les URLs vides
    const certificate_urls = {};
    Object.entries(urls).forEach(([key, value]) => {
      if (value.trim()) {
        certificate_urls[key] = value.trim();
      }
    });

    const dataToSubmit = {
      ...formData,
      certificate_urls: Object.keys(certificate_urls).length > 0 ? certificate_urls : null
    };

    const result = await updateCertification(id, dataToSubmit);

    if (result.success) {
      router.push('/admin/certifications');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/certifications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier la Certification</h1>
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

  if (error && !certification) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/certifications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier la Certification</h1>
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
        <Link href="/admin/certifications">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier la Certification</h1>
          <p className="text-gray-600">
            Modifiez les informations de "{certification?.title}"
          </p>
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
                Détails de base de la certification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la certification *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="ex: React Developer Certification"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Organisme / Plateforme</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  placeholder="ex: Meta, Coursera, Udemy, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Année</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="ex: 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Obtenue</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="planned">Planifiée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liens et ressources */}
          <Card>
            <CardHeader>
              <CardTitle>Liens et ressources</CardTitle>
              <CardDescription>
                URLs liées à la certification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificate">Lien du certificat</Label>
                <div className="flex gap-2">
                  <Input
                    id="certificate"
                    type="url"
                    value={urls.certificate}
                    onChange={(e) => handleUrlChange('certificate', e.target.value)}
                    placeholder="https://certificat.com/verify/123"
                  />
                  {urls.certificate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeUrl('certificate')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Lien du cours</Label>
                <div className="flex gap-2">
                  <Input
                    id="course"
                    type="url"
                    value={urls.course}
                    onChange={(e) => handleUrlChange('course', e.target.value)}
                    placeholder="https://coursera.org/learn/react"
                  />
                  {urls.course && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeUrl('course')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification">Lien de vérification</Label>
                <div className="flex gap-2">
                  <Input
                    id="verification"
                    type="url"
                    value={urls.verification}
                    onChange={(e) => handleUrlChange('verification', e.target.value)}
                    placeholder="https://verify.org/certificate/123"
                  />
                  {urls.verification && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeUrl('verification')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentation">Documentation officielle</Label>
                <div className="flex gap-2">
                  <Input
                    id="documentation"
                    type="url"
                    value={urls.documentation}
                    onChange={(e) => handleUrlChange('documentation', e.target.value)}
                    placeholder="https://docs.react.dev"
                  />
                  {urls.documentation && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeUrl('documentation')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutorials">Tutoriels</Label>
                <div className="flex gap-2">
                  <Input
                    id="tutorials"
                    type="url"
                    value={urls.tutorials}
                    onChange={(e) => handleUrlChange('tutorials', e.target.value)}
                    placeholder="https://w3schools.com/react"
                  />
                  {urls.tutorials && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeUrl('tutorials')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Descriptions multilingues */}
        <Card>
          <CardHeader>
            <CardTitle>Descriptions</CardTitle>
            <CardDescription>
              Descriptions de la certification dans différentes langues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description_fr">Description (Français)</Label>
                <Textarea
                  id="description_fr"
                  value={formData.description_fr}
                  onChange={(e) => handleInputChange('description_fr', e.target.value)}
                  placeholder="Description de la certification en français..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">Description (Anglais)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => handleInputChange('description_en', e.target.value)}
                  placeholder="Description de la certification en anglais..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_hi">Description (Hindi)</Label>
                <Textarea
                  id="description_hi"
                  value={formData.description_hi}
                  onChange={(e) => handleInputChange('description_hi', e.target.value)}
                  placeholder="Description de la certification en hindi..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ar">Description (Arabe)</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => handleInputChange('description_ar', e.target.value)}
                  placeholder="Description de la certification en arabe..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              <Link href="/admin/certifications">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour la certification"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}



