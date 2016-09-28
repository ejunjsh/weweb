var http = require("http");
var app  =require("./app.js");


app.use("/*",require("./queryString.js"));
app.use("/*",require("./cookies.js"));
app.use("/*",require("./session.js"));
app.use("/*",require("./body.js"));
app.use("/static/*",require("./staticFile.js"));
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
app.use("/test*",require("./render.js"));
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