import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { ApiError } from "@/lib/auth";

export type StructuredAiRequest<TSchema extends z.ZodType> = {
  schema: TSchema;
  schemaName: string;
  systemPrompt: string;
  userPrompt: string;
};

export interface AiProvider {
  generateStructured<TSchema extends z.ZodType>(
    request: StructuredAiRequest<TSchema>,
  ): Promise<z.infer<TSchema>>;
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "OPENAI_API_KEY is required for AI generation.");
  }

  return new OpenAI({ apiKey });
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL || "gpt-5.5";
}

export const openAiProvider: AiProvider = {
  async generateStructured<TSchema extends z.ZodType>({
    schema,
    schemaName,
    systemPrompt,
    userPrompt,
  }: StructuredAiRequest<TSchema>) {
    const client = getOpenAIClient();

    const response = await client.responses.parse({
      model: getOpenAIModel(),
      instructions: systemPrompt,
      input: userPrompt,
      store: false,
      text: {
        format: zodTextFormat(schema, schemaName),
      },
    });

    if (!response.output_parsed) {
      throw new ApiError(502, "OpenAI did not return a valid structured response.");
    }

    return response.output_parsed;
  },
};

