import liff from "@line/liff";

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

let isLiffInitialized = false;

export async function initLiff(): Promise<{
  initialized: boolean;
  isInClient: boolean;
  isLoggedIn: boolean;
  profile: LiffUserProfile | null;
}> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId || liffId.trim() === "") {
    return {
      initialized: false,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
    };
  }

  try {
    if (!isLiffInitialized) {
      await liff.init({ liffId });
      isLiffInitialized = true;
    }

    const isInClient = liff.isInClient();
    const isLoggedIn = liff.isLoggedIn();

    let profile: LiffUserProfile | null = null;
    if (isLoggedIn) {
      const lineProfile = await liff.getProfile();
      profile = {
        userId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
        statusMessage: lineProfile.statusMessage,
      };
    }

    return {
      initialized: true,
      isInClient,
      isLoggedIn,
      profile,
    };
  } catch (error) {
    console.warn("LINE LIFF init error or not in LINE environment:", error);
    return {
      initialized: false,
      isInClient: false,
      isLoggedIn: false,
      profile: null,
    };
  }
}

export function lineLogin() {
  if (isLiffInitialized && !liff.isLoggedIn()) {
    liff.login();
  }
}

export function lineLogout() {
  if (isLiffInitialized && liff.isLoggedIn()) {
    liff.logout();
  }
}
