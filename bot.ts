import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import { Bot, Context, type NextFunction, session, SessionFlavor, Keyboard } from "grammy";
import { Menu } from "@grammyjs/menu";
import { type Conversation, type ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import axios from "axios";

// Configure axios baseURL to server api url
axios.defaults.baseURL = 'http://localhost:4000';

// Configure custom session data
interface SessionData {
    /** custom session property */
    foo: string;
};
// Create custom context
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

// Create an instance of the `Bot` class using custom context and pass your authentication token to it
const bot = new Bot<MyContext>(process.env.BOT_TOKEN as string); 
// Create an empty instance of the current user with the type UserInfo
let user = {} as UserInfo;

// -------------------------------------- INTERFACES --------------------------------------
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

// -------------------------------------- MIDDLEWARES --------------------------------------
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(registerUserConvo));
bot.use(createConversation(deleteUserConvo));
// bot.use(getUser);

// -------------------------------------- MENUS --------------------------------------
// Create a main menu
const mainMenu = new Menu<MyContext>("main-menu")
    .submenu("Manage Projects", "project-menu").row()
    .submenu("Manage Account", "account-menu").row()
    .text("Policy", (ctx) => {
        ctx.reply("");
    });

// Create a project menu
const projectMenu = new Menu<MyContext>("project-menu")
    .text("New Project", (ctx) => ctx.reply("")).row()
    .back("Go Back");

// Create an account menu
const accountMenu = new Menu<MyContext>("account-menu")
    .text("Edit Profile", (ctx) => ctx.reply("")).row()
    .text("View Profile", (ctx) => ctx.reply("")).row()
    .text("Delete Account", getUser, async (ctx) => {
        await ctx.conversation.enter("deleteUserConvo");
    }).row()
    .back("Go Back");


// -------------------------------------- KEYBOARDS --------------------------------------
// Create a register button
const registerBtn = new Keyboard()
    .text("Register").row()
    .resized(true)
    .oneTime(true);

// Create a education select keyboard
const educationList = ["O Levels", "A Levels or equilavent", "Polytechnic diploma", "Bachelor's Degree", "Master's Degree", "Doctorate", "Others"];
const educationKeyboard = new Keyboard()
    .text("O Levels").row()
    .text("A Levels or equilavent").row()
    .text("Polytechnic diploma").row()
    .text("Bachelor's Degree").row()
    .text("Master's Degree").row()
    .text("Doctorate").row()
    .text("Others").row()
    .oneTime(true);

// Create keyboard button to request user contact number
const contactNumBtn = new Keyboard()
    .requestContact("Allow").row()
    .resized(true)
    .oneTime(true);

// Create skip button
const skipBtn = new Keyboard()
    .text("Skip").row()
    .resized(true)
    .oneTime(true);

// Register the project menu at main menu.
mainMenu.register(projectMenu);
// Register the account menu at main menu.
mainMenu.register(accountMenu);

// Use main menu module
bot.use(mainMenu);

// -------------------------------------- USER ACCESS --------------------------------------
// Check if user is registered in database
async function getUser(ctx : MyContext, next: NextFunction) : Promise<void> {
    const telegramId = ctx.from?.id as number;
    return await axios.get<UserInfo>(`/api/user/${telegramId}`)
        .then(async (res) => {
            user = res.data;
            await next();
        })
        .catch(err => {
            console.log(err.response.status);
            console.log(err.message);
            console.log(err.response.headers);
            console.log(err.response.data);
            bot.api.sendMessage(telegramId, "Please register to continue.", { reply_markup: registerBtn });
        });  
};

