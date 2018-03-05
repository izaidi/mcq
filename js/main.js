sparkX = 0;
sparkY = 0;

flameX = 0;
flameY = 0;

lastAngle = 0;
maxAngle = 180;

flameOn = false;

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

function sizeFlames() {
  cauldronFlameSize = window.outerWidth / 20;
  torchFlameSize = window.outerWidth / 50;
}

function checkFlame() {
  if (flameOn) {
    return true;
  } else {
    if (sparkY >= flameY) {
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
};

function decreaseTilt() {
  $('.torch').animateRotate(lastAngle-5);
}

function increaseTilt() {
  if (lastAngle + 5 > maxAngle) return false;
  $('.torch').animateRotate(lastAngle+5);
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

$(document).ready(function() {
  initTorch();
});