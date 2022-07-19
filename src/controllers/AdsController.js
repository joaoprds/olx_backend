const { v4: uuid} = require('uuid');
const jimp = require('jimp');
const Category = require('../models/Category');
const User = require('../models/Users');
const Ads = require('../models/Ads');
const StateModel = require('../models/State');

const addimage = async (buffer) => {
    let newName = `${uuid()}.jpg`;
    let tmpimg = await jimp.read(buffer);
    tmpimg.cover(500, 500).quality(80).write(`./public/media/${newName}`)
    return newName;
}

module.exports = {
    getCategories: async (req, res) => {
        const cats = await Category.find();

        let categories = [];

        for (let i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BAS}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({
            categories
        });

    },
    addAction: async (req, res) => {
        let {
            title,
            price,
            priceneg,
            desc,
            cat,
            token
        } = req.body;
        const user = await User.findOne({
            token
        }).exec();
        if (!title || !cat) {
            res.json({
                error: 'Titulo e/ou categoria não foram preenchidos'
            })
            return;
        }


        if(cat.length < 12){
            res.json({error: 'categoria inexistente'});
            return;
        }

        const category = await category.findById(cat);
        if(!category){
            res.json({error: 'categoria inexistente'})
            return;
        }

        if (price) {
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '');
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
            newAds.priceNegotiable = (priceneg == 'true') ? true : false,
            newAds.description = desc,
            newAds.views = 0;

        if (req.files && req.files.img) {
            if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.minetype)) {
                let url = await addimage(req.files.img.data)
                newAds.images.push({
                    url,
                    default: false
                });
            } else {
                for (let i = 0; i < req.files.img.length; i++) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].minetype)) {
                        let url = await addimage(req.files.img[i].data)
                        newAds.images.push({
                            url,
                            default: false
                        });
                    }
                }
            }
        }

        if (newAds.images.length > 0) {
            newAds.images[0].default = true;
        }

        const info = await newAds.save();
        res.json({
            newAds: info._id
        });

    },
    getList: async (req, res) => {
        let {sort = 'asc', offset = 0, limit = 8, q, cat, state,} = req.query;
        let filters = {Status: true};
        let total = 0;

        if(q){
            filters.title = {'$regex': q, '$options': 'i'};
        }

        if(cat){
            const c = await Category.findOne({slug: cat}).exec();
            if(c) {
                filters.category = c._id.toString();
            }
        }

        if(state){
            const s = await StateModel.findOne({name: state.toUpperCase()}).exec()
            if(s) {
                filters.state = s._id.toString();
            }
        }

        const adsTotal = await Ads.find(filters).exec();
        total = adsTotal.length;

        const adsData = await Ads.find(filters)
            .sort({dateCreated: (sort=='desc'?-1:1)})
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec();
            
        let ads = [];
        for(let i in adsData){
            let image;

            let defaultImg = adsData[i].images.find(e => e.default);
            if(defaultImg){
                image = `${process.env.BASE}/media/${defaultImg.url}`
            }else {
                image = `${process.env.BASE}/media/default.jpg`
            }

            ads.push({
                id: adsData[i]._id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image
            })
        }

        res.json({ads, total})

    },
    getItem: async (req, res) => {
        let {id, other = null} = req.query;

        if(!id){
            res.json({ error: 'Sem Produto'})
            return;
        }

        const ad = await Ads.findById(id);
        if(!ad) {
            res.json({error: 'Produto inexistente'})
            return;
        }

        ad.views++
        await ad.save();

        let images = []
        for(let i in ad.images){
            images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
        }

        let category = await Category.findById(ad.category).exec();
        let userInfo = await User.findById(ad.idUser).exec();
        let stateInfo = await StateModel.findById(ad.state).exec();

        let others = []
        if(other) {
            const otherData = await ad.find({status: true, idUser: ad.idUser}).exec();

            for(let i in otherData) {
                if(otherData[i]._id.toString() != ad._id.toString()){
                    let image = `${process.env.BASE}/media/default.jpg`;

                    let defaultImg = otherData[i].images.find(e => e.default)
                    if(defaultImg){
                        image = `${process.env.BASE}/media/${defaultImg.url}`;
                    }



                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        priceNegotiable: otherData[i].priceNegotiable,
                        image
                    })
                }
            }
        }

        res.json({
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images,
            category,
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            stateName: stateInfo.name,
            others
        })

    },
    editAction: async (req, res) => {
        let {id} = req.params;
        let {title, status, price, priceneg, desc, cat, images, token} = req.body;

        if(id.length < 12){
            res.json({error: 'ID invalido'})
        }

        const ad = await Ads.findById(id).exec();

        if(!ad){
            res.json({error: 'Anúncio inexistente'})
            return;
        }

        const user = await User.findOne({token}).exec();
        if(user._id.toString() !== ad.idUser){
            res.json({error: 'Este anúncio não é seu'})
            return;
        }

        let updates = {};

        if(title){
            updates.title = title
        }
        if (price) {
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '');
            price = parseFloat(price);
            updates.price = price;
        } 
        if(priceneg){
            updates.priceNegotiable = priceneg;
        }
        if(status){
            updates.status = status;
        }
        if(desc) {
            updates.description = desc;
        }
        if(cat){
            const category = await Category.findOne({slug: cat}).exec();
            if(!category){
                res.json({error: 'Categoria inexistente'});
                return;
            }
            updates.category = category._id.toString();
        }
        
        if(images){
            updates.images = images
        }

        await ad.findByIdAndUpdate(id, {set: updates});

        if(req.files && req.files.img) {
            const adI = await Ad.findById(id);

            if(req.files.img.length == undefined) {
                if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data);
                    adI.images.push({
                        url,
                        default: false
                    });
                }
            } else {
                for(let i=0; i < req.files.img.length; i++) {
                    if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                        let url = await addImage(req.files.img[i].data);
                        adI.images.push({
                            url,
                            default: false
                        });
                    }
                }
            }

            adI.images = [...adI.images];
            await adI.save();
        }

        res.json({error: ''});
    }
};