import { PubSub } from 'apollo-server-express';
import { withFilter } from 'apollo-server-express';
import { Message } from '../../../entity/Message';
import { IResolvers } from '../../../types';
import { MessageProvider } from '../providers/message.provider';

export default {
  Query: {
    // The ordering depends on the messages
    chats: (obj, args, { injector }) => injector.get(MessageProvider).getChats(),
  },
  Mutation: {
    addMessage: async (obj, { chatId, content }, { injector }) =>
      injector.get(MessageProvider).addMessage(chatId, content),
    removeMessages: async (obj, { chatId, messageIds, all }, { injector }) =>
      injector.get(MessageProvider).removeMessages(chatId, {
        messageIds: messageIds || undefined,
        all: all || false,
      }),
    // We may need to also remove the messages
    removeChat: async (obj, { chatId }, { injector }) => injector.get(MessageProvider).removeChat(chatId),
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter((root, args, { injector }) => injector.get(PubSub).asyncIterator('messageAdded'),
        ({ messageAdded }: { messageAdded: Message }, variables, { injector }) =>
          injector.get(MessageProvider).filterMessageAdded(messageAdded)
      ),
    },
  },
  Chat: {
    messages: async (chat, { amount }, { injector }) =>
      injector.get(MessageProvider).getChatMessages(chat, amount || 0),
    updatedAt: async (chat, args, { injector }) => injector.get(MessageProvider).getChatUpdatedAt(chat),
  },
  Message: {
    sender: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageSender(message),
    ownership: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageOwnership(message),
    holders: async (message, args, { injector }) =>
      injector.get(MessageProvider).getMessageHolders(message),
    chat: async (message, args, { injector }) => injector.get(MessageProvider).getMessageChat(message),
  },
} as IResolvers;
