# 每週天氣預測應用程式

這個小型專案提供一個每週天氣預報介面：

- 前端使用現代 CSS + JavaScript 展示 7 天天氣卡片（包含最高/最低溫、降雨量、天氣文字）。
- 使用 Open-Meteo 提供的地理搜尋與氣象 API（免費且無需 API 金鑰）。
- Node.js + Express 負責提供靜態資源與中繼 `/api/forecast`，確保前端無須直接跨域呼叫。

## 快速開始

1. 安裝依賴：
   ```bash
   npm install
   ```
2. 啟動伺服器（預設監聽 4173）：
   ```bash
   npm start
   ```
3. 透過 Codespaces/public URL（例如 `https://fluffy-garbanzo-w5xxxvgj6q4h555w-18789.app.github.dev`）訪問介面。

現在就輸入城市名稱或經緯度，就能取得該地的週預報。