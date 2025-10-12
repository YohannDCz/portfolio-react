import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLocalizedText } from '@/lib/supabase';
import type { TranslationContent } from '@/types/translations';
import type { Profile } from '@/types';
import type { JSX } from 'react';

interface AboutSectionProps {
  profile: Profile | null;
  currentLang: string;
  t: TranslationContent;
}

export default function AboutSection({ profile, currentLang, t }: AboutSectionProps): JSX.Element {
  return (
    <section id="apropos" className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.about}</CardTitle>
            <CardDescription>{t.aboutApproach}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{t.aboutDescription}</p>
            <ul className="list-disc pl-5 grid gap-2">
              <li>Design system réutilisable et cohérent.</li>
              <li>Code typé, composable et testé.</li>
              <li>Livraison continue et métriques de qualité.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.quickInfo}</CardTitle>
            <CardDescription>{t.quickInfoSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm">
              <li>
                <strong>{t.basedIn}</strong> {profile?.location || 'Paris, France'}
              </li>
              <li>
                <strong>{t.availability}</strong>{' '}
                {getLocalizedText(profile, 'availability_hours', currentLang) || '10–20h / semaine'}
              </li>
              <li>
                <strong>{t.languages}</strong>{' '}
                {profile?.spoken_languages?.join(', ') || 'FR, EN, HI, AR'}
              </li>
              <li>
                <strong>{t.preferredStack}</strong> React, React Native, Flutter
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
