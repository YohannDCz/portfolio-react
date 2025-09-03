'use client';

import ProjectImage from "@/components/ProjectImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Github, Globe, Linkedin, Mail, Moon, Star, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Import des hooks Supabase
import {
  getLocalizedText,
  getMegaProjects,
  getNormalProjects,
  getProjectsByCategory,
  getPublicImageUrl,
  sendContactMessage,
  useCertifications,
  useFreelancePlatforms,
  useProductionGoals,
  useProfile,
  useProjects,
  useSkills
} from "@/lib/supabase";

// Import du contexte multilingue
import LanguageSelector from "@/components/LanguageSelector";
import { useDirectionalClasses, useLanguage } from "@/contexts/LanguageContext";

// Import des composants de chargement
import AnimatedSection from "@/components/AnimatedSection";
import Banner from "@/components/Banner";
import LoadingScreen from "@/components/LoadingScreen";
import Notification from "@/components/Notification";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";

// ——————————————————————————————————————————————
// TRADUCTIONS STATIQUES
// ——————————————————————————————————————————————
const TRANSLATIONS = {
  fr: {
    portfolio: "Portfolio",
    projects: "Projets",
    freelance: "Freelance",
    cv: "CV",
    certifications: "Certifications",
    about: "À propos",
    contact: "Contact",
    megaProjects: "Mega projets",
    goals: "Objectifs",
    projectSelection: "Sélection de projets",
    projectFilter: "Filtrez par type, triez et cherchez.",
    searchPlaceholder: "Rechercher un projet…",
    sort: "Trier",
    popular: "Populaire",
    alphabetical: "A → Z",
    all: "Tous",
    web: "Web",
    mobile: "Mobile",
    design: "Design",
    other: "Autre",
    see: "Voir",
    open: "Ouvrir",
    availableForMissions: "Disponible pour missions",
    contactMe: "Me contacter",
    seeWebsite: "Voir mon site",
    yearsExp: "Années d'exp.",
    satisfaction: "Satisfaction",
    mainPlatforms: "Présence sur les principales plateformes.",
    courseAndSkills: "Parcours et compétences validées.",
    inProgress: "En cours",
    completed: "Terminé",
    planned: "Planifié",
    strategicProjects: "Chantiers stratégiques long terme.",
    vision: "Vision",
    productionGoals: "Objectifs de production",
    productionSubtitle: "100 sites React/Node • 100 apps React Native • 100 apps Flutter.",
    aboutApproach: "Approche produit et méthode.",
    aboutDescription: "De la recherche utilisateur au prototypage haute fidélité, jusqu'à l'implémentation full-stack et mobile (accessibilité, micro‑interactions, performance, maintenance).",
    quickInfo: "Infos rapides",
    quickInfoSubtitle: "Ce que vous devez savoir.",
    basedIn: "Basé à :",
    availability: "Dispo :",
    languages: "Langues :",
    preferredStack: "Stack préférée :",
    workTogether: "Travaillons ensemble",
    workTogetherSubtitle: "Dites‑moi en quelques mots votre besoin.",
    networks: "Réseaux",
    networksSubtitle: "Retrouvez‑moi en ligne.",
    send: "Envoyer",
    sending: "Envoi...",
    messageSent: "Message envoyé !",
    messageError: "Erreur lors de l'envoi",
    directEmail: "Ou écrivez‑moi directement",
    builtWith: "Construit avec",
    loading: "Chargement...",
    error: "Erreur de chargement"
  },
  en: {
    portfolio: "Portfolio",
    projects: "Projects",
    freelance: "Freelance",
    cv: "CV",
    certifications: "Certifications",
    about: "About",
    contact: "Contact",
    megaProjects: "Mega Projects",
    goals: "Goals",
    projectSelection: "Project Selection",
    projectFilter: "Filter by type, sort and search.",
    searchPlaceholder: "Search a project…",
    sort: "Sort",
    popular: "Popular",
    alphabetical: "A → Z",
    all: "All",
    web: "Web",
    mobile: "Mobile",
    design: "Design",
    other: "Other",
    see: "See",
    open: "Open",
    availableForMissions: "Available for missions",
    contactMe: "Contact me",
    seeWebsite: "See my website",
    yearsExp: "Years exp.",
    satisfaction: "Satisfaction",
    mainPlatforms: "Presence on main platforms.",
    courseAndSkills: "Course and validated skills.",
    inProgress: "In progress",
    completed: "Completed",
    planned: "Planned",
    strategicProjects: "Long-term strategic projects.",
    vision: "Vision",
    productionGoals: "Production Goals",
    productionSubtitle: "100 React/Node sites • 100 React Native apps • 100 Flutter apps.",
    aboutApproach: "Product approach and method.",
    aboutDescription: "From user research to high-fidelity prototyping, to full-stack and mobile implementation (accessibility, micro-interactions, performance, maintenance).",
    quickInfo: "Quick Info",
    quickInfoSubtitle: "What you need to know.",
    basedIn: "Based in:",
    availability: "Available:",
    languages: "Languages:",
    preferredStack: "Preferred stack:",
    workTogether: "Let's work together",
    workTogetherSubtitle: "Tell me about your needs in a few words.",
    networks: "Networks",
    networksSubtitle: "Find me online.",
    send: "Send",
    sending: "Sending...",
    messageSent: "Message sent!",
    messageError: "Error sending",
    directEmail: "Or write me directly",
    builtWith: "Built with",
    loading: "Loading...",
    error: "Loading error"
  },
  hi: {
    portfolio: "पोर्टफोलियो",
    projects: "प्रोजेक्ट्स",
    freelance: "फ्रीलांस",
    cv: "सीवी",
    certifications: "प्रमाणपत्र",
    about: "के बारे में",
    contact: "संपर्क",
    megaProjects: "मेगा प्रोजेक्ट्स",
    goals: "लक्ष्य",
    projectSelection: "प्रोजेक्ट चयन",
    projectFilter: "प्रकार के अनुसार फ़िल्टर करें, सॉर्ट करें और खोजें।",
    searchPlaceholder: "एक प्रोजेक्ट खोजें…",
    sort: "सॉर्ट",
    popular: "लोकप्रिय",
    alphabetical: "A → Z",
    all: "सभी",
    web: "वेब",
    mobile: "मोबाइल",
    design: "डिज़ाइन",
    other: "अन्य",
    see: "देखें",
    open: "खोलें",
    availableForMissions: "मिशन के लिए उपलब्ध",
    contactMe: "मुझसे संपर्क करें",
    seeWebsite: "मेरी वेबसाइट देखें",
    yearsExp: "वर्षों का अनुभव",
    satisfaction: "संतुष्टि",
    mainPlatforms: "मुख्य प्लेटफॉर्म पर उपस्थिति।",
    courseAndSkills: "कोर्स और सत्यापित कौशल।",
    inProgress: "प्रगति में",
    completed: "पूर्ण",
    planned: "नियोजित",
    strategicProjects: "दीर्घकालिक रणनीतिक परियोजनाएं।",
    vision: "दृष्टि",
    productionGoals: "उत्पादन लक्ष्य",
    productionSubtitle: "100 React/Node साइटें • 100 React Native ऐप्स • 100 Flutter ऐप्स।",
    aboutApproach: "उत्पाद दृष्टिकोण और विधि।",
    aboutDescription: "उपयोगकर्ता अनुसंधान से उच्च-फिडेलिटी प्रोटोटाइपिंग तक, फुल-स्टैक और मोबाइल कार्यान्वयन तक।",
    quickInfo: "त्वरित जानकारी",
    quickInfoSubtitle: "आपको जो जानना चाहिए।",
    basedIn: "स्थित:",
    availability: "उपलब्ध:",
    languages: "भाषाएं:",
    preferredStack: "पसंदीदा स्टैक:",
    workTogether: "आइए मिलकर काम करते हैं",
    workTogetherSubtitle: "कुछ शब्दों में अपनी आवश्यकताओं के बारे में बताएं।",
    networks: "नेटवर्क",
    networksSubtitle: "मुझे ऑनलाइन खोजें।",
    send: "भेजें",
    sending: "भेजा जा रहा है...",
    messageSent: "संदेश भेजा गया!",
    messageError: "भेजने में त्रुटि",
    directEmail: "या मुझे सीधे लिखें",
    builtWith: "के साथ निर्मित",
    loading: "लोड हो रहा है...",
    error: "लोडिंग त्रुटि"
  },
  ar: {
    portfolio: "محفظة الأعمال",
    projects: "المشاريع",
    freelance: "العمل الحر",
    cv: "السيرة الذاتية",
    certifications: "الشهادات",
    about: "حول",
    contact: "اتصال",
    megaProjects: "المشاريع الضخمة",
    goals: "الأهداف",
    projectSelection: "اختيار المشاريع",
    projectFilter: "تصفية حسب النوع، ترتيب وبحث.",
    searchPlaceholder: "البحث عن مشروع…",
    sort: "ترتيب",
    popular: "شائع",
    alphabetical: "أ → ي",
    all: "الكل",
    web: "ويب",
    mobile: "محمول",
    design: "تصميم",
    other: "أخرى",
    see: "مشاهدة",
    open: "فتح",
    availableForMissions: "متاح للمهام",
    contactMe: "اتصل بي",
    seeWebsite: "مشاهدة موقعي",
    yearsExp: "سنوات الخبرة",
    satisfaction: "الرضا",
    mainPlatforms: "الحضور على المنصات الرئيسية.",
    courseAndSkills: "الدورة والمهارات المعتمدة.",
    inProgress: "قيد التقدم",
    completed: "مكتمل",
    planned: "مخطط",
    strategicProjects: "مشاريع استراتيجية طويلة المدى.",
    vision: "رؤية",
    productionGoals: "أهداف الإنتاج",
    productionSubtitle: "100 موقع React/Node • 100 تطبيق React Native • 100 تطبيق Flutter.",
    aboutApproach: "نهج المنتج والطريقة.",
    aboutDescription: "من بحث المستخدم إلى النماذج الأولية عالية الدقة، إلى التنفيذ الكامل والمحمول.",
    quickInfo: "معلومات سريعة",
    quickInfoSubtitle: "ما تحتاج لمعرفته.",
    basedIn: "مقره في:",
    availability: "متاح:",
    languages: "اللغات:",
    preferredStack: "المكدس المفضل:",
    workTogether: "لنعمل معًا",
    workTogetherSubtitle: "أخبرني عن احتياجاتك في كلمات قليلة.",
    networks: "الشبكات",
    networksSubtitle: "ابحث عني عبر الإنترنت.",
    send: "إرسال",
    sending: "جاري الإرسال...",
    messageSent: "تم إرسال الرسالة!",
    messageError: "خطأ في الإرسال",
    directEmail: "أو اكتب لي مباشرة",
    builtWith: "مبني باستخدام",
    loading: "جاري التحميل...",
    error: "خطأ في التحميل"
  }
};

