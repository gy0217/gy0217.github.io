
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatBubble from './components/ChatBubble';
import { Character, Message, AppState, UserProfile, GameTime, LocalSyncState } from './types';
import { CHARACTERS, INITIAL_USER_PROFILE, INITIAL_TIME, LOCATIONS } from './constants';
import { geminiService } from './services/geminiService';
import { fileSystemService } from './services/fileSystemService';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [characterList, setCharacterList] = useState<Character[]>(CHARACTERS);
  const [selectedCharId, setSelectedCharId] = useState<string>(CHARACTERS[0].char_id);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [localSync, setLocalSync] = useState<LocalSyncState>({ isConnected: false, folderName: '' });
  const [status, setStatus] = useState<AppState>('chatting');
  const [activeMode, setActiveMode] = useState<'phone' | 'out'>('phone');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(LOCATIONS[0].id);
  const [inputText, setInputText] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAdultMode, setIsAdultMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      const savedFolder = await fileSystemService.tryRestore();
      if (savedFolder) {
        setLocalSync({ isConnected: true, folderName: savedFolder });
        const diskData = await fileSystemService.loadFromDisk('save_data.json');
        if (diskData) {
          setUserProfile(diskData.userProfile || INITIAL_USER_PROFILE);
          setChatHistories(diskData.chatHistories || {});
          if (diskData.characterList) setCharacterList(diskData.characterList);
        }
      }
      setTimeout(() => setIsInitializing(false), 800);
    };
    init();
  }, []);

  useEffect(() => {
    if (isInitializing || !localSync.isConnected) return;
    const timer = setTimeout(async () => {
      const data = { userProfile, characterList, chatHistories, timestamp: Date.now() };
      await fileSystemService.saveToDisk('save_data.json', data);
      setLocalSync(prev => ({ ...prev, lastSave: Date.now() }));
    }, 2000);
    return () => clearTimeout(timer);
  }, [userProfile, characterList, chatHistories, localSync.isConnected, isInitializing]);

  const handleSend = async () => {
    if (!inputText.trim() || status === 'loading') return;
    
    const userMsg: Message = { role: 'user', content: inputText.trim(), timestamp: Date.now() };
    const char = characterList.find(c => c.char_id === selectedCharId)!;
    const history = chatHistories[selectedCharId] || [{ role: 'model', content: char.greeting_message, timestamp: Date.now() }];
    
    setChatHistories(prev => ({ ...prev, [selectedCharId]: [...history, userMsg] }));
    setInputText('');
    setStatus('loading');

    try {
      const aiText = await geminiService.generateResponse(char, userProfile, [...history, userMsg], 0.8, isAdultMode);
      let cleanText = aiText;
      const favMatch = aiText.match(/\[FAVORABILITY: ([+-]?\d+)\]/);
      if (favMatch) {
        const change = parseInt(favMatch[1]);
        cleanText = aiText.replace(favMatch[0], "").trim();
        setCharacterList(list => list.map(c => c.char_id === selectedCharId ? { ...c, favorability: Math.min(100, Math.max(0, c.favorability + change)) } : c));
      }
      setChatHistories(prev => ({ ...prev, [selectedCharId]: [...history, userMsg, { role: 'model', content: cleanText, timestamp: Date.now() }] }));
      setStatus('chatting');
    } catch { setStatus('error'); }
  };

  const handleTriggerEvent = async () => {
    setStatus('loading');
    const loc = LOCATIONS.find(l => l.id === selectedLocationId)!;
    try {
      const involved = [...characterList].sort((a,b) => b.favorability - a.favorability).slice(0, 3);
      const eventText = await geminiService.generateEventResponse(involved, userProfile, loc.name, INITIAL_TIME, 0.85, isAdultMode);
      
      const eventMsg: Message = { role: 'model', content: eventText, timestamp: Date.now(), isEvent: true };
      setChatHistories(prev => ({ ...prev, [selectedCharId]: [...(prev[selectedCharId] || []), eventMsg] }));
      setStatus('chatting');
      setActiveMode('phone');
    } catch { setStatus('error'); }
  };

  if (isInitializing) return (
    <div className="h-screen w-full bg-[#cedbe9] flex flex-col items-center justify-center font-mono">
      <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin mb-4"></div>
      <div className="text-[10px] tracking-[0.5em] uppercase text-black">PERSONA_INIT_...</div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#cedbe9] overflow-hidden">
      {/* 左侧：档案管理 */}
      <Sidebar 
        activeMode={activeMode}
        selectedCharId={selectedCharId} 
        onSelectCharacter={c => setSelectedCharId(c.char_id)}
        userProfile={userProfile}
        onUpdateUserProfile={setUserProfile}
        characterList={characterList}
        gameTime={INITIAL_TIME}
        localSync={localSync}
        onConnectFolder={() => fileSystemService.requestFolder().then(name => name && setLocalSync({isConnected:true, folderName:name}))}
        isAdultMode={isAdultMode} 
        onToggleAdultMode={setIsAdultMode}
        onGlobalReset={() => confirm("确定清除所有存档？") && window.location.reload()}
        selectedLocationId={selectedLocationId}
        onSelectLocation={setSelectedLocationId}
        onGoOut={handleTriggerEvent}
        status={status}
      />

      {/* 右侧：交互主区域 */}
      <main className="flex-1 flex flex-col bg-white/30 backdrop-blur-md relative">
        {/* 顶部：模式切换（核心指令所在） */}
        <header className="p-6 border-b border-black/5 flex justify-center">
          <div className="flex bg-black/5 p-1 rounded-sm gap-1 w-full max-w-lg shadow-inner">
            <button 
              onClick={() => setActiveMode('phone')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${activeMode === 'phone' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-black'}`}
            >
              <i className="fas fa-mobile-alt mr-2"></i> 手机私聊 (Table)
            </button>
            <button 
              onClick={() => setActiveMode('out')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${activeMode === 'out' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-black'}`}
            >
              <i className="fas fa-door-open mr-2"></i> 出门对峙 (World)
            </button>
          </div>
        </header>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6">
            {activeMode === 'out' && (
              <div className="p-6 bg-black text-white border-l-4 border-red-500 animate-fade-in shadow-xl">
                <span className="text-[8px] font-bold block mb-1 opacity-50 uppercase tracking-widest">Global Event Context</span>
                <p className="text-[12px] italic leading-relaxed">
                  你正身处于：{LOCATIONS.find(l => l.id === selectedLocationId)?.name}。
                  在侧边栏点击“前往该地点对峙”来触发你的豪门修罗场剧情。
                </p>
              </div>
            )}
            
            {(chatHistories[selectedCharId] || [{ role: 'model', content: characterList.find(c => c.char_id === selectedCharId)!.greeting_message, timestamp: Date.now() }]).map((msg, i) => (
              <ChatBubble key={i} message={msg} character={characterList.find(c => c.char_id === selectedCharId)!} />
            ))}
            
            {status === 'loading' && (
              <div className="flex items-center gap-2 px-2">
                <div className="w-1 h-1 bg-black animate-ping"></div>
                <div className="text-[9px] font-bold text-black tracking-[0.2em] uppercase opacity-40">Connecting to link...</div>
              </div>
            )}
          </div>
        </div>
        
        {/* 输入区域 */}
        <div className="p-8 border-t border-black/5 bg-white/20">
          <div className="max-w-2xl mx-auto flex gap-4">
            <textarea 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              onKeyDown={(e)=>e.key==='Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={activeMode === 'phone' ? "在这里输入对话..." : "描述你的动作，或下一步互动..."}
              className="flex-1 bg-white/60 p-4 text-[13px] border border-black/5 outline-none h-20 resize-none shadow-sm focus:bg-white transition-all focus:shadow-md" 
            />
            <button 
              onClick={handleSend} 
              disabled={status === 'loading' || !inputText.trim()} 
              className="px-10 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 active:scale-95 transition-all shadow-xl disabled:opacity-20"
            >发送</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
