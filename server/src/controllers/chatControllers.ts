import { Request, Response } from 'express';
import { 
  ChatMessage, 
  ChatRequest, 
  ChatResponse, 
  OpenRouterResponse, 
  ModelInfo 
} from '../../types/chat';

const OPENROUTER_API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1';

// System prompt bằng tiếng Anh để tránh lỗi encoding
const SYSTEM_PROMPT = `You are a "Rental Assistant AI" - an intelligent and friendly assistant specializing in finding rental rooms in Vietnam.

**YOUR ROLE:**
1. Assist in finding rental rooms by area, price, area size
2. Advise on rental contracts and important terms
3. Answer questions about utilities, security, electricity and water
4. Advise students and working people
5. Compare areas and price ranges
6. Guide price negotiation and legal issues

**RESPONSE RULES:**
- Always respond in natural, friendly Vietnamese
- Use language suitable for student audience
- Ask for more information if needed to give accurate advice
- Provide practical advice
- If you don't know, be honest and suggest ways to find information

**RESPONSE FORMAT:**
- Use bullet points for lists
- Bold important points
- Provide specific examples when needed
- End with a question to continue support`;

class ChatController {
  /**
   * Xử lý request chat từ người dùng
   */
  async chatHandler(req: Request, res: Response): Promise<void> {
    console.log('🟢 === CHAT HANDLER STARTED ===');
    
    try {
      // Kiểm tra request body
      if (!req.body) {
        console.error('❌ No request body');
        const errorResponse: ChatResponse = {
          success: false,
          error: "No request body",
          reply: "Xin lỗi, không nhận được dữ liệu.",
          timestamp: new Date().toISOString()
        };
        res.status(400).json(errorResponse);
        return;
      }

      const { messages, model = "deepseek/deepseek-chat" }: ChatRequest = req.body;
      
      console.log('📨 Received chat request:', { 
        model, 
        messageCount: messages?.length,
        lastMessage: messages?.[messages.length - 1]?.content?.substring(0, 100)
      });

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        const errorResponse: ChatResponse = {
          success: false,
          error: "Messages array is required",
          reply: "Xin lỗi, không nhận được tin nhắn.",
          timestamp: new Date().toISOString()
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Thêm system message vào đầu
      const allMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages
      ];

      console.log('🚀 Calling OpenRouter API with', allMessages.length, 'messages');

      // Tạo request body với encoding đúng
      const requestBody = {
        model: model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 2000
      };

      console.log('📤 Request body prepared, length:', JSON.stringify(requestBody).length);

      // Gọi OpenRouter API với headers đúng
      const openRouterResponse = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": req.headers.origin || 'http://localhost:3000',
          "X-Title": "Rental Assistant",
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 OpenRouter response status:', openRouterResponse.status);
      
      if (!openRouterResponse.ok) {
        let errorText = '';
        try {
          errorText = await openRouterResponse.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        
        console.error('❌ OpenRouter API error:', {
          status: openRouterResponse.status,
          statusText: openRouterResponse.statusText,
          error: errorText.substring(0, 200)
        });
        
        let errorMessage = "Lỗi kết nối với AI service";
        if (openRouterResponse.status === 401) {
          errorMessage = "API key không hợp lệ";
        } else if (openRouterResponse.status === 429) {
          errorMessage = "Quá nhiều yêu cầu, vui lòng thử lại sau";
        }
        
        throw new Error(`${errorMessage} (${openRouterResponse.status})`);
      }

      const data: OpenRouterResponse = await openRouterResponse.json();
      
      console.log('✅ OpenRouter response received:', {
        model: data.model,
        usage: data.usage,
        responseLength: data.choices?.[0]?.message?.content?.length || 0
      });

      const reply = data.choices[0]?.message?.content || "Xin lỗi, tôi không thể tạo câu trả lời ngay lúc này.";
      
      const successResponse: ChatResponse = {
        success: true,
        reply: reply,
        model: data.model || model,
        usage: data.usage,
        timestamp: new Date().toISOString()
      };
      
      res.json(successResponse);
      console.log('🟢 Chat response sent successfully');

    } catch (error: any) {
      console.error('❌ Chat handler error:', error.message);
      console.error('❌ Error details:', error);
      
      // Fallback response đơn giản
      const fallbackResponse: ChatResponse = {
        success: false,
        error: error.message,
        reply: `Xin lỗi, có lỗi xảy ra: ${error.message}. Bạn có thể thử lại hoặc liên hệ hỗ trợ.`,
        timestamp: new Date().toISOString()
      };
      
      res.status(500).json(fallbackResponse);
    } finally {
      console.log('🔴 === CHAT HANDLER ENDED ===');
    }
  }

  /**
   * Kiểm tra kết nối OpenRouter API - VERSION ĐƠN GIẢN
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔄 Testing OpenRouter connection with simple request...');
      
      // Test đơn giản với model list
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Test response status:', response.status);
      
      if (response.ok) {
        res.json({ 
          success: true, 
          message: '✅ OpenRouter API connected successfully',
          status: response.status
        });
      } else {
        const errorText = await response.text();
        console.error('❌ API test error response:', errorText);
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('❌ OpenRouter test error:', error.message);
      res.json({ 
        success: false, 
        error: error.message,
        message: '❌ Failed to connect to OpenRouter API' 
      });
    }
  }

  /**
   * Health check
   */
  healthCheck(req: Request, res: Response): void {
    res.json({ 
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Chatbot API - Trợ lý tìm phòng trọ',
      version: '1.0.0',
      uptime: process.uptime()
    });
  }
}

export default new ChatController();