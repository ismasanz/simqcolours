
var _QCD = _QCD || {};

(function(APP) {

    'use strict';

    // pseudo-macro
    var SUBCLASS = function(Class, opt) {

        var Constructor = function() {
            Class.apply(this, arguments); // super
        };

        Constructor.prototype = Object.create(Class.prototype);
        Constructor.fn = Constructor.prototype;
        Constructor.fn.constructor = Constructor;
        for (var key in opt) {
            Constructor.fn[ key ] = opt[ key ];
        }

        return Constructor;
    };

    // Range class
    var Range = function(ini, end, opts) {

        if (arguments.length < 2) {
            throw this.InitError;
        }

        this.ini = ini;
        this.end = end;
        for (var key in opts) {
            this[ key ] = opts[ key ];
        }

        if (typeof this.ini !== 'number' ||
            typeof this.end !== 'number' ||
            typeof this.step !== 'number' ||
            this.ini > this.end && this.step > 0 ||
            this.ini < this.end && this.step < 0) {
            throw this.InitError;
        }

    };

    Range.prototype.step = 1;
    Range.prototype.ini_inc = true;
    Range.prototype.end_inc = false;
    Range.prototype.InitError = new Error('Range: invalid arguments.');

    Range.prototype.match = function(val) {
        return !this.lowerOverflow(val) && !this.upperOverflow(val);
    };

    Range.prototype.lowerOverflow = function(val) {
        if (typeof val !== typeof this.ini) {
            throw Error('Range: expected parameter of type ' + typeof this.ini);
        }
        return (this.ini_inc) ? val < this.ini : val <= this.ini;
    };

    Range.prototype.upperOverflow = function(val) {
        if (typeof val !== typeof this.end) {
            throw Error('Range: expected parameter of type ' + typeof this.end);
        }
        return (this.end_inc) ? val > this.end : val >= this.end;
    };

    Range.prototype.first = function() {
        return (this.ini_inc) ? this.ini : this.ini + this.step;
    };

    Range.prototype.last = function() {
        return (this.end_inc) ? this.end : this.end - this.step;
    };

    // Color class
    var Color = function(color) {

        var ok = false,
            that = this;

        if (arguments.length === this.channelNames.length ) {
            color = Array.prototype.slice.apply(arguments);
            if (! color.every(function(el) { return typeof el === 'number'})) {
                throw new Error(this.model.toUpperCase() + 'Color: expected ' + this.channelNames.length + ' numeric arguments.');
            }
        }

        if (Array.isArray(color)) {
            color.forEach(function(value, idx) {
                var channelName = that.channelNames[ idx ];
                that[ channelName ] = value;
            });
        }
        else if (typeof color === 'string') {

            if (!this.definitions || !this.definitions.length) {
                throw new Error(this.model.toUpperCase() + 'Color: does not support initialization from string.');
            }
 
            // strip any leading #
            if (color.charAt(0) === '#') {
                color = color.substr(1,6);
            }

            color = color.replace(/ /g,'');
            color = color.toLowerCase();

            // search through the definitions to find a match
            this.definitions.forEach(function(def) {
                if (ok) { return; }
                var bits = def.re.exec(color);
                if (bits) {
                    ok = true;
                    that.constructor.call(that, def.process(bits), model);
                }
            });

            if (!ok) {
                throw new Error(this.model.toUpperCase() + 'Color: failed from string "' + color + '".');
            }
        }
        else {
            throw new Error(this.model.toUpperCase() + 'Color: expected argument of type array or string, got: ' + typeof color);
        }

        this.check();
    };

    Color.prototype.check = function() {
        var that = this;

        this.channelNames.forEach(function(channelName, idx) {
            var range = that.ranges[ channelName ],
                value = that[ channelName ];
            if (range.lowerOverflow(value)) {
                that[ channelName ] = range.first();
            }
            else if (range.upperOverflow(value)) {
                that[ channelName ] = range.last();
            }
        });

        return this;
    };

    Color.prototype.match = function(qcolor) {
        return qcolor.match(this);
    };

    // export Color class to APP object
    //APP.Color = Color;

    // Color models
    var models = {
        // RGB color model
        RGB: {
            model: 'rgb',
            channelNames: ['r', 'g', 'b'],
            ranges: {
                r: new Range(0, 256),
                g: new Range(0, 256),
                b: new Range(0, 256)
            },
            definitions: [{
                re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                // example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
                process: function (bits){
                        return [
                            parseInt(bits[1]),
                            parseInt(bits[2]),
                            parseInt(bits[3])
                        ];
                    }
                },
                {
                re: /^(\w{2})(\w{2})(\w{2})$/,
                //example: ['#00ff00', '336699'],
                process: function (bits){
                        return [
                            parseInt(bits[1], 16),
                            parseInt(bits[2], 16),
                            parseInt(bits[3], 16)
                        ];
                    }
                },
                {
                re: /^(\w{1})(\w{1})(\w{1})$/,
                //example: ['#fb0', 'f0f'],
                process: function (bits){
                        return [
                            parseInt(bits[1] + bits[1], 16),
                            parseInt(bits[2] + bits[2], 16),
                            parseInt(bits[3] + bits[3], 16)
                        ];
                    }
            }],
            // RGBColor to HSLColor
            toHSL: function() {
                var r = this.r / 255,
                    g = this.g / 255,
                    b = this.b / 255,
                    h, s, l, d,
                    M = Number.NEGATIVE_INFINITY,
                    m = Number.POSITIVE_INFINITY;

                M = Math.max.call(Math, r, g, b);
                m = Math.min.call(Math, r, g, b);
                d = M - m;
                if ( d == 0 ) { h = 0; }
                else if ( M == r ) { h = ((g - b) / d) % 6; }
                else if ( M == g ) { h = (b - r) / d + 2; }
                else { h = (r - g) / d + 4; }
                h *= 60;
                if( h < 0 ) { h += 360; }
                l = (M + m) / 2;
                if( d == 0 ) {
                    s = 0;
                }
                else {
                    s = d / (1 - Math.abs(2 * l - 1));
                }
                s *= 100;
                l *= 100;

                return new APP.HSLColor(h, s, l);
            },
            // RGBColor toString
            toString: function (opt) {
                var r, g, b;
                if (opt === 16 ||
                    typeof opt === 'string' && opt.toLowerCase() === 'hex') {
                    r = Math.round(this.r).toString(16);
                    g = Math.round(this.g).toString(16);
                    b = Math.round(this.b).toString(16);
                    if (r.length == 1) { r = '0' + r; }
                    if (g.length == 1) { g = '0' + g; }
                    if (b.length == 1) { b = '0' + b; }
                    return '#' + r + g + b;
                }
                else {
                    return 'rgb(' + this.r.toFixed() + ', ' + this.g.toFixed() + ', ' + this.b.toFixed() + ')';
                }
            }
        },
        // HSL color model
        HSL: {
            model: 'hsl',
            channelNames: ['h', 's', 'l'],
            ranges: {
                h: new Range(0, 360),
                s: new Range(0, 100, {end_inc: true, step: 0.1}),
                l: new Range(0, 100, {end_inc: true, step: 0.1})
            },
            // HSLColor to RGBColor
            toRGB: function() {
                var h = this.h,
                    s = this.s / 100,
                    l = this.l / 100,
                    C, hh, X, r, g, b, m, rgb;

                C = (1 - Math.abs(2 * l - 1)) * s;
                hh = h / 60;
                X = C * (1 - Math.abs(hh % 2 - 1));
                r = g = b = 0;
                if (hh >= 0 && hh < 1) {
                    r = C;
                    g = X;
                }
                else if (hh >= 1 && hh < 2) {
                    r = X;
                    g = C;
                }
                else if (hh >= 2 && hh < 3) {
                    g = C;
                    b = X;
                }
                else if (hh >= 3 && hh < 4) {
                    g = X;
                    b = C;
                }
                else if (hh >= 4 && hh < 5) {
                    r = X;
                    b = C;
                }
                else {
                    r = C;
                    b = X;
                }
                m = l - C / 2;
                rgb = [r, g, b].map(function(ch) {
                    return (ch + m) * 255;
                });

                return new APP.RGBColor(rgb);
            },
            // HSLColor toString
            toString: function () {
                return 'hsl(' + this.h.toFixed() + ', ' + this.s.toFixed(1) + ', ' + this.l.toFixed(1) + ')';
            }
        }
    }; // models

    // Qualitative color class
    var QColor = function() {
        var label, opts;
        if (arguments.length == 1) {
            opts = arguments[0];
        }
        else if (arguments.length >= 2) {
            label = arguments[0];
            opts = arguments[1];
        }
        if (label) { this.label = label; }
        // extend this with properties given in opts
        for (var key in opts) {
            this[ key ] = opts[ key ];
        }
    };

    QColor.prototype.match = function(color) {
        var that = this,
            expected = this.model.toUpperCase() + 'Color';
        if (! color instanceof APP[ expected ]) {
            throw new Error(this.constructor + ': expected 1 argument of type ' + expected + '.');
        }

        // every color's channel must comply with
        return color.channelNames.every(function(channelName) {
            // given the color's channel value
            var channelValue = color[ channelName ],
            // given an array of valid ranges for it
                channelRanges = that[ channelName ];
            // channel value must match with some range
            return channelRanges.some(function(range) {
                return range.match(channelValue);
            });
        });
    };

    var HSL_QCOLOR_CLASS = function(opt) {
        if (opt) {
            opt.model = 'hsl';
        } else {
            opt = {model: 'hsl'};
        }
        return SUBCLASS(QColor, opt);
    };

    var FRange = SUBCLASS(Range, {step: 0.1});
    var FRangeInv = SUBCLASS(FRange, {ini_inc: false, end_inc: true});
    var RangeInv = SUBCLASS(Range, {ini_inc: false, end_inc: true});

    var Greyscale = HSL_QCOLOR_CLASS({
        h: [new Range(0, 360)],
        s: [new FRange(0, 20, {end_inc: true})]
    });

    var Rainbow = HSL_QCOLOR_CLASS({
        s: [new FRangeInv(50, 100)],
        l: [new FRangeInv(40, 55)]
    });

    var Pale = HSL_QCOLOR_CLASS({
        s: [new FRangeInv(20, 50)],
        l: [new FRangeInv(40, 100)]
    });

    var Light = HSL_QCOLOR_CLASS({
        s: [new FRangeInv(50, 100)],
        l: [new FRangeInv(55, 100)]
    });

    var Dark = HSL_QCOLOR_CLASS({
        s: [new FRangeInv(20, 100)],
        l: [new FRange(0, 40, {end_inc: true})]
    });

    var rainbow = [
        ['red',         {h: [new RangeInv(335, 360), new Range(0, 20, {end_inc: true})]}],
        ['orange',      {h: [new RangeInv(20, 50)]}],
        ['yellow',      {h: [new RangeInv(50, 80)]}],
        ['green',       {h: [new RangeInv(80, 160)]}],
        ['turquoise',   {h: [new RangeInv(160, 200)]}],
        ['blue',        {h: [new RangeInv(200, 239)]}],
        ['purple',      {h: [new RangeInv(239, 297)]}],
        ['pink',        {h: [new RangeInv(297, 335)]}]
    ];

    var colors = [
        new Greyscale('black',      {l: [new FRange(0, 20)]}),
        new Greyscale('dark_grey',  {l: [new FRange(20, 30)]}),
        new Greyscale('grey',       {l: [new FRange(30, 40)]}),
        new Greyscale('light_grey', {l: [new FRange(40, 80)]}),
        new Greyscale('white',      {l: [new FRange(80, 100, {end_inc: true})]})
    ];

    rainbow.forEach(function(elem) {
        var label = elem[0],
            opt = elem[1];
        colors.push(new Rainbow(label, opt));
        colors.push(new Pale('pale_'+label, opt));
        colors.push(new Light('light_'+label, opt));
        colors.push(new Dark('dark_'+label, opt));
    });

    /*
     * Public properties added to APP object
     */

    APP.Range = Range;
    // export Color subclasses based on models
    Object.keys(models).forEach(function(model) {
        APP[ model + 'Color' ] = SUBCLASS(Color, models[ model ]);
    });

    // QColor definitions
    APP.definitions = colors;
    // method for matching specific colors agains definitions
    APP.match = function(color) {
        var result = [];
        APP.definitions.forEach(function(qcolor) {
            if (qcolor.match(color)) {
                result.push(qcolor.label);
            }
        });
        return (result.length == 1) ? result[0] : result;
    };

}(_QCD));

/*

for (var key in _QCD) {
    exports[ key ] = _QCD[ key ];
}

*/
