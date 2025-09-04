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
    User
} from "lucide-react";
import Link from "next/link";

function StatCard({ title, value, description, icon: Icon, href, color = "primary" }) {
  const { isGuest } = useAdminGuest();
  const colorClasses = {
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

function QuickAction({ title, description, href, icon: Icon, color = "primary" }) {
  const { isGuest } = useAdminGuest();
  const colorClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    green: "bg-green-600 text-white hover:bg-green-700",
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    purple: "bg-purple-600 text-white hover:bg-purple-700"
  };

  const Component = isGuest ? 'div' : Link;

  return (
    <Component href={href}>
      <Card className={`hover:shadow-md transition-shadow h-full ${isGuest ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
        <CardContent className="p-6 h-full flex items-start">
          <div className="flex items-start space-x-4 w-full">
            <div className={`p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Component>
  );
}

export default function AdminDashboard() {
  const { projects, loading: projectsLoading } = useProjects();
  const { certifications, loading: certsLoading } = useCertifications();
  const { skills, loading: skillsLoading } = useSkills();
  const { platforms, loading: platformsLoading } = useFreelancePlatforms();
  const { profile, loading: profileLoading } = useProfile();
  // Suppression des hooks liés aux tâches Kanban
  // const { stats: kanbanStats, loading: kanbanStatsLoading } = useKanbanStats();
  // const { tasks: kanbanTasks, loading: kanbanTasksLoading } = useKanbanTasks();

  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
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
            Bienvenue dans votre panel d'administration
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          <QuickAction
            title="Tableau Kanban"
            description="Gérer vos tâches et workflow de projet"
            href="/admin/kanban"
            icon={Kanban}
            color="primary"
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

      {/* Projets récents et tâches en cours */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projets récents
            </CardTitle>
            <CardDescription>
              Derniers projets ajoutés ou modifiés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : projects?.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <h4 className="font-medium">{project.title_fr}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : project.status === 'to_deploy' ? 'default' : 'secondary'}
                          className={`text-xs ${project.status === 'to_deploy' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}`}
                        >
                          {project.status === 'completed' ? 'Terminé' : 
                           project.status === 'to_deploy' ? 'À déployer' :
                           project.status === 'in_progress' ? 'En cours' : 'Planifié'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ⭐ {project.stars}
                    </div>
                  </div>
                ))}
                <Link href="/admin/projects">
                  <Button variant="outline" className="w-full mt-4">
                    Voir tous les projets
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun projet</p>
                <Link href="/admin/projects/new">
                  <Button className="mt-2" disabled={isGuest}>Créer le premier projet</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tâches Kanban en cours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Tâches en cours
            </CardTitle>
            <CardDescription>
              Vos tâches actuelles et prioritaires
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
                <Link href="/admin/kanban">
                  <Button variant="outline" className="w-full mt-4">
                    Voir toutes les tâches
                  </Button>
                </Link>
              </div>
            {/* ) : (
              <div className="text-center py-6">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune tâche</p>
                <Link href="/admin/kanban">
                  <Button className="mt-2">Créer la première tâche</Button>
                </Link>
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
