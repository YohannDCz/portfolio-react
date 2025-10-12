'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';

import Banner from '@/components/Banner';
import LoadingScreen from '@/components/LoadingScreen';
import Notification from '@/components/Notification';
import { AuthStatusIndicator } from '@/components/AdminEditButton';
import { AdminGuestProvider, useAdminGuest } from '@/contexts/AdminGuestContext';
import { useDirectionalClasses, useLanguage } from '@/contexts/LanguageContext';
import {
  getLocalizedText,
  getProjectsByCategory,
  sendContactMessage,
  useAuth,
  useCertifications,
  useFreelancePlatforms,
  useProfile,
  useProjects,
  useSkills,
} from '@/lib/supabase';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useTheme } from '@/hooks/useTheme';
import { TRANSLATIONS } from '@/app/assets/translations';
import { ErrorMessage } from '@/components/home/LoadingState';
import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import NewProjectsSection from '@/components/home/NewProjectsSection';
import ProjectsSection from '@/components/home/ProjectsSection';
import FreelanceSection from '@/components/home/FreelanceSection';
import CertificationsSection from '@/components/home/CertificationsSection';
import AboutSection from '@/components/home/AboutSection';
import ContactSection from '@/components/home/ContactSection';
import FooterSection from '@/components/home/FooterSection';
import type { ContactFormData, NotificationData, Project } from '@/types';

