'use client';

import ProjectImage from "@/components/ProjectImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Github, Globe, Linkedin, Mail, Moon, Star, Sun } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

// Import des hooks Supabase
import {
  getLocalizedText,
  getProjectsByCategory,
  getPublicImageUrl,
  sendContactMessage,
  useAuth,
  useCertifications,
  useFreelancePlatforms,
  useProfile,
  useProjects,
  useSkills
} from "@/lib/supabase";

// Import du contexte multilingue
import LanguageSelector from "@/components/LanguageSelector";
import { useDirectionalClasses, useLanguage } from "@/contexts/LanguageContext";

// Import du contexte d'authentification pour les boutons d'édition
import AdminEditButton, { AuthStatusIndicator, ProjectEditButton } from "@/components/AdminEditButton";
import ProfileImageModal from '@/components/ProfileImageModal';
import { AdminGuestProvider, useAdminGuest } from "@/contexts/AdminGuestContext";
import { useRouter } from "next/navigation";

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
    cv: "Curriculum",
    certifications: "Certifications",
    about: "À propos",
    contact: "Contact",
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
    availableForMissions: "Disponible pour mission",
    availableForInternship: "Disponible pour stage",
    contactMe: "Me contacter",
    seeWebsite: "Voir mon site",
    yearsExp: "Années d'exp.",
    satisfaction: "Satisfaction",
    mainPlatforms: "Présence sur les principales plateformes.",
    courseAndSkills: "Parcours et compétences validées.",
    inProgress: "En cours",
    completed: "Terminé",
    planned: "Planifié",
    toDeploy: "À déployer",
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
    cv: "Curriculum",
    certifications: "Certifications",
    about: "About",
    contact: "Contact",
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
    availableForMissions: "Available for mission",
    availableForInternship: "Available for internship",
    contactMe: "Contact me",
    seeWebsite: "See my website",
    yearsExp: "Years exp.",
    satisfaction: "Satisfaction",
    mainPlatforms: "Presence on main platforms.",
    courseAndSkills: "Course and validated skills.",
    inProgress: "In progress",
    completed: "Completed",
    planned: "Planned",
    toDeploy: "To deploy",
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
    availableForInternship: "इंटर्नशिप के लिए उपलब्ध",
    contactMe: "मुझसे संपर्क करें",
    seeWebsite: "मेरी वेबसाइट देखें",
    yearsExp: "वर्षों का अनुभव",
    satisfaction: "संतुष्टि",
    mainPlatforms: "मुख्य प्लेटफॉर्म पर उपस्थिति।",
    courseAndSkills: "कोर्स और सत्यापित कौशल।",
    inProgress: "प्रगति में",
    completed: "पूर्ण",
    planned: "नियोजित",
    toDeploy: "तैनात करना",
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
    availableForMissions: "متاح للمهمة",
    availableForInternship: "متاح للتدريب",
    contactMe: "اتصل بي",
    seeWebsite: "مشاهدة موقعي",
    yearsExp: "سنوات الخبرة",
    satisfaction: "الرضا",
    mainPlatforms: "الحضور على المنصات الرئيسية.",
    courseAndSkills: "الدورة والمهارات المعتمدة.",
    inProgress: "قيد التقدم",
    completed: "مكتمل",
    planned: "مخطط",
    toDeploy: "للنشر",
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
function ProjectCard({ project, currentLang, t, isAdminMode = false }) {
  const { getDirectionalClass, isRTL } = useDirectionalClasses();
  

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card className="h-full relative overflow-hidden">
        {/* Admin Edit Button - Only show in admin mode */}
        {isAdminMode && <ProjectEditButton projectId={project.id} />}
        
        {project.status === 'in_progress' && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700">
              {t.inProgress}
            </Badge>
          </div>
        )}
        {project.status === 'to_deploy' && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
              {t.toDeploy}
            </Badge>
          </div>
        )}
        {/* Image du projet */}
        <div className="h-48 rounded-t-xl overflow-hidden bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100">
          <div className="w-full h-full relative">
            {/* Image décalée d'un tiers */}
            <div className="absolute inset-0 transform -translate-y-10">
            <ProjectImage
              src={getPublicImageUrl(project.image_url)}
              alt={getLocalizedText(project, 'title', currentLang)}
                className="object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                fallbackGradient="from-primary/20 to-primary/10"
            />
          </div>
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className={`${getDirectionalClass("flex items-start justify-between")} gap-2`}>
                <div className="flex-1">
              <CardTitle className="text-lg">{getLocalizedText(project, 'title', currentLang)}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem] mb-2">{getLocalizedText(project, 'description', currentLang)}</CardDescription>
                </div>
                {project.stars > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1" /> {project.stars}
                  </div>
                )}
              </div>
            </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className={`${getDirectionalClass("flex flex-wrap gap-1.5")} mb-4 min-h-[3.5rem] content-start flex-1`}>
            {(Array.isArray(project.category) ? project.category : [project.category]).map((cat) => (
              <Badge key={`${project.id}-category-${cat}`} variant="default" className="rounded-full capitalize h-6 px-2.5 text-xs flex-shrink-0">{cat}</Badge>
            ))}
            {project.tags?.slice(0, 8).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full h-6 px-2.5 text-xs flex-shrink-0 max-w-[120px] truncate">{tag}</Badge>
            ))}
            {project.tags?.length > 8 && (
              <Badge variant="outline" className="rounded-full h-6 px-2.5 text-xs flex-shrink-0">
                +{project.tags.length - 8}
              </Badge>
            )}
          </div>
          <div className={`${getDirectionalClass("flex gap-2")} mt-auto pt-3 border-t bg-red-100 p-2`}>
              {/* Voir button - always displayed, takes full width */}
              <a 
                href={project.link && project.link !== '#' ? project.link : '#'} 
                target={project.link && project.link !== '#' ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className="flex-1"
              >
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`w-full ${getDirectionalClass("flex items-center justify-center")}`}
                  disabled={!project.link || project.link === '#'}
                >
                  <Globe className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4 no-rtl-transform`} />
                  {t.see}
                </Button>
              </a>
              
              {/* GitHub icon - only when github_url exists */}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="no-rtl-transform px-3">
                    <Github className="w-4 h-4" />
                  </Button>
                </a>
              )}
              
              {/* Figma icon - only when figma_url exists */}
              {project.figma_url && (
                <a href={project.figma_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="no-rtl-transform px-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.491S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068V16.49H8.148zM24 12.981c0 2.476-2.014 4.49-4.49 4.49s-4.49-2.014-4.49-4.49 2.014-4.49 4.49-4.49 4.49 2.014 4.49 4.49zm-4.49-3.019c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019 3.019-1.355 3.019-3.019-1.354-3.019-3.019-3.019z"/>
                    </svg>
                  </Button>
                </a>
              )}
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ——————————————————————————————————————————————
// Composant principal
// ——————————————————————————————————————————————
function PortfolioContent() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const { currentLang, isRTL } = useLanguage();
  const { getDirectionalClass, getFlexDirection, getTextAlign } = useDirectionalClasses();
  const { isAuthenticated } = useAuth();
  const { isGuest } = useAdminGuest();
  const isAdminMode = isAuthenticated || isGuest;
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("tous");
  const [sort, setSort] = useState("popular");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [activeSection, setActiveSection] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCertPage, setCurrentCertPage] = useState(1);

  const t = TRANSLATIONS[currentLang];

  // Hook pour détecter la taille d'écran
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hook de chargement global
  const { isLoading, registerLoading } = useGlobalLoading();

  // Hooks Supabase
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { skills, loading: skillsLoading, error: skillsError } = useSkills();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { platforms, loading: platformsLoading, error: platformsError } = useFreelancePlatforms();
  const { certifications, loading: certificationsLoading, error: certificationsError } = useCertifications();

  // Enregistrer tous les états de chargement
  useEffect(() => {
    registerLoading('profile', profileLoading);
    registerLoading('skills', skillsLoading);
    registerLoading('projects', projectsLoading);
    registerLoading('platforms', platformsLoading);
    registerLoading('certifications', certificationsLoading);
  }, [profileLoading, skillsLoading, projectsLoading, platformsLoading, certificationsLoading, registerLoading]);

  // Scroll spy pour navigation active
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 150; // Base offset for all sections
    
    // Get all section elements with their positions
    const projetsEl = document.getElementById('projets');
    const cvEl = document.getElementById('cv');
    const aproposEl = document.getElementById('apropos');
    const contactEl = document.getElementById('contact');
    
    // Debug logging (remove in production)
    if (aproposEl) {
      console.log('Scroll Debug:', {
        scrollPosition: scrollPosition - 150,
        aproposTop: aproposEl.offsetTop,
        aproposTrigger: aproposEl.offsetTop - 100,
        shouldTriggerContact: scrollPosition >= aproposEl.offsetTop - 100
      });
    }
    
    // Determine which section is currently active
    let currentSection = '';
    
    if (contactEl && scrollPosition >= contactEl.offsetTop) {
      currentSection = 'contact';
    } else if (aproposEl && scrollPosition >= aproposEl.offsetTop - 100) {
      // Trigger contact navbar earlier when reaching à propos section
      currentSection = 'contact';
    } else if (cvEl && scrollPosition >= cvEl.offsetTop) {
      currentSection = 'cv';
    } else if (projetsEl && scrollPosition >= projetsEl.offsetTop) {
      currentSection = 'projets';
    }
    
    setActiveSection(currentSection);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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

  // Tous les projets (normaux et mega) ensemble
  const allProjects = filtered;

  // Configuration de la pagination
  const projectsPerPage = isMobile ? 3 : 6; // 3 sur mobile, 6 sur desktop (2 rangées × 3 colonnes)
  
  // Projets paginés
  const paginatedProjects = useMemo(() => {
    if (query) {
      // Si recherche active, pas de pagination
      return allProjects.filter(p => p.status !== 'to_deploy');
    }
    
    const filteredForPagination = allProjects.filter(p => p.status !== 'to_deploy');
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    return filteredForPagination.slice(startIndex, endIndex);
  }, [allProjects, currentPage, projectsPerPage, query]);

  // Nombre total de pages
  const totalPages = useMemo(() => {
    if (query) return 1; // Pas de pagination en mode recherche
    const filteredForPagination = allProjects.filter(p => p.status !== 'to_deploy');
    return Math.ceil(filteredForPagination.length / projectsPerPage);
  }, [allProjects, projectsPerPage, query]);

  // Reset de la page quand on change d'onglet ou de recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, query]);

  // Configuration de la pagination pour les certifications
  const certificationsPerPage = isMobile ? 3 : 6; // 3 sur mobile, 6 sur desktop (2 rangées × 3 colonnes)
  
  // Certifications paginées
  const paginatedCertifications = useMemo(() => {
    if (!certifications) return [];
    
    const startIndex = (currentCertPage - 1) * certificationsPerPage;
    const endIndex = startIndex + certificationsPerPage;
    return certifications.slice(startIndex, endIndex);
  }, [certifications, currentCertPage, certificationsPerPage]);

  // Nombre total de pages pour les certifications
  const totalCertPages = useMemo(() => {
    if (!certifications) return 1;
    return Math.ceil(certifications.length / certificationsPerPage);
  }, [certifications, certificationsPerPage]);

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
               <ProfileImageModal 
                 src={profile?.avatar_url || "profile.png"} 
                 alt="Profile photo" 
                 fallback="YOU"
               >
               <Avatar className="ring-4 ring-background">
                    <AvatarImage alt="avatar" src={profile?.avatar_url || "profile.png"} />
                    <AvatarFallback>YOU</AvatarFallback>
                  </Avatar>
               </ProfileImageModal>
            </div>
            <div className={getTextAlign("text-start")}>
              <p className="text-sm text-muted-foreground leading-none">{t.portfolio}</p>
              <p className="font-medium leading-tight">{profile?.name || "Yohann Di Crescenzo"}</p>
            </div>
          </div>

          <nav className={`hidden md:flex items-center gap-6 text-sm ${getDirectionalClass("flex-row")}`}>
            <a 
              href="#projets" 
              className={`hover:opacity-80 transition-all ${
                activeSection === 'projets' ? 'font-bold text-primary' : ''
              }`}
            >
              {t.projects}
            </a>
            <a 
              href="#cv" 
              className={`hover:opacity-80 transition-all ${
                activeSection === 'cv' ? 'font-bold text-primary' : ''
              }`}
            >
              {t.cv}
            </a>
            <a 
              href="#contact" 
              className={`hover:opacity-80 transition-all ${
                activeSection === 'contact' ? 'font-bold text-primary' : ''
              }`}
            >
              {t.contact}
            </a>
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
              <div className="flex gap-2 mb-4 flex-wrap">
              <Badge>🎯 {currentLang === 'fr' ? 'Viser le millénaire' : currentLang === 'en' ? 'Aim for millennium' : currentLang === 'hi' ? 'सहस्राब्दी का लक्ष्य' : 'استهداف الألفية'}</Badge>
              <Badge variant="secondary">{t.availableForMissions}</Badge>
              <Badge variant="outline">{t.availableForInternship}</Badge>
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
              <Link href={"/not-found"} target="_blank" rel="noreferrer">
                <Button onClick={router.push("/not-found")} variant="outline">{t.seeWebsite}</Button>
              </Link>
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
                
              <CardContent className="-mt-9">
                <div className="flex items-end gap-4">
                  <ProfileImageModal 
                    src={profile?.avatar_url || "profile.png"} 
                    alt="Profile photo" 
                    fallback="YDC"
                  >
                  <Avatar className="h-23 w-23 ring-4 ring-background">
                    <AvatarImage alt="avatar" src={profile?.avatar_url || "profile.png"} />
                    <AvatarFallback>YDC</AvatarFallback>
                  </Avatar>
                  </ProfileImageModal>
                  <div className="pb-1">
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

        {/* Section Projets à déployer - Masquée lors de la recherche */}
        {!query && allProjects.filter(p => p.status === 'to_deploy').length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
                {t.toDeploy}
              </h3>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300">
                {allProjects.filter(p => p.status === 'to_deploy').length}
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allProjects.filter(p => p.status === 'to_deploy').map((p) => (
                <ProjectCard key={`to-deploy-${p.id}`} project={p} currentLang={currentLang} t={t} isAdminMode={isAdminMode} />
              ))}
            </div>
          </div>
        )}


        {/* Affichage conditionnel selon la recherche */}
        {query ? (
          /* Résultats de recherche - sans sections */
          <div className="mt-6">
            <div className="mb-4">
              <p className="text-muted-foreground">
                {allProjects.filter(p => p.status !== 'to_deploy').length} {allProjects.filter(p => p.status !== 'to_deploy').length === 1 ? 'résultat trouvé' : 'résultats trouvés'} pour "{query}"
              </p>
            </div>
            {projectsLoading ? (
              <LoadingSpinner />
            ) : projectsError ? (
              <ErrorMessage message={projectsError} />
            ) : allProjects.filter(p => p.status !== 'to_deploy').length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {allProjects.filter(p => p.status !== 'to_deploy').map((p) => (
                  <ProjectCard key={p.id} project={p} currentLang={currentLang} t={t} isAdminMode={isAdminMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun projet trouvé pour "{query}"</p>
              </div>
            )}
          </div>
        ) : (
          /* Navigation par onglets - affichage normal */
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
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedProjects.map((p) => (
                      <ProjectCard key={p.id} project={p} currentLang={currentLang} t={t} isAdminMode={isAdminMode} />
                    ))}
                  </div>

                  {/* Pagination - Seulement si pas de recherche et plusieurs pages */}
                  {!query && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        ←
                        <span className="hidden sm:inline">{currentLang === 'ar' ? 'السابق' : currentLang === 'hi' ? 'पिछला' : 'Précédent'}</span>
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2"
                      >
                        <span className="hidden sm:inline">{currentLang === 'ar' ? 'التالي' : currentLang === 'hi' ? 'अगला' : 'Suivant'}</span>
                        →
                      </Button>
                    </div>
                  )}

                  {/* Message si aucun projet */}
                  {paginatedProjects.length === 0 && !projectsLoading && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {currentLang === 'ar' ? 'لا توجد مشاريع في هذه الفئة' : 
                         currentLang === 'hi' ? 'इस श्रेणी में कोई प्रोजेक्ट नहीं है' : 
                         'Aucun projet dans cette catégorie'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        </section>

      {/* FREELANCE */}
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
                  <Badge variant="secondary" className="dark:bg-blue-600 dark:text-white">{t.freelance}</Badge>
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

      {/* CV / CERTIFICATIONS */}
      <section id="cv" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              {t.cv} / {t.certifications}
              <a 
                href="https://drive.google.com/file/d/1DvjLKHI-Fz0KPnPzNxUXarnwUlnRjJb_/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                title="Voir le CV complet"
              >
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </a>
            </h2>
            <p className="text-muted-foreground">{t.courseAndSkills}</p>
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
                    {/* Admin Edit Button - Only show in admin mode */}
                    {isAdminMode && (
                      <AdminEditButton 
                        href={`/admin/certifications/edit/${c.id}`} 
                        className="absolute top-2 left-2 z-10"
                      />
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
                        {c.status === 'completed' 
                          ? '✅' 
                          : c.status === 'in_progress' 
                            ? '⏳' 
                            : c.status === 'to_deploy'
                              ? '🚀'
                            : '🗂️'}
                        <span className="ml-1.5">{c.status === 'completed' ? t.completed : c.status === 'in_progress' ? t.inProgress : c.status === 'to_deploy' ? t.toDeploy : t.planned}</span>
                      </Badge>
                    </div>
                    <CardHeader className="pb-2 pt-0">
                      <CardTitle className="text-lg">{c.title}</CardTitle>
                      <CardDescription className="mb-2">{c.provider || "Certification"}</CardDescription>
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

              {/* Pagination pour les certifications - Seulement si plusieurs pages */}
              {totalCertPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCertPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentCertPage === 1}
                    className="flex items-center gap-2"
                  >
                    ←
                    <span className="hidden sm:inline">{currentLang === 'ar' ? 'السابق' : currentLang === 'hi' ? 'पिछला' : 'Précédent'}</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalCertPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentCertPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentCertPage(page)}
                        className="w-10 h-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCertPage(prev => Math.min(prev + 1, totalCertPages))}
                    disabled={currentCertPage === totalCertPages}
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">{currentLang === 'ar' ? 'التالي' : currentLang === 'hi' ? 'अगला' : 'Suivant'}</span>
                    →
                  </Button>
                </div>
              )}

              {/* Message si aucune certification */}
              {paginatedCertifications.length === 0 && !certificationsLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {currentLang === 'ar' ? 'لا توجد شهادات' : 
                     currentLang === 'hi' ? 'कोई सर्टिफिकेशन नहीं है' : 
                     'Aucune certification'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>




      {/* À PROPOS */}
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

      {/* CONTACT */}
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
              <Link href={"/not-found"}><SocialLink href={"profile?.website"} icon={<Globe className="h-4 w-4" />} label="Site web" /></Link>
              <SocialLink href={`mailto:${profile?.email || 'YohannDCz@gmail.com'}`} icon={<Mail className="h-4 w-4" />} label={profile?.email || 'YohannDCz@gmail.com'} />
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-10 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {profile?.name || "Yohann Di Crescenzo"}. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t.builtWith}</span>
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="currentColor">
                  <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.36-.034-.47 0-.92.014-1.36.034.44-.572.895-1.096 1.36-1.564zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.86.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.36.034.47 0 .92-.014 1.36-.034-.44.572-.895 1.095-1.36 1.563-.455-.468-.91-.991-1.36-1.563z"/>
                </svg>
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-500" fill="currentColor">
                  <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C7.666,17.818,9.027,19.2,12.001,19.2c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.182,8.976,12,6.001,12z"/>
                </svg>
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="currentColor">
                  <path d="M21.362,9.354H12V.396a.396.396,0,0,0-.716-.233L2.203,9.321a.396.396,0,0,0,.233.716H12V21.604a.396.396,0,0,0,.716.233L21.797,12.679a.396.396,0,0,0-.233-.716H12V9.354Z"/>
                </svg>
              </div>
            </div>
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

      {/* Indicateur d'authentification pour les développeurs */}
      <AuthStatusIndicator />
    </motion.div>
  );
}

// Composant principal avec providers
export default function Portfolio() {
  return (
    <AdminGuestProvider>
      <PortfolioContent />
    </AdminGuestProvider>
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

