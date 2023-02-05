
import { MyContext, MyConversation } from "../../global";
import axios from "axios";


// Get user confirmation to delete account
export default async function deleteUserConvo(conversation: MyConversation, ctx: MyContext) {

    const ref = "delete/" + ctx.session.user.name
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

// Delete user account
async function deleteUser(ctx: MyContext) {
    return await axios.delete(`/api/user/${ctx.from?.id}`)
    .then(async (res) => {
        await ctx.reply("Your account has been deleted.");
    })
    .catch(async (err) => {
        console.log(err.message);
        await ctx.reply("There has been an error in deleting your account.");
    });
}