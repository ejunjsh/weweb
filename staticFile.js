var fs=require("fs");
var path=require("path");
var url=require("url");


module.exports=function(req,res,next)
{
    var pathname=url.parse(req.url).pathname;

    fs.readFile(path.join(this.ROOT,pathname),function(err,file){
        if(err)
        {
            next(err);
        }
        //res.setHeader("Cache-Control","max-age="+60*60*1000);
        res.writeHead(200);
        res.end(file);
    });
};