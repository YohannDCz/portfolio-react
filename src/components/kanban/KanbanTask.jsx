'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Draggable } from '@hello-pangea/dnd';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Edit3
} from "lucide-react";

const priorityColors = {
  low: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200"
};

const priorityIcons = {
  urgent: AlertTriangle,
  high: ChevronRight,
  medium: null,
  low: null
};

export default function KanbanTask({ task, index, onEdit }) {
  const PriorityIcon = priorityIcons[task.priority];
  
  // Formatage des dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            snapshot.isDragging ? 'shadow-xl rotate-2' : ''
          } ${isOverdue ? 'border-red-300' : ''}`}
          onClick={onEdit}
        >
          <CardContent className="p-4 space-y-3">
            {/* Header avec projet et priorité */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {task.project && (
                  <div className="text-xs text-gray-500 mb-1">
                    {task.project.external_id || task.project.title_fr}
                  </div>
                )}
                <h4 className="font-medium text-sm leading-5 line-clamp-2">
                  {task.title}
                </h4>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {PriorityIcon && (
                  <PriorityIcon className="w-3 h-3 text-gray-400" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {/* Date d'échéance */}
                {task.due_date && (
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                    <Calendar className="w-3 h-3" />
                    {formatDate(task.due_date)}
                  </div>
                )}
                
                {/* Temps estimé */}
                {task.estimated_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.estimated_hours}h
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Priorité */}
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 ${priorityColors[task.priority]}`}
                >
                  {task.priority === 'urgent' ? 'Urgent' : 
                   task.priority === 'high' ? 'Haute' : 
                   task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </Badge>

                {/* Assigné */}
                {task.assignee && (
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-xs">
                      {task.assignee.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
