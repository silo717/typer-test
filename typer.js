var Word = Backbone.Model.extend({
    move: function() {
        this.set({y: this.get('y') + this.get('speed')});
    }
});

var Score = Backbone.Model.extend({
    defaults: {
        point: 0,
        wordCorrect: 5,
        wordFalse: 2.5
    },
    increment: function() {
        this.set({
            point: this.get('point') + this.get('wordCorrect')
        });
    },
    decrement: function() {
        this.set({
            point: this.get('point') - this.get('wordFalse')
        });
    },
    reset: function() {
        this.set({
            point: 0
        });
    }
});

var Words = Backbone.Collection.extend({
    model: Word
});

var WordView = Backbone.View.extend({
    initialize: function() {
        $(this.el).css({position: 'absolute', 'transition': 'all 0.5s linear'});
        var string = this.model.get('string');
        var letter_width = 25;
        var word_width = string.length * letter_width;
        if (this.model.get('x') + word_width > $(window).width()) {
            this.model.set({x: $(window).width() - word_width});
        }
        for (var i = 0; i < string.length; i++) {
            $(this.el)
                    .append($('<div>')
                            .css({
                                width: letter_width + 'px',
                                padding: '5px 2px',
                                'border-radius': '4px',
                                'background-color': '#fff',
                                border: '1px solid #ccc',
                                'text-align': 'center',
                                float: 'left'
                            })
                            .text(string.charAt(i).toUpperCase()));
        }

        this.listenTo(this.model, 'remove', this.remove);

        this.render();
    },
    render: function() {
        var self = this;
        $(this.el).css({
            top: this.model.get('y') + 'px',
            left: this.model.get('x') + 'px'
        });
        var highlight = this.model.get('highlight');
        $(this.el).find('div').each(function(index, element) {
            var string = self.model.get('string');
            var letter_width = 25;
            var word_width = string.length * letter_width;
            if (self.model.get('x') + word_width > $(window).width()) {
                self.model.set({x: $(window).width() - word_width});
            }

            if (index < highlight) {
                $(element).css({'font-weight': 'bolder', 'background-color': '#aaa', color: '#fff'});
            }
            else {
                $(element).css({'font-weight': 'normal', 'background-color': '#fff', color: '#000'});
            }

        });
    }
});

var TyperView = Backbone.View.extend({
    initialize: function() {
        var wrapper = $('<div>')
                .attr({
                    id: 'wrapper'
                })
                .css({
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%'
                });
        this.wrapper = wrapper;

        var self = this;
        var text_input = $('<input>')
                .addClass('form-control')
                .css({
                    'border-radius': '4px',
                    position: 'absolute',
                    bottom: '0',
                    'min-width': '80%',
                    width: '80%',
                    'margin-bottom': '10px',
                    'z-index': '1000'
                }).keyup(function() {
            var minus = true;
            var words = self.model.get('words');
            for (var i = 0; i < words.length; i++) {
                var word = words.at(i);
                var typed_string = $(this).val();
                var string = word.get('string');
                if (string.toLowerCase().indexOf(typed_string.toLowerCase()) == 0) {
                    minus = false;
                    word.set({highlight: typed_string.length});
                    if (typed_string.length == string.length) {
                        $(this).val('');
                    }
                }
                else {
                    word.set({highlight: 0});
                }
            }

            if (minus) {
                self.model.get('score').decrement();
            }
        });

        $(this.el)
                .append(wrapper
                        .append($('<form>')
                                .attr({
                                    role: 'form',
                                    id: 'formTyper'
                                })
                                .submit(function() {
                                    return false;
                                })
                                .append(text_input)));

        text_input.css({left: ((wrapper.width() - text_input.width()) / 2) + 'px'});
        text_input.focus();

        this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
        var model = this.model;
        var words = model.get('words');

        for (var i = 0; i < words.length; i++) {
            var word = words.at(i);
            if (!word.get('view')) {
                var word_view_wrapper = $('<div>');
                this.wrapper.append(word_view_wrapper);
                word.set({
                    view: new WordView({
                        model: word,
                        el: word_view_wrapper
                    })
                });
            } else {
                word.get('view').render();
            }
        }
    }
});

