const express = require('express')
const { models } = require('mongoose')
const router = express.Router()
const User = require('../models/users')
const multer = require('multer')
const fs = require('fs')
const { log } = require('console')

// image upload

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname)
    }
})

let upload = multer({
    storage: storage
}).single('image')

// insert user to db

router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        })
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        }
        res.redirect('/')
      } catch (error) {
        return res.render("error", { errorMessage: error.message });
      }
})

router.get('/', (req, res) => {

User.find().then((users) => {
    res.render('index', {
        title: 'Home page',
        users: users
    })
})
})

router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add users' })
})

router.get('/edit/:id', (req, res) => {
    let id = req.params.id
    User.findById(id).then((user) => {
        res.render('edit_user', {
            title: 'Edit user',
            user: user
        })
    })
})

router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id
    let new_image = ''
    if(req.file){
        new_image = req.file.filename
        try {
            fs.unlinkSync('./uploads/'+req.body.old_image)
        } catch (error) {
            console.log(error);
        }
    } else {
        new_image = req.body.old_image
    }
    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    })
    .then((result) => {
        req.session.message = {
            type: 'success',
            message: 'User updated successfully '
        }
        res.redirect('/')
        console.log(result)
    })
    .catch((err) => console.log(err) )
})

router.get('/delete/:id', (req, res) => {
    let id = req.params.id
    User.findByIdAndDelete(id)
    .then((result) => {
        if(result.image != ''){
            try {
                fs.unlinkSync('./uploads/'+result.image)
            } catch (error) {
                console.log(error);
            }
        }
        req.session.message = {
            type: 'success',
            message: 'User deleted successfully'
        }
        res.redirect('/')
    })
})

module.exports = router;
