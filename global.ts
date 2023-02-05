import { Context, SessionFlavor } from "grammy";
import { type Conversation, type ConversationFlavor } from "@grammyjs/conversations";


// ----------------------------------------- INTERFACES -----------------------------------------
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

// // Validator attributes
// interface ValidatorInfo {
//     nameRegex: RegExp;
//     ageRegex: RegExp;
//     phoneRegex: RegExp;
//     linkedinRegex: RegExp;
//     githubRegex: RegExp;
//     educationList: string[];
// };

// ----------------------------------------- CLASSES -----------------------------------------
class Validator {
    // Regular expressions for validation
    nameRegex: RegExp;
    ageRegex: RegExp;
    phoneRegex: RegExp;
    linkedinRegex: RegExp;
    githubRegex: RegExp;
    // List of vaild education options 
    educationList: string[];

    constructor() {
        this.nameRegex = new RegExp('^([a-z]+\\s?)+$', 'gmi');
        this.ageRegex = new RegExp('^\\d{2}$', 'gm');
        this.phoneRegex = new RegExp('^65[\\d]{8}$', 'gm');
        this.linkedinRegex = new RegExp('^https:\/\/www\.linkedin\.com\/in\/[\\w|-]+\/?$', 'gm');
        this.githubRegex = new RegExp('^https:\/\/github\.com\/[\\w|-|.]+\/?$', 'gm');
        this.educationList = ["O Levels", "A Levels or equilavent", "Polytechnic diploma", "Bachelor's Degree", "Master's Degree", "Doctorate", "Others"];
    };
};

export { MyContext, MyConversation, UserInfo, Validator };