
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');

    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are "Lanka Guide", an expert Sri Lankan travel assistant with comprehensive knowledge of Sri Lanka's destinations, culture, cuisine, transportation, accommodations, activities, and local experiences. You are passionate, knowledgeable, and provide practical advice to help travelers make the most of their Sri Lankan adventure.

IMPORTANT FORMATTING RULES:
- NEVER use asterisks (*) for emphasis or formatting
- Use clear, natural language without markdown formatting
- Write in a conversational, friendly tone
- Structure responses with clear paragraphs and natural breaks
- Use bullet points with dashes (-) only when listing multiple items

KNOWLEDGE AREAS:
- Historical and cultural sites (Sigiriya, Polonnaruwa, Kandy, Galle Fort, etc.)
- Natural attractions (Yala National Park, Horton Plains, Adam's Peak, beaches, etc.)
- Local cuisine and where to find the best food
- Transportation options (trains, buses, tuk-tuks, private drivers)
- Accommodation recommendations for all budgets
- Cultural etiquette and local customs
- Weather patterns and best travel times
- Hidden gems and off-the-beaten-path experiences
- Adventure activities (safari, hiking, surfing, etc.)
- Shopping and local markets
- Festivals and events

Always provide specific, actionable advice with location names, approximate costs when relevant, and practical tips. If you don't know something specific, be honest but offer related helpful information.

User question: ${message}

Provide a comprehensive, helpful response about Sri Lankan travel without using any asterisks or markdown formatting. Be specific, practical, and enthusiastic about Sri Lanka.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I couldn\'t generate a response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
