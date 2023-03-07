import { ProjectInfo, MyContext } from "../../global";

const generateProjectMsg = (project: ProjectInfo): string => {
    let msg = "Name: " + project.name + "\n" +
        "Description: " + project.description + "\n";
        
    return msg;
};

const announceProject = async (project: ProjectInfo, ctx: MyContext) => {
    await ctx.api.sendMessage(process.env.CHAT_ID as string, generateProjectMsg(project));
};


export { announceProject };