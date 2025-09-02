import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabaseUrl = 'https://ayrnxrqoheicolnsvtqf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cm54cnFvaGVpY29sbnN2dHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDQyNTksImV4cCI6MjA3MjEyMDI1OX0.j_SazovRFlbbtgOXD7nKOgWhei5EsEJEt9Vj85ENC4M'

export const supabase = createClient(supabaseUrl, supabaseKey)

// =====================================
// HOOKS D'AUTHENTIFICATION
// =====================================

// Hook pour gérer l'authentification
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fonction de connexion
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Fonction d'inscription (optionnelle)
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    isAuthenticated: !!user
  }
}

// =====================================
// HOOKS POUR RÉCUPÉRER LES DONNÉES
// =====================================

// Hook pour récupérer le profil
export const useProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { profile, loading, error }
}

// Hook pour récupérer les compétences
export const useSkills = () => {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .eq('is_featured', true)
          .order('level', { ascending: false })

        if (error) throw error
        setSkills(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSkills()
  }, [])

  return { skills, loading, error }
}

// Hook pour récupérer les projets
export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('stars', { ascending: false })

        if (error) throw error
        setProjects(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return { projects, loading, error }
}

// Hook pour récupérer les plateformes freelance
export const useFreelancePlatforms = () => {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const { data, error } = await supabase
          .from('freelance_platforms')
          .select('*')
          .eq('is_active', true)

        if (error) throw error
        setPlatforms(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  return { platforms, loading, error }
}

// Hook pour récupérer les certifications
export const useCertifications = () => {
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const { data, error } = await supabase
          .from('certifications')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCertifications(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [])

  return { certifications, loading, error }
}

// Hook pour récupérer les objectifs de production
export const useProductionGoals = () => {
  const [goals, setGoals] = useState([])
  const [projectCounts, setProjectCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGoalsAndCounts = async () => {
      try {
        // Récupérer les objectifs
        const { data: goalsData, error: goalsError } = await supabase
          .from('production_goals')
          .select('*')
          .order('created_at', { ascending: true })

        if (goalsError) throw goalsError

        // Récupérer les comptages actuels
        const { data: countsData, error: countsError } = await supabase
          .from('project_counts')
          .select('*')

        if (countsError) throw countsError

        // Transformer les comptages en objet
        const countsMap = {}
        countsData.forEach(count => {
          countsMap[count.category] = count.completed_count
        })

        setGoals(goalsData)
        setProjectCounts(countsMap)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGoalsAndCounts()
  }, [])

  return { goals, projectCounts, loading, error }
}

// Fonction pour envoyer un message de contact avec email
export const sendContactMessage = async (messageData) => {
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
      throw new Error(result.error || 'Erreur lors de l\'envoi');
    }

    return result;
  } catch (err) {
    console.error('Erreur sendContactMessage:', err);
    return { success: false, error: err.message }
  }
}

// Fonction utilitaire pour obtenir le texte dans la langue appropriée
export const getLocalizedText = (item, field, language = 'fr') => {
  if (!item) return ''
  const languageField = `${field}_${language}`
  return item[languageField] || item[`${field}_fr`] || item[field] || ''
}

// Fonction pour récupérer les projets par catégorie
export const getProjectsByCategory = (projects, category) => {
  if (!projects || !Array.isArray(projects)) return []
  if (category === 'tous' || category === 'all') return projects
  return projects.filter(project =>
    project.category && project.category.includes(category)
  )
}

// Fonction pour récupérer les mega projets
export const getMegaProjects = (projects) => {
  if (!projects || !Array.isArray(projects)) return []
  return projects.filter(project => project.is_mega_project === true)
}

// Fonction pour récupérer les projets normaux
export const getNormalProjects = (projects) => {
  if (!projects || !Array.isArray(projects)) return []
  return projects.filter(project => project.is_mega_project !== true)
}

// =====================================
// FONCTIONS CRUD POUR L'ADMIN
// =====================================

