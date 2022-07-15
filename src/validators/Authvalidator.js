const {checkSchema} = require('express-validator');

module.exports = {
    signup: checkSchema ({
        name: {
            trim: true,
            isLength: {
                options: {min: 2}
            },
            errorMessage: 'Nome Precisa ter pelo menos 2 caracteres'
        },
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail invalido'
        },
        password: {
            isLength: {
                options: {min: 6}
            },
            errorMessage: 'Senha minimo 6 caracteres'
        },
        state: {
            notEmpty: true,
            errorMessage: 'Estado não preenchido'
        }
    }),
    signin: checkSchema({
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail invalido'
        },
        password: {
            isLength: {
                options: {min: 6}
            },
            errorMessage: 'Senha minimo 6 caracteres'
        }
    })
}