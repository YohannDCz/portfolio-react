// =====================================
// TYPE DEFINITIONS FOR PORTFOLIO PROJECT
// =====================================

import type { Database } from './supabase';

// Re-export database types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// =====================================
// PROFILE TYPES
// =====================================
export interface Profile {
  id: string;
  full_name_fr?: string;
  full_name_en?: string;
  title_fr?: string;
  title_en?: string;
  bio_fr?: string;
  bio_en?: string;
  location_fr?: string;
  location_en?: string;
  email?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  profile_image?: string;
  phone?: string;
  is_available?: boolean;
  availability_text_fr?: string;
  availability_text_en?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================
// PROJECT TYPES
// =====================================
export interface Project {
  id: string;
  title_fr: string;
  title_en?: string;
  description_fr: string;
  description_en?: string;
  technologies: string[];
  demo_url?: string;
  repo_url?: string;
  image?: string;
  status: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
  is_featured?: boolean;
  is_mega_project?: boolean;
  category?: string[];
  stars?: number;
  figma_url?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================
// SKILL TYPES
// =====================================
export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  is_featured?: boolean;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================
// CERTIFICATION TYPES
// =====================================
export interface Certification {
  id: string;
  title_fr: string;
  title_en?: string;
  organization_fr: string;
  organization_en?: string;
  description_fr?: string;
  description_en?: string;
  image?: string;
  certificate_url?: string;
  status: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// =====================================
// FREELANCE PLATFORM TYPES
// =====================================
export interface FreelancePlatform {
  id: string;
  name: string;
  url?: string;
  username?: string;
  rating?: number;
  max_rating?: number;
  reviews_count?: number;
  profile_url?: string;
  is_active?: boolean;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================
// PRODUCTION GOALS TYPES
// =====================================
export interface ProductionGoal {
  id: string;
  category: string;
  target_count: number;
  description_fr?: string;
  description_en?: string;
  created_at?: string;
}

export interface ProjectCount {
  category: string;
  completed_count: number;
}

// =====================================
// KANBAN TYPES
// =====================================
export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  position: number;
  created_at?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  column_id: string;
  project_id?: string;
  position: number;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  column?: KanbanColumn;
  project?: Pick<Project, 'id' | 'title_fr'>;
}

export interface KanbanTaskComment {
  id: string;
  task_id: string;
  author: string;
  content: string;
  created_at?: string;
}

// =====================================
// API RESPONSE TYPES
// =====================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// =====================================
// AUTHENTICATION TYPES
// =====================================
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface AuthResult {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ApiResponse<AuthSession>>;
  signOut: () => Promise<ApiResponse<void>>;
  signUp: (email: string, password: string) => Promise<ApiResponse<AuthSession>>;
  isAuthenticated: boolean;
}

// =====================================
// HOOK RETURN TYPES
// =====================================
export interface UseDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export interface UseProfileResult extends UseDataResult<Profile | null> {
  profile: Profile | null;
}

export interface UseProjectsResult extends UseDataResult<Project[]> {
  projects: Project[];
}

export interface UseSkillsResult extends UseDataResult<Skill[]> {
  skills: Skill[];
}

export interface UseCertificationsResult extends UseDataResult<Certification[]> {
  certifications: Certification[];
}

export interface UseFreelancePlatformsResult extends UseDataResult<FreelancePlatform[]> {
  platforms: FreelancePlatform[];
}

export interface UseProductionGoalsResult extends UseDataResult<ProductionGoal[]> {
  goals: ProductionGoal[];
  projectCounts: Record<string, number>;
}

export interface UseKanbanColumnsResult extends UseDataResult<KanbanColumn[]> {
  columns: KanbanColumn[];
}

export interface UseKanbanTasksResult extends UseDataResult<KanbanTask[]> {
  tasks: KanbanTask[];
  refetch: () => void;
}

export interface UseProjectProgressResult {
  progress: number;
  loading: boolean;
  error: string | null;
}

// =====================================
// UTILITY TYPES
// =====================================
export type Language = 'fr' | 'en';

export interface LocalizedField {
  fr: string;
  en?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export interface TranslationRequest {
  text: string;
  target: string;
  source?: string;
}

export interface TranslationResult {
  success: boolean;
  text?: string;
  error?: string;
}

// =====================================
// COMPONENT PROP TYPES
// =====================================
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ProjectCardProps extends BaseComponentProps {
  project: Project;
  language?: Language;
  showProgress?: boolean;
}

export interface AnimatedSectionProps extends BaseComponentProps {
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'slide-in';
}

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
}

export interface LanguageSelectorProps extends BaseComponentProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

// =====================================
// FORM TYPES
// =====================================
export interface ProjectFormData {
  title_fr: string;
  title_en?: string;
  description_fr: string;
  description_en?: string;
  technologies: string[];
  demo_url?: string;
  repo_url?: string;
  figma_url?: string;
  category?: string[];
  status: Project['status'];
  is_featured?: boolean;
  is_mega_project?: boolean;
  image?: File | string;
}

export interface CertificationFormData {
  title_fr: string;
  title_en?: string;
  organization_fr: string;
  organization_en?: string;
  description_fr?: string;
  description_en?: string;
  certificate_url?: string;
  status: Certification['status'];
  image?: File | string;
}

export interface SkillFormData {
  name: string;
  level: number;
  category: string;
  is_featured?: boolean;
  icon?: string;
}

export interface ProfileFormData {
  full_name_fr?: string;
  full_name_en?: string;
  title_fr?: string;
  title_en?: string;
  bio_fr?: string;
  bio_en?: string;
  location_fr?: string;
  location_en?: string;
  email?: string;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  is_available?: boolean;
  availability_text_fr?: string;
  availability_text_en?: string;
  profile_image?: File | string;
}

// =====================================
// DRAG AND DROP TYPES
// =====================================
export interface DragEndResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}

// =====================================
// STORAGE TYPES
// =====================================
export interface UploadImageParams {
  bucket?: string;
  folder?: string;
  file: File;
}

export interface UploadImageResult extends ApiResponse<string> {
  url?: string;
  path?: string;
}

// =====================================
// ERROR TYPES
// =====================================
export interface AppError extends Error {
  code?: string;
  details?: any;
}

// =====================================
// NAVIGATION TYPES
// =====================================
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  isActive?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// =====================================
// THEME TYPES
// =====================================
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}
