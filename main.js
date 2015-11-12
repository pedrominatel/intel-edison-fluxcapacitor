var express    = require('express')
var bodyParser = require('body-parser')
var mraa = require('mraa');

var exec = require('child_process').exec;
var ring = 'gst-launch-1.0 filesrc location= /home/root/ring.wav ! wavparse ! pulsesink';
var timeOn = 'gst-launch-1.0 filesrc location= /home/root/time.wav ! wavparse ! pulsesink';

var led_0 = new mraa.Gpio(2);
var led_1 = new mraa.Gpio(3);
var led_2 = new mraa.Gpio(4);
var led_3 = new mraa.Gpio(5);
var led_4 = new mraa.Gpio(6);

led_0.dir(mraa.DIR_OUT);
led_1.dir(mraa.DIR_OUT);
led_2.dir(mraa.DIR_OUT);
led_3.dir(mraa.DIR_OUT);
led_4.dir(mraa.DIR_OUT);

function clearAll() {
    led_0.write(0);
    led_1.write(0);
    led_2.write(0);
    led_3.write(0);
    led_4.write(0);    
}

var ledState = [0,0,0,0,0];
var ledStateBlink = true;
var fluxTime = 0;
var playMusic = true;
var waitFlux = false;
var led = 0;
var task_time = 50;

var toutFlux = function() {
    if (playMusic){
        flux();
        setTimeout(toutFlux,task_time);
    } else {
        clearAll();
    }
}

function waitFluxTmr() {
        playMusic = true;
        task_time = 50;
}

var app = express()

// parse application/json
app.use(bodyParser.json())

app.post('/', function(request, response){
    console.log(request.body);      // your JSON
    response.send(request.body);    // echo the result back
    
    if(request.body.ring == 1){
        console.log("Fluxing!");
        task_time = 5;
        exec(ring, function(error, stdout, stderr) {
            console.log(stdout);
            console.log("Stop!!!!!!!!!!!");
            playMusic = false;
            waitFluxTmr();
        });
    }
});


function flux() {
    
    switch(led) {
        case 0:
            led_0.write(ledState[led]?1:0);
            break;
        case 1:
            led_1.write(ledState[led]?1:0);
            break;
        case 2:
            led_2.write(ledState[led]?1:0);
            break;
        case 3:
            led_3.write(ledState[led]?1:0);

            break;
        case 4:
            led_4.write(ledState[led]?1:0);
            break;
    }
    
    if(led <= 4) {
        ledState[led] = !ledState[led];
        led++;
    }
    else {
        led = 0;
    }
}

exec(timeOn, function(error, stdout, stderr) {
    console.log(stdout);
    toutFlux();
});

clearAll();

app.listen(3000);