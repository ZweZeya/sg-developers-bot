import { Keyboard } from "grammy";

// Create a register button
const registerBtn = new Keyboard()
    .text("Register").row()
    .resized(true)
    .oneTime(true);

// Create a education select keyboard
const educationKeyboard = new Keyboard()
    .text("O Levels").row()
    .text("A Levels or equilavent").row()
    .text("Polytechnic diploma").row()
    .text("Bachelor's Degree").row()
    .text("Master's Degree").row()
    .text("Doctorate").row()
    .text("Others").row()
    .oneTime(true);

// Create keyboard button to request user contact number
const contactNumBtn = new Keyboard()
    .requestContact("Allow").row()
    .resized(true)
    .oneTime(true);

// Create a single custom button
const createBtn = (name: string) => {
    return new Keyboard()
        .text(name).row()
        .resized(true)
        .oneTime(true);
};


export { registerBtn, educationKeyboard, contactNumBtn, createBtn };