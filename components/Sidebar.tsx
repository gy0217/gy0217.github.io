
import React, { useState } from 'react';
import { Character, UserProfile, GameTime, LocalSyncState } from '../types';
import { LOCATIONS } from '../constants';

interface SidebarProps {
  activeMode: 'phone' | 'out';
  selectedCharId: string;
  onSelectCharacter: (char: Character) => void;
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  onGoOut: () => void;
  status: 'chatting' | 'loading' | 'error';
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  characterList: Character[];
  gameTime: GameTime;
  isAdultMode: boolean;
  onToggleAdultMode: (val: boolean) => void;
  onGlobalReset: () => void;
  localSync: LocalSyncState;
  onConnectFolder: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeMode,
  selectedCharId,
  onSelectCharacter,
  selectedLocationId,
  onSelectLocation,
  onGoOut,
  status,
  userProfile,
  onUpdateUserProfile,
  characterList,
  gameTime,
  isAdultMode,
  onToggleAdultMode,
  onGlobalReset,
  localSync,
  onConnectFolder
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'profile' | 'system'>('roster');

  return (
    <div className="w-80 h-full bg-[#ebebeb] border-r border-black/5 flex flex-col overflow-hidden z-20 shadow-2xl">
      {/* 侧栏顶 */}
      <div className="p-6 border-b border-black/5 bg-white/20">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[7px] font-bold tracking-[0.4em] ${localSync.isConnected ? 'text-blue-500' : 'text-slate-400'}`}>
            {localSync.isConnected ? `FOLDER_SYNCED` : 'LOCAL_STORAGE_ONLY'}
          </span>
          <div className="w-1.5 h-1.5 bg-black"></div>
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-light text-black tracking-tighter">PROJECT_P</h1>
          <span className="text-[8px] font-bold text-slate-400 bg-black/5 px-1">{gameTime.month}月剧情</span>
        </div>
      </div>

      {/* 侧栏切卡 */}
      <div className="flex border-b border-black/5 bg-white/10">
        <button onClick={() => setActiveTab('roster')} className={`flex-1 py-3 text-[9px] font-bold tracking-widest transition-all ${activeTab === 'roster' ? 'text-black bg-white border-b border-black' : 'text-slate-400'}`}>
          {activeMode === 'phone' ? '人物' : '地点'}
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 text-[9px] font-bold tracking-widest transition-all ${activeTab === 'profile' ? 'text-black bg-white border-b border-black' : 'text-slate-400'}`}>档案</button>
        <button onClick={() => setActiveTab('system')} className={`flex-1 py-3 text-[9px] font-bold tracking-widest transition-all ${activeTab === 'system' ? 'text-black bg-white border-b border-black' : 'text-slate-400'}`}>系统</button>
      </div>

      {/* 侧栏主体 */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {activeTab === 'roster' && (
          <div className="space-y-6 animate-fade-in">
            {activeMode === 'phone' ? (
              <div className="space-y-1.5">
                {characterList.map(char => (
                  <button key={char.char_id} onClick={() => onSelectCharacter(char)} className={`w-full text-left p-4 transition-all border flex gap-4 items-center ${selectedCharId === char.char_id ? 'bg-white border-black/20 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-white/40'}`}>
                    <div className={`w-7 h-7 flex items-center justify-center border ${selectedCharId === char.char_id ? 'bg-black text-white' : 'bg-white text-slate-300'}`}>
                      <i className={`fas ${char.avatar} text-[10px]`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold">{char.name}</span>
                        <span className="text-[7px] font-mono opacity-50">{char.favorability}%</span>
                      </div>
                      <div className="w-full h-0.5 bg-slate-100 mt-1">
                        <div className="h-full bg-black transition-all duration-700" style={{ width: `${char.favorability}%` }}></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  {LOCATIONS.map(loc => (
                    <button key={loc.id} onClick={() => onSelectLocation(loc.id)} className={`w-full text-left p-4 border transition-all ${selectedLocationId === loc.id ? 'bg-white border-black shadow-md' : 'border-transparent opacity-50 hover:opacity-100 hover:bg-white/40'}`}>
                      <div className="text-[9px] font-bold uppercase tracking-widest">{loc.name}</div>
                      <div className="text-[7px] opacity-60 mt-0.5 truncate">{loc.desc}</div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={onGoOut} 
                  disabled={status === 'loading'} 
                  className="w-full py-5 bg-black text-white text-[9px] font-bold tracking-[0.4em] active:scale-95 disabled:opacity-30 shadow-2xl transition-all"
                >前往此地点对峙</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-5 animate-fade-in text-[10px]">
            <div className="space-y-1">
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">User_Name</span>
              <input type="text" value={userProfile.name} onChange={e => onUpdateUserProfile({...userProfile, name: e.target.value})} className="w-full bg-white border border-black/5 p-2 outline-none focus:border-black/20" />
            </div>
            <div className="space-y-1">
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Background_Data</span>
              <textarea value={userProfile.family} onChange={e => onUpdateUserProfile({...userProfile, family: e.target.value})} className="w-full bg-white border border-black/5 p-2 h-24 outline-none resize-none custom-scrollbar" />
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-white border border-black/5 shadow-sm">
              <div className="text-[10px] font-bold mb-2">磁盘同步引擎</div>
              <p className="text-[8px] opacity-60 mb-4 leading-relaxed">关联后数据将自动存入 D:\AIGAME\LOVE 文件夹中，实现真实物理存盘。</p>
              <button 
                onClick={onConnectFolder}
                className={`w-full py-3 text-[9px] font-bold border transition-all ${localSync.isConnected ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-black text-white'}`}
              >
                {localSync.isConnected ? `已同步: ${localSync.folderName}` : '关联物理磁盘路径'}
              </button>
            </div>
            <div className="p-2 border border-black/5 flex justify-between items-center">
              <span className="text-[8px] font-bold opacity-40 uppercase">限制解除模式</span>
              <button onClick={() => onToggleAdultMode(!isAdultMode)} className={`w-8 h-3 border relative ${isAdultMode ? 'bg-black' : 'bg-transparent'}`}>
                <div className={`absolute top-0 w-2.5 h-full transition-all ${isAdultMode ? 'right-0 bg-white' : 'left-0 bg-slate-300'}`}></div>
              </button>
            </div>
            <button onClick={onGlobalReset} className="w-full py-2 text-[8px] font-bold text-red-400 hover:text-red-600 transition-all opacity-40 hover:opacity-100 uppercase tracking-[0.2em]">Hard_Reset</button>
          </div>
        )}
      </div>
      
      <div className="p-3 opacity-10 text-center font-mono text-[6px] tracking-widest">PERSONA_CORE_V4.0</div>
    </div>
  );
};

export default Sidebar;
