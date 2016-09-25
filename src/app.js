// Thanks to MDN for Gamepad API documentation
// https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API

var canvas, ctx;

var hasPressedA = false, timePressedA = 0;
var imgXboxAButton;
var gamepads = [];
var hasStarted = false;
var gameStart = 0;
var imagesLoaded = false;
var images = {};
var pressedButtons = [];

var BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LEFT_BUMPER: 4,
  RIGHT_BUMPER: 5,
  LEFT_TRIGGER: 6,
  RIGHT_TRIGGER: 7,
  BACK: 8,
  START: 9,
  LEFT_STICK: 10,
  RIGHT_STICK: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
}

var i = 0;

function update() {
  var currGamepads = navigator.getGamepads();
  gamepads = [];
  for (gamepad of currGamepads) {
    if (gamepad !== undefined) {
      gamepads[gamepad.index] = gamepad;
    }
  }

  if (hasStarted && gamepads.length === 0) {
    hasStarted = false;
  }

  if (gamepads.length > 0) {
    pressedButtons = gamepads[0].buttons.reduce(function(arr, currButton, idx) {
      if (currButton.pressed && !arr.includes(idx))
        return arr.concat(idx);
      else if (!currButton.pressed && arr.includes(idx))
        return arr.filter(function(i) { return i !== idx });
      return arr;
    }, [])
  }

  hasPressedA = gamepads.reduce(function(result, currGamepad) {
    return result || currGamepad.buttons[BUTTONS.A].pressed;
  }, false);
  if (hasPressedA) {
    timePressedA = new Date().valueOf();
  }
  if (!hasStarted && hasPressedA) {
    hasStarted = true;
    gameStart = timePressedA;
  }
}

function draw(tick) {
  // clear the background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!imagesLoaded) return;

  var timeDiff = tick - gameStart;
  if (!hasStarted || timeDiff < 1000) {
    ctx.save();

    // Once the A button has been pressed, start a fade out using globalAlpha
    if (hasStarted) {
      ctx.globalAlpha = 1 - (timeDiff / 1000);
    }

    // Display the text and the image for 'A' button
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    var x = (canvas.width - images['A'].width) / 2;
    var y = (canvas.height / 2);
    var text = 'Press';
    var textLength = ctx.measureText(text).width;
    ctx.fillText(text, x, y);
    ctx.drawImage(images['A'], x + textLength - (images['A'].width / 2), y - (images['A'].height / 2));

    // Display the number of players connected
    ctx.font = '12px Arial';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    var numControllers = gamepads.length;
    var numPlayersText = numControllers === 0 ? 'No controllers connected' : 
      numControllers + ' controller' + (numControllers === 1 ? '' : 's') + ' connected';
    ctx.fillText(numPlayersText, 20, canvas.height - 20);

    ctx.restore();
  } else {
    ctx.save()
    
    var fadeInTime = timeDiff - 1000;
    var isFadingIn = (fadeInTime <= 1000);
    if (isFadingIn) {
      var alpha = (fadeInTime < 1000) ? (fadeInTime / 1000) : 1;
      ctx.globalAlpha = alpha;      
    }
    
    ctx.fillStyle = 'rgb(9, 117, 153)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    


    var imgLeftStick = images['Left Stick'];
    var imgRightStick = images['Right Stick'];
    var imageWidth = imgLeftStick.width;
    var imageHeight = imgLeftStick.height;

    var imgLeftStickX = (canvas.width - imageWidth) / 2;
    var imgLeftStickY = (canvas.height - imageHeight) / 2;
    var imgRightStickX = (canvas.width - imageWidth) / 2;
    var imgRightStickY = (canvas.height - imageHeight) / 2;

    var padding = 20;
    var halfScreenMoveBoundsWidth = (canvas.width - imageWidth - (padding * 2)) / 2;
    var halfScreenMoveBoundsHeight = (canvas.height - imageHeight - (padding * 2)) / 2;

    if (gamepads[0]) {
      imgLeftStickX += halfScreenMoveBoundsWidth * gamepads[0].axes[0];
      imgLeftStickY += halfScreenMoveBoundsHeight * gamepads[0].axes[1];
      imgRightStickX += halfScreenMoveBoundsWidth * gamepads[0].axes[2];
      imgRightStickY += halfScreenMoveBoundsHeight * gamepads[0].axes[3];
    }

    // draw gray oval shadow
    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2, canvas.height / 2, // x and y of center
      (canvas.width - (padding * 2)) / 2, (canvas.height - (padding * 2)) / 2, // x and y radius
      0, // rotation
      0, 2 * Math.PI, // start and end angle (in radians)
      false // anti-clockwise
    );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();

    // draw the image in the middle of the gray area
    ctx.imageSmoothingEnabled = true;    
    ctx.drawImage(imgRightStick,
      imgRightStickX,
      imgRightStickY,
      imageWidth,
      imageHeight
    );
    ctx.drawImage(imgLeftStick,
      imgLeftStickX,
      imgLeftStickY,
      imageWidth,
      imageHeight
    );

    var halfButtonSize = 32;
    ctx.globalAlpha = pressedButtons.includes(BUTTONS.A) ? 1 : 0.5;
    ctx.drawImage(images['A'], canvas.width - 70, canvas.height - 50, halfButtonSize, halfButtonSize);
    ctx.globalAlpha = pressedButtons.includes(BUTTONS.B) ? 1 : 0.5;
    ctx.drawImage(images['B'], canvas.width - 50, canvas.height - 70, halfButtonSize, halfButtonSize);
    ctx.globalAlpha = pressedButtons.includes(BUTTONS.X) ? 1 : 0.5;
    ctx.drawImage(images['X'], canvas.width - 90, canvas.height - 70, halfButtonSize, halfButtonSize);
    ctx.globalAlpha = pressedButtons.includes(BUTTONS.Y) ? 1 : 0.5;
    ctx.drawImage(images['Y'], canvas.width - 70, canvas.height - 90, halfButtonSize, halfButtonSize);

    ctx.globalAlpha = pressedButtons.includes(BUTTONS.LEFT_BUMPER) ? 1 : 0.5;
    ctx.drawImage(images['Left Bumper'], 20, 0);
    ctx.globalAlpha = pressedButtons.includes(BUTTONS.LEFT_TRIGGER) ? 1 : 0.5;
    ctx.drawImage(images['Left Trigger'], 20, 40);

    ctx.globalAlpha = pressedButtons.includes(BUTTONS.RIGHT_BUMPER) ? 1 : 0.5;
    ctx.drawImage(images['Right Bumper'], canvas.width - images['Right Bumper'].width - 20, 0);
    ctx.globalAlpha = pressedButtons.includes(BUTTONS.RIGHT_TRIGGER) ? 1 : 0.5;
    ctx.drawImage(images['Right Trigger'], canvas.width - images['Right Trigger'].width - 20, 40);

    ctx.globalAlpha = 1;

    var DPadImageLeft = padding;
    var DPadImageTop = canvas.height - padding - images['DPad None'].height;
    if (pressedButtons.includes(BUTTONS.DPAD_UP)) {
      ctx.drawImage(images['DPad Up'], DPadImageLeft, DPadImageTop);
    } else if (pressedButtons.includes(BUTTONS.DPAD_DOWN)) {
      ctx.drawImage(images['DPad Down'], DPadImageLeft, DPadImageTop);
    } else if (pressedButtons.includes(BUTTONS.DPAD_LEFT)) {
      ctx.drawImage(images['DPad Left'], DPadImageLeft, DPadImageTop);
    } else if (pressedButtons.includes(BUTTONS.DPAD_RIGHT)) {
      ctx.drawImage(images['DPad Right'], DPadImageLeft, DPadImageTop);
    } else {
      ctx.drawImage(images['DPad None'], DPadImageLeft, DPadImageTop);
    }

    ctx.restore();
  }
}

