/* cached */
var sidebar = document.querySelector("#sidebar-wrapper"),
sidebarNav = document.querySelector("#sidebar-nav"),
menuButton = document.querySelector("._menu-button"),
contentWrapper = document.querySelector("#page-content-wrapper"),
feed = document.querySelector(".admin-feed"),
showBtns = document.querySelectorAll(".show-btn"),
localModal = document.querySelector("#local-modal");
var imgPreviewModal = document.querySelector("#img-preview-modal");

/* script */
function load(rootColl) { console.log(rootColl);
  fetch("/direct" + rootColl).then(function(e) {return e.json()})
  .then(function(collectionContents) {
      if(collectionContents.status != false){
        collectionContents.result.forEach(function(rootDoc) {
          try {
            var admElement = feed.querySelector("#" + rootDoc.elementId);
            var elementRef = elementsReference[rootDoc.type];
            if(admElement != undefined && elementRef != undefined){
              new Promise(function(resolve){
                if(typeof(rootDoc.resource) == "string" && rootDoc.resource.charAt(0)=="&"){
                  fetch("/direct"+eval('`'+rootDoc.resource.substring(1)+'`'))
                  .then(answer=>answer.json())
                  .then(answer=>{
                      rootDoc.dest = rootColl
                      rootDoc.rsrcDest = rootDoc.resource.substring(1);
                      rootDoc.resource = answer.result == undefined || answer.result.length == 0 ? [] :answer.result ;
                      resolve(rootDoc);
                  }); 
                }else{
                  rootDoc.dest = rootColl;
                  rootDoc.rsrcDest = "!self";
                  resolve(rootDoc)
                }
              })
              .then((rootDoc)=>{
                init(rootDoc,admElement,elementRef); 
              });
            }  
          }catch (e) {throw e}
        })
      }
  })
}

function init(rootDoc,admElement,elementRef){
  console.log(rootDoc)
  var actionPanel = admElement.querySelector(".action-panel")
  var varyBtn = actionPanel.querySelector(".vary-btn");
  var cancelBtn = actionPanel.querySelector(".cancel-btn"); 
  var saveBtn = actionPanel.querySelector(".save-btn"); 
  
  try{admElement.classList.remove("loading-float");}catch(err){}
  /*  */
  var VP = admElement.querySelector(".VP");
  drawInner(rootDoc,admElement,elementRef);
  /* actions */
  varyBtn.onclick = e=>{e.preventDefault();
    var action = varyBtn.getAttribute("action");
    switch(action){
      case "lock":
        VP.classList.toggle("block-float");
        varyBtn.classList.toggle("pd-unlock");
        varyBtn.classList.toggle("pd-lock");
        break;
      case "modal":
        var modalBody = admElement.querySelector("[modal]")  ;
        domodal(localModal,modalBody,[])
        .then(resp=>{
          var newDoc = resp[0]
          newDoc.views = newDoc.views == undefined ? 0 : newDoc.views;
          rootDoc.resource.push(newDoc);
          save(rootDoc,admElement,function(){load(rootDoc.dest)});
        })
      default:
        break;
    }
  
  }
  //.block-float
  cancelBtn.onclick = e=>{e.preventDefault();
    admElement.classList.add("loading-float")
    load(rootDoc.dest)
   } 
   saveBtn.onclick = e=>{e.preventDefault();
    save(rootDoc,admElement,function(){load(rootDoc.dest)});
   } 
}
function drawInner(rootDoc,admElement,elementRef){
  var flow = admElement.querySelector(".flow");
  var thumb = admElement.querySelector("[thumb]");
  var modalBody = admElement.querySelector("[modal]") ;
  
  elementRef.draw(rootDoc,flow,{thumb,localModal,modalBody},function(doc){

    if(doc == undefined){
      save(rootDoc,admElement,function(){load(rootDoc.dest)});
    }else{
      deleteDoc(doc, rootDoc.rsrcDest).then(async (answer) => {
        load(rootDoc.dest);
        alert("Deletado com sucesso!")
      
      })
    }
    
  });
}

/* events */
menuButton.onclick = function(e) {
  e.preventDefault(), sidebar.classList.toggle("retract")
};
showBtns.forEach((btn)=>{
    btn.onclick = (e)=>{
      console.log("toggling")
      var inner = e.currentTarget.parentElement.parentElement.nextSibling; 
      inner.classList.toggle("hide")   
    }
})
