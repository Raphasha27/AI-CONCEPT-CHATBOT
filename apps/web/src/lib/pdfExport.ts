import jsPDF from "jspdf";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function exportChatToPDF(messages: Message[], sessionTitle: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageW = doc.internal.pageSize.getWidth();
  let y = margin;

  // Header
  doc.setFillColor(0, 122, 77);
  doc.rect(0, 0, pageW, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("VerifyZA Chat Export", margin, 38);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Session: ${sessionTitle}   |   Exported: ${new Date().toLocaleString("en-ZA")}`,
    margin,
    52
  );

  y = 80;

  doc.setTextColor(30, 30, 30);

  messages.forEach((msg) => {
    const isUser = msg.role === "user";
    const label = isUser ? "You" : "VerifyZA AI";
    const bgColor: [number, number, number] = isUser ? [235, 250, 245] : [245, 245, 248];

    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isUser ? 0 : 90, isUser ? 122 : 90, isUser ? 77 : 100);
    doc.text(label, margin, y);
    y += 14;

    // Content box
    const textLines = doc.splitTextToSize(
      msg.content.replace(/\*\*/g, "").replace(/\*/g, ""),
      pageW - margin * 2 - 20
    );
    const boxH = textLines.length * 14 + 12;

    doc.setFillColor(...bgColor);
    doc.roundedRect(margin, y, pageW - margin * 2, boxH, 6, 6, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(textLines, margin + 10, y + 14);

    y += boxH + 16;

    // Page break
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = margin;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "VerifyZA — AI Compliance Verification Platform | South Africa",
    margin,
    doc.internal.pageSize.getHeight() - 20
  );

  doc.save(`VerifyZA_Chat_${sessionTitle.slice(0, 30)}_${Date.now()}.pdf`);
}
