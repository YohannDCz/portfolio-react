'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminGuest } from "@/contexts/AdminGuestContext";
import {
  useCertifications,
  useFreelancePlatforms,
  useProfile,
  useProjects,
  useSkills
} from "@/lib/supabase";
import {
  Award,
  Calendar,
  CheckSquare,
  FolderOpen,
  Kanban,
  Plus,
  Settings,
  User,
  LucideIcon
} from "lucide-react";
import Link from "next/link";

// TypeScript interfaces
type ColorType = "primary" | "green" | "blue" | "purple" | "orange";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  href?: string;
  color?: ColorType;
}

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color?: ColorType;
  external?: boolean;
}

function StatCard({ title, value, description, icon: Icon, href, color = "primary" }: StatCardProps): JSX.Element {
  const { isGuest } = useAdminGuest();
  const colorClasses: Record<ColorType, string> = {
    primary: "text-primary",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {href && (
          <Link href={href} className="mt-2 inline-block">
            <Button variant="outline" size="sm" disabled={isGuest}>
              Gérer
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAction({ title, description, href, icon: Icon, color = "primary", external = false }: QuickActionProps): JSX.Element {
  const { isGuest } = useAdminGuest();
  const colorClasses: Record<ColorType, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    green: "bg-green-600 text-white hover:bg-green-700",
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    purple: "bg-purple-600 text-white hover:bg-purple-700",
    orange: "bg-orange-600 text-white hover:bg-orange-700"
  };

  if (isGuest) {
    return (
      <Card className="hover:shadow-md transition-shadow h-full cursor-not-allowed opacity-60">
        <CardContent className="p-6 h-full flex items-start">
          <div className="flex items-start space-x-4 w-full h-full">
            <div className={`p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-center h-full min-h-[60px]">
              <h3 className="font-semibold leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
          <CardContent className="p-6 h-full flex items-start">
            <div className="flex items-start space-x-4 w-full h-full">
              <div className={`p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1 flex-1 flex flex-col justify-center h-full min-h-[60px]">
                <h3 className="font-semibold leading-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </a>
    );
  }

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
        <CardContent className="p-6 h-full flex items-start">
          <div className="flex items-start space-x-4 w-full h-full">
            <div className={`p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-center h-full min-h-[60px]">
              <h3 className="font-semibold leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboard(): JSX.Element {
  const { isGuest } = useAdminGuest();
  const { projects, loading: projectsLoading } = useProjects();
  const { certifications, loading: certsLoading } = useCertifications();
  const { skills, loading: skillsLoading } = useSkills();
  const { platforms, loading: platformsLoading } = useFreelancePlatforms();
  const { profile, loading: profileLoading } = useProfile();
  // Suppression des hooks liés aux tâches Kanban
  // const { stats: kanbanStats, loading: kanbanStatsLoading } = useKanbanStats();
  // const { tasks: kanbanTasks, loading: kanbanTasksLoading } = useKanbanTasks();

  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const toDeployProjects = projects?.filter(p => p.status === 'to_deploy') || [];
  const inProgressProjects = projects?.filter(p => p.status === 'in_progress') || [];
  const completedCerts = certifications?.filter(c => c.status === 'completed') || [];
  
  // Suppression des statistiques Kanban
  // const totalTasks = kanbanTasks?.length || 0;
  // const completedTasks = kanbanTasks?.filter(t => t.column?.name === 'Terminé').length || 0;
  // const urgentTasks = kanbanTasks?.filter(t => t.priority === 'urgent' && t.column?.name !== 'Terminé').length || 0;
  // const overdueTasks = kanbanTasks?.filter(t => {
  //   if (!t.due_date || t.column?.name === 'Terminé') return false;
  //   return new Date(t.due_date) < new Date();
  // }).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenue dans votre panel d’administration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString('fr-FR')}
          </Badge>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard
          title="Projets Total"
          value={projectsLoading ? "..." : projects?.length || 0}
          description={`${completedProjects.length} terminés`}
          icon={FolderOpen}
          href="/admin/projects"
          color="primary"
        />
        <StatCard
          title="Certifications"
          value={certsLoading ? "..." : certifications?.length || 0}
          description={`${completedCerts.length} obtenues`}
          icon={Award}
          href="/admin/certifications"
          color="purple"
        />
        <StatCard
          title="Compétences"
          value={skillsLoading ? "..." : skills?.length || 0}
          description="Technologies maîtrisées"
          icon={Settings}
          href="/admin/skills"
          color="primary"
        />
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch auto-rows-fr">
          <QuickAction
            title="Tableau Kanban"
            description="Gérer vos tâches et workflow de projet (projet externe)"
            href="https://github.com/YohannDCz/kanban-react"
            icon={Kanban}
            color="primary"
            external={true}
          />
          <QuickAction
            title="Nouveau Projet"
            description="Ajouter un nouveau projet à votre portfolio"
            href="/admin/projects/new"
            icon={Plus}
            color="green"
          />
          <QuickAction
            title="Nouvelle Certification"
            description="Ajouter une certification ou formation"
            href="/admin/certifications/new"
            icon={Award}
            color="blue"
          />
          <QuickAction
            title="Modifier le Profil"
            description="Mettre à jour vos informations personnelles"
            href="/admin/profile"
            icon={User}
            color="purple"
          />
        </div>
      </div>

      {/* Projets récents et compétences */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Projets à déployer
            </CardTitle>
            <CardDescription>
              Projets prêts pour le déploiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : toDeployProjects?.length > 0 ? (
              <div className="space-y-3">
                {toDeployProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <h4 className="font-medium">{project.title_fr}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs bg-emerald-500 text-white hover:bg-emerald-600">
                          🚀 À déployer
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ⭐ {project.stars}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <Link href="/admin/projects" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Voir tous
                    </Button>
                  </Link>
                  {toDeployProjects[0]?.live_url && (
                    <a href={toDeployProjects[0].live_url} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Déployer
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <div className="text-2xl">🚀</div>
                </div>
                <p className="text-muted-foreground">Aucun projet à déployer</p>
                <Link href="/admin/projects/new">
                  <Button className="mt-2" disabled={isGuest}>Créer un projet</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compétences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Compétences
            </CardTitle>
            <CardDescription>
              Vos compétences durement acquises
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* kanbanTasksLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : kanbanTasks?.length > 0 ? ( */}
              <div className="space-y-3">
                {/* {kanbanTasks
                  .filter(task => task.column?.name !== 'Terminé')
                  .sort((a, b) => {
                    // Tri par priorité puis par date d'échéance
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    }
                    if (a.due_date && b.due_date) {
                      return new Date(a.due_date) - new Date(b.due_date);
                    }
                    return 0;
                  })
                  .slice(0, 5)
                  .map((task) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: task.column?.color || '#6B7280' }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {task.column?.name}
                            </span>
                            {task.project && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {task.project.title_fr}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              task.priority === 'urgent' ? 'destructive' : 
                              task.priority === 'high' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {task.priority === 'urgent' ? 'Urgent' : 
                             task.priority === 'high' ? 'Haute' : 
                             task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </Badge>
                          {isOverdue && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    );
                  })} */}
                <a href="https://github.com/YohannDCz/kanban-react" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full mt-4">
                    Voir le projet Kanban (externe)
                  </Button>
                </a>
              </div>
            {/* ) : (
              <div className="text-center py-6">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune tâche</p>
                <a href="https://github.com/YohannDCz/kanban-react" target="_blank" rel="noopener noreferrer">
                  <Button className="mt-2">Voir le projet Kanban</Button>
                </a>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Certifications en cours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
            <CardDescription>
              État de vos certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certsLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : certifications?.length > 0 ? (
              <div className="space-y-3">
                {certifications.slice(0, 5).map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <h4 className="font-medium">{cert.title}</h4>
                      <p className="text-sm text-muted-foreground">{cert.provider}</p>
                    </div>
                    <Badge 
                      variant={cert.status === 'completed' ? 'default' : cert.status === 'to_deploy' ? 'default' : cert.status === 'in_progress' ? 'secondary' : 'outline'}
                      className={`text-xs ${cert.status === 'to_deploy' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}`}
                    >
                      {cert.status === 'completed' ? 'Obtenue' : 
                       cert.status === 'to_deploy' ? 'À déployer' :
                       cert.status === 'in_progress' ? 'En cours' : 'Planifiée'}
                    </Badge>
                  </div>
                ))}
                <Link href="/admin/certifications">
                  <Button variant="outline" className="w-full mt-4">
                    Voir toutes les certifications
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune certification</p>
                <Link href="/admin/certifications/new">
                  <Button className="mt-2" disabled={isGuest}>Ajouter une certification</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
