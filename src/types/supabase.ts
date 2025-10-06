// =====================================
// SUPABASE DATABASE TYPE DEFINITIONS
// Generated from Supabase schema
// =====================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name_fr: string | null;
          full_name_en: string | null;
          title_fr: string | null;
          title_en: string | null;
          bio_fr: string | null;
          bio_en: string | null;
          location_fr: string | null;
          location_en: string | null;
          email: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          twitter_url: string | null;
          profile_image: string | null;
          phone: string | null;
          is_available: boolean | null;
          availability_text_fr: string | null;
          availability_text_en: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          full_name_fr?: string | null;
          full_name_en?: string | null;
          title_fr?: string | null;
          title_en?: string | null;
          bio_fr?: string | null;
          bio_en?: string | null;
          location_fr?: string | null;
          location_en?: string | null;
          email?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          profile_image?: string | null;
          phone?: string | null;
          is_available?: boolean | null;
          availability_text_fr?: string | null;
          availability_text_en?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name_fr?: string | null;
          full_name_en?: string | null;
          title_fr?: string | null;
          title_en?: string | null;
          bio_fr?: string | null;
          bio_en?: string | null;
          location_fr?: string | null;
          location_en?: string | null;
          email?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          profile_image?: string | null;
          phone?: string | null;
          is_available?: boolean | null;
          availability_text_fr?: string | null;
          availability_text_en?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          title_fr: string;
          title_en: string | null;
          description_fr: string;
          description_en: string | null;
          technologies: string[];
          demo_url: string | null;
          repo_url: string | null;
          image: string | null;
          status: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
          is_featured: boolean | null;
          is_mega_project: boolean | null;
          category: string[] | null;
          stars: number | null;
          figma_url: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title_fr: string;
          title_en?: string | null;
          description_fr: string;
          description_en?: string | null;
          technologies: string[];
          demo_url?: string | null;
          repo_url?: string | null;
          image?: string | null;
          status?: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
          is_featured?: boolean | null;
          is_mega_project?: boolean | null;
          category?: string[] | null;
          stars?: number | null;
          figma_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title_fr?: string;
          title_en?: string | null;
          description_fr?: string;
          description_en?: string | null;
          technologies?: string[];
          demo_url?: string | null;
          repo_url?: string | null;
          image?: string | null;
          status?: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
          is_featured?: boolean | null;
          is_mega_project?: boolean | null;
          category?: string[] | null;
          stars?: number | null;
          figma_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          level: number;
          category: string;
          is_featured: boolean | null;
          icon: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          level: number;
          category: string;
          is_featured?: boolean | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          level?: number;
          category?: string;
          is_featured?: boolean | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      certifications: {
        Row: {
          id: string;
          title_fr: string;
          title_en: string | null;
          organization_fr: string;
          organization_en: string | null;
          description_fr: string | null;
          description_en: string | null;
          image: string | null;
          certificate_url: string | null;
          status: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
          display_order: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title_fr: string;
          title_en?: string | null;
          organization_fr: string;
          organization_en?: string | null;
          description_fr?: string | null;
          description_en?: string | null;
          image?: string | null;
          certificate_url?: string | null;
          status?: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
          display_order?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title_fr?: string;
          title_en?: string | null;
          organization_fr?: string;
          organization_en?: string | null;
          description_fr?: string | null;
          description_en?: string | null;
          image?: string | null;
          certificate_url?: string | null;
          status?: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
          display_order?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      freelance_platforms: {
        Row: {
          id: string;
          name: string;
          url: string | null;
          username: string | null;
          rating: number | null;
          max_rating: number | null;
          reviews_count: number | null;
          profile_url: string | null;
          is_active: boolean | null;
          icon: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          url?: string | null;
          username?: string | null;
          rating?: number | null;
          max_rating?: number | null;
          reviews_count?: number | null;
          profile_url?: string | null;
          is_active?: boolean | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string | null;
          username?: string | null;
          rating?: number | null;
          max_rating?: number | null;
          reviews_count?: number | null;
          profile_url?: string | null;
          is_active?: boolean | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      production_goals: {
        Row: {
          id: string;
          category: string;
          target_count: number;
          description_fr: string | null;
          description_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          target_count: number;
          description_fr?: string | null;
          description_en?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          target_count?: number;
          description_fr?: string | null;
          description_en?: string | null;
          created_at?: string;
        };
      };
      project_counts: {
        Row: {
          category: string;
          completed_count: number;
        };
        Insert: {
          category: string;
          completed_count?: number;
        };
        Update: {
          category?: string;
          completed_count?: number;
        };
      };
      kanban_columns: {
        Row: {
          id: string;
          name: string;
          color: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          position?: number;
          created_at?: string;
        };
      };
      kanban_tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          column_id: string;
          project_id: string | null;
          position: number;
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          column_id: string;
          project_id?: string | null;
          position: number;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          column_id?: string;
          project_id?: string | null;
          position?: number;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      kanban_task_comments: {
        Row: {
          id: string;
          task_id: string;
          author: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          author: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          author?: string;
          content?: string;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          subject: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          subject?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          message?: string;
          subject?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      kanban_stats: {
        Row: {
          column_name: string | null;
          task_count: number | null;
        };
      };
    };
    Functions: {
      calculate_project_progress: {
        Args: {
          project_uuid: string;
        };
        Returns: number;
      };
      reorder_kanban_tasks: {
        Args: {
          column_uuid: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      project_status: 'completed' | 'in_progress' | 'planned' | 'to_deploy';
      task_priority: 'low' | 'medium' | 'high';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;
