import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  FolderKanban,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  User,
  CornerDownLeft
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { processCaseQuery } from '../utils/aiEngine';

export const AiAssistantPage = () => {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    activeCaseEntities,
    activeCaseRelationships
  } = useCaseContext();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `### CIPERX Investigation Query Assistant (Prototype Engine)\n\n` +
        `I am a local rule-and-data inquiry system connected to active case **${activeCase?.id || 'None'}**.\n\n` +
        `You can query verified entities, count evidence items, inspect recorded links, and review transaction records.\n\n` +
        `*Select a suggested evidentiary prompt below or type a query.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    // Simulate realistic analytical retrieval latency (350ms)
    setTimeout(() => {
      const response = processCaseQuery(
        text,
        activeCase,
        activeCaseEntities,
        activeCaseRelationships
      );

      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: response.text,
        disclaimer: response.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 380);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Ready for evidentiary questions regarding case **${activeCase?.id || 'selected case'}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    'Summary of this case',
    'How many evidence items are recorded?',
    'What relationships have been recorded?',
    'Show all financial transactions',
    'List all persons and phone lines',
    'Which entities are connected to Vikram Malhotra?'
  ];

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Top Header & Case Context */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#243447] flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#3478C9]" />
            Evidentiary AI Assistant
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Transparent deterministic local query engine for Case: {activeCase?.id} ({activeCase?.name})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cases.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#F2F7FC] border border-[#D7E4F0] rounded-md px-2.5 py-1.5 text-xs">
              <span className="font-semibold text-[#64748B]">Active Case:</span>
              <select
                value={activeCaseId}
                onChange={(e) => setActiveCaseId(e.target.value)}
                className="bg-transparent font-bold text-[#243447] focus:outline-hidden cursor-pointer"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={handleClearHistory}
            title="Clear conversation history"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Transparent Disclaimer Banner */}
      <div className="p-3 bg-[#EAF4FC] rounded-lg border border-[#B9D7F2] text-xs text-[#243447] flex items-start gap-2.5 shrink-0">
        <ShieldAlert className="w-4 h-4 text-[#3478C9] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Investigation Assistant Notice:</span> This local prototype answers questions strictly using saved case records. It does not determine guilt, fabricate facts, or access external intelligence databases.
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 bg-white rounded-lg border border-[#D7E4F0] shadow-xs p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-[#3478C9] text-white'
                    : 'bg-[#EAF4FC] text-[#2866AE] border border-[#B9D7F2]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-lg p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#3478C9] text-white shadow-xs'
                    : 'bg-[#F2F7FC] border border-[#D7E4F0] text-[#243447]'
                }`}
              >
                {/* Message Content formatted with line breaks */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return (
                        <div key={i} className="font-bold text-sm text-[#243447] mt-1 mb-1">
                          {line.replace('### ', '')}
                        </div>
                      );
                    }
                    if (line.startsWith('• ')) {
                      return (
                        <div key={i} className="pl-2">
                          {line}
                        </div>
                      );
                    }
                    return <div key={i}>{line}</div>;
                  })}
                </div>

                <div
                  className={`mt-2 text-[10px] text-right ${
                    isUser ? 'text-white/70' : 'text-[#94A3B8]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#EAF4FC] text-[#2866AE] border border-[#B9D7F2] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 bg-[#F2F7FC] border border-[#D7E4F0] rounded-lg text-xs text-[#64748B] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#3478C9] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#3478C9] rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#3478C9] rounded-full animate-bounce [animation-delay:0.3s]" />
              <span>Analyzing local case evidentiary records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="text-[11px] font-semibold text-[#64748B] shrink-0">
          Suggested Queries:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded bg-white hover:bg-[#EAF4FC] hover:text-[#2866AE] border border-[#D7E4F0] text-[11px] text-[#243447] transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] p-2.5 shadow-xs shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about entities, phones, transactions, or connections in this case..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
          />
          <Button
            type="submit"
            variant="primary"
            icon={Send}
            disabled={!inputMessage.trim() || isLoading}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
