const express = require('express');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ruta = express.Router();
//const joi = require('joi');
const Usuario = require('../models/usuario_model');


ruta.post('/', (req, res) => {
    Usuario.findOne({email: req.body.email})
        .then(datos => {
            if(datos){
                const passwordValido = bcrypt.compareSync(req.body.password, datos.password);
                if(!passwordValido) return res.status(400).json({error: 'ok', msj: 'Usuario o contraseña incorrecta'});
                const jwToken = jwt.sign({
                    data: {_id: datos._id, nombre: datos.nombre, email: datos.email}
                  }, config.get('configToken.SEED'), { expiresIn: config.get('configToken.expiration') });
                //jwt.sign({_id: datos._id, nombre: datos.nombre, email: datos.email}, 'password')
                res.json({
                    usuario:{
                        _id     :datos._id,
                        nombre  :datos.nombre,
                        email   :datos.email
                    },
                    jwToken
                });
            }else{
                res.status(400).json({
                    error   : 'ok',
                    mje     : 'Usuario o contraseña incorrecta'
                })
            }
        })
        .catch(err => {
            res.status(400).json({
                error   : 'ok',
                mje     : 'Error en el servicio' + err
            })
        })
})

module.exports = ruta;