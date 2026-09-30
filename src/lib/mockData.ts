import { UserProfile, EventSpace, IndustryType } from "../types/network";

export const INDUSTRIES: IndustryType[] = [
  "半導體與硬體",
  "軟體與雲端運算",
  "人工智慧與數據",
  "金融科技與金控",
  "生技醫療與健康",
  "智慧製造與工業",
  "電商零售與消費品",
  "綠能永續與 ESG",
  "數位行銷與媒體",
  "專業顧問與創投",
  "教育科研與公部門",
  "其他多元領域"
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
  industry: "半導體與硬體",
  group: 3,
  role: "學員",
  lineId: "kevin_ai_99",
  linkedinUrl: "https://linkedin.com/in/kevin-chen-ai",
  offer: "先進製程缺陷 AI 影像辨識、智慧製造落地經驗",
  seek: "尋求 LLM 企業私有化微調與地端高併發部署專家",
  isCurrentUser: true,
};

const COMPANIES_BY_IND: Record<string, string[]> = {
  "半導體與硬體": ["台積電 TSMC", "聯發科技", "聯華電子 UMC", "日月光投控", "瑞昱半導體", "ASML 台灣", "廣達電腦"],
  "軟體與雲端運算": ["微軟台灣", "Google Taiwan", "AWS 台灣", "趨勢科技", "Appier 沛星", "91APP", "LINE 台灣"],
  "人工智慧與數據": ["OpenAI 生態夥伴", "NVIDIA 台灣", "訊連科技", "犀動科技 Aiello", "意藍資訊", "Gogolook"],
  "金融科技與金控": ["國泰金控", "富邦金控", "中信金控", "玉山銀行", "台新金控", "街口支付", "LINE Bank"],
  "生技醫療與健康": ["台大醫院 AI 中心", "長庚醫療體系", "美時化學製藥", "行動基因", "慧誠智醫", "華碩生醫"],
  "智慧製造與工業": ["鴻海科技集團", "研華科技", "台達電子", "緯創資通", "上銀科技", "東元電機"],
  "電商零售與消費品": ["MOMO 富邦媒", "PChome 網家", "統一企業", "全聯福利中心", "Pinkoi", "酷澎 Coupang"],
  "綠能永續與 ESG": ["台達電儲能", "台泥儲能 NHOA", "雲豹能源", "森崴能源", "大亞電纜", "倍力資訊 ESG"],
  "數位行銷與媒體": ["奧美廣告 Ogilvy", "電通集團 dentsu", "天下雜誌數位部", "關鍵評論網", "潮網科技", "LINE 商務"],
  "專業顧問與創投": ["麥肯錫 McKinsey", "波士頓顧問 BCG", "資誠 PwC", "勤業眾信 Deloitte", "心元資本", "達盈創投"],
  "教育科研與公部門": ["工業技術研究院 ITRI", "中央研究院", "數位發展部 moda", "國科會 AI 中心", "國立台灣大學", "國立清華大學"],
  "其他多元領域": ["理律法律事務所", "長榮海運", "星宇航空", "信義房屋", "台灣高鐵", "誠品生活"],
  // 舊版備用 fallback
  "半導體": ["台積電", "聯發科", "聯電"],
  "軟體與雲端": ["微軟台灣", "AWS", "Google Cloud"],
  "金融科技": ["國泰金控", "富邦金控"],
  "生技醫療": ["台大醫院", "長庚醫療"],
  "智慧製造": ["鴻海科技", "研華科技"],
  "其他領域": ["麥肯錫", "資誠"]
};

const OFFERS_BY_IND: Record<string, string[]> = {
  "半導體與硬體": ["先進製程良率預測案例分析", "晶圓缺陷 AOI 光學辨識演算法", "半導體無人搬運自動排程"],
  "軟體與雲端運算": ["企業多雲架構與 Data Mesh 規劃", "微服務與 Kubernetes 容器化治理", "高併發高可用後端系統實踐"],
  "人工智慧與數據": ["企業內部私有化 RAG 知識庫搭建", "微調 Fine-tuning 評估指標建構", "多模態 Agent 自動化工作流架構"],
  "金融科技與金控": ["金融風控與即時反洗錢反詐欺模型", "顧客終身價值 (LTV) 預測引擎", "合規與金管會 AI 監管沙盒對接經驗"],
  "生技醫療與健康": ["生醫影像與病理切片 AI 輔助判讀", "臨床試驗受試者數據清洗管線", "智慧病房物聯網系統落地"],
  "智慧製造與工業": ["設備預知保養 (PdM) 振動異常分析", "數位孿生 Digital Twin 產線模擬", "工廠能耗自動化優化調校經驗"],
  "電商零售與消費品": ["精準推薦系統與個人化定價模型", "全通路 OMO 會員標籤數據資產整合", "智慧倉儲動態庫存預測調度"],
  "綠能永續與 ESG": ["企業溫室氣體盤查 (範疇1/2/3) 顧問指引", "儲能系統 (BESS) 削峰填谷充放電策略", "SBTi 科學碳目標規劃實務"],
  "數位行銷與媒體": ["MarTech 行銷自動化漏斗與 CDP 導入", "生成式 AI 文案與社群影音批次產出", "績效行銷與 ROAS 數據歸因分析"],
  "專業顧問與創投": ["企業數位轉型 Roadmap 與組織變革", "早期 AI 新創商業模式與估值評估", "跨國併購 (M&A) 商業與技術盡職調查"],
  "教育科研與公部門": ["產學研共同研發專案與政府補助案申請", "學術前沿論文轉化工業 POC 指引", "公部門法規沙盒與技術白皮書諮詢"],
  "其他多元領域": ["智慧物流跨國航運排程優化", "智慧商務空間與智慧建築規劃", "企業智慧財產權與專利佈局策略"]
};

