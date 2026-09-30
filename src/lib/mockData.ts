import { UserProfile, EventSpace, IndustryType } from "../types/network";

export const INDUSTRIES: IndustryType[] = [
  "半導體",
  "軟體與雲端",
  "金融科技",
  "生技醫療",
  "智慧製造"
];

export const INITIAL_EVENTS: EventSpace[] = [
  {
    id: "aia-12",
    slug: "aia-12",
    title: "台灣人工智慧學校 (AIA)",
    cohort: "經理人班第12期",
    date: "2026/03",
    totalMembers: 52,
    totalGroups: 8,
    userRole: "第 3 組 學員",
    isCurrent: true,
    isDemoMode: true,
  },
  {
    id: "genai-workshop",
    slug: "genai-workshop",
    title: "企業生成式 AI 落地工作坊",
    cohort: "春季實戰營",
    date: "2026/01",
    totalMembers: 38,
    totalGroups: 6,
    userRole: "自由分組",
    isCurrent: false,
    isDemoMode: false,
  },
  {
    id: "aws-summit",
    slug: "aws-summit",
    title: "AWS Cloud Summit 企業閉門會",
    cohort: "架構師論壇",
    date: "2025/11",
    totalMembers: 65,
    totalGroups: 10,
    userRole: "VIP 嘉賓",
    isCurrent: false,
    isDemoMode: false,
  }
];

export const CURRENT_USER_DEFAULT: UserProfile = {
  id: "user-kevin",
  name: "陳志豪 (Kevin)",
  surname: "陳",
  company: "台積電 TSMC",
  title: "資深 AI 專案工程師",
  industry: "半導體",
  group: 3,
  role: "學員",
  lineId: "kevin_ai_99",
  linkedinUrl: "https://linkedin.com/in/kevin-chen-ai",
  offer: "半導體製程瑕疵檢測經驗、工業 AI 落地指引",
  seek: "尋求 LLM 企業內部私有化微調與地端部署專家",
  isCurrentUser: true,
};

const COMPANIES_BY_IND: Record<IndustryType, string[]> = {
  "半導體": ["台積電", "聯發科", "聯電", "日月光", "瑞昱半導體", "ASML 台灣"],
  "軟體與雲端": ["微軟台灣", "Google Cloud", "趨勢科技", "Appier", "91APP", "AWS 台灣"],
  "金融科技": ["國泰金控", "富邦金控", "玉山銀行", "台新金控", "中信金控"],
  "生技醫療": ["台大醫院 AI 中心", "長庚醫療", "美時化學", "行動基因"],
  "智慧製造": ["廣達電腦", "鴻海科技", "研華科技", "台達電子", "緯創資通"],
  "其他領域": ["麥肯錫顧問", "資誠聯合會計師", "理律法律事務所"]
};

const OFFERS_BY_IND: Record<IndustryType, string[]> = {
  "半導體": ["先進製程良率預測案例", "晶圓缺陷 AI 影像辨識演算法", "半導體設備自動化排程經驗"],
  "軟體與雲端": ["企業雲端資料湖架構建置", "LLM 私有化地端部署諮詢", "高併發分散式後端架構指引"],
  "金融科技": ["金融風控與詐欺偵測模型實踐", "內部知識庫 RAG 導入經驗", "金融法遵與資料隱私防護"],
  "生技醫療": ["生醫影像特徵擷取演算法", "臨床試驗數據前處理管道", "醫院智慧照護流程再造"],
  "智慧製造": ["AOI 光學檢測升級與 edge AI", "工廠預知保養 (PdM) 振動分析", "供應鏈數位孿生模擬"],
  "其他領域": ["數位轉型策略規劃", "跨國企業併購法遵", "ESG 碳資產管理框架"]
};

const SEEKS_BY_IND: Record<IndustryType, string[]> = {
  "半導體": ["找對大語言模型微調 (Fine-tuning) 有實戰經驗的夥伴", "尋求異業跨界 AI 經理人交流"],
  "軟體與雲端": ["尋找製造業與半導體真實場景進行 POC", "想了解金融業對生成式 AI 的法規限制"],
  "金融科技": ["尋找資安與隱私計算 (FL) 技術團隊", "想認識能協助內部做 Prompt 培訓的講師"],
  "生技醫療": ["找邊緣運算 (Edge AI) 晶片供應商合作", "想結識熟練電腦視覺的工程主管"],
  "智慧製造": ["找會寫工業機器人自動控制程式的同好", "尋找懂 ESG 與碳足跡盤查 AI 模組的顧問"],
  "其他領域": ["尋求 AI 專案商業模式驗證", "找各行業技術專家做產業訪談"]
};

const SURNAMES = ["林", "黃", "張", "李", "王", "吳", "劉", "蔡", "楊", "許", "鄭", "謝", "郭", "洪", "曾"];
const FIRSTNAMES = ["家豪", "志明", "俊傑", "冠宇", "雅婷", "宗憲", "怡君", "淑芬", "建宏", "偉倫", "佩蓉", "柏翰", "欣儀", "承翰", "宇軒"];
const TITLES = ["資深主任工程師", "技術總監 (Director)", "AI 專案副理", "研發經理", "架構師", "數位轉型顧問", "資料科學家", "產品總監"];

export function generateMockMembers(currentUser: UserProfile): UserProfile[] {
  const result: UserProfile[] = [{ ...currentUser }];

  for (let i = 2; i <= 52; i++) {
    const ind = INDUSTRIES[i % INDUSTRIES.length];
    const compList = COMPANIES_BY_IND[ind];
    const company = compList[i % compList.length];
    const surname = SURNAMES[i % SURNAMES.length];
    const firstname = FIRSTNAMES[i % FIRSTNAMES.length];
    const name = surname + firstname;
    const group = (i % 8) + 1; // 1 ~ 8 組
    const title = TITLES[i % TITLES.length];
    const offerList = OFFERS_BY_IND[ind];
    const seekList = SEEKS_BY_IND[ind];

    result.push({
      id: `member-${i}`,
      name: name,
      surname: surname,
      company: company,
      title: title,
      industry: ind,
      group: group,
      role: (i === 1 || i === 9 || i === 17 || i === 25) ? "組長" : "學員",
      lineId: `line_user_${i}`,
      linkedinUrl: `https://linkedin.com/in/user-${i}`,
      offer: offerList[i % offerList.length],
      seek: seekList[i % seekList.length],
      isCurrentUser: false
    });
  }

  return result;
}
