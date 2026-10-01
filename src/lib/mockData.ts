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

export interface ScenarioTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultRoles: string[];
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: "training",
    name: "培訓研修班 (如 AIA / EMBA)",
    icon: "🎓",
    description: "適合學術與技術實戰課程，強調師長、助教與專案小組",
    defaultRoles: ["授課導師", "隨班助教", "組長幹部", "一般學員"],
  },
  {
    id: "networking",
    name: "商務人脈社團 (如 BNI / 扶輪社)",
    icon: "🤝",
    description: "適合商業引薦與商會聚會，強調幹部階層與貴賓引薦",
    defaultRoles: ["分會會長", "副會長", "執委幹部", "正式會員", "受邀貴賓"],
  },
  {
    id: "conference",
    name: "國際高峰論壇 / 年會",
    icon: "🎤",
    description: "適合大型會展，凸顯重量級講者、展商與大會志工",
    defaultRoles: ["特邀講者", "VIP 貴賓", "贊助廠商", "大會工作人員", "一般聽眾"],
  },
  {
    id: "hackathon",
    name: "新創黑客松 / Demo Day",
    icon: "💡",
    description: "適合新創競賽與媒合，強調評審、創投導師與戰隊隊員",
    defaultRoles: ["客座評審", "天使投資人", "技術導師", "戰隊隊長", "參賽隊員"],
  },
];

export const INITIAL_EVENTS: EventSpace[] = [
  {
    id: "aia-12",
    slug: "aia-12",
    title: "台灣人工智慧學校 (AIA)",
    cohort: "經理人班第12期",
    date: "2026/03",
    totalMembers: 55,
    totalGroups: 10,
    userRole: "第 9 組 學員",
    isCurrent: true,
    isDemoMode: true,
    customRoles: ["授課導師", "隨班助教", "組長幹部", "一般學員"],
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
    customRoles: ["客座導師", "隨班助教", "專案隊長", "實戰學員"],
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
    customRoles: ["特邀講者", "VIP 貴賓", "贊助廠商", "工作人員", "一般聽眾"],
  }
];

export const SAMPLE_CARD_TSMC = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
  <defs>
    <linearGradient id="tsmcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="600" height="350" rx="16" fill="url(#tsmcGrad)" stroke="#10b981" stroke-width="3"/>
  <rect x="35" y="32" width="6" height="42" fill="#f59e0b" rx="2"/>
  <text x="50" y="58" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffffff">TSMC 台灣積體電路製造</text>
  <text x="50" y="82" font-family="sans-serif" font-size="12" fill="#94a3b8">Taiwan Semiconductor Manufacturing Co., Ltd.</text>
  <line x1="35" y1="105" x2="565" y2="105" stroke="#334155" stroke-width="1.5"/>
  <text x="45" y="155" font-family="sans-serif" font-size="30" font-weight="bold" fill="#ffffff">林家豪 (Jason Lin)</text>
  <text x="45" y="190" font-family="sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">先進製程良率工程處 • 資深技術總監</text>
  <text x="45" y="235" font-family="sans-serif" font-size="13" fill="#cbd5e1">📍 新竹科學園區力行六路8號</text>
  <text x="45" y="262" font-family="sans-serif" font-size="13" fill="#cbd5e1">📧 jason.lin@tsmc.com  |  📱 +886 912-345-678</text>
  <rect x="45" y="285" width="140" height="26" rx="6" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1"/>
  <text x="60" y="303" font-family="sans-serif" font-size="12" font-weight="bold" fill="#34d399">💬 LINE: jason_tsmc</text>
</svg>
`);

export const SAMPLE_CARD_MSFT = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
  <rect width="600" height="350" rx="16" fill="#ffffff" stroke="#0284c7" stroke-width="3"/>
  <rect x="40" y="38" width="16" height="16" fill="#f25022"/>
  <rect x="60" y="38" width="16" height="16" fill="#7fba00"/>
  <rect x="40" y="58" width="16" height="16" fill="#00a4ef"/>
  <rect x="60" y="58" width="16" height="16" fill="#ffb900"/>
  <text x="90" y="60" font-family="sans-serif" font-size="24" font-weight="bold" fill="#0f172a">Microsoft 台灣微軟</text>
  <line x1="40" y1="95" x2="560" y2="95" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="45" y="150" font-family="sans-serif" font-size="30" font-weight="bold" fill="#0f172a">黃怡君 (Emily Huang)</text>
  <text x="45" y="185" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7">雲端與 AI 解決方案架構事業部 • 副總經理</text>
  <text x="45" y="235" font-family="sans-serif" font-size="13" fill="#64748b">📍 台北市信義區忠孝東路五段68號18樓</text>
  <text x="45" y="262" font-family="sans-serif" font-size="13" fill="#64748b">📧 emily.huang@microsoft.com  |  📱 +886 928-888-999</text>
  <rect x="45" y="285" width="150" height="26" rx="6" fill="#0284c7" fill-opacity="0.1" stroke="#0284c7" stroke-width="1"/>
  <text x="60" y="303" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0284c7">💬 LINE: emily_msft</text>
</svg>
`);

