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
            advice: {
                Row: {
                    advice_id: string
                    body_text: string
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    advice_id?: string
                    body_text: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    advice_id?: string
                    body_text?: string
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            affiliation: {
                Row: {
                    affiliation_id: string
                    clinician_id: string
                    created_at: string | null
                    hospital_id: string
                    room_no: string | null
                    updated_at: string | null
                }
                Insert: {
                    affiliation_id?: string
                    clinician_id: string
                    created_at?: string | null
                    hospital_id: string
                    room_no?: string | null
                    updated_at?: string | null
                }
                Update: {
                    affiliation_id?: string
                    clinician_id?: string
                    created_at?: string | null
                    hospital_id?: string
                    room_no?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "affiliation_clinician_id_fkey"
                        columns: ["clinician_id"]
                        isOneToOne: false
                        referencedRelation: "clinician"
                        referencedColumns: ["user_id"]
                    },
                    {
                        foreignKeyName: "affiliation_hospital_id_fkey"
                        columns: ["hospital_id"]
                        isOneToOne: false
                        referencedRelation: "hospital"
                        referencedColumns: ["hospital_id"]
                    },
                ]
            }
            audio: {
                Row: {
                    audio_id: string
                    created_at: string | null
                    oss_links: string[] | null
                    session_id: string
                    updated_at: string | null
                }
                Insert: {
                    audio_id?: string
                    created_at?: string | null
                    oss_links?: string[] | null
                    session_id: string
                    updated_at?: string | null
                }
                Update: {
                    audio_id?: string
                    created_at?: string | null
                    oss_links?: string[] | null
                    session_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "audio_session_id_fkey"
                        columns: ["session_id"]
                        isOneToOne: false
                        referencedRelation: "session"
                        referencedColumns: ["session_id"]
                    },
                ]
            }
            chief_complaint: {
                Row: {
                    cc_id: string
                    ccn_id: string
                    created_at: string | null
                    duration: string | null
                    notes: string | null
                    updated_at: string | null
                }
                Insert: {
                    cc_id?: string
                    ccn_id: string
                    created_at?: string | null
                    duration?: string | null
                    notes?: string | null
                    updated_at?: string | null
                }
                Update: {
                    cc_id?: string
                    ccn_id?: string
                    created_at?: string | null
                    duration?: string | null
                    notes?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "chief_complaint_ccn_id_fkey"
                        columns: ["ccn_id"]
                        isOneToOne: false
                        referencedRelation: "chief_complaint_name"
                        referencedColumns: ["ccn_id"]
                    },
                ]
            }
            chief_complaint_name: {
                Row: {
                    ccn_id: string
                    created_at: string | null
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    ccn_id?: string
                    created_at?: string | null
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    ccn_id?: string
                    created_at?: string | null
                    name?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            clinician: {
                Row: {
                    bmdc_no: string | null
                    created_at: string | null
                    medicine_company_ids: string[] | null
                    qualification: string | null
                    specializations: string[] | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    bmdc_no?: string | null
                    created_at?: string | null
                    medicine_company_ids?: string[] | null
                    qualification?: string | null
                    specializations?: string[] | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    bmdc_no?: string | null
                    created_at?: string | null
                    medicine_company_ids?: string[] | null
                    qualification?: string | null
                    specializations?: string[] | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            diagnosis: {
                Row: {
                    created_at: string | null
                    diagnosis_id: string
                    dn_id: string
                    prescription_id: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    diagnosis_id?: string
                    dn_id: string
                    prescription_id: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    diagnosis_id?: string
                    dn_id?: string
                    prescription_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "diagnosis_dn_id_fkey"
                        columns: ["dn_id"]
                        isOneToOne: false
                        referencedRelation: "diagnosis_name"
                        referencedColumns: ["dn_id"]
                    },
                    {
                        foreignKeyName: "diagnosis_prescription_id_fkey"
                        columns: ["prescription_id"]
                        isOneToOne: false
                        referencedRelation: "prescription"
                        referencedColumns: ["prescription_id"]
                    },
                ]
            }
            diagnosis_name: {
                Row: {
                    created_at: string | null
                    dn_id: string
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    dn_id?: string
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    dn_id?: string
                    name?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            history: {
                Row: {
                    created_at: string | null
                    duration: string | null
                    history_id: string
                    hn_id: string
                    notes: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    duration?: string | null
                    history_id?: string
                    hn_id: string
                    notes?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    duration?: string | null
                    history_id?: string
                    hn_id?: string
                    notes?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "history_hn_id_fkey"
                        columns: ["hn_id"]
                        isOneToOne: false
                        referencedRelation: "history_name"
                        referencedColumns: ["hn_id"]
                    },
                ]
            }
            history_name: {
                Row: {
                    created_at: string | null
                    hn_id: string
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    hn_id?: string
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    hn_id?: string
                    name?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            hospital: {
                Row: {
                    city_corporation: string | null
                    code: number | null
                    created_at: string | null
                    district: string | null
                    division: string | null
                    hospital_id: string
                    name_bn: string | null
                    name_en: string
                    paurasava: string | null
                    type: string | null
                    union: string | null
                    upazila: string | null
                    updated_at: string | null
                }
                Insert: {
                    city_corporation?: string | null
                    code?: number | null
                    created_at?: string | null
                    district?: string | null
                    division?: string | null
                    hospital_id?: string
                    name_bn?: string | null
                    name_en: string
                    paurasava?: string | null
                    type?: string | null
                    union?: string | null
                    upazila?: string | null
                    updated_at?: string | null
                }
                Update: {
                    city_corporation?: string | null
                    code?: number | null
                    created_at?: string | null
                    district?: string | null
                    division?: string | null
                    hospital_id?: string
                    name_bn?: string | null
                    name_en?: string
                    paurasava?: string | null
                    type?: string | null
                    union?: string | null
                    upazila?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            medication_routine: {
                Row: {
                    after_breakfast: boolean | null
                    after_dinner: boolean | null
                    after_lunch: boolean | null
                    before_breakfast: boolean | null
                    before_dinner: boolean | null
                    before_lunch: boolean | null
                    created_at: string | null
                    gap_hour: number | null
                    routine_id: string
                    updated_at: string | null
                }
                Insert: {
                    after_breakfast?: boolean | null
                    after_dinner?: boolean | null
                    after_lunch?: boolean | null
                    before_breakfast?: boolean | null
                    before_dinner?: boolean | null
                    before_lunch?: boolean | null
                    created_at?: string | null
                    gap_hour?: number | null
                    routine_id?: string
                    updated_at?: string | null
                }
                Update: {
                    after_breakfast?: boolean | null
                    after_dinner?: boolean | null
                    after_lunch?: boolean | null
                    before_breakfast?: boolean | null
                    before_dinner?: boolean | null
                    before_lunch?: boolean | null
                    created_at?: string | null
                    gap_hour?: number | null
                    routine_id?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            medicine: {
                Row: {
                    created_at: string | null
                    dosage: string | null
                    medicine_company_id: string
                    medicine_id: string
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    dosage?: string | null
                    medicine_company_id: string
                    medicine_id?: string
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    dosage?: string | null
                    medicine_company_id?: string
                    medicine_id?: string
                    name?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "medicine_medicine_company_id_fkey"
                        columns: ["medicine_company_id"]
                        isOneToOne: false
                        referencedRelation: "medicine_company"
                        referencedColumns: ["medicine_company_id"]
                    },
                ]
            }
            medicine_company: {
                Row: {
                    created_at: string | null
                    medicine_company_id: string
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    medicine_company_id?: string
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    medicine_company_id?: string
                    name?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            on_examination: {
                Row: {
                    bp_diastolic: number | null
                    bp_systolic: number | null
                    created_at: string | null
                    height: number | null
                    oe_id: string
                    pulse: number | null
                    temperature: number | null
                    updated_at: string | null
                }
                Insert: {
                    bp_diastolic?: number | null
                    bp_systolic?: number | null
                    created_at?: string | null
                    height?: number | null
                    oe_id?: string
                    pulse?: number | null
                    temperature?: number | null
                    updated_at?: string | null
                }
                Update: {
                    bp_diastolic?: number | null
                    bp_systolic?: number | null
                    created_at?: string | null
                    height?: number | null
                    oe_id?: string
                    pulse?: number | null
                    temperature?: number | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            patient: {
                Row: {
                    created_at: string | null
                    date_of_birth: string | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    date_of_birth?: string | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    date_of_birth?: string | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            prescription: {
                Row: {
                    advice_ids: string[] | null
                    cc_ids: string[] | null
                    created_at: string | null
                    diagnosis_ids: string[] | null
                    follow_up_days: number | null
                    follow_up_notes: string | null
                    history_ids: string[] | null
                    oe_ids: string[] | null
                    prescription_id: string
                    rx_ids: string[] | null
                    session_id: string
                    updated_at: string | null
                }
                Insert: {
                    advice_ids?: string[] | null
                    cc_ids?: string[] | null
                    created_at?: string | null
                    diagnosis_ids?: string[] | null
                    follow_up_days?: number | null
                    follow_up_notes?: string | null
                    history_ids?: string[] | null
                    oe_ids?: string[] | null
                    prescription_id?: string
                    rx_ids?: string[] | null
                    session_id: string
                    updated_at?: string | null
                }
                Update: {
                    advice_ids?: string[] | null
                    cc_ids?: string[] | null
                    created_at?: string | null
                    diagnosis_ids?: string[] | null
                    follow_up_days?: number | null
                    follow_up_notes?: string | null
                    history_ids?: string[] | null
                    oe_ids?: string[] | null
                    prescription_id?: string
                    rx_ids?: string[] | null
                    session_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "prescription_session_id_fkey"
                        columns: ["session_id"]
                        isOneToOne: false
                        referencedRelation: "session"
                        referencedColumns: ["session_id"]
                    },
                ]
            }
            rx: {
                Row: {
                    created_at: string | null
                    duration: number | null
                    medicine_id: string
                    routine_id: string
                    rx_id: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    duration?: number | null
                    medicine_id: string
                    routine_id: string
                    rx_id?: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    duration?: number | null
                    medicine_id?: string
                    routine_id?: string
                    rx_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "rx_medicine_id_fkey"
                        columns: ["medicine_id"]
                        isOneToOne: false
                        referencedRelation: "medicine"
                        referencedColumns: ["medicine_id"]
                    },
                    {
                        foreignKeyName: "rx_routine_id_fkey"
                        columns: ["routine_id"]
                        isOneToOne: false
                        referencedRelation: "medication_routine"
                        referencedColumns: ["routine_id"]
                    },
                ]
            }
            session: {
                Row: {
                    clinician_id: string
                    created_at: string | null
                    patient_id: string
                    session_id: string
                    time: string | null
                    updated_at: string | null
                }
                Insert: {
                    clinician_id: string
                    created_at?: string | null
                    patient_id: string
                    session_id?: string
                    time?: string | null
                    updated_at?: string | null
                }
                Update: {
                    clinician_id?: string
                    created_at?: string | null
                    patient_id?: string
                    session_id?: string
                    time?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "session_clinician_id_fkey"
                        columns: ["clinician_id"]
                        isOneToOne: false
                        referencedRelation: "clinician"
                        referencedColumns: ["user_id"]
                    },
                    {
                        foreignKeyName: "session_patient_id_fkey"
                        columns: ["patient_id"]
                        isOneToOne: false
                        referencedRelation: "patient"
                        referencedColumns: ["user_id"]
                    },
                ]
            }
            transcription: {
                Row: {
                    created_at: string | null
                    full_text: string | null
                    session_id: string
                    summary_text: string | null
                    transcription_id: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    full_text?: string | null
                    session_id: string
                    summary_text?: string | null
                    transcription_id?: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    full_text?: string | null
                    session_id?: string
                    summary_text?: string | null
                    transcription_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "transcription_session_id_fkey"
                        columns: ["session_id"]
                        isOneToOne: false
                        referencedRelation: "session"
                        referencedColumns: ["session_id"]
                    },
                ]
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
