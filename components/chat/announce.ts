import { ProjectInfo } from "../../global";

const generateProjectMsg = (project: ProjectInfo): string => {
    let msg = "Name: " + project.name + "\n" +
        "Description: " + project.description + "\n";
        
    return msg;
}

export { generateProjectMsg };