import { Request, Response } from "express";

export const chatHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ reply: "Không có tin nhắn gửi tới." });
      return;
    }

    const apiMessages = messages.map((msg: any) => ({
      role: msg.sender === "ChatGPT" ? "assistant" : "user",
      content: msg.message,
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Bạn là trợ lý AI thân thiện, chuyên hỗ trợ sinh viên tìm phòng trọ." },
          ...apiMessages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data); // 🔍 debug

    const reply = data.choices?.[0]?.message?.content?.trim() || "Mình chưa hiểu.";
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Đã xảy ra lỗi. Vui lòng thử lại." });
  }
};
