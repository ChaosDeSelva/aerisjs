define([
  'underscore',
  'testUtils',
  'wire',
  'backbone'
], function(_, testUtil, wire, Backbone) {
  var plugins = ['ai/application/plugin/events'];
  var modId;

  var Listener = function() {
    this.listen = jasmine.createSpy('Listener#listen');
    this.listenClosely = jasmine.createSpy('Listener#listenHard');
  };
  _.extend(Listener.prototype, Backbone.Events);


  var Talker = function() {
  };
  _.extend(Talker.prototype, Backbone.Events);


  var throwUncatchable = function(e) {
    _.defer(function() {
      throw e;
    })
  };


  var loudspeaker = jasmine.createSpy('loudspeaker').
    andCallFake(function(talker, words) {
      return words.toUpperCase();
    });


  function defineTestModule(name, cb) {
    define(modId + name, cb);
  }

  function getModId(name) {
    return modId + name;
  }





  describe('The wire Event plugin', function() {

    beforeEach(function() {
      modId = _.uniqueId('TestModule_') + '_';

      defineTestModule('listener', function() {
        return Listener;
      });

      defineTestModule('talker', function() {
        return Talker;
      });


      defineTestModule('loudspeaker', function() {
        return loudspeaker;
      });


      defineTestModule('transformers', {
        loudspeaker: loudspeaker,
        muffler: function(talk, words) {
          return words.toLowerCase()
        }
      });
    });

    describe('listenTo facet', function () {
      it('should listen to multiple events from multiple emitters', function () {
        wire({
          talkerA: {
            create: getModId('talker')
          },

          talkerB: {
            create: getModId('talker')
          },

          listener: {
            create: getModId('listener'),
            listenTo: {
              talkerA: {
                talk: 'listen',
                whisper: 'listenClosely'
              },
              talkerB: {
                talk: 'listen',
                whisper: 'listenClosely'
              }
            }
          },
          plugins: plugins
        }).then(function (ctx) {
            ctx.talkerA.trigger('talk', 'hello you');
            expect(ctx.listener.listen).toHaveBeenCalledWith('hello you');

            ctx.talkerA.trigger('whisper', 'hey guy');
            expect(ctx.listener.listenClosely).toHaveBeenCalledWith('hey guy');

            testUtil.setFlag();
          }).otherwise(throwUncatchable);

        waitsFor(testUtil.checkFlag, 1000, 'Wire to complete');
      });


      it('should transform event data', function () {
        wire({
          talker: {
            create: getModId('talker')
          },

          loudspeaker: { module: getModId('loudspeaker') },

          listener: {
            create: getModId('listener'),
            listenTo: {
              talker: {
                whisper: 'loudspeaker | listen'
              }
            }
          },

          plugins: plugins
        }).then(function (ctx) {
            ctx.talker.trigger('whisper', ctx.talker, 'hey guy');

            expect(ctx.listener.listen).toHaveBeenCalledWith('HEY GUY');

            testUtil.setFlag();
          }).otherwise(throwUncatchable);

        waitsFor(testUtil.checkFlag, 1000, 'Wire to complete');
      });

      it('should find a transformer within a namespace', function () {
        wire({
          talker: {
            create: getModId('talker')
          },

          transformers: { module: getModId('transformers') },

          listener: {
            create: getModId('listener'),
            listenTo: {
              talker: {
                whisper: 'transformers.loudspeaker | listen',
                shout: 'transformers.muffler | listen'
              }
            }
          },

          plugins: plugins
        }).then(function (ctx) {
            ctx.talker.trigger('whisper', ctx.talker, 'hey guy');
            expect(ctx.listener.listen).toHaveBeenCalledWith('HEY GUY');

            ctx.talker.trigger('shout', ctx.talker, 'YO DUDE');
            expect(ctx.listener.listen).toHaveBeenCalledWith('yo dude');

            testUtil.setFlag();
          }).otherwise(throwUncatchable);

        waitsFor(testUtil.checkFlag, 1000, 'Wire to complete');
      });

      it('should clear all listeners when the context is destroyed', function() {
        spyOn(Listener.prototype, 'stopListening');

        wire({
          talkerA: {
            create: getModId('talker')
          },

          talkerB: {
            create: getModId('talker')
          },

          listener: {
            create: getModId('listener'),
            listenTo: {
              talkerA: {
                talk: 'listen',
                whisper: 'listenClosely'
              },
              talkerB: {
                talk: 'listen',
                whisper: 'listenClosely'
              }
            }
          },
          plugins: plugins
        }).then(function(ctx) {
            return ctx.destroy();
          }).
          then(function() {
            expect(Listener.prototype.stopListening).toHaveBeenCalled();

            testUtil.setFlag();
          }).
          otherwise(throwUncatchable);

        waitsFor(testUtil.checkFlag, 1000, 'Wire to complete');
      });
    });

  });

});
