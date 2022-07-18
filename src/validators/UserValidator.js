const {checkSchema} = require('express-validator');

module.exports = {
    editAction: checkSchema ({
        token: {
            notEmpty: true

        },
        name: {
            optional: true,
            trim: true,
            isLength: {
                options: {min: 2}
            },
            errorMessage: 'Nome Precisa ter pelo menos 2 caracteres'
        },
        email: {
            optional: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail invalido'
        },
        password: {
            optional: true,
            isLength: {
                options: {min: 6}
            },
            errorMessage: 'Senha minimo 6 caracteres'
        },
        state: {
            optional: true,
            notEmpty: true,
            errorMessage: 'Estado não preenchido'
        }
    })
}