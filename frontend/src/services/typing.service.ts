import api from './api';
import type { TypingStartResponse, TypingSessionResponse, SubmitTypingRequest } from '../types/typing.types';
import type { LeaderboardEntry } from '../types/leaderboard.types';

export const typingService = {
  async startSession(duniaId: number, level: string): Promise<TypingStartResponse> {
    const res = await api.get('/typing/start', { params: { duniaId, level } });
    return res.data.data;
  },

  async submitSession(data: SubmitTypingRequest): Promise<TypingSessionResponse> {
    const res = await api.post('/typing/submit', data);
    return res.data.data;
  },

  async getSessions(): Promise<TypingSessionResponse[]> {
    const res = await api.get('/typing/sessions');
    return res.data.data;
  },

  // Ranking is by best WPM; optional duniaId filters the ranking to one world.
  async getLeaderboard(duniaId?: number): Promise<LeaderboardEntry[]> {
    const res = await api.get('/typing/leaderboard', { params: { duniaId } });
    return res.data.data;
  }
};
