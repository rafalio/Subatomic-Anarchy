// l2 norm of point
function l2(p){
  return Math.sqrt(Math.pow(p.x,2) + Math.pow(p.y, 2));
}

// Distance between two points
function dist(p1, p2){
  return l2({x: p1.x - p2.x, y:p1.y - p2.y});
}

// Manhattan Distance between two points
function manhattan(p1,p2){
  return Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y);
}

function dot_product(v1,v2){
  return v1.x*v2.x + v1.y*v2.y;
}

// Subtraction
function sub(v1,v2){
  return {x: v1.x - v2.x, y: v1.y - v2.y};
}

// Returns the angle between two vectors v1, v2, in radians.
function v_angle(v1,v2){
  return Math.acos(dot_product(v1,v2) / (l2(v1) * l2(v2)));
}

function hookEvent(target, evt, fn){
  target.addEventListener(evt, fn)
}

function unhookEvent(target, evt, fn){
  target.removeEventListener(evt, fn);
}


// Registers a global array key
var KEY = {
    'BACKSPACE': 8,
    'TAB': 9,
    'NUM_PAD_CLEAR': 12,
    'ENTER': 13,
    'SHIFT': 16,
    'CTRL': 17,
    'ALT': 18,
    'PAUSE': 19,
    'CAPS_LOCK': 20,
    'ESCAPE': 27,
    'SPACEBAR': 32,
    'PAGE_UP': 33,
    'PAGE_DOWN': 34,
    'END': 35,
    'HOME': 36,
    'ARROW_LEFT': 37,
    'ARROW_UP': 38,
    'ARROW_RIGHT': 39,
    'ARROW_DOWN': 40,
    'PRINT_SCREEN': 44,
    'INSERT': 45,
    'DELETE': 46,
    'SEMICOLON': 59,
    'WINDOWS_LEFT': 91,
    'WINDOWS_RIGHT': 92,
    'SELECT': 93,
    'NUM_PAD_ASTERISK': 106,
    'NUM_PAD_PLUS_SIGN': 107,
    'NUM_PAD_HYPHEN-MINUS': 109,
    'NUM_PAD_FULL_STOP': 110,
    'NUM_PAD_SOLIDUS': 111,
    'NUM_LOCK': 144,
    'SCROLL_LOCK': 145,
    'EQUALS_SIGN': 187,
    'COMMA': 188,
    'HYPHEN-MINUS': 189,
    'FULL_STOP': 190,
    'SOLIDUS': 191,
    'GRAVE_ACCENT': 192,
    'LEFT_SQUARE_BRACKET': 219,
    'REVERSE_SOLIDUS': 220,
    'RIGHT_SQUARE_BRACKET': 221,
    'APOSTROPHE': 222
};

 (function() {
    /* 0 - 9 */
    for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
    }
    /* A - Z */
    for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
    }
    /* NUM_PAD_0 - NUM_PAD_9 */
    for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
    }
    /* F1 - F12 */
    for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
    }
})();

// Extend string to provide simple formatting

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

Number.prototype.round2 = function(dec){
  return Math.round(this*Math.pow(10,dec))/Math.pow(10,dec);
}
