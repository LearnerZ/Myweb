(function() {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global) ||
        this || {};

    function isValidListener(listener) {
        if (typeof listener === 'function') {
            return true
        } else if (listener && typeof listener === 'object') {
            return isValidListener(listener.listener)
        } else {
            return false
        }
    }

    function EventEmitter() {
        this.__events = {}
    }

    EventEmitter.VERSION = '1.0.0';

    var proto = EventEmitter.prototype;

    /**
     * 添加事件
     * @param  {String} eventName 事件名称
     * @param  {Function} listener 监听器函数
     * @return {Object} 可链式调用
     */
    proto.on = function(eventName, listener) {
        if (!eventName || !listener) return;

        if (!isValidListener(listener)) {
            throw new TypeError('listener must be a function');
        }

        var events = this.__events;
        var listeners = events[eventName] = events[eventName] || [];
        var listenerIsWrapped = typeof listener === 'object';

        // 不重复添加事件
        if (listeners.indexOf(listener) === -1) {
            listeners.push(listenerIsWrapped ? listener : {
                listener: listener,
                once: false
            });
        }

        return this;
    };

    /**
     * 添加事件，该事件只能被执行一次
     * @param  {String} eventName 事件名称
     * @param  {Function} listener 监听器函数
     * @return {Object} 可链式调用
     */
    proto.once = function(eventName, listener) {
        return this.on(eventName, {
            listener: listener,
            once: true
        })
    };

    /**
     * 删除事件
     * @param  {String} eventName 事件名称
     * @param  {Function} listener 监听器函数
     * @return {Object} 可链式调用
     */
    proto.off = function(eventName, listener) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        var index;
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] && listeners[i].listener === listener) {
                index = i;
                break;
            }
        }

        if (typeof index !== 'undefined') {
            listeners.splice(index, 1, null)
        }

        return this;
    };

    /**
     * 触发事件
     * @param  {String} eventName 事件名称
     * @param  {Array} args 传入监听器函数的参数，使用数组形式传入
     * @return {Object} 可链式调用
     */
    proto.emit = function(eventName, args) {
        var listeners = this.__events[eventName];
        if (!listeners) return;

        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            if (listener) {
                listener.listener.apply(this, args || []);
                if (listener.once) {
                    this.off(eventName, listener.listener)
                }
            }

        }

        return this;

    };

    /**
     * 删除某一个类型的所有事件或者所有事件
     * @param  {String[]} eventName 事件名称
     */
    proto.allOff = function(eventName) {
        if (eventName && this.__events[eventName]) {
            this.__events[eventName] = []
        } else {
            this.__events = {}
        }
    };

    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = EventEmitter;
        }
        exports.EventEmitter = EventEmitter;
    } else {
        root.EventEmitter = EventEmitter;
    }

}());



