'use strict';
const functions = require('firebase-functions');
var dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const bodyParser = require('body-parser');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
var requests = require('request');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const translate = require('google-translate-api');
 
function WebhookProcessing(req, res) {
  const agent = new WebhookClient({request: req, response: res});
  console.log('\n\n\nDialogflow Request body: ' + JSON.stringify(req.body));
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function welcomes(agent) {
     
      agent.add('Hey there!Welcome to weather bot. Please select the menu to continue');
      agent.add(new Suggestion('search by place'));
      agent.add(new Suggestion('search by pincode'));
   }

function city(agent){
  agent.add("Please tell me the place");

}
 async function city1(agent){
  var place=req.body.queryResult.queryText
  var json=await appointments(place) 
  console.log("Place=",json.name)
  console.log("weather=",json.weather[0].description)
  console.log("temperature=",json.main.temp)
  console.log("wind speed=",json.wind.speed)
  var name=json.name
  var description=json.weather[0].description
  var temperatureKelvin = json.main.temp
  var tempc=temperatureKelvin - 273.15;
  console.log("temp in degree celcius=",tempc,"°C")
  var speed=json.wind.speed
  agent.add("the weather in "+ name+" has "+description +" with temperature " +tempc+" °C"+" and the wind speed is " +speed)
  agent.add("search by another place ?")
 
}


 
 
  function appointments(a)
  {  
    return new Promise((resolve, reject) => {      
    var requests = require('request');
     const options = {
       method: 'GET',
       url:'http://api.openweathermap.org/data/2.5/weather?appid=90394135324634189b159e52f1286a92&q='+a,
       followAllRedirects: true,
       json: true,
       form: {}
     }
     requests(options, function (err, res, body) {
       if (err) {
         console.log('error while getting api response of createUser');
         console.log(err);

         reject(err);
       } else {
         const json = body;
         //console.log(json);
         resolve(json);
       }
     })
   })
  }
  
  function pincode(agent){
    global.country=req.body.queryResult.queryText
    agent.add("Please tell me the pincode")
  }
 async function pincode1(agent){
  
  global.zipcode=req.body.queryResult.queryText
  console.log("Pincode=",global.zipcode)
  var json=await pincode2(global.zipcode) 
  console.log("Place=",json.name)
  console.log("weather=",json.weather[0].description)
  console.log("temperature=",json.main.temp)
  var description=json.weather[0].description
  var temperatureKelvin = json.main.temp
  var tempc=temperatureKelvin - 273.15;
  console.log("temperature in°C=",tempc,"°C")
  var speed=json.wind.speed
  var name=json.name
  agent.add("the weather in "+ name+" has "+description +" with temperature " +tempc+"°C"+" and the wind speed is " +speed)
  agent.add(" search by another pincode ?")
 

}
  function pincode2(a)
  {  
    return new Promise((resolve, reject) => {      
    var requests = require('request');
     const options = {
       method: 'GET',
       url:'http://api.openweathermap.org/data/2.5/weather?appid=90394135324634189b159e52f1286a92&zip='+a+',in',
       followAllRedirects: true,
       json: true,
       form: {}
     }
     requests(options, function (err, res, body) {
       if (err) {
         console.log('error while getting api response of createUser');
         console.log(err);

         reject(err);
       } else {
         const json = body;
         //console.log(json);
         resolve(json);
       }
     })
   })
  }

  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('welcome', welcomes);
  intentMap.set('city',city);
  intentMap.set('city1',city1);
  intentMap.set('pincode',pincode)
  intentMap.set('pincode1',pincode1)
  agent.handleRequest(intentMap);
}

app.post('/webhook', function (req, res) {
    WebhookProcessing(req, res);
});

app.listen(process.env.PORT, function () {
    console.info(`Webhook listening on port ${process.env.PORT}`)
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'test_token') {
  console.log("OOOOOOOOOOOOOOOOOOOOo")
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});
