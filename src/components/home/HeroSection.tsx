import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProfileImageModal from '@/components/ProfileImageModal';
import AnimatedSection from '@/components/AnimatedSection';
import { LoadingSpinner } from '@/components/home/LoadingState';
import Stat from '@/components/home/Stat';
import { getLocalizedText } from '@/lib/supabase';
import type { TranslationContent } from '@/types/translations';
import type { Profile, Project, Skill } from '@/types';
import type { JSX } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface HeroSectionProps {
  profile: Profile | null;
  profileLoading: boolean;
  skills: Skill[] | null;
  skillsLoading: boolean;
  projects: Project[] | null;
  currentLang: string;
  isRTL: boolean;
  t: TranslationContent;
  getDirectionalClass: (baseClass: string) => string;
}

export default function HeroSection({
  profile,
  profileLoading,
  skills,
  skillsLoading,
  projects,
  currentLang,
  isRTL,
  t,
  getDirectionalClass,
}: HeroSectionProps): JSX.Element {
  return (
    <AnimatedSection direction="up" delay={0.2} duration={0.8}>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Badge>🎯 {t.aimForMillennium}</Badge>
              <Badge variant="secondary">{t.availableForMissions}</Badge>
              <Badge variant="outline">{t.availableForInternship}</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              {profileLoading ? t.loading : getLocalizedText(profile, 'title', currentLang)}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-prose">
              {profileLoading ? t.loading : getLocalizedText(profile, 'tagline', currentLang)}
            </p>
            <div className={`mt-6 ${getDirectionalClass('flex flex-wrap gap-3')}`}>
              <a href="#contact">
                <Button className={getDirectionalClass('flex items-center')}>
                  {t.contactMe}
                  <ArrowUpRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4 no-rtl-transform`} />
                </Button>
              </a>
              <Link href={'/not-found'} rel="noreferrer">
                <Button variant="outline">{t.seeWebsite}</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {skillsLoading ? (
                <LoadingSpinner />
              ) : (
                skills?.map((s) => (
                  <Badge key={s.id} variant="secondary" className="rounded-full">
                    {getLocalizedText(s, 'display_name', currentLang) || s.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div>
            <Card className="overflow-hidden">
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={profile?.cover_url || 'cover.png'}
                  alt="cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                  unoptimized
                />
              </div>

              <CardContent className="-mt-9">
                <div className="flex items-end gap-4">
                  <ProfileImageModal
                    src={profile?.avatar_url || 'profile.png'}
                    alt="Profile photo"
                    fallback="YDC"
                  >
                    <Avatar className="h-23 w-23 ring-4 ring-background">
                      <AvatarImage alt="avatar" src={profile?.avatar_url || 'profile.png'} />
                      <AvatarFallback>YD</AvatarFallback>
                    </Avatar>
                  </ProfileImageModal>
                  <div className="pb-1">
                    <h3 className="text-xl font-semibold leading-tight">{profile?.name || 'Yohann Di Crescenzo'}</h3>
                    <p className="text-muted-foreground">{profile?.location || 'Paris, France'}</p>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Stat label={t.yearsExp} value={`${profile?.years_experience || 5}+`} />
                  <Stat label={t.projects} value={`${projects?.length || 0}+`} />
                  <Stat label={t.satisfaction} value={`${profile?.satisfaction_rate || 98}%`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
