import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, User, Bot } from 'lucide-react';
import { getChatResponseStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';

const AIStylist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Namaste! I'm Mira, your personal stylist at Kurti Times. How can I help you find the perfect outfit today?",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await getChatResponseStream(userMessage.text);
      
      const botMessageId = (Date.now() + 1).toString();
      
      // Initialize bot message
      setMessages(prev => [
        ...prev, 
        {
          id: botMessageId,
          role: 'model',
          text: '', // Start empty
          timestamp: new Date()
        }
      ]);

      let fullText = '';
      
      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: fullText } 
                : msg
            )
          );
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having a little trouble connecting to my fashion senses right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 bg-brand-700 text-white rounded-full shadow-lg hover:bg-brand-800 transition-all duration-300 hover:scale-110 flex items-center gap-2 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open AI Stylist"
      >
        <Sparkles className="h-6 w-6 text-gold-500" />
        <span className="font-semibold hidden md:inline">Ask Mira</span>
      </button>

      {/* Chat Interface */}
      <div 
        className={`fixed z-50 bottom-0 right-0 w-full sm:w-96 sm:bottom-6 sm:right-6 bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col transition-all duration-300 transform origin-bottom-right border border-gray-100 ${
          isOpen ? 'scale-100 opacity-100 h-[600px] max-h-[90vh]' : 'scale-0 opacity-0 h-0 w-0 overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="bg-brand-900 p-4 rounded-t-2xl flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-full">
              <Sparkles className="h-5 w-5 text-brand-700" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Mira</h3>
              <p className="text-xs text-brand-200">AI Fashion Stylist</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-brand-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-brand-100 text-brand-700' : 'bg-brand-700 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2.5">
               <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center flex-shrink-0">
                 <Bot className="h-5 w-5" />
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                 <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about outfits..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-700 text-white p-2 rounded-full hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIStylist;