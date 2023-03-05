import { getUser } from "../../global";

export default async function profileMsg(telegramId: number) {
    const strArr: string[] = ["--- Profile ---\n"];
    let msgStr = "";
    const user = await getUser(telegramId);
    if (user) {
        strArr.push("Name: " + user.name);
        strArr.push("Age: " + user.age);
        strArr.push("Education: " + user.education);
        strArr.push("Description: " + user.description);
        strArr.push("Phone: " + user.contacts.personal.phone);

        const linkedin = user.contacts.universal?.linkedin ? user.contacts.universal?.linkedin : "";
        strArr.push("Linkedin: " + linkedin);

        const github = user.contacts.universal?.github ? user.contacts.universal?.github : "";
        strArr.push("Github: " + github);
    }

    strArr.forEach(row => {
        msgStr += row + "\n";
    });

    return msgStr + "\n--- End ---\n";
};