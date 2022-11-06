import { Buffer } from "buffer";

function getSrc(profilePicture) {
    if (profilePicture) {
        return 'data:image/png;base64,' + Buffer.from(profilePicture, "binary").toString("base64");
    }
}

function getAvatar(fullName) {
    let fullNameArr = fullName.split(' ');
    let initials = fullNameArr[0][0];
    if(fullNameArr[1]) {
        initials += fullNameArr[1][0];
    }
    return initials.toUpperCase();
}

function getDateString(dateStr) {
    let date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export {
    getSrc,
    getAvatar,
    getDateString
};

