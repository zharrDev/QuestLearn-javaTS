import api from './api';
import type { TypingStartResponse, TypingSessionResponse, SubmitTypingRequest } from '../types/typing.types';
import type { LeaderboardEntry } from '../types/leaderboard.types';

export const typingService = {
  async startSession(duniaId: number, level: string): Promise<TypingStartResponse> {
    const res = await api.get('/typing/start', { params: { duniaId, level } });
    const data = res.data?.data;
    if (!data || !Array.isArray(data.words) || data.words.length === 0) {
      throw new Error('Invalid typing session response');
    }
    return data;
  },

  async submitSession(data: SubmitTypingRequest): Promise<TypingSessionResponse> {
    const res = await api.post('/typing/submit', data);
    const result = res.data?.data;
    if (!result) throw new Error('Invalid typing submit response');
    return result;
  },

  async getSessions(): Promise<TypingSessionResponse[]> {
    const res = await api.get('/typing/sessions');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  // Ranking is by best WPM; optional duniaId filters the ranking to one world.
  async getLeaderboard(duniaId?: number): Promise<LeaderboardEntry[]> {
    const res = await api.get('/typing/leaderboard', { params: { duniaId } });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  }
};