var ButtonView = Backbone.View.extend({
    initialize: function() {
        var self = this;
        var start = $('<button>').addClass('btn btn-success').
                css({
                    float: 'left',
                    'border-radius': '400px',
                    'margin-right': '5px',
                    'z-index': '1000'
                }).text('Start')
                .click(function() {
                    self.model.start();
                    stop.prop('disabled', false);
                    pause.prop('disabled', false);
                    resume.prop('disabled', false);
                    $(this).attr('disabled', true);
                });

        var stop = $('<button>').addClass('btn btn-danger')
                .attr({
                    disabled: 'disabled'
                })
                .css({
                    float: 'left',
                    'border-radius': '400px',
                    'margin-right': '50px',
                    'z-index': '1000'
                }).text('Stop')
                .click(function() {
                    self.model.stop();
                    start.prop('disabled', false);
                    pause.attr('disabled', true);
                    resume.attr('disabled', true);
                    $(this).attr('disabled', true);
                });

        var pause = $('<button>').addClass('btn btn-warning')
                .attr({
                    disabled: 'disabled'
                })
                .css({
                    float: 'left',
                    'border-radius': '400px',
                    'margin-right': '5px',
                    'z-index': '1000'
                }).text('Pause')
                .click(function() {
                    self.model.pause();
                    resume.prop('disabled', false);
                    $(this).attr('disabled', true);
                });

        var resume = $('<button>').addClass('btn btn-success')
                .attr({
                    disabled: 'disabled'
                })
                .css({
                    float: 'left',
                    'border-radius': '400px',
                    'margin-right': '5px',
                    'z-index': '1000'
                }).text('Resume')
                .click(function() {
                    self.model.resume();
                    pause.prop('disabled', false);
                    $(this).attr('disabled', true);
                });

        var wrapper = $('<div>')
                .attr({
                    id: 'actions'
                })
                .css({
                    position: 'absolute',
                    bottom: '0',
                    left: ($('input').css('left')),
                    width: '80%',
                    height: '100px',
                    margin: '0 auto',
                });

        $('#wrapper').append(wrapper
                .append(start)
                .append(stop)
                .append(pause)
                .append(resume));
    }
});

var ScoreView = Backbone.View.extend({
    initialize: function() {
        var scoreWrapper = $('<h4>')
                .attr({
                    id: 'scoreWrapper'
                })
                .css({
                    float: 'left'
                }).
                text('Score : ');

        var score = $('<span>')
                .addClass('nilai')
                .css({
                    'border-radius': '4px',
                    'z-index': '1000'
                }).text(this.model.get('score').get('point'));

        $('#actions').append(scoreWrapper.append(score));

        this.listenTo(this.model.get('score'), "change", this.render);
        this.render();
    },
    render: function() {
        console.log(this.model.get('score').get('point'))
        $('span.nilai').html(this.model.get('score').get('point'));
    }
});

var Typer = Backbone.Model.extend({
    defaults: {
        max_num_words: 10,
        min_distance_between_words: 50,
        words: new Words(),
        score: new Score(),
        min_speed: 1,
        max_speed: 5
    },
    initialize: function() {
        new TyperView({
            model: this,
            el: $(document.body)
        });

        new ButtonView({
            model: this,
            el: $(document.body)
        });

        new ScoreView({
            model: this,
            el: $(document.body)
        });
    },
    start: function() {
        var animation_delay = 100;
        var self = this;
        this.interval = setInterval(function() {
            self.iterate();
        }, animation_delay);

        var score = this.get('score');
        score.reset();
    },
    stop: function() {
        clearInterval(this.interval);

        var words_to_be_removed = [];
        var words = this.get('words');
        var len = words.length;

        for (var i = 0; i < len; i++) {
            words_to_be_removed.push(words.models[i]);
        }

        for (var i = 0; i < len; i++) {
            words.remove(words_to_be_removed[i]);
        }
    },
    pause: function() {
        clearInterval(this.interval);
    },
    resume: function() {
        var animation_delay = 100;
        var self = this;
        this.interval = setInterval(function() {
            self.iterate();
        }, animation_delay);
    },
    iterate: function() {
        var words = this.get('words');
        if (words.length < this.get('max_num_words')) {
            var top_most_word = undefined;
            for (var i = 0; i < words.length; i++) {
                var word = words.at(i);
                if (!top_most_word) {
                    top_most_word = word;
                } else if (word.get('y') < top_most_word.get('y')) {
                    top_most_word = word;
                }
            }

            if (!top_most_word || top_most_word.get('y') > this.get('min_distance_between_words')) {
                var random_company_name_index = this.random_number_from_interval(0, company_names.length - 1);
                var string = company_names[random_company_name_index];
                var filtered_string = '';
                for (var j = 0; j < string.length; j++) {
                    if (/^[a-zA-Z()]+$/.test(string.charAt(j))) {
                        filtered_string += string.charAt(j);
                    }
                }

                var word = new Word({
                    x: this.random_number_from_interval(0, $(window).width()),
                    y: 0,
                    string: filtered_string,
                    speed: this.random_number_from_interval(this.get('min_speed'), this.get('max_speed'))
                });
                words.add(word);
            }
        }

        var words_to_be_removed = [];
        for (var i = 0; i < words.length; i++) {
            var word = words.at(i);
            word.move();

            if (word.get('move_next_iteration')) {
                this.get('score').increment();
            }

            if (word.get('y') > $(window).height() || word.get('move_next_iteration')) {
                words_to_be_removed.push(word);
            }

            if (word.get('highlight') && word.get('string').length == word.get('highlight')) {
                word.set({move_next_iteration: true});
            }
        }

        for (var i = 0; i < words_to_be_removed.length; i++) {
            words.remove(words_to_be_removed[i]);
        }

        this.trigger('change');
    },
    random_number_from_interval: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
});