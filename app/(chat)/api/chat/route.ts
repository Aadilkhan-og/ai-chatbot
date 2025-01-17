import {
  type Message,
  convertToCoreMessages,
  createDataStream,
  createDataStreamResponse,
  pipeDataStreamToResponse,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { customModel, imageGenerationModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import {
  codePrompt,
  systemPrompt,
  updateDocumentPrompt,
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather';

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const allTools: AllowedTools[] = [...blocksTools, ...weatherTools];

// import { createDataStream, createDataStreamResponse } from 'ai';
// import { auth } from '@/app/(auth)/auth';
// import { models } from '@/lib/ai/models';
// import { getChatById, saveChat, saveMessages } from '@/lib/db/queries';
// import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
// import { generateTitleFromUserMessage } from '../../actions';

// Function to call the Python API
const callPythonApi = async (params: { query: string }) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/agent/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to call Python API');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      start(controller) {
        async function push() {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(decoder.decode(value));
          push();
        }
        push();
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error('Error calling Python API:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const { id, messages, modelId }: { id: string; messages: Array<Message>; modelId: string } = await request.json();
    
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const model = models.find((model) => model.id === modelId);
    if (!model) {
      return new Response('Model not found', { status: 404 });
    }

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });
    let chatId = id;
    if (!chat) {
      const title = await generateTitleFromUserMessage({ message: userMessage });
      const res = await saveChat({ id, userId: session.user.id, title });
      if (res && 'id' in res) {
        chatId = res.id;
      }
    }

    const userMessageId = generateUUID();
    await saveMessages({ messages: [{ ...userMessage, createdAt: new Date(), chatId }] });

    // Call the Python API for streaming response
    const resultFromPythonApi = await callPythonApi({ query: userMessage.content as string });

    // Return the streamed result to the client
    return resultFromPythonApi;
  } catch (error) {
    console.error('Error handling POST request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
