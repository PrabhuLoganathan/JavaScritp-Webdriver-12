var Automaton    = require('../index'),
    removeColors = require('../lib/Logger').removeColors,
    utils        = require('amd-utils'),
    expect       = require('expect.js'),
    Stream       = require('stream')
;

function arrow(msg, depth) {
    return utils.string.repeat('  ', depth - 1) + '> ' + msg + '\n';
}

function indent(msg, depth) {
    return utils.string.repeat('  ', depth - 1) + msg;
}

module.exports = function (automaton) {
    describe('Logging', function () {
        it('should return a stream when running tasks', function () {
            var ret = automaton
                .run({
                    tasks: []
                });

            expect(ret).to.be.a(Stream);

            ret = automaton
                .run({}); // attempt to run an invalid task on purpose

            expect(ret).to.be.a(Stream);
        });

        it('should report tasks with padding correspondent to the depth', function (done) {
            var log = '';

            automaton
                .run({
                    filter: function (opt, next) {
                        this.log.infoln('Level 1 task info');
                        this.log.warnln('Level 1 task warn');
                        this.log.successln('Level 1 task success');
                        this.log.errorln('Level 1 task error');
                        next();
                    },
                    description: 'Level 1 task',
                    tasks: [
                        {
                            task: function (opt, next) {
                                next();
                            },
                            description: 'Level 2 task'
                        },
                        {
                            task: {
                                description: 'This should not appear',
                                tasks: [
                                    {
                                        task: function (opt, next) {
                                            this.log.infoln('Level 3 task info');
                                            this.log.warnln('Level 3 task warn');
                                            this.log.successln('Level 3 task success');
                                            this.log.errorln('Level 3 task error');
                                            next();
                                        },
                                        description: 'Level 3 task'
                                    }
                                ]
                            },
                            description: 'Other level 2 task'
                        },
                        {
                            task: {
                                tasks: [
                                    {
                                        task: function (opt, next) { next(); },
                                        description: 'Other level 3 task'
                                    }
                                ]
                            }
                        },
                        {
                            task: {
                                name: 'Even other level 2 task',
                                tasks: [
                                    {
                                        task: function (opt, next) { next(); }
                                    }
                                ]
                            }
                        }
                    ]
                }, null, function (err) {
                    if (err) {
                        throw err;
                    }

                    log = removeColors(log);
                    expect(log).to.equal(
                        arrow('Level 1 task', 1) +
                        indent('Level 1 task info\n', 1) +
                        indent('Level 1 task warn\n', 1) +
                        indent('Level 1 task success\n', 1) +
                        indent('Level 1 task error\n', 1) +
                        arrow('Level 2 task', 2) +
                        arrow('Other level 2 task', 2) +
                        arrow('Level 3 task', 3) +
                        indent('Level 3 task info\n', 3) +
                        indent('Level 3 task warn\n', 3) +
                        indent('Level 3 task success\n', 3) +
                        indent('Level 3 task error\n', 3) +
                        arrow('', 2) +
                        arrow('Other level 3 task', 3) +
                        arrow('Even other level 2 task', 2) +
                        arrow('', 3)
                    );

                    done();
                })
                .on('data', function (data) { log += data; });
        });

        it('Should not throw error when logging types other than strings', function (done) {
            var log = '';

            automaton
                .run({
                    tasks: [
                        {
                            task: function (opt, next) {
                                this.log.infoln({});
                                this.log.infoln(['foo', 'bar']);
                                this.log.infoln(null);
                                this.log.infoln(undefined);
                                this.log.infoln(1);
                                this.log.infoln(true);

                                this.log.warnln({});
                                this.log.warnln(['foo', 'bar']);
                                this.log.warnln(null);
                                this.log.warnln(undefined);
                                this.log.warnln(1);
                                this.log.warnln(true);

                                this.log.successln({});
                                this.log.successln(['foo', 'bar']);
                                this.log.successln(null);
                                this.log.successln(undefined);
                                this.log.successln(1);
                                this.log.successln(true);

                                this.log.errorln({});
                                this.log.errorln(['foo', 'bar']);
                                this.log.errorln(null);
                                this.log.errorln(undefined);
                                this.log.errorln(1);
                                this.log.errorln(true);

                                next();
                            }
                        }
                    ]
                }, null, function (err) {
                    if (err) {
                        throw err;
                    }

                    log = removeColors(log);
                    expect(log).to.equal(
                        arrow('', 1) +
                        arrow('', 2) +
                        indent('[object Object]\n', 2) +
                        indent('foo,bar\n', 2) +
                        indent('null\n', 2) +
                        indent('undefined\n', 2) +
                        indent('1\n', 2) +
                        indent('true\n', 2) +

                        indent('[object Object]\n', 2) +
                        indent('foo,bar\n', 2) +
                        indent('null\n', 2) +
                        indent('undefined\n', 2) +
                        indent('1\n', 2) +
                        indent('true\n', 2) +

                        indent('[object Object]\n', 2) +
                        indent('foo,bar\n', 2) +
                        indent('null\n', 2) +
                        indent('undefined\n', 2) +
                        indent('1\n', 2) +
                        indent('true\n', 2) +

                        indent('[object Object]\n', 2) +
                        indent('foo,bar\n', 2) +
                        indent('null\n', 2) +
                        indent('undefined\n', 2) +
                        indent('1\n', 2) +
                        indent('true\n', 2)
                    );

                    done();
                })
                .on('data', function (data) { log += data; });
        });

        it('Should not indent after a nonln log', function (done) {
            var log = '';

            automaton
                .run({
                    tasks: [
                        {
                            task: function (opt, next) {
                                this.log.infoln('foo');
                                this.log.info('bar');
                                this.log.info('baz');
                                this.log.ln();
                                this.log.infoln('faa');

                                next();
                            }
                        }
                    ]
                }, null, function (err) {
                    if (err) {
                        throw err;
                    }

                    log = removeColors(log);
                    expect(log).to.equal(
                        arrow('', 1) +
                        arrow('', 2) +
                        indent('foo\n', 2) +
                        indent('bar', 2) +
                        'baz' +
                        '\n' +
                        indent('faa\n', 2)
                    );

                    done();
                })
                .on('data', function (data) { log += data; });
        });
    });

    it.skip('should indent new lines in the middle of a message');
};