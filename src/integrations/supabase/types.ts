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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
