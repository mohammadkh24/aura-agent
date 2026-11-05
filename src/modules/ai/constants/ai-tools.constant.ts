import Groq from 'groq-sdk';

export const AI_TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'Search for products in the store database. Use this tool when customers ask about products, prices, availability, stock, or product details.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Product name or search phrase.',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description:
        'Search the store knowledge base for information about shipping, returns, payment methods, warranties, store policies, and frequently asked questions.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The topic or question to search for.',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
];
