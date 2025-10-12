import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, ErrorMessage } from '@/components/home/LoadingState';
import { getLocalizedText } from '@/lib/supabase';
import type { TranslationContent } from '@/types/translations';
import type { Tables } from '@/types';
import type { JSX } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FreelanceSectionProps {
  platforms: Tables<'freelance_platforms'>[] | null;
  platformsLoading: boolean;
  platformsError: string | null;
  currentLang: string;
  t: TranslationContent;
  getDirectionalClass: (baseClass: string) => string;
  isRTL: boolean;
}

export default function FreelanceSection({
  platforms,
  platformsLoading,
  platformsError,
  currentLang,
  t,
  getDirectionalClass,
  isRTL,
}: FreelanceSectionProps): JSX.Element {
  return (
    <section id="freelance" className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.freelance}</h2>
          <p className="text-muted-foreground">{t.mainPlatforms}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {platformsLoading ? (
          <LoadingSpinner />
        ) : platformsError ? (
          <ErrorMessage message={platformsError} />
        ) : (
          platforms?.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{f.name}</CardTitle>
                <CardDescription>{getLocalizedText(f, 'description', currentLang)}</CardDescription>
              </CardHeader>
              <CardContent className={getDirectionalClass('flex items-center justify-between')}>
                <Badge variant="secondary" className="dark:bg-blue-600 dark:text-white">
                  {t.freelance}
                </Badge>
                <a href={f.url} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className={getDirectionalClass('flex items-center')}>
                    {t.open}
                    <ArrowUpRight className={`${isRTL ? 'mr-1' : 'ml-1'} h-4 w-4 no-rtl-transform`} />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
