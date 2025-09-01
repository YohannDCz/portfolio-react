'use client';

import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createKanbanTask,
  deleteKanbanTask,
  updateKanbanTask,
  useKanbanColumns,
  useProjects
} from "@/lib/supabase";
import {
  Loader2,
  Plus,
  Trash2,
  X
} from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse', color: 'bg-gray-100' },
  { value: 'medium', label: 'Moyenne', color: 'bg-blue-100' },
  { value: 'high', label: 'Haute', color: 'bg-orange-100' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100' }
];

const COMMON_TAGS = [
  'Frontend', 'Backend', 'UI/UX', 'Bug', 'Feature', 'Test',
  'Documentation', 'Refactor', 'Performance', 'Security'
];

export default function TaskModal({ isOpen, onClose, task = null, defaultColumnId = null }) {
  const { columns } = useKanbanColumns();
  const { projects } = useProjects();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    column_id: defaultColumnId || '',
    assignee: '',
    priority: 'medium',
    tags: [],
    due_date: '',
    estimated_hours: ''
  });

  // Initialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project_id: task.project_id || '',
        column_id: task.column_id || '',
        assignee: task.assignee || '',
        priority: task.priority || 'medium',
        tags: task.tags || [],
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        estimated_hours: task.estimated_hours || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        project_id: '',
        column_id: defaultColumnId || (columns[0]?.id || ''),
        assignee: '',
        priority: 'medium',
        tags: [],
        due_date: '',
        estimated_hours: ''
      });
    }
    setError("");
  }, [task, isOpen, defaultColumnId, columns]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Le titre est obligatoire");
      setLoading(false);
      return;
    }

    if (!formData.column_id) {
      setError("Veuillez sélectionner une colonne");
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        ...formData,
        project_id: formData.project_id || null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null
      };

      let result;
      if (task) {
        result = await updateKanbanTask(task.id, taskData);
      } else {
        result = await createKanbanTask(taskData);
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return;
    }

    setLoading(true);
    const result = await deleteKanbanTask(task.id);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <p className="text-sm text-gray-600">
                {task ? 'Modifiez les détails de votre tâche' : 'Créez une nouvelle tâche pour votre projet'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6">

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Titre de la tâche"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée de la tâche"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Projet</Label>
                <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun projet</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.external_id ? `${project.external_id} - ${project.title_fr}` : project.title_fr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="column">Colonne *</Label>
                <Select value={formData.column_id} onValueChange={(value) => handleInputChange('column_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une colonne" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: column.color }}
                          />
                          {column.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Assignation et priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assigné à</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                placeholder="Nom ou email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Planning */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Date d'échéance</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Temps estimé (heures)</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Select value="" onValueChange={addTag}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Ajouter un tag prédéfini" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TAGS.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tag personnalisé"
                  className="w-40"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(newTag)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Tags sélectionnés */}
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {task && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {task ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  task ? 'Modifier' : 'Créer'
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
