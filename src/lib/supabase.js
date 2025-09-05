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
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })

        if (error) throw error

        // Use display_order first, then fallback to status priority for items with same order
        const sortedData = data?.sort((a, b) => {
          // First, sort by display_order (ascending)
          if (a.display_order !== b.display_order) {
            return (a.display_order || 0) - (b.display_order || 0)
          }

          // If same display_order, use status priority
          const statusPriority = {
            'completed': 4,
            'to_deploy': 3,
            'in_progress': 2,
            'planned': 1
          }

          const priorityA = statusPriority[a.status] || 0
          const priorityB = statusPriority[b.status] || 0

          if (priorityA !== priorityB) {
            return priorityB - priorityA // Higher priority first
          }

          // If same status, sort by creation date (newest first)
          return new Date(b.created_at) - new Date(a.created_at)
        }) || []

        setCertifications(sortedData)
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
// SIMPLE TRANSLATION HELPER VIA API ROUTE
// =====================================
export const translateText = async ({ text, target, source = 'auto' }) => {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target, source })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Translation failed')
    return { success: true, text: data.translatedText }
  } catch (err) {
    return { success: false, error: err.message }
  }
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

// Reorder certifications after drag and drop
export const reorderCertifications = async (certifications) => {
  try {
    // Update display_order for each certification
    const updates = certifications.map((cert, index) => ({
      id: cert.id,
      display_order: index
    }));

    // Batch update all certifications
    const { data, error } = await supabase
      .from('certifications')
      .upsert(updates, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Compétences
export const createSkill = async (skillData) => {
  try {
    console.log('Creating skill with data:', skillData)

    const { data, error } = await supabase
      .from('skills')
      .insert([skillData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Skill created successfully:', data[0])
    return { success: true, data: data[0] }
  } catch (err) {
    console.error('Create skill error:', err)
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
            project:projects(id, title_fr)
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
        project:projects(id, title_fr)
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
        project:projects(id, title_fr)
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

// =====================================
// UPLOAD IMAGES TO SUPABASE STORAGE
// =====================================

// Helper to generate a unique file path
const generateFilePath = (folder, fileName) => {
  const ext = fileName.includes('.') ? fileName.split('.').pop() : 'png'
  const base = fileName.replace(/\.[^/.]+$/, '')
  const timestamp = Date.now()
  return `${folder}/${base}-${timestamp}.${ext}`
}

// Upload a file to a storage bucket and return the public URL
export const uploadImageAndGetPublicUrl = async ({ bucket = 'images', folder = 'projects', file }) => {
  try {
    if (!file) throw new Error('Aucun fichier fourni')
    const path = generateFilePath(folder, file.name || 'image.png')

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type || 'image/png'
    })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    const publicUrl = data?.publicUrl
    if (!publicUrl) throw new Error('Impossible de générer l\'URL publique')

    return { success: true, url: publicUrl, path }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Get a public URL for a storage object path or return the original URL if already absolute
export const getPublicImageUrl = (pathOrUrl, bucket = 'images') => {
  try {
    if (!pathOrUrl) return ''
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
    const { data } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl)
    return data?.publicUrl || ''
  } catch (_) {
    return ''
  }
}

export { useEffect, useState } from 'react';

