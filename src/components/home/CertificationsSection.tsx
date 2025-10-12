import AdminEditButton from '@/components/AdminEditButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, ErrorMessage } from '@/components/home/LoadingState';
import { getLocalizedText } from '@/lib/supabase';
import type { TranslationContent } from '@/types/translations';
import type { Certification } from '@/types';
import type { JSX } from 'react';
import { ExternalLink } from 'lucide-react';

interface CertificationsSectionProps {
  certificationsLoading: boolean;
  certificationsError: string | null;
  paginatedCertifications: Certification[];
  currentLang: string;
  t: TranslationContent;
  isAdminMode: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (value: number) => void;
}

export default function CertificationsSection({
  certificationsLoading,
  certificationsError,
  paginatedCertifications,
  currentLang,
  t,
  isAdminMode,
  currentPage,
  totalPages,
  onPageChange,
}: CertificationsSectionProps): JSX.Element {
  return (
    <section id="cv" className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.certifications}</h2>
          <p className="text-muted-foreground">{t.certificationsSubtitle}</p>
        </div>
      </div>
      <div className="space-y-6 mt-6">
        {certificationsLoading ? (
          <LoadingSpinner />
        ) : certificationsError ? (
          <ErrorMessage message={certificationsError} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCertifications.map((c) => (
                <Card key={c.id} className="relative pt-8">
                  {isAdminMode && (
                    <AdminEditButton href={`/admin/certifications/edit/${c.id}`} className="absolute top-2 left-2 z-10" />
                  )}

                  <div className="absolute top-4 right-4">
                    <Badge
                      className={`text-xs ${
                        c.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : c.status === 'in_progress'
                            ? 'bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-zinc-200'
                            : c.status === 'to_deploy'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.status === 'completed' ? '✅' : c.status === 'in_progress' ? '⏳' : c.status === 'to_deploy' ? '🚀' : '🗂️'}
                      <span className="ml-1.5">
                        {c.status === 'completed'
                          ? t.completed
                          : c.status === 'in_progress'
                            ? t.inProgress
                            : c.status === 'to_deploy'
                              ? t.toDeploy
                              : t.planned}
                      </span>
                    </Badge>
                  </div>
                  <CardHeader className="pb-2 pt-0">
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription className="mb-2">{c.provider || 'Certification'}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <div className="flex-1">
                      {c.certificate_urls && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(c.certificate_urls).map(([type, url]) => (
                            <a key={type} href={url} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {type}
                              </Button>
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {getLocalizedText(c, 'description', currentLang)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  ←
                  <span className="hidden sm:inline">
                    {currentLang === 'ar' ? 'السابق' : currentLang === 'hi' ? 'पिछला' : 'Précédent'}
                  </span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">
                    {currentLang === 'ar' ? 'التالي' : currentLang === 'hi' ? 'अगला' : 'Suivant'}
                  </span>
                  →
                </Button>
              </div>
            )}

            {paginatedCertifications.length === 0 && !certificationsLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {currentLang === 'ar'
                    ? 'لا توجد شهادات'
                    : currentLang === 'hi'
                      ? 'कोई सर्टिफिकेशन नहीं है'
                      : 'Aucune certification'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
