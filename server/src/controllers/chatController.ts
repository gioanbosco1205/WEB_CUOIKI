import { Request, Response } from "express";

export const chatHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ reply: "Không có tin nhắn gửi tới." });
      return;
    }

    // Dummy reply cho test frontend
    res.json({ reply: "Xin chào! Đây là phản hồi thử nghiệm từ server." });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Đã xảy ra lỗi. Vui lòng thử lại." });
  }
};

