const Joi=require('joi');

module.exports.listingSchema=Joi.object({
    new_edit_listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null),
    }).required(),
});