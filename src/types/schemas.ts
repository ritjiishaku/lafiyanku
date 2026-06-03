export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export enum Language {
  En = "en",
  Ha = "ha",
  Yo = "yo",
  Ig = "ig",
}

export enum UserRole {
  Doctor = "doctor",
  Nurse = "nurse",
  Admin = "admin",
}

export enum RecordStatus {
  Draft = "draft",
  Finalised = "finalised",
  Archived = "archived",
}

export enum AuditAction {
  Generate = "generate",
  Edit = "edit",
  View = "view",
  Finalise = "finalise",
  Archive = "archive",
  Print = "print",
  Export = "export",
}

export enum TranslationConfidence {
  High = "high",
  Low = "low",
  Failed = "failed",
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  timing?: string | null;
  duration?: string | null;
  notes?: string | null;
}

export interface PatientInput {
  patientId: string;
  facilityName: string;
  facilityCode?: string | null;
  wardName?: string | null;
  admissionDate: string;
  dischargeDate: string;
  patientName: string;
  age: number;
  gender: Gender;
  hospitalNumber: string;
  nhisNumber?: string | null;
  diagnosis: string;
  treatmentGiven: string;
  proceduresPerformed?: string[] | null;
  medications: Medication[];
  followUpInstructions?: string | null;
  additionalNotes?: string | null;
  languageRequested?: Language | null;
  dischargedBy: string;
  clinicianLicenseNo?: string | null;
}

export interface DischargeRecord {
  recordId: string;
  patientInputId: string;
  facilityId?: string | null;
  generatedAt: string;
  generatedByUserId: string;
  promptVersion: string;
  modelVersion: string;
  clinicalSummary: string;
  patientFriendlyOutput: string;
  translatedOutput?: string | null;
  translationLanguage?: Language | null;
  translationConfidence?: TranslationConfidence | null;
  missingFieldsLog?: string[] | null;
  flaggedIssues?: string[] | null;
  status: RecordStatus;
  lastEditedAt?: string | null;
  lastEditedByUserId?: string | null;
}

export interface TranslationRequest {
  requestId: string;
  recordId: string;
  sourceText: string;
  targetLanguage: Language;
  outputText?: string | null;
  confidence?: TranslationConfidence | null;
  fallbackUsed: boolean;
  requestedAt: string;
  completedAt?: string | null;
}

export interface AuditLog {
  logId: string;
  recordId: string;
  userId: string;
  userRole: UserRole;
  action: AuditAction;
  timestamp: string;
  ipAddress?: string | null;
  changesDiff?: Record<string, unknown> | null;
  notes?: string | null;
}
