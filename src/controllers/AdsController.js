const uuid = require('uuid');
const jimp = require('jimp');
const Category = require('../models/Category');
const User = require('../models/Users');
const Ads = require('../models/Ads');

const addimage = async (buffer) => {
    let newName = `${uuid()}.jpg`;
    let tmpimg = await jimp.read(buffer);
    tmpimg.cover(500, 500).quality(80).write(`./public/media/${newName}`)
    return newName;
}

module.exports ={
    getCategories: async (req, res) => {
        const cats = await Category.find();

        let categories = [];

        for(let i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BAS}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({categories});

    },
    addAction: async (req, res) => {
        let {title, price, priceneg, desc, cat, token} = req.body;
        const user = await User.findOne({token}).exec();
        if(!title || !cat){
            res.json({error: 'Titulo e/ou categoria não foram preenchidos'})
            return;
        }

        if(price){
            price = price.replace('.', '').replace(',', '.').replace('R$ ','');
            price = parseFloat(price);
        } else {
            price = 0
        }

        const newAds = new Ads()
        newAds.status = true,
        newAds.idUser = user._id,
        newAds.state = user.state,
        newAds.dateCreated = new Date(),
        newAds.title = title,
        newAds.category = cat,
        newAds.price = price,
        newAds.priceNegotiable = (priceneg=='true') ? true : false,
        newAds.description = desc,
        newAds.views = 0;

        if(req.files && req.files.img){
           if(re.files.img.length == undefined){ 

           } else {

           }
        }

        const info = await newAds.save();
        res.json({newAds: info._id});

    },
    getList: async (req, res) => {

    },
    getItem: async (req, res) => {

    },
    editAction: async (req, res) => {

    }
};