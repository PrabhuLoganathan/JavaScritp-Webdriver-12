'use strict';

module.exports = {
    id: 'callback',
    description: 'Callback task',
    options: {
        setupCallback: {
            default: function () {}
        },
        teardownCallback: {
            default: function () {}
        },
        callback: {
            default: function () {}
        },
        someOption: {
            default: 'default'
        }
    },
    setup: function (opt, ctx, next) {
        opt.setupCallback.call(this, opt, ctx);
        next();
    },
    teardown: function (opt, ctx, next) {
        opt.teardownCallback.call(this, opt, ctx);
        next();
    },
    tasks: [
        {
            task: function (opt, ctx, next) {
                opt.callback.call(this, opt, ctx);
                next();
            }
        }
    ]
};