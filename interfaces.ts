import { Context, SessionFlavor } from "grammy";
import { type Conversation, type ConversationFlavor } from "@grammyjs/conversations";

// Configure custom session data
interface SessionData {
    // Store user details
    user: UserInfo;
};
// Create custom context
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

// User attributes
interface UserInfo {
    name: string;
    age: number;
    education: string;
    description: string;
    contacts: {
        personal: {
            phone: number;
        };
        universal?: {
            linkedin?: string;
            github?: string;
        };
    };
    telegramId: number;
};

export { MyContext, MyConversation, UserInfo };