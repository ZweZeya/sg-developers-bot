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

// Edit profile information
interface UpdateInfo {
    field: string;
    valid: boolean;
    new: string | number;
};

interface ProjectInfo {
    name: string,
    description: string,
    createdBy: UserInfo,
}

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
    // Max characters for desciption
    nameLimit: number;
    descriptionLimit: number;

    constructor() {
        this.nameRegex = new RegExp('^([a-z]+\\s?)+$', 'mi');
        this.ageRegex = new RegExp('^\\d{2}$', 'm');
        this.phoneRegex = new RegExp('^65[\\d]{8}$', 'm');
        this.linkedinRegex = new RegExp('^https:\/\/www\.linkedin\.com\/in\/[\\w|-]+\/?$', 'm');
        this.githubRegex = new RegExp('^https:\/\/github\.com\/[\\w|-|.]+\/?$', 'm');
        this.educationList = ["O Levels", "A Levels or equilavent", "Polytechnic diploma", "Bachelor's Degree", "Master's Degree", "Doctorate", "Others"];
        this.nameLimit = 100;
        this.descriptionLimit = 250;
    };

    validateName(name: string): boolean {
        return this.nameRegex.test(name) && name.length < this.nameLimit;
    };

    validateAge(age: string): boolean {
        return this.ageRegex.test(age);
    };

    validatePhone(phone: string): boolean {
        return this.phoneRegex.test(phone);
    };

    validateLinkedin(linkedin: string): boolean {
        return this.linkedinRegex.test(linkedin);
    };

    validateGithub(github: string): boolean {
        return this.githubRegex.test(github);
    };

    validateEducation(education: string): boolean {
        return this.educationList.includes(education);
    };

    validateDescription(desciption: string): boolean {
        return desciption.length <= this.descriptionLimit;
    };

    validate(input: string, field: string): boolean {

        switch(field) {
            case "name":
                return this.validateName(input);

            case "age":
                return this.validateAge(input);

            case "phone":
                return this.validatePhone(input);

            case "linkedin":
                return this.validateLinkedin(input);

            case "github":
                return this.validateGithub(input);

            case "education":
                return this.validateEducation(input);

            case "description":
                return this.validateDescription(input);

        };

        return false;
    };

};

class ProjectValidator {
    // Regular expressions for validation
    nameRegex: RegExp;
    // Max characters for desciption
    nameLimit: number;
    descriptionLimit: number;

    constructor() {
        this.nameRegex = new RegExp('^(\\w+\\s?)+$', 'mi');
        this.nameLimit = 50;
        this.descriptionLimit = 250;
    }

    validateName(name: string) {
        return this.nameRegex.test(name) && name.length < this.nameLimit;
    };

    validateDescription(desciption: string) {
        return desciption.length < this.descriptionLimit;
    }
}

// ----------------------------------------- FUNCTIONS -----------------------------------------
// Get user from db
const getUser = async (telegramId: number) => {
   
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



export { 
    MyContext,
    MyConversation, 
    UserInfo, 
    UpdateInfo, 
    Validator,
    ProjectValidator, 
    getUser, 
    ProjectInfo 
};