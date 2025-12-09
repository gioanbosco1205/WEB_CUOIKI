import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ChatRequest, OpenRouterResponse } from '../../types/chat';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const BASE_URL = 'https://openrouter.ai/api/v1';

// --- HỖ TRỢ: LOẠI BỎ DẤU, CHỮ HOA/THƯỜNG ---
const normalizeText = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

// --- HÀM HỖ TRỢ: TÁCH NGÂN SÁCH TỪ CÂU HỎI NGƯỜI DÙNG ---
function extractBudgetFromQuery(query: string): {
  maxPrice?: number;
  minPrice?: number;
} {
  const lower = normalizeText(query);
  const numberMatch = query.match(/(\d+([.,]\d+)?)/);

  if (!numberMatch) return {};

  const rawNumber = numberMatch[1].replace('.', '').replace(',', '.');
  const numeric = parseFloat(rawNumber);
  if (isNaN(numeric)) return {};

  // Nếu câu có từ "triệu" → hiểu là triệu VNĐ
  const hasTrieu = lower.includes('triệu') || lower.includes('trieu');
  const value = hasTrieu ? numeric * 1_000_000 : numeric;

  // Dưới / nhỏ hơn
  if (
    lower.includes('dưới') ||
    lower.includes('nhỏ hơn') ||
    lower.includes('<') ||
    lower.includes('tối đa')
  ) {
    return { maxPrice: value };
  }

  // Trên / lớn hơn
  if (
    lower.includes('tren') ||
    lower.includes('lon hon') ||
    lower.includes('>') ||
    lower.includes('toi thieu')
  ) {
    return { minPrice: value };
  }

  // Không rõ là trên hay dưới → không filter để tránh hiểu sai
  return {};
}

// --- HÀM HỖ TRỢ: TÁCH DIỆN TÍCH TỪ CÂU HỎI ---
function extractAreaFromQuery(query: string): {
  maxArea?: number;
  minArea?: number;
} {
  const lower = normalizeText(query);
  const areaMatch = query.match(/(\d+)\s*(m2|m²|m vuong|m\^2)/i);
  if (!areaMatch) return {};

  const numeric = parseFloat(areaMatch[1]);
  if (isNaN(numeric)) return {};

  if (
    lower.includes('duoi') ||
    lower.includes('nho hon') ||
    lower.includes('<') ||
    lower.includes('toi da')
  ) {
    return { maxArea: numeric };
  }

  if (
    lower.includes('tren') ||
    lower.includes('lon hon') ||
    lower.includes('>') ||
    lower.includes('toi thieu')
  ) {
    return { minArea: numeric };
  }

  return {};
}

// --- HỖ TRỢ: NHẬN DIỆN LOẠI PHÒNG & TIỆN ÍCH TỪ CÂU HỎI ---
function extractPropertyTypesAndAmenities(query: string): {
  propertyTypes?: string[];
  amenities?: string[];
} {
  const lower = normalizeText(query);
  const types: string[] = [];
  const amenities: string[] = [];

  // Loại phòng (match với enum PropertyType)
  if (lower.includes('can ho mini')) {
    types.push('MINI_APARTMENT');
  }
  if (
    lower.includes('can ho') ||
    lower.includes('chung cu')
  ) {
    types.push('APARTMENT');
  }
  if (lower.includes('nha nguyen can')) {
    types.push('HOUSE');
  }
  if (
    lower.includes('ky tuc') ||
    lower.includes('ktx') ||
    lower.includes('tuc xa')
  ) {
    types.push('DORMITORY');
  }
  if (lower.includes('sleepbox')) {
    types.push('SLEEPBOX');
  }
  if (lower.includes('phong tro')) {
    types.push('ROOM');
  }

  // Tiện ích (match với enum Amenity)
  if (lower.includes('wifi') || lower.includes('wi fi') || lower.includes('internet')) {
    amenities.push('WiFi');
  }
  if (
    lower.includes('may lanh') ||
    lower.includes('dieu hoa') ||
    lower.includes('air condition')
  ) {
    amenities.push('AirConditioning');
  }
  if (
    lower.includes('bai do xe') ||
    lower.includes('cho dau xe') ||
    lower.includes('parking')
  ) {
    amenities.push('Parking');
  }
  if (
    lower.includes('thú cưng') ||
    lower.includes('thu cung') ||
    lower.includes('pet') ||
    lower.includes('pets')
  ) {
    amenities.push('PetsAllowed');
  }

  return {
    propertyTypes: types.length ? Array.from(new Set(types)) : undefined,
    amenities: amenities.length ? Array.from(new Set(amenities)) : undefined,
  };
}

