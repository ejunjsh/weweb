var fs=require("fs");
var path=require("path");
var url=require("url");

ROOT=path.dirname(require.main.filename);

module.exports=function(req,res,next)
{
    var pathname=url.parse(req.url).pathname;

    fs.readFile(path.join(ROOT,pathname),function(err,file){
        if(err)
        {
            next();
        }
        //res.setHeader("Cache-Control","max-age="+60*60*1000);
        res.writeHead(200);
        res.end(file);
    });
};