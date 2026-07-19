/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WebSiteProject {
  id: string;
  name: string;
  prompt: string;
  code: string;                 // HTML manontolo (single file)
  createdAt: string;
  explanation?: string;
  chatHistory?: ChatMessage[];
  supabaseProjectId?: string;
  supabaseStatus?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  code?: string;                // raha misy kaody ao anaty valiny AI
}

export interface PredefinedTemplate {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  description: string;
}

export interface SavedDatabaseConfig {
  id: string;
  projectName: string;
  type: "Firebase" | "Supabase";
  config: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    url?: string;
    anonKey?: string;
  };
  createdAt: string;
}

export interface GitHubDeployment {
  repoName: string;
  repoUrl: string;
  pagesUrl: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  projectName: string;
  formName: string;
  data: Record<string, any>;
  submittedAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  credits: number;
  tokensUsed: number;
  bonusClaimsCount: number;
  lastBonusClaimed?: string;
  isAdmin?: boolean;
  deployments?: GitHubDeployment[];
  submissions?: FormSubmission[];
}

export interface PaymentClaim {
  id: string;
  email: string;
  plan: "10000ar" | "20000ar" | "50000ar";
  transactionRef: string;
  senderPhone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