function loop(tick) {
  update(tick);
  draw(tick);
  requestAnimationFrame(loop.bind(null, new Date().valueOf()));
}


function ImagePromise(filename) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    img.src = filename;
    img.onload = function() {
      resolve(img);
    }
    img.onerror = function(err) {
      reject(err);
    }
  })
}

function loadImages() {
  imagesLoaded = false;

  var imageMetaData = [
    { name: 'A', filename: './img/Xbox360_Button_A.png' },
    { name: 'B', filename: './img/Xbox360_Button_B.png' },
    { name: 'X', filename: './img/Xbox360_Button_X.png' },
    { name: 'Y', filename: './img/Xbox360_Button_Y.png' },
    { name: 'DPad None', filename: './img/Xbox360_Dpad_None.png' },
    { name: 'DPad Up', filename: './img/Xbox360_Dpad_Up.png' },
    { name: 'DPad Down', filename: './img/Xbox360_Dpad_Down.png' },
    { name: 'DPad Left', filename: './img/Xbox360_Dpad_Left.png' },
    { name: 'DPad Right', filename: './img/Xbox360_Dpad_Right.png' },
    { name: 'Left Bumper', filename: './img/Xbox360_Bumper_Left.png' },
    { name: 'Right Bumper', filename: './img/Xbox360_Bumper_Right.png' },
    { name: 'Left Trigger', filename: './img/Xbox360_Trigger_Left.png' },
    { name: 'Right Trigger', filename: './img/Xbox360_Trigger_Right.png' },
    { name: 'Left Stick', filename: './img/Xbox360_Stick_Left.png' },
    { name: 'Right Stick', filename: './img/Xbox360_Stick_Right.png' },
    { name: 'Controller', filename: './img/Xbox360Controller.png' },
  ];

  var imagePromises = imageMetaData.map(function(metaData){
    return new ImagePromise(metaData.filename)
      .then(function(img) { images[metaData.name] = img; });
  });

  Promise.all(imagePromises)
    .then(function() {
      imagesLoaded = true;
    })
};

window.onload = function() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  imgXboxAButton = new Image();
  imgXboxAButton.src = './img/Xbox360_Button_A.png';
  loadImages();

  loop();
}


