export type IndustryType = 
  | "半導體與硬體"
  | "軟體與雲端運算"
  | "人工智慧與數據"
  | "金融科技與金控"
  | "生技醫療與健康"
  | "智慧製造與工業"
  | "電商零售與消費品"
  | "綠能永續與 ESG"
  | "數位行銷與媒體"
  | "專業顧問與創投"
  | "教育科研與公部門"
  | "其他多元領域"
  // 歷史相容性相容欄位
  | "半導體"
  | "軟體與雲端"
  | "金融科技"
  | "生技醫療"
  | "智慧製造"
  | "其他領域"
  // 支援學員自行輸入自訂產業領域
  | (string & {});

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  company: string;
  title: string;
  industry: IndustryType;
  group: number;
  role: "組長" | "副組長" | "學員" | "講師" | "助教" | "活動籌備" | "貴賓" | (string & {});
  avatarUrl?: string;
  businessCardUrl?: string;
  mediaType?: "avatar" | "card";
  lineId: string;
  linkedinUrl: string;
  offer: string;
  seek: string;
  isCurrentUser?: boolean;
}

export interface EventSpace {
  id: string;
  slug: string;
  title: string;
  cohort: string;
  date: string;
  totalMembers: number;
  totalGroups: number;
  userRole: string;
  isCurrent: boolean;
  passcode?: string;
  isDemoMode?: boolean;
  customRoles?: string[];
}

export interface PrivateNote {
  targetUserId: string;
  content: string;
  updatedAt: string;
}

export type ViewTab = "landing" | "directory" | "graph" | "hub";

export interface EventApplication {
  id: string;
  orgName: string;
  eventTitle: string;
  cohort?: string;
  scale: string; // e.g. "30人以下", "30~80人", "80~200人", "200人以上"
  eventDate: string;
  needGrouping: boolean;
  applicantName: string;
  applicantRole: string; // e.g. "秘書長", "活動總召", "班代", "HR主管"
  contactLine: string;
  contactPhone?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