// ——————————————————————————————————————————————
// Thème (clair/sombre)
// ——————————————————————————————————————————————
function useTheme() {
  const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useState(prefersDark);
  useEffect(() => {
    const root = document.documentElement;
    
    // Désactiver temporairement les transitions
    root.classList.add("disable-transitions");
    
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    
    // Réactiver les transitions après un court délai
    setTimeout(() => {
      root.classList.remove("disable-transitions");
    }, 1);
  }, [dark]);
  return { dark, setDark };
}

// ——————————————————————————————————————————————
// Composant Loading
// ——————————————————————————————————————————————
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="flex items-center justify-center p-8 text-red-500">
      <p>Erreur: {message}</p>
    </div>
  );
}

// ——————————————————————————————————————————————
// Composant ProjectCard avec support RTL
// ——————————————————————————————————————————————
function ProjectCard({ project, currentLang, t }) {
  const { getDirectionalClass, isRTL } = useDirectionalClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
        {/* Image du projet */}
        {project.image_url && (
          <div className="h-48 w-full overflow-hidden">
            <ProjectImage
              src={getPublicImageUrl(project.image_url)}
              alt={getLocalizedText(project, 'title', currentLang)}
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        
        <div className="flex flex-col flex-grow p-6 pt-0">
          <div className="flex-grow">
            <CardHeader className="pb-3 px-0 pt-4">
              <div className={getDirectionalClass("flex items-start justify-between")}>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {getLocalizedText(project, 'title', currentLang)}
                  </CardTitle>
                  <CardDescription className="mt-1 mb-3 line-clamp-2">
                    {getLocalizedText(project, 'description', currentLang)}
                  </CardDescription>
                </div>
                {project.stars > 0 && (
                  <div className={`${getDirectionalClass("flex items-center gap-1")} ${isRTL ? 'mr-2' : 'ml-2'} text-sm text-muted-foreground`}>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 no-rtl-transform" />
                    {project.stars}
                  </div>
                )}
              </div>
            </CardHeader>
          </div>
          
          <div className="space-y-3 pt-3 mt-auto border-t">
            {/* Catégories et tags */}
            <div className={`${getDirectionalClass("flex flex-wrap gap-1") } ${isRTL ? 'justify-end' : 'justify-start'}`}>
              {project.status === 'in_progress' && (
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700">
                  {t.inProgress}
                </Badge>
              )}
              {project.category?.map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
              {project.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags?.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.tags.length - 2}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className={getDirectionalClass("flex gap-2 pt-3 mt-1 border-t")}>
              {project.link && project.link !== '#' && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className={`w-full ${getDirectionalClass("flex items-center justify-center")}`}>
                    <Globe className={`${isRTL ? 'ml-1' : 'mr-1'} w-4 h-4 no-rtl-transform`} />
                    {t.see}
                  </Button>
                </a>
              )}
              
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="no-rtl-transform">
                    <Github className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ——————————————————————————————————————————————
// Composant principal
// ——————————————————————————————————————————————
export default function Portfolio() {
  const { dark, setDark } = useTheme();
  const { currentLang, isRTL } = useLanguage();
  const { getDirectionalClass, getFlexDirection, getTextAlign } = useDirectionalClasses();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("tous");
  const [sort, setSort] = useState("popular");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});

  const t = TRANSLATIONS[currentLang];

  // Hook de chargement global
  const { isLoading, registerLoading } = useGlobalLoading();

  // Hooks Supabase
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { skills, loading: skillsLoading, error: skillsError } = useSkills();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { platforms, loading: platformsLoading, error: platformsError } = useFreelancePlatforms();
  const { certifications, loading: certificationsLoading, error: certificationsError } = useCertifications();
  const { goals, projectCounts, loading: goalsLoading, error: goalsError } = useProductionGoals();

  // Enregistrer tous les états de chargement
  useEffect(() => {
    registerLoading('profile', profileLoading);
    registerLoading('skills', skillsLoading);
    registerLoading('projects', projectsLoading);
    registerLoading('platforms', platformsLoading);
    registerLoading('certifications', certificationsLoading);
    registerLoading('goals', goalsLoading);
  }, [profileLoading, skillsLoading, projectsLoading, platformsLoading, certificationsLoading, goalsLoading, registerLoading]);

  // Filtrage des projets
  const filtered = useMemo(() => {
    if (!projects) return [];
    
    let items = projects.filter((p) => {
      const title = getLocalizedText(p, 'title', currentLang);
      const description = getLocalizedText(p, 'description', currentLang);
      const searchText = [title, description, ...(p.tags || [])].join(" ").toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
    
    if (tab !== "tous") {
      items = getProjectsByCategory(items, tab);
    }
    
    if (sort === "popular") {
      items = items.sort((a, b) => b.stars - a.stars);
    }
    if (sort === "alpha") {
      items = items.sort((a, b) => {
        const titleA = getLocalizedText(a, 'title', currentLang);
        const titleB = getLocalizedText(b, 'title', currentLang);
        return titleA.localeCompare(titleB);
      });
    }
    
    return items;
  }, [projects, query, tab, sort, currentLang]);

  // Séparer les projets normaux et mega projets
  const normalProjects = getNormalProjects(filtered);
  const megaProjects = getMegaProjects(filtered);

  // Gestion du formulaire de contact
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    setMessageStatus(null);

    const formData = new FormData(e.target);
    const messageData = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject') || '',
      message: formData.get('message'),
      language: currentLang
    };

    const result = await sendContactMessage(messageData);
    
    if (result.success) {
      setMessageStatus('success');
      setNotificationData({
        type: 'success',
        title: t.messageSent,
        message: 'Nous vous répondrons dans les plus brefs délais.'
      });
      setShowNotification(true);
      e.target.reset();
    } else {
      setMessageStatus('error');
      setNotificationData({
        type: 'error',
        title: t.messageError,
        message: result.error || 'Une erreur inattendue s\'est produite.'
      });
      setShowNotification(true);
    }
    
    setSendingMessage(false);
    
    // Réinitialiser le statut après 3 secondes
    setTimeout(() => setMessageStatus(null), 3000);
  };

  // Affichage d'erreur général
  if (profileError) {
    return <ErrorMessage message={profileError} />;
  }

  // Affichage de l'écran de chargement
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-b from-background to-background/60 dark:from-black dark:to-zinc-950 text-foreground ${isRTL ? 'rtl' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Banner />
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className={`max-w-6xl mx-auto px-4 py-3 ${getDirectionalClass("flex items-center justify-between")}`}>
          <div className={getDirectionalClass("flex items-center gap-3")}>
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary/80 to-primary/30 grid place-items-center shadow-sm">
               <Avatar className="ring-4 ring-background">
                    <AvatarImage alt="avatar" src={profile?.avatar_url || "profile.png"} />
                    <AvatarFallback>YOU</AvatarFallback>
                  </Avatar>
            </div>
            <div className={getTextAlign("text-start")}>
              <p className="text-sm text-muted-foreground leading-none">{t.portfolio}</p>
              <p className="font-medium leading-tight">{profile?.name || "Yohann Di Crescenzo"}</p>
            </div>
          </div>

          <nav className={`hidden md:flex items-center gap-6 text-sm ${getDirectionalClass("flex-row")}`}>
            <a href="#projets" className="hover:opacity-80">{t.projects}</a>
            <a href="#mega-projets" className="hover:opacity-80">{t.megaProjects}</a>
            <a href="#cv" className="hover:opacity-80">{t.cv}</a>
            <a href="#objectifs" className="hover:opacity-80">{t.goals}</a>
            <a href="#apropos" className="hover:opacity-80">{t.about}</a>
          </nav>

          <div className={getDirectionalClass("flex items-center gap-2")}>
            {/* Sélecteur de langue moderne */}
            <LanguageSelector variant="ghost" />
            
            <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} aria-label="Basculer le thème" className="no-rtl-transform">
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
          </div>
        </div>
      </header>

      {/* HERO */}
      <AnimatedSection direction="up" delay={0.2} duration={0.8}>
        <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <div className="flex gap-2 mb-4">
              <Badge>🎯 {currentLang === 'fr' ? 'Viser le millénaire' : currentLang === 'en' ? 'Aim for millennium' : currentLang === 'hi' ? 'सहस्राब्दी का लक्ष्य' : 'استهداف الألفية'}</Badge>
              <Badge variant="secondary">{t.availableForMissions}</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              {profileLoading ? t.loading : getLocalizedText(profile, 'title', currentLang)}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-prose">
              {profileLoading ? t.loading : getLocalizedText(profile, 'tagline', currentLang)}
            </p>
            <div className={`mt-6 ${getDirectionalClass("flex flex-wrap gap-3")}`}>
              <a href="#contact">
                <Button className={getDirectionalClass("flex items-center")}>
                  {t.contactMe} 
                  <ArrowUpRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4 no-rtl-transform`} />
                </Button>
              </a>
              <a href={profile?.website} target="_blank" rel="noreferrer">
                <Button variant="outline">{t.seeWebsite}</Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {skillsLoading ? (
                <LoadingSpinner />
              ) : skills?.map((s) => (
                <Badge key={s.id} variant="secondary" className="rounded-full">
                  {getLocalizedText(s, 'display_name', currentLang) || s.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Card className="overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img
                  src={profile?.cover_url || "cover.png"}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              </div>
                
              <CardContent className="-mt-8">
                <div className="flex items-end gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-background">
                    <AvatarImage alt="avatar" src={profile?.avatar_url || "profile.png"} />
                    <AvatarFallback>YDC</AvatarFallback>
                  </Avatar>
                  <div className="pt-4">
                    <h3 className="text-xl font-semibold leading-tight">{profile?.name || "Yohann Di Crescenzo"}</h3>
                    <p className="text-muted-foreground">{profile?.location || "Paris, France"}</p>
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

      {/* PROJETS */}
      <AnimatedSection direction="up" delay={0.3} duration={0.8}>
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
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 md:w-72"
            />
            <Select value={sort} onValueChange={setSort}>
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

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="grid grid-cols-5 bg-muted w-full md:w-[560px]">
            <TabsTrigger 
              value="tous" 
              className="font-bold text-xs sm:text-sm dark:text-white light:text-black"
            >
              {t.all}
            </TabsTrigger>
            <TabsTrigger 
              value="web" 
              className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black"
            >
              {t.web}
            </TabsTrigger>
            <TabsTrigger 
              value="mobile" 
              className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black"
            >
              {t.mobile}
            </TabsTrigger>
            <TabsTrigger 
              value="design" 
              className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black"
            >
              {t.design}
            </TabsTrigger>
            <TabsTrigger 
              value="autre" 
              className="font-bold text-xs sm:text-sm dark:text-blue-400 light:text-black"
            >
              {t.other}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-6">
            {projectsLoading ? (
              <LoadingSpinner />
            ) : projectsError ? (
              <ErrorMessage message={projectsError} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {normalProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} currentLang={currentLang} t={t} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </section>
      </AnimatedSection>

      {/* MEGA PROJETS */}
      <AnimatedSection direction="up" delay={0.4} duration={0.8}>
        <section id="mega-projets" className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.megaProjects}</h2>
              <p className="text-muted-foreground">{t.strategicProjects}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {projectsLoading ? (
              <LoadingSpinner />
            ) : (
              megaProjects.map((p) => (
                <MegaProjectCard key={p.id} project={p} currentLang={currentLang} t={t} />
              ))
            )}
          </div>
        </section>
      </AnimatedSection>

      {/* FREELANCE */}
      <AnimatedSection direction="up" delay={0.4} duration={0.8}>
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
                <CardContent className={getDirectionalClass("flex items-center justify-between")}>
                  <Badge variant="secondary">{t.freelance}</Badge>
                  <a href={f.url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className={getDirectionalClass("flex items-center")}>
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
      </AnimatedSection>

      {/* CV / CERTIFICATIONS */}
      <AnimatedSection direction="up" delay={0.5} duration={0.8}>
      <section id="cv" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.cv} / {t.certifications}</h2>
            <p className="text-muted-foreground">{t.courseAndSkills}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {certificationsLoading ? (
            <LoadingSpinner />
          ) : certificationsError ? (
            <ErrorMessage message={certificationsError} />
          ) : (
            certifications?.map((c) => (
              <Card key={c.id} className="relative pt-8">
                <div className="absolute top-4 right-4">
                  <Badge 
                    className={`text-xs ${
                      c.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : c.status === 'in_progress' 
                          ? 'bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-zinc-200'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {c.status === 'completed' 
                      ? '✅' 
                      : c.status === 'in_progress' 
                        ? '⏳' 
                        : '🗂️'}
                    <span className="ml-1.5">{c.status === 'completed' ? t.completed : c.status === 'in_progress' ? t.inProgress : t.planned}</span>
                  </Badge>
                </div>
                <CardHeader className="pb-2 pt-0">
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <CardDescription className="mb-2">{c.provider || "Certification"}</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      </AnimatedSection>

      {/* PROJETS EN COURS */}
      <AnimatedSection direction="up" delay={0.6} duration={0.8}>
      <section id="en-cours" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Projets en cours</h2>
            <p className="text-muted-foreground">Sélection de projets actuellement en développement.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {projectsLoading ? (
            <LoadingSpinner />
          ) : (
            (projects || []).filter(p => p.status === 'in_progress').slice(0, 3).map((m) => (
              <MegaProjectCard key={m.id} project={m} currentLang={currentLang} t={t} />
            ))
          )}
        </div>
      </section>
      </AnimatedSection>

      {/* OBJECTIFS DE PRODUCTION */}
      <AnimatedSection direction="up" delay={0.7} duration={0.8}>
      <section id="objectifs" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t.productionGoals}</h2>
            <p className="text-muted-foreground">{t.productionSubtitle}</p>
          </div>
        </div>
        <div className="grid gap-4 mt-6">
          {goalsLoading ? (
            <LoadingSpinner />
          ) : goalsError ? (
            <ErrorMessage message={goalsError} />
          ) : (
            goals?.map((g) => {
              const currentCount = projectCounts[g.category] || 0;
              const value = g.target ? Math.min(100, Math.round((currentCount / g.target) * 100)) : 0;
              return (
                <Card key={g.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{getLocalizedText(g, 'label', currentLang)}</span>
                      <span className="text-sm text-muted-foreground">{currentCount} / {g.target}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={value} />
                    <p className="text-xs text-muted-foreground mt-2">
                      {getLocalizedText(g, 'description', currentLang)}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
      </AnimatedSection>

      {/* À PROPOS */}
      <AnimatedSection direction="up" delay={0.8} duration={0.8}>
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
                <li><strong>{t.basedIn}</strong> {profile?.location || "Paris, France"}</li>
                <li><strong>{t.availability}</strong> {getLocalizedText(profile, 'availability_hours', currentLang) || "10–20h / semaine"}</li>
                <li><strong>{t.languages}</strong> {profile?.spoken_languages?.join(', ') || 'FR, EN, HI, AR'}</li>
                <li><strong>{t.preferredStack}</strong> React, React Native, Flutter</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      </AnimatedSection>

      {/* CONTACT */}
      <AnimatedSection direction="up" delay={0.9} duration={0.8}>
      <section id="contact" className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.workTogether}</CardTitle>
              <CardDescription>{t.workTogetherSubtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    required 
                    name="name" 
                    placeholder={currentLang === 'fr' ? 'Votre nom' : currentLang === 'en' ? 'Your name' : currentLang === 'hi' ? 'आपका नाम' : 'اسمك'} 
                  />
                  <Input required name="email" type="email" placeholder="Email" />
                </div>
                <Input 
                  name="subject" 
                  placeholder={currentLang === 'fr' ? 'Sujet (optionnel)' : currentLang === 'en' ? 'Subject (optional)' : currentLang === 'hi' ? 'विषय (वैकल्पिक)' : 'الموضوع (اختياري)'} 
                />
                <Textarea 
                  required 
                  name="message" 
                  placeholder={currentLang === 'fr' ? 'Votre message…' : currentLang === 'en' ? 'Your message…' : currentLang === 'hi' ? 'आपका संदेश…' : 'رسالتك…'} 
                  rows={5} 
                />
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={sendingMessage}>
                    {sendingMessage ? t.sending : t.send}
                  </Button>
                  {messageStatus === 'success' && (
                    <p className="text-green-600 text-sm">{t.messageSent}</p>
                  )}
                  {messageStatus === 'error' && (
                    <p className="text-red-600 text-sm">{t.messageError}</p>
                  )}
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
              <SocialLink href={profile?.website} icon={<Globe className="h-4 w-4" />} label="Site web" />
              <SocialLink href={`mailto:${profile?.email || 'YohannDCz@gmail.com'}`} icon={<Mail className="h-4 w-4" />} label={profile?.email || 'YohannDCz@gmail.com'} />
            </CardContent>
          </Card>
        </div>
      </section>
      </AnimatedSection>

      <footer className="py-10 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {profile?.name || "Yohann Di Crescenzo"}. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <p>
              {t.builtWith} <span className="font-medium">React</span> & <span className="font-medium">Tailwind</span> & <span className="font-medium">Supabase</span>
            </p>
            <a href="/admin" className="hover:text-primary transition-colors">Voir le site admin</a>
          </div>
        </div>
      </footer>

      {/* Notification système */}
      <Notification
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </motion.div>
  );
}

// ——————————————————————————————————————————————
// Sous‑composants
// ——————————————————————————————————————————————
function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-muted/50 text-center sm:text-left">
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function SocialLink({ href, icon, label }) {
  if (!href) return null;
  
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 hover:bg-muted/50 transition">
      <span className="flex items-center gap-2">{icon}{label}</span>
      <ArrowUpRight className="h-4 w-4" />
    </a>
  );
}

function MegaProjectCard({ project, currentLang, t }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card className="h-full relative overflow-hidden">
        {project.is_mega_project && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive" className="text-xs">MEGA</Badge>
          </div>
        )}
        {/* Image du projet mega ou fond par défaut */}
        <div className="h-48 rounded-t-xl overflow-hidden">
          <ProjectImage
            src={getPublicImageUrl(project.image_url)}
            alt={getLocalizedText(project, 'title', currentLang)}
            className="transition-transform duration-300 hover:scale-105"
            fallbackGradient="from-gray-300 via-gray-200 to-gray-100"
          />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{getLocalizedText(project, 'title', currentLang)}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem] mb-2">{getLocalizedText(project, 'description', currentLang)}</CardDescription>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 mr-1" /> {project.stars}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Array.isArray(project.category) ? project.category : [project.category]).map((cat) => (
              <Badge key={`${project.id}-category-${cat}`} variant="default" className="rounded-full capitalize h-6 px-3 text-xs">{cat}</Badge>
            ))}
            {project.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full h-6 px-3 text-xs">{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-start">
            <a href={project.link} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">{t.see} <ArrowUpRight className="ml-1 h-4 w-4" /></Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
