// A scripted stand-in for the Claude API, used only by end-to-end tests (STUDIO_AI_FAKE=1).
import type { AiClient } from '../core/ai.js';

export const fakeAi = (): AiClient => ({
  async create(req) {
    const last = req.messages[req.messages.length - 1]!;
    if (Array.isArray(last.content)) return { content: [{ type: 'text', text: 'I left that for you to decide.' }], stop_reason: 'end_turn' };
    const asked = String(last.content).split('---').pop()!.trim();
    const mode = /Mode: (\w+(?: \w+)?)/.exec(req.system)?.[1] ?? '';
    return {
      content: [
        { type: 'text', text: `(${mode}) You asked: ${asked}. One way it could be done: let the silence carry it.` },
        { type: 'tool_use', id: 'q1', name: 'suggest_question', input: { question: 'What does the silence cost him?' } },
      ],
      stop_reason: 'tool_use',
    };
  },
});
