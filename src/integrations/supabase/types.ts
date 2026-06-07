export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          circle_id: string
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          location: string | null
          notes: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_circles: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          patient_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          patient_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          patient_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          author_id: string
          category: string | null
          circle_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string | null
          circle_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string | null
          circle_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          logged_by: string
          medication_id: string
          notes: string | null
          taken_at: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          logged_by: string
          medication_id: string
          notes?: string | null
          taken_at?: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          logged_by?: string
          medication_id?: string
          notes?: string | null
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          circle_id: string
          created_at: string
          created_by: string
          dosage: string | null
          frequency: string | null
          id: string
          instructions: string | null
          name: string
          refill_at: string | null
          updated_at: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          created_by: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          name: string
          refill_at?: string | null
          updated_at?: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          created_by?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          name?: string
          refill_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_moods: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          mood: number
          note: string | null
          pain_level: number | null
          patient_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          mood: number
          note?: string | null
          pain_level?: number | null
          patient_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          mood?: number
          note?: string | null
          pain_level?: number | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_moods_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_requests: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          message: string | null
          pain_level: number | null
          patient_id: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          type: Database["public"]["Enums"]["request_type"]
          updated_at: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          message?: string | null
          pain_level?: number | null
          patient_id: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          type?: Database["public"]["Enums"]["request_type"]
          updated_at?: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          message?: string | null
          pain_level?: number | null
          patient_id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          type?: Database["public"]["Enums"]["request_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_requests_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          circle_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_at: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          circle_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          circle_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "care_circles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      circle_role: {
        Args: { _circle_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_circle_role: {
        Args: {
          _circle_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      is_circle_member: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "coordinator" | "helper"
      request_type:
        | "help"
        | "pain"
        | "water"
        | "food"
        | "bathroom"
        | "company"
        | "other"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "in_progress" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordinator", "helper"],
      request_type: [
        "help",
        "pain",
        "water",
        "food",
        "bathroom",
        "company",
        "other",
      ],
      task_priority: ["low", "medium", "high"],
      task_status: ["todo", "in_progress", "done"],
    },
  },
} as const
