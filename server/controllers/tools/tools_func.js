function parseDate(date) {
    date = (new Date(date)).toISOString();
    date = date.replace('T', ' ');
    date = date.split('.')[0];
    return date;
}

module.exports = {
    parseDate
};