const SEEKS_BY_IND: Record<string, string[]> = {
  "半導體與硬體": ["尋找對 Edge AI 晶片架構落地有興趣的軟體夥伴", "想交流跨國工廠自動化營運經驗"],
  "軟體與雲端運算": ["尋找製造、半導體與金控等真實商業 POC 場景", "想了解不同產業對於資安法規的具體要求"],
  "人工智慧與數據": ["想結識各垂直產業領域專家 (Domain Expert) 進行數據合作", "尋找懂 AI 倫理與智慧財產權的法務顧問"],
  "金融科技與金控": ["尋找能在地端離線環境運行的精準語義檢索技術", "想了解零售電商的點數生態圈跨界合作機會"],
  "生技醫療與健康": ["尋找獲得 TFDA/FDA 認證經驗的法規顧問", "想認識能協助微型穿戴裝置研發的硬體廠商"],
  "智慧製造與工業": ["尋求懂工業物聯網 (IIoT) 通訊協定的軟體工程團隊", "想認識有工廠減碳與綠電採購實戰經驗的顧問"],
  "電商零售與消費品": ["尋求可大幅降低商品圖生成成本的生成式 AI 方案", "想交流私域流量與 LINE 官方帳號深度經營技巧"],
  "綠能永續與 ESG": ["尋求有大量電力與碳排監控數據的用電大戶企業合作", "想結識熟練電力交易市場的分析專家"],
  "數位行銷與媒體": ["尋找具備深厚技術實力、想提升品牌聲量的新創夥伴", "想了解 B2B 科技產品出海行銷的成功打法"],
  "專業顧問與創投": ["持續尋找台灣具有全球競爭力之 AI/DeepTech 創業團隊", "想結識各科技巨頭技術長 (CTO) 與研發主管"],
  "教育科研與公部門": ["尋找願意開放真實匿名數據供學術研究的高科技企業", "想引進業界實戰講師進入大學與研究所講授 AI 實務"],
  "其他多元領域": ["尋求能協助傳統產業完成第一步數位化的系統整合商", "想交流跨國供應鏈風險管理與韌性佈局"]
};

const SURNAMES = ["林", "黃", "張", "李", "王", "吳", "劉", "蔡", "楊", "許", "鄭", "謝", "郭", "洪", "曾"];
const FIRSTNAMES = ["家豪", "志明", "俊傑", "冠宇", "雅婷", "宗憲", "怡君", "淑芬", "建宏", "偉倫", "佩蓉", "柏翰", "欣儀", "承翰", "宇軒"];
const TITLES = ["資深主任工程師", "技術總監 (Director)", "AI 專案副理", "研發經理", "架構師", "數位轉型顧問", "資料科學家", "產品總監", "行銷副總", "投資副總裁", "策略長 (CSO)"];

export function generateMockMembers(currentUser: UserProfile): UserProfile[] {
  const result: UserProfile[] = [{ ...currentUser }];

  for (let i = 2; i <= 52; i++) {
    const ind = INDUSTRIES[i % INDUSTRIES.length];
    const compList = COMPANIES_BY_IND[ind] || COMPANIES_BY_IND["其他多元領域"];
    const company = compList[i % compList.length];
    const surname = SURNAMES[i % SURNAMES.length];
    const firstname = FIRSTNAMES[i % FIRSTNAMES.length];
    const name = surname + firstname;
    const group = (i % 8) + 1; // 1 ~ 8 組
    const title = TITLES[i % TITLES.length];
    const offerList = OFFERS_BY_IND[ind] || OFFERS_BY_IND["其他多元領域"];
    const seekList = SEEKS_BY_IND[ind] || SEEKS_BY_IND["其他多元領域"];

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
