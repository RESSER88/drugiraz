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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      deepl_api_keys: {
        Row: {
          api_key_encrypted: string
          api_key_masked: string
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          last_sync_at: string | null
          last_test_at: string | null
          name: string
          quota_limit: number | null
          quota_remaining: number | null
          quota_reset_date: string | null
          quota_used: number | null
          status: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted: string
          api_key_masked: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_sync_at?: string | null
          last_test_at?: string | null
          name: string
          quota_limit?: number | null
          quota_remaining?: number | null
          quota_reset_date?: string | null
          quota_used?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string
          api_key_masked?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_sync_at?: string | null
          last_test_at?: string | null
          name?: string
          quota_limit?: number | null
          quota_remaining?: number | null
          quota_reset_date?: string | null
          quota_used?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          language: string
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          language: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          language?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_inquiries: {
        Row: {
          created_at: string
          id: string
          language: string
          message: string | null
          page_url: string | null
          phone: string | null
          product_id: string | null
          product_model: string
          production_year: string | null
          serial_number: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          message?: string | null
          page_url?: string | null
          phone?: string | null
          product_id?: string | null
          product_model: string
          production_year?: string | null
          serial_number?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          message?: string | null
          page_url?: string | null
          phone?: string | null
          product_id?: string | null
          product_model?: string
          production_year?: string | null
          serial_number?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_seo_settings: {
        Row: {
          availability: string | null
          created_at: string | null
          enable_schema: boolean | null
          gtin: string | null
          id: string
          item_condition: string | null
          mpn: string | null
          price: number | null
          price_currency: string | null
          price_valid_until: string | null
          product_id: string
          updated_at: string | null
          validation_errors: Json | null
          validation_status: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          enable_schema?: boolean | null
          gtin?: string | null
          id?: string
          item_condition?: string | null
          mpn?: string | null
          price?: number | null
          price_currency?: string | null
          price_valid_until?: string | null
          product_id: string
          updated_at?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          enable_schema?: boolean | null
          gtin?: string | null
          id?: string
          item_condition?: string | null
          mpn?: string | null
          price?: number | null
          price_currency?: string | null
          price_valid_until?: string | null
          product_id?: string
          updated_at?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_seo_settings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_translations: {
        Row: {
          created_at: string
          field_name: string
          id: string
          language: string
          product_id: string
          translated_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          language: string
          product_id: string
          translated_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          language?: string
          product_id?: string
          translated_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_translations_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_options: string | null
          battery: string | null
          condition: string | null
          created_at: string
          detailed_description: string | null
          dimensions: string | null
          drive_type: string | null
          foldable_platform: string | null
          free_lift: number | null
          id: string
          image_url: string | null
          initial_lift: string | null
          lift_capacity_initial: number | null
          lift_capacity_mast: number | null
          lift_height: number | null
          mast: string | null
          min_height: number | null
          name: string
          production_year: number | null
          serial_number: string
          short_description: string | null
          slug: string
          updated_at: string
          wheels: string | null
          working_hours: number | null
        }
        Insert: {
          additional_options?: string | null
          battery?: string | null
          condition?: string | null
          created_at?: string
          detailed_description?: string | null
          dimensions?: string | null
          drive_type?: string | null
          foldable_platform?: string | null
          free_lift?: number | null
          id?: string
          image_url?: string | null
          initial_lift?: string | null
          lift_capacity_initial?: number | null
          lift_capacity_mast?: number | null
          lift_height?: number | null
          mast?: string | null
          min_height?: number | null
          name: string
          production_year?: number | null
          serial_number: string
          short_description?: string | null
          slug: string
          updated_at?: string
          wheels?: string | null
          working_hours?: number | null
        }
        Update: {
          additional_options?: string | null
          battery?: string | null
          condition?: string | null
          created_at?: string
          detailed_description?: string | null
          dimensions?: string | null
          drive_type?: string | null
          foldable_platform?: string | null
          free_lift?: number | null
          id?: string
          image_url?: string | null
          initial_lift?: string | null
          lift_capacity_initial?: number | null
          lift_capacity_mast?: number | null
          lift_height?: number | null
          mast?: string | null
          min_height?: number | null
          name?: string
          production_year?: number | null
          serial_number?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
          wheels?: string | null
          working_hours?: number | null
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          post_id: string | null
          posted_at: string | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          post_id?: string | null
          posted_at?: string | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          post_id?: string | null
          posted_at?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_posts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_jobs: {
        Row: {
          characters_used: number | null
          content_id: string
          content_type: string
          created_at: string
          error_message: string | null
          id: string
          source_content: string
          source_language: string
          status: string
          target_language: string
          translated_content: string | null
          translation_mode: string | null
          updated_at: string
        }
        Insert: {
          characters_used?: number | null
          content_id: string
          content_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          source_content: string
          source_language?: string
          status?: string
          target_language: string
          translated_content?: string | null
          translation_mode?: string | null
          updated_at?: string
        }
        Update: {
          characters_used?: number | null
          content_id?: string
          content_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          source_content?: string
          source_language?: string
          status?: string
          target_language?: string
          translated_content?: string | null
          translation_mode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      translation_logs: {
        Row: {
          api_key_used: string
          characters_used: number | null
          created_at: string
          error_details: string | null
          field_name: string
          id: string
          processing_time_ms: number | null
          product_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          source_language: string
          status: string
          target_language: string
          translation_mode: string
        }
        Insert: {
          api_key_used: string
          characters_used?: number | null
          created_at?: string
          error_details?: string | null
          field_name: string
          id?: string
          processing_time_ms?: number | null
          product_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          source_language: string
          status: string
          target_language: string
          translation_mode: string
        }
        Update: {
          api_key_used?: string
          characters_used?: number | null
          created_at?: string
          error_details?: string | null
          field_name?: string
          id?: string
          processing_time_ms?: number | null
          product_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          source_language?: string
          status?: string
          target_language?: string
          translation_mode?: string
        }
        Relationships: []
      }
      translation_stats: {
        Row: {
          api_calls: number | null
          characters_limit: number | null
          characters_used: number | null
          created_at: string
          id: string
          month_year: string
          updated_at: string
        }
        Insert: {
          api_calls?: number | null
          characters_limit?: number | null
          characters_used?: number | null
          created_at?: string
          id?: string
          month_year: string
          updated_at?: string
        }
        Update: {
          api_calls?: number | null
          characters_limit?: number | null
          characters_used?: number | null
          created_at?: string
          id?: string
          month_year?: string
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      generate_product_slug: {
        Args: { product_name: string; serial_number?: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_rotation_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_unposted_product: {
        Args:
          | { auto_reset?: boolean; platform_name: string }
          | { platform_name: string }
        Returns: Json
      }
      get_unposted_product_debug: {
        Args: { auto_reset?: boolean; platform_name: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      log_social_post: {
        Args: {
          external_post_id?: string
          platform_name: string
          product_uuid: string
        }
        Returns: Json
      }
      reset_platform_rotation: {
        Args: { platform_name: string }
        Returns: Json
      }
      security_audit: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      app_role: ["admin", "user"],
    },
  },
} as const
