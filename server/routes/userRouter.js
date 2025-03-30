const express = require('express')

const router = express.Router()

const User = require('../models/userModel')

router.post('/create-user', (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    })

    user.save((err, user) => {
        if (err) {
            console.log("hello", user);
            
            res.status(400).send({ error : err})
        } else {
            console.log("hello", user);
            res.status(200).send({ data: user})
        }
    })
})


module.exports = router