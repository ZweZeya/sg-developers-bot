import { MyContext, MyConversation, UserInfo, ProjectInfo, ProjectValidator } from "../../global";
import axios from "axios";
import { generateProjectMsg } from "../chat/announce";

export default async function createProjectConvo(conversation: MyConversation, ctx: MyContext) {
    
    // Error handling
    if (!ctx.session.user) {
        ctx.reply("No user information found. Exiting...");
        return; 
    }

    const project = { createdBy: ctx.session.user } as ProjectInfo;
     // Initialise validator to check user input
    const validator = new ProjectValidator();

    // Ask for name of project
    ctx.reply("Give a name for your project. (maximum 50 characters)");
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const name = ctx.message.text as string;
            if (!validator.validateName(name)) {
                await ctx.reply("Please provide a valid project name.");
            } else {
                project.name = name;
            };
        }
    } while (!project.name)

    // Ask for project description
    ctx.reply("Give a description for your project. (maximum 250 characters)");
    do {
        ctx = await conversation.waitFor("message:text");
        if (ctx.message) {
            const description = ctx.message.text as string;
            if (!validator.validateDescription(description)) {
                await ctx.reply("Please provide a valid project description.");
            } else {
                project.description = description;
            };
        }
    } while (!project.description)

    // Create new project
    await createProject(project, ctx) 
    // Leave the conversation 
    return;
};


// Create a new project in db
const createProject = async (project: ProjectInfo, ctx: MyContext) => {
    await axios.post("/api/project", { project })
        .then(res => {
            ctx.reply("New project successfully created.");
            ctx.api.sendMessage(process.env.CHAT_ID as string, generateProjectMsg(project));
        })
        .catch(err => {
            console.log(err)
            ctx.reply("There has been an error in creating a new project.");
        })
};


