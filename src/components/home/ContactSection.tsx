import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SocialLink from '@/components/home/SocialLink';
import type { TranslationContent } from '@/types/translations';
import type { Profile } from '@/types';
import type { JSX, FormEventHandler } from 'react';
import { Github, Globe, Linkedin, Mail } from 'lucide-react';

interface ContactSectionProps {
  profile: Profile | null;
  t: TranslationContent;
  sendingMessage: boolean;
  messageStatus: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function ContactSection({
  profile,
  t,
  sendingMessage,
  messageStatus,
  onSubmit,
}: ContactSectionProps): JSX.Element {
  return (
    <section id="contact" className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.workTogether}</CardTitle>
            <CardDescription>{t.workTogetherSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input required name="name" placeholder={t.namePlaceholder} />
                <Input required name="email" type="email" placeholder={t.emailPlaceholder} />
              </div>
              <Input name="subject" placeholder={t.subjectPlaceholder} />
              <Textarea required name="message" placeholder={t.messagePlaceholder} rows={5} />
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={sendingMessage}>
                  {sendingMessage ? t.sending : t.send}
                </Button>
                {messageStatus === 'success' && <p className="text-green-600 text-sm">{t.messageSent}</p>}
                {messageStatus === 'error' && <p className="text-red-600 text-sm">{t.messageError}</p>}
                <a href={`mailto:${profile?.email || 'YohannDCz@gmail.com'}`} className="text-sm text-muted-foreground hover:underline">
                  {t.directEmail}
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.networks}</CardTitle>
            <CardDescription>{t.networksSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <SocialLink href={profile?.github_url} icon={<Github className="h-4 w-4" />} label="GitHub" />
            <SocialLink href={profile?.linkedin_url} icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
            <SocialLink href={'/not-found'} icon={<Globe className="h-4 w-4" />} label="Site web" />
            <SocialLink href={`mailto:${profile?.email || 'YohannDCz@gmail.com'}`} icon={<Mail className="h-4 w-4" />} label="Email" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
