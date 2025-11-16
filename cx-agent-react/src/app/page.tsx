'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';
import { ConversationClient } from '@/lib/api-client';
import { AgentCoreClient } from '@/lib/agentcore-client';
import ChatMessage from '@/components/ChatMessage';
import Sidebar from '@/components/Sidebar';
import { Send, Loader2, LogOut } from 'lucide-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';

function ChatInterface() {
  // Session state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{[key: number]: {show: boolean, comment: string}}>({});
  const [showDetails, setShowDetails] = useState<{[key: number]: boolean}>({});

  // Configuration state
  const [model, setModel] = useState('bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0');
  const [useAgentCore, setUseAgentCore] = useState(false);
  const [agentRuntimeArn, setAgentRuntimeArn] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [authToken, setAuthToken] = useState('');

  // Get authenticated user from Amplify
  const { user } = useAuthenticator((context) => [context.user]);

  // Use Amplify's authenticated user ID
  useEffect(() => {
    if (user && !userId) {
      setUserId(user.userId || user.username || `user_${uuidv4().slice(0, 8)}`);
    }
  }, [user, userId]);

  // Initialize client based on configuration
  const getClient = () => {
    if (useAgentCore && agentRuntimeArn.trim() && authToken.trim()) {
      return new AgentCoreClient(agentRuntimeArn, region, authToken);
    }
    return new ConversationClient();
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    let currentConversationId = conversationId;
    if (!currentConversationId) {
      currentConversationId = uuidv4();
      setConversationId(currentConversationId);
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const client = getClient();
      let response;

      if (client instanceof AgentCoreClient) {
        response = await client.sendMessage(currentConversationId, input.trim(), model, userId);
      } else {
        response = await client.sendMessage(currentConversationId, input.trim(), model, userId);
      }

      if (response) {
        const metadata: any = {
          model,
          status: response.status || 'success',
        };

        if (response.tools_used && response.tools_used.length > 0) {
          metadata.tools_used = response.tools_used.join(',');
        }

        if (response.metadata) {
          Object.assign(metadata, response.metadata);
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: response.response || response.message || '',
          timestamp: new Date(),
          metadata,
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
        metadata: { status: 'error' },
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const client = getClient();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        model={model}
        setModel={setModel}
        userId={userId}
        setUserId={setUserId}
        conversationId={conversationId}
        onNewConversation={handleNewConversation}
        useAgentCore={useAgentCore}
        setUseAgentCore={setUseAgentCore}
        agentRuntimeArn={agentRuntimeArn}
        setAgentRuntimeArn={setAgentRuntimeArn}
        region={region}
        setRegion={setRegion}
        authToken={authToken}
        setAuthToken={setAuthToken}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                CX Agent
              </h1>
              <p className="text-sm text-gray-500">
                {user?.signInDetails?.loginId || user?.username || ''}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'user' ? (
                <div className="max-w-md">
                  <div className="bg-blue-500 text-white rounded-2xl px-4 py-2">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl w-full">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    {message.content || 'No response from agent'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                  {message.metadata?.tools_used && (
                    <div className="text-xs text-blue-600 mt-1">
                      🔧 Tools: {message.metadata.tools_used}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => setFeedbackState(prev => ({...prev, [index]: {show: !prev[index]?.show, comment: prev[index]?.comment || ''}}))}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    >
                      👍 Helpful
                    </button>
                    <button 
                      onClick={() => setFeedbackState(prev => ({...prev, [index]: {show: !prev[index]?.show, comment: prev[index]?.comment || ''}}))}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    >
                      👎 Not helpful
                    </button>
                    <button 
                      onClick={() => setShowDetails(prev => ({...prev, [index]: !prev[index]}))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Message Details
                    </button>
                  </div>
                  {feedbackState[index]?.show && (
                    <div className="mt-2 p-3 bg-white border border-gray-300 rounded-lg">
                      <textarea
                        value={feedbackState[index]?.comment || ''}
                        onChange={(e) => setFeedbackState(prev => ({...prev, [index]: {show: true, comment: e.target.value}}))}
                        placeholder="Optional feedback comment..."
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={2}
                      />
                      <button
                        onClick={() => {
                          console.log('Feedback submitted:', feedbackState[index]?.comment);
                          setFeedbackState(prev => ({...prev, [index]: {show: false, comment: ''}}));
                        }}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                  {showDetails[index] && (
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-300 rounded text-xs font-mono overflow-x-auto">
                      {message.metadata ? (
                        <pre>{JSON.stringify(message.metadata, null, 2)}</pre>
                      ) : (
                        <pre>{'{}'}</pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-gray-600">Thinking...</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-2 max-w-6xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span>→</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuthenticator((context) => [context.user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return <ChatInterface />;
}
