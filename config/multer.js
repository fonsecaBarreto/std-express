const multer = require("multer"),
      path = require("path"),
      crypto = require('crypto'),
      multerS3 = require('multer-s3'),
      aws = require('aws-sdk');

const storageTypes = {
  local:multer.diskStorage({
    destination:(req,file,cb)=>{
      console.log(file.buffer)
      cb(null,path.resolve(__dirname, '..','temp','uploads'));
    },
    filename:(req,file,cb)=>{
      crypto.randomBytes(16,(err,hash)=>{
        if(err)cb(err);
        var filename = file.originalname.normalize('NFD');
        filename.replace(/[\u0300-\u036f]/g,'') // Remove acentos
        .replace(/(\s+)/g, '-') // Substitui espaços por hífen
        .replace(/\-\-+/g, '-')	// Substitui multiplos hífens por um único hífen
        .replace(/(^-+|-+$)/, '').toLowerCase();
        filename = `${Date.now()}_${filename}`;
        file.key = (`${hash.toString('hex')}-${filename}`);
        /*  */
        cb(null,file.key);
      })
    }

  }),
  s3:multerS3({
    s3: new aws.S3(),
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl:'public-read',
    key: (req,file,cb)=>{
      crypto.randomBytes(16,(err,hash)=>{
        if(err)cb(err);
        const fileName = `temp/${hash.toString('hex')}-${file.originalname}`;
        cb(null,fileName);
      });
    }

  })
  
};



module.exports = {
   dest: path.resolve(__dirname, '..','temp','uploads'),
    storage: storageTypes[process.env.STORAGE_TYPE],
    limits:{
      fileSize:2 * (2024*2024)
    },
    fileFilter:(req,file,cb)=>{
      const allowedMimes = [
        'image/jpeg',
        'image/pjpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ]
      if(allowedMimes.includes(file.mimetype)){
        cb(null,true);
      }else{
        cb(new Error("formato de imagem invalido"));
      }
    }

}

