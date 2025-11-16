'use client';

import { useState } from 'react';
import { Settings, MessageSquare, User, Zap } from 'lucide-react';

interface SidebarProps {
  model: string;
  setModel: (model: string) => void;
  userId: string;
  setUserId: (userId: string) => void;
  conversationId: string | null;
  onNewConversation: () => void;
  useAgentCore: boolean;
  setUseAgentCore: (use: boolean) => void;
  agentRuntimeArn: string;
  setAgentRuntimeArn: (arn: string) => void;
  region: string;
  setRegion: (region: string) => void;
  authToken: string;
  setAuthToken: (token: string) => void;
}

const models = [
  'bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0',
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'bedrock/anthropic.claude-3-5-sonnet-20240620-v1:0',
  'bedrock/anthropic.claude-3-5-haiku-20241022-v1:0',
];

const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

export default function Sidebar({
  model,
  setModel,
  userId,
  setUserId,
  conversationId,
  onNewConversation,
  useAgentCore,
  setUseAgentCore,
  agentRuntimeArn,
  setAgentRuntimeArn,
  region,
  setRegion,
  authToken,
  setAuthToken,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const configValid = useAgentCore ? (agentRuntimeArn.trim() && authToken.trim()) : true;

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-100 border-r border-gray-200 p-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full p-2 text-gray-600 hover:bg-gray-200 rounded"
        >
          <Settings size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-100 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Settings size={16} />
          Configuration
        </h2>
      </div>

      {/* Backend Selection */}
      <div className="mb-6">
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={useAgentCore}
            onChange={(e) => setUseAgentCore(e.target.checked)}
            className="rounded w-4 h-4"
          />
          <span className="text-sm">Use AWS AgentCore</span>
        </label>
      </div>

      {/* AgentCore Configuration */}
      {useAgentCore && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Agent Runtime ARN
          </label>
          <input
            type="text"
            value={agentRuntimeArn}
            onChange={(e) => setAgentRuntimeArn(e.target.value)}
            placeholder="inggraph_cx_agent-cUnPj032Vi"
            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      )}

      <div className="border-t border-gray-300 pt-4 mb-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">
          Configuration
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">
          Conversation
        </h3>
        
        <button
          onClick={onNewConversation}
          className="w-full p-2.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
        >
          New Conversation
        </button>
      </div>
    </div>
  );
}