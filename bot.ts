import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import { Bot, Context, type NextFunction, session, SessionFlavor } from "grammy";
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

// -------------------------------------- MENUS --------------------------------------
// Create main menu
const mainMenu = new Menu("main-menu")
    .submenu("Manage Projects", "project-menu").row()
    .submenu("Manage Account", "account-menu").row()

// Create project menu
const projectMenu = new Menu("project-menu")
    .text("New Project", (ctx) => ctx.reply("")).row()
    .text("View Projects", (ctx) => ctx.reply("")).row()
    .back("Go Back");

// Create account menu
const accountMenu = new Menu("account-menu")
    .text("Edit Profile", (ctx) => ctx.reply("")).row()
    .text("View Profile", (ctx) => ctx.reply("")).row()
    .text("Delete Account", (ctx) => ctx.reply("")).row()
    .back("Go Back");

// Register project menu at main menu.
mainMenu.register(projectMenu);
// Register account menu at main menu.
mainMenu.register(accountMenu);

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
            bot.api.sendMessage(telegramId, "You are not registered.")
        })  
};

// Register new users
async function registerUser(conversation: MyConversation, ctx: MyContext) {
    // TODO: code the conversation

};

// -------------------------------------- MIDDLEWARES --------------------------------------
// bot.use(getUser)
bot.use(mainMenu);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
 
// -------------------------------------- COMMANDS --------------------------------------
// Handle the /start command
bot.command("start", async (ctx) => {
    // Menu text
    const startMsg = "Welcome to SG Developers!\n";

    await ctx.reply(startMsg, { reply_markup: mainMenu });
});

// Start the bot.
bot.start();