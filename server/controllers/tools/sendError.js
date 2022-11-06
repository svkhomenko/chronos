const ValidationError = require('../../errors/ValidationError');

function sendError(err, res) {
    if (err instanceof ValidationError) {
        res.status(err.status)
            .json({ message: err.message });
    }
    else if (err.name == 'SequelizeValidationError') {
        res.status(400)
            .json({ message: err.errors[0].message });
    }
    else {
        console.log('err', err);
        res.status(500)
            .json({ message: err });
    }
}


module.exports = {
    sendError
};

