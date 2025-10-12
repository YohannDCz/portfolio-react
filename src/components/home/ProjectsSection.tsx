import ProjectCard from '@/components/ProjectCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/home/LoadingState';
import type { TranslationContent } from '@/types/translations';
import type { Project } from '@/types';
import type { JSX } from 'react';

interface ProjectsSectionProps {
  query: string;
  onQueryChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  tab: string;
  onTabChange: (value: string) => void;
  projectsLoading: boolean;
  projectsError: string | null;
  paginatedProjects: Project[];
  searchResults: Project[];
  currentLang: string;
  t: TranslationContent;
  isAdminMode: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (value: number) => void;
}

export default function ProjectsSection({
  query,
  onQueryChange,
  sort,
  onSortChange,
  tab,
  onTabChange,
  projectsLoading,
  projectsError,
  paginatedProjects,
  searchResults,
  currentLang,
  t,
  isAdminMode,
  currentPage,
  totalPages,
  onPageChange,
}: ProjectsSectionProps): JSX.Element {
  const isSearching = Boolean(query);
  const totalSearchResults = searchResults.filter((p) => p.status !== 'to_deploy');

  return (
    <section id="projets" className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.projectSelection}</h2>
          <p className="text-muted-foreground">{t.projectFilter}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Input
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full sm:w-64 md:w-72"
          />
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder={t.sort} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">{t.popular}</SelectItem>
              <SelectItem value="alpha">{t.alphabetical}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isSearching ? (
        <div className="mt-6">
          <div className="mb-4">
            <p className="text-muted-foreground">
              {totalSearchResults.length}{' '}
              {totalSearchResults.length === 1 ? 'résultat trouvé' : 'résultats trouvés'}{' '}
              pour &ldquo;{query}&rdquo;
            </p>
          </div>
          {projectsLoading ? (
            <LoadingSpinner />
          ) : projectsError ? (
            <ErrorMessage message={projectsError} />
          ) : totalSearchResults.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {totalSearchResults.map((p) => (
                <ProjectCard key={p.id} project={p} currentLang={currentLang} t={t} isAdminMode={isAdminMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun projet trouvé pour &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>
      ) : (
        <Tabs value={tab} onValueChange={onTabChange} className="mt-4">
          <TabsList className="grid grid-cols-5 bg-muted w-full md:w-[560px]">
            <TabsTrigger value="tous" className="font-bold text-xs sm:text-sm dark:text-white light:text-black">
              {t.all}
            </TabsTrigger>
            <TabsTrigger value="web" className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black">
              {t.web}
            </TabsTrigger>
            <TabsTrigger value="mobile" className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black">
              {t.mobile}
            </TabsTrigger>
            <TabsTrigger value="design" className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black">
              {t.design}
            </TabsTrigger>
            <TabsTrigger value="autre" className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black">
              {t.other}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-6">
            {projectsLoading ? (
              <LoadingSpinner />
            ) : projectsError ? (
              <ErrorMessage message={projectsError} />
            ) : (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} currentLang={currentLang} t={t} isAdminMode={isAdminMode} />
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

                {paginatedProjects.length === 0 && !projectsLoading && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {currentLang === 'ar'
                        ? 'لا توجد مشاريع في هذه الفئة'
                        : currentLang === 'hi'
                          ? 'इस श्रेणी में कोई प्रोजेक्ट नहीं है'
                          : 'Aucun projet dans cette catégorie'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}
