import { ProjectInfo, MyContext } from "../../global";

const generateProjectMsg = (project: ProjectInfo): string => {

    const github = project.createdBy.contacts.universal?.github ? project.createdBy.contacts.universal?.github : "NIL";
    const linkedin = project.createdBy.contacts.universal?.linkedin ? project.createdBy.contacts.universal?.linkedin : "NIL";

    let msg = "Name: " + project.name + "\n" +
        "Description: " + project.description + "\n" + 
        "Created By: " + project.createdBy.name + "\n" +
        "Github: " + github + "\n" + 
        "Linkedin: " + linkedin + "\n"

    return msg;
};

const announceProject = async (project: ProjectInfo, ctx: MyContext) => {
    await ctx.api.sendMessage(process.env.CHAT_ID as string, generateProjectMsg(project));
};


export { announceProject };