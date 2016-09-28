var fs = require('fs');
var mime = require('mime');
var path = require('path');
var files = {};
VIEW_FOLDER = path.dirname(require.main.filename);
var cache = {};
var preCompile = function (str) {
    var replaced = str.replace(/<%\s*(include.*)\s*%>/g, function (match, code) {
        var partial = code.split(/\s+/)[1];
        if (!files[partial]) {
            files[partial] = fs.readFileSync(path.join(VIEW_FOLDER, partial), "utf8");
        }
        return files[partial];
    });

    if (str.match(/<%\s*(include.*)\s*%>/)) {
        return preCompile(replaced);
    }
    else {
        return replaced;
    }
};

var compile = function (str) {
    str = preCompile(str);
    var tpl = str.replace(/\n/g, '').replace(/\\/g,"\\\\").replace(/\'/g, '\\\'')
    .replace(/<%=([\s\S]+?)%>/g, function (match, code) {
            return "'+ escape(" + code + ") +'";
        })
        .replace(/<%-([\s\S]+?)%>/g, function (match, code) {
            return "'+" + code + "+'";
        })
        .replace(/<%([\s\S]+?)%>/g, function (match, code) {
            return "';\n" + code + "\ntpl += '";
        }).replace(/\'\n/g, '\'')
        .replace(/\n\'/gm, '\'');

    tpl = "tpl='" + tpl + "';";
    tpl = tpl.replace(/''/g, '\'\\n\'');
    tpl = tpl.replace(/\r/g, '');
    tpl = 'var tpl = "";\nwith (obj || {}) {\n' + tpl + '\n}\nreturn tpl;';
    console.log(tpl);
    return new Function('obj', 'escape', tpl);

};

var escape = function (html) {
    return String(html)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#309;')
};



var preLayout = function (layout) {
    layout.file.replace(/<%\+([\s\S]+?)%>([\s\S]+?)<\/%\+>/g, function (match, code1, code2) {
        code1=code1.trim();
        if (code1 in layout.map) {
            
        }
        else{
            layout.map[code1] = code2;
        }
    });
    if (layout.file.match(/<%\s*(layout.*)\s*%>/)) {
        layout.file.replace(/<%\s*(layout.*)\s*%>/g, function (match, code) {
            var partial = code.split(/\s+/)[1];
            if (!files[partial]) {
                files[partial] = fs.readFileSync(path.join(VIEW_FOLDER, partial), "utf8");
            }
            layout.file = files[partial];
        });

        return preLayout(layout);
    }

    return layout;
};

var renderLayout = function (text) {
    var layout = { file:text,map:{} };
    layout=preLayout(layout);
    var str=layout.file;
    for(var att in layout.map)
    {
         str = str.replace(new RegExp("<%\\+\\s*" + att + "\\s*%>","g"), function (match, code) {
            return layout.map[att];
        });
    }

    //remove no need layout tag
    str=str.replace(/<%\+.*%>/g,'');

    return str;
};

module.exports = function (req, res, next) {

    res.sendFile = function (filepath) {
        fs.stat(filepath, function (err, stat) {
            if (err) {
                return next(err);
            }
            var stream = fs.createReadStream(filepath);
            res.setHeader('Content-Type', mime.lookup(filepath));
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filepath) + '"');
            res.writeHead(200);
            stream.pipe(res);
        });
    };

    res.json = function (json) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(json));
    };

    res.redirect = function (url) {
        res.setHeader('Location', url);
        res.writeHead(302);
        res.end('Redirect to ' + url);
    };

    res.render = function (viewname, data) {
        if (!cache[viewname]) {
            var text;
            try {
                text = fs.readFileSync(path.join(VIEW_FOLDER, viewname), "utf8");
                if (text.match(/<%\s*(layout.*)\s*%>/)) {
                   text=renderLayout(text);
                }
            }
            catch (err) {
                return next(err)
            }
            cache[viewname] = compile(text);
        }
        var compiled = cache[viewname];
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var html = compiled(data, escape);
        res.end(html);
    };

    next();
};