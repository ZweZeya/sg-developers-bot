import { MyContext, MyConversation, UserInfo } from "../../interfaces";
import { educationKeyboard, contactNumBtn, skipBtn } from "../keyboard";
import axios from "axios";



// Ask the users for personal details to register them
export default async function registerUserConvo(conversation: MyConversation, ctx: MyContext){
    // Regular expressions for validation
    const nameRegex = new RegExp('^([a-z]+\\s?)+$', 'gmi');
    const phoneRegex = new RegExp('^65[\\d]{8}$', 'gm');
    const linkedinRegex = new RegExp('^https:\/\/www\.linkedin\.com\/in\/[\\w|-]+\/?$', 'gm');
    const githubRegex = new RegExp('^https:\/\/github\.com\/[\\w|-|.]+\/?$', 'gm');

    // List of vaild education options 
    const educationList = ["O Levels", "A Levels or equilavent", "Polytechnic diploma", "Bachelor's Degree", "Master's Degree", "Doctorate", "Others"];
   
    // Ask for full name
    await ctx.reply("What is your full name?", { reply_markup: { remove_keyboard: true } });
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const name = ctx.message.text as string;
            if (!nameRegex.test(name)) {
                await ctx.reply("Please provide a valid full name.");
            } else {
                ctx.session.user.name = name;
            };
        }
    } while (!ctx.session.user.name);

    // Ask for age
    await ctx.reply("What is your age?");
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const age = parseInt(ctx.message.text as string);
            if (age < 16 || age > 90) {
                await ctx.reply("Please provide a valid age.");
            } else {
                ctx.session.user.age = age;
            };
        }
    } while (!ctx.session.user.age);

    // Ask for education level
    await ctx.reply("What is your highest education?", { reply_markup: educationKeyboard });
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const education = ctx.message.text as string;
            if (!educationList.includes(education)) {
                ctx.reply("Please use the keyboard provided.");
            } else {
                ctx.session.user.education = education;
            };
        }
    } while (!ctx.session.user.education);

    // Ask for description
    await ctx.reply("Please provide a short profile description.\nThis will be seen by others.\n\n(char limit of 500)", {reply_markup: {remove_keyboard: true}});
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const description = ctx.message.text as string;
            if (description.split("").length > 500) {
                await ctx.reply("Exceeded character limit of 500. Please shorten your description.")
            } else {
                ctx.session.user.description = description;
            }     
        };
    } while (!ctx.session.user.description);

    // Ask for phone number
    await ctx.reply("Please allow access to contact number.\nEnsure that you are using a Singapore phone number.", { reply_markup: contactNumBtn });
    do {
        ctx = await conversation.wait();
        if (ctx.message) {
            const phoneStr = ctx.message.contact?.phone_number as string
            if (!phoneRegex.test(phoneStr)) {
                await ctx.reply("Please provide a valid Singapore phone number.")
            } else {
                ctx.session.user.contacts = {personal: {phone: parseInt(phoneStr)}};
            }
        };
    } while (!ctx.session.user.contacts.personal.phone);

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
                ctx.session.user.contacts = {...ctx.session.user.contacts, universal: {linkedin: linkedin}};
            };
        }
    } while(!ctx.session.user.contacts.universal?.linkedin);

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
                ctx.session.user.contacts.universal= {...ctx.session.user.contacts.universal, github: github};
            };
        }
    } while(!ctx.session.user.contacts.universal?.github);

    console.log(ctx.session)
    // Register a new user
    await registerUser(ctx.session.user, ctx);

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
