/*can-util@3.10.15#dom/class-name/class-name*/
define('can-util@3.10.15#dom/class-name/class-name', function (require, exports, module) {
    'use strict';
    var has = function (className) {
        if (this.classList) {
            return this.classList.contains(className);
        } else {
            return !!this.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        }
    };
    module.exports = {
        has: has,
        add: function (className) {
            if (this.classList) {
                this.classList.add(className);
            } else if (!has.call(this, className)) {
                this.className += ' ' + className;
            }
        },
        remove: function (className) {
            if (this.classList) {
                this.classList.remove(className);
            } else if (has.call(this, className)) {
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
                this.className = this.className.replace(reg, ' ');
            }
        }
    };
});
/*can-control@3.2.3#can-control*/
define('can-control@3.2.3#can-control', [
    'require',
    'exports',
    'module',
    'can-construct',
    'can-namespace',
    'can-util/js/string/string',
    'can-util/js/assign/assign',
    'can-util/js/is-function/is-function',
    'can-util/js/each/each',
    'can-util/js/dev/dev',
    'can-types',
    'can-util/js/get/get',
    'can-util/dom/data/data',
    'can-util/dom/class-name/class-name',
    'can-util/dom/events/events',
    'can-event',
    'can-compute',
    'can-stache-key',
    'can-reflect',
    'can-util/dom/dispatch/dispatch',
    'can-util/dom/events/delegate/delegate'
], function (require, exports, module) {
    var Construct = require('can-construct');
    var namespace = require('can-namespace');
    var string = require('can-util/js/string/string');
    var assign = require('can-util/js/assign/assign');
    var isFunction = require('can-util/js/is-function/is-function');
    var each = require('can-util/js/each/each');
    var dev = require('can-util/js/dev/dev');
    var types = require('can-types');
    var get = require('can-util/js/get/get');
    var domData = require('can-util/dom/data/data');
    var className = require('can-util/dom/class-name/class-name');
    var domEvents = require('can-util/dom/events/events');
    var canEvent = require('can-event');
    var canCompute = require('can-compute');
    var observeReader = require('can-stache-key');
    var canReflect = require('can-reflect');
    var processors;
    require('can-util/dom/dispatch/dispatch');
    require('can-util/dom/events/delegate/delegate');
    var bind = function (el, ev, callback) {
            canEvent.on.call(el, ev, callback);
            return function () {
                canEvent.off.call(el, ev, callback);
            };
        }, slice = [].slice, paramReplacer = /\{([^\}]+)\}/g, delegate = function (el, selector, ev, callback) {
            canEvent.on.call(el, ev, selector, callback);
            return function () {
                canEvent.off.call(el, ev, selector, callback);
            };
        }, binder = function (el, ev, callback, selector) {
            return selector ? delegate(el, selector.trim(), ev, callback) : bind(el, ev, callback);
        }, basicProcessor;
    var Control = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Control) {
                var control = this, funcName;
                control.actions = {};
                for (funcName in control.prototype) {
                    if (control._isAction(funcName)) {
                        control.actions[funcName] = control._action(funcName);
                    }
                }
            }
        },
        _shifter: function (context, name) {
            var method = typeof name === 'string' ? context[name] : name;
            if (!isFunction(method)) {
                method = context[method];
            }
            return function () {
                var wrapped = types.wrapElement(this);
                context.called = name;
                return method.apply(context, [wrapped].concat(slice.call(arguments, 0)));
            };
        },
        _isAction: function (methodName) {
            var val = this.prototype[methodName], type = typeof val;
            return methodName !== 'constructor' && (type === 'function' || type === 'string' && isFunction(this.prototype[val])) && !!(Control.isSpecial(methodName) || processors[methodName] || /[^\w]/.test(methodName));
        },
        _action: function (methodName, options, controlInstance) {
            var readyCompute;
            paramReplacer.lastIndex = 0;
            if (options || !paramReplacer.test(methodName)) {
                readyCompute = canCompute(function () {
                    var delegate;
                    var name = methodName.replace(paramReplacer, function (matched, key) {
                        var value, parent;
                        if (this._isDelegate(options, key)) {
                            delegate = this._getDelegate(options, key);
                            return '';
                        }
                        key = this._removeDelegateFromKey(key);
                        parent = this._lookup(options)[0];
                        value = observeReader.read(parent, observeReader.reads(key), { readCompute: false }).value;
                        if (value === undefined && typeof window !== 'undefined') {
                            value = get(window, key);
                        }
                        if (!parent || !(canReflect.isObservableLike(parent) && canReflect.isMapLike(parent)) && !value) {
                            return null;
                        }
                        if (typeof value === 'string') {
                            return value;
                        } else {
                            delegate = value;
                            return '';
                        }
                    }.bind(this));
                    name = name.trim();
                    var parts = name.split(/\s+/g), event = parts.pop();
                    return {
                        processor: this.processors[event] || basicProcessor,
                        parts: [
                            name,
                            parts.join(' '),
                            event
                        ],
                        delegate: delegate || undefined
                    };
                }, this);
                if (controlInstance) {
                    var handler = function (ev, ready) {
                        controlInstance._bindings.control[methodName](controlInstance.element);
                        controlInstance._bindings.control[methodName] = ready.processor(ready.delegate || controlInstance.element, ready.parts[2], ready.parts[1], methodName, controlInstance);
                    };
                    readyCompute.bind('change', handler);
                    controlInstance._bindings.readyComputes[methodName] = {
                        compute: readyCompute,
                        handler: handler
                    };
                }
                return readyCompute();
            }
        },
        _lookup: function (options) {
            return [
                options,
                window
            ];
        },
        _removeDelegateFromKey: function (key) {
            return key;
        },
        _isDelegate: function (options, key) {
            return key === 'element';
        },
        _getDelegate: function (options, key) {
            return undefined;
        },
        processors: {},
        defaults: {},
        convertElement: function (element) {
            element = typeof element === 'string' ? document.querySelector(element) : element;
            return types.wrapElement(element);
        },
        isSpecial: function (eventName) {
            return eventName === 'inserted' || eventName === 'removed';
        }
    }, {
        setup: function (element, options) {
            var cls = this.constructor, pluginname = cls.pluginName || cls.shortName, arr;
            if (!element) {
                throw new Error('Creating an instance of a named control without passing an element');
            }
            this.element = cls.convertElement(element);
            if (pluginname && pluginname !== 'can_control') {
                className.add.call(this.element, pluginname);
            }
            arr = domData.get.call(this.element, 'controls');
            if (!arr) {
                arr = [];
                domData.set.call(this.element, 'controls', arr);
            }
            arr.push(this);
            if (canReflect.isObservableLike(options) && canReflect.isMapLike(options)) {
                for (var prop in cls.defaults) {
                    if (!options.hasOwnProperty(prop)) {
                        observeReader.set(options, prop, cls.defaults[prop]);
                    }
                }
                this.options = options;
            } else {
                this.options = assign(assign({}, cls.defaults), options);
            }
            this.on();
            return [
                this.element,
                this.options
            ];
        },
        on: function (el, selector, eventName, func) {
            if (!el) {
                this.off();
                var cls = this.constructor, bindings = this._bindings, actions = cls.actions, element = types.unwrapElement(this.element), destroyCB = Control._shifter(this, 'destroy'), funcName, ready;
                for (funcName in actions) {
                    if (actions.hasOwnProperty(funcName)) {
                        ready = actions[funcName] || cls._action(funcName, this.options, this);
                        if (ready) {
                            bindings.control[funcName] = ready.processor(ready.delegate || element, ready.parts[2], ready.parts[1], funcName, this);
                        }
                    }
                }
                domEvents.addEventListener.call(element, 'removed', destroyCB);
                bindings.user.push(function (el) {
                    domEvents.removeEventListener.call(el, 'removed', destroyCB);
                });
                return bindings.user.length;
            }
            if (typeof el === 'string') {
                func = eventName;
                eventName = selector;
                selector = el;
                el = this.element;
            }
            if (func === undefined) {
                func = eventName;
                eventName = selector;
                selector = null;
            }
            if (typeof func === 'string') {
                func = Control._shifter(this, func);
            }
            this._bindings.user.push(binder(el, eventName, func, selector));
            return this._bindings.user.length;
        },
        off: function () {
            var el = types.unwrapElement(this.element), bindings = this._bindings;
            if (bindings) {
                each(bindings.user || [], function (value) {
                    value(el);
                });
                each(bindings.control || {}, function (value) {
                    value(el);
                });
                each(bindings.readyComputes || {}, function (value) {
                    value.compute.unbind('change', value.handler);
                });
            }
            this._bindings = {
                user: [],
                control: {},
                readyComputes: {}
            };
        },
        destroy: function () {
            if (this.element === null) {
                return;
            }
            var Class = this.constructor, pluginName = Class.pluginName || Class.shortName && string.underscore(Class.shortName), controls;
            this.off();
            if (pluginName && pluginName !== 'can_control') {
                className.remove.call(this.element, pluginName);
            }
            controls = domData.get.call(this.element, 'controls');
            if (controls) {
                controls.splice(controls.indexOf(this), 1);
            }
            canEvent.dispatch.call(this, 'destroyed');
            this.element = null;
        }
    });
    processors = Control.processors;
    basicProcessor = function (el, event, selector, methodName, control) {
        return binder(el, event, Control._shifter(control, methodName), selector);
    };
    each([
        'beforeremove',
        'change',
        'click',
        'contextmenu',
        'dblclick',
        'keydown',
        'keyup',
        'keypress',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'reset',
        'resize',
        'scroll',
        'select',
        'submit',
        'focusin',
        'focusout',
        'mouseenter',
        'mouseleave',
        'touchstart',
        'touchmove',
        'touchcancel',
        'touchend',
        'touchleave',
        'inserted',
        'removed',
        'dragstart',
        'dragenter',
        'dragover',
        'dragleave',
        'drag',
        'drop',
        'dragend'
    ], function (v) {
        processors[v] = basicProcessor;
    });
    module.exports = namespace.Control = Control;
});
/*can-component@3.3.6#control/control*/
define('can-component@3.3.6#control/control', [
    'require',
    'exports',
    'module',
    'can-control',
    'can-util/js/each/each',
    'can-util/js/string/string',
    'can-compute',
    'can-stache-key'
], function (require, exports, module) {
    var Control = require('can-control');
    var canEach = require('can-util/js/each/each');
    var string = require('can-util/js/string/string');
    var canCompute = require('can-compute');
    var observeReader = require('can-stache-key');
    var paramReplacer = /\{([^\}]+)\}/g;
    var ComponentControl = Control.extend({
        _lookup: function (options) {
            return [
                options.scope,
                options,
                window
            ];
        },
        _removeDelegateFromKey: function (key) {
            return key.replace(/^(scope|^viewModel)\./, '');
        },
        _isDelegate: function (options, key) {
            return key === 'scope' || key === 'viewModel';
        },
        _getDelegate: function (options, key) {
            return options[key];
        },
        _action: function (methodName, options, controlInstance) {
            var hasObjectLookup;
            paramReplacer.lastIndex = 0;
            hasObjectLookup = paramReplacer.test(methodName);
            if (!controlInstance && hasObjectLookup) {
                return;
            } else {
                return Control._action.apply(this, arguments);
            }
        }
    }, {
        setup: function (el, options) {
            this.scope = options.scope;
            this.viewModel = options.viewModel;
            return Control.prototype.setup.call(this, el, options);
        },
        off: function () {
            if (this._bindings) {
                canEach(this._bindings.readyComputes || {}, function (value) {
                    value.compute.unbind('change', value.handler);
                });
            }
            Control.prototype.off.apply(this, arguments);
            this._bindings.readyComputes = {};
        },
        destroy: function () {
            Control.prototype.destroy.apply(this, arguments);
            if (typeof this.options.destroy === 'function') {
                this.options.destroy.apply(this, arguments);
            }
        }
    });
    module.exports = ComponentControl;
});
/*can-view-model@3.5.1#can-view-model*/
define('can-view-model@3.5.1#can-view-model', [
    'require',
    'exports',
    'module',
    'can-util/dom/data/data',
    'can-simple-map',
    'can-types',
    'can-namespace',
    'can-globals/document/document',
    'can-util/js/is-array-like/is-array-like',
    'can-reflect'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var domData = require('can-util/dom/data/data');
        var SimpleMap = require('can-simple-map');
        var types = require('can-types');
        var ns = require('can-namespace');
        var getDocument = require('can-globals/document/document');
        var isArrayLike = require('can-util/js/is-array-like/is-array-like');
        var canReflect = require('can-reflect');
        module.exports = ns.viewModel = function (el, attr, val) {
            var scope;
            if (typeof el === 'string') {
                el = getDocument().querySelector(el);
            } else if (isArrayLike(el) && !el.nodeType) {
                el = el[0];
            }
            if (canReflect.isObservableLike(attr) && canReflect.isMapLike(attr)) {
                return domData.set.call(el, 'viewModel', attr);
            }
            scope = domData.get.call(el, 'viewModel');
            if (!scope) {
                scope = types.DefaultMap ? new types.DefaultMap() : new SimpleMap();
                domData.set.call(el, 'viewModel', scope);
            }
            switch (arguments.length) {
            case 0:
            case 1:
                return scope;
            case 2:
                return 'attr' in scope ? scope.attr(attr) : scope[attr];
            default:
                if ('attr' in scope) {
                    scope.attr(attr, val);
                } else {
                    scope[attr] = val;
                }
                return el;
            }
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-simple-observable@1.0.2#can-simple-observable*/
define('can-simple-observable@1.0.2#can-simple-observable', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-event/batch/batch',
    'can-observation',
    'can-cid',
    'can-namespace'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    var canBatch = require('can-event/batch/batch');
    var Observation = require('can-observation');
    var CID = require('can-cid');
    var ns = require('can-namespace');
    module.exports = ns.simpleObservable = function simpleObservable(initialValue) {
        var value = initialValue;
        var handlers = [];
        var fn = function (newValue) {
            if (arguments.length) {
                value = newValue;
                handlers.forEach(function (handler) {
                    canBatch.queue([
                        handler,
                        fn,
                        [newValue]
                    ]);
                }, this);
            } else {
                Observation.add(fn);
                return value;
            }
        };
        CID(fn);
        canReflect.assignSymbols(fn, {
            'can.onValue': function (handler) {
                handlers.push(handler);
            },
            'can.offValue': function (handler) {
                var index = handlers.indexOf(handler);
                handlers.splice(index, 1);
            },
            'can.setValue': function (newValue) {
                return fn(newValue);
            },
            'can.getValue': function () {
                return fn();
            }
        });
        return fn;
    };
});
/*can-dom-events@1.0.6#helpers/util*/
define('can-dom-events@1.0.6#helpers/util', [
    'require',
    'exports',
    'module',
    'can-globals/document/document',
    'can-globals/is-browser-window/is-browser-window'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var getCurrentDocument = require('can-globals/document/document');
        var isBrowserWindow = require('can-globals/is-browser-window/is-browser-window');
        function getTargetDocument(target) {
            return target.ownerDocument || getCurrentDocument();
        }
        function createEvent(target, eventData, bubbles, cancelable) {
            var doc = getTargetDocument(target);
            var event = doc.createEvent('HTMLEvents');
            var eventType;
            if (typeof eventData === 'string') {
                eventType = eventData;
            } else {
                eventType = eventData.type;
                for (var prop in eventData) {
                    if (event[prop] === undefined) {
                        event[prop] = eventData[prop];
                    }
                }
            }
            if (bubbles === undefined) {
                bubbles = true;
            }
            event.initEvent(eventType, bubbles, cancelable);
            return event;
        }
        function isDomEventTarget(obj) {
            if (!(obj && obj.nodeName)) {
                return obj === window;
            }
            var nodeType = obj.nodeType;
            return nodeType === 1 || nodeType === 9 || nodeType === 11;
        }
        function addDomContext(context, args) {
            if (isDomEventTarget(context)) {
                args = Array.prototype.slice.call(args, 0);
                args.unshift(context);
            }
            return args;
        }
        function removeDomContext(context, args) {
            if (!isDomEventTarget(context)) {
                args = Array.prototype.slice.call(args, 0);
                context = args.shift();
            }
            return {
                context: context,
                args: args
            };
        }
        var fixSyntheticEventsOnDisabled = false;
        (function () {
            if (true || !isBrowserWindow()) {
                return;
            }
            var testEventName = 'fix_synthetic_events_on_disabled_test';
            var input = document.createElement('input');
            input.disabled = true;
            var timer = setTimeout(function () {
                fixSyntheticEventsOnDisabled = true;
            }, 50);
            var onTest = function onTest() {
                clearTimeout(timer);
                input.removeEventListener(testEventName, onTest);
            };
            input.addEventListener(testEventName, onTest);
            try {
                var event = document.create('HTMLEvents');
                event.initEvent(testEventName, false);
                input.dispatchEvent(event);
            } catch (e) {
                onTest();
                fixSyntheticEventsOnDisabled = true;
            }
        }());
        function isDispatchingOnDisabled(element, event) {
            var eventType = event.type;
            var isInsertedOrRemoved = eventType === 'inserted' || eventType === 'removed';
            var isDisabled = !!element.disabled;
            return isInsertedOrRemoved && isDisabled;
        }
        function forceEnabledForDispatch(element, event) {
            return fixSyntheticEventsOnDisabled && isDispatchingOnDisabled(element, event);
        }
        module.exports = {
            createEvent: createEvent,
            addDomContext: addDomContext,
            removeDomContext: removeDomContext,
            isDomEventTarget: isDomEventTarget,
            getTargetDocument: getTargetDocument,
            forceEnabledForDispatch: forceEnabledForDispatch
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-dom-events@1.0.6#helpers/add-event-compat*/
define('can-dom-events@1.0.6#helpers/add-event-compat', [
    'require',
    'exports',
    'module',
    './util'
], function (require, exports, module) {
    'use strict';
    var util = require('./util');
    var addDomContext = util.addDomContext;
    var removeDomContext = util.removeDomContext;
    function isDomEvents(obj) {
        return !!(obj && obj.addEventListener && obj.removeEventListener && obj.dispatch);
    }
    function isNewEvents(obj) {
        return typeof obj.addEvent === 'function';
    }
    module.exports = function addEventCompat(domEvents, customEvent, customEventType) {
        if (!isDomEvents(domEvents)) {
            throw new Error('addEventCompat() must be passed can-dom-events or can-util/dom/events/events');
        }
        customEventType = customEventType || customEvent.defaultEventType;
        if (isNewEvents(domEvents)) {
            return domEvents.addEvent(customEvent, customEventType);
        }
        var registry = domEvents._compatRegistry;
        if (!registry) {
            registry = domEvents._compatRegistry = {};
        }
        if (registry[customEventType]) {
            return function noopRemoveOverride() {
            };
        }
        registry[customEventType] = customEvent;
        var newEvents = {
            addEventListener: function () {
                var data = removeDomContext(this, arguments);
                return domEvents.addEventListener.apply(data.context, data.args);
            },
            removeEventListener: function () {
                var data = removeDomContext(this, arguments);
                return domEvents.removeEventListener.apply(data.context, data.args);
            },
            dispatch: function () {
                var data = removeDomContext(this, arguments);
                var eventData = data.args[0];
                var eventArgs = typeof eventData === 'object' ? eventData.args : [];
                data.args.splice(1, 0, eventArgs);
                return domEvents.dispatch.apply(data.context, data.args);
            }
        };
        var isOverriding = true;
        var oldAddEventListener = domEvents.addEventListener;
        var addEventListener = domEvents.addEventListener = function addEventListener(eventName) {
            if (isOverriding && eventName === customEventType) {
                var args = addDomContext(this, arguments);
                customEvent.addEventListener.apply(newEvents, args);
            }
            return oldAddEventListener.apply(this, arguments);
        };
        var oldRemoveEventListener = domEvents.removeEventListener;
        var removeEventListener = domEvents.removeEventListener = function removeEventListener(eventName) {
            if (isOverriding && eventName === customEventType) {
                var args = addDomContext(this, arguments);
                customEvent.removeEventListener.apply(newEvents, args);
            }
            return oldRemoveEventListener.apply(this, arguments);
        };
        return function removeOverride() {
            isOverriding = false;
            registry[customEventType] = null;
            if (domEvents.addEventListener === addEventListener) {
                domEvents.addEventListener = oldAddEventListener;
            }
            if (domEvents.removeEventListener === removeEventListener) {
                domEvents.removeEventListener = oldRemoveEventListener;
            }
        };
    };
});
/*can-event-dom-enter@1.0.4#can-event-dom-enter*/
define('can-event-dom-enter@1.0.4#can-event-dom-enter', [
    'require',
    'exports',
    'module',
    'can-dom-data-state',
    'can-cid'
], function (require, exports, module) {
    'use strict';
    var domData = require('can-dom-data-state');
    var canCid = require('can-cid');
    var baseEventType = 'keyup';
    function isEnterEvent(event) {
        var hasEnterKey = event.key === 'Enter';
        var hasEnterCode = event.keyCode === 13;
        return hasEnterKey || hasEnterCode;
    }
    function getHandlerKey(eventType, handler) {
        return eventType + ':' + canCid(handler);
    }
    function associateHandler(target, eventType, handler, otherHandler) {
        var key = getHandlerKey(eventType, handler);
        domData.set.call(target, key, otherHandler);
    }
    function disassociateHandler(target, eventType, handler) {
        var key = getHandlerKey(eventType, handler);
        var otherHandler = domData.get.call(target, key);
        if (otherHandler) {
            domData.clean.call(target, key);
        }
        return otherHandler;
    }
    module.exports = {
        defaultEventType: 'enter',
        addEventListener: function (target, eventType, handler) {
            var keyHandler = function (event) {
                if (isEnterEvent(event)) {
                    return handler.apply(this, arguments);
                }
            };
            associateHandler(target, eventType, handler, keyHandler);
            this.addEventListener(target, baseEventType, keyHandler);
        },
        removeEventListener: function (target, eventType, handler) {
            var keyHandler = disassociateHandler(target, eventType, handler);
            if (keyHandler) {
                this.removeEventListener(target, baseEventType, keyHandler);
            }
        }
    };
});
/*can-event-dom-enter@1.0.4#compat*/
define('can-event-dom-enter@1.0.4#compat', [
    'require',
    'exports',
    'module',
    'can-dom-events/helpers/add-event-compat',
    './can-event-dom-enter'
], function (require, exports, module) {
    var addEventCompat = require('can-dom-events/helpers/add-event-compat');
    var radioChange = require('./can-event-dom-enter');
    module.exports = function (domEvents, eventType) {
        return addEventCompat(domEvents, radioChange, eventType);
    };
});
/*can-dom-events@1.0.6#helpers/make-event-registry*/
define('can-dom-events@1.0.6#helpers/make-event-registry', function (require, exports, module) {
    'use strict';
    function EventRegistry() {
        this._registry = {};
    }
    module.exports = function makeEventRegistry() {
        return new EventRegistry();
    };
    EventRegistry.prototype.has = function (eventType) {
        return !!this._registry[eventType];
    };
    EventRegistry.prototype.get = function (eventType) {
        return this._registry[eventType];
    };
    EventRegistry.prototype.add = function (event, eventType) {
        if (!event) {
            throw new Error('An EventDefinition must be provided');
        }
        if (typeof event.addEventListener !== 'function') {
            throw new TypeError('EventDefinition addEventListener must be a function');
        }
        if (typeof event.removeEventListener !== 'function') {
            throw new TypeError('EventDefinition removeEventListener must be a function');
        }
        eventType = eventType || event.defaultEventType;
        if (typeof eventType !== 'string') {
            throw new TypeError('Event type must be a string, not ' + eventType);
        }
        if (this.has(eventType)) {
            throw new Error('Event "' + eventType + '" is already registered');
        }
        this._registry[eventType] = event;
        var self = this;
        return function remove() {
            self._registry[eventType] = undefined;
        };
    };
});
/*can-dom-events@1.0.6#can-dom-events*/
define('can-dom-events@1.0.6#can-dom-events', [
    'require',
    'exports',
    'module',
    'can-namespace',
    './helpers/util',
    './helpers/make-event-registry'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var namespace = require('can-namespace');
        var util = require('./helpers/util');
        var makeEventRegistry = require('./helpers/make-event-registry');
        var domEvents = {
            _eventRegistry: makeEventRegistry(),
            addEvent: function (event, eventType) {
                return this._eventRegistry.add(event, eventType);
            },
            addEventListener: function (target, eventType) {
                var hasCustomEvent = domEvents._eventRegistry.has(eventType);
                if (hasCustomEvent) {
                    var event = domEvents._eventRegistry.get(eventType);
                    return event.addEventListener.apply(domEvents, arguments);
                }
                var eventArgs = Array.prototype.slice.call(arguments, 1);
                return target.addEventListener.apply(target, eventArgs);
            },
            removeEventListener: function (target, eventType) {
                var hasCustomEvent = domEvents._eventRegistry.has(eventType);
                if (hasCustomEvent) {
                    var event = domEvents._eventRegistry.get(eventType);
                    return event.removeEventListener.apply(domEvents, arguments);
                }
                var eventArgs = Array.prototype.slice.call(arguments, 1);
                return target.removeEventListener.apply(target, eventArgs);
            },
            dispatch: function (target, eventData, bubbles, cancelable) {
                var event = util.createEvent(target, eventData, bubbles, cancelable);
                var enableForDispatch = util.forceEnabledForDispatch(target, event);
                if (enableForDispatch) {
                    target.disabled = false;
                }
                var ret = target.dispatchEvent(event);
                if (enableForDispatch) {
                    target.disabled = true;
                }
                return ret;
            }
        };
        module.exports = namespace.domEvents = domEvents;
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-event-dom-radiochange@1.0.4#can-event-dom-radiochange*/
define('can-event-dom-radiochange@1.0.4#can-event-dom-radiochange', [
    'require',
    'exports',
    'module',
    'can-dom-data-state',
    'can-globals/document/document',
    'can-dom-events',
    'can-cid/map/map'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var domData = require('can-dom-data-state');
        var getDocument = require('can-globals/document/document');
        var domEvents = require('can-dom-events');
        var CIDMap = require('can-cid/map/map');
        function getRoot(el) {
            return el.ownerDocument || getDocument().documentElement;
        }
        function getRegistryName(eventName) {
            return 'can-event-radiochange:' + eventName + ':registry';
        }
        function getListenerName(eventName) {
            return 'can-event-radiochange:' + eventName + ':listener';
        }
        function getRegistry(root, eventName) {
            var name = getRegistryName(eventName);
            var registry = domData.get.call(root, name);
            if (!registry) {
                registry = new CIDMap();
                domData.set.call(root, name, registry);
            }
            return registry;
        }
        function findParentForm(el) {
            while (el) {
                if (el.nodeName === 'FORM') {
                    break;
                }
                el = el.parentNode;
            }
            return el;
        }
        function shouldReceiveEventFromRadio(source, dest) {
            var name = source.getAttribute('name');
            return name && name === dest.getAttribute('name') && findParentForm(source) === findParentForm(dest);
        }
        function isRadioInput(el) {
            return el.nodeName === 'INPUT' && el.type === 'radio';
        }
        function dispatch(eventName, target) {
            var root = getRoot(target);
            var registry = getRegistry(root, eventName);
            registry.forEach(function (el) {
                if (shouldReceiveEventFromRadio(target, el)) {
                    domEvents.dispatch(el, eventName);
                }
            });
        }
        function attachRootListener(root, eventName, events) {
            var listenerName = getListenerName(eventName);
            var listener = domData.get.call(root, listenerName);
            if (listener) {
                return;
            }
            var newListener = function (event) {
                var target = event.target;
                if (isRadioInput(target)) {
                    dispatch(eventName, target);
                }
            };
            events.addEventListener(root, 'change', newListener);
            domData.set.call(root, listenerName, newListener);
        }
        function detachRootListener(root, eventName, events) {
            var listenerName = getListenerName(eventName);
            var listener = domData.get.call(root, listenerName);
            if (!listener) {
                return;
            }
            var registry = getRegistry(root, eventName);
            if (registry.size > 0) {
                return;
            }
            events.removeEventListener(root, 'change', listener);
            domData.clean.call(root, listenerName);
        }
        function addListener(eventName, el, events) {
            if (!isRadioInput(el)) {
                throw new Error('Listeners for ' + eventName + ' must be radio inputs');
            }
            var root = getRoot(el);
            getRegistry(root, eventName).set(el, el);
            attachRootListener(root, eventName, events);
        }
        function removeListener(eventName, el, events) {
            var root = getRoot(el);
            getRegistry(root, eventName).delete(el);
            detachRootListener(root, eventName, events);
        }
        module.exports = {
            defaultEventType: 'radiochange',
            addEventListener: function (target, eventName, handler) {
                addListener(eventName, target, this);
                target.addEventListener(eventName, handler);
            },
            removeEventListener: function (target, eventName, handler) {
                removeListener(eventName, target, this);
                target.removeEventListener(eventName, handler);
            }
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-event-dom-radiochange@1.0.4#compat*/
define('can-event-dom-radiochange@1.0.4#compat', [
    'require',
    'exports',
    'module',
    'can-dom-events/helpers/add-event-compat',
    './can-event-dom-radiochange'
], function (require, exports, module) {
    var addEventCompat = require('can-dom-events/helpers/add-event-compat');
    var radioChange = require('./can-event-dom-radiochange');
    module.exports = function (domEvents, eventType) {
        return addEventCompat(domEvents, radioChange, eventType);
    };
});
/*can-stache-bindings@3.11.2#can-stache-bindings*/
define('can-stache-bindings@3.11.2#can-stache-bindings', [
    'require',
    'exports',
    'module',
    'can-stache/src/expression',
    'can-view-callbacks',
    'can-view-live',
    'can-view-scope',
    'can-view-model',
    'can-event',
    'can-compute',
    'can-stache-key',
    'can-observation',
    'can-simple-observable',
    'can-util/js/assign/assign',
    'can-util/js/make-array/make-array',
    'can-util/js/each/each',
    'can-util/js/string/string',
    'can-log/dev/dev',
    'can-types',
    'can-util/js/last/last',
    'can-globals/mutation-observer/mutation-observer',
    'can-util/dom/events/events',
    'can-util/dom/events/removed/removed',
    'can-util/dom/data/data',
    'can-util/dom/attr/attr',
    'can-log',
    'can-stache/helpers/core',
    'can-symbol',
    'can-reflect',
    'can-util/js/single-reference/single-reference',
    'can-attribute-encoder',
    'can-event-dom-enter/compat',
    'can-event-dom-radiochange/compat'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var expression = require('can-stache/src/expression');
        var viewCallbacks = require('can-view-callbacks');
        var live = require('can-view-live');
        var Scope = require('can-view-scope');
        var canViewModel = require('can-view-model');
        var canEvent = require('can-event');
        var compute = require('can-compute');
        var observeReader = require('can-stache-key');
        var Observation = require('can-observation');
        var observable = require('can-simple-observable');
        var assign = require('can-util/js/assign/assign');
        var makeArray = require('can-util/js/make-array/make-array');
        var each = require('can-util/js/each/each');
        var string = require('can-util/js/string/string');
        var dev = require('can-log/dev/dev');
        var types = require('can-types');
        var last = require('can-util/js/last/last');
        var getMutationObserver = require('can-globals/mutation-observer/mutation-observer');
        var domEvents = require('can-util/dom/events/events');
        require('can-util/dom/events/removed/removed');
        var domData = require('can-util/dom/data/data');
        var attr = require('can-util/dom/attr/attr');
        var canLog = require('can-log');
        var stacheHelperCore = require('can-stache/helpers/core');
        var canSymbol = require('can-symbol');
        var canReflect = require('can-reflect');
        var singleReference = require('can-util/js/single-reference/single-reference');
        var encoder = require('can-attribute-encoder');
        var addEnterEvent = require('can-event-dom-enter/compat');
        addEnterEvent(domEvents);
        var addRadioChange = require('can-event-dom-radiochange/compat');
        addRadioChange(domEvents);
        var noop = function () {
        };
        var onMatchStr = 'on:', vmMatchStr = 'vm:', elMatchStr = 'el:', byMatchStr = ':by:', toMatchStr = ':to', fromMatchStr = ':from', bindMatchStr = ':bind', attributesEventStr = 'attributes', removedStr = 'removed', viewModelBindingStr = 'viewModel', attributeBindingStr = 'attribute', scopeBindingStr = 'scope', viewModelOrAttributeBindingStr = 'viewModelOrAttribute', getValueSymbol = 'can.getValue', setValueSymbol = 'can.setValue', onValueSymbol = 'can.onValue', offValueSymbol = 'can.offValue';
        function isBindingsAttribute(attributeName) {
            return attributeName.indexOf(toMatchStr) !== -1 || attributeName.indexOf(fromMatchStr) !== -1 || attributeName.indexOf(bindMatchStr) !== -1;
        }
        function setPriority(observable, priority) {
            if (observable instanceof Observation) {
                observable.compute._primaryDepth = priority;
            } else if (observable.computeInstance) {
                observable.computeInstance.setPrimaryDepth(priority);
            } else if (observable.observation) {
                observable.observation.compute._primaryDepth = priority;
            }
        }
        var throwOnlyOneTypeOfBindingError = function () {
            throw new Error('can-stache-bindings - you can not have contextual bindings ( this:from=\'value\' ) and key bindings ( prop:from=\'value\' ) on one element.');
        };
        var checkBindingState = function (bindingState, dataBinding) {
            var isSettingOnViewModel = dataBinding.bindingInfo.parentToChild && dataBinding.bindingInfo.child === viewModelBindingStr;
            if (isSettingOnViewModel) {
                var bindingName = dataBinding.bindingInfo.childName;
                var isSettingViewModel = isSettingOnViewModel && (bindingName === 'this' || bindingName === '.');
                if (isSettingViewModel) {
                    if (bindingState.isSettingViewModel || bindingState.isSettingOnViewModel) {
                        throwOnlyOneTypeOfBindingError();
                    } else {
                        return {
                            isSettingViewModel: true,
                            initialViewModelData: undefined
                        };
                    }
                } else {
                    if (bindingState.isSettingViewModel) {
                        throwOnlyOneTypeOfBindingError();
                    } else {
                        return {
                            isSettingOnViewModel: true,
                            initialViewModelData: bindingState.initialViewModelData
                        };
                    }
                }
            } else {
                return bindingState;
            }
        };
        var behaviors = {
            viewModel: function (el, tagData, makeViewModel, initialViewModelData, staticDataBindingsOnly) {
                var bindingsSemaphore = {}, viewModel, onCompleteBindings = [], onTeardowns = {}, bindingInfos = {}, attributeViewModelBindings = assign({}, initialViewModelData), bindingsState = {
                        isSettingOnViewModel: false,
                        isSettingViewModel: false,
                        initialViewModelData: initialViewModelData || {}
                    }, hasDataBinding = false;
                each(makeArray(el.attributes), function (node) {
                    var dataBinding = makeDataBinding(node, el, {
                        templateType: tagData.templateType,
                        scope: tagData.scope,
                        semaphore: bindingsSemaphore,
                        getViewModel: function () {
                            return viewModel;
                        },
                        attributeViewModelBindings: attributeViewModelBindings,
                        alreadyUpdatedChild: true,
                        nodeList: tagData.parentNodeList,
                        favorViewModel: true
                    });
                    if (dataBinding) {
                        bindingsState = checkBindingState(bindingsState, dataBinding);
                        hasDataBinding = true;
                        if (dataBinding.onCompleteBinding) {
                            if (dataBinding.bindingInfo.parentToChild && dataBinding.value !== undefined) {
                                if (bindingsState.isSettingViewModel) {
                                    bindingsState.initialViewModelData = dataBinding.value;
                                } else {
                                    bindingsState.initialViewModelData[cleanVMName(dataBinding.bindingInfo.childName)] = dataBinding.value;
                                }
                            }
                            onCompleteBindings.push(dataBinding.onCompleteBinding);
                        }
                        onTeardowns[node.name] = dataBinding.onTeardown;
                    }
                });
                if (staticDataBindingsOnly && !hasDataBinding) {
                    return;
                }
                viewModel = makeViewModel(bindingsState.initialViewModelData, hasDataBinding);
                for (var i = 0, len = onCompleteBindings.length; i < len; i++) {
                    onCompleteBindings[i]();
                }
                if (!bindingsState.isSettingViewModel) {
                    domEvents.addEventListener.call(el, attributesEventStr, function (ev) {
                        var attrName = ev.attributeName, value = el.getAttribute(attrName);
                        if (onTeardowns[attrName]) {
                            onTeardowns[attrName]();
                        }
                        var parentBindingWasAttribute = bindingInfos[attrName] && bindingInfos[attrName].parent === attributeBindingStr;
                        if (value !== null || parentBindingWasAttribute) {
                            var dataBinding = makeDataBinding({
                                name: attrName,
                                value: value
                            }, el, {
                                templateType: tagData.templateType,
                                scope: tagData.scope,
                                semaphore: {},
                                getViewModel: function () {
                                    return viewModel;
                                },
                                attributeViewModelBindings: attributeViewModelBindings,
                                initializeValues: true,
                                nodeList: tagData.parentNodeList
                            });
                            if (dataBinding) {
                                if (dataBinding.onCompleteBinding) {
                                    dataBinding.onCompleteBinding();
                                }
                                bindingInfos[attrName] = dataBinding.bindingInfo;
                                onTeardowns[attrName] = dataBinding.onTeardown;
                            }
                        }
                    });
                }
                return function () {
                    for (var attrName in onTeardowns) {
                        onTeardowns[attrName]();
                    }
                };
            },
            data: function (el, attrData) {
                if (domData.get.call(el, 'preventDataBindings')) {
                    return;
                }
                var viewModel, getViewModel = function () {
                        return viewModel || (viewModel = canViewModel(el));
                    }, semaphore = {}, teardown;
                var legacyBindings = bindingsRegExp.exec(attrData.attributeName);
                var twoWay = legacyBindings && legacyBindings[1];
                var dataBinding = makeDataBinding({
                    name: attrData.attributeName,
                    value: el.getAttribute(attrData.attributeName),
                    nodeList: attrData.nodeList
                }, el, {
                    templateType: attrData.templateType,
                    scope: attrData.scope,
                    semaphore: semaphore,
                    getViewModel: getViewModel,
                    syncChildWithParent: twoWay
                });
                if (dataBinding.onCompleteBinding) {
                    dataBinding.onCompleteBinding();
                }
                teardown = dataBinding.onTeardown;
                canEvent.one.call(el, removedStr, function () {
                    teardown();
                });
                domEvents.addEventListener.call(el, attributesEventStr, function (ev) {
                    var attrName = ev.attributeName, value = el.getAttribute(attrName);
                    if (attrName === attrData.attributeName) {
                        if (teardown) {
                            teardown();
                        }
                        if (value !== null) {
                            var dataBinding = makeDataBinding({
                                name: attrName,
                                value: value
                            }, el, {
                                templateType: attrData.templateType,
                                scope: attrData.scope,
                                semaphore: semaphore,
                                getViewModel: getViewModel,
                                initializeValues: true,
                                nodeList: attrData.nodeList,
                                syncChildWithParent: twoWay
                            });
                            if (dataBinding) {
                                if (dataBinding.onCompleteBinding) {
                                    dataBinding.onCompleteBinding();
                                }
                                teardown = dataBinding.onTeardown;
                            }
                        }
                    }
                });
            },
            reference: function (el, attrData) {
                if (el.getAttribute(attrData.attributeName)) {
                    canLog.warn('*reference attributes can only export the view model.');
                }
                var name = string.camelize(attrData.attributeName.substr(1).toLowerCase());
                var viewModel = canViewModel(el);
                attrData.scope.set('scope.vars.' + name, viewModel);
            },
            event: function (el, data) {
                var attributeName = encoder.decode(data.attributeName), event, bindingContext;
                if (attributeName.indexOf(toMatchStr + ':') !== -1 || attributeName.indexOf(fromMatchStr + ':') !== -1 || attributeName.indexOf(bindMatchStr + ':') !== -1) {
                    return this.data(el, data);
                }
                if (startsWith.call(attributeName, 'can-')) {
                    event = attributeName.substr('can-'.length);
                    bindingContext = el;
                } else if (startsWith.call(attributeName, onMatchStr)) {
                    event = attributeName.substr(onMatchStr.length);
                    var viewModel = domData.get.call(el, viewModelBindingStr);
                    var byParent = data.scope;
                    if (startsWith.call(event, elMatchStr)) {
                        event = event.substr(elMatchStr.length);
                        bindingContext = el;
                    } else {
                        if (startsWith.call(event, vmMatchStr)) {
                            event = event.substr(vmMatchStr.length);
                            bindingContext = viewModel;
                            byParent = viewModel;
                        } else {
                            bindingContext = viewModel || el;
                        }
                        var byIndex = event.indexOf(byMatchStr);
                        if (byIndex >= 0) {
                            bindingContext = byParent.get(decodeAttrName(event.substr(byIndex + byMatchStr.length)));
                            event = event.substr(0, byIndex);
                        }
                    }
                } else {
                    event = removeBrackets(attributeName, '(', ')');
                    dev.warn('can-stache-bindings: the event binding format (' + event + ') is deprecated. Use on:' + string.camelize(event[0] === '$' ? event.slice(1) : event.split(' ').reverse().filter(function (s) {
                        return s;
                    }).join(':by:')) + ' instead');
                    if (event.charAt(0) === '$') {
                        event = event.substr(1);
                        bindingContext = el;
                    } else {
                        if (event.indexOf(' ') >= 0) {
                            var eventSplit = event.split(' ');
                            bindingContext = data.scope.get(decodeAttrName(eventSplit[0]));
                            event = eventSplit[1];
                        } else {
                            bindingContext = canViewModel(el);
                        }
                    }
                }
                event = decodeAttrName(event);
                var handler = function (ev) {
                    var attrVal = el.getAttribute(encoder.encode(attributeName));
                    if (!attrVal) {
                        return;
                    }
                    var viewModel = canViewModel(el);
                    var expr = expression.parse(removeBrackets(attrVal), {
                        lookupRule: function () {
                            return expression.Lookup;
                        },
                        methodRule: 'call'
                    });
                    if (!(expr instanceof expression.Call) && !(expr instanceof expression.Helper)) {
                        var defaultArgs = [
                            data.scope._context,
                            el
                        ].concat(makeArray(arguments)).map(function (data) {
                            return new expression.Arg(new expression.Literal(data));
                        });
                        expr = new expression.Call(expr, defaultArgs, {});
                    }
                    var specialValues = {
                        element: el,
                        event: ev,
                        viewModel: viewModel,
                        arguments: arguments
                    };
                    var legacySpecialValues = {
                        '@element': el,
                        '@event': ev,
                        '@viewModel': viewModel,
                        '@scope': data.scope,
                        '@context': data.scope._context,
                        '%element': this,
                        '$element': types.wrapElement(el),
                        '%event': ev,
                        '%viewModel': viewModel,
                        '%scope': data.scope,
                        '%context': data.scope._context,
                        '%arguments': arguments
                    };
                    var localScope = data.scope.add(legacySpecialValues, { notContext: true }).add(specialValues, { special: true });
                    var scopeData = localScope.read(expr.methodExpr.key, { isArgument: true }), args, stacheHelper, stacheHelperResult;
                    if (!scopeData.value) {
                        var name = observeReader.reads(expr.methodExpr.key).map(function (part) {
                            return part.key;
                        }).join('.');
                        stacheHelper = stacheHelperCore.getHelper(name);
                        if (stacheHelper) {
                            args = expr.args(localScope, null)();
                            stacheHelperResult = stacheHelper.fn.apply(localScope.peek('.'), args);
                            if (typeof stacheHelperResult === 'function') {
                                stacheHelperResult(el);
                            }
                            return stacheHelperResult;
                        }
                        return null;
                    }
                    args = expr.args(localScope, null)();
                    return scopeData.value.apply(scopeData.parent, args);
                };
                var attributesHandler = function (ev) {
                    var isEventAttribute = ev.attributeName === attributeName;
                    var isRemoved = !this.getAttribute(attributeName);
                    var isEventAttributeRemoved = isEventAttribute && isRemoved;
                    if (isEventAttributeRemoved) {
                        unbindEvent();
                    }
                };
                var removedHandler = function (ev) {
                    unbindEvent();
                };
                var unbindEvent = function () {
                    canEvent.off.call(bindingContext, event, handler);
                    canEvent.off.call(el, attributesEventStr, attributesHandler);
                    canEvent.off.call(el, removedStr, removedHandler);
                };
                canEvent.on.call(bindingContext, event, handler);
                canEvent.on.call(el, attributesEventStr, attributesHandler);
                canEvent.on.call(el, removedStr, removedHandler);
            },
            value: function (el, data) {
                var propName = '$value', attrValue = removeBrackets(el.getAttribute('can-value')).trim(), nodeName = el.nodeName.toLowerCase(), elType = nodeName === 'input' && (el.type || el.getAttribute('type')), getterSetter;
                if (nodeName === 'input' && (elType === 'checkbox' || elType === 'radio')) {
                    var property = getObservableFrom.scope(el, data.scope, attrValue, {}, true);
                    if (el.type === 'checkbox') {
                        var trueValue = attr.has(el, 'can-true-value') ? el.getAttribute('can-true-value') : true, falseValue = attr.has(el, 'can-false-value') ? el.getAttribute('can-false-value') : false;
                        getterSetter = compute(function (newValue) {
                            var isSet = arguments.length !== 0;
                            if (property && property[canSymbol.for(getValueSymbol)]) {
                                if (isSet) {
                                    canReflect.setValue(property, newValue ? trueValue : falseValue);
                                } else {
                                    return canReflect.getValue(property) == trueValue;
                                }
                            } else {
                                if (isSet) {
                                } else {
                                    return property == trueValue;
                                }
                            }
                        });
                    } else if (elType === 'radio') {
                        getterSetter = compute(function (newValue) {
                            var isSet = arguments.length !== 0 && newValue;
                            if (property && property[canSymbol.for(getValueSymbol)]) {
                                if (isSet) {
                                    canReflect.setValue(property, el.value);
                                } else {
                                    return canReflect.getValue(property) == el.value;
                                }
                            } else {
                                if (isSet) {
                                } else {
                                    return property == el.value;
                                }
                            }
                        });
                    }
                    propName = '$checked';
                    attrValue = 'getterSetter';
                    data.scope = new Scope({ getterSetter: getterSetter });
                } else if (isContentEditable(el)) {
                    propName = '$innerHTML';
                }
                var dataBinding = makeDataBinding({
                    name: '{(' + propName + ')}',
                    value: attrValue
                }, el, {
                    templateType: data.templateType,
                    scope: data.scope,
                    semaphore: {},
                    initializeValues: true,
                    legacyBindings: true
                });
                canEvent.one.call(el, removedStr, function () {
                    dataBinding.onTeardown();
                });
            }
        };
        viewCallbacks.attr(/^(:lb:)[(:c:)\w-]+(:rb:)$/, behaviors.data);
        viewCallbacks.attr(/[\w\.:]+:to$/, behaviors.data);
        viewCallbacks.attr(/[\w\.:]+:from$/, behaviors.data);
        viewCallbacks.attr(/[\w\.:]+:bind$/, behaviors.data);
        viewCallbacks.attr(/[\w\.:]+:to:on:[\w\.:]+/, behaviors.data);
        viewCallbacks.attr(/[\w\.:]+:from:on:[\w\.:]+/, behaviors.data);
        viewCallbacks.attr(/[\w\.:]+:bind:on:[\w\.:]+/, behaviors.data);
        viewCallbacks.attr(/\*[\w\.\-_]+/, behaviors.reference);
        viewCallbacks.attr(/on:[\w\.:]+/, behaviors.event);
        viewCallbacks.attr(/^(:lp:)[(:d:)?\w\.\\]+(:rp:)$/, behaviors.event);
        viewCallbacks.attr(/can-[\w\.]+/, behaviors.event);
        viewCallbacks.attr('can-value', behaviors.value);
        var getObservableFrom = {
            viewModelOrAttribute: function (el, scope, vmNameOrProp, bindingData, mustBeSettable, stickyCompute, event) {
                var viewModel = domData.get.call(el, viewModelBindingStr);
                if (viewModel) {
                    return this.viewModel.apply(this, arguments);
                } else {
                    return this.attribute.apply(this, arguments);
                }
            },
            scope: function (el, scope, scopeProp, bindingData, mustBeSettable, stickyCompute) {
                if (!scopeProp) {
                    return observable();
                } else {
                    if (mustBeSettable) {
                        var parentExpression = expression.parse(scopeProp, { baseMethodType: 'Call' });
                        return parentExpression.value(scope, new Scope.Options({}));
                    } else {
                        var observation = new Observation(function () {
                        });
                        observation[canSymbol.for(setValueSymbol)] = function (newVal) {
                            scope.set(cleanVMName(scopeProp), newVal);
                        };
                        return observation;
                    }
                }
            },
            viewModel: function (el, scope, vmName, bindingData, mustBeSettable, stickyCompute) {
                var setName = cleanVMName(vmName);
                var isBoundToContext = vmName === '.' || vmName === 'this';
                var keysToRead = isBoundToContext ? [] : observeReader.reads(vmName);
                var observation = new Observation(function () {
                    var viewModel = bindingData.getViewModel();
                    return observeReader.read(viewModel, keysToRead, {}).value;
                });
                observation[canSymbol.for(setValueSymbol)] = function (newVal) {
                    var viewModel = bindingData.getViewModel();
                    if (arguments.length) {
                        if (stickyCompute) {
                            var oldValue = canReflect.getKeyValue(viewModel, setName);
                            if (canReflect.isObservableLike(oldValue)) {
                                canReflect.setValue(oldValue, newVal);
                            } else {
                                canReflect.setKeyValue(viewModel, setName, observable(canReflect.getValue(stickyCompute)));
                            }
                        } else {
                            if (isBoundToContext) {
                                canReflect.setValue(viewModel, newVal);
                            } else {
                                canReflect.setKeyValue(viewModel, setName, newVal);
                            }
                        }
                    }
                };
                return observation;
            },
            attribute: function (el, scope, prop, bindingData, mustBeSettable, stickyCompute, event) {
                if (!event) {
                    event = 'change';
                    var isRadioInput = el.nodeName === 'INPUT' && el.type === 'radio';
                    var isValidProp = prop === 'checked' && !bindingData.legacyBindings;
                    if (isRadioInput && isValidProp) {
                        event = 'radiochange';
                    }
                    var isSpecialProp = attr.special[prop] && attr.special[prop].addEventListener;
                    if (isSpecialProp) {
                        event = prop;
                    }
                }
                var hasChildren = el.nodeName.toLowerCase() === 'select', isMultiselectValue = prop === 'value' && hasChildren && el.multiple, set = function (newVal) {
                        if (bindingData.legacyBindings && hasChildren && 'selectedIndex' in el && prop === 'value') {
                            attr.setAttrOrProp(el, prop, newVal == null ? '' : newVal);
                        } else {
                            attr.setAttrOrProp(el, prop, newVal);
                        }
                        return newVal;
                    }, get = function () {
                        return attr.get(el, prop);
                    };
                if (isMultiselectValue) {
                    prop = 'values';
                }
                var observation = new Observation(get);
                observation[canSymbol.for(setValueSymbol)] = set;
                observation[canSymbol.for(getValueSymbol)] = get;
                observation[canSymbol.for(onValueSymbol)] = function (updater) {
                    var translationHandler = function () {
                        updater(get());
                    };
                    singleReference.set(updater, this, translationHandler);
                    if (event === 'radiochange') {
                        canEvent.on.call(el, 'change', translationHandler);
                    }
                    canEvent.on.call(el, event, translationHandler);
                };
                observation[canSymbol.for(offValueSymbol)] = function (updater) {
                    var translationHandler = singleReference.getAndDelete(updater, this);
                    if (event === 'radiochange') {
                        canEvent.off.call(el, 'change', translationHandler);
                    }
                    canEvent.off.call(el, event, translationHandler);
                };
                return observation;
            }
        };
        var bind = {
            childToParent: function (el, parentObservable, childObservable, bindingsSemaphore, attrName, syncChild) {
                var updateParent = function (newVal) {
                    if (!bindingsSemaphore[attrName]) {
                        if (parentObservable && parentObservable[canSymbol.for(getValueSymbol)]) {
                            if (canReflect.getValue(parentObservable) !== newVal) {
                                canReflect.setValue(parentObservable, newVal);
                            }
                            if (syncChild) {
                                if (canReflect.getValue(parentObservable) !== canReflect.getValue(childObservable)) {
                                    bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
                                    canReflect.setValue(childObservable, canReflect.getValue(parentObservable));
                                    Observation.afterUpdateAndNotify(function () {
                                        --bindingsSemaphore[attrName];
                                    });
                                }
                            }
                        } else if (canReflect.isMapLike(parentObservable)) {
                            var attrValue = el.getAttribute(attrName);
                            dev.warn('can-stache-bindings: Merging ' + attrName + ' into ' + attrValue + ' because its parent is non-observable');
                            canReflect.eachKey(parentObservable, function (prop) {
                                canReflect.deleteKeyValue(parentObservable, prop);
                            });
                            canReflect.setValue(parentObservable, newVal && newVal.serialize ? newVal.serialize() : newVal, true);
                        }
                    }
                };
                if (childObservable && childObservable[canSymbol.for(getValueSymbol)]) {
                    canReflect.onValue(childObservable, updateParent);
                }
                return updateParent;
            },
            parentToChild: function (el, parentObservable, childUpdate, bindingsSemaphore, attrName) {
                var updateChild = function (newValue) {
                    bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
                    canReflect.setValue(childUpdate, newValue);
                    Observation.afterUpdateAndNotify(function () {
                        --bindingsSemaphore[attrName];
                    });
                };
                if (parentObservable && parentObservable[canSymbol.for(getValueSymbol)]) {
                    canReflect.onValue(parentObservable, updateChild);
                }
                return updateChild;
            }
        };
        var startsWith = String.prototype.startsWith || function (text) {
            return this.indexOf(text) === 0;
        };
        function getEventName(result) {
            if (result.special.on !== undefined) {
                return result.tokens[result.special.on + 1];
            }
        }
        var bindingRules = {
            to: {
                childToParent: true,
                parentToChild: false,
                syncChildWithParent: false
            },
            from: {
                childToParent: false,
                parentToChild: true,
                syncChildWithParent: false
            },
            bind: {
                childToParent: true,
                parentToChild: true,
                syncChildWithParent: true
            }
        };
        var bindingNames = [];
        var special = {
            vm: true,
            on: true
        };
        each(bindingRules, function (value, key) {
            bindingNames.push(key);
            special[key] = true;
        });
        function tokenize(source) {
            var splitByColon = source.split(':');
            var result = {
                tokens: [],
                special: {}
            };
            splitByColon.forEach(function (token) {
                if (special[token]) {
                    result.special[token] = result.tokens.push(token) - 1;
                } else {
                    result.tokens.push(token);
                }
            });
            return result;
        }
        var bindingsRegExp = /\{(\()?(\^)?([^\}\)]+)\)?\}/, ignoreAttributesRegExp = /^(data-view-id|class|name|id|\[[\w\.-]+\]|#[\w\.-])$/i, DOUBLE_CURLY_BRACE_REGEX = /\{\{/g, encodedSpacesRegExp = /\\s/g, encodedForwardSlashRegExp = /\\f/g;
        var getChildBindingStr = function (tokens, favorViewModel) {
            if (tokens.indexOf('vm') >= 0) {
                return viewModelBindingStr;
            } else if (tokens.indexOf('el') >= 0) {
                return attributeBindingStr;
            } else {
                return favorViewModel ? viewModelBindingStr : viewModelOrAttributeBindingStr;
            }
        };
        var getBindingInfo = function (node, attributeViewModelBindings, templateType, tagName, favorViewModel) {
            var bindingInfo, attributeName = encoder.decode(node.name), attributeValue = node.value || '', childName;
            var result = tokenize(attributeName), dataBindingName, specialIndex;
            bindingNames.forEach(function (name) {
                if (result.special[name] !== undefined && result.special[name] > 0) {
                    dataBindingName = name;
                    specialIndex = result.special[name];
                    return false;
                }
            });
            if (dataBindingName) {
                var childEventName = getEventName(result);
                var initializeValues = childEventName ? false : true;
                return assign({
                    parent: scopeBindingStr,
                    child: getChildBindingStr(result.tokens, favorViewModel),
                    childName: result.tokens[specialIndex - 1],
                    childEvent: childEventName,
                    bindingAttributeName: attributeName,
                    parentName: attributeValue,
                    initializeValues: initializeValues
                }, bindingRules[dataBindingName]);
            }
            var matches = attributeName.match(bindingsRegExp);
            if (!matches) {
                var ignoreAttribute = ignoreAttributesRegExp.test(attributeName);
                var vmName = string.camelize(attributeName);
                if (ignoreAttribute || viewCallbacks.attr(encoder.encode(attributeName))) {
                    return;
                }
                var syntaxRight = attributeValue[0] === '{' && last(attributeValue) === '}';
                var isAttributeToChild = templateType === 'legacy' ? attributeViewModelBindings[vmName] : !syntaxRight;
                var scopeName = syntaxRight ? attributeValue.substr(1, attributeValue.length - 2) : attributeValue;
                if (isAttributeToChild) {
                    return {
                        bindingAttributeName: attributeName,
                        parent: attributeBindingStr,
                        parentName: attributeName,
                        child: viewModelBindingStr,
                        childName: vmName,
                        parentToChild: true,
                        childToParent: true,
                        syncChildWithParent: true
                    };
                } else {
                    return {
                        bindingAttributeName: attributeName,
                        parent: scopeBindingStr,
                        parentName: scopeName,
                        child: viewModelBindingStr,
                        childName: vmName,
                        parentToChild: true,
                        childToParent: true,
                        syncChildWithParent: true
                    };
                }
            }
            var twoWay = !!matches[1], childToParent = twoWay || !!matches[2], parentToChild = twoWay || !childToParent;
            childName = matches[3];
            var newLookup = {
                '^': ':to',
                '(': ':bind'
            };
            dev.warn('can-stache-bindings: the data binding format ' + attributeName + ' is deprecated. Use ' + string.camelize(matches[3][0] === '$' ? matches[3].slice(1) : matches[3]) + (newLookup[attributeName.charAt(1)] || ':from') + ' instead');
            var isDOM = childName.charAt(0) === '$';
            if (isDOM) {
                bindingInfo = {
                    parent: scopeBindingStr,
                    child: attributeBindingStr,
                    childToParent: childToParent,
                    parentToChild: parentToChild,
                    bindingAttributeName: attributeName,
                    childName: childName.substr(1),
                    parentName: attributeValue,
                    initializeValues: true,
                    syncChildWithParent: twoWay
                };
                if (tagName === 'select') {
                    bindingInfo.stickyParentToChild = true;
                }
                return bindingInfo;
            } else {
                bindingInfo = {
                    parent: scopeBindingStr,
                    child: viewModelBindingStr,
                    childToParent: childToParent,
                    parentToChild: parentToChild,
                    bindingAttributeName: attributeName,
                    childName: decodeAttrName(string.camelize(childName)),
                    parentName: attributeValue,
                    initializeValues: true,
                    syncChildWithParent: twoWay
                };
                if (attributeValue.trim().charAt(0) === '~') {
                    bindingInfo.stickyParentToChild = true;
                }
                return bindingInfo;
            }
        };
        var decodeAttrName = function (name) {
            return name.replace(encodedSpacesRegExp, ' ').replace(encodedForwardSlashRegExp, '/');
        };
        var makeDataBinding = function (node, el, bindingData) {
            var bindingInfo = getBindingInfo(node, bindingData.attributeViewModelBindings, bindingData.templateType, el.nodeName.toLowerCase(), bindingData.favorViewModel);
            if (!bindingInfo) {
                return;
            }
            bindingInfo.alreadyUpdatedChild = bindingData.alreadyUpdatedChild;
            if (bindingData.initializeValues) {
                bindingInfo.initializeValues = true;
            }
            var parentObservable = getObservableFrom[bindingInfo.parent](el, bindingData.scope, bindingInfo.parentName, bindingData, bindingInfo.parentToChild), childObservable = getObservableFrom[bindingInfo.child](el, bindingData.scope, bindingInfo.childName, bindingData, bindingInfo.childToParent, bindingInfo.stickyParentToChild && parentObservable, bindingInfo.childEvent), updateParent, updateChild;
            if (bindingData.nodeList) {
                if (parentObservable) {
                    setPriority(parentObservable, bindingData.nodeList.nesting + 1);
                }
                if (childObservable) {
                    setPriority(childObservable, bindingData.nodeList.nesting + 1);
                }
            }
            if (bindingInfo.parentToChild) {
                updateChild = bind.parentToChild(el, parentObservable, childObservable, bindingData.semaphore, bindingInfo.bindingAttributeName);
            }
            var completeBinding = function () {
                if (bindingInfo.childToParent) {
                    updateParent = bind.childToParent(el, parentObservable, childObservable, bindingData.semaphore, bindingInfo.bindingAttributeName, bindingInfo.syncChildWithParent);
                } else if (bindingInfo.stickyParentToChild && childObservable[canSymbol.for(onValueSymbol)]) {
                    canReflect.onValue(childObservable, noop);
                }
                if (bindingInfo.initializeValues) {
                    initializeValues(bindingInfo, childObservable, parentObservable, updateChild, updateParent);
                }
            };
            var onTeardown = function () {
                unbindUpdate(parentObservable, updateChild);
                unbindUpdate(childObservable, updateParent);
                unbindUpdate(childObservable, noop);
            };
            if (bindingInfo.child === viewModelBindingStr) {
                return {
                    value: bindingInfo.stickyParentToChild ? observable(getValue(parentObservable)) : getValue(parentObservable),
                    onCompleteBinding: completeBinding,
                    bindingInfo: bindingInfo,
                    onTeardown: onTeardown
                };
            } else {
                completeBinding();
                return {
                    bindingInfo: bindingInfo,
                    onTeardown: onTeardown
                };
            }
        };
        var initializeValues = function (bindingInfo, childObservable, parentObservable, updateChild, updateParent) {
            var doUpdateParent = false;
            if (bindingInfo.parentToChild && !bindingInfo.childToParent) {
            } else if (!bindingInfo.parentToChild && bindingInfo.childToParent) {
                doUpdateParent = true;
            } else if (getValue(childObservable) === undefined) {
            } else if (getValue(parentObservable) === undefined) {
                doUpdateParent = true;
            }
            if (doUpdateParent) {
                updateParent(getValue(childObservable));
            } else {
                if (!bindingInfo.alreadyUpdatedChild) {
                    updateChild(getValue(parentObservable));
                }
            }
        };
        if (!getMutationObserver()) {
            var updateSelectValue = function (el) {
                var bindingCallback = domData.get.call(el, 'canBindingCallback');
                if (bindingCallback) {
                    bindingCallback.onMutation(el);
                }
            };
            live.registerChildMutationCallback('select', updateSelectValue);
            live.registerChildMutationCallback('optgroup', function (el) {
                updateSelectValue(el.parentNode);
            });
        }
        var isContentEditable = function () {
                var values = {
                    '': true,
                    'true': true,
                    'false': false
                };
                var editable = function (el) {
                    if (!el || !el.getAttribute) {
                        return;
                    }
                    var attr = el.getAttribute('contenteditable');
                    return values[attr];
                };
                return function (el) {
                    var val = editable(el);
                    if (typeof val === 'boolean') {
                        return val;
                    } else {
                        return !!editable(el.parentNode);
                    }
                };
            }(), removeBrackets = function (value, open, close) {
                open = open || '{';
                close = close || '}';
                if (value[0] === open && value[value.length - 1] === close) {
                    return value.substr(1, value.length - 2);
                }
                return value;
            }, getValue = function (value) {
                return value && value[canSymbol.for(getValueSymbol)] ? canReflect.getValue(value) : value;
            }, unbindUpdate = function (observable, updater) {
                if (observable && observable[canSymbol.for(getValueSymbol)] && typeof updater === 'function') {
                    canReflect.offValue(observable, updater);
                }
            }, cleanVMName = function (name) {
                return name.replace(/@/g, '');
            };
        module.exports = {
            behaviors: behaviors,
            getBindingInfo: getBindingInfo
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-component@3.3.6#can-component*/
define('can-component@3.3.6#can-component', [
    'require',
    'exports',
    'module',
    './control/control',
    'can-namespace',
    'can-construct',
    'can-stache-bindings',
    'can-view-scope',
    'can-view-callbacks',
    'can-view-nodelist',
    'can-compute',
    'can-util/dom/data/data',
    'can-util/dom/mutate/mutate',
    'can-util/dom/child-nodes/child-nodes',
    'can-util/dom/dispatch/dispatch',
    'can-types',
    'can-util/js/string/string',
    'can-reflect',
    'can-util/js/each/each',
    'can-util/js/assign/assign',
    'can-util/js/is-function/is-function',
    'can-util/js/log/log',
    'can-util/js/dev/dev',
    'can-util/js/make-array/make-array',
    'can-util/js/is-empty-object/is-empty-object',
    'can-util/dom/events/inserted/inserted',
    'can-util/dom/events/removed/removed',
    'can-view-model'
], function (require, exports, module) {
    var ComponentControl = require('./control/control');
    var namespace = require('can-namespace');
    var Construct = require('can-construct');
    var stacheBindings = require('can-stache-bindings');
    var Scope = require('can-view-scope');
    var viewCallbacks = require('can-view-callbacks');
    var nodeLists = require('can-view-nodelist');
    var compute = require('can-compute');
    var domData = require('can-util/dom/data/data');
    var domMutate = require('can-util/dom/mutate/mutate');
    var getChildNodes = require('can-util/dom/child-nodes/child-nodes');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var types = require('can-types');
    var string = require('can-util/js/string/string');
    var canReflect = require('can-reflect');
    var canEach = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    var isFunction = require('can-util/js/is-function/is-function');
    var canLog = require('can-util/js/log/log');
    var canDev = require('can-util/js/dev/dev');
    var makeArray = require('can-util/js/make-array/make-array');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    require('can-util/dom/events/inserted/inserted');
    require('can-util/dom/events/removed/removed');
    require('can-view-model');
    function addContext(el, tagData, insertionElementTagData) {
        var vm;
        domData.set.call(el, 'preventDataBindings', true);
        var teardown = stacheBindings.behaviors.viewModel(el, insertionElementTagData, function (initialData) {
            return vm = compute(initialData);
        }, undefined, true);
        if (!teardown) {
            return tagData;
        } else {
            return assign(assign({}, tagData), {
                teardown: teardown,
                scope: tagData.scope.add(vm)
            });
        }
    }
    function makeInsertionTagCallback(tagName, componentTagData, shadowTagData, leakScope, getPrimaryTemplate) {
        var options = shadowTagData.options._context;
        return function hookupFunction(el, insertionElementTagData) {
            var template = getPrimaryTemplate(el) || insertionElementTagData.subtemplate, renderingLightContent = template !== insertionElementTagData.subtemplate;
            if (template) {
                delete options.tags[tagName];
                var tagData;
                if (renderingLightContent) {
                    if (leakScope.toLightContent) {
                        tagData = addContext(el, {
                            scope: insertionElementTagData.scope.cloneFromRef(),
                            options: insertionElementTagData.options
                        }, insertionElementTagData);
                    } else {
                        tagData = addContext(el, componentTagData, insertionElementTagData);
                    }
                } else {
                    tagData = addContext(el, insertionElementTagData, insertionElementTagData);
                }
                var nodeList = nodeLists.register([el], function () {
                    if (tagData.teardown) {
                        tagData.teardown();
                    }
                }, insertionElementTagData.parentNodeList || true, false);
                nodeList.expression = '<can-slot name=\'' + el.getAttribute('name') + '\'/>';
                var frag = template(tagData.scope, tagData.options, nodeList);
                var newNodes = makeArray(getChildNodes(frag));
                nodeLists.replace(nodeList, frag);
                nodeLists.update(nodeList, newNodes);
                options.tags[tagName] = hookupFunction;
            }
        };
    }
    var Component = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Component) {
                var self = this;
                if (!isEmptyObject(this.prototype.events)) {
                    this.Control = ComponentControl.extend(this.prototype.events);
                }
                var protoViewModel = this.prototype.viewModel || this.prototype.scope;
                if (protoViewModel && this.prototype.ViewModel) {
                    throw new Error('Cannot provide both a ViewModel and a viewModel property');
                }
                var vmName = string.capitalize(string.camelize(this.prototype.tag)) + 'VM';
                if (this.prototype.ViewModel) {
                    if (typeof this.prototype.ViewModel === 'function') {
                        this.ViewModel = this.prototype.ViewModel;
                    } else {
                        this.ViewModel = types.DefaultMap.extend(vmName, this.prototype.ViewModel);
                    }
                } else {
                    if (protoViewModel) {
                        if (typeof protoViewModel === 'function') {
                            if (canReflect.isObservableLike(protoViewModel.prototype) && canReflect.isMapLike(protoViewModel.prototype)) {
                                this.ViewModel = protoViewModel;
                            } else {
                                this.viewModelHandler = protoViewModel;
                            }
                        } else {
                            if (canReflect.isObservableLike(protoViewModel) && canReflect.isMapLike(protoViewModel)) {
                                this.viewModelInstance = protoViewModel;
                            } else {
                                this.ViewModel = types.DefaultMap.extend(vmName, protoViewModel);
                            }
                        }
                    } else {
                        this.ViewModel = types.DefaultMap.extend(vmName, {});
                    }
                }
                if (this.prototype.template) {
                    this.renderer = this.prototype.template;
                }
                if (this.prototype.view) {
                    this.renderer = this.prototype.view;
                }
                viewCallbacks.tag(this.prototype.tag, function (el, options) {
                    new self(el, options);
                });
            }
        }
    }, {
        setup: function (el, componentTagData) {
            var component = this;
            var teardownFunctions = [];
            var initialViewModelData = {};
            var callTeardownFunctions = function () {
                for (var i = 0, len = teardownFunctions.length; i < len; i++) {
                    teardownFunctions[i]();
                }
            };
            var setupBindings = !domData.get.call(el, 'preventDataBindings');
            var viewModel, frag;
            var teardownBindings;
            if (setupBindings) {
                var setupFn = componentTagData.setupBindings || function (el, callback, data) {
                    return stacheBindings.behaviors.viewModel(el, componentTagData, callback, data);
                };
                teardownBindings = setupFn(el, function (initialViewModelData) {
                    var ViewModel = component.constructor.ViewModel, viewModelHandler = component.constructor.viewModelHandler, viewModelInstance = component.constructor.viewModelInstance;
                    if (viewModelHandler) {
                        var scopeResult = viewModelHandler.call(component, initialViewModelData, componentTagData.scope, el);
                        if (canReflect.isObservableLike(scopeResult) && canReflect.isMapLike(scopeResult)) {
                            viewModelInstance = scopeResult;
                        } else if (canReflect.isObservableLike(scopeResult.prototype) && canReflect.isMapLike(scopeResult.prototype)) {
                            ViewModel = scopeResult;
                        } else {
                            ViewModel = types.DefaultMap.extend(scopeResult);
                        }
                    }
                    if (ViewModel) {
                        viewModelInstance = new component.constructor.ViewModel(initialViewModelData);
                    }
                    viewModel = viewModelInstance;
                    return viewModelInstance;
                }, initialViewModelData);
            }
            this.viewModel = viewModel;
            domData.set.call(el, 'viewModel', viewModel);
            domData.set.call(el, 'preventDataBindings', true);
            var options = {
                helpers: {},
                tags: {}
            };
            canEach(this.helpers || {}, function (val, prop) {
                if (isFunction(val)) {
                    options.helpers[prop] = val.bind(viewModel);
                }
            });
            if (this.constructor.Control) {
                this._control = new this.constructor.Control(el, {
                    scope: this.viewModel,
                    viewModel: this.viewModel,
                    destroy: callTeardownFunctions
                });
            }
            var leakScope = {
                toLightContent: this.leakScope === true,
                intoShadowContent: this.leakScope === true
            };
            var hasShadowTemplate = !!this.constructor.renderer;
            var betweenTagsRenderer;
            var betweenTagsTagData;
            if (hasShadowTemplate) {
                var shadowTagData;
                if (leakScope.intoShadowContent) {
                    shadowTagData = {
                        scope: componentTagData.scope.add(new Scope.Refs()).add(this.viewModel, { viewModel: true }),
                        options: componentTagData.options.add(options)
                    };
                } else {
                    shadowTagData = {
                        scope: Scope.refsScope().add(this.viewModel, { viewModel: true }),
                        options: new Scope.Options(options)
                    };
                }
                options.tags['can-slot'] = makeInsertionTagCallback('can-slot', componentTagData, shadowTagData, leakScope, function (el) {
                    return componentTagData.templates[el.getAttribute('name')];
                });
                options.tags.content = makeInsertionTagCallback('content', componentTagData, shadowTagData, leakScope, function () {
                    return componentTagData.subtemplate;
                });
                betweenTagsRenderer = this.constructor.renderer;
                betweenTagsTagData = shadowTagData;
            } else {
                var lightTemplateTagData = {
                    scope: componentTagData.scope.add(this.viewModel, { viewModel: true }),
                    options: componentTagData.options.add(options)
                };
                betweenTagsTagData = lightTemplateTagData;
                betweenTagsRenderer = componentTagData.subtemplate || el.ownerDocument.createDocumentFragment.bind(el.ownerDocument);
            }
            var nodeList = nodeLists.register([], function () {
                domDispatch.call(el, 'beforeremove', [], false);
                if (teardownBindings) {
                    teardownBindings();
                }
            }, componentTagData.parentNodeList || true, false);
            nodeList.expression = '<' + this.tag + '>';
            teardownFunctions.push(function () {
                nodeLists.unregister(nodeList);
            });
            frag = betweenTagsRenderer(betweenTagsTagData.scope, betweenTagsTagData.options, nodeList);
            domMutate.appendChild.call(el, frag);
            nodeLists.update(nodeList, getChildNodes(el));
        }
    });
    module.exports = namespace.Component = Component;
});
/*steal-stache@3.1.3#steal-stache*/
define('steal-stache@3.1.3#steal-stache', [], function(){ return {}; });
/*async/orders/orders.stache!steal-stache@3.1.3#steal-stache*/
define('async/orders/orders.stache!steal-stache@3.1.3#steal-stache', [
    'module',
    'can-stache',
    'can-stache/src/mustache_core',
    'can-view-import@3.2.5#can-view-import',
    'can-stache-bindings@3.11.2#can-stache-bindings'
], function (module, stache, mustacheCore) {
    var renderer = stache('async/orders/orders.stache', [
        {
            'tokenType': 'start',
            'args': [
                'div',
                false,
                1
            ]
        },
        {
            'tokenType': 'attrStart',
            'args': [
                'id',
                1
            ]
        },
        {
            'tokenType': 'attrValue',
            'args': [
                'orders',
                1
            ]
        },
        {
            'tokenType': 'attrEnd',
            'args': [
                'id',
                1
            ]
        },
        {
            'tokenType': 'end',
            'args': [
                'div',
                false,
                1
            ]
        },
        {
            'tokenType': 'chars',
            'args': [
                ' ',
                1
            ]
        },
        {
            'tokenType': 'special',
            'args': [
                '#each orders',
                1
            ]
        },
        {
            'tokenType': 'chars',
            'args': [
                '\n\t',
                1
            ]
        },
        {
            'tokenType': 'start',
            'args': [
                'div',
                false,
                2
            ]
        },
        {
            'tokenType': 'end',
            'args': [
                'div',
                false,
                2
            ]
        },
        {
            'tokenType': 'chars',
            'args': [
                'order ',
                2
            ]
        },
        {
            'tokenType': 'special',
            'args': [
                '%index',
                2
            ]
        },
        {
            'tokenType': 'close',
            'args': [
                'div',
                2
            ]
        },
        {
            'tokenType': 'chars',
            'args': [
                '\n',
                2
            ]
        },
        {
            'tokenType': 'special',
            'args': [
                '/each',
                3
            ]
        },
        {
            'tokenType': 'chars',
            'args': [
                '\n\n',
                3
            ]
        },
        {
            'tokenType': 'close',
            'args': [
                'div',
                5
            ]
        },
        {
            'tokenType': 'chars',
            'args': [
                '\n',
                5
            ]
        },
        {
            'tokenType': 'done',
            'args': [6]
        }
    ]);
    return function (scope, options, nodeList) {
        var moduleOptions = { module: module };
        if (!(options instanceof mustacheCore.Options)) {
            options = new mustacheCore.Options(options || {});
        }
        return renderer(scope, options.add(moduleOptions), nodeList);
    };
});
/*async/orders/orders*/
define('async/orders/orders', [
    'require',
    'exports',
    'module',
    'can-component',
    'can-map',
    'can-list',
    './orders.stache',
    './orders.css',
    'can-map-define'
], function (require, exports, module) {
    var Component = require('can-component');
    var Map = require('can-map');
    var List = require('can-list');
    var view = require('./orders.stache');
    require('./orders.css');
    require('can-map-define');
    var ViewModel = Map.extend({
        define: {
            orders: {
                Value: List,
                get: function (list) {
                    var promise = new Promise(function (resolve) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', 'http://localhost:8070/bar');
                        xhr.onload = function () {
							var data = JSON.parse(xhr.responseText);
                            resolve(data);
                        };
                        xhr.onerror = function (err) {
                            console.error(err);
                        };
                        xhr.send();
                    });
                    list.replace(promise);
                    return list;
                }
            }
        }
    });
    Component.extend({
        tag: 'order-history',
        view: view,
        ViewModel: ViewModel
    });
});
