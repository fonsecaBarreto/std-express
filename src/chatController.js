const mongoClient = require("mongodb").MongoClient;
/* admin */
var admin = null;
function getAdmin(){
  return admin;
}
/*  */
var collection = db.collection("chats");
function login(id){admin = id};
async function uploadMsg(message,id){
  try{
  
    var status =  await collection.updateOne({id},{ $push: {msgs:{$each:[message]}} });
    if(status.modifiedCount > 0){
      return true;
    }
    return false;
    
    
  }catch(err){ return false}
}
function initChat(newClient,id,ip){
  console.log("initing a new chat");
  return new Promise(function(resolve){
    try{
      newClient.id = id,newClient.ip = ip,newClient.msgs = [],newClient.online=true;
      collection.insertOne(newClient,(err,result)=>{
        if(err)throw err;
        if(result.insertedCount == 1){
          console.log('sucesso');
          resolve(true)
        };
        resolve(false)
      });
    
    }catch(err){ resolve(false)}
  })
  
}

 function deleteChat(ClientId){
  return new Promise(async(resolve,reject)=>{
    var result = await collection.findOneAndDelete({id:ClientId});
    if(result.value != null){
      resolve(true);
    }
    resolve(false);
  })
}
function disconnect(id){
  return new Promise(async function(resolve,reject){
    try{
      var status =  await collection.updateOne({id},{ $set: {online:false} });
      if(status.modifiedCount > 0){
        resolve(true);
      }
    }catch(err){throw err}
    reject(false);
  })
  
}

module.exports ={initChat,login,getAdmin,uploadMsg,deleteChat,disconnect}