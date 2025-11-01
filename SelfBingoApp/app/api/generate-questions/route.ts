import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API endpoint (OpenAI-compatible)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI/OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const { count = 25, theme = 'identity and passport verification' } = await req.json();

    console.log(`🤖 Generating ${count} bingo questions with theme: ${theme}`);

    const prompt = `Generate exactly ${count} unique, engaging bingo questions for a decentralized identity verification game.

Theme: ${theme}

Requirements:
- Questions should be related to Self Protocol, identity verification, passports, citizenship, travel, or digital identity
- Each question should be concise (5-15 words)
- Questions should be verifiable through Self Protocol's identity verification system
- Mix of factual, yes/no, and verification-based questions
- Format: Return ONLY a JSON array of strings, no markdown, no explanation

Example format:
["Question 1?", "Question 2?", "Question 3?", ...]

Generate ${count} questions now:`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Self Bingo',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free', // Fast, free model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates bingo questions. Always respond with valid JSON arrays only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate questions', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response, removing any markdown code blocks if present
    let questions: string[];
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate we got the right number of questions
    if (!Array.isArray(questions) || questions.length !== count) {
      console.warn(`⚠️ Expected ${count} questions, got ${questions.length}`);
      // Trim or pad to exact count
      if (questions.length > count) {
        questions = questions.slice(0, count);
      } else {
        // Fallback questions to reach the count
        const fallbackQuestions = [
          "Have you verified your passport with Self Protocol?",
          "Is your identity verified on-chain?",
          "Do you have multiple nationalities?",
          "Have you traveled to more than 5 countries?",
          "Is your age verified through Self Protocol?",
        ];
        while (questions.length < count) {
          questions.push(fallbackQuestions[questions.length % fallbackQuestions.length]);
        }
      }
    }

    console.log(`✅ Generated ${questions.length} questions successfully`);

    return NextResponse.json({
      success: true,
      questions,
      model: data.model,
      usage: data.usage,
    });

  } catch (error: any) {
    console.error('❌ Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { count: 25, theme: "..." } to generate bingo questions',
    example: {
      method: 'POST',
      body: {
        count: 25,
        theme: 'identity and passport verification'
      }
    }
  });
}
