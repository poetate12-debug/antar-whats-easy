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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      driver_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          created_at: string
          delivered_at: string | null
          driver_id: string
          id: string
          order_id: string
          picked_up_at: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          created_at?: string
          delivered_at?: string | null
          driver_id: string
          id?: string
          order_id: string
          picked_up_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          created_at?: string
          delivered_at?: string | null
          driver_id?: string
          id?: string
          order_id?: string
          picked_up_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_earnings: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          driver_id: string
          id: string
          order_id: string | null
          type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          driver_id: string
          id?: string
          order_id?: string | null
          type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          driver_id?: string
          id?: string
          order_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_ratings: {
        Row: {
          comment: string | null
          created_at: string
          customer_name: string
          driver_id: string
          id: string
          order_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_name: string
          driver_id: string
          id?: string
          order_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_name?: string
          driver_id?: string
          id?: string
          order_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_setoran: {
        Row: {
          amount: number
          commission_rate: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          driver_id: string
          id: string
          notes: string | null
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          total_earnings: number
          total_orders: number
          updated_at: string
        }
        Insert: {
          amount: number
          commission_rate?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          driver_id: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: string
          total_earnings?: number
          total_orders?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          commission_rate?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          total_earnings?: number
          total_orders?: number
          updated_at?: string
        }
        Relationships: []
      }
      driver_stats: {
        Row: {
          acceptance_rate: number
          average_rating: number
          cancelled_orders: number
          completed_orders: number
          created_at: string
          driver_id: string
          id: string
          rank_position: number | null
          total_earnings: number
          total_orders: number
          total_ratings: number
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number
          average_rating?: number
          cancelled_orders?: number
          completed_orders?: number
          created_at?: string
          driver_id: string
          id?: string
          rank_position?: number | null
          total_earnings?: number
          total_orders?: number
          total_ratings?: number
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number
          average_rating?: number
          cancelled_orders?: number
          completed_orders?: number
          created_at?: string
          driver_id?: string
          id?: string
          rank_position?: number | null
          total_earnings?: number
          total_orders?: number
          total_ratings?: number
          updated_at?: string
        }
        Relationships: []
      }
      driver_status: {
        Row: {
          created_at: string
          current_location: string | null
          driver_id: string
          id: string
          is_online: boolean
          last_online_at: string | null
          updated_at: string
          wilayah_id: string | null
        }
        Insert: {
          created_at?: string
          current_location?: string | null
          driver_id: string
          id?: string
          is_online?: boolean
          last_online_at?: string | null
          updated_at?: string
          wilayah_id?: string | null
        }
        Update: {
          created_at?: string
          current_location?: string | null
          driver_id?: string
          id?: string
          is_online?: boolean
          last_online_at?: string | null
          updated_at?: string
          wilayah_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_status_wilayah_id_fkey"
            columns: ["wilayah_id"]
            isOneToOne: false
            referencedRelation: "wilayahs"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          deskripsi: string | null
          foto_url: string | null
          harga: number
          id: string
          is_available: boolean
          kategori: string | null
          nama: string
          warung_id: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          foto_url?: string | null
          harga: number
          id?: string
          is_available?: boolean
          kategori?: string | null
          nama: string
          warung_id: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          foto_url?: string | null
          harga?: number
          id?: string
          is_available?: boolean
          kategori?: string | null
          nama?: string
          warung_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_warung_id_fkey"
            columns: ["warung_id"]
            isOneToOne: false
            referencedRelation: "warungs"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          catatan: string | null
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          driver_id: string | null
          id: string
          items: Json
          ongkir: number
          status: string
          subtotal: number
          total: number
          warung_id: string
          wilayah_id: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          customer_address: string
          customer_name: string
          customer_phone: string
          driver_id?: string | null
          id?: string
          items: Json
          ongkir: number
          status?: string
          subtotal: number
          total: number
          warung_id: string
          wilayah_id: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          driver_id?: string | null
          id?: string
          items?: Json
          ongkir?: number
          status?: string
          subtotal?: number
          total?: number
          warung_id?: string
          wilayah_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_warung_id_fkey"
            columns: ["warung_id"]
            isOneToOne: false
            referencedRelation: "warungs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_wilayah_id_fkey"
            columns: ["wilayah_id"]
            isOneToOne: false
            referencedRelation: "wilayahs"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_registrations: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          nama: string
          no_whatsapp: string
          processed_at: string | null
          processed_by: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          nama: string
          no_whatsapp: string
          processed_at?: string | null
          processed_by?: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          nama?: string
          no_whatsapp?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alamat: string | null
          created_at: string
          foto_url: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          nama: string
          no_whatsapp: string
          updated_at: string
          user_id: string
          wilayah_id: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          nama: string
          no_whatsapp: string
          updated_at?: string
          user_id: string
          wilayah_id?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          nama?: string
          no_whatsapp?: string
          updated_at?: string
          user_id?: string
          wilayah_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_wilayah_id_fkey"
            columns: ["wilayah_id"]
            isOneToOne: false
            referencedRelation: "wilayahs"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warungs: {
        Row: {
          alamat: string
          created_at: string
          deskripsi: string | null
          foto_url: string | null
          id: string
          is_active: boolean
          jam_buka: string | null
          nama: string
          no_wa: string
          owner_id: string | null
          rating: number | null
          total_reviews: number | null
          wilayah_id: string
        }
        Insert: {
          alamat: string
          created_at?: string
          deskripsi?: string | null
          foto_url?: string | null
          id?: string
          is_active?: boolean
          jam_buka?: string | null
          nama: string
          no_wa: string
          owner_id?: string | null
          rating?: number | null
          total_reviews?: number | null
          wilayah_id: string
        }
        Update: {
          alamat?: string
          created_at?: string
          deskripsi?: string | null
          foto_url?: string | null
          id?: string
          is_active?: boolean
          jam_buka?: string | null
          nama?: string
          no_wa?: string
          owner_id?: string | null
          rating?: number | null
          total_reviews?: number | null
          wilayah_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warungs_wilayah_id_fkey"
            columns: ["wilayah_id"]
            isOneToOne: false
            referencedRelation: "wilayahs"
            referencedColumns: ["id"]
          },
        ]
      }
      wilayahs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          nama: string
          ongkir: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama: string
          ongkir?: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama?: string
          ongkir?: number
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "pelanggan" | "mitra" | "driver" | "admin"
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
      app_role: ["pelanggan", "mitra", "driver", "admin"],
    },
  },
} as const
