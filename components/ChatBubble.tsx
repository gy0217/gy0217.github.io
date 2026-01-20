
import React from 'react';
import { Message, Character } from '../types';

interface ChatBubbleProps {
  message: Message;
  character: Character;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, character }) => {
  const isAI = message.role === 'model';

  return (
    <div className={`w-full mb-6 animate-fade-in flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[90%] flex gap-2.5 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* 头像 - 白底极简灰色小人 */}
        <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center border shadow-sm ${isAI ? 'bg-white border-black/5' : 'bg-black border-black'}`}>
          {isAI ? (
            <i className={`fas ${character.avatar} text-slate-300 text-[9px]`}></i>
          ) : (
            <i className="fas fa-user text-white text-[9px]"></i>
          )}
        </div>

        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className="text-[7px] font-bold text-slate-400 mb-0.5 tracking-wider uppercase">
            {isAI ? character.name : 'ME'}
          </div>
          
          <div className={`relative p-3.5 text-[12px] leading-relaxed shadow-sm ${
            isAI 
              ? 'bg-white text-slate-700 border-l border-black/10' 
              : 'bg-black text-white border-r border-slate-800'
          }`}>
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
