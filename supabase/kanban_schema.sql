-- =====================================
-- SCHEMA KANBAN POUR GESTION DE TÂCHES
-- =====================================

-- Table pour les colonnes Kanban (statuts)
CREATE TABLE kanban_columns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280', -- Code couleur hexadécimal
    position INTEGER NOT NULL,
    is_system BOOLEAN DEFAULT false, -- Pour les colonnes par défaut
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les tâches Kanban
CREATE TABLE kanban_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    column_id UUID REFERENCES kanban_columns(id) ON DELETE CASCADE,
    assignee VARCHAR(100), -- Email ou nom de l'assigné
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    tags VARCHAR(50)[], -- Tags pour catégoriser
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    position INTEGER NOT NULL, -- Position dans la colonne
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les commentaires sur les tâches
CREATE TABLE kanban_task_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES kanban_tasks(id) ON DELETE CASCADE,
    author VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les pièces jointes
CREATE TABLE kanban_task_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES kanban_tasks(id) ON DELETE CASCADE,
    filename VARCHAR(200) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    uploaded_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la performance
CREATE INDEX idx_kanban_tasks_project ON kanban_tasks (project_id);
CREATE INDEX idx_kanban_tasks_column ON kanban_tasks (column_id);
CREATE INDEX idx_kanban_tasks_position ON kanban_tasks (column_id, position);
CREATE INDEX idx_kanban_tasks_priority ON kanban_tasks (priority);
CREATE INDEX idx_kanban_tasks_due_date ON kanban_tasks (due_date);

-- Trigger pour updated_at
CREATE TRIGGER update_kanban_tasks_updated_at BEFORE UPDATE ON kanban_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer les colonnes par défaut
INSERT INTO kanban_columns (name, color, position, is_system) VALUES
('À faire', '#EF4444', 1, true),
('En cours', '#F59E0B', 2, true),
('En révision', '#8B5CF6', 3, true),
('Terminé', '#10B981', 4, true);

-- Vue pour obtenir les statistiques Kanban
CREATE VIEW kanban_stats AS
SELECT 
    c.id as column_id,
    c.name as column_name,
    c.color as column_color,
    COUNT(t.id) as task_count,
    COUNT(t.id) FILTER (WHERE t.priority = 'urgent') as urgent_count,
    COUNT(t.id) FILTER (WHERE t.priority = 'high') as high_count,
    COUNT(t.id) FILTER (WHERE t.due_date < NOW() AND c.name != 'Terminé') as overdue_count
FROM kanban_columns c
LEFT JOIN kanban_tasks t ON c.id = t.column_id
GROUP BY c.id, c.name, c.color, c.position
ORDER BY c.position;

-- Fonction pour calculer la progression d'un projet basée sur ses tâches Kanban
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress INTEGER;
BEGIN
    -- Compter le nombre total de tâches pour le projet
    SELECT COUNT(*) INTO total_tasks
    FROM kanban_tasks 
    WHERE project_id = project_uuid;
    
    -- Si aucune tâche, retourner 0
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    -- Compter les tâches terminées
    SELECT COUNT(*) INTO completed_tasks
    FROM kanban_tasks kt
    JOIN kanban_columns kc ON kt.column_id = kc.id
    WHERE kt.project_id = project_uuid AND kc.name = 'Terminé';
    
    -- Calculer le pourcentage
    progress = (completed_tasks * 100) / total_tasks;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement le statut d'un projet
CREATE OR REPLACE FUNCTION update_project_status_from_kanban()
RETURNS TRIGGER AS $$
DECLARE
    project_progress INTEGER;
    current_project_id UUID;
BEGIN
    -- Déterminer l'ID du projet affecté
    IF TG_OP = 'DELETE' THEN
        current_project_id = OLD.project_id;
    ELSE
        current_project_id = NEW.project_id;
    END IF;
    
    -- Si pas de projet associé, ne rien faire
    IF current_project_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calculer la progression
    project_progress = calculate_project_progress(current_project_id);
    
    -- Mettre à jour le statut du projet selon la progression
    IF project_progress = 0 THEN
        UPDATE projects SET status = 'planned' WHERE id = current_project_id;
    ELSIF project_progress = 100 THEN
        UPDATE projects SET status = 'completed' WHERE id = current_project_id;
    ELSE
        UPDATE projects SET status = 'in_progress' WHERE id = current_project_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour réorganiser les positions des tâches dans une colonne
CREATE OR REPLACE FUNCTION reorder_kanban_tasks(column_uuid UUID)
RETURNS VOID AS $$
DECLARE
    task_record RECORD;
    new_position INTEGER := 1;
BEGIN
    -- Réorganiser les positions en ordre séquentiel
    FOR task_record IN 
        SELECT id FROM kanban_tasks 
        WHERE column_id = column_uuid 
        ORDER BY position ASC
    LOOP
        UPDATE kanban_tasks 
        SET position = new_position 
        WHERE id = task_record.id;
        
        new_position := new_position + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement le statut des projets
CREATE TRIGGER kanban_task_project_status_trigger
    AFTER INSERT OR UPDATE OR DELETE ON kanban_tasks
    FOR EACH ROW EXECUTE FUNCTION update_project_status_from_kanban();
