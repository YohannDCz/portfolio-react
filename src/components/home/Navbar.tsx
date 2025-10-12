import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import ProfileImageModal from '@/components/ProfileImageModal';
import type { TranslationContent } from '@/types/translations';
import type { Profile } from '@/types';
import type { JSX } from 'react';
import { Github, Linkedin, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  profile: Profile | null;
  t: TranslationContent;
  dark: boolean;
  setDark: (value: boolean) => void;
  activeSection: string;
  getDirectionalClass: (baseClass: string) => string;
  getTextAlign: (baseClass: string) => string;
}

export default function Navbar({
  profile,
  t,
  dark,
  setDark,
  activeSection,
  getDirectionalClass,
  getTextAlign,
}: NavbarProps): JSX.Element {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className={`max-w-6xl mx-auto px-4 py-3 ${getDirectionalClass('flex items-center justify-between')}`}>
        <div className={getDirectionalClass('flex items-center gap-3')}>
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary/80 to-primary/30 grid place-items-center shadow-sm">
            <ProfileImageModal src={profile?.avatar_url || 'profile.png'} alt="Profile photo" fallback="YOU">
              <Avatar className="ring-4 ring-background">
                <AvatarImage alt="avatar" src={profile?.avatar_url || 'profile.png'} />
                <AvatarFallback>YOU</AvatarFallback>
              </Avatar>
            </ProfileImageModal>
          </div>
          <div className={getTextAlign('text-start')}>
            <p className="text-sm text-muted-foreground leading-none">{t.portfolio}</p>
            <p className="font-medium leading-tight">{profile?.name || 'Yohann Di Crescenzo'}</p>
          </div>
        </div>

        <nav className={`hidden md:flex items-center gap-6 text-sm ${getDirectionalClass('flex-row')}`}>
          <a
            href="#projets"
            className={`hover:opacity-80 transition-all ${activeSection === 'projets' ? 'font-bold text-primary' : ''}`}
          >
            {t.projects}
          </a>
          <a href="#cv" className={`hover:opacity-80 transition-all ${activeSection === 'cv' ? 'font-bold text-primary' : ''}`}>
            {t.cv}
          </a>
          <a
            href="#contact"
            className={`hover:opacity-80 transition-all ${activeSection === 'contact' ? 'font-bold text-primary' : ''}`}
          >
            {t.contact}
          </a>
        </nav>

        <div className={getDirectionalClass('flex items-center gap-2')}>
          <LanguageSelector variant="ghost" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark(!dark)}
            aria-label="Basculer le thème"
            className="no-rtl-transform"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <a href={profile?.github_url} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" aria-label="GitHub" className="no-rtl-transform">
              <Github className="h-5 w-5" />
            </Button>
          </a>
          <a href={profile?.linkedin_url} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" aria-label="LinkedIn" className="no-rtl-transform">
              <Linkedin className="h-5 w-5" />
            </Button>
          </a>
          <Link href="/admin" className="hidden md:inline-flex">
            <Button variant="outline" size="sm" className="no-rtl-transform">
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
