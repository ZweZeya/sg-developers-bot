import { MyContext, MyConversation, UserInfo, UpdateInfo, Validator } from "../../global";
import axios from "axios";

// Store json paths for user obj
const profilePath = {
    name: "name",
    age: "age",
    education: "education",
    description: "description",
    phone: "contacts.personal.phone",
    linkedin: "contacts.universal.linkedin",
    github: "contacts.universal.github",
};

// Convo to update user info
export default async function editUserConvo(conversation: MyConversation, ctx: MyContext) {
    
    const user = ctx.session.user;
    const newUser = {...user};
    const updateDetails = {} as UpdateInfo;
    const validator = new Validator();

    await ctx.reply("Which field would you like to edit?");
    ctx = await conversation.waitFor("message:text");
    if (ctx.message) {
        const field = (ctx.message.text as string).toLowerCase().trim();
        if (field in profilePath) {
            updateDetails.field = field;
        } else {
            await ctx.reply(`Invalid profile field. Exiting...`)
        }
    }

    await ctx.reply(`Please give a new ${updateDetails.field}.`)
    ctx = await conversation.waitFor("message:text");
    if (ctx.message) {
        if (!validator.validate(ctx.message.text as string, updateDetails.field)) {
            await ctx.reply(`Invalid ${updateDetails.field}. Exiting...`)
        } else {
            updateDetails.valid = true;
            updateDetails.new = updateDetails.field === "phone" ? parseInt(ctx.message.text as string) : ctx.message.text as string;
            eval("newUser." + profilePath[updateDetails.field as keyof typeof profilePath] + "=\'" + updateDetails.new + "\'");
        }
    }

    await editUser(ctx, newUser);

    // Leave the conversation
    return;
};

// Update user profile
const editUser = async (ctx: MyContext, user: UserInfo) => {
    return await axios
    .patch(`/api/user`, { user })
    .then(async (res) => {
      await ctx.reply("Successfully Updated!");
    })
    .catch(async (err) => {
      console.log(err.message);
      await ctx.reply("There has been an error in updating.");
    });
}