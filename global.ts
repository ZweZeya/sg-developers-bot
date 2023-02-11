/* This is a file of important interfaces, classes and functions t
hat are commonly used accross the entire application */


import { Context, SessionFlavor } from "grammy";
import { type Conversation, type ConversationFlavor } from "@grammyjs/conversations";
import axios from "axios";


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

// ----------------------------------------- FUNCTIONS -----------------------------------------
// Get user from db
async function getUser(telegramId: number) {
   
    return await axios.get<UserInfo>(`/api/user/${telegramId}`)
        .then(async (res) => {
           return res.data;
        })
        .catch(err => {
            console.log(err.response.status);
            console.log(err.message);
            console.log(err.response.headers);
            console.log(err.response.data);
            return;
        });  
};



export { MyContext, MyConversation, UserInfo, Validator, getUser };