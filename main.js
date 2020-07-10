// @ts-nocheck
require('./src/global_constants');
require('./src/global_functions');

const Knex = require('knex');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const knexConfig = require("./knexfile");
const cors = require('cors');
const path = require("path");
const port = process.env.PORT || 8000;
const {
  Model
} = require('objection');

// Routes for API



// Initialize knex.
// const knex = Knex(knexConfig[process.env.NODE_ENV || 'local']);
const knex = Knex(knexConfig['development']);
// const knex = Knex(knexConfig['production']);

// Bind all Models to a knex instance. If you only have one database in
// your server this is all you have to do. For multi database systems, see
// the Model.bindKnex method.
Model.knex(knex);


const app = express()
  .use(bodyParser.json())
  .use(morgan('dev'))
  .use(router)
  .use(cors({
    credentials: true,
    origin: (origin, callback) => callback(null, true),
  }))
app.use(express.static(path.join(__dirname, 'public')))

// Rest API endpoints


app.use('/', (req, res) => {
  res.statusCode = 404; //send the appropriate status code
  res.json({
    status: false,
    message: 'Sorry, API does not exist!',
    data: {},
    code: 404
  });
});



const server = app.listen(port, () => {
  console.log('Example app listening at port %s', server.address().port);
});