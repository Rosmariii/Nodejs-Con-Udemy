const express = require('express');
const bcrypt = require('bcrypt');
const ruta = express.Router();
const joi = require('joi');
const Usuario = require('../models/usuario_model');


const Joi = require('joi');

const schema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(10)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})

ruta.get('/', (req, res) => {
    let resultado = listarUsuariosActivos();
    resultado.then(usuarios => {
        res.json(usuarios)
    }).catch(err => {
        res.status(400).json({err})
    })
});

ruta.post('/', (req, res) =>{
    let body = req.body;

    Usuario.findOne({email: body.email}, (err, user) => {
        if(err) {
            return res.status(400).json({error: 'server error'})
        }
        if(user) {
            return res.status(400).json({mje: 'El usuario ya existe'});
        }
    })

    const {error, value} = schema.validate({nombre: body.nombre, email: body.email});
    if(!error){
    let resultado = crearUsuario(body);
        
        resultado.then(user => {
            res.json({
                nombre: user.nombre,
                email: user.email
            })
        }).catch( err => {
            res.status(400).json({'error': error})
        });
     } else {
        res.status(400).json({ error: error})
    }
    
});

ruta.put('/:email', (req, res) => {

    const {error, value} = schema.validate({nombre: req.body.nombre});

    if(!error) {
        let resultado = actualizarUsuario(req.params.email, req.body);
        resultado.then(valor =>{
            res.json({
                nombre: valor.nombre,
                email: valor.email
            })
        }).catch( err => {
            res.json({err})
        }) 
    } else {
        res.status(400).json({error})
    }
   
})

ruta.delete('/:email', (req, res) => {
    console.log(req.params.email)
    let resultado = desactivarUsuario(req.params.email);
    resultado.then(valor => { console.log(valor)
        res.json({
            nombre: valor.nombre,
            email: valor.email
        })
    }).catch( err => { console.log("b")
        res.status(400).json({
            err
        })
    })
})


async function crearUsuario(body){
    let usuario = new Usuario({
        email       : body.email,
        nombre      : body.nombre,
        password    : bcrypt.hashSync(body.password, 10)
    });
    return await usuario.save();
}


async function actualizarUsuario(email, body){
    let usuario = await Usuario.findOneAndUpdate({"email": email}, {
        $set: {
            nombre      : body.nombre,
            password    : body.password
        }
    }, {new:true});
    return usuario;
}

async function desactivarUsuario(email) {
    let usuario = await Usuario.findOneAndUpdate({"email": email}, {
        $set: {
            estado : false
        }
    }, {new: true, useFindAndModify: false});
    return usuario;
}

async function listarUsuariosActivos(){
    let usuarios = await Usuario.find({"estado": true})
    .select({nombre:1, email:1});
    return usuarios;
}

module.exports = ruta;