window.onload = function() {navbarNav.querySelectorAll(".nav-item")[1].classList.add("active");}
var mainFeed = document.querySelector("#main-feed");
var ttFeed = document.querySelector("#tt-feed");
var pagination = document.querySelector(".pagination");
var thumbs = mainFeed.querySelectorAll("[thumb]");
var feedBreadCrumbs = document.querySelector("#feed-bread")
var blog = {
    documents:[],
    currentPage:0,
    totalPages:0,
}
let bread = requestString.split("?v=")[1].split("&")[0]
feedBreadCrumbs.innerHTML=  bread != "undefined"? "&#8658; "+bread : "Feed"
loadFeed(requestString)
.then(answer=>{
  initPagination();
  thumbs.forEach(function(thumb,index){
    if(blog.documents[index] != undefined){
      var path = `${blog.documents[index].topic != "" ? "/artigos/"+blog.documents[index].topic :"/artigos/all" }/${blog.documents[index].path} `
      blog.documents[index].path
      thumb.classList.remove("stand-by");
      thumb.querySelectorAll("[thumb-title]").forEach(el=>{
        el.innerHTML=blog.documents[index].title
        el.href= path});
      thumb.querySelector("[thumb-call]").href=  path;
      thumb.querySelectorAll("[thumb-topic]").forEach(el=>el.innerHTML=blog.documents[index].topic);
      thumb.querySelectorAll("[thumb-date]").forEach(el=>el.innerHTML=blog.documents[index].date);
      thumb.querySelector("[thumb-body]").innerHTML=blog.documents[index].body;
      thumb.querySelector("[thumb-image]").src= blog.documents[index].img[0].xs.location;
      thumb.querySelector("[thumb-image]").srcset= `${blog.documents[index].img[0].xs.location} ${blog.documents[index].img[0].xs.width}w,
                                                    ${blog.documents[index].img[0].sm.location} ${blog.documents[index].img[0].sm.width}w,
                                                    ${blog.documents[index].img[0].md.location} ${blog.documents[index].img[0].md.width}w,
                                                    ${blog.documents[index].img[0].lg.location} ${blog.documents[index].img[0].lg.width}w,
                                                    ${blog.documents[index].img[0].xl.location} ${blog.documents[index].img[0].xl.width}w`;
      thumb.querySelector("[thumb-image]").sizes = "(min-width: 768px) 22vw,(min-width: 1440px)320px, 35vw"
    }else{

      try{ thumb.parentNode.removeChild(thumb);}catch(err){}
    }
   
  });


})
function initPagination(){
  var paginas = blog.totalPages;
  var pagina = blog.currentPage;
  var limit = 4;

  var offset = pagina < limit-1 ? Math.floor(pagina/3) : Number(pagina-(limit/2)) != (paginas-3) ? Number(pagina-(limit/2)) : Number(pagina-3) ; 
  for(var n=0;n<limit;n++){
      if(n < paginas){
          pagination.querySelector(`[index="${n}"]`).classList.remove("disabled")
          pagination.querySelector(`[index="${n}"]`).children[0].innerHTML = Number(offset+n);
          pagination.querySelector(`[index="${n}"]`).children[0].setAttribute("href", "?page="+Number(offset+n));
      } 
  }
  try{pagination.querySelector(`[href="?page=${pagina}"]`).parentElement.classList.add("active")}catch(err){}
  if( pagina > 0){
      var prev = pagination.querySelector(`[command="prev"]`);
      prev.classList.remove("disabled")
      prev.onclick = e=>{
          e.preventDefault();
          var prevtInt = Number(pagina)-1
          window.location.href ="?page="+prevtInt;
      }
  }
  if(pagina < paginas-1){
      var next = pagination.querySelector(`[command="next"]`);
      next.classList.remove("disabled");
      next.onclick = e=>{
          e.preventDefault();
          var nextInt = Number(pagina)+1
          window.location.href ="?page="+nextInt;
      }
      var end = pagination.querySelector(`[command="end"]`);
      end.classList.remove("disabled");
      end.onclick = e=>{
          e.preventDefault();
          window.location.href =`?page=${paginas-1}`;
      }
  }
  if(offset > 1){
      var begin = pagination.querySelector(`[command="begin"]`);
      begin.classList.remove("disabled");
      begin.onclick = e=>{
          e.preventDefault();
          window.location.href ="?page=0";
      }
  }
}
function loadFeed(requestString){
  return new Promise(function(resolve){
    fetch(requestString)
    .then(answer=>answer.json())
    .then(resp=>{
      blog.documents = resp.result;
      blog.currentPage = (resp.offset / resp.limit)
      blog.totalPages = Math.ceil(resp.length/resp.limit);
      resolve(true)
    })
  })

}
