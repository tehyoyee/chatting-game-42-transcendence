'use client'

import { ChatContextProvider } from '@/components/content/chat/context';
import Chat from '@/components/content/chat/chat';

export default function Page() {
  return (
		<ChatContextProvider>
			<Chat></Chat>
		</ChatContextProvider>
  );
}
