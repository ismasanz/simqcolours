
var _QCD = _QCD || {};

(function(APP) {

    var CanvasImage = function(canvas, src, resize) {
        // load image in canvas
        var context = canvas.getContext('2d');
        var i = new Image();
        var that = this;
        i.onload = function() {
            var resizedCanvas, bigger, factor;
            if (!resize) {
                resizedCanvas = document.createElement('canvas');
                that.resized = new APP.CanvasImage(resizedCanvas, src, 150);
            } else {
                // resize the image to speed up kmeans
                bigger = (i.width > i.height) ? i.width : i.height;
                factor = (bigger - resize) / bigger;
                i.width = i.width - i.width * factor;
                i.height = i.height - i.height * factor;
            }
            canvas.width = i.width;
            canvas.height = i.height;
            context.drawImage(i, 0, 0, i.width, i.height);

            // remember the original pixels
            that.original = that.getData();
        };
        i.src = src;

        // cache these
        this.context = context;
        this.image = i;
    }

    CanvasImage.prototype.getData = function() {
        return this.context.getImageData(0, 0, this.image.width, this.image.height);
    };

    CanvasImage.prototype.setData = function(data) {
        return this.context.putImageData(data, 0, 0);
    };

    CanvasImage.prototype.reset = function() {
        this.setData(this.original);
    };

    CanvasImage.prototype.transform = function(fn, factor) {
        var olddata = this.original;
        var oldpx = olddata.data;
        var newdata = this.context.createImageData(olddata);
        var newpx = newdata.data;
        var res = [];
        var len = newpx.length;
        for (var i = 0; i < len; i += 4) {
            res = fn.call(this, oldpx[i], oldpx[i+1], oldpx[i+2], oldpx[i+3], factor, i);
            newpx[i] = res[0]; // r
            newpx[i+1] = res[1]; // g
            newpx[i+2] = res[2]; // b
            newpx[i+3] = res[3]; // a
        }
        this.setData(newdata);
    };

    CanvasImage.prototype.commonColors = function() {
        // console.profile("Profile " + pro);
        var px = this.resized.original.data,
            num = (num === undefined || +num < 1) ? 1 : +num;
        var len = px.length,
            num_px = px.length / 4,
            kmeans = science.stats.kmeans(),
            result,
            perceptionCounter = {},
            centroidCounter = {};

        // reshape image data
        var data = new Array(num_px);
        for (var i = 0, j = 0; i < len; i += 4, j += 1) {
            data[j] = new Array(3);
            data[j][0] = px[i];
            data[j][1] = px[i+1];
            data[j][2] = px[i+2];
        }

        kmeans.k(2); // number of rainbow colors
        result = kmeans(data);

        // assign to each centroid a perception
        result.perceptions = Array(result.centroids.length);
        result.centroids.forEach(function(center, idx) {
            var rgb = new APP.RGBColor(center);
            result.perceptions[ idx ] = APP.match(rgb.toHSL());
        });

        // initialize counters
        result.perceptions.forEach(function(element, idx) {
            perceptionCounter[ element ] = 0;
            centroidCounter[ idx ] = 0;
        });

        // count how many pixels each perception got assigned
        result.assignments.forEach(function(centroid, idx) {
            var per = result.perceptions[ centroid ];
            perceptionCounter[ per ] += 1;
            centroidCounter[ centroid ] += 1;
        });

        result.rank = [];
        Object.keys(perceptionCounter).forEach(function(per, idx) {
            var centroids = [];
            // centroids which perception is similar
            Object.keys(centroidCounter).forEach(function(centroid) {
                if (result.perceptions[ centroid ] == per) {
                    centroids.push({
                        centroid: result.centroids[ centroid ],
                        count: centroidCounter[ centroid ]
                    });
                }
            });
            // sort and keep the centroids only
            centroids.sort(function(a, b) { return b.count - a.count; });
            centroids = centroids.map(function(el) { return el.centroid; });

            result.rank.push({
                perception: per,
                percent: perceptionCounter[ per ] / num_px,
                'centroids': centroids
            });
        });

        result.rank.sort(function(a, b) {
            return b.percent - a.percent;
        });

        //console.profileEnd();
        //pro += 1;
        return result;
    };

    /* EXPORT */

    APP.CanvasImage = CanvasImage;

}(_QCD));

var transformador = new _QCD.CanvasImage(
    $('#canvas').get(0),
    './img/purple_texture.jpg'
);

var exec = function() {
        var result = transformador.commonColors();
        console.log(result);
        var perception = result.rank[0].perception;
        console.log(perception);
        var rgb = result.rank[0].centroids[0];
        console.log(rgb);
        rgb.push(255);
        transformador.resized.transform(function(r, g, b, a, factor, i) {
            var pos = i / 4;
            var cen = result.assignments[ pos ];
            if (perception == result.perceptions[ cen ]) {
                return rgb;
            } else {
                return [255, 255, 255, 0];
            }
        }, 1);
        var i = new Image();
        i.onload = function() {
            i.width = transformador.image.width;
            i.height = transformador.image.height;
            transformador.context.drawImage(i, 0, 0, i.width, i.height);
        };
        i.src = transformador.resized.context.canvas.toDataURL();
    };

$('reset').onclick = function(){
  transformador.reset();
  $('fn').innerHTML = '';
};

