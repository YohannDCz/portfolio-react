'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { moveKanbanTask, useKanbanColumns, useKanbanTasks, useProjects } from "@/lib/supabase";
import { DragDropContext } from '@hello-pangea/dnd';
import { Filter, Loader2, Plus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';

export default function KanbanBoard() {
  const { columns, loading: columnsLoading } = useKanbanColumns();
  const { tasks, loading: tasksLoading, refetch } = useKanbanTasks();
  const { projects } = useProjects();
  const searchParams = useSearchParams();
  
  const [dragLoading, setDragLoading] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [projectFilter, setProjectFilter] = useState("");

  // Initialiser le filtre de projet depuis l'URL
  useEffect(() => {
    const projectParam = searchParams.get('project');
    if (projectParam) {
      setProjectFilter(projectParam);
    }
  }, [searchParams]);

  // Filtrer les tâches par projet si nécessaire
  const filteredTasks = projectFilter 
    ? tasks.filter(task => task.project_id === projectFilter)
    : tasks;

  // Organiser les tâches par colonne
  const tasksByColumn = {};
  columns.forEach(column => {
    tasksByColumn[column.id] = filteredTasks.filter(task => task.column_id === column.id);
  });

  // Trouver le projet sélectionné pour l'affichage
  const selectedProject = projectFilter 
    ? projects?.find(p => p.id === projectFilter)
    : null;

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Si pas de destination, rien à faire
    if (!destination) return;

    // Si la position n'a pas changé
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setDragLoading(true);

    try {
      // Calculer la nouvelle position
      const destinationTasks = tasksByColumn[destination.droppableId];
      let newPosition;

      if (destination.index === 0) {
        newPosition = 1;
      } else if (destination.index === destinationTasks.length) {
        newPosition = destinationTasks[destinationTasks.length - 1].position + 1;
      } else {
        const beforeTask = destinationTasks[destination.index - 1];
        const afterTask = destinationTasks[destination.index];
        newPosition = (beforeTask.position + afterTask.position) / 2;
      }

      const result = await moveKanbanTask(
        draggableId,
        destination.droppableId,
        newPosition
      );

      if (result.success) {
        refetch();
      } else {
        console.error('Erreur lors du déplacement:', result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setDragLoading(false);
    }
  };

  const openTaskModal = (task = null, columnId = null, defaultProjectId = null) => {
    setSelectedTask(task);
    setSelectedColumnId(columnId);
    // Si un projet est filtré et qu'on crée une nouvelle tâche, le définir par défaut
    if (!task && projectFilter) {
      setSelectedTask({ project_id: projectFilter });
    }
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setSelectedColumnId(null);
    setIsTaskModalOpen(false);
    refetch();
  };

  if (columnsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Tableau Kanban
            {selectedProject && (
              <span className="text-lg text-gray-600 ml-2">
                - {selectedProject.external_id || selectedProject.title_fr}
              </span>
            )}
          </h2>
          <p className="text-gray-600">Gérez vos tâches et projets</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtre par projet */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Tous les projets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les projets</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.external_id ? `${project.external_id} - ${project.title_fr}` : project.title_fr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectFilter && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setProjectFilter("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <Button onClick={() => openTaskModal(null, null, projectFilter)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = tasksByColumn[column.id] || [];
          const urgentTasks = columnTasks.filter(t => t.priority === 'urgent').length;
          
          return (
            <Card key={column.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{columnTasks.length}</div>
                    <p className="text-xs text-muted-foreground">{column.name}</p>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                </div>
                {urgentTasks > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-red-600 font-medium">
                      {urgentTasks} urgent{urgentTasks > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overlay de chargement pendant le drag */}
      {dragLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Déplacement en cours...</span>
          </div>
        </div>
      )}

      {/* Board Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onAddTask={() => openTaskModal(null, column.id)}
              onEditTask={openTaskModal}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Modal de tâche */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        task={selectedTask}
        defaultColumnId={selectedColumnId}
      />
    </div>
  );
}
