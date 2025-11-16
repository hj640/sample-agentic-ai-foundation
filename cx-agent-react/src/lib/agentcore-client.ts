import { ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class AgentCoreClient {
  private agentRuntimeArn: string;
  private region: string;
  private authToken?: string;

  constructor(agentRuntimeArn: string, region: string, authToken?: string) {
    this.agentRuntimeArn = agentRuntimeArn;
    this.region = region;
    this.authToken = authToken;
  }

  createConversation(userId: string): string {
    return uuidv4();
  }

  async sendMessage(
    conversationId: string,
    message: string,
    model?: string,
    userId?: string
  ): Promise<ApiResponse> {
    try {
      const escapedAgentArn = encodeURIComponent(this.agentRuntimeArn);
      const url = `https://bedrock-agentcore.${this.region}.amazonaws.com/runtimes/${escapedAgentArn}/invocations?qualifier=DEFAULT`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': conversationId,
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const payload: any = {
        input: {
          prompt: message,
          conversation_id: conversationId,
        },
      };

      if (userId) {
        payload.input.user_id = userId;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          response: result.output?.message || 'No response',
          status: 'success',
          tools_used: [],
        };
      } else {
        const errorText = await response.text();
        return {
          response: `Error (${response.status}): ${errorText}`,
          status: 'error',
          tools_used: [],
        };
      }
    } catch (error) {
      return {
        response: `Error: ${error}`,
        status: 'error',
        tools_used: [],
      };
    }
  }

  async submitFeedback(
    runId: string,
    sessionId: string,
    score: number,
    comment: string = ''
  ): Promise<boolean> {
    try {
      const escapedAgentArn = encodeURIComponent(this.agentRuntimeArn);
      const url = `https://bedrock-agentcore.${this.region}.amazonaws.com/runtimes/${escapedAgentArn}/invocations?qualifier=DEFAULT`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': sessionId,
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const payload = {
        input: {
          feedback: {
            run_id: runId,
            session_id: sessionId,
            score,
            comment,
          },
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return false;
    }
  }
}