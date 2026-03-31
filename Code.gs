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
 * Template HTML đẹp, thân thiện, nổi bật
 */
function sendHotLeadAlert(lead) {
  const subject = "🔥 KHÁCH HÀNG NÓNG — Cần liên hệ ngay!";

  const customerName = lead.name || "Chưa rõ";
  const customerPhone = lead.phone || "Chưa cung cấp";
  const customerEmail = lead.email || "Chưa cung cấp";
  const customerInterest = lead.interest || "Chưa xác định";
  const timeCapture = lead.timestamp || new Date().toLocaleString("vi-VN");

  const htmlBody = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f0eb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <!-- Container chính -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f0eb; padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <!-- ===== HEADER BANNER ===== -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a2332 0%, #2d4a7a 50%, #4a90d9 100%); padding:28px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:1px;">
                AZURE MERIDIAN
              </h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.7); font-size:12px; letter-spacing:2px; text-transform:uppercase;">
                Premium Tech Accessories
              </p>
            </td>
          </tr>

          <!-- ===== TIÊU ĐỀ CẢNH BÁO ===== -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <h2 style="margin:0; color:#c0392b; font-size:22px; font-weight:700;">
                🔥 Khách hàng nóng sắp đến!
              </h2>
            </td>
          </tr>

          <!-- ===== LỜI CHÀO ===== -->
          <tr>
            <td style="padding:0 40px 20px;">
              <p style="margin:0; color:#444; font-size:15px; line-height:1.6;">
                Xin chào đội Sales, 
              </p>
              <p style="margin:10px 0 0; color:#444; font-size:15px; line-height:1.6;">
                Hệ thống AI Chatbot vừa phát hiện một khách hàng <strong style="color:#c0392b;">tiềm năng cao</strong> đang rất quan tâm đến sản phẩm. Hãy liên hệ ngay! ⚡
              </p>
            </td>
          </tr>

          <!-- ===== QUOTE HIGHLIGHT ===== -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="border-left: 4px solid #e74c3c; background-color:#fdf2f2; padding:16px 20px; border-radius:0 8px 8px 0;">
                <p style="margin:0; color:#c0392b; font-size:14px; font-style:italic; line-height:1.5;">
                  Liên hệ khách hàng trong vòng <strong>30 phút</strong> để tối ưu tỷ lệ chuyển đổi! 🎯
                </p>
              </div>
            </td>
          </tr>

          <!-- ===== BẢNG THÔNG TIN KHÁCH HÀNG ===== -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fafafa; border-radius:12px; overflow:hidden; border: 1px solid #eee;">

                <!-- Row: Tên -->
                <tr>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; width:130px;">
                    <span style="color:#888; font-size:13px;">👤 Tên khách</span>
                  </td>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <strong style="color:#1a2332; font-size:15px;">${customerName}</strong>
                  </td>
                </tr>

                <!-- Row: SĐT -->
                <tr>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <span style="color:#888; font-size:13px;">📱 Số điện thoại</span>
                  </td>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <a href="tel:${customerPhone}" style="color:#2d4a7a; font-size:15px; font-weight:600; text-decoration:none;">
                      ${customerPhone}
                    </a>
                  </td>
                </tr>

                <!-- Row: Email -->
                <tr>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <span style="color:#888; font-size:13px;">📧 Email</span>
                  </td>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <a href="mailto:${customerEmail}" style="color:#2d4a7a; font-size:14px; text-decoration:none;">
                      ${customerEmail}
                    </a>
                  </td>
                </tr>

                <!-- Row: Quan tâm -->
                <tr>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <span style="color:#888; font-size:13px;">🛒 Quan tâm</span>
                  </td>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <span style="color:#333; font-size:14px;">${customerInterest}</span>
                  </td>
                </tr>

                <!-- Row: Mức độ -->
                <tr>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <span style="color:#888; font-size:13px;">🌡️ Mức độ</span>
                  </td>
                  <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                    <span style="display:inline-block; background: linear-gradient(135deg, #e74c3c, #c0392b); color:#fff; padding:4px 14px; border-radius:20px; font-size:13px; font-weight:700; letter-spacing:0.5px;">
                      🔥 HOT — Ưu tiên cao
                    </span>
                  </td>
                </tr>

                <!-- Row: Thời gian -->
                <tr>
                  <td style="padding:14px 20px;">
                    <span style="color:#888; font-size:13px;">🕐 Thời gian</span>
                  </td>
                  <td style="padding:14px 20px;">
                    <span style="color:#666; font-size:14px;">${timeCapture}</span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ===== CTA SECTION ===== -->
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0 0 8px; color:#666; font-size:13px; text-align:center;">
                Chúng mình đang chuẩn bị một đơn hàng tiềm năng. Hãy hành động ngay nhé!
              </p>
              <div style="background: linear-gradient(135deg, #fff8e1, #fff3cd); padding:20px; border-radius:12px; text-align:center;">
                <span style="font-size:28px;">🎉 🎯 🎁</span>
                <p style="margin:10px 0 0; color:#856404; font-size:14px; font-weight:600;">
                  Khách hàng này có khả năng mua hàng rất cao!
                </p>
              </div>
            </td>
          </tr>

          <!-- ===== NÚT GỌI NGAY (clickable) ===== -->
          <tr>
            <td style="padding:0 40px 32px; text-align:center;">
              <a href="tel:${customerPhone}" style="display:inline-block; background: linear-gradient(135deg, #27ae60, #2ecc71); color:#ffffff; padding:14px 40px; border-radius:30px; font-size:16px; font-weight:700; text-decoration:none; letter-spacing:0.5px; box-shadow: 0 4px 12px rgba(39,174,96,0.3);">
                📞 Gọi ngay cho ${customerName}
              </a>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="background-color:#f8f9fa; padding:20px 40px; text-align:center; border-top:1px solid #eee;">
              <p style="margin:0; color:#aaa; font-size:12px; line-height:1.5;">
                Email này được gửi tự động bởi hệ thống<br>
                <strong style="color:#888;">Azure Meridian AI Lead Capture</strong><br>
                <span style="color:#ccc;">Powered by AI Chatbot</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  // Gửi email HTML
  MailApp.sendEmail({
    to: SALES_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    body: "🔥 KHÁCH HÀNG NÓNG: " + customerName + " - SĐT: " + customerPhone + " - Quan tâm: " + customerInterest
  });
}

/**
 * 🧪 Hàm test - Chạy thử để kiểm tra Sheet và Email
 * Nhấn nút ▶ (Run) để test
 */
function testDoPost() {
  const mockData = {
    postData: {
      contents: JSON.stringify({
        name: "Nguyễn Văn Hùng",
        phone: "0912345678",
        email: "hung.nguyen@example.com",
        source: "Chatbot AI",
        sessionId: "ses_test_" + Date.now(),
        chatHistory: "Khách: Tôi muốn mua 2 tai nghe ANC ngay bây giờ\nAI: Chào anh Hùng! Chúng tôi có tai nghe ANC Wireless Headphones...",
        interest: "Tai nghe ANC Noise Cancelling",
        intentLevel: "hot"
      })
    }
  };
  
  const result = doPost(mockData);
  Logger.log(result.getContent());
}