// --- HÀM TÌM KIẾM DỮ LIỆU THÔNG MINH ---
async function findRelevantProperties(userQuery: string): Promise<string> {
  try {
    const { maxPrice, minPrice } = extractBudgetFromQuery(userQuery);
    const { maxArea, minArea } = extractAreaFromQuery(userQuery);
    const { propertyTypes, amenities } = extractPropertyTypesAndAmenities(userQuery);

    const hasPriceFilter = typeof maxPrice === 'number' || typeof minPrice === 'number';
    const hasAreaFilter = typeof maxArea === 'number' || typeof minArea === 'number';
    const hasTypeFilter = !!propertyTypes?.length;
    const hasAmenityFilter = !!amenities?.length;

    // Điều kiện tìm theo từ khoá
    const textWhere: any = {
      OR: [
        { name: { contains: userQuery, mode: 'insensitive' } },
        { description: { contains: userQuery, mode: 'insensitive' } },
        {
          location: {
            OR: [
              { city: { contains: userQuery, mode: 'insensitive' } },
              { state: { contains: userQuery, mode: 'insensitive' } },
              { address: { contains: userQuery, mode: 'insensitive' } }
            ]
          }
        }
      ]
    };

    // Điều kiện chỉ theo giá – dùng cho bước fallback
    const priceOnlyWhere: any = {};
    if (hasPriceFilter) {
      if (typeof maxPrice === 'number') {
        priceOnlyWhere.pricePerMonth = {
          ...(priceOnlyWhere.pricePerMonth || {}),
          lte: maxPrice,
        };
      }
      if (typeof minPrice === 'number') {
        priceOnlyWhere.pricePerMonth = {
          ...(priceOnlyWhere.pricePerMonth || {}),
          gte: minPrice,
        };
      }
    }

    // Điều kiện diện tích
    const areaWhere: any = {};
    if (hasAreaFilter) {
      areaWhere.squareFeet = {};
      if (typeof maxArea === 'number') {
        areaWhere.squareFeet.lte = maxArea;
      }
      if (typeof minArea === 'number') {
        areaWhere.squareFeet.gte = minArea;
      }
    }

    // Điều kiện loại phòng
    const typeWhere: any = {};
    if (hasTypeFilter) {
      typeWhere.propertyType = { in: propertyTypes };
    }

    // Điều kiện tiện ích
    const amenityWhere: any = {};
    if (hasAmenityFilter) {
      amenityWhere.amenities = { hasSome: amenities };
    }

    const structuredConds: any[] = [];
    if (hasPriceFilter) structuredConds.push(priceOnlyWhere);
    if (hasAreaFilter) structuredConds.push(areaWhere);
    if (hasTypeFilter) structuredConds.push(typeWhere);
    if (hasAmenityFilter) structuredConds.push(amenityWhere);

    const hasStructuredFilters = structuredConds.length > 0;

    let properties: any[] = [];

    // Ưu tiên chạy truy vấn theo các điều kiện cấu trúc (giá/diện tích/loại/tiện ích)
    if (hasStructuredFilters) {
      const structuredOnlyWhere =
        structuredConds.length === 1 ? structuredConds[0] : { AND: structuredConds };

      properties = await prisma.property.findMany({
        where: structuredOnlyWhere,
        include: { location: true },
        take: 10,
        orderBy: hasPriceFilter ? { pricePerMonth: 'asc' } : { id: 'desc' },
      });

      // Nếu vẫn không có, trả lời rõ ràng dựa trên filter
      if (properties.length === 0) {
        if (hasPriceFilter) {
          const priceStr =
            typeof maxPrice === 'number'
              ? `${maxPrice.toLocaleString('vi-VN')} VNĐ (giới hạn trên)`
              : `${minPrice!.toLocaleString('vi-VN')} VNĐ (giới hạn dưới)`;
          return `Hiện tại trong hệ thống KHÔNG có phòng nào thỏa điều kiện giá bạn đưa ra (~${priceStr}). Hãy nói rõ điều này với khách và đề nghị họ nới rộng khoảng giá hoặc khu vực.`;
        }
        if (hasTypeFilter) {
          return `Hiện tại trong hệ thống KHÔNG có loại phòng/nhà đúng tiêu chí bạn hỏi. Hãy gợi ý họ nới rộng loại phòng hoặc khu vực.`;
        }
        if (hasAreaFilter) {
          return `Hiện tại trong hệ thống KHÔNG có phòng nào thỏa điều kiện diện tích bạn đưa ra. Hãy gợi ý họ nới rộng diện tích.`;
        }
        if (hasAmenityFilter) {
          return `Hiện tại trong hệ thống KHÔNG có phòng nào thỏa các tiện ích yêu cầu. Hãy gợi ý họ nới rộng tiêu chí tiện ích.`;
        }
      }
    }

    // Nếu chưa có kết quả (hoặc không có filter cấu trúc) thì thử theo text (và vẫn giữ filter nếu có)
    if (properties.length === 0) {
      const combinedWhere: any = hasStructuredFilters ? { AND: [textWhere, ...structuredConds] } : textWhere;

      properties = await prisma.property.findMany({
        where: combinedWhere,
        include: {
          location: true,
        },
        take: 10,
      });
    }

    // Nếu không tìm thấy mà cũng không có filter giá → fallback lấy 3 phòng mới nhất
    if (properties.length === 0) {
      properties = await prisma.property.findMany({
        take: 3,
        include: { location: true },
        orderBy: { id: 'desc' }
      });
    }

    if (properties.length === 0) {
      return "Hiện tại hệ thống dữ liệu chưa có phòng nào.";
    }

    const contextText = properties.map((p, index) => {
      const locationStr = p.location 
        ? `${p.location.address}, ${p.location.city}, ${p.location.state}`
        : "Chưa cập nhật địa chỉ";
      
      const amenitiesStr = Array.isArray(p.amenities) ? p.amenities.join(', ') : "Cơ bản";

      return `
      [Phòng ${index + 1}]
      - Tên: ${p.name}
      - Giá thuê: ${p.pricePerMonth?.toLocaleString('vi-VN')} VNĐ/tháng
      - Địa chỉ: ${locationStr}
      - Tiện ích: ${amenitiesStr}
      - Mô tả: ${p.description?.substring(0, 200)}...
      `;
    }).join('\n----------------\n');

    return contextText;

  } catch (error) {
    console.error("Lỗi khi truy vấn Prisma:", error);
    return "";
  }
}

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT_TEMPLATE = `Bạn là Trợ lý Ảo (AI) chuyên hỗ trợ tìm phòng trọ.

**NHIỆM VỤ:**
Trả lời câu hỏi của khách hàng dựa trên danh sách phòng thực tế dưới đây.

**DỮ LIỆU PHÒNG TRỌ CỦA CHÚNG TÔI (CHỈ TƯ VẤN TRONG DANH SÁCH NÀY):**
{{ROOM_DATA}}

**QUY TẮC TRẢ LỜI:**
1. Giọng điệu: Thân thiện, nhiệt tình, xưng "mình" hoặc "em".
2. Nếu khách hỏi khu vực không có trong danh sách: Hãy khéo léo nói chưa có.
3. Khi báo giá: Phải dùng VNĐ.
4. Cuối câu trả lời: Nên gợi ý khách liên hệ xem phòng.
5. Tuyệt đối KHÔNG BỊA ra phòng không có trong dữ liệu trên.`;

