
(function($) {

    'use strict';
    var _resize = 50,
        _k = 4;

    $.fn.createAnalyzer = function(resize, k) {
        if (!this.is('img')) { return undefined; }
        if (resize) { _resize = resize; }
        if (k) { _k = k; }
        return new CanvasImage(this.attr('src'));
    };

    var CanvasImage = function(src, resize) {
        var canvas = document.createElement('canvas');
        // load image in canvas
        var context = canvas.getContext('2d');
        var i = new Image();
        var that = this;
        this.loaded = false;
        i.onload = function() {
            var bigger, factor;
            if (!resize) {
                that.resized = new CanvasImage(src, _resize);
                that.resized.parent = that;
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
            if (!that.resized) {
                that.parent.loaded = true;
                that.parent.$.trigger('load');
            }
        };
        i.src = src;

        // cache these
        this.context = context;
        this.image = i;
        this.$ = $(this);
        return (resize) ? this : this.$;
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

    CanvasImage.prototype.analyze = function() {
        var px = this.resized.original.data,
            num = (num === undefined || +num < 1) ? 1 : +num;
        var len = px.length,
            num_px = px.length / 4,
            kmeans = KMEANS(),
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

        kmeans.k(_k);
        result = kmeans(data);

        // assign to each centroid a perception
        result.perceptions = Array(result.centroids.length);
        result.centroids.forEach(function(center, idx) {
            var rgb = new $.RGBColor(center);
            result.perceptions[ idx ] = $.perception(rgb.toHSL());
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

        this.result = result;
        this.$.trigger('analyzed');
    };

    /* copied form d3 science.stats.js */

    var euclidean = function(a, b) {
        var n = a.length,
            i = -1,
            s = 0,
            x;
        while (++i < n) {
          x = a[i] - b[i];
          s += x * x;
        }
        return Math.sqrt(s);
    };

    // Based on figue implementation by Jean-Yves Delort.
    // http://code.google.com/p/figue/
    var KMEANS = function() {
      var distance = euclidean,
          maxIterations = 1000,
          k = 1;

      function kmeans(vectors) {
        var n = vectors.length,
            assignments = [],
            clusterSizes = [],
            repeat = 1,
            iterations = 0,
            centroids = science_stats_kmeansRandom(k, vectors),
            newCentroids,
            i,
            j,
            x,
            d,
            min,
            best;

        while (repeat && iterations < maxIterations) {
          // Assignment step.
          j = -1; while (++j < k) {
            clusterSizes[j] = 0;
          }

          i = -1; while (++i < n) {
            x = vectors[i];
            min = Infinity;
            j = -1; while (++j < k) {
              d = distance.call(this, centroids[j], x);
              if (d < min) {
                min = d;
                best = j;
              }
            }
            clusterSizes[assignments[i] = best]++;
          }

          // Update centroids step.
          newCentroids = [];
          i = -1; while (++i < n) {
            x = assignments[i];
            d = newCentroids[x];
            if (d == null) newCentroids[x] = vectors[i].slice();
            else {
              j = -1; while (++j < d.length) {
                d[j] += vectors[i][j];
              }
            }
          }
          j = -1; while (++j < k) {
            x = newCentroids[j];
            d = 1 / clusterSizes[j];
            i = -1; while (++i < x.length) x[i] *= d;
          }

          // Check convergence.
          repeat = 0;
          j = -1; while (++j < k) {
            if (!science_stats_kmeansCompare(newCentroids[j], centroids[j])) {
              repeat = 1;
              break;
            }
          }
          centroids = newCentroids;
          iterations++;
        }
        return {assignments: assignments, centroids: centroids};
      }

      kmeans.k = function(x) {
        if (!arguments.length) return k;
        k = x;
        return kmeans;
      };

      kmeans.distance = function(x) {
        if (!arguments.length) return distance;
        distance = x;
        return kmeans;
      };

      return kmeans;
    };

    function science_stats_kmeansCompare(a, b) {
      if (!a || !b || a.length !== b.length) return false;
      var n = a.length,
          i = -1;
      while (++i < n) if (a[i] !== b[i]) return false;
      return true;
    }

    // Returns an array of k distinct vectors randomly selected from the input
    // array of vectors. Returns null if k > n or if there are less than k distinct
    // objects in vectors.
    function science_stats_kmeansRandom(k, vectors) {
      var n = vectors.length;
      if (k > n) return null;
      
      var selected_vectors = [];
      var selected_indices = [];
      var tested_indices = {};
      var tested = 0;
      var selected = 0;
      var i,
          vector,
          select;

      while (selected < k) {
        if (tested === n) return null;
        
        var random_index = Math.floor(Math.random() * n);
        if (random_index in tested_indices) continue;
        
        tested_indices[random_index] = 1;
        tested++;
        vector = vectors[random_index];
        select = true;
        for (i = 0; i < selected; i++) {
          if (science_stats_kmeansCompare(vector, selected_vectors[i])) {
            select = false;
            break;
          }
        }
        if (select) {
          selected_vectors[selected] = vector;
          selected_indices[selected] = random_index;
          selected++;
        }
      }
      return selected_vectors;
    }

}(jQuery));

