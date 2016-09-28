var pathRegexp = function (path) {
    var keys = [];

    path = path
        //.concat(strict ? '' : '/?')
        .concat('/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function (_, slash, format, key, capture,
            optional, star) {
            keys.push(key);
            slash = slash || '';
            return ''
                + (optional ? '' : slash)
                + '(?:'
                + (optional ? slash : '')
                + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
                + (optional || '')
                + (star ? '(/*)?' : '');
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.*)');
    return {
        keys: keys,
        regexp: new RegExp('^' + path + '$')
    };
}

var routes = { 'all': [] };
var app = {};
app.use = function (path) {
    var handle;
    if (typeof path === 'string') {
        handle = {
            path: pathRegexp(path),
            stack: Array.prototype.slice.call(arguments, 1)
        };
    }
    else {
        handle = {
            path: pathRegexp('/'),
            stack: Array.prototype.slice.call(arguments, 0)
        };
    }
    routes.all.push(handle);
};

['get', 'put', 'delete', 'post'].forEach(function (method) {
    routes[method] = [];
    app[method] = function (path) {
        var handle = {
            path: pathRegexp(path),
            stack: Array.prototype.slice.call(arguments, 1)
        };
        routes[method].push(handle);
    }
});

var match = function (pathname, routes, req) {
    var stacks = [];
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        var reg = route.path.regexp;
        var matched = reg.exec(pathname);
        if (matched) {
            var params = {};
            var keys=route.path.keys;
            for (var j = 0, l = keys.length; j < l; j++) {
                var value = matched[j + 1];
                if (value) {
                    params[keys[j]] = value;
                }
            }

            req.params = params;
            stacks = stacks.concat(route.stack);
        }
    }
    return stacks;
};

var handler = function (req, res, stacks) {
    var next = function (err) {
        if (err) {
            return handler500(err, req, res, stacks);
        }

        var middleware = stacks.shift();
        if (middleware) {
            try {
                middleware(req, res, next);
            }
            catch (err) {
                next(err);
            }
        }
    };

    next();
};

var handler500 = function (err, req, res, stacks) {
    stacks = stacks.filter(function (middleware) {
        return middleware.length === 4;
    });
    if(stacks.length===0)
    {
        res.writeHead(500);
        res.write("<h1>server error:500</h1>");
        res.write(err.message);
        res.end(err.stack);
        return;
    }
    var next = function () {
        var middleware = stacks.shift();
        if (middleware) {
            middleware(err, req, res, next);
        }
    };
    next();
};

var handler404 = function (req, res) {
    res.writeHead(404);
    res.end("Page not found:404");
};

var url = require("url");

app.bind = function (req, res) {
    var pathname = url.parse(req.url).pathname;
    var method = req.method.toLowerCase();
    var stacks = match(pathname, routes.all,req);
    if (routes.hasOwnProperty(method)) {
        stacks=stacks.concat(match(pathname, routes[method],req));
    }
    
    if (stacks.length) {
        handler(req, res, stacks);
    }
    else {
        handler404(req, res);
    }
    
};

module.exports = app;
