var argv = require('minimist')(process.argv.slice(2)),
    AppContainer = require('app-container'),
    express = require('express'),
    path = require('path'),
    debug = require('debug')('app-base'),
    container = new AppContainer();

container.init({
        pre: function(app) {
            debug('init pre');
            app.set('views', path.join(__dirname, 'views'));
            app.set('view engine', 'jade');
            app.use(express.static(path.join(__dirname, 'static')));
        },
        post_session: function(app) {
            debug('init post_session');
            app.use(require('connect-flash')());
            app.get('/login',function(req, res) {
              var messages = req.flash();
              debug('flash',messages);
              res.render('login', { title: 'Login', messages: messages });
            });
        },
        post_passport: function(app) {
            if(argv.monolithic) {
                debug('starting in monolithic mode, wiring in local services.');
                require('user-resource-container').init(container);
                require('geo-resource-container').init(container);
            }
            require('app-container-login').init(container,{logout: true});
        },
        post: function(app) {
            debug('init post');

            app.get('/',function(req,res){
                if(!req.user) {
                    return res.redirect('/login');
                }
                res.render('index',{
                    title: 'app-base',
                    user: req.user,
                    session: req.session,
                    monolithic: (argv.monolithic ? true : false)
                });
            });

            // catch 404 and forward to error handler
            app.use(function(req, res, next) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            });

            // render errors
            app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            });
        }
    });

container.start();