// Projets
export const createProject = async (projectData) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const updateProject = async (id, projectData) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const getProject = async (id) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const deleteProject = async (id) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Certifications
export const createCertification = async (certData) => {
  try {
    const { data, error } = await supabase
      .from('certifications')
      .insert([certData])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const updateCertification = async (id, certData) => {
  try {
    const { data, error } = await supabase
      .from('certifications')
      .update(certData)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const getCertification = async (id) => {
  try {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const deleteCertification = async (id) => {
  try {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Compétences
export const createSkill = async (skillData) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .insert([skillData])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const updateSkill = async (id, skillData) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .update(skillData)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const deleteSkill = async (id) => {
  try {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Profil
export const updateProfile = async (id, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Plateformes freelance
export const createFreelancePlatform = async (platformData) => {
  try {
    const { data, error } = await supabase
      .from('freelance_platforms')
      .insert([platformData])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const updateFreelancePlatform = async (id, platformData) => {
  try {
    const { data, error } = await supabase
      .from('freelance_platforms')
      .update(platformData)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const deleteFreelancePlatform = async (id) => {
  try {
    const { error } = await supabase
      .from('freelance_platforms')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// =====================================
// KANBAN SYSTEM HOOKS AND FUNCTIONS
// =====================================

// Hook pour récupérer les colonnes Kanban
export const useKanbanColumns = () => {
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const { data, error } = await supabase
          .from('kanban_columns')
          .select('*')
          .order('position', { ascending: true })

        if (error) throw error
        setColumns(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchColumns()
  }, [])

  return { columns, loading, error }
}

// Hook pour récupérer les tâches Kanban avec leurs colonnes
export const useKanbanTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('kanban_tasks')
          .select(`
            *,
            column:kanban_columns(id, name, color),
            project:projects(id, title_fr, external_id)
          `)
          .order('position', { ascending: true })

        if (error) throw error
        setTasks(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  return { tasks, loading, error, refetch: () => setLoading(true) }
}

// Hook pour récupérer les statistiques Kanban
export const useKanbanStats = () => {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('kanban_stats')
          .select('*')

        if (error) throw error
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

// Fonctions CRUD pour les tâches Kanban
export const createKanbanTask = async (taskData) => {
  try {
    // Obtenir la position suivante dans la colonne
    const { data: existingTasks, error: countError } = await supabase
      .from('kanban_tasks')
      .select('position')
      .eq('column_id', taskData.column_id)
      .order('position', { ascending: false })
      .limit(1)

    if (countError) throw countError

    const nextPosition = existingTasks.length > 0 ? existingTasks[0].position + 1 : 1

    const { data, error } = await supabase
      .from('kanban_tasks')
      .insert([{ ...taskData, position: nextPosition }])
      .select(`
        *,
        column:kanban_columns(id, name, color),
        project:projects(id, title_fr, external_id)
      `)

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const updateKanbanTask = async (id, taskData) => {
  try {
    const { data, error } = await supabase
      .from('kanban_tasks')
      .update(taskData)
      .eq('id', id)
      .select(`
        *,
        column:kanban_columns(id, name, color),
        project:projects(id, title_fr, external_id)
      `)

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const deleteKanbanTask = async (id) => {
  try {
    const { error } = await supabase
      .from('kanban_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Fonction pour déplacer une tâche (drag & drop)
export const moveKanbanTask = async (taskId, newColumnId, newPosition) => {
  try {
    // Mettre à jour la tâche
    const { error } = await supabase
      .from('kanban_tasks')
      .update({
        column_id: newColumnId,
        position: newPosition
      })
      .eq('id', taskId)

    if (error) throw error

    // Réorganiser les positions dans la nouvelle colonne
    const { error: reorderError } = await supabase
      .rpc('reorder_kanban_tasks', {
        column_uuid: newColumnId
      })

    if (reorderError) throw reorderError

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Fonction pour calculer la progression d'un projet
export const getProjectProgress = async (projectId) => {
  try {
    const { data, error } = await supabase
      .rpc('calculate_project_progress', {
        project_uuid: projectId
      })

    if (error) throw error
    return { success: true, progress: data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Fonction pour obtenir les tâches d'un projet spécifique
export const getProjectTasks = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from('kanban_tasks')
      .select(`
        *,
        column:kanban_columns(id, name, color)
      `)
      .eq('project_id', projectId)
      .order('position', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Fonctions pour les commentaires
export const addTaskComment = async (taskId, author, content) => {
  try {
    const { data, error } = await supabase
      .from('kanban_task_comments')
      .insert([{
        task_id: taskId,
        author,
        content
      }])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const getTaskComments = async (taskId) => {
  try {
    const { data, error } = await supabase
      .from('kanban_task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Hook pour récupérer la progression d'un projet
export const useProjectProgress = (projectId) => {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) {
      setProgress(0)
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const result = await getProjectProgress(projectId)

        if (result.success) {
          setProgress(result.progress)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [projectId])

  return { progress, loading, error }
}

// Hook pour récupérer les progressions de tous les projets
export const useAllProjectsProgress = () => {
  const { projects } = useProjects()
  const [progressData, setProgressData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projects?.length) {
      setLoading(false)
      return
    }

    const fetchAllProgress = async () => {
      const progressPromises = projects.map(async (project) => {
        const result = await getProjectProgress(project.id)
        return {
          projectId: project.id,
          progress: result.success ? result.progress : 0
        }
      })

      try {
        const results = await Promise.all(progressPromises)
        const progressMap = {}
        results.forEach(({ projectId, progress }) => {
          progressMap[projectId] = progress
        })
        setProgressData(progressMap)
      } catch (error) {
        console.error('Erreur lors du calcul des progressions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProgress()
  }, [projects])

  return { progressData, loading }
}

export { useEffect, useState } from 'react';

