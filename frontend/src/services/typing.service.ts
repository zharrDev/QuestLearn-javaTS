import api from './api';
import type { TypingStartResponse, TypingSessionResponse, SubmitTypingRequest } from '../types/typing.types';

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

  async getLeaderboard(level?: string): Promise<any[]> {
    const res = await api.get('/typing/leaderboard', { params: { level } });
    return res.data.data;
  }
};
