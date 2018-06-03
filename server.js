/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */

const TORCH_ID = 'ac233fa039bb'; // Configure the torch ID here
const HTTP_PORT = 3000;


const http = require('http');
const express = require('express');
const barnowl = require('barnowl');
const socketio = require('socket.io');
const path = require('path');


var app = express();
app.use(express.static(path.resolve(__dirname + '/public')));
var server = http.createServer(app);
var io = socketio(server);

server.listen(HTTP_PORT, function() {
  console.log("barnowl-torch is listening on port " + HTTP_PORT);
});


// Create a new barnowl instance and bind it to the serial port
var middleware = new barnowl( { n: 1, enableMixing: false } );
middleware.bind( { protocol: 'serial', path: 'auto' } );

// Handle radio decodings
middleware.on('visibilityEvent', function(tiraid) {
  if((tiraid.identifier.value === TORCH_ID) &&
     (tiraid.identifier.advData.hasOwnProperty('serviceData')) &&
     (tiraid.identifier.advData.serviceData.uuid === 'ffe1') &&
     (tiraid.identifier.advData.serviceData.minew.productModel === 3)) {
    var minew = tiraid.identifier.advData.serviceData.minew;

    var verticalDeviationX = calculateOrientationAngle(minew.accelerationX);
    var verticalDeviationZ = calculateOrientationAngle(minew.accelerationZ);
    var maxVerticalDeviation = verticalDeviationX;
    if(Math.abs(verticalDeviationZ) > Math.abs(verticalDeviationX)) {
      maxVerticalDeviation = verticalDeviationZ;
    }

    var verticalDeviations = {
      x: verticalDeviationX,
      z: verticalDeviationZ,
      maximum: maxVerticalDeviation
    };
    
    console.log(JSON.stringify(minew, null, " "));
    console.log(JSON.stringify(verticalDeviations, null, " "));

    io.emit('torch', { minew: minew, verticalDeviations: verticalDeviations });
  }
});

function testEmitter() {
  var verticalDeviations = {
    x: 0.1+Math.random()*0.1,
    z: 0.1+Math.random()*0.1,
    maximum: 0.1+Math.random()*0.1
  };
  console.log('Sending test data...');
  io.emit('torch', { minew: 'foo', verticalDeviations: verticalDeviations });
}

//setInterval(testEmitter, 2000);


// Calculate the orientation angle from the acceleration in the given axis.
function calculateOrientationAngle(acceleration) {
  if(acceleration > 1) {
    return -1;
  }
  if(acceleration < -1) {
    return 1;
  }
  return ((Math.acos(acceleration) * 2 / Math.PI) - 1);
}
