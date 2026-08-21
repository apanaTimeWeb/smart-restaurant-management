import { useState } from 'react';
import { PlatformBroadcast } from '../super-admin_types/broadcasts_types';
import { MOCK_BROADCASTS } from '../super-admin_constants/broadcasts_constants';

export const useBroadcasts = () => {
  const [broadcasts, setBroadcasts] = useState<PlatformBroadcast[]>(MOCK_BROADCASTS);
  const [isSending, setIsSending] = useState(false);

  const deleteBroadcast = (id: string) => {
    setBroadcasts(prev => prev.filter(b => b.id !== id));
  };

  const createBroadcast = (broadcast: Omit<PlatformBroadcast, 'id' | 'status' | 'author'>) => {
    setIsSending(true);
    setTimeout(() => {
      const newBroadcast: PlatformBroadcast = {
        ...broadcast,
        id: `brd-${Date.now()}`,
        status: broadcast.scheduledFor ? 'scheduled' : 'sent',
        author: 'Current User',
        sentAt: broadcast.scheduledFor ? undefined : new Date().toISOString()
      };
      setBroadcasts(prev => [newBroadcast, ...prev]);
      setIsSending(false);
      alert('Broadcast successfully created!');
    }, 1000);
  };

  return {
    broadcasts,
    isSending,
    deleteBroadcast,
    createBroadcast
  };
};