export const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
];

export const CURRENT_USER_DEFAULT: UserProfile = {
  id: "user-kevin",
  name: "陳志豪 (Kevin)",
  surname: "陳",
  company: "台積電 TSMC",
  title: "資深 AI 專案工程師",
  industry: "半導體與硬體",
  group: 9,
  role: "學員",
  avatarUrl: SAMPLE_AVATARS[0],
  businessCardUrl: SAMPLE_CARD_TSMC,
  mediaType: "card",
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

  // 1. 特邀授課導師 (講師身分，巡迴指導)
  result.push({
    id: "member-teacher-1",
    name: "李宏毅 講座教授",
    surname: "李",
    company: "台灣人工智慧學校 (AIA) / 台大電機資訊",
    title: "特聘校務講座導師 / 教授",
    industry: "人工智慧與數據",
    group: 0,
    role: "講師",
    lineId: "prof_lee_ai",
    linkedinUrl: "https://linkedin.com/in/hung-yi-lee",
    offer: "前瞻生成式 AI 技術藍圖、大模型私有化與科研落地輔導",
    seek: "促進台灣產業 AI 深度賦能、產學前沿研究課題交流",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    businessCardUrl: SAMPLE_CARD_MSFT,
    mediaType: "avatar",
    isCurrentUser: false,
  });

  result.push({
    id: "member-teacher-2",
    name: "張智星 博士",
    surname: "張",
    company: "台灣人工智慧學校 (AIA) / 首席技術顧問",
    title: "資深產業客座導師",
    industry: "專業顧問與創投",
    group: 0,
    role: "講師",
    lineId: "dr_chang_advisor",
    linkedinUrl: "https://linkedin.com/in/dr-chang-ai",
    offer: "智慧製造與音訊影像演算法架構、企業 AI 轉型戰略諮詢",
    seek: "半導體與先進製造場域之商業驗證合作",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    businessCardUrl: SAMPLE_CARD_TSMC,
    mediaType: "card",
    isCurrentUser: false,
  });

  // 2. 隨班助教團隊 (助教身分，巡迴指導)
  result.push({
    id: "member-ta-1",
    name: "林建志 (Ken)",
    surname: "林",
    company: "AIA 助教團隊 / 聯發科技 AI 研發",
    title: "班級總助教 (Head TA)",
    industry: "半導體與硬體",
    group: 0,
    role: "助教",
    lineId: "ken_head_ta",
    linkedinUrl: "https://linkedin.com/in/ken-lin-ta",
    offer: "PyTorch 深度學習訓練除錯、GPU 算力集群排程架構",
    seek: "協助 1~10 組確認期末專題題目可行性與技術選型",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    mediaType: "avatar",
    isCurrentUser: false,
  });

  result.push({
    id: "member-ta-2",
    name: "陳怡萱 (Sandy)",
    surname: "陳",
    company: "AIA 助教團隊 / 國泰金控數據架構師",
    title: "隨班實務助教",
    industry: "金融科技與金控",
    group: 0,
    role: "助教",
    lineId: "sandy_ta_nlp",
    linkedinUrl: "https://linkedin.com/in/sandy-chen-ta",
    offer: "金融 RAG 知識庫搭建、合規風控模型設計指導",
    seek: "輔導各組實作進度與期末專案發表演練",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    mediaType: "avatar",
    isCurrentUser: false,
  });

  result.push({
    id: "member-ta-3",
    name: "王冠傑 (Eric)",
    surname: "王",
    company: "AIA 助教團隊 / 趨勢科技 AI 資安工程師",
    title: "技術實驗室助教",
    industry: "軟體與雲端運算",
    group: 0,
    role: "助教",
    lineId: "eric_ta_cloud",
    linkedinUrl: "https://linkedin.com/in/eric-wang-ta",
    offer: "Docker 容器化環境建置、AI API 資安滲透防護",
    seek: "提供學員雲端沙盒與實作環境疑難排解",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
    mediaType: "avatar",
    isCurrentUser: false,
  });

  // 3. 各組學員與組長
  for (let i = 2; i <= 50; i++) {
    const ind = INDUSTRIES[i % INDUSTRIES.length];
    const compList = COMPANIES_BY_IND[ind] || COMPANIES_BY_IND["其他多元領域"];
    const company = compList[i % compList.length];
    const surname = SURNAMES[i % SURNAMES.length];
    const firstname = FIRSTNAMES[i % FIRSTNAMES.length];
    const name = surname + firstname;
    const group = (i % 10) + 1; // 1 ~ 10 組
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
      avatarUrl: SAMPLE_AVATARS[i % SAMPLE_AVATARS.length],
      businessCardUrl: i % 4 === 0 ? SAMPLE_CARD_TSMC : i % 5 === 0 ? SAMPLE_CARD_MSFT : undefined,
      mediaType: (i % 4 === 0 || i % 5 === 0) ? "card" : "avatar",
      isCurrentUser: false
    });
  }

  return result;
}
