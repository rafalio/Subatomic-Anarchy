var ship;
var ctx,
stage;

function tick() {
    stage.update();
}

function init() {
    
    canvas = document.getElementById('canvas');
    stage = new Stage(canvas)

    ship = new Image();

    ship.onload = function() {
        txt = new Text("awesome ship", "12px Arial", "#FFF");

        bitmap = new Bitmap(ship);

        stage.addChild(bitmap);
        stage.addChild(txt);

        bitmap.x = 200;
        bitmap.y = 200;
        txt.x = 200;
        txt.y = 200 - 70;;

        w = bitmap.image.width;
        h = bitmap.image.height;

        bitmap.regX = w / 2;
        bitmap.regY = h / 2;

        document.addEventListener("keydown",
        function(e) {

            var d = 20;
            var rot = 7;

            switch (e.keyCode) {
            case KEY['ARROW_RIGHT']:
                e.preventDefault();
                bitmap.rotation += rot;
                break;
            case KEY['ARROW_LEFT']:
                e.preventDefault();
                bitmap.rotation -= rot;
                break;
            case KEY['ARROW_UP']:
                e.preventDefault();
                var r = bitmap.rotation;
                bitmap.x += Math.cos(r * Math.PI / 180) * d;
                bitmap.y += Math.sin(r * Math.PI / 180) * d;

                txt.x = bitmap.x;
                txt.y = bitmap.y - 70;
                break;
            case KEY['ARROW_DOWN']:
              e.preventDefault();
            }
        },
        true);

    }

    ship.src = "images/spaceship.png";
    Ticker.addListener(window);
    
}


KEY = {
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