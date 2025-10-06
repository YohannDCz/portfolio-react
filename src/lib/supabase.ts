import type {
  ApiResponse,
  AuthResult,
  Certification,
  ContactMessage,
  FreelancePlatform,
  KanbanColumn,
  KanbanTask,
  KanbanTaskComment,
  Language,
  ProductionGoal,
  Profile,
  Project,
  Skill,
  TranslationRequest,
  TranslationResult,
  UploadImageParams,
  UploadImageResult,
  UseCertificationsResult,
  UseFreelancePlatformsResult,
  UseKanbanColumnsResult,
  UseKanbanTasksResult,
  UseProductionGoalsResult,
  UseProfileResult,
  UseProjectProgressResult,
  UseProjectsResult,
  UseSkillsResult,
} from '@/types';
import type { Database } from '@/types/supabase';
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Supabase configuration
const supabaseUrl = 'https://ayrnxrqoheicolnsvtqf.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cm54cnFvaGVpY29sbnN2dHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDQyNTksImV4cCI6MjA3MjEyMDI1OX0.j_SazovRFlbbtgOXD7nKOgWhei5EsEJEt9Vj85ENC4M';

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseKey);

// =====================================
// HOOKS D'AUTHENTIFICATION
// =====================================

/**
 * Hook pour gérer l'authentification utilisateur
 * @returns Object with authentication state and functions
 */
export const useAuth = (): AuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction de connexion
  const signIn = async (email: string, password: string): Promise<ApiResponse<Session>> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data: data.session };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  // Fonction de déconnexion
  const signOut = async (): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  // Fonction d'inscription (optionnelle)
  const signUp = async (email: string, password: string): Promise<ApiResponse<Session>> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data: data.session };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    isAuthenticated: !!user,
  };
};

// =====================================
// HOOKS POUR RÉCUPÉRER LES DONNÉES
// =====================================

/**
 * Hook pour récupérer le profil utilisateur
 * @returns Profile data with loading and error states
 */
export const useProfile = (): UseProfileResult => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('profiles').select('*').single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, data: profile, loading, error };
};

/**
 * Hook pour récupérer les compétences
 * @returns Skills data with loading and error states
 */
export const useSkills = (): UseSkillsResult => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .eq('is_featured', true)
          .order('level', { ascending: false });

        if (error) throw error;
        setSkills(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return { skills, data: skills, loading, error };
};

/**
 * Hook pour récupérer les projets
 * @returns Projects data with loading and error states
 */
export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('stars', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, data: projects, loading, error };
};

/**
 * Hook pour récupérer les plateformes freelance
 * @returns Freelance platforms data with loading and error states
 */
