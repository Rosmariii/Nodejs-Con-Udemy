const express = require('express');
const mongoose = require('mongoose');
const usuarios = require('./routes/usuarios');
const cursos = require('./routes/cursos');

mongoose.connect('mongodb://localhost:27017/demo', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('conectado a MongoDB...'))
    .catch(err => console.log('no se pudo conectar con MongoDB', err));

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/usuarios', usuarios);
app.use('/api/cursos', cursos);



const port= process.env.PORT || 3003;
app.listen(port, () => {
    console.log('Api RESTFull ok, y ejecutandose...');
})