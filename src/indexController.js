
async function find(collection,filter ={},offset=0,limit=0,sort = { amount: -1 }){
    var response = {filter,offset,limit,total:0,length:0,result:[]};
    response.total = await collection.countDocuments(); //total
    response.length = await collection.countDocuments(filter);
    if(response.length >0){ response.result = await collection.find(filter).sort(sort).limit(limit).skip(offset).toArray();}
    else{response = {status:false,info:"not found"}}
    return  response ;
}
async function upsert(collection,value,params={}){
    if(Object.keys(params).length > 0){
        var status =  await collection.updateOne(params,{$set:value},{ upsert: true });
    }else{
        var status = await collection.insertOne(value);
    }
    return (status.upsertedCount > 0 || status.modifiedCount > 0 || status.insertedCount > 0) ?true:false;
 
}
module.exports = {find,upsert}



