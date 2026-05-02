import { Request, Response, NextFunction } from 'express';
import { GrammarCheckRequest, GrammarCheckResponse, ContentSuggestionRequest, ContentSuggestionResponse, ApiResponse } from '../types';

/**
 * Grammar and spell check for text
 * Note: This is a placeholder implementation. In production, you would integrate with
 * services like LanguageTool, Grammarly API, or use OpenAI/Anthropic for grammar checking.
 */
export const checkGrammar = async (
  req: Request<{}, {}, GrammarCheckRequest>,
  res: Response<ApiResponse<GrammarCheckResponse>>,
  next: NextFunction
) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for grammar checking'
      });
    }

    // Basic grammar/spelling corrections (placeholder)
    // In production, integrate with LanguageTool API, Grammarly, or AI services
    const suggestions = performBasicGrammarCheck(text);
    const correctedText = applySuggestions(text, suggestions);

    // Log activity
    await logActivity(req, 'Grammar check performed');

    res.json({
      success: true,
      data: {
        originalText: text,
        correctedText,
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate content suggestions for gift card messages
 * Note: This is a placeholder implementation. In production, integrate with
 * OpenAI, Anthropic Claude, or other AI services for better suggestions.
 */
export const generateContentSuggestions = async (
  req: Request<{}, {}, ContentSuggestionRequest>,
  res: Response<ApiResponse<ContentSuggestionResponse>>,
  next: NextFunction
) => {
  try {
    const { context, occasion = 'general', tone = 'friendly' } = req.body;

    if (!context || context.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Context is required for content suggestions'
      });
    }

    // Generate suggestions based on occasion and tone
    const suggestions = generateMessageSuggestions(occasion, tone, context);

    // Log activity
    await logActivity(req, 'Content suggestions generated');

    res.json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enhance text with AI-powered improvements
 * Note: Placeholder for AI text enhancement. Integrate with AI services in production.
 */
export const enhanceText = async (
  req: Request<{}, {}, { text: string; style?: string }>,
  res: Response<ApiResponse<{ enhancedText: string }>>,
  next: NextFunction
) => {
  try {
    const { text, style = 'professional' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for enhancement'
      });
    }

    // Enhance text (placeholder - integrate with AI service)
    const enhancedText = enhanceTextWithStyle(text, style);

    // Log activity
    await logActivity(req, 'Text enhancement performed');

    res.json({
      success: true,
      data: {
        enhancedText
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

import { prisma } from '../lib/prisma';
import { GrammarSuggestion } from '../types';

/**
 * Basic grammar check (placeholder implementation)
 */
function performBasicGrammarCheck(text: string): GrammarSuggestion[] {
  const suggestions: GrammarSuggestion[] = [];

  // Common spelling mistakes
  const spellingErrors: Record<string, string> = {
    'recieve': 'receive',
    'occured': 'occurred',
    'untill': 'until',
    'seperate': 'separate',
    'definately': 'definitely',
    'occassion': 'occasion',
    'greatful': 'grateful',
    'acheive': 'achieve',
  };

  // Check for spelling errors
  const words = text.split(/\s+/);
  let offset = 0;

  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (spellingErrors[cleanWord]) {
      suggestions.push({
        offset,
        length: word.length,
        message: `Possible spelling error: "${cleanWord}"`,
        replacements: [spellingErrors[cleanWord]],
        type: 'spelling'
      });
    }
    offset += word.length + 1; // +1 for space
  });

  // Check for double spaces
  let doubleSpaceIndex = text.indexOf('  ');
  while (doubleSpaceIndex !== -1) {
    suggestions.push({
      offset: doubleSpaceIndex,
      length: 2,
      message: 'Extra space detected',
      replacements: [' '],
      type: 'style'
    });
    doubleSpaceIndex = text.indexOf('  ', doubleSpaceIndex + 2);
  }

  return suggestions;
}

/**
 * Apply suggestions to text
 */
function applySuggestions(text: string, suggestions: GrammarSuggestion[]): string {
  if (suggestions.length === 0) return text;

  let corrected = text;
  // Sort suggestions by offset in reverse to maintain correct positions
  const sorted = [...suggestions].sort((a, b) => b.offset - a.offset);

  sorted.forEach(suggestion => {
    if (suggestion.replacements.length > 0) {
      const before = corrected.substring(0, suggestion.offset);
      const after = corrected.substring(suggestion.offset + suggestion.length);
      corrected = before + suggestion.replacements[0] + after;
    }
  });

  return corrected;
}

/**
 * Generate message suggestions based on occasion and tone
 */
function generateMessageSuggestions(occasion: string, tone: string, context: string): string[] {
  const suggestions: Record<string, Record<string, string[]>> = {
    birthday: {
      formal: [
        'Wishing you a wonderful birthday filled with joy and success.',
        'May this special day bring you happiness and prosperity.',
        'Happy birthday! Wishing you all the best in the year ahead.'
      ],
      casual: [
        'Happy birthday! Hope your day is as awesome as you are!',
        'Another year older, another year wiser! Have a great birthday!',
        'Wishing you a birthday full of fun, laughter, and cake!'
      ],
      friendly: [
        'Happy birthday! Hope you have an amazing day celebrating!',
        'Wishing you a fantastic birthday filled with joy and laughter!',
        'Have a wonderful birthday! You deserve all the happiness today!'
      ],
      professional: [
        'Warmest wishes on your birthday. May this year bring you continued success.',
        'Happy birthday! Wishing you a year filled with achievements and growth.',
        'Best wishes on your birthday. May you enjoy health, happiness, and prosperity.'
      ]
    },
    holiday: {
      formal: [
        'Season\'s greetings and best wishes for a prosperous New Year.',
        'Wishing you joy and peace during this holiday season.',
        'May this holiday season bring you happiness and success.'
      ],
      casual: [
        'Happy holidays! Hope you have an awesome time celebrating!',
        'Enjoy the holiday season with family and friends!',
        'Wishing you a fun-filled holiday break!'
      ],
      friendly: [
        'Happy holidays! Hope you enjoy this special time with loved ones!',
        'Wishing you a wonderful holiday season filled with joy!',
        'Have a fantastic holiday! Enjoy every moment!'
      ],
      professional: [
        'Wishing you a joyful holiday season and a successful New Year.',
        'Happy holidays! May this season bring you peace and prosperity.',
        'Best wishes for a wonderful holiday season and a bright New Year.'
      ]
    },
    appreciation: {
      formal: [
        'Thank you for your exceptional work and dedication.',
        'Your contributions are greatly valued and appreciated.',
        'We are grateful for your outstanding performance and commitment.'
      ],
      casual: [
        'Thanks for being awesome! Really appreciate everything you do!',
        'You rock! Thanks for all your hard work!',
        'Big thanks for going above and beyond!'
      ],
      friendly: [
        'Thank you so much for all your help and support!',
        'Really appreciate everything you do! You\'re the best!',
        'Thanks for being such an amazing team player!'
      ],
      professional: [
        'Thank you for your valuable contributions to our team\'s success.',
        'Your hard work and dedication are sincerely appreciated.',
        'We appreciate your professionalism and commitment to excellence.'
      ]
    },
    general: {
      formal: [
        'Best wishes for your continued success.',
        'Wishing you all the best in your endeavors.',
        'May you achieve great things in the days ahead.'
      ],
      casual: [
        'Hope everything is going great for you!',
        'Wishing you all the best!',
        'Have an awesome day!'
      ],
      friendly: [
        'Hope you\'re doing well! Wishing you all the best!',
        'Sending positive vibes your way!',
        'Hope you have a wonderful day ahead!'
      ],
      professional: [
        'Wishing you continued success in your professional journey.',
        'Best regards for your ongoing achievements.',
        'May your efforts lead to great accomplishments.'
      ]
    }
  };

  const occasionMessages = suggestions[occasion.toLowerCase()] || suggestions.general;
  const toneMessages = occasionMessages[tone.toLowerCase()] || occasionMessages.friendly;

  return toneMessages;
}

/**
 * Enhance text with style (placeholder)
 */
function enhanceTextWithStyle(text: string, style: string): string {
  // This is a placeholder. In production, use AI services like OpenAI or Anthropic
  const styles: Record<string, (text: string) => string> = {
    professional: (t) => t.trim().replace(/\b\w/g, l => l.toUpperCase()),
    casual: (t) => t.toLowerCase(),
    formal: (t) => t.trim()
  };

  const enhancer = styles[style.toLowerCase()] || ((t: string) => t);
  return enhancer(text);
}

/**
 * Log activity
 */
async function logActivity(req: Request, description: string) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: req.user?.userId,
        action: 'VIEW',
        entityType: 'ai-service',
        description,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
  } catch (error) {
    // Silently fail - don't break the main flow
    console.error('Failed to log activity:', error);
  }
}