export const useFreelancePlatforms = (): UseFreelancePlatformsResult => {
  const [platforms, setPlatforms] = useState<FreelancePlatform[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlatforms = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('freelance_platforms')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        setPlatforms(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  return { platforms, data: platforms, loading, error };
};

/**
 * Hook pour récupérer les certifications
 * @returns Certifications data with loading and error states
 */
export const useCertifications = (): UseCertificationsResult => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertifications = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('certifications')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Use display_order first, then fallback to status priority for items with same order
        const sortedData =
          data?.sort((a, b) => {
            // First, sort by display_order (ascending)
            if (a.display_order !== b.display_order) {
              return (a.display_order || 0) - (b.display_order || 0);
            }

            // If same display_order, use status priority
            const statusPriority: Record<string, number> = {
              completed: 4,
              to_deploy: 3,
              in_progress: 2,
              planned: 1,
            };

            const priorityA = statusPriority[a.status] || 0;
            const priorityB = statusPriority[b.status] || 0;

            if (priorityA !== priorityB) {
              return priorityB - priorityA; // Higher priority first
            }

            // If same status, sort by creation date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }) || [];

        setCertifications(sortedData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  return { certifications, data: certifications, loading, error };
};

/**
 * Hook pour récupérer les objectifs de production
 * @returns Production goals and project counts with loading and error states
 */
export const useProductionGoals = (): UseProductionGoalsResult => {
  const [goals, setGoals] = useState<ProductionGoal[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoalsAndCounts = async (): Promise<void> => {
      try {
        // Récupérer les objectifs
        const { data: goalsData, error: goalsError } = await supabase
          .from('production_goals')
          .select('*')
          .order('created_at', { ascending: true });

        if (goalsError) throw goalsError;

        // Récupérer les comptages actuels
        const { data: countsData, error: countsError } = await supabase
          .from('project_counts')
          .select('*');

        if (countsError) throw countsError;

        // Transformer les comptages en objet
        const countsMap: Record<string, number> = {};
        countsData?.forEach((count) => {
          countsMap[count.category] = count.completed_count;
        });

        setGoals(goalsData || []);
        setProjectCounts(countsMap);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalsAndCounts();
  }, []);

  return { goals, projectCounts, data: goals, loading, error };
};

/**
 * Fonction pour envoyer un message de contact avec email
 * @param messageData - Contact message data
 * @returns API response with success/error status
 */
export const sendContactMessage = async (
  messageData: ContactMessage,
): Promise<ApiResponse<any>> => {
  try {
    // Appeler notre API route qui gère Supabase + Resend
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Erreur lors de l'envoi");
    }

    return result;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

/**
 * Fonction utilitaire pour obtenir le texte dans la langue appropriée
 * @param item - Object containing localized fields
 * @param field - Base field name
 * @param language - Target language ('fr' or 'en')
 * @returns Localized text string
 */
export const getLocalizedText = (item: any, field: string, language: Language = 'fr'): string => {
  if (!item) return '';
  const languageField = `${field}_${language}`;
  return item[languageField] || item[`${field}_fr`] || item[field] || '';
};

/**
 * Fonction pour récupérer les projets par catégorie
 * @param projects - Array of projects
 * @param category - Category filter
 * @returns Filtered projects array
 */
export const getProjectsByCategory = (projects: Project[], category: string): Project[] => {
  if (!projects || !Array.isArray(projects)) return [];
  if (category === 'tous' || category === 'all') return projects;
  return projects.filter((project) => project.category && project.category.includes(category));
};

/**
 * Fonction pour récupérer les mega projets
 * @param projects - Array of projects
 * @returns Filtered mega projects array
 */
export const getMegaProjects = (projects: Project[]): Project[] => {
  if (!projects || !Array.isArray(projects)) return [];
  return projects.filter((project) => project.is_mega_project === true);
};

/**
 * Fonction pour récupérer les projets normaux
 * @param projects - Array of projects
 * @returns Filtered normal projects array
 */
export const getNormalProjects = (projects: Project[]): Project[] => {
  if (!projects || !Array.isArray(projects)) return [];
  return projects.filter((project) => project.is_mega_project !== true);
};

// =====================================
// SIMPLE TRANSLATION HELPER VIA API ROUTE
// =====================================

/**
 * Translate text using API route
 * @param params - Translation parameters
 * @returns Translation result
 */
export const translateText = async ({
  text,
  target,
  source = 'auto',
}: TranslationRequest): Promise<TranslationResult> => {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target, source }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Translation failed');
    return { success: true, text: data.translatedText };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// =====================================
// FONCTIONS CRUD POUR L'ADMIN
// =====================================

// Projets
export const createProject = async (
  projectData: Partial<Project>,
): Promise<ApiResponse<Project>> => {
  try {
    const { data, error } = await supabase.from('projects').insert([projectData]).select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const updateProject = async (
  id: string,
  projectData: Partial<Project>,
): Promise<ApiResponse<Project>> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const getProject = async (id: string): Promise<ApiResponse<Project>> => {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const deleteProject = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Certifications
export const createCertification = async (
  certData: Partial<Certification>,
): Promise<ApiResponse<Certification>> => {
  try {
    const { data, error } = await supabase.from('certifications').insert([certData]).select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const updateCertification = async (
  id: string,
  certData: Partial<Certification>,
): Promise<ApiResponse<Certification>> => {
  try {
    const { data, error } = await supabase
      .from('certifications')
      .update(certData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const getCertification = async (id: string): Promise<ApiResponse<Certification>> => {
  try {
    const { data, error } = await supabase.from('certifications').select('*').eq('id', id).single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const deleteCertification = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.from('certifications').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

/**
 * Reorder certifications after drag and drop
 * @param certifications - Array of certifications with new order
 * @returns API response
 */
export const reorderCertifications = async (
  certifications: Certification[],
): Promise<ApiResponse<Certification[]>> => {
  try {
    // Update display_order for each certification
    const updates = certifications.map((cert, index) => ({
      id: cert.id,
      display_order: index,
    }));

    // Batch update all certifications
    const { data, error } = await supabase
      .from('certifications')
      .upsert(updates, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Compétences
export const createSkill = async (skillData: Partial<Skill>): Promise<ApiResponse<Skill>> => {
  try {
    const { data, error } = await supabase.from('skills').insert([skillData]).select();

    if (error) {
      throw error;
    }
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const updateSkill = async (
  id: string,
  skillData: Partial<Skill>,
): Promise<ApiResponse<Skill>> => {
  try {
    const { data, error } = await supabase.from('skills').update(skillData).eq('id', id).select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const deleteSkill = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.from('skills').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Profil
export const updateProfile = async (
  id: string,
  profileData: Partial<Profile>,
): Promise<ApiResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Plateformes freelance
export const createFreelancePlatform = async (
  platformData: Partial<FreelancePlatform>,
): Promise<ApiResponse<FreelancePlatform>> => {
  try {
    const { data, error } = await supabase
      .from('freelance_platforms')
      .insert([platformData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const updateFreelancePlatform = async (
  id: string,
  platformData: Partial<FreelancePlatform>,
): Promise<ApiResponse<FreelancePlatform>> => {
  try {
    const { data, error } = await supabase
      .from('freelance_platforms')
      .update(platformData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const deleteFreelancePlatform = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.from('freelance_platforms').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// =====================================
// KANBAN SYSTEM HOOKS AND FUNCTIONS
// =====================================

/**
 * Hook pour récupérer les colonnes Kanban
 * @returns Kanban columns with loading and error states
 */
export const useKanbanColumns = (): UseKanbanColumnsResult => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumns = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('kanban_columns')
          .select('*')
          .order('position', { ascending: true });

        if (error) throw error;
        setColumns(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, []);

  return { columns, data: columns, loading, error };
};

/**
 * Hook pour récupérer les tâches Kanban avec leurs colonnes
 * @returns Kanban tasks with loading, error states and refetch function
 */
export const useKanbanTasks = (): UseKanbanTasksResult => {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kanban_tasks')
        .select(
          `
          *,
          column:kanban_columns(id, name, color),
          project:projects(id, title_fr)
        `,
        )
        .order('position', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, data: tasks, loading, error, refetch: fetchTasks };
};

/**
 * Hook pour récupérer les statistiques Kanban
 * @returns Kanban statistics with loading and error states
 */
export const useKanbanStats = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('kanban_stats').select('*');

        if (error) throw error;
        setStats(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

// Fonctions CRUD pour les tâches Kanban
export const createKanbanTask = async (
  taskData: Partial<KanbanTask>,
): Promise<ApiResponse<KanbanTask>> => {
  try {
    // Obtenir la position suivante dans la colonne
    const { data: existingTasks, error: countError } = await supabase
      .from('kanban_tasks')
      .select('position')
      .eq('column_id', taskData.column_id!)
      .order('position', { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextPosition =
      existingTasks && existingTasks.length > 0 ? existingTasks[0].position + 1 : 1;

    const { data, error } = await supabase
      .from('kanban_tasks')
      .insert([{ ...taskData, position: nextPosition }]).select(`
        *,
        column:kanban_columns(id, name, color),
        project:projects(id, title_fr)
      `);

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const updateKanbanTask = async (
  id: string,
  taskData: Partial<KanbanTask>,
): Promise<ApiResponse<KanbanTask>> => {
  try {
    const { data, error } = await supabase.from('kanban_tasks').update(taskData).eq('id', id)
      .select(`
        *,
        column:kanban_columns(id, name, color),
        project:projects(id, title_fr)
      `);

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const deleteKanbanTask = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.from('kanban_tasks').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

/**
 * Fonction pour déplacer une tâche (drag & drop)
 * @param taskId - Task ID
 * @param newColumnId - New column ID
 * @param newPosition - New position
 * @returns API response
 */
export const moveKanbanTask = async (
  taskId: string,
  newColumnId: string,
  newPosition: number,
): Promise<ApiResponse<void>> => {
  try {
    // Mettre à jour la tâche
    const { error } = await supabase
      .from('kanban_tasks')
      .update({
        column_id: newColumnId,
        position: newPosition,
      })
      .eq('id', taskId);

    if (error) throw error;

    // Réorganiser les positions dans la nouvelle colonne
    const { error: reorderError } = await supabase.rpc('reorder_kanban_tasks', {
      column_uuid: newColumnId,
    });

    if (reorderError) throw reorderError;

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

/**
 * Fonction pour calculer la progression d'un projet
 * @param projectId - Project ID
 * @returns API response with progress percentage
 */
export const getProjectProgress = async (projectId: string): Promise<ApiResponse<number>> => {
  try {
    const { data, error } = await supabase.rpc('calculate_project_progress', {
      project_uuid: projectId,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

/**
 * Fonction pour obtenir les tâches d'un projet spécifique
 * @param projectId - Project ID
 * @returns API response with project tasks
 */
export const getProjectTasks = async (projectId: string): Promise<ApiResponse<KanbanTask[]>> => {
  try {
    const { data, error } = await supabase
      .from('kanban_tasks')
      .select(
        `
        *,
        column:kanban_columns(id, name, color)
      `,
      )
      .eq('project_id', projectId)
      .order('position', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Fonctions pour les commentaires
export const addTaskComment = async (
  taskId: string,
  author: string,
  content: string,
): Promise<ApiResponse<KanbanTaskComment>> => {
  try {
    const { data, error } = await supabase
      .from('kanban_task_comments')
      .insert([
        {
          task_id: taskId,
          author,
          content,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

export const getTaskComments = async (
  taskId: string,
): Promise<ApiResponse<KanbanTaskComment[]>> => {
  try {
    const { data, error } = await supabase
      .from('kanban_task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

/**
 * Hook pour récupérer la progression d'un projet
 * @param projectId - Project ID
 * @returns Project progress with loading and error states
 */
export const useProjectProgress = (projectId?: string): UseProjectProgressResult => {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProgress(0);
      setLoading(false);
      return;
    }

    const fetchProgress = async (): Promise<void> => {
      try {
        const result = await getProjectProgress(projectId);

        if (result.success && result.data !== undefined) {
          setProgress(result.data);
        } else {
          setError(result.error || 'Unknown error');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [projectId]);

  return { progress, loading, error };
};

/**
 * Hook pour récupérer les progressions de tous les projets
 * @returns All projects progress data
 */
export const useAllProjectsProgress = () => {
  const { projects } = useProjects();
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!projects?.length) {
      setLoading(false);
      return;
    }

    const fetchAllProgress = async (): Promise<void> => {
      const progressPromises = projects.map(async (project) => {
        const result = await getProjectProgress(project.id);
        return {
          projectId: project.id,
          progress: result.success && result.data !== undefined ? result.data : 0,
        };
      });

      try {
        const results = await Promise.all(progressPromises);
        const progressMap: Record<string, number> = {};
        results.forEach(({ projectId, progress }) => {
          progressMap[projectId] = progress;
        });
        setProgressData(progressMap);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchAllProgress();
  }, [projects]);

  return { progressData, loading };
};

// =====================================
// UPLOAD IMAGES TO SUPABASE STORAGE
// =====================================

/**
 * Helper to generate a unique file path
 * @param folder - Folder name
 * @param fileName - File name
 * @returns Unique file path
 */
const generateFilePath = (folder: string, fileName: string): string => {
  const ext = fileName.includes('.') ? fileName.split('.').pop() : 'png';
  const base = fileName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  return `${folder}/${base}-${timestamp}.${ext}`;
};

/**
 * Upload a file to a storage bucket and return the public URL
 * @param params - Upload parameters
 * @returns Upload result with URL and path
 */
export const uploadImageAndGetPublicUrl = async ({
  bucket = 'images',
  folder = 'projects',
  file,
}: UploadImageParams): Promise<UploadImageResult> => {
  try {
    if (!file) throw new Error('Aucun fichier fourni');
    const path = generateFilePath(folder, file.name || 'image.png');

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type || 'image/png',
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) throw new Error("Impossible de générer l'URL publique");

    return { success: true, data: publicUrl, url: publicUrl, path };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

/**
 * Get a public URL for a storage object path or return the original URL if already absolute
 * @param pathOrUrl - Storage path or absolute URL
 * @param bucket - Storage bucket name
 * @returns Public URL string
 */
export const getPublicImageUrl = (pathOrUrl: string, bucket: string = 'images'): string => {
  try {
    if (!pathOrUrl) return '';
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const { data } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);
    return data?.publicUrl || '';
  } catch (_) {
    return '';
  }
};

// Re-export React hooks for backward compatibility
export { useEffect, useState } from 'react';
