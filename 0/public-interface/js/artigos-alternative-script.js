//window.onload = function() {navbarNav.querySelectorAll(".nav-item")[1].classList.add("active");}
var reFeed = document.querySelector("#re-feed");



loadReFeed(topic)
.then(docs=>{

})
function loadReFeed(topico){
  console.log(topico)
  return new Promise(function(resolve){
    console.log("loading")
    fetch(`/direct/artigos-posts/topic?v=${topico}&sort=views&limit=4`)
    .then(answer=>answer.json())
    .then(answer=>{

      reFeed.querySelectorAll("[thumb]").forEach((thumb,index)=>{

        var doc = answer.result[index];
        if(doc != undefined){
          console.log(doc)
          thumb.querySelector("[thumb-call]").innerHTML = doc.title;
          thumb.querySelector("[thumb-call]").href = doc.path;
          thumb.querySelector("[thumb-image]").src = doc.img[0].xs.location;
          thumb.querySelectorAll(".stand-by").forEach((el)=>el.classList.remove("stand-by"));

        }
      })
    })



  })
 
}