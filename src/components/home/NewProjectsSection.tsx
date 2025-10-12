import AnimatedSection from '@/components/AnimatedSection';
import ProjectCard from '@/components/ProjectCard';
import { LoadingSpinner, ErrorMessage } from '@/components/home/LoadingState';
import type { TranslationContent } from '@/types/translations';
import type { Project } from '@/types';
import type { JSX } from 'react';

interface NewProjectsSectionProps {
  projects: Project[] | null;
  projectsLoading: boolean;
  projectsError: string | null;
  currentLang: string;
  t: TranslationContent;
  isAdminMode: boolean;
}

export default function NewProjectsSection({
  projects,
  projectsLoading,
  projectsError,
  currentLang,
  t,
  isAdminMode,
}: NewProjectsSectionProps): JSX.Element {
  return (
    <AnimatedSection>
      <section id="nouveaux-projets" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.newProjects}</h2>
            <p className="text-muted-foreground">{t.newProjectsDescription}</p>
          </div>
        </div>

        <div className="mt-6">
          {projectsLoading ? (
            <LoadingSpinner />
          ) : projectsError ? (
            <ErrorMessage message={projectsError} />
          ) : (
            <>
              {projects?.filter((p) => p.featured && p.status !== 'to_deploy').length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects
                    ?.filter((p) => p.featured && p.status !== 'to_deploy')
                    .slice(0, 6)
                    .map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        currentLang={currentLang}
                        t={t}
                        isAdminMode={isAdminMode}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {currentLang === 'ar'
                      ? 'لا توجد مشاريع جديدة حاليًا'
                      : currentLang === 'hi'
                        ? 'फ़िलहाल कोई नया प्रोजेक्ट नहीं है'
                        : currentLang === 'zh'
                          ? '目前没有新项目'
                          : currentLang === 'en'
                            ? 'No new projects currently'
                            : 'Aucun nouveau projet pour le moment'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}
