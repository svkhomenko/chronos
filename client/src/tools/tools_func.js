import React from "react";
import { Buffer } from "buffer";
import { colors } from "./const_tools";

function getSrc(profilePicture) {
    if (profilePicture) {
        return 'data:image/png;base64,' + Buffer.from(profilePicture, "binary").toString("base64");
    }
}

function getAvatar(fullName, clssName = '') {
    let fullNameArr = fullName.split(' ');
    let initials = fullNameArr[0][0];
    if (fullNameArr[1]) {
        initials += fullNameArr[1][0];
    }
    initials = initials.toUpperCase();

    let index = (initials[0].charCodeAt() - 60) % colors.length;

    return (
        <div className={'initials' + clssName} style={{ backgroundColor: colors[index] }}>
            {initials}
        </div>
    );
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

