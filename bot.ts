import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import { Bot, Context, type NextFunction, session, SessionFlavor, InlineKeyboard } from "grammy";
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

// -------------------------------------- INTERFACES --------------------------------------
interface UserInfo {
    name: string;
    age: number;
};

// -------------------------------------- MESSAGE MARKUPS --------------------------------------
// Create a main menu
const mainMenu = new Menu("main-menu")
    .submenu("Manage Projects", "project-menu").row()
    .submenu("Manage Account", "account-menu").row()

// Create a project menu
const projectMenu = new Menu("project-menu")
    .text("New Project", (ctx) => ctx.reply("")).row()
    .back("Go Back");

// Create an account menu
const accountMenu = new Menu("account-menu")
    .text("Edit Profile", (ctx) => ctx.reply("")).row()
    .text("View Profile", (ctx) => ctx.reply("")).row()
    .text("Delete Account", (ctx) => ctx.reply("")).row()
    .back("Go Back");

// Create a register button
const registerBtn = new InlineKeyboard()
    .text("Register", "registerUser");

// Register the project menu at main menu.
mainMenu.register(projectMenu);
// Register the account menu at main menu.
mainMenu.register(accountMenu);

// -------------------------------------- MIDDLEWARES --------------------------------------
bot.use(mainMenu);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(registerUser));
 

// -------------------------------------- USER ACCESS --------------------------------------
// Check if user is registered in database
async function getUser(ctx : MyContext, next: NextFunction) : Promise<void> {
    const telegramId = ctx.from?.id as number;
    await axios.get(`/api/user/${telegramId}`)
        .then(async (res) => {
            console.log(res.data)
            await next();
        })
        .catch(err => {
            console.log(err.response.status);
            console.log(err.message);
            console.log(err.response.headers);
            console.log(err.response.data);
            bot.api.sendMessage(telegramId, "Please register to continue.", { reply_markup: registerBtn });
        })  
};

// Respond when users click the register button
bot.callbackQuery("registerUser", async (ctx) => {
    await ctx.conversation.enter("registerUser");
});

// Register new users
async function registerUser(conversation: MyConversation, ctx: MyContext) {
    // Storing details of new user in an object
    const user = {} as UserInfo;
    const nameRegex = new RegExp('([a-z]+\s?)+', 'gmi');

    // Ask the users for personal details to register them
    await ctx.reply("What is your full name?");
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const name = ctx.message.text as string;
            if (!nameRegex.test(name)) {
                await ctx.reply("Please provide a valid full name.");
            } else {
                user.name = name;
                break;
            };
        }
    } while (true)

    await ctx.reply("What is your age?");
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const age = parseInt(ctx.message.text as string);
            if (age < 16 || age > 90) {
                await ctx.reply("Please provide a valid age.");
            } else {
                user.age = age;
                break;
            };
        }
    } while (true)

    // Leave the conversation
    return user;
};

// -------------------------------------- COMMANDS --------------------------------------
// Handle the /start command with getUser middleware to check if user exists
bot.command("start", getUser, async (ctx) => {
    // Menu text
    const startMsg = "Welcome to SG Developers!\n";

    await ctx.reply(startMsg, { reply_markup: mainMenu });
});

// Start the bot.
bot.start();