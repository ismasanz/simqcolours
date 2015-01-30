(function($) {

    // Model
    var Picture = Backbone.Model.extend({
        // default values for a model
        defaults: function() {
            return {
                // image data
                data: undefined,
                // creation time
                time: new Date().getTime(),
                // default config
                config: {k: 4, resize: 50},
                // array of surveys done
                surveys: [],
                // result of image analysis
                result: undefined
            };
        }
    });

    // Collection of models
    var PictureList = Backbone.Collection.extend({
        model: Picture,
    	url : "/api/surveys", 
        // use localStorage as app db
        //localStorage: new Backbone.LocalStorage('qcd-app'),
        // order models by desc creation time
        comparator: function(picture) {
            return -picture.get('time');
        }
    });

    // Thumbnail view of a picture for the index page
    var ThumbView = Backbone.View.extend({
        // the view is a div with this css class
        className: 'pure-u-1-4',
        // the template of the view
        template: _.template($('#thumbnail-template').html()),

        events: {
            // on click over this view: open the PictureView
            'click .photo-box'   : 'open'
        },

        initialize: function() {
            // create a PictureView for this model
            this.survey = new PictureView({
                model: this.model,
                collection: this.collection
            });
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function() {
            var st = this.model.get('stats'),
                rt = this.model.get('result'),
                json = this.model.toJSON(),
                klass, data, img;
            // Most commmon perception
            json.perception = (rt) ? capitalize(rt[0].perception) : '';
            // Perceptange of agreement with that perception
            json.agree_pct = (st) ? st.agreed / st.count * 100 : '';
            // CSS class for the percentage of agreement
            klass = st && json.agree_pct >= 50 ?
                (json.agree_pct >= 75 ? 'agree' : 'medium-agree') :
                (json.agree_pct >= 25 ? 'medium-disagree' : 'disagree' );
            json.klass = (klass) ? klass : '';
            json.agree_pct = (st) ? json.agree_pct.toFixed() : '';
            // number of surveys performed
            json.people = (st) ? st.count : '';
            // number of people that agreed
            json.agreed = (st) ? st.agreed: '';
            // should stats be shown?
            json.hasStats = (st) ? '' : 'hidden';
            // apply the information the template
            $(this.el).html(this.template(json));

            // get image data
            data = this.model.get('data');
            img = this.$('img');

            // if image data, show it
            if (data) {
                img.attr('src', data);
                this.$('.photo-box').removeClass('empty');
            };

            return this;
        },

        open: function() {
            // if there is an existing PictureView, remove and create a new
            // --- to improve
            if (this.survey) { this.survey.remove(); }
            this.survey = new PictureView({
                model: this.model,
                collection: this.collection,
                scroll: $(window).scrollTop()
            });
            // hide index view, should be shown when PictureView is closed
            $('#picture-list').hide();
            // append the PictureView render
            $('#picture-survey').append(this.survey.render().el);
        }

    });

    var PictureView = Backbone.View.extend({

        className: 'pure-u-1',

        events: {
            'click .delete' : 'clear',
            'click .close'  : 'unrender',
            'click .options': 'toggleOptions',
            'click #config-form': 'preventDefault',
            'change #config_kmeans_k' : 'updateConfig',
            'change #config_resize_side' : 'updateConfig',
            'click .reset' : 'resetPicture',
            'change input.file' : 'handleFileSelected',
            'dragover .drop-zone' : 'handleDragOver',
            'drop .drop-zone'   : 'handleFileSelected',
            'click button.cancel' : 'stopSurvey',
            'click button.yes'  : 'handleSurveyResult',
            'click button.no'   : 'handleSurveyResult',
            'click button.suggested' : 'handleSurveyResult',
            'change .suggested input' : 'updateOnEnter',
            'click button.selected' : 'handleSurveyResult',
            'click button.new-survey' : 'initSurvey',
            'click .picture-display' : 'toggleStats',
            'click .picture-stats' : 'toggleStats'
        },

        template: _.template($('#picture-template').html()),

        initialize: function() {
            this.listenTo(this.model, 'change', this.save);
            this.listenTo(this.model, 'change:data', this.render);
            this.listenTo(this.model, 'change:data', function() { this.collection.add(new Picture()); });
            this.listenTo(this.model, 'destroy', this.remove);
            this.statsTemplate = _.template($('#picture-stats').html());

        },

        render: function() {

            $(this.el).html(this.template(this.model.toJSON()));

            var data = this.model.get('data'),
                config = this.model.get('config'),
                result = this.model.get('result'),
                that = this;

            // keep a local copy of some jquery elements
            this.$img = this.$('.picture-display img');
            this.$survey = this.$('.picture-survey');
            // set model config or defaults
            this.$k = this.$('#config_kmeans_k').val(config.k);
            this.$resize = this.$('#config_resize_side').val(config.resize);
            // min, max setting is configured in the template
            this.resize_min = parseInt(this.$resize.attr('min'), 10);
            this.k_max = parseInt(this.$k.attr('max'), 10);
            this.k_min = parseInt(this.$k.attr('min'), 10);
            // complete the html template with possible colour descriptions
            // -- to be improved
            this.$survey.find('.selected select').html(
                $.color_definitions.map(function(el, idx) {
                    return '<option value="' + el.label +
                    '" style="background: ' + ((idx % 2) ? 'white' : '#e5e5e5' )+
                    ';">' + capitalize(el.label) + '</option>';
                }).join('\n')
            );

            // if no image data no need to go further
            if (!data) { return this; }

            // on image load
            this.$img.on('load', function() {
                // add a CSS class to declare aspect
                that.$('.picture-display').addClass(
                    that.$img.width() > that.$img.height() ? 'horizontal' : 'vertical'
                );
                // trigger resize
                $(window).resize();
                // if not previously done, analyze the image
                if (!result) { that.analyzeImage(); }
                // or start a survey
                else { that.initSurvey(); }
            });
            this.$img.attr('src', data);

            return this;
        },

        unrender: function() {
            // display again the index view
            $('#picture-list').show();
            $(window).scrollTop(this.options.scroll);
            // remove PictureView
            $(this.el).remove();
        },

        save: function() {
            this.model.save();
        },

        updateConfig: function(e) {
            var k, resize, config;

            // if kmeans k config has been changed
            if ($(e.target).attr('id') === 'config_kmeans_k') {
                // get the new value
                k = this.$k.val();
                // correct overflows
                if (k < this.k_min) {
                    k = this.k_min;
                    this.$k.val(k);
                }
                else if (k > this.k_max) {
                    k = this.k_max;
                    this.$k.val(k);
                }
                // if surveys do exist, do not allow changes to config
                if (this.model.get('surveys').length) { return this; }
                // update config
                config = this.model.get('config');
                config.k = k;
                this.model.set('config', config);
            }
            // if resize config has been changed
            else if ($(e.target).attr('id') === 'config_resize_side') {
                // get the new value
                resize = this.$resize.val();
                // check overflows
                if (resize < this.resize_min) {
                    resize = this.resize_min;
                    this.$resize.val(resize);
                }
                // if surveys do exist, do now allow changes to config
                if (this.model.get('surveys').length) { return this; }
                // update config
                config = this.model.get('config');
                config.resize = resize;
                this.model.set('config', config);
            }
        },

        clear: function() {
            var count = this.model.get('surveys').length,
                rt = this.model.get('result'),
                withSurveysMsg = count ?
                    'The information of ' + count + ' survey' + (count === 1 ? '' : 's') + ' will be lost.\n' :
                    'The computed perception will be lost.\n';
            // if image has surveys or just has been analyzed, confirm deletion
            if (!rt || confirm(withSurveysMsg + 'Are you sure you want to delete this picture?')) {
                this.unrender();
                this.model.destroy();
            }
        },

        resetPicture: function() {
            var count = this.model.get('surveys').length;
            // reanalyze: when no surveys have been performed or user approved the action
            if (count === 0 ||
                confirm('The information of ' + count + ' survey' + (count === 1 ? '' : 's') + ' will be lost.\nAre you sure you want to recompute the description?')) {
                this.model.set('stats', undefined);
                this.model.set('surveys', []);
                this.model.trigger('change');
                this.$survey.removeClass('step-0 step-1 step-2 step-3 step-4');
                this.analyzeImage();
            }
        },

        preventDefault: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },

        toggleOptions: function() {
            this.$('#config-form').slideToggle();
        },

        generateStats: function() {
            var surveys = this.model.get('surveys'),
                result = this.model.get('result'),
                agreed = 0,
                suggested = {},
                selected = {},
                desc = function(a, b) { return b.count - a.count; };

            if (surveys.length === 0) { return; }

            surveys.forEach(function(test, idx) {
                var su, se;
                agreed += test.agreed;
                if (!test.agreed) {
                    su = capitalize(test.suggested);
                    se = test.selected;
                    if (!suggested[ su ]) {
                        suggested[ su ] = 0;
                    }
                    if (!selected[ se ]) {
                        selected[ se ] = 0;
                    }
                    suggested[ su ] += 1;
                    selected[ se ] += 1;
                }
            });

            suggested = Object.keys(suggested).map(function(key) {
                return {
                    suggestion: key,
                    count: suggested[ key ]
                };
            });
            suggested.sort(desc);

            selected = Object.keys(selected).map(function(key) {
                return {
                    selection: key,
                    count: selected[ key ]
                };
            });
            selected.sort(desc);


            var st = {
                'count'     : surveys.length,
                'agreed'    : agreed,
                'suggested' : suggested,
                'selected'  : selected
            };
            this.model.set('stats', st);

            var mod = _.extend({}, st);
            mod.perception = result[0].perception;
            mod.font_color = fontColor(mod.perception);
            mod.perception = capitalize(mod.perception);
            mod.rgb = new $.RGBColor(result[0].centroids[0]);
            mod.perception_hex = mod.rgb.toString(16);
            mod.hsl = mod.rgb.toHSL().toString();
            mod.rgb = mod.rgb.toString();
            mod.agree_pct = mod.agreed / mod.count * 100;
            mod.agree = mod.agree_pct >= 50;
            mod.klass = mod.agree ?
                (mod.agree_pct >= 75 ? 'agree' : 'medium-agree') :
                (mod.agree_pct >= 25 ? 'medium-disagree' : 'disagree' );
            if (!mod.agree) { // invert
                mod.agree_pct = 100 - mod.agree_pct;
                mod.agreed = mod.count - mod.agreed;
            }
            mod.agree_pct = mod.agree_pct.toFixed(1);
            var fragment = $(this.statsTemplate(mod));
            // if disagreement exists
            if (!mod.agree || mod.agree && mod.agree_pct < 100) {
            fragment.find('.details').html(
                '<div class="pure-g-r"><div class="pure-u-1-2">' +
                '<table class="pure-table"><thead>' +
                '<tr><th>#</th><th>Free suggestions</th></tr></thead>' +
                '<tbody>' + suggested.map(function(el, idx) {
                    return '<tr><td>' + idx + '</td><td>&ldquo;' + el.suggestion +
                        '&rdquo; [' + el.count + ']</td></tr>';
                }).join('') + '</tbody></table></div>\n' +
                '<div class="pure-u-1-2">' +
                '<table class="pure-table"><thead>' +
                '<tr><th>#</th><th>Selections from set</th></tr></thead>' +
                '<tbody>' + selected.map(function(el, idx) {
                    return '<tr><td>' + idx + '</td><td>&ldquo;' + capitalize(el.selection) +
                        '&rdquo; [' + el.count + ']</td></tr>';
                }).join('') + '</tbody></table></div></div>'
            );
            }
            this.$('.picture-stats').html(fragment);
        },

        toggleStats: function() {
            var $stats = this.$('.picture-stats'),
                turn = (typeof arguments[0] === 'boolean') ?
                        arguments[0] : undefined;

            if (turn !== undefined && turn === false) {
                $stats.slideUp();
                return;
            }

            if ($stats.html() == false &&
                this.model.get('surveys').length) {
                this.generateStats();
            }

            if ($stats.html() != false &&
                (this.step === 0 || this.step === 4)) {
                if (turn === true) {
                    $stats.slideDown();
                } else {
                    $stats.slideToggle();
                }
            }
        },

        updateOnEnter: function(e) {
            this.preventDefault(e);
            if (e.keyCode === 13) {
                this.handleSurveyResult(e);
            }
        },

        handleSurveyResult: function(e) {
            e.preventDefault();
            var $tg = $(e.target);
            switch (this.step) {
                case 1:
                    this.survey.agreed = $tg.hasClass('yes');
                    break;
                case 2:
                    this.survey.suggested = this.$survey.find('.suggested input').val();
                    break;
                case 3:
                    this.survey.selected = this.$survey.find('.selected select option:selected').val();
                    break;
            }
            this.nextStep();
        },

        nextStep: function() {
            var next = (this.step === 1 && this.survey.agreed) ?
                    4 : (this.step + 1) % 5,
                that = this;
            this.$survey.removeClass('step-0 step-1 step-2 step-3 step-4')
                .addClass('step-' + next);
            this.step = next;
            if (this.step === 1) { this.toggleStats(false); }
            if (this.step === 4) {
                if (this.survey) {
                    this.model.get('surveys').push(this.survey);
                    this.$survey.find('.finished').fadeOut(2000, function() {
                        that.nextStep();
                        $(this).css('display', ''); // remove prop introduced by fadeOut
                    });
                }
                this.generateStats();
                this.toggleStats();
            }
        },

        stopSurvey: function(e) {
            this.preventDefault(e);
            this.survey = undefined;
            this.step = 4;
            this.nextStep();
        },

        initSurvey: function() {
            var result = this.model.get('result'),
                perception = result && result[0].perception,
                color = result && new $.RGBColor(result[0].centroids[0]),
                font = fontColor(perception);
            if (!result) { return this; }
            this.survey = {};
            this.step = 0;
            this.$survey.find('.result .perception').html(
                '<span class="color" style="background-color: ' +
                color.toString(16) + ';"></span><span style="color: ' + font +
                ';">' + capitalize(perception) + '</span>'
            );
            this.$survey.find('.suggested input').val('');
            this.$survey.find('.selected select option:selected').prop('selected', false);
            this.nextStep();
        },

        analyzeImage: function() {
            var that = this,
                config = this.model.get('config');

            this.$img.createAnalyzer(config.resize, config.k)
            .one('load', function(e) {
                e.target.analyze();
            }).one('analyzed', function(e) {
                var result = e.target.result.rank;
                console.log(result);
                that.model.set('result', result);
                that.initSurvey();
            });
        },

        handleDragOver: function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'copy';
        },

        handleFileSelected: function(e) {

            e.stopPropagation();
            e.preventDefault(e);

            var file = (e.target.files) ?
                e.target.files[0] : e.originalEvent.dataTransfer.files[0],
                that = this;

            if (file && file.type.indexOf('image/') === 0) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    that.model.set('data', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }

    });


    var ListView = Backbone.View.extend({

        el: $('#picture-list'),

        initialize: function() {
            this.collection = new PictureList();

            this.listenTo(this.collection, 'add', this.appendItem);
            this.listenTo(this.collection, 'remove', this.autoAddItem);

            $(window).resize(function() {
                var $img = $('.picture-display img');
                $img.css('margin-top', - $img.height() / 2)
                    .css('margin-left', - $img.width() / 2);
            });
            this.collection.fetch();
            this.autoAddItem();
        },

        render: function() {
            _.each(this.collection.models, function(item) {
                this.appendItem(item);
            }, this);
            this.onAll();
        },

        onAll: function() {
            var num = this.collection.length - 1,
                num_str = (num != 1) ?  num + ' pictures' : num + ' picture',
                size = bytesToSize(
                    this.collection.models.reduce(function(memo, el) {
                        return memo + JSON.stringify(el.toJSON()).length * 2;
                    }, 0));
            $('.footer').html(num_str + ' in the local db (~' + size + ')');
        },

        addItem: function() {
            var picture = new Picture();
            this.collection.add(picture);
        },

        autoAddItem: function() {
            var first = this.collection.first();
            // if no last model or last model is setup: insert new one
            if (!first || first.get('data')) {
                this.addItem();
            } else {
                this.onAll();
            }
        },

        appendItem: function(picture) {
            var thumbView = new ThumbView({
                model: picture,
                collection: this.collection
            });
            $(this.el).prepend(thumbView.render().el);
            this.onAll();
        }

    });

    var capitalize = function(str) {
        return str.substr(0, 1).toUpperCase() + str.substr(1).replace('_', ' ', 'g').toLowerCase();
    };

    var fontColor = function(str) {
        return (str.indexOf('dark_') === 0 ||
                str.indexOf('black') === 0 ||
                str.indexOf('grey') === 0) ? 'white' : 'black';
    };

    /**
     * Convert number of bytes into human readable format
     *
     * @param integer bytes     Number of bytes to convert
     * @param integer precision Number of digits after the decimal separator
     * @return string
     */
    function bytesToSize(bytes, precision)
    {  
        var kilobyte = 1024;
        var megabyte = kilobyte * 1024;
        var gigabyte = megabyte * 1024;
        var terabyte = gigabyte * 1024;
       
        if ((bytes >= 0) && (bytes < kilobyte)) {
            return bytes + ' B';
     
        } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
            return (bytes / kilobyte).toFixed(precision) + ' KB';
     
        } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
            return (bytes / megabyte).toFixed(precision) + ' MB';
     
        } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
            return (bytes / gigabyte).toFixed(precision) + ' GB';
     
        } else if (bytes >= terabyte) {
            return (bytes / terabyte).toFixed(precision) + ' TB';
     
        } else {
            return bytes + ' B';
        }
    }


    //global
    listView = new ListView();

}(jQuery));
