export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          status: string
          supplier: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          supplier: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          supplier?: string
          updated_at?: string
        }
        Relationships: []
      }
      boletos: {
        Row: {
          amount: number
          barcode: string
          company_name: string
          created_at: string
          digitable_line: string | null
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          barcode: string
          company_name: string
          created_at?: string
          digitable_line?: string | null
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          barcode?: string
          company_name?: string
          created_at?: string
          digitable_line?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      clt_employees: {
        Row: {
          advance_payment: number | null
          base_salary: number
          bonuses: number | null
          created_at: string
          discounts: number | null
          document: string
          email: string | null
          hire_date: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          pix_key: string | null
          position: string
          status: string
          updated_at: string
        }
        Insert: {
          advance_payment?: number | null
          base_salary: number
          bonuses?: number | null
          created_at?: string
          discounts?: number | null
          document: string
          email?: string | null
          hire_date: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          pix_key?: string | null
          position: string
          status?: string
          updated_at?: string
        }
        Update: {
          advance_payment?: number | null
          base_salary?: number
          bonuses?: number | null
          created_at?: string
          discounts?: number | null
          document?: string
          email?: string | null
          hire_date?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          pix_key?: string | null
          position?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pagarme_operations: {
        Row: {
          acquirer_name: string | null
          amount: number
          authorization_code: string | null
          card_brand: string | null
          card_last_four_digits: string | null
          created_at: string
          description: string | null
          external_id: string
          fee: number | null
          id: string
          installments: number | null
          nsu: string | null
          payment_method: string | null
          status: string
          synced_at: string
          tid: string | null
          type: string
          updated_at: string
        }
        Insert: {
          acquirer_name?: string | null
          amount: number
          authorization_code?: string | null
          card_brand?: string | null
          card_last_four_digits?: string | null
          created_at?: string
          description?: string | null
          external_id: string
          fee?: number | null
          id?: string
          installments?: number | null
          nsu?: string | null
          payment_method?: string | null
          status: string
          synced_at?: string
          tid?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          acquirer_name?: string | null
          amount?: number
          authorization_code?: string | null
          card_brand?: string | null
          card_last_four_digits?: string | null
          created_at?: string
          description?: string | null
          external_id?: string
          fee?: number | null
          id?: string
          installments?: number | null
          nsu?: string | null
          payment_method?: string | null
          status?: string
          synced_at?: string
          tid?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          created_at: string
          document: string
          email: string | null
          id: string
          monthly_amount: number
          name: string
          notes: string | null
          payment_date: number | null
          phone: string | null
          pix_key: string | null
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document: string
          email?: string | null
          id?: string
          monthly_amount: number
          name: string
          notes?: string | null
          payment_date?: number | null
          phone?: string | null
          pix_key?: string | null
          service_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string
          email?: string | null
          id?: string
          monthly_amount?: number
          name?: string
          notes?: string | null
          payment_date?: number | null
          phone?: string | null
          pix_key?: string | null
          service_type?: string
          status?: string
          updated_at?: string
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
