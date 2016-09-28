var hasBody=function(req)
{
   return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
};

var mime=function(req)
{
   var str=req.headers['content-type'] || '';
   return str.split(';')[0];
};

var formidable=require('formidable');


module.exports=function(req,res,next)
{
    if(hasBody(req))
    {
       if(mime(req)==='multipart/form-data')
       {
           var form=new formidable.IncomingForm();
           form.parse(req,function(err,fields,files){
               if(err)
               {
                   return next(err);
               }
               req.body=fields;
               req.files=files;
               next();
           });
       }
       else if(mime(req)==='application/json')
       {
          try{
              req.body=JSON.parse(req.rawBody);
          }
          catch(err)
          {
              return next(err);
          }
       }
       else if(mime(req)==='application/xml')
       {
          try{
              var xml2js=require('xml2js');
              xml2js.parseString(req.rawBody,function(err,xml){
                  if(err)
                  {
                      return next(err);
                  }
                  req.body=xml;
                  next();
              });
          }
          catch(err)
          {
              return next(err);
          }
       }
    }
    else{
        next();
    }
};