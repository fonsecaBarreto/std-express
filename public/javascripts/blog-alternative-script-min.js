"use strict";window.onload=function(){document.querySelector("body").classList.remove("loading"),newResize(),recommendfeed()};var blogConfig={total:0},recommend=document.querySelector(".recommend");function recommendfeed(){console.log("feed");var e=Math.floor(Math.random()*Number(blogConfig.total-4));e=e<0?e-=e:e,fetch("/nuntium-petitio?sort=views&limit=4&offset=".concat(e)).then(function(e){return e.json()}).then(function(t){console.log(t);var e=[].slice.call(recommend.querySelector(".row").querySelectorAll(".recommend-prov"));e.sort(function(){return Math.random()-.5}),e.reverse(),e.forEach(function(e,o){if(null!=t.result[o])try{var r=document.createElement("div");r.innerHTML='\n                <div class="ma-img-PV relative">\n                 <img class="ma-img" src="" alt="">       \n                 </div> \n                 <a class="ma-call mt-1" href="www.google.com.br"></a>',r.querySelector(".ma-img").src=t.result[o].img[0].md.location,r.querySelector(".ma-call").innerHTML=t.result[o].title,r.querySelector(".ma-call").setAttribute("href","/blog/"+t.result[o].param),e.parentNode.appendChild(r),e.parentNode.removeChild(e)}catch(e){}})})}console.log("what now?");