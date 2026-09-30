import { UserProfile } from "../types/network";

/**
 * 瀏覽器端純前端圖片壓縮（保持高清晰度同時控制 Base64 體積在 200~400KB 以內）
 */
export function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // 優質縮放插值
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("圖片載入失敗"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("檔案讀取失敗"));
    reader.readAsDataURL(file);
  });
}

/**
 * 觸發名片或圖片下載至手機相簿 / 電腦資料夾
 */
export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 若學員未上傳實體名片，系統自動以 Canvas 渲染生成一張高解析商業數位名片（800x450）供下載與轉發
 */
export function generateDigitalBusinessCard(
  member: UserProfile,
  eventTitle = "台灣人工智慧學校 (AIA) 經理人班"
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 560;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve("");
      return;
    }

    // 1. 底色商務漸層
    const gradient = ctx.createLinearGradient(0, 0, 1000, 560);
    gradient.addColorStop(0, "#0f172a"); // slate-900
    gradient.addColorStop(1, "#1e293b"); // slate-800
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 560);

    // 2. 裝飾邊框與光暈
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)"; // emerald-500
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, 952, 512);

    // 頂部活動浮水印
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`✦ ${eventTitle}`, 50, 68);

    // 組別與角色徽章
    ctx.fillStyle = "#10b981";
    ctx.fillRect(800, 48, 150, 32);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`第 ${member.group} 組 • ${member.role}`, 875, 70);
    ctx.textAlign = "left";

    // 3. 姓名與現職資訊
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(member.name, 50, 150);

    ctx.fillStyle = "#38bdf8"; // sky-400
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`${member.company} ｜ ${member.title}`, 50, 195);

    // 產業領域標籤
    ctx.fillStyle = "rgba(51, 65, 85, 0.8)";
    ctx.fillRect(50, 215, 200, 32);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "16px sans-serif";
    ctx.fillText(`🏢 ${member.industry}`, 65, 237);

    // 分隔線
    ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 275);
    ctx.lineTo(950, 275);
    ctx.stroke();

    // 4. Offer & Seek 商業資源
    ctx.fillStyle = "#34d399"; // emerald-400
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("💎 能提供的資源 (Offer)：", 50, 315);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "18px sans-serif";
    ctx.fillText(member.offer || "暫未填寫，歡迎線上交流討論", 50, 348);

    ctx.fillStyle = "#38bdf8"; // sky-400
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("🎯 正在尋找的合作 (Seek)：", 50, 410);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "18px sans-serif";
    ctx.fillText(member.seek || "暫未填寫", 50, 443);

    // 5. 底部聯繫管道
    ctx.fillStyle = "#64748b";
    ctx.fillRect(50, 480, 900, 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`💬 LINE ID: ${member.lineId || "點擊名片加好友"}`, 70, 508);
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "right";
    ctx.fillText("人脈圖 Network Graph 官方認證電子名片", 930, 508);

    resolve(canvas.toDataURL("image/jpeg", 0.9));
  });
}

/**
 * 轉發名片（支援手機原生分享選單與 LINE Web 分享）
 */
export async function shareOrForwardCard(
  member: UserProfile,
  cardDataUrl?: string,
  eventTitle = "台灣人工智慧學校 (AIA)"
): Promise<{ success: boolean; method: string }> {
  const shareText = `這是【${member.name}】（${member.company} · ${member.title}）在「${eventTitle}」的專屬名片！\n💎 能提供資源：${member.offer}\n🎯 在尋找合作：${member.seek}\n💬 LINE ID: ${member.lineId}`;

  // 嘗試透過 Web Share API 分享圖檔或文字
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      if (cardDataUrl && cardDataUrl.startsWith("data:image")) {
        // 將 base64 轉換為 File 物件
        const res = await fetch(cardDataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${member.name}_名片.jpg`, { type: "image/jpeg" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${member.name} 的名片`,
            text: shareText,
            files: [file],
          });
          return { success: true, method: "native_file" };
        }
      }

      await navigator.share({
        title: `${member.name} 的名片`,
        text: shareText,
        url: window.location.href,
      });
      return { success: true, method: "native_text" };
    } catch (err) {
      // 使用者取消或瀏覽器限制，降級為 LINE 分享
      console.log("Web Share canceled or failed, fallback to LINE", err);
    }
  }

  // 降級：開啟 LINE 官方社群分享
  const encodedText = encodeURIComponent(
    `${shareText}\n\n👉 點此在 LINE 開啟全班人脈圖：${window.location.href}`
  );
  window.open(`https://line.me/R/share?text=${encodedText}`, "_blank");
  return { success: true, method: "line_url" };
}
