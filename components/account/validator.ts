import { Validator } from "../../interfaces";

const validator: Validator = {
    // Regular expressions for validation
    nameRegex: new RegExp('^([a-z]+\\s?)+$', 'gmi'),
    ageRegex: new RegExp('^\\d{2}$', 'gm'),
    phoneRegex: new RegExp('^65[\\d]{8}$', 'gm'),
    linkedinRegex: new RegExp('^https:\/\/www\.linkedin\.com\/in\/[\\w|-]+\/?$', 'gm'),
    githubRegex: new RegExp('^https:\/\/github\.com\/[\\w|-|.]+\/?$', 'gm'),
    // List of vaild education options 
    educationList: ["O Levels", "A Levels or equilavent", "Polytechnic diploma", "Bachelor's Degree", "Master's Degree", "Doctorate", "Others"],
};

export default validator;

