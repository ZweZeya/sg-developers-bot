import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import { Bot, Context, NextFunction } from "grammy";
import axios from "axios";

// Configure axios baseURL to server api url
axios.defaults.baseURL = 'http://localhost:4000';

// Create an instance of the `Bot` class and pass your authentication token to it
const bot = new Bot(process.env.BOT_TOKEN as string); 

// Check if user is registered in database
async function getUser(ctx : Context, next: NextFunction) : Promise<void> {
    const telegramId = ctx.from?.id as number;
    await axios.get(`/api/user/${telegramId}`)
        .then(async (res) => {
            console.log(res.data)
        })
        .catch(err => {
            console.log(err.response.status);
            console.log(err.message);
            console.log(err.response.headers);
            console.log(err.response.data);
            bot.api.sendMessage(telegramId, "You are not registered.");
        })

    await next();
};

// Register new users
async function registerUser() {

};

// Handle the /start command
bot.command("start", async (ctx) => {
    // Menu text
    const startMsg = "Welcome to SG Developers!\n\n" + 
        "Here are the available actions:\n" + 
        "\nGeneral\n" +
        "/help - show help\n" +
        "\nProject\n" +
        "/newproject - create a new project\n" +
        "/viewproject - create a new project\n" +
        "\nAccount\n" + 
        "/editprofile - edit your current profile\n" + 
        "/viewprofile - edit your current profile\n" +
        "/deleteaccount - delete account and all related data\n";

    await ctx.reply(startMsg);
});

// Handle the /newproject command
bot.command("newproject", getUser, async (ctx) => {
    await ctx.reply("newproject")
});

// Handle the /viewproject command
bot.command("viewproject", getUser, async (ctx) => {
    await ctx.reply("viewproject")
});

// Handle the /editprofile command
bot.command("editprofile", getUser, async (ctx) => {
    await ctx.reply("editprofile")
});

// Handle the /viewprofile command
bot.command("viewprofile", getUser, async (ctx) => {
    await ctx.reply("viewprofile")
});

// Handle the /deleteaccount command
bot.command("deleteaccount", getUser, async (ctx) => {
    await ctx.reply("deleteaccount")
});



// Start the bot.
bot.start();