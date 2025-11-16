import { ApiResponse, FeedbackData } from '@/types';
import { fetchAuthSession } from 'aws-amplify/auth';

export class ConversationClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    model: string,
    userId?: string,
    feedback?: FeedbackData
  ): Promise<ApiResponse | null> {
    try {
      const payload: any = {
        prompt: content,
        conversation_id: conversationId,
        model
      };

      if (userId) {
        payload.user_id = userId;
      }

      if (feedback) {
        payload.feedback = feedback;
      }

      // Get JWT tokens from Cognito session
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const accessToken = session.tokens?.accessToken?.toString();

      console.log('Tokens available:', !!idToken, !!accessToken);
      if (!idToken || !accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/api/v1/invocations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Access-Token': accessToken,
        },
        body: JSON.stringify({ input: payload }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Extract from output wrapper
      if (result.output) {
        return {
          response: result.output.message || '',
          metadata: result.output.metadata || {},
          tools_used: result.output.tools_used || []
        };
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }

  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/${conversationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return null;
    }
  }

  async submitFeedback(runId: string, sessionId: string, score: number, comment: string = ''): Promise<boolean> {
    try {
      // Get JWT tokens from Cognito session
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!idToken || !accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/api/v1/invocations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Access-Token': accessToken,
        },
        body: JSON.stringify({
          input: {
            feedback: {
              run_id: runId,
              session_id: sessionId,
              score,
              comment
            }
          }
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return false;
    }
  }
}