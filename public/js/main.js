sparkX = 0;
sparkY = 0;

flameX = 0;
flameY = 0;
cauldronWidth = 0;

lastAngle = 0;
maxAngle = 180;
ignitionAngle = 90;

paused = false;
torchOn = false;
flameOn = false;
activated = false;
lastData = null;

TILT_THRESHOLD = 0.05; // amount of tilt between 0 and 1 that indicates user has picked up the torch
TILT_INCREMENT = 5;

RESET_INTERVAL = 25000;

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

function igniteCauldron() {
  if (flameOn || paused) return false;
  console.log('flame is lit!');
  torchOn = false;
  flameOn = true;
  maxAngle = lastAngle;
  playTheme();
  setTimeout(endCeremony, RESET_INTERVAL);
  Messages.show('completion');
}

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
      igniteCauldron();
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
  var top = left * 0.15;
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
    case 32: // spacebar
      beginCeremony();
      break;

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

function diffData(data) {
  if (lastData == null || !lastData.hasOwnProperty('verticalDeviations')) {
    return {};
  }
  var diff = _.omit(lastData.verticalDeviations, function(v,k) {
    return Math.abs(data.verticalDeviations[k] - v) < TILT_THRESHOLD; 
  });
  return diff;
}

function isTorchMoving(data) {
  var diff = diffData(data);
  return Object.keys(diff).length > 0;
} 

function isTorchAtRest(data) {
  var diff = diffData(data);
  return Object.keys(diff).length == 0;
}

function initSocket() {
  var url = $(location).attr('origin');
  console.log(url);
  var socket = io.connect(url);
  socket.on('torch', function (data) {
    console.log('Data received!');
    console.log(data);
    if (!activated) {
      console.log('not activated');
      if (isTorchMoving(data)) {
        beginCeremony();
      }
    } else {
    /*  if (readyToRestart && isTorchAtRest(data)) {
        restart();
      }*/
      var tiltAngle = Math.abs(data.verticalDeviations.maximum) * 90;
      console.log('Rotating to ' + tiltAngle + ' degrees...');
      $('.torch').animateRotate(tiltAngle);
    }
    lastData = data;
  });
}

function playTheme() {
  console.log('playing theme');
  musicLoop.unload();
  cauldronMusic.play();
  cauldronMusic.fade(0, 1, 1000);
}

function initMusic() {
  console.log('initing music');
  musicLoop = new Howl({
    src: ['audio/jupiter-loop.mp3'],
    autoplay: false,
    loop: true,
    volume: 0.2,
  });
  
  cauldronMusic = new Howl({
    src: ['audio/cauldron.mp3'],
    autoplay: false,
    volume: 0,
  });
}

function beginCeremony() {
  activated = true;
  $('.ui-intro').fadeOut(200);
  $('.black-pane').fadeOut(1000, function() {
    $('.cauldron').css({zIndex: 101});
  });
  bounceTorch = false;
  $('.torch').finish();
  musicLoop.play();
  musicLoop.fade(0.2, 1, 3000);
  torchOn = true;
  initFire();
  Messages.show('manipulation', 2000);
}

function endCeremony() {
  restart();
}

function restart() {
  cauldronMusic.unload();
  Messages.hide();
  paused = true;
  flameOn = false;
  activated = false;
  $('.ui-intro').fadeIn(300);
  $('.torch').animateRotate(0)
  $('.black-pane').fadeIn(0);
  $('.cauldron').css({zIndex: 97});
  positionSpark();
  initUI();
  initMusic();
  resetFire();
  paused = false;
}

function initUI() {
  bounceTorch = true;
  function loop() {
    if (!bounceTorch) return false;
    $('.torch').animate ({
      top: '-=30',
    }, 1000, 'easeInOutQuad', function() {
      $('.torch').animate({
        top: '+=30'
      }, 1000, 'easeInOutQuad', function() {
        if (bounceTorch) loop();
      })
    });
  }
      
  loop();

  $('.torch').one('click', function() {
    beginCeremony();
  });
}

$(document).ready(function() {
  initTorch();
  initSocket();
  initMusic();
  initUI();
});