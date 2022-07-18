const {validationResult, matchedData} = require('express-validator');
const State = require('../models/State')
const User = require('../models/Users')
const Category = require('../models/Category')
const Ads = require('../models/Ads')
module.exports ={
    getStates: async (req, res) => {
        let states = await State.find();
        res.json({states});
    },
    info: async (req, res) => {
        let token = req.query.token;
        const user = await User.findOne({token});
        const state = await State.findById(user.state);
        const ads = await Ads.find({idUser: user_.id.toString()});

        let adsList = [];
        for(let i in ads) {

            const cat = await Category.findById(ads[i].Category)
            adsList.push({...ads[i], category: cat})
        }

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            ads: adsList
        })


    },
    editAction: async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            res.json({error: errors.mapped()})
            return;
        }
        const data = matchedData(req);

        res.json({});

    },
    
    
};