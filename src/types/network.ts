export type IndustryType = 
  | "半導體"
  | "軟體與雲端"
  | "金融科技"
  | "生技醫療"
  | "智慧製造"
  | "其他領域";

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  company: string;
  title: string;
  industry: IndustryType;
  group: number;
  role: "組長" | "學員" | "講師" | "助教";
  avatarUrl?: string;
  lineId: string;
  linkedinUrl: string;
  offer: string;
  seek: string;
  isCurrentUser?: boolean;
}

export interface EventSpace {
  id: string;
  title: string;
  cohort: string;
  date: string;
  totalMembers: number;
  totalGroups: number;
  userRole: string;
  isCurrent: boolean;
}

export interface PrivateNote {
  targetUserId: string;
  content: string;
  updatedAt: string;
}

export type ViewTab = "directory" | "graph" | "hub";
