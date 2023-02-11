import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import { Bot, type NextFunction, session } from "grammy";
import { Menu } from "@grammyjs/menu";
import { conversations, createConversation } from "@grammyjs/conversations";
import axios from "axios";
import { MyContext, UserInfo, getUser } from "./global";
import { registerBtn } from "./components/keyboard";
import registerUserConvo from "./components/account/register";
import deleteUserConvo from "./components/account/delete";

// Configure axios baseURL to server api url
axios.defaults.baseURL = 'http://localhost:4000';

// Create an instance of the `Bot` class using custom context and pass your authentication token to it
const bot = new Bot<MyContext>(process.env.DEV_BOT_TOKEN as string); 

// -------------------------------------- MIDDLEWARES --------------------------------------
bot.use(session({ initial: () => ({ user: {} as UserInfo }) }));
bot.use(conversations());
bot.use(createConversation(registerUserConvo));
bot.use(createConversation(deleteUserConvo));

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
    // .text("Edit Profile", (ctx) => ctx.reply("")).row()
    .text("View Profile", (ctx) => ctx.reply("")).row()
    .text("Delete Account", checkUser, async (ctx) => {
        await ctx.conversation.enter("deleteUserConvo");
    }).row()
    .back("Go Back");

// Register the project menu at main menu.
mainMenu.register(projectMenu);
// Register the account menu at main menu.
mainMenu.register(accountMenu);
// Use main menu module
bot.use(mainMenu);

// -------------------------------------- USER ACCESS --------------------------------------
// Check if user is registered in database
async function checkUser(ctx : MyContext, next: NextFunction) : Promise<void> {

    const telegramId = ctx.from?.id as number;
    ctx.session.user.telegramId = telegramId;

    const user = await getUser(telegramId);

    if (user) {
        // Saves user in session 
        ctx.session.user = user;
        await next();
    } else {
        // Prompts user to register
        bot.api.sendMessage(telegramId, "Please register to continue.", { reply_markup: registerBtn });
    } 
};

// -------------------------------------- COMMANDS --------------------------------------
// Handle the /start command with checkUser middleware to check if user exists
bot.command("start", checkUser, async (ctx) => {

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