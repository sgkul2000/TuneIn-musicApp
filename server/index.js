const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

//middleware
app.use(bodyParser.json());
app.use(cors());

const api = require('./routes/api');
app.use('/api', api);

//handle production
if(process.env.NODE_ENV === 'production'){
  //static folder to public
  app.use(express.static(__dirname + '/public'));
  //handle single page app
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`listening at port: ${port}`);
});