function PortfolioContent(): JSX.Element {
  const { dark, setDark } = useTheme();
  const { currentLang, isRTL } = useLanguage();
  const { getDirectionalClass, getTextAlign } = useDirectionalClasses();
  const { isAuthenticated } = useAuth();
  const { isGuest } = useAdminGuest();
  const isAdminMode = isAuthenticated || isGuest;

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('tous');
  const [sort, setSort] = useState('popular');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<NotificationData>({});
  const [activeSection, setActiveSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCertPage, setCurrentCertPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const t = TRANSLATIONS[currentLang];

  const { isLoading, registerLoading } = useGlobalLoading();

  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { skills, loading: skillsLoading } = useSkills();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { platforms, loading: platformsLoading, error: platformsError } = useFreelancePlatforms();
  const {
    certifications,
    loading: certificationsLoading,
    error: certificationsError,
  } = useCertifications();

  useEffect(() => {
    registerLoading('profile', profileLoading);
    registerLoading('skills', skillsLoading);
    registerLoading('projects', projectsLoading);
    registerLoading('platforms', platformsLoading);
    registerLoading('certifications', certificationsLoading);
  }, [
    profileLoading,
    skillsLoading,
    projectsLoading,
    platformsLoading,
    certificationsLoading,
    registerLoading,
  ]);

  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleScroll = useCallback((): void => {
    const scrollPosition = window.scrollY + 150;

    const projetsEl = document.getElementById('projets');
    const cvEl = document.getElementById('cv');
    const aproposEl = document.getElementById('apropos');
    const contactEl = document.getElementById('contact');

    let current = '';

    if (contactEl && scrollPosition >= contactEl.offsetTop) {
      current = 'contact';
    } else if (aproposEl && scrollPosition >= aproposEl.offsetTop - 100) {
      current = 'contact';
    } else if (cvEl && scrollPosition >= cvEl.offsetTop) {
      current = 'cv';
    } else if (projetsEl && scrollPosition >= projetsEl.offsetTop) {
      current = 'projets';
    }

    setActiveSection(current);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [] as Project[];

    let items = projects.filter((project) => {
      const title = getLocalizedText(project, 'title', currentLang);
      const description = getLocalizedText(project, 'description', currentLang);
      const searchText = [title, description, ...(project.tags || [])].join(' ').toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    if (tab !== 'tous') {
      items = getProjectsByCategory(items, tab);
    }

    if (sort === 'popular') {
      items = items.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    }

    if (sort === 'alpha') {
      items = items.sort((a, b) => {
        const titleA = getLocalizedText(a, 'title', currentLang);
        const titleB = getLocalizedText(b, 'title', currentLang);
        return titleA.localeCompare(titleB);
      });
    }

    return items;
  }, [projects, query, tab, sort, currentLang]);

  const projectsPerPage = isMobile ? 3 : 6;

  const paginatedProjects = useMemo(() => {
    if (query) {
      return filteredProjects;
    }

    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentPage, projectsPerPage, query]);

  const totalPages = useMemo(() => {
    if (query) return 1;
    const visibleProjects = filteredProjects.filter((project) => project.status !== 'to_deploy');
    return Math.ceil(visibleProjects.length / projectsPerPage) || 1;
  }, [filteredProjects, projectsPerPage, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, query]);

  const certificationsPerPage = isMobile ? 3 : 6;

  const paginatedCertifications = useMemo(() => {
    if (!certifications) return [];
    const startIndex = (currentCertPage - 1) * certificationsPerPage;
    const endIndex = startIndex + certificationsPerPage;
    return certifications.slice(startIndex, endIndex);
  }, [certifications, currentCertPage, certificationsPerPage]);

  const totalCertPages = useMemo(() => {
    if (!certifications || !certifications.length) return 1;
    return Math.ceil(certifications.length / certificationsPerPage);
  }, [certifications, certificationsPerPage]);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSendingMessage(true);
    setMessageStatus(null);

    const formData = new FormData(e.currentTarget);
    const messageData: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: (formData.get('subject') as string) || '',
      message: formData.get('message') as string,
      language: currentLang,
    };

    const result = await sendContactMessage(messageData);

    if (result.success) {
      setMessageStatus('success');
      setNotificationData({
        type: 'success',
        title: t.messageSent,
        message: t.responseMessage || 'Nous vous répondrons dans les plus brefs délais.',
      });
      setShowNotification(true);
      e.currentTarget.reset();
    } else {
      setMessageStatus('error');
      setNotificationData({
        type: 'error',
        title: t.messageError,
        message: result.error || t.unexpectedError || "Une erreur inattendue s'est produite.",
      });
      setShowNotification(true);
    }

    setSendingMessage(false);
    setTimeout(() => setMessageStatus(null), 3000);
  };

  if (profileError) {
    return <ErrorMessage message={profileError} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      className={`min-h-screen bg-gradient-to-b from-background to-background/60 dark:from-black dark:to-zinc-950 text-foreground ${
        isRTL ? 'rtl' : ''
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Banner />
      <Navbar
        profile={profile}
        t={t}
        dark={dark}
        setDark={setDark}
        activeSection={activeSection}
        getDirectionalClass={getDirectionalClass}
        getTextAlign={getTextAlign}
      />

      <HeroSection
        profile={profile}
        profileLoading={profileLoading}
        skills={skills}
        skillsLoading={skillsLoading}
        projects={projects}
        currentLang={currentLang}
        isRTL={isRTL}
        t={t}
        getDirectionalClass={getDirectionalClass}
      />

      <NewProjectsSection
        projects={projects}
        projectsLoading={projectsLoading}
        projectsError={projectsError}
        currentLang={currentLang}
        t={t}
        isAdminMode={isAdminMode}
      />

      <ProjectsSection
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        tab={tab}
        onTabChange={setTab}
        projectsLoading={projectsLoading}
        projectsError={projectsError}
        paginatedProjects={paginatedProjects}
        searchResults={filteredProjects}
        currentLang={currentLang}
        t={t}
        isAdminMode={isAdminMode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <FreelanceSection
        platforms={platforms}
        platformsLoading={platformsLoading}
        platformsError={platformsError}
        currentLang={currentLang}
        t={t}
        getDirectionalClass={getDirectionalClass}
        isRTL={isRTL}
      />

      <CertificationsSection
        certificationsLoading={certificationsLoading}
        certificationsError={certificationsError}
        paginatedCertifications={paginatedCertifications}
        currentLang={currentLang}
        t={t}
        isAdminMode={isAdminMode}
        currentPage={currentCertPage}
        totalPages={totalCertPages}
        onPageChange={setCurrentCertPage}
      />

      <AboutSection profile={profile} currentLang={currentLang} t={t} />

      <ContactSection
        profile={profile}
        t={t}
        sendingMessage={sendingMessage}
        messageStatus={messageStatus}
        onSubmit={handleContactSubmit}
      />

      <FooterSection profile={profile} t={t} />

      <Notification
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <AuthStatusIndicator />
    </motion.div>
  );
}

export default function Portfolio(): JSX.Element {
  return (
    <AdminGuestProvider>
      <PortfolioContent />
    </AdminGuestProvider>
  );
}
