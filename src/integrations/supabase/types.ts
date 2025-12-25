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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          npwp: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          npwp?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          npwp?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          item_code: string
          item_name: string
          stock: number | null
          unit: string | null
          unit_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_code: string
          item_name: string
          stock?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_code?: string
          item_name?: string
          stock?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string | null
          id: string
          item_code: string
          item_name: string
          purchase_id: string
          quantity: number
          total: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_code: string
          item_name: string
          purchase_id: string
          quantity: number
          total: number
          unit: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_code?: string
          item_name?: string
          purchase_id?: string
          quantity?: number
          total?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          apply_vat: boolean | null
          created_at: string | null
          discount: number | null
          down_payment: number | null
          due_date: string | null
          grand_total: number | null
          id: string
          notes: string | null
          payment_method: string | null
          reference: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          supplier_address: string | null
          supplier_id: string | null
          supplier_name: string
          supplier_phone: string | null
          transaction_date: string
          transaction_number: string
          updated_at: string | null
          user_id: string
          vat_amount: number | null
          vehicle_number: string | null
        }
        Insert: {
          apply_vat?: boolean | null
          created_at?: string | null
          discount?: number | null
          down_payment?: number | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_address?: string | null
          supplier_id?: string | null
          supplier_name: string
          supplier_phone?: string | null
          transaction_date?: string
          transaction_number: string
          updated_at?: string | null
          user_id: string
          vat_amount?: number | null
          vehicle_number?: string | null
        }
        Update: {
          apply_vat?: boolean | null
          created_at?: string | null
          discount?: number | null
          down_payment?: number | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_address?: string | null
          supplier_id?: string | null
          supplier_name?: string
          supplier_phone?: string | null
          transaction_date?: string
          transaction_number?: string
          updated_at?: string | null
          user_id?: string
          vat_amount?: number | null
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_settings: {
        Row: {
          created_at: string
          days_before_due: number[]
          enabled: boolean
          frequency: string
          id: string
          schedule_hour: number
          schedule_minute: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_before_due?: number[]
          enabled?: boolean
          frequency?: string
          id?: string
          schedule_hour?: number
          schedule_minute?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_before_due?: number[]
          enabled?: boolean
          frequency?: string
          id?: string
          schedule_hour?: number
          schedule_minute?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          apply_vat: boolean | null
          created_at: string | null
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          customer_npwp: string | null
          customer_phone: string | null
          discount: number | null
          down_payment: number | null
          due_date: string | null
          grand_total: number | null
          id: string
          notes: string | null
          payment_method: string | null
          reference: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          transaction_date: string
          transaction_number: string
          updated_at: string | null
          user_id: string
          vat_amount: number | null
          vat_exempt: boolean | null
          vehicle_number: string | null
        }
        Insert: {
          apply_vat?: boolean | null
          created_at?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          customer_npwp?: string | null
          customer_phone?: string | null
          discount?: number | null
          down_payment?: number | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          transaction_date?: string
          transaction_number: string
          updated_at?: string | null
          user_id: string
          vat_amount?: number | null
          vat_exempt?: boolean | null
          vehicle_number?: string | null
        }
        Update: {
          apply_vat?: boolean | null
          created_at?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_npwp?: string | null
          customer_phone?: string | null
          discount?: number | null
          down_payment?: number | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          transaction_date?: string
          transaction_number?: string
          updated_at?: string | null
          user_id?: string
          vat_amount?: number | null
          vat_exempt?: boolean | null
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_items: {
        Row: {
          created_at: string | null
          id: string
          item_code: string
          item_name: string
          quantity: number
          sales_id: string
          total: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_code: string
          item_name: string
          quantity: number
          sales_id: string
          total: number
          unit: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_code?: string
          item_name?: string
          quantity?: number
          sales_id?: string
          total?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_items_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
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
