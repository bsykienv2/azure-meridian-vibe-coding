// =====================================================
// 📊 AZURE MERIDIAN - LEAD CAPTURE BACKEND (Code.gs)
// =====================================================
// Dán code này vào Google Apps Script (Tiện ích mở rộng → Apps Script)
// SAU ĐÓ: Deploy → New deployment → Web app → Anyone → Deploy
// =====================================================

// 🔧 CẤU HÌNH - THAY ĐỔI THEO THÔNG TIN CỦA BẠN
const SHEET_NAME = "Leads";
const SALES_EMAIL = "bsykien.ver2@gmail.com";

/**
 * Nhận dữ liệu Lead từ Frontend (POST request)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Dữ liệu từ frontend
    const timestamp   = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const name        = data.name        || "";
    const phone       = data.phone       || "";
    const email       = data.email       || "";
    const source      = data.source      || "Chatbot AI";
    const sessionId   = data.sessionId   || "";
    const chatHistory = data.chatHistory || "";
    const interest    = data.interest    || "";
    const intentLevel = data.intentLevel || "";

    // === LOGIC GỘP THEO SESSION ID ===
    // Tìm dòng có cùng Session ID → cập nhật thay vì tạo mới
    const sessionCol = 6; // Cột F = Session ID
    const lastRow = sheet.getLastRow();
    let existingRow = -1;

    if (sessionId && lastRow > 1) {
      const sessionRange = sheet.getRange(2, sessionCol, lastRow - 1, 1).getValues();
      for (let i = 0; i < sessionRange.length; i++) {
        if (sessionRange[i][0] === sessionId) {
          existingRow = i + 2; // +2 vì bắt đầu từ hàng 2 (hàng 1 là header)
          break;
        }
      }
    }

    // Chuẩn bị dữ liệu 9 cột
    const rowData = [timestamp, name, phone, email, source, sessionId, chatHistory, interest, intentLevel];

    if (existingRow > 0) {
      // ✅ Cập nhật dòng cũ (gộp theo Session ID)
      sheet.getRange(existingRow, 1, 1, 9).setValues([rowData]);
    } else {
      // ➕ Thêm dòng mới
      sheet.appendRow(rowData);
    }

    // 📧 Cảnh báo email nếu khách "hot"
    if (intentLevel.toLowerCase() === "hot") {
      sendHotLeadAlert({ name, phone, email, interest, timestamp });
    }

    // Trả về kết quả thành công
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Lead saved successfully!" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Trả về lỗi nếu có
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 📧 Gửi email cảnh báo khi phát hiện khách hàng "hot"
 */
function sendHotLeadAlert(lead) {
  const subject = "🔥 KHÁCH HÀNG NÓNG - CẦN LIÊN HỆ NGAY!";
  const body = 
    "📢 KHÁCH HÀNG NÓNG - CẦN LIÊN HỆ NGAY!\n\n" +
    "Tên: " + (lead.name || "Chưa rõ") + "\n" +
    "SĐT: " + (lead.phone || "Chưa rõ") + "\n" +
    "Email: " + (lead.email || "Chưa rõ") + "\n" +
    "Quan tâm: " + (lead.interest || "Chưa rõ") + "\n" +
    "Thời gian: " + lead.timestamp + "\n\n" +
    "⚡ Vui lòng liên hệ khách hàng này trong vòng 30 phút!\n\n" +
    "---\n" +
    "Hệ thống Azure Meridian AI Lead Capture";

  MailApp.sendEmail(SALES_EMAIL, subject, body);
}

/**
 * 🧪 Hàm test - Chạy thử để kiểm tra Sheet và Email
 * Nhấn nút ▶ (Run) để test
 */
function testDoPost() {
  const mockData = {
    postData: {
      contents: JSON.stringify({
        name: "Test User",
        phone: "0901234567",
        email: "test@example.com",
        source: "Chatbot AI",
        sessionId: "ses_test_123",
        chatHistory: "Khách: Tôi muốn mua tai nghe\nAI: Chào bạn! Chúng tôi có tai nghe ANC...",
        interest: "Tai nghe ANC Noise Cancelling",
        intentLevel: "hot"
      })
    }
  };
  
  const result = doPost(mockData);
  Logger.log(result.getContent());
}
