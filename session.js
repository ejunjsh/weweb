var sessions = {};
var key = 'session_id';
var EXPIRES = 20 * 60 * 1000;

// setInterval(function(){
     
// },EXPIRES);

var serialize = function (name, val, opt) {
    var pair = [name + '=' + val];
    opt = opt || {};

    if (opt.maxAge) pair.push('Max-Age=' + opt.maxAge);
    if (opt.domain) pair.push('Domain=' + opt.domain);
    if (opt.path) pair.push('Path=' + opt.path);
    if (opt.expires) pair.push('Expires=' + opt.expires);
    if (opt.httpOnly) pair.push('HttpOnly');
    if (opt.secure) pair.push('secure');

    return pair.join('; ');
};

var hack = function (req, res) {
    var writeHead = res.writeHead;
    res.writeHead = function () {
        var cookies = res.getHeader('Set-Cookie');
        var session = serialize(key, req.session.id);
        if (cookies) {
            cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session];
        }
        else {
            cookies = session;
        }
        res.setHeader('Set-Cookie', cookies);
        return writeHead.apply(this, arguments);
    };
};

var generate = function () {
    var session = {};
    session.id = (new Date()).getTime() + Math.random();
    session.cookie = { expire: (new Date()).getTime() + EXPIRES };
    sessions[session.id] = session;
    return session;
};

module.exports = function (req, res, next) {
    var id = req.cookies[key];
    if (!id) {
        req.session = generate();
        hack(req, res);
    }
    else {
        var session = sessions[id];
        if (session) {
            if (session.cookie.expire > (new Date()).getTime()) {
                session.cookie.expire = (new Date()).getTime() + EXPIRES;
                req.session = session;
            }
            else {
                delete sessions[id];
                req.session = generate();
                hack(req, res);
            }
        }
        else {
            req.session = generate();
            hack(req, res);
        }
    }

    next();
};