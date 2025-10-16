'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminGuest } from '@/contexts/AdminGuestContext';
import type { Certification, Language } from '@/types';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Edit, ExternalLink, GripVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { debugError } from '@/lib/utils';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface StatusInfo {
  badge: string;
  icon: string;
  label: string;
}

interface CertificationUrls {
  certificate?: string;
  course?: string;
  verification?: string;
  documentation?: string;
  tutorials?: string;
  figma?: string;
}

interface CertificationWithUrls extends Certification {
  title: string;
  provider: string;
  year?: number;
  certificate_urls?: CertificationUrls;
}

interface CertificationDragDropProps {
  certifications: CertificationWithUrls[];
  onReorder: (items: CertificationWithUrls[]) => Promise<void>;
  onDelete?: (id: string, title: string) => void;
  deleteLoading?: string | null;
  getLocalizedText?: (
    item: CertificationWithUrls,
    field: string,
    lang: Language,
  ) => string | undefined;
  currentLang?: Language;
}

// =====================================
// CERTIFICATION DRAG DROP COMPONENT
// =====================================

/**
 * Drag and drop certification management component
 * @param props - Certification drag drop properties
 * @returns JSX Element for certification management with drag and drop
 */
export default function CertificationDragDrop({
  certifications,
  onReorder,
  onDelete,
  deleteLoading,
  getLocalizedText,
  currentLang = 'fr',
}: CertificationDragDropProps): JSX.Element {
  const { isGuest } = useAdminGuest();
  const [isDragDisabled, setIsDragDisabled] = useState<boolean>(false);

  /**
   * Handle drag end event and reorder certifications
   * @param result - Drag result from react-beautiful-dnd
   */
  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination || isGuest) return;

    const { source, destination } = result;

    if (source.index === destination.index) return;

    setIsDragDisabled(true);

    try {
      // Create reordered array
      const items = Array.from(certifications);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      // Call parent's reorder function
      await onReorder(items);
    } catch (error) {
      debugError('Failed to reorder certifications:', error);
    } finally {
      setIsDragDisabled(false);
    }
  };

  /**
   * Get status configuration for badges and icons
   * @param status - Certification status
   * @returns Status information object
   */
  const getStatusInfo = (status: string): StatusInfo => {
    const statusConfig: Record<string, StatusInfo> = {
      completed: {
        badge: 'bg-green-600 text-white',
        icon: '✓',
        label: 'Obtenue',
      },
      to_deploy: {
        badge: 'bg-emerald-500 text-white',
        icon: '🚀',
        label: 'À déployer',
      },
      in_progress: {
        badge: 'bg-blue-600 text-white',
        icon: '⏳',
        label: 'En cours',
      },
      planned: {
        badge: 'bg-gray-200 text-gray-800',
        icon: '📋',
        label: 'Planifiée',
      },
    };

    return statusConfig[status] || statusConfig['planned'];
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="certifications-list">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2' : ''
            }`}
          >
            {certifications.map((cert, index) => (
              <Draggable
                key={cert.id}
                draggableId={cert.id}
                index={index}
                isDragDisabled={isDragDisabled || isGuest}
              >
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-all duration-200 ${
                      snapshot.isDragging
                        ? 'shadow-lg scale-105 rotate-2 bg-white dark:bg-gray-800 border-primary'
                        : 'hover:shadow-md'
                    } ${isDragDisabled ? 'opacity-50' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className={`p-2 rounded-md transition-colors ${
                              isGuest
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-grab active:cursor-grabbing'
                            }`}
                            title={
                              isGuest
                                ? 'Réorganisation non disponible en mode invité'
                                : 'Glisser pour réorganiser'
                            }
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          <div className="flex-1">
                            <CardTitle className="text-lg">{cert.title}</CardTitle>
                            <CardDescription>{cert.provider}</CardDescription>
                          </div>
                        </div>

                        <Badge className={getStatusInfo(cert.status).badge}>
                          {getStatusInfo(cert.status).icon}
                          <span className="ml-1.5">{getStatusInfo(cert.status).label}</span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col h-full">
                      <div className="space-y-3 flex-1">
                        {/* Année */}
                        {cert.year && (
                          <div className="text-sm text-muted-foreground">Année: {cert.year}</div>
                        )}

                        {/* Description */}
                        {cert.description_fr && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getLocalizedText
                              ? getLocalizedText(cert, 'description', currentLang)
                              : cert.description_fr}
                          </p>
                        )}

                        {/* Liens */}
                        {cert.certificate_urls && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(cert.certificate_urls).map(([type, url]) => {
                              const linkLabels: Record<string, string> = {
                                certificate: 'Certificat',
                                course: 'Cours',
                                verification: 'Vérification',
                                documentation: 'Documentation',
                                tutorials: 'Tutoriels',
                                figma: 'Figma',
                              };
                              return (
                                <a key={type} href={url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    {linkLabels[type] || type}
                                  </Button>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Actions - stuck to bottom */}
                      <div className="flex gap-2 pt-3 mt-auto border-t">
                        <Link
                          href={`/admin/certifications/edit/${cert.id}`}
                          className="flex-1"
                          passHref
                        >
                          <Button variant="outline" size="sm" className="w-full" disabled={isGuest}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isGuest || deleteLoading === cert.id}
                          onClick={() => onDelete && onDelete(cert.id, cert.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
