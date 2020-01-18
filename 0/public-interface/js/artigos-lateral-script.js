var maFeed = document.querySelector("#ma-feed");
var maThumbs = maFeed.querySelectorAll('[thumb]')
console.log(maFeed)

loadMaFeed()

function loadMaFeed(){
  return new Promise(function(resolve){
    fetch("/direct/artigos-posts?sort=views&limit=4")
    .then(answer=>answer.json())
    .then(resp=>{
     maThumbs.forEach(function(thumb, index){
       var doc  = resp.result[index]
        if(doc != undefined){
          try{
            var path = `${doc.topic != "" ? "/artigos/"+doc.topic :"/artigos/all" }/${doc.path} `;
            thumb.querySelector("[thumb-call]").innerHTML= doc.title;
            thumb.querySelector("[thumb-call]").href= path;
            thumb.querySelector('[thumb-image]').src=doc.img[0].xs.location;
            thumb.querySelector("[thumb-image]").srcset= `${doc.img[0].xs.location} ${doc.img[0].xs.width}w,
                                                    ${doc.img[0].sm.location} ${doc.img[0].sm.width}w,
                                                    ${doc.img[0].md.location} ${doc.img[0].md.width}w,
                                                    ${doc.img[0].lg.location} ${doc.img[0].lg.width}w,
                                                    ${doc.img[0].xl.location} ${doc.img[0].xl.width}w`;
          thumb.querySelector("[thumb-image]").sizes = "(max-width: 768px) 164px, (max-width: 992px) 190px,(max-width: 1199px)264px, 322px"
            thumb.querySelector('[thumb-bg]').style.backgroundImage =  ` url(${doc.img[0].xs.location})`;






            try{
              thumb.querySelectorAll(".stand-by").forEach(function(el){
                el.classList.remove("stand-by");
              })
            }catch(err){}
              
          }catch(err){throw err}
        }else{try{ thumb.parentNode.removeChild(thumb);}catch(err){}}
      }) 
      
    })
  })
 
}