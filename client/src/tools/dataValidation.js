function checkPasswordConfirmation(password, passwordConfirmation, setPasswordConfirmationMessage) {
    if (password !== passwordConfirmation) {
        setPasswordConfirmationMessage("Password and password confirmation do not match");
        return false;
    }
    return true;
}

function validatePassword(password, setPasswordMessage) {
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
        setPasswordMessage("Password must containt only a-z, A-Z, 0-9");
        return false;
    }
    if (!/(?=.*\d)/.test(password)) {
        setPasswordMessage("Password must containt at least one digit");
        return false;
    }
    if (!/(?=.*[a-z])/.test(password)) {
        setPasswordMessage("Password must containt at least one lowercase letter");
        return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        setPasswordMessage("Password must containt at least one uppercase letter");
        return false;
    }
    return true;
}

function validateLogin(login, setLoginMessage) {
    if (!login) {
        setLoginMessage("Login is required");
        return false;
    }
    if (login.length < 2 || login.length > 50) {
        setLoginMessage("Login length must be from 2 to 50 characters");
        return false;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(login)) {
        setLoginMessage("Login must containt only a-z, A-Z, 0-9 or whitespace");
        return false;
    }
    return true;
}

function validateFullName(fullName, setFullNameMessage) {
    if (!fullName) {
        setFullNameMessage("Full name is required");
        return false;
    }
    if (fullName.length < 2 || fullName.length > 50) {
        setFullNameMessage("Full name length must be from 2 to 50 characters");
        return false;
    }
    if (!/^[a-zA-Z ]+$/.test(fullName)) {
        setFullNameMessage("Full name must containt only a-z, A-Z or whitespace");
        return false;
    }
    return true;
}

function validateEmail(email, setEmailMessage) {
    let re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
    if (!email) {
        setEmailMessage("Email is required");
        return false;
    }
    if (email.length > 200) {
        setEmailMessage("Email length must be less than 200 characters");
        return false;
    }
    if (!re.test(email)) {
        setEmailMessage("Validation isEmail on email failed");
        return false;
    }
    return true;
}

function validateName(name, setNameMessage) {
    if (!name) {
        setNameMessage("Title is required");
        return false;
    }
    if (name.length > 200) {
        setNameMessage("Title length must be less than 200 characters");
        return false;
    }
    return true;
}

function validateDescription(description, setDescriptionMessage) {
    if (description && description.length > 65000) {
        setDescriptionMessage("Description length must be less than 65000 characters");
        return false;
    }
    return true;
}

function validateDate(dateFrom, dateTo, setDateToMessage) {
    dateFrom = (new Date(dateFrom)).getTime();
    dateTo = (new Date(dateTo)).getTime();

    if (dateTo - dateFrom <= 0) {
        setDateToMessage("Date to must be greater than date from");
        return false;
    }
    return true;
}

export {
    checkPasswordConfirmation,
    validatePassword,
    validateLogin,
    validateFullName,
    validateEmail,
    validateName,
    validateDescription,
    validateDate
};

