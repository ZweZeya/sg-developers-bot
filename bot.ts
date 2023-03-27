import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { Bot, type NextFunction, session, InlineKeyboard } from "grammy";
import { Menu } from "@grammyjs/menu";
import { conversations, createConversation } from "@grammyjs/conversations";
import { emojiParser } from "@grammyjs/emoji";
import axios from "axios";
import { MyContext, UserInfo, getUser } from "./global";
import { createBtn, registerBtn } from "./components/keyboard";
import registerUserConvo from "./components/account/register";
import deleteUserConvo from "./components/account/delete";
import editUserConvo from "./components/account/edit";
import profileMsg from "./components/account/view";
import createProjectConvo from "./components/project/new";

// Configure axios baseURL to server api url
axios.defaults.baseURL = "http://localhost:4000";

// Create an instance of the `Bot` class using custom context and pass your authentication token to it
const bot = new Bot<MyContext>(process.env.BOT_TOKEN as string);

// -------------------------------------- MIDDLEWARES --------------------------------------
bot.use(session({ initial: () => ({ user: {} as UserInfo }) }));
bot.use(emojiParser());
bot.use(conversations());
bot.use(createConversation(registerUserConvo));
bot.use(createConversation(deleteUserConvo));
bot.use(createConversation(editUserConvo));
bot.use(createConversation(createProjectConvo));

// -------------------------------------- MENUS --------------------------------------

// Edit profile menu
const editProfileMenu = new Menu<MyContext>("edit-profile-menu")
  .text("Edit Profile", async (ctx) => {
    await ctx.conversation.enter("editUserConvo");
  })
  .row();

bot.use(editProfileMenu);

// Create a main menu
const mainMenu = new Menu<MyContext>("main-menu")
  .submenu("Manage Projects", "project-menu")
  .row()
  .submenu("Manage Account", "account-menu")
  .row()
  .text("Policy", (ctx) => {
    ctx.reply("");
  });

// Create a project menu
const projectMenu = new Menu<MyContext>("project-menu")
  .text("New Project", async (ctx) => {
    await ctx.conversation.enter("createProjectConvo");
  })
  .row()
  .back("Back");

// Create an account menu
const accountMenu = new Menu<MyContext>("account-menu")
  .text("View Profile", async (ctx) => {
    const msg = await profileMsg(ctx.update.callback_query.from.id);
    ctx.reply(msg, { reply_markup: editProfileMenu, parse_mode: "HTML" });
  })
  .row()
  .text("Delete Account", checkUser, async (ctx) => {
    await ctx.conversation.enter("deleteUserConvo");
  })
  .row()
  .back("Back");

// Register the project menu at main menu.
mainMenu.register(projectMenu);
// Register the account menu at main menu.
mainMenu.register(accountMenu);

// Use main menu module
bot.use(mainMenu);

// -------------------------------------- USER ACCESS --------------------------------------
// Check if user is registered in database
async function checkUser(ctx: MyContext, next: NextFunction): Promise<void> {
  const telegramId = ctx.from?.id as number;
  ctx.session.user.telegramId = telegramId;

  const user = await getUser(telegramId);

  if (user) {
    // Saves user in session
    ctx.session.user = user;
    await next();
  } else {
    // Prompts user to register
    bot.api.sendMessage(telegramId, "Please register to continue.", {
      reply_markup: registerBtn,
    });
  }
}

// -------------------------------------- COMMANDS --------------------------------------
// Handle the /start command with checkUser middleware to check if user exists
bot.command("start", checkUser, async (ctx) => {
  // Menu text
  const startMsg = "<b>Welcome to SG Developers!</b>\n";

  await ctx.reply(startMsg, { reply_markup: mainMenu, parse_mode: "HTML" });
});

// Prompt user to type /start command
bot.on("message", async (ctx) => {
  if (ctx.message.text === "Register") {
    // Respond when users click the register button
    await ctx.conversation.enter("registerUserConvo");
  } else {
    await ctx.reply("Please type /start to run the bot.");
  }
});

// Send message to owner if someone is interested in their project
bot.callbackQuery("interested", async (ctx) => {
  const owner = ctx.update.callback_query.from.id;
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const user = (await getUser(userId)) as UserInfo;

  let msg: string =
    "This user wants to work with you!" +
    "\n\n" +
    "Name: " +
    user.name +
    "\n" +
    "Age: " +
    user.age +
    "\n" +
    "Education: " +
    user.education +
    "\n" +
    "Tele User: " +
    username +
    "\n";

  // Add linkedin or github if exists
  user.contacts.universal?.github &&
    msg + "GitHub: " + user.contacts.universal.github + "\n";
  user.contacts.universal?.linkedin &&
    msg + "LinkedIn: " + user.contacts.universal.linkedin + "\n";

  bot.api.sendMessage(owner, msg);
});

// Start the bot.
bot.start();

bot.catch((err) => {
  console.log(err);
});
