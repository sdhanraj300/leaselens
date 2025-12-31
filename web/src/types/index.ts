export interface User {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
}

export interface Issue {
  title: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  law?: string;
  lawViolated?: string;
}

export interface LeaseScan {
  id: string;
  fileName: string;
  riskScore: number;
  pageCount: number;
  issues: Issue[];
  createdAt: string;
  userId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
}
