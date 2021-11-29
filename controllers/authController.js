const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.signUp = async (req, res, next) => {
    const {username, password} = req.body
    try{
        const hashPassword = await bcrypt.hash(password, 12)
        const newUser = await User.create({
            username,
            password: hashPassword,
        })
        req.session.user = newUser
        res.status(200).json({
            status: 'Success',
            data: {
                user: newUser,
            }
        })
    } catch(err){
        res.status(500).json({
            status: 'fail',
        })
    }
}

exports.login = async (req, res, next) =>{
    const {username, password} = req.body
    try{
        const user = await User.findOne({username})

        if(!user){
            return res.status(404).json({
                status: 'fail',
                message: 'user not found'
            })
        }
       const isCorrect = await bcrypt.compare(password, user.password)
       if(isCorrect){
        req.session.user = user
        res.status(200).json({
            status: 'Success',
            message: `Welcome ${user.username}`
        })
    } else {
        res.status(401).json({
            status: 'fail',
            message: 'Incorrect password or username'
        })
    }
    
} catch(e){
        res.status(500).json({
            status: 'fail',
        })
    }

}