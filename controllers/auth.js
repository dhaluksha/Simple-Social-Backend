const Joi = require('joi');
const httpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const helpers = require('../helpers/helpers');
const dbConfig = require('../config/secret');

module.exports = {
    async CreateUser(req, res) {
        const schema = Joi.object().keys({
            username: Joi.string()
                .min(3)
                .max(10)
                .required(),

            email: Joi.string()
                .email()
                .required(),

            password: Joi.string()
                .min(5).
                required()
        });

        let {error, value} = schema.validate(req.body);
        if (error && error.details) {
            return res.status(500).json( {msg: error.details })
            
        }


        const userEmail = await User.findOne({ email: helpers.lowerCase(req.body.email) });
        if (userEmail) {
            return res.status(409).json({
                message: 'Email already exists'
            })
        }
        const userName = await User.findOne({ username: helpers.firstUpperCase(req.body.username)});
        if (userName) {
            return res.status(409).json({ message: 'Username already Exists' })
        }
        
        return bcrypt.hash(value.password, 10, (err, hash) => {
            if (err) {
                return res.status(400).json({ message: 'Error Hashing password' })
            }
           const body ={
                username: helpers.firstUpperCase(value.username),
                email: helpers.lowerCase(value.email),
                password: hash
            }
            User.create(body).then(user => {
                const token = jwt.sign({data: user}, dbConfig.secret, {
                    expiresIn: "5h"
                });
                res.cookie('auth', token)

                res.status(201).json({
                    message: 'User Created Successfully',
                    user, token
                })
            }).catch(err => {
                res.status(500).json({
                    message: 'Error Occured'
                })
            });
        })
    },

    // Login User Method
    async LoginUser(req,res){
        if(!req.body.username || !req.body.password){
            return res.status(404).json({
                message: 'No empty fields allowed'
            })
        }
        await User.findOne({username: helpers.firstUpperCase(req.body.username)}).then(user => {
            if(!user){
                return res.status(404).json({
                    message: 'Username not found'
                })
            }
            return bcrypt.compare(req.body.password, user.password).then(result => {
                if(!result){
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                        message: 'Password is incorrect'
                    })
                }
                const token = jwt.sign({data: user}, dbConfig.secret, {
                    expiresIn: "5h"
                });
                res.cookie('auth', token);
                return res.status(200).json({message: 'Login Successfully', user, token})
            })
        })
        .catch( err => {
            return res.status(500).json({
                message: 'Error Occured'
            })
        })
    }
};