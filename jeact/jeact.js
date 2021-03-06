;(function(){

Jeact = Klas.extend({
    constructor: function(props) {
        if (props == null) {
            props = {};
        }
        this.props = props;

        this.preInit();

        var html;
        if (typeof this.template === 'string') {
            html = this.template;
        } else {
            html = this.template();
        }

        this.$el = $(html).data('widget', this);

        var tmp = refsAndWidgets(this.$el);
        // jquery节点们
        this.refs = tmp[0];
        // 子模块们
        var widgets = tmp[1];

        // 绑定事件
        var events = this.events;
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var args = event.slice(0, -1);
            var handlerName = event[event.length - 1];
            var handler = this[handlerName];

            if (!handler) {
                throw new Error('no handler named ' + handlerName);
            }
            args.push(proxyHandler(this, handler));
            this.$el.on.apply(this.$el, args);
        }




        // 初始化子模块们
        this.widgets = {};
        var widgetMap = this.initWidgets();
        for (var name in widgets) {
            var $widget = widgets[name];
            var widget = widgetMap[name];
            $widget.replaceWith(widget.$el);
            widget.$el.attr('widget',name);
            this.widgets[name] = widget;
        }

        this.init();
    },
    // 组件整体的jquery对象
    $el: null,
    // [ref]节点们
    refs: null,
    // [widget] 子组件对象们
    widgets: null,
    // string || function
    template: '',
    // this.$el.on()
    events: [
        ['_remove', 'onRemove']
    ],
    preInit: function() {},
    init: function() {},
    // 与refs对应
    initWidgets: function() {
        return {};
    },
    // 移除本组件
    remove: function() {
        this.$el.find('[widget]').andBack().each(function() {
            $(this).triggerHandler('_remove');
        });
        this.$el.remove();
    },
    // 在被remove时调用
    onRemove: function() {},
    // 触发自身事件 不冒泡
    emit: function() {
        return this.$el.triggerHandler.apply(this.$el, arguments);
    },
    // 触发事件 并冒泡
    dispatch: function() {
        return this.$el.trigger.apply(this.$el, arguments);
    }
});

var extend = Jeact.extend;
// 继承父类events
Jeact.extend = function() {
    var proto = arguments[arguments.length - 1];
    proto.events = this.prototype.events.concat(proto.events || []);
    return extend.apply(this, arguments);
};

function refsAndWidgets($el) {
    var res;
    var refs = {};
    var widgets = {};

    $el.find('[ref],[widget]').each(function() {
        var jthis = $(this);
        var attr = jthis.attr('ref');
        if (attr) {
            res = refs;
        } else {
            attr = jthis.attr('widget');
            res = widgets;
        }
        var jele = res[attr];
        if (jele) {
            jele.push(this);
        } else {
            res[attr] = jthis;
        }
    });
    return [refs, widgets];
}

function proxyHandler(widget, handler) {
    return function(e) {
        var res = handler.apply(widget, arguments);
        if (res !== true) {
            e.stopPropagation();
            return res;
        }
    };
}

}());