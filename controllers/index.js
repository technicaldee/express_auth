const {validationResult} = require('express-validator')
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const {SECRET} = process.env

exports.loginUser = async(req, res) => {
    // Error check
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {email, password} = req.body;

    try{
        let user = await User.findOne({email});

        if(!user) return res.status(400).json({
            statusCode: 400,
            message: 'Invalid Credentials'
        });

        // check pass
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400)
            .json({
                statusCode: 400,
                message: "Invalid credentials"
            });

        }

        const payload = {
            user: {
                id: user.id,
                role: user.userRole
            }
        };

        jwt.sign(
            payload,
            SECRET,
            {
                expiresIn: 360000
            },
            (err, token)=>{
                if(err) throw err
                
                res.json({
                    statusCode: 200,
                    message: "Logged in successfully",
                    user: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        userRole: user.userRole,
                        isTutor: user.isTutor,
                        isAdmin: user.isAdmin
                    },
                    token
                })
            }
        )
    } catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.registerUser = async(req, res) => {
    // Error check
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {email, password, firstName, lastName, userRole, isTutor, isAdmin} = req.body;

    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    // create hashed password
    const hashedPass = await bcrypt.hash(password, salt);

    try{
        let user = new User({firstName, lastName, email, password: hashedPass, userRole, isTutor, isAdmin});

        // run save
        user.save()
        .then(() => {
            console.log("Saved User")
            res.status(201).json({message: "Successfully registered user"})
        })
        .catch((err) => console.log(err))
    } catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.getLoggedInUser = async (req, res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');

        res.json({
            statusCode: 200,
            message: "User gotten",
            user
        });
    } catch {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}

exports.recoverPassword = async (req, res)=>{
    const {email} = req.body
    const user = await User.findOne({ email });
    const generatedLink = `${process.env.BASE_URL}/api/auth/reset/${user._id}`;
    
    User.countDocuments({email : email}, function (err, count) {
        if(!count > 0){
            res.status(401).json({message: 'email or user does not exist'});
        }else{
            // Transporter
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            })

            let mailOptions = {
                from: 'gisthive@gmail.com',
                to: email,
                subject: 'Password Recovery',
                text: generatedLink
            }

            // Response
            transporter.sendMail(mailOptions)
                .then(function(response){
                    console.log('Email Sent')
                    res.status(200).json({ message: "Password reset link has been sent successfully" });
                })
                .catch(function(error){
                    res.status(401).json({ success: "An Error has occured" });
                    console.log('Error: ', error)
                });
        }
    });
}

exports.logOutUser = async (req, res)=>{
    if(req.user.deleteToken()){
        return res.status(200).send({message: 'successfully logged out'})
    } else {
        return res.status(500).send({message: 'An error occured'})
    }
    
}

exports.resetPassword = async (req, res) => {
    try {
        const { password, password2 } = req.body;
        const { id } = req.params;

        // confirm similarity
        if (password !== password2) {
          res.status(400).json({message: "Sorry passwords should match"});
        }
    
        // grab user
        const user = await User.findById({_id: id});
    
        // hash generate genSalt
        const salt = await bcrypt.genSalt(10);
        // create hashedpwd
        const hashedPwd = await bcrypt.hash(password, salt);
    
        // update user password with new password
        user.password = hashedPwd;
    
        await user.save();
    
        res.status(200).json({ message: "Your new password has been set successfully" });
      } catch (error) {
        res.status(400).json({message:"Sorry, failed to reset user password"});
      }
}

exports.getLoggedInStaff = async(req, res)=>{

    try{
        const user = await User.findById(req.user.id).select('-password');

        if(user.userRole != "staff"){
            return res.status(401).send({message: 'Unauthorized Access'})
        }

        res.json({
            statusCode: 200,
            message: "Staff gotten",
            user
        });
    } catch {
        console.error(err.message)
        res.status(500).send({message:'Server Error'})
    }
}

exports.getLoggedInManager = async(req, res)=>{

    try{
        const user = await User.findById(req.user.id).select('-password');

        if(user.userRole != "manager"){
            return res.status(401).send({message: 'Unauthorized Access'})
        }

        res.json({
            statusCode: 200,
            message: "Manager gotten",
            user
        });
    } catch {
        console.error(err.message)
        res.status(500).send({message:'Server Error'})
    }
}

exports.getLoggedInAdmin = async(req, res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');

        if(user.userRole != "admin"){
            return res.status(401).send({message: 'Unauthorized Access'})
        }

        res.json({
            statusCode: 200,
            message: "Admin gotten",
            user
        });
    } catch {
        console.error(err.message)
        res.status(500).send({message:'Server Error'})
    }
}