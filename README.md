# weweb
a nodejs webapp framework,is similar to express.

just for people to know how express works,inspired by <nodejs 深入浅出>

[![npm](https://img.shields.io/npm/v/weweb.svg?style=flat-square)](https://www.npmjs.com/package/weweb)
[![npm](https://img.shields.io/npm/dt/weweb.svg?style=flat-square)](https://www.npmjs.com/package/weweb)
[![GitHub stars](https://img.shields.io/badge/github-star-green.svg?style=social)](https://github.com/ejunjsh/weweb)


## install

```bash
npm install weweb --save
```

## example

````javascript
var http = require("http");
var weweb=require("weweb");
var app  =weweb.app;


app.use("/*",weweb.queryString);
app.use("/*",weweb.cookies);
app.use("/*",weweb.session);
app.use("/*",weweb.body);
app.use("/node_modules/weweb/*",weweb.staticFile);
app.get("/",function(req,res){
    res.writeHead(200);
    res.end("hello node.js");
});
app.get("/hello",function(req,res){
    res.writeHead(200);
    res.end("hello node.js");
});

app.get("/hello:hahah",function(req,res){
    res.writeHead(200);
    res.end("hello node.js"+req.params.hahah);
});
app.use("/test*",weweb.render);
app.get("/test2",function(req,res){
    return res.render("view1.html",{user:{name:"jack shao"}});
});

app.get("/test1",function(req,res){
    return res.render("view3.html",{user:{name:"jack shao"}});
});

app.get("/test3",function(req,res){
    return res.render("view4.html",{user:{name:"jack shao"}});
});

http.createServer(app.bind).listen(4090);

console.log("Server has started.Listening on port:4090");
````
