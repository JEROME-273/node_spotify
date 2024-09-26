const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const routes = require('./routes/router');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(9000 ,'localhost', ()=>{
    console.log('server running');
})