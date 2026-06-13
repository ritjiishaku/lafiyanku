export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      facilities: {
        Row: {
          facility_id: string;
          facility_name: string;
          facility_code: string | null;
          created_at: string;
        };
        Insert: {
          facility_id?: string;
          facility_name: string;
          facility_code?: string | null;
          created_at?: string;
        };
        Update: {
          facility_id?: string;
          facility_name?: string;
          facility_code?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          user_id: string;
          email: string;
          full_name: string;
          role: string;
          facility_id: string | null;
          created_at: string;
          updated_at: string;
          must_change_password: boolean;
        };
        Insert: {
          user_id: string;
          email: string;
          full_name?: string;
          role?: string;
          facility_id?: string | null;
          created_at?: string;
          updated_at?: string;
          must_change_password?: boolean;
        };
        Update: {
          user_id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          facility_id?: string | null;
          created_at?: string;
          updated_at?: string;
          must_change_password?: boolean;
        };
      };
      patient_inputs: {
        Row: {
          patient_id: string;
          facility_id: string;
          facility_name: string;
          facility_code: string | null;
          ward_name: string | null;
          admission_date: string;
          discharge_date: string;
          patient_name: string;
          age: number;
          gender: string;
          hospital_number: string;
          nhis_number: string | null;
          diagnosis: string;
          treatment_given: string;
          procedures_performed: string[] | null;
          medications: Json;
          follow_up_instructions: string | null;
          additional_notes: string | null;
          language_requested: string | null;
          discharged_by: string;
          clinician_license_no: string | null;
          consent_given: boolean;
          consent_timestamp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          patient_id?: string;
          facility_id: string;
          facility_name: string;
          facility_code?: string | null;
          ward_name?: string | null;
          admission_date: string;
          discharge_date: string;
          patient_name: string;
          age: number;
          gender: string;
          hospital_number: string;
          nhis_number?: string | null;
          diagnosis: string;
          treatment_given: string;
          procedures_performed?: string[] | null;
          medications: Json;
          follow_up_instructions?: string | null;
          additional_notes?: string | null;
          language_requested?: string | null;
          discharged_by: string;
          clinician_license_no?: string | null;
          consent_given?: boolean;
          consent_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          patient_id?: string;
          facility_id?: string;
          facility_name?: string;
          facility_code?: string | null;
          ward_name?: string | null;
          admission_date?: string;
          discharge_date?: string;
          patient_name?: string;
          age?: number;
          gender?: string;
          hospital_number?: string;
          nhis_number?: string | null;
          diagnosis?: string;
          treatment_given?: string;
          procedures_performed?: string[] | null;
          medications?: Json;
          follow_up_instructions?: string | null;
          additional_notes?: string | null;
          language_requested?: string | null;
          discharged_by?: string;
          clinician_license_no?: string | null;
          consent_given?: boolean;
          consent_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      discharge_records: {
        Row: {
          record_id: string;
          patient_input_id: string;
          facility_id: string;
          generated_at: string;
          generated_by_user_id: string;
          prompt_version: string;
          model_version: string;
          clinical_summary: string;
          patient_friendly_output: string;
          translated_output: string | null;
          translation_language: string | null;
          translation_confidence: string | null;
          missing_fields_log: string[] | null;
          flagged_issues: string[] | null;
          status: string;
          last_edited_at: string | null;
          last_edited_by_user_id: string | null;
          created_at: string;
        };
        Insert: {
          record_id?: string;
          patient_input_id: string;
          facility_id: string;
          generated_at?: string;
          generated_by_user_id: string;
          prompt_version: string;
          model_version: string;
          clinical_summary: string;
          patient_friendly_output: string;
          translated_output?: string | null;
          translation_language?: string | null;
          translation_confidence?: string | null;
          missing_fields_log?: string[] | null;
          flagged_issues?: string[] | null;
          status?: string;
          last_edited_at?: string | null;
          last_edited_by_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          record_id?: string;
          patient_input_id?: string;
          facility_id?: string;
          generated_at?: string;
          generated_by_user_id?: string;
          prompt_version?: string;
          model_version?: string;
          clinical_summary?: string;
          patient_friendly_output?: string;
          translated_output?: string | null;
          translation_language?: string | null;
          translation_confidence?: string | null;
          missing_fields_log?: string[] | null;
          flagged_issues?: string[] | null;
          status?: string;
          last_edited_at?: string | null;
          last_edited_by_user_id?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          log_id: string;
          record_id: string;
          user_id: string;
          user_role: string;
          action: string;
          timestamp: string;
          ip_address: string | null;
          changes_diff: Json | null;
          notes: string | null;
          facility_id: string | null;
        };
        Insert: {
          log_id?: string;
          record_id: string;
          user_id: string;
          user_role: string;
          action: string;
          timestamp?: string;
          ip_address?: string | null;
          changes_diff?: Json | null;
          notes?: string | null;
          facility_id?: string | null;
        };
        Update: {
          log_id?: string;
          record_id?: string;
          user_id?: string;
          user_role?: string;
          action?: string;
          timestamp?: string;
          ip_address?: string | null;
          changes_diff?: Json | null;
          notes?: string | null;
          facility_id?: string | null;
        };
      };
      translation_requests: {
        Row: {
          request_id: string;
          record_id: string;
          source_text: string;
          target_language: string;
          output_text: string | null;
          confidence: string | null;
          fallback_used: boolean;
          requested_at: string;
          completed_at: string | null;
        };
        Insert: {
          request_id?: string;
          record_id: string;
          source_text: string;
          target_language: string;
          output_text?: string | null;
          confidence?: string | null;
          fallback_used: boolean;
          requested_at?: string;
          completed_at?: string | null;
        };
        Update: {
          request_id?: string;
          record_id?: string;
          source_text?: string;
          target_language?: string;
          output_text?: string | null;
          confidence?: string | null;
          fallback_used?: boolean;
          requested_at?: string;
          completed_at?: string | null;
        };
      };
      demo_requests: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          facility_name: string;
          whatsapp_number: string;
          state: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          role: string;
          facility_name: string;
          whatsapp_number: string;
          state: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          facility_name?: string;
          whatsapp_number?: string;
          state?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          identifier: string;
          action_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          identifier: string;
          action_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          identifier?: string;
          action_type?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gender_enum: "Male" | "Female" | "Other";
      language_enum: "en" | "ha" | "yo" | "ig";
      confidence_enum: "high" | "low" | "failed";
      record_status_enum: "draft" | "finalised" | "archived";
      user_role_enum: "doctor" | "nurse" | "admin";
      audit_action_enum:
        | "generate"
        | "edit"
        | "view"
        | "finalise"
        | "archive"
        | "unarchive"
        | "print"
        | "export";
    };
  };
}
