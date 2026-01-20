
export interface Character {
  char_id: string;
  name: string;
  avatar: string;
  description: string;
  family_background: string;
  personality_keywords: string;
  hobbies: string;
  relationship: string;
  appearance: string;
  system_prompt: string;
  greeting_message: string;
  example_dialogue: string;
  favorability: number;
}

export interface UserProfile {
  name: string;
  gender: string;
  age: string;
  family: string;
  personality: string;
  persona: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isEvent?: boolean;
}

export interface GameTime {
  month: number;
  season: '春' | '夏' | '秋' | '冬';
}

export type AppState = 'chatting' | 'loading' | 'error';

export interface LocalSyncState {
  isConnected: boolean;
  folderName: string;
  lastSave?: number;
}
