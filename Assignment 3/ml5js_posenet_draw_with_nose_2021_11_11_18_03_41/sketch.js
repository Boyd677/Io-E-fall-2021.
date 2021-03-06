// William Boyd

// I used the same arduino code from assignment 1 for this assignment 3. 

// Sounds downloaded from https://freesound.org/people/ITheRealGooglekatClaire/sounds/607723/
// video flip from daniel Shiffman https://www.youtube.com/watch?v=EA3-k9mnLHs
// base code for the drawing p5js https://editor.p5js.org/AndreasRef/sketches/r1_w73FhQ
// Clear function p5JS https://p5js.org/reference/#/p5/clear
// Create Audio Function p5JS https://p5js.org/reference/#/p5/createAudio
// Arduino Code and other elements were used from Class and passed assignments for project 2


//Attempted and failed code
// slider for volume control https://p5js.org/reference/#/p5/createSlider
// volume p5Js https://p5js.org/reference/#/p5.MediaElement/volume
// set volume P5JS https://p5js.org/reference/#/p5.SoundFile/setVolume

let video;
let poseNet; 
let poses = [];
let skeletons = [];

let pg;
let noseX;
let noseY;

let pNoseX;
let pNoseY;

let serial;
let latestData = "waiting for data";
let input = 0;
let potent;
let light;
let song;
// var slider;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  pixelDensity(1);
  pg = createGraphics(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);

  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();

  ///////////////////////////////////////////////////////////////////
    //Begin serialport library methods, this is using callbacks
///////////////////////////////////////////////////////////////////    
    

  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Get a list the ports available
  // You should have a callback defined to see the results
  serial.list();
  console.log("serial.list()   ", serial.list());

  //////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open("/dev/tty.usbmodem14101");
 /////////////////////////////////////////////////////////////////////////////
 ///////////////////////////////////////////////////////////////////////////
 ////////////////////////////////////////////////////////////////////////////
  // Here are the callbacks that you can register

  // When we connect to the underlying server
  serial.on('connected', serverConnected);

  // When we get a list of serial ports that are available
  serial.on('list', gotList);
  // OR
  //serial.onList(gotList);

  // When we some data from the serial port
  serial.on('data', gotData);
  // OR
  //serial.onData(gotData);

  // When or if we get an error
  serial.on('error', gotError);
  // OR
  //serial.onError(gotError);

  // When our serial port is opened and ready for read/write
  serial.on('open', gotOpen);
  // OR
  //serial.onOpen(gotOpen);

  // Callback to get the raw data, as it comes in for handling yourself
  //serial.on('rawdata', gotRawData);
  // OR
  //serial.onRawData(gotRawData);

  song = createAudio('sounds/sound.mp3');
// slider = createSlider(0, 1, potent, 0.1);
 
}
////////////////////////////////////////////////////////////////////////////
// End serialport callbacks
///////////////////////////////////////////////////////////////////////////


// We are connected and ready to go
function serverConnected() {
  console.log("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
  console.log("List of Serial Ports:");
  // theList is an array of their names
  for (var i = 0; i < thelist.length; i++) {
    // Display in the console
    console.log(i + " " + thelist[i]);
  }
}

// Connected to our serial device
function gotOpen() {
  console.log("Serial Port is Open");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
  console.log(theerror);
}



// There is data available to work with from the serial port
function gotData() {
  var currentString = serial.readLine();  // read the incoming string
  trim(currentString);                    // remove any trailing whitespace
  if (!currentString) return;             // if the string is empty, do no more
  console.log("currentString  ", currentString);             // println the string
  latestData = currentString;            // save it for the draw method
  console.log("latestData" + latestData);   //check to see if data is coming in
  splitter = split(latestData, ',');       // split each number using the comma as a delimiter
  //console.log("splitter[0]" + splitter[0]); 
  input = splitter[0]; 
potent = splitter[1];
light = splitter [2];

}

// We got raw data from the serial port
function gotRawData(thedata) {
  println("gotRawData" + thedata);
}


function draw() {
  translate(video.width,0);
  scale(-1,1);
  image(video, 0, 0, width, height);

  image(pg, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  // soundPlay();
  //drawSkeleton();

// if (input == 0){
//   drawKeypoints();
// }
if (input == 1){
  soundPlay();
}
if(light <3){
  envelope();
}

}
// function songPlay(){
//   if(input == 1){
//   pg.clear();
//   // background(255,255,255);
// }
// }
// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < min(poses.length, 1); i++) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        if (j == 0) {
          noseX = keypoint.position.x;
          noseY = keypoint.position.y;

          pg.stroke(potent/2, light*4, light);
          pg.strokeWeight(potent/8);
          pg.line (noseX, noseY, pNoseX, pNoseY);

          pNoseX = noseX;
          pNoseY = noseY;
        }
      }
    }
  }
}

function soundPlay(){
  if(input == 1){
    song.play();
    // song.setVolume(slider.value());
    
  }
  else{
    if(input == 0){
      song.stop();
    }
  }
}
function envelope(){
  if(light == 2){
    pg.clear();
    song.stop();
    // background(200,200,200);
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    // For every skeleton, loop through all body connections
    for (let j = 0; j < poses[i].skeleton.length; j++) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

// The callback that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

// function keyPressed() {
//   pg.clear();
// }

function modelReady() {
  select('#status').html('Hey Buddy');
}