class ChatController {
  
  async chatHandler(req: Request, res: Response): Promise<void> {
    try {
      const { messages, model = "deepseek/deepseek-chat" }: ChatRequest = req.body;

      if (!OPENROUTER_API_KEY) {
        res.status(500).json({
          success: false,
          error: "OPENROUTER_API_KEY chưa được cấu hình trên server.",
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ success: false, error: "Messages required" });
        return;
      }

      const lastUserMessage = messages[messages.length - 1].content;
      
      console.log(`🔍 Đang tìm phòng trong DB cho: "${lastUserMessage}"`);
      const roomContext = await findRelevantProperties(lastUserMessage);

      const dynamicSystemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{ROOM_DATA}}', roomContext);

      const conversation = [
        { role: 'system', content: dynamicSystemPrompt },
        ...messages.filter(m => m.role !== 'system')
      ];

      const openRouterResponse = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": req.headers.origin || 'http://localhost:3000',
          "X-Title": "Rental App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: conversation,
          temperature: 0.7, 
        })
      });

      if (!openRouterResponse.ok) {
        const errText = await openRouterResponse.text();
        throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errText}`);
      }

      const data: OpenRouterResponse = await openRouterResponse.json();
      
      res.json({
        success: true,
        reply: data.choices[0]?.message?.content || "Xin lỗi, mình không thể trả lời lúc này.",
        model: data.model,
        usage: data.usage,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Chat handler error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        reply: "Hệ thống đang bận, bạn vui lòng thử lại sau nhé."
      });
    }
  }

  async testConnection(req: Request, res: Response): Promise<void> {
    try {
        const count = await prisma.property.count();
        res.json({ success: true, message: `DB Connected. Total properties: ${count}` });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
  }

  healthCheck(req: Request, res: Response): void {
    res.json({ status: 'healthy' });
  }
}

export default new ChatController();