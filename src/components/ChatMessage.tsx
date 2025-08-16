
import React from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex items-start gap-3 ${
        message.isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.isUser 
          ? 'bg-lanka-blue text-white' 
          : 'bg-lanka-green text-white'
      }`}>
        {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`flex-1 max-w-[80%] ${
        message.isUser ? 'text-right' : 'text-left'
      }`}>
        <div className={`inline-block p-3 rounded-lg break-words ${
          message.isUser
            ? 'bg-lanka-blue text-white rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}>
          <p className="text-sm whitespace-pre-line break-words overflow-wrap-anywhere">{message.text}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
