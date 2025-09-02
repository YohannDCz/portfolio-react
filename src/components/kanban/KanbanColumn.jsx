'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from "lucide-react";
import KanbanTask from './KanbanTask';

export default function KanbanColumn({ column, tasks, onAddTask, onEditTask }) {
  return (
    <div className="min-w-80 max-w-80">
      <Card variant="default" className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              {column.name}
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                {tasks.length}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddTask}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-3 min-h-2 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-accent/50 rounded-lg p-2' : ''
                }`}
              >
                {tasks
                  .sort((a, b) => a.position - b.position)
                  .map((task, index) => (
                    <KanbanTask
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={() => onEditTask(task)}
                    />
                  ))}
                {provided.placeholder}
                
                {/* Zone de drop vide */}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                    Glissez une tâche ici ou{' '}
                    <button
                      onClick={onAddTask}
                      className="text-primary hover:text-primary/80 underline"
                    >
                      créez-en une nouvelle
                    </button>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </div>
  );
}
