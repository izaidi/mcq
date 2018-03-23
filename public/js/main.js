sparkX = 0;
sparkY = 0;

flameX = 0;
flameY = 0;
cauldronWidth = 0;

lastAngle = 0;
maxAngle = 180;
ignitionAngle = 90;

flameOn = false;

TILT_INCREMENT = 5;

$.fn.animateRotate = function(angle, duration, easing, complete) {
  var args = $.speed(duration, easing, complete);
  var step = args.step;
  return this.each(function(i, e) {
    args.complete = $.proxy(args.complete, e);
    args.step = function(now) {
      positionSpark();
      $.style(e, 'transform', 'rotate(' + now + 'deg)');
      if (step) return step.apply(e, arguments);
    };

    $({deg: lastAngle}).animate({deg: angle}, args);
    lastAngle = angle;
    checkFlame();
  });
};

function getIgnitionAngle() {
  var torchHeight = $('.torch').height();
  var torchY = $('.torch').offset().top;
  var torchBottom = torchY + torchHeight;

  var flameHeight = torchBottom - flameY;
  var sparkHeight = torchBottom - sparkY;

  var angle = Math.acos(flameHeight / sparkHeight);
  ignitionAngle = angle * (180 / Math.PI);
}

function sizeFlames() {
  cauldronFlameSize = window.outerWidth / 20;
  torchFlameSize = window.outerWidth / 50;
}

function checkFlame() {
  if (flameOn) {
    return true;
  } else {
    if (sparkY >= flameY - 5) {
      console.log('flame is lit!');
      flameOn = true;
      maxAngle = lastAngle;
    }
  }
}

function sizeTorch() {
  var height = window.innerHeight * 0.75;
  var width = height * 0.115;
  $('.torch').css({
    width: width+'px',
    height: height+'px'
  });
}

function sizeCauldron() {
  var size = $('.cauldron').width();
  cauldronWidth = size;
  $('.cauldron').css({
    height: size+'px'
  });
}

function positionSpark() {
  var torchHeight = $('.torch').height();
  var left = (7/120) * torchHeight;
  var top = left * 2.5;
  $('.spark').css({
    left: left+'px',
    top: top+'px'
  });
  var sparkPos = $('.spark').offset();
  sparkX = sparkPos.left;
  sparkY = sparkPos.top;
}

function positionFlame() {
  var cauldronWidth = $('.cauldron').width();
  var left = cauldronWidth / 2;
  var top = left * 0.2;
  $('.flame').css({
    left: left+'px',
    top: top+'px'
  });
  var flamePos = $('.flame').offset();
  flameX = flamePos.left;
  flameY = flamePos.top;
}

function initTorch() {
  sizeFlames();
  sizeTorch();
  sizeCauldron();
  positionSpark();
  positionFlame();
  getIgnitionAngle();
};

function decreaseTilt() {
  $('.torch').animateRotate(lastAngle-TILT_INCREMENT);
}

function increaseTilt() {
  if (lastAngle + TILT_INCREMENT > maxAngle) return false;
  $('.torch').animateRotate(lastAngle+TILT_INCREMENT);
  console.log(lastAngle);
}

$(document).keydown(function(e) {
  switch(e.which) {
    case 37: // left
      decreaseTilt();
      break;

    case 39: // right
      increaseTilt();
      break;

    default: return; // exit this handler for other keys
  }
  e.preventDefault(); // prevent the default action (scroll / move caret)
});

function initSocket() {
  var socket = io.connect('http://localhost:3000');
  socket.on('torch', function (data) {
    console.log('Data received!');
    var tiltAngle = Math.abs(data.verticalDeviations.maximum) * 90;
    console.log('Rotating to ' + tiltAngle + ' degrees...');
    $('.torch').animateRotate(tiltAngle);
  });
}

$(document).ready(function() {
  initTorch();
  initSocket();
});