(function() {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global) ||
        this || {};


    var util = {
        extend: function(target) {
            for (var i = 1, len = arguments.length; i < len; i++) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        target[prop] = arguments[i][prop]
                    }
                }
            }

            return target
        }
    };

    function AutoType(element, arr, options) {

        EventEmitter.call(this);

        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.arr = arr;
        // 会根据该数组的结果进行渲染
        this.textArr = [];
        this.options = util.extend({}, this.constructor.defaultOptions, options);

        this.index = 0;
        this.handle();
    }

    AutoType.VERSION = '1.0.0';

    AutoType.defaultOptions = {
        // 默认打字间歇 200 ms
        speed: 200,
        type: ''
    };

    var proto = AutoType.prototype = new EventEmitter;

    proto.constructor = AutoType;

    proto.handle = function() {

        var current = this.arr[this.index];

        if (!current) {
            this.render(true);
            this.emit('end')
            return;
        }

        switch(current.type) {
            case 'text':
                this.handleText(current);
                break;
            case 'wait':
                this.handleWait(current);
                break;
            case 'delete':
                this.handleDelete(current);
                break;
            case 'br':
                this.handleBr(current);
                break;
            case 'img':
                this.handleImg(current);
                break;
            default:
                this.handlePlainText(current);
        }

    };

    proto.handleText = function(obj) {
        var text = obj.text.split('');
        this.type(text, 0, obj.time ? obj.time : this.options.speed)
    };

    proto.type = function(text, index, time) {
        if (index < text.length) {
            this.textArr.push(text[index]);
            this.render();
            setTimeout(this.type.bind(this), time, text, ++index, time)
        } else {
            this.index++;
            this.handle();
        }
    };

    proto.render = function(isEnd) {
        this.element.innerHTML = this.textArr.join('') + (isEnd ? '' : this.options.type)
        this.element.scrollTop = this.element.scrollHeight;
    };

    proto.handleWait = function(obj) {
        this.index++;
        setTimeout(this.handle.bind(this), obj.time ? obj.time : this.options.speed)
    };

    proto.handleDelete = function(obj) {
        this.delete(obj.num, obj.time ? obj.time : this.options.speed)
    };

    proto.delete = function(remain, time) {
        if (remain > 0) {
            this.textArr.pop()
            this.render();
            setTimeout(this.delete.bind(this), time, --remain, time)
        }
        else {
            this.next()
        }

    };

    proto.handleBr = function(obj){
        this.textArr.push('<br /><br />');
        this.index++;
        setTimeout(this.handle.bind(this), obj.time ? obj.time : this.options.speed)
    };

    proto.handleImg = function(obj) {
        var result = ['<img '];
        for (var key in obj) {
            result.push(key + '="' + obj[key] + '" ')
        }
        result.push(' />')

        this.textArr.push(result.join(''))
        this.render()

        var self = this;
        setTimeout(function(){
            self.next()
        }, obj.time ? obj.time : this.options.speed)

    };

    proto.handlePlainText = function(obj) {
        this.textArr.push(obj)
        this.render()

        var self = this;
        setTimeout(function(){
            self.next()
        }, obj.time ? obj.time : this.options.speed)

    };

    proto.next = function(){
        this.index++;
        this.handle()
    };

    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = AutoType;
        }
        exports.AutoType = AutoType;
    } else {
        root.AutoType = AutoType;
    }

}());


var arr = [
	{ type: 'wait', time: 1000 },
    { type: 'text', text: '做一个个人网站需要什么呢？', time:100},
    { type: 'wait', time: 800 },
    { type: 'text', text: '一台电脑和不怕麻烦的心。', time:100},
	{ type: 'wait', time: 400 },
	{ type: 'delete', num: 12},
    { type: 'text', text: '那还需要哪些相关知识呢？', time:100},
	{ type: 'wait', time: 800 },
    { type: 'text', text: 'Html、Css。', time: 100},
	{ type: 'br'},
	{ type: 'text', text: 'Html，告诉电脑该展示什么内容，就像是照相一样，画面里面你想要什么就放什么。Css，内容应该是什么样子的，什么颜色的，多大的，在什么位置。当然还有非常非常多有意思的布局可以学习。', time: 80},
	{ type: 'wait', time: 800 },
	{ type: 'delete', num: 20},
    { type: 'text', text: '可能你会觉得这样的网站太单调了都不会动，那等你布置完后就可以用JavaScript让整个网站交互起来。弹出，动画，登陆接口想要什么就做什么，就像是一个工具箱一样！',time: 50},
    { type: 'wait', time: 400 },
    { type: 'text', text: '如果你还觉得不够，还可以用已经整合好的Vue.js,react.js套件，直接用人家已经做好的，菜都不用自己做，摆盘就行了。', time:100 },
	{ type: 'wait', time: 800 },
	{ type: 'text', text: '#@g79ds@!', time:100},
	{ type: 'wait', time: 400 },
	{ type: 'delete', num: 9},
	{ type: 'wait', time: 800 },
	{ type: 'text', text: '水倒键盘上了。。', time:200},
	{ type: 'delete', num: 8},
	{ type: 'wait', time: 800 },
	{ type: 'text', text: '还不赶快快动起手来！', time:100},
	{ type: 'wait', time: 800 },
]

var autoType = new AutoType("#typing", arr, {
    // 设置打字时间，表示在无设置的情况下，打字间隔为 200ms
    speed: 200
});
autoType.once("end", function() {
    console.log('事件结束');
})