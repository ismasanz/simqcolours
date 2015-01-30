var _QCD = _QCD || {};

(function(APP) {

    var assert = function(message, x) {
        if (!x) {
            throw Error('Assertion failed: ' + message);
        }
    };

    var testRange = function() {

        var range, message;

        // default Range with no options
        range = new APP.Range(0, 10);
        assert('First element', range.first() === 0);
        assert('Last element', range.last() === 9);
        assert('Match, expected upper overflow', range.match(10) === false);
        assert('Match, expected lower overflow', range.match(-1) === false);
        assert('Match, expected in range', range.match(0) === true);
        assert('Match, expected in range', range.match(9) === true);

        // other Range
        range = new APP.Range(0, 10, {step: 0.1});
        assert('First element', range.first() === 0);
        assert('Last element', range.last() === 9.9);
        assert('Match, expected upper overflow', range.match(10) === false);
        assert('Match, expected lower overflow', range.match(-0.1) === false);
        assert('Match, expected in range', range.match(0) === true);
        assert('Match, expected in range', range.match(9.9) === true);

        // other Range
        range = new APP.Range(0, 10, {step: 0.1, end_inc: true});
        assert('First element', range.first() === 0);
        assert('Last element', range.last() === 10);
        assert('Match, expected upper overflow', range.match(10.1) === false);
        assert('Match, expected lower overflow', range.match(-0.1) === false);
        assert('Match, expected in range', range.match(0) === true);
        assert('Match, expected in range', range.match(10) === true);

        // other Range
        range = new APP.Range(0, 10, {step: 0.1, ini_inc: false, end_inc: true});
        assert('First element', range.first() === 0.1);
        assert('Last element', range.last() === 10);
        assert('Match, expected upper overflow', range.match(10.1) === false);
        assert('Match, expected lower overflow', range.match(0) === false);
        assert('Match, expected in range', range.match(0.1) === true);
        assert('Match, expected in range', range.match(10) === true);

        try {
            range = undefined;
            message = 'Throw, 2nd argument lesser than first';
            range = new APP.Range(0, -10);
        } catch (e) {
            assert(message, e === APP.Range.prototype.InitError);
        }
        assert(message, range === undefined);

        try {
            range = undefined;
            message = 'Throw, 2nd argument greater than first';
            range = new APP.Range(0, 10, {step: -1});
        }
        catch (e) {
            assert(message, e === APP.Range.prototype.InitError);
        }
        assert(message, range === undefined);

        try {
            range = undefined;
            message = 'Throw, types error';
            range = new APP.Range('a', 'b', {step: 'a'});
        }
        catch (e) {
            assert(message, e === APP.Range.prototype.InitError);
        }
        assert(message, range === undefined);

    };

    if (APP.Range) { testRange(); }

    var testColor = function() {

        var color;
        //base
        color = new APP.RGBColor(255,0,0);
        assert('toString()', color.toString() === 'rgb(255, 0, 0)');
        assert('toString(16)', color.toString(16) === '#ff0000');
        assert('toHSL().toString()', color.toHSL().toString() === 'hsl(0, 100.0, 50.0)');
        color = new APP.HSLColor(0, 100, 50);
        assert('toString()', color.toString() === 'hsl(0, 100.0, 50.0)');
        assert('toRGB().toString()', color.toRGB().toString() === 'rgb(255, 0, 0)');

        color = new APP.RGBColor( -10, 0, 0);
        assert('Channel R lower overflow', color.r === 0);
        assert('Channel G lower value', color.g === 0);

        color = new APP.HSLColor(360, 0, 0);
        assert('Channel H upper overflow', color.h === 359);
    };

    if (APP.RGBColor && APP.HSLColor) {
        testColor();
    }

    var testQColors = function() {
        var search = function() {
            return APP.match(new APP.HSLColor(Array.prototype.slice.apply(arguments)));
        };
        // greyscale
        assert('black1', search(0, 0, 0) === 'black');
        assert('black2', search(359, 20, 19.9) === 'black');
        assert('dark_grey1', search(0, 0, 20) === 'dark_grey');
        assert('dark_grey2', search(359, 20, 29.9) === 'dark_grey');
        assert('grey1', search(0, 0, 30) === 'grey');
        assert('grey2', search(359, 20, 39.9) === 'grey');
        assert('light_grey1', search(0, 0, 40) === 'light_grey');
        assert('light_grey2', search(359, 20, 79.9) === 'light_grey');
        assert('white1', search(0, 0, 80) === 'white');
        assert('white2', search(359, 20, 100) === 'white');
        // rainbow
        assert('red1', search( 335.1, 50.1, 40.1) === 'red');
        assert('red2', search( 359, 100, 55) === 'red');
        assert('red3', search( 0, 50.1, 40.1) === 'red');
        assert('red4', search( 20, 100, 55) === 'red');
        assert('orange1', search( 20.1, 50.1, 40.1) === 'orange');
        assert('orange2', search( 50, 100, 55) === 'orange');
        assert('yellow1', search( 50.1, 50.1, 40.1) === 'yellow');
        assert('yellow2', search( 80, 100, 55) === 'yellow');
        assert('green1', search( 80.1, 50.1, 40.1) === 'green');
        assert('green2', search( 160, 100, 55) === 'green');
        assert('turquoise1', search( 160.1, 50.1, 40.1) === 'turquoise');
        assert('turquoise2', search( 200, 100, 55) === 'turquoise');
        assert('blue1', search( 200.1, 50.1, 40.1) === 'blue');
        assert('blue2', search( 239, 100, 55) === 'blue');
        assert('purple1', search( 239.1, 50.1, 40.1) === 'purple');
        assert('purple2', search( 297, 100, 55) === 'purple');
        assert('pink1', search( 297.1, 50.1, 40.1) === 'pink');
        assert('pink2', search( 335, 100, 55) === 'pink');
        // pale_rainbow
        assert('pale_red1', search( 335.1, 20.1, 40.1) === 'pale_red');
        assert('pale_red2', search( 359, 50, 55) === 'pale_red');
        assert('pale_red3', search( 0, 20.1, 40.1) === 'pale_red');
        assert('pale_red4', search( 20, 50, 55) === 'pale_red');
        assert('pale_orange1', search( 20.1, 20.1, 40.1) === 'pale_orange');
        assert('pale_orange2', search( 50, 50, 55) === 'pale_orange');
        assert('pale_yellow1', search( 50.1, 20.1, 40.1) === 'pale_yellow');
        assert('pale_yellow2', search( 80, 50, 55) === 'pale_yellow');
        assert('pale_green1', search( 80.1, 20.1, 40.1) === 'pale_green');
        assert('pale_green2', search( 160, 50, 55) === 'pale_green');
        assert('pale_turquoise1', search( 160.1, 20.1, 40.1) === 'pale_turquoise');
        assert('pale_turquoise2', search( 200, 50, 55) === 'pale_turquoise');
        assert('pale_blue1', search( 200.1, 20.1, 40.1) === 'pale_blue');
        assert('pale_blue2', search( 239, 50, 55) === 'pale_blue');
        assert('pale_purple1', search( 239.1, 20.1, 40.1) === 'pale_purple');
        assert('pale_purple2', search( 297, 50, 55) === 'pale_purple');
        assert('pale_pink1', search( 297.1, 20.1, 40.1) === 'pale_pink');
        assert('pale_pink2', search( 335, 50, 55) === 'pale_pink');
        // light_rainbow
        assert('light_red1', search( 335.1, 50.1, 55.1) === 'light_red');
        assert('light_red2', search( 359, 100, 100) === 'light_red');
        assert('light_red3', search( 0, 50.1, 55.1) === 'light_red');
        assert('light_red4', search( 20, 100, 100) === 'light_red');
        assert('light_orange1', search( 20.1, 50.1, 55.1) === 'light_orange');
        assert('light_orange2', search( 50, 100, 100) === 'light_orange');
        assert('light_yellow1', search( 50.1, 50.1, 55.1) === 'light_yellow');
        assert('light_yellow2', search( 80, 100, 100) === 'light_yellow');
        assert('light_green1', search( 80.1, 50.1, 55.1) === 'light_green');
        assert('light_green2', search( 160, 100, 100) === 'light_green');
        assert('light_turquoise1', search( 160.1, 50.1, 55.1) === 'light_turquoise');
        assert('light_turquoise2', search( 200, 100, 100) === 'light_turquoise');
        assert('light_blue1', search( 200.1, 50.1, 55.1) === 'light_blue');
        assert('light_blue2', search( 239, 100, 100) === 'light_blue');
        assert('light_purple1', search( 239.1, 50.1, 55.1) === 'light_purple');
        assert('light_purple2', search( 297, 100, 100) === 'light_purple');
        assert('light_pink1', search( 297.1, 50.1, 55.1) === 'light_pink');
        assert('light_pink2', search( 335, 100, 100) === 'light_pink');
        // dark_rainbow
        assert('dark_red1', search( 335.1, 20.1, 0) === 'dark_red');
        assert('dark_red2', search( 359, 100, 40) === 'dark_red');
        assert('dark_red3', search( 0, 20.1, 0) === 'dark_red');
        assert('dark_red4', search( 20, 100, 40) === 'dark_red');
        assert('dark_orange1', search( 20.1, 20.1, 0) === 'dark_orange');
        assert('dark_orange2', search( 50, 100, 40) === 'dark_orange');
        assert('dark_yellow1', search( 50.1, 20.1, 0) === 'dark_yellow');
        assert('dark_yellow2', search( 80, 100, 40) === 'dark_yellow');
        assert('dark_green1', search( 80.1, 20.1, 0) === 'dark_green');
        assert('dark_green2', search( 160, 100, 40) === 'dark_green');
        assert('dark_turquoise1', search( 160.1, 20.1, 0) === 'dark_turquoise');
        assert('dark_turquoise2', search( 200, 100, 40) === 'dark_turquoise');
        assert('dark_blue1', search( 200.1, 20.1, 0) === 'dark_blue');
        assert('dark_blue2', search( 239, 100, 40) === 'dark_blue');
        assert('dark_purple1', search( 239.1, 20.1, 0) === 'dark_purple');
        assert('dark_purple2', search( 297, 100, 40) === 'dark_purple');
        assert('dark_pink1', search( 297.1, 20.1, 0) === 'dark_pink');
        assert('dark_pink2', search( 335, 100, 40) === 'dark_pink');
    };

    if (APP.HSLColor && APP.definitions && APP.match) {
        testQColors();
    }

}(_QCD));