// Ask the users for personal details to register them
async function registerUserConvo(conversation: MyConversation, ctx: MyContext){

    // Regular expressions for validation
    const nameRegex = new RegExp('^([a-z]+\\s?)+$', 'gmi');
    const phoneRegex = new RegExp('^65[\\d]{8}$', 'gm');
    const linkedinRegex = new RegExp('^https:\/\/www\.linkedin\.com\/in\/[\\w|-]+\/?$', 'gm');
    const githubRegex = new RegExp('^https:\/\/github\.com\/[\\w|-|.]+\/?$', 'gm');

    // Append telegramId to user object
    user.telegramId = ctx.from?.id as number;

    // Ask for full name
    await ctx.reply("What is your full name?", { reply_markup: { remove_keyboard: true } });
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const name = ctx.message.text as string;
            if (!nameRegex.test(name)) {
                await ctx.reply("Please provide a valid full name.");
            } else {
                user.name = name;
            };
        }
    } while (!user.name);

    // Ask for age
    await ctx.reply("What is your age?");
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const age = parseInt(ctx.message.text as string);
            if (age < 16 || age > 90) {
                await ctx.reply("Please provide a valid age.");
            } else {
                user.age = age;
            };
        }
    } while (!user.age);

    // Ask for education level
    await ctx.reply("What is your highest education?", { reply_markup: educationKeyboard });
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const education = ctx.message.text as string;
            if (!educationList.includes(education)) {
                ctx.reply("Please use the keyboard provided.");
            } else {
                user.education = education;
            };
        }
    } while (!user.education);

    // Ask for description
    await ctx.reply("Please provide a short profile description.\nThis will be seen by others.\n\n(char limit of 500)", {reply_markup: {remove_keyboard: true}});
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const description = ctx.message.text as string;
            if (description.split("").length > 500) {
                await ctx.reply("Exceeded character limit of 500. Please shorten your description.")
            } else {
                user.description = description;
            }     
        };
    } while (!user.description);

    // Ask for phone number
    await ctx.reply("Please allow access to contact number.\nEnsure that you are using a Singapore phone number.", { reply_markup: contactNumBtn });
    do {
        ctx = await conversation.wait();
        if (ctx.message) {
            const phoneStr = ctx.message.contact?.phone_number as string
            if (!phoneRegex.test(phoneStr)) {
                await ctx.reply("Please provide a valid Singapore phone number.")
            } else {
                user.contacts = {personal: {phone: parseInt(phoneStr)}};
            }
        };
    } while (!user.contacts.personal.phone);

    // Remove keyboard
    await ctx.reply("Thank you!", { reply_markup: { remove_keyboard: true }});

    // Ask for linkedin acc (optional)
    await ctx.reply("What is your Linkedin account (provide url)?\nThis will be available for others to see.", { reply_markup: skipBtn });
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            if (ctx.message.text === "Skip") {
                break;
            }
            const linkedin = ctx.message.text as string;
            if (!linkedinRegex.test(linkedin)) {
                await ctx.reply("Please provide a valid Linkedin account url.\ne.g. https://www.linkedin.com/in/<acc>");
            } else {
                user.contacts = {...user.contacts, universal: {linkedin: linkedin}};
            };
        }
    } while(!user.contacts.universal?.linkedin);

    // Ask for github acc (optional)
    await ctx.reply("What is your Github account (provide url)?\nThis will be available for others to see.", { reply_markup: skipBtn });
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            if (ctx.message.text === "Skip") {
                break;
            }
            const github = ctx.message.text as string;
            if (!githubRegex.test(github)) {
                await ctx.reply("Please provide a valid Github account url.\ne.g. https://www.github.com/<acc>");
            } else {
                user.contacts.universal= {...user.contacts.universal, github: github};
            };
        }
    } while(!user.contacts.universal?.github);

    // Register a new user
    await registerUser(user, ctx);

    // Leave the conversation
    return;
};

// Get user confirmation to delete account
async function deleteUserConvo(conversation: MyConversation, ctx: MyContext) {

    const ref = "delete/" + user.name
    // Ask user to confirm delete
    await ctx.reply(`Deleting your account means that your profile will be permanently removed.\nPlease type ${ref} to confirm.`);
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            if (ctx.message.text === ref) {
                break;
            } else {
                await ctx.reply(`Sorry your input does not match ${ref}.\nFailed to delete account.`);
                // Leave the conversation
                return;
            }
        }
    } while (ctx.update.message?.text);

    // Delete user account
    await deleteUser(ctx);

    // Leave the conversation
    return;
};


// Register a new user via a post request
async function registerUser(user: UserInfo, ctx: MyContext) {
    return await axios.post(`/api/user`, { user })
        .then(async (res) => {
            await ctx.reply("Thank you for registering.\nType /start to get started.", { reply_markup: { remove_keyboard: true } });
        })
        .catch(async (err) => {
            console.log(err.message);
            await ctx.reply("There has been an error in registering.", { reply_markup: { remove_keyboard: true } });
        });
};

// Delete user account
async function deleteUser(ctx: Context) {
    return await axios.delete(`/api/user/${ctx.from?.id}`)
    .then(async (res) => {
        await ctx.reply("Your account has been deleted.");
    })
    .catch(async (err) => {
        console.log(err.message);
        await ctx.reply("There has been an error in deleting your account.");
    });
}


// -------------------------------------- COMMANDS --------------------------------------
// Handle the /start command with getUser middleware to check if user exists
bot.command("start", getUser, async (ctx) => {
    // Menu text
    const startMsg = "Welcome to SG Developers!\n";

    await ctx.reply(startMsg, { reply_markup: mainMenu });
});


// Prompt user to type /start command
bot.on("message", async (ctx) => {
    if (ctx.message.text === "Register") {
        // Respond when users click the register button
        await ctx.conversation.enter("registerUserConvo");
    } else {
        await ctx.reply("Please type /start to run the bot.");
    }; 
});

// Start the bot.
bot.start();