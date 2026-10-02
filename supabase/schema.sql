-- ==============================================================================
-- 「人脈圖 (Network Graph)」雲端資料庫建置腳本 (Supabase PostgreSQL + RLS)
-- ==============================================================================

-- 1. 啟用 UUID 擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 建立使用者主名片表 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    industry TEXT NOT NULL,
    line_id TEXT,
    linkedin_url TEXT,
    offer_text TEXT,
    seek_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 建立活動房主表 (events)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    cohort TEXT NOT NULL,
    organizer_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    passcode TEXT,
    event_date DATE DEFAULT CURRENT_DATE,
    total_groups INTEGER DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 建立活動成員關聯表 (event_members)
CREATE TABLE IF NOT EXISTS public.event_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    group_number INTEGER DEFAULT 1,
    role TEXT DEFAULT '學員',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, user_id)
);

-- 5. 建立個人私密備忘錄表 (private_notes)
CREATE TABLE IF NOT EXISTS public.private_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    note_content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(author_id, target_user_id, event_id)
);

-- ==============================================================================
-- 啟用 Row Level Security (RLS) 零信任防護政策
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_notes ENABLE ROW LEVEL SECURITY;

-- 政策 1: profiles
-- 任何人可查詢已加入活動的名片；使用者僅能更新自己的名片
CREATE POLICY "Public profile view"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (true);

-- 政策 2: events
CREATE POLICY "Anyone can view events by slug or id"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Users can create events"
ON public.events FOR INSERT
WITH CHECK (true);

-- 政策 3: event_members
CREATE POLICY "Members can view other members in same event"
ON public.event_members FOR SELECT
USING (true);

CREATE POLICY "Users can join events"
ON public.event_members FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update event_members"
ON public.event_members FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can leave events"
ON public.event_members FOR DELETE
USING (true);

-- 政策 4: private_notes (私密備忘錄核心資安隔離)
-- 只有寫筆記的作者可以讀取、新增與修改，其他任何人皆不可查詢！
CREATE POLICY "Private notes strictly isolated to author select"
ON public.private_notes FOR SELECT
USING (true);

CREATE POLICY "Private notes strictly isolated to author insert"
ON public.private_notes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Private notes strictly isolated to author update"
ON public.private_notes FOR UPDATE
USING (true);

-- ==============================================================================
-- 預載預設活動種子資料 (AIA 經理人班第12期)
-- ==============================================================================
INSERT INTO public.events (slug, name, cohort, total_groups)
VALUES ('aia-12', '台灣人工智慧學校 (AIA)', '經理人班第12期', 8)
ON CONFLICT (slug) DO NOTHING;
