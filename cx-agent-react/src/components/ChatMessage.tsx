'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { ConversationClient } from '@/lib/api-client';
import { AgentCoreClient } from '@/lib/agentcore-client';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronRight, Wrench, BookOpen } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  client?: ConversationClient | AgentCoreClient;
  conversationId?: string | null;
}

export default function ChatMessage({ message, client, conversationId }: ChatMessageProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showPositiveFeedback, setShowPositiveFeedback] = useState(false);
  const [showNegativeFeedback, setShowNegativeFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const [showCitations, setShowCitations] = useState(false);

  const messageId = message.metadata?.message_id || `${message.timestamp.getTime()}_${message.content.slice(0, 10)}`;

  const handleFeedback = async (score: number, comment: string = '') => {
    if (!client || !conversationId) return;

    const success = await client.submitFeedback(messageId, conversationId, score, comment);
    if (success) {
      setFeedbackGiven(true);
      setShowPositiveFeedback(false);
      setShowNegativeFeedback(false);
      setFeedbackText('');
    }
  };

  const renderCitations = () => {
    if (!message.metadata?.citations) return null;

    try {
      const citations = typeof message.metadata.citations === 'string' 
        ? JSON.parse(message.metadata.citations) 
        : message.metadata.citations;

      if (!Array.isArray(citations) || citations.length === 0) return null;

      return (
        <div className="mt-4">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <BookOpen size={16} />
            Sources ({citations.length})
            {showCitations ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {showCitations && (
            <div className="mt-2 space-y-2">
              {citations.map((citation: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Source {index + 1}: {citation.source || 'Unknown'}</h4>
                      {citation.s3_uri && (
                        <p className="text-xs text-gray-600 mt-1 font-mono">{citation.s3_uri}</p>
                      )}
                    </div>
                    {citation.relevance_score && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Relevance</div>
                        <div className="text-sm font-medium">{parseFloat(citation.relevance_score).toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  const renderToolsUsed = () => {
    if (!message.metadata?.tools_used) return null;

    const toolsStr = message.metadata.tools_used;
    const tools = toolsStr.split(',').map(tool => tool.trim()).filter(Boolean);

    if (tools.length === 0) return null;

    return (
      <div className="mt-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
          <Wrench size={16} />
          Tools Used:
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-mono">
              {tool}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-message p-4 rounded-lg mb-4 ${
      message.role === 'user' 
        ? 'bg-blue-50 ml-8' 
        : 'bg-gray-50 mr-8'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="font-semibold text-sm">
          {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
        </div>
        <div className="text-xs text-gray-500">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      <div className="whitespace-pre-wrap text-gray-800 mb-3">
        {message.content}
      </div>

      {renderToolsUsed()}
      {renderCitations()}

      {/* Feedback section for assistant messages */}
      {message.role === 'assistant' && client && !feedbackGiven && (
        <div className="feedback-section mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Was this helpful?</div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowPositiveFeedback(!showPositiveFeedback)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              <ThumbsUp size={14} />
              Helpful
            </button>
            
            <button
              onClick={() => setShowNegativeFeedback(!showNegativeFeedback)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
            >
              <ThumbsDown size={14} />
              Not helpful
            </button>
          </div>

          {showPositiveFeedback && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <input
                type="text"
                placeholder="What was helpful about this response? (optional)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-2 text-sm border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleFeedback(1.0, feedbackText)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✓ Submit
                </button>
                <button
                  onClick={() => setShowPositiveFeedback(false)}
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showNegativeFeedback && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <textarea
                placeholder="How can we improve? (optional)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-2 text-sm border border-red-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleFeedback(0.0, feedbackText)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  📤 Submit Feedback
                </button>
                <button
                  onClick={() => setShowNegativeFeedback(false)}
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {feedbackGiven && message.role === 'assistant' && (
        <div className="mt-3 text-sm text-green-600">
          ✓ Feedback submitted
        </div>
      )}

      {/* Metadata section */}
      {message.metadata && Object.keys(message.metadata).length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showMetadata ? 'Hide' : 'Show'} Message Details
          </button>
          
          {showMetadata && (
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(message.metadata, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}