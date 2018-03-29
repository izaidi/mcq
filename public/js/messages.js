var Messages = {

  defaultDuration: 6000,
  fadeTime: 500,
  queue: [],
  
  manipulation: {
    text: [
      "Le torche que vous manipulez interagit avec celle sur l'écran. Déplacez-le et voyez ce qui se passe !",
      "Penchez la torche vers la vasque pour faire allumer la vasque sur l’écran !"
    ],
  },

  completion: {
    text: [
      "Bravo ! Vous avez allumé la vasque olympique !",
      "Si vous avez aimé manipuler la torche “connectée”, vous pouvez aller au MLab faire l’atelier complet de design d’objet connectés !"
    ],
  },

  insertText: function(text) {
    var self = this;

    $('.message').html(text);
    var textHeight = $('.message').actual('height');
    var boxHeight = 100;
    if (textHeight > 100) {
      boxHeight = textHeight * 1.15;
    }
    $('.message-box').css({height: boxHeight+'px'});
  },

  showMessage: function(text) {
    var self = this;

    var delay = 0;
    if ($('.message-box').is(':visible')) {
      $('.message-box').fadeOut(self.fadeTime, function() {
        self.insertText(text);
      });
      delay = self.fadeTime;
    } else {
      self.insertText(text);
    }
    $('.message-box').delay(delay).fadeIn(self.fadeTime);
  },

  showMessages: function(name) {
    var self = this;

    var text = self[name].text;
    var duration = self.defaultDuration;
    if (self[name].hasOwnProperty('duration')) {
      duration = self[name].duration;
    }

    self.showMessage(text[0]);
    var i = 1;
    console.log(duration);
    while (i < text.length) {
      var thisText = text[i];
      var timeout = setTimeout(function() {
        self.showMessage(thisText)
      }, duration*i);
      self.queue.push(timeout);
      i++;
    }

    if (self[name].loop) {
      var timeout = setTimeout(function() {
        self.showMessages(name);
      }, duration*text.length);
      self.queue.push(timeout);
    }
  },

  clearQueue() {
    var self = this;

    $('.message-box').stop(true);
    $.each(self.queue, function(index, timeout) {
      clearTimeout(timeout);
    });
  },

  hide: function() {
    var self = this;

    $('.message-box').hide();
    self.clearQueue();
  },

  show: function(name, delay) {
    var self = this;

    self.clearQueue();

    if (typeof(delay) === 'undefined') {
      delay = 0;
    }

    var timeout = setTimeout(function() {
      self.showMessages(name)
    }, delay);
    self.queue.push(timeout);
  }

}