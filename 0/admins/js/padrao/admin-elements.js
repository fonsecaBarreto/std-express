"use strict";

function postImage(file,size){
  var width = isNaN(size) ? 320 : size;
  return new Promise(function(resolve,reject){
    var stringRequest = "/uploadImage?s="+size;
    if(file != undefined){
      try{
          var formData = new FormData();
          formData.append('file',file)
          ajaxUpload({
              method:"post",
              url:stringRequest,
              formData: formData,
              success:function(){}
          });
      }catch(err){alert("nao foi possivel salvar a imagem");resolve(undefined)}
      function ajaxUpload(config){
          const xhr = new XMLHttpRequest();
          xhr.open("post",config.url,true);
          xhr.send(config.formData);
          xhr.onreadystatechange = function() {
              if (xhr.readyState == 4 && xhr.status == 200){
                  var resp = JSON.parse(xhr.responseText);
                  resolve(resp)
              }
          }
      }
    }else{resolve(undefined)}
  })
}

function deleteDoc(e, n) {
  return new Promise(function(t) {
      try {
          null != e._id && fetch("/direct" + n + "/_" + e._id, {
              method: "DELETE",
              headers: {
                  "Content-type": "application/json"
              },
              body: JSON.stringify(e)
          }).then(function(e) {
              return e.json()
          }).then(function(e) {
              t(e)
          })
      } catch (e) {
          t(!1)
      }
  })
}
function isImg(imgArray, config) {

  return new Promise(async function (resolve) {
    if (imgArray.length > 0) {
      await Promise.all(imgArray.map(async (img, index) => {
        await new Promise(async s => {
          if (typeof (img) == 'object') {
            if (img.lg == undefined && img.size != undefined) { //<-------------------
              try {
                var size = JSON.parse(config)[0]
                var imglocation = await postImage(img, size)
                imgArray[index] = imglocation == undefined || imglocation == false ? {} : imglocation;
              } catch (err) {
                imgArray[index] = {};
              }
            }
          }
          s();
        });
      }));
    
      resolve(true)
    } else { resolve(true) }
  })
}
function save(rootDoc, admElement, cb) {
  console.log("saving now!",rootDoc)
  admElement.querySelector(".inner").classList.add("saving-float")
  return new Promise(async function (sucess) { //---------------------------------------------------------  POST image
    if (rootDoc.resource.length > 0) {
      Promise.all(rootDoc.resource.map(async (doc, index) => {
        await new Promise(async (re) => {
          try{
          if (typeof(doc) === 'object' && Object.keys(doc).length > 0) {
            await Promise.all(Object.keys(doc).map(async (att) => {
             
              if (att == "img") {
                var imgConfig = 720;
                try { imgConfig = rootDoc.config.img != undefined ? rootDoc.config.img : doc.config.img } catch (err) { }
                await isImg(doc[att], imgConfig)
                re();
              } else { }
            }));
            re(); 
          }
        }catch(err){re()}

        
        })
      }))
        .then(() => {
        
          sucess(true)
        })
    }else{
      sucess(false)
    }
    
  }).then((answer) => {
    console.log(answer,"resolved")
    if (answer == true) {
      new Promise(async function (done) {
        if (rootDoc.rsrcDest == "!self") { //------------------------------------------------------  POST doc on self 
          var request = rootDoc.dest;
          var doc = rootDoc;
          fetch("/direct" + request, { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(doc) })
            .then(response => response.json())
            .then(data => {
              done(data);
            })
        } else {  //-------------------------------------------------------------------------------  POST doc on extern coll
          var request = rootDoc.rsrcDest;
          var docs = rootDoc.resource;
          await Promise.all(docs.map((doc) => {
        
            fetch("/direct" + request, { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(doc) })
              .then(response => response.json())
              .then(data => {
                done(data);
              })
          }))
        }
      }).then(answer => {
        alert("SALVO COM SUCESSO")
        admElement.querySelector(".inner").classList.remove("saving-float");
        try{fetch("/update")}catch(err){}
        cb();
      })
    }else{
      console.log("::::DELETING???")
      alert("REMOVIDO COM SUCESSO")
      admElement.querySelector(".inner").classList.remove("saving-float");
      try{fetch("/update")}catch(err){}
      cb();
    }
  })
}

function domodal(modal,mContent,docs=[]){
  return new Promise(function(resolve){
    var modalBody = modal.querySelector(".modal-body");
    modalBody.innerHTML = mContent.innerHTML;
    drawForm(docs,modalBody.querySelector(".flow"));
    $(modal).modal();
    var deleteBtn = modal.querySelector(".btn-delete");
    var saveBtn = modal.querySelector(".btn-primary");

    deleteBtn.onclick =  e=>{ e.preventDefault();
      resolve([docs[0],false]);
      $(modal).modal("hide"); 
    }
    saveBtn.onclick =  e=>{ e.preventDefault();
      resolve([docs[0],true]);
      $(modal).modal("hide"); 
    } 
  });  
}
function doFeedModal(modal,mContent,docs){
  return new Promise(function(resolve){
    $(modal).modal();
    var modalBody = modal.querySelector(".modal-body");
    modalBody.innerHTML = mContent.innerHTML;

     docs.forEach(function (doc) {
      var thumb = document.createElement("div"); thumb.classList = thumbBody.getAttribute("thumb");
      thumb.innerHTML = thumbBody.innerHTML;
      flow.appendChild(thumb);
   
      try{thumb.querySelector(".ft-img-VP img").src = doc.img[0].xs.location;}catch(err){}
      thumb.querySelector(".ft-title").innerHTML = doc.title;
      thumb.querySelector(".ft-views").innerHTML = doc.views == undefined ? "Indefindo" : doc.views;
      thumb.querySelector(".ft-date").innerHTML = doc.date == undefined || doc.date == "" ? "Indefindo" : doc.date;
      var editBtn = thumb.querySelector('.ft-edit');
      editBtn.onclick = () => {
        domodal(aux.localModal, aux.modalBody, [doc])
          .then( resp=> {
            if(resp[1]){cb();}
            else{cb(resp[0]);}
          }) 
      }
    });

  });
}
/*  */
function drawForm(docs, flow) {

  flow.querySelectorAll("form").forEach((form, index) => {
   form.querySelectorAll("[name]").forEach(function (input) {
    docs[index] = docs[index] != undefined ? docs[index] : {}
      if(input.getAttribute("contenteditable") != null){
        handleHTMLEditor(form,input,docs[index]) /* html EDITOR */
      }else{
        if(input.getAttribute("type") == "file"){
          handleImageInput(form,input,docs[index]); /* image */
        }else{
          
          handleGeneralInput(form,input,docs[index]) /* general input */
        }
      }
    });
  });

}
function handleGeneralInput(form,input,doc){
    doc[input.name] = doc[input.name] != undefined ? doc[input.name] : "";
    try {input.value = doc[input.name]; } catch (err) { } 
    input.onchange = e => {e.preventDefault();  
      var normalize = input.getAttribute("normalize");
      if (normalize == null) { var value = input.value;
      }else {
        if (normalize == "!self") {value = input.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([^\w]+|\s+)/g, '-').replace(/\-\-+/g, '-').replace(/(^-+|-+$)/, '').toLowerCase();
        }else {value = input.value;doc[normalize] = input.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/([^\w]+|\s+)/g, '-').replace(/\-\-+/g, '-').replace(/(^-+|-+$)/, '').toLowerCase();
      }}
      doc[input.name] = value;
      if (input.value.length == 0) { input.classList.add("input-alert"); return; }
      try { input.classList.remove('input-alert') } catch (err) { }
    }
} 
function handleHTMLEditor(form,input,doc){
  var name = input.getAttribute('name');
  doc[name] = doc[name] != undefined ? doc[name] : ""; // init if dont
  try {input.innerHTML = doc[name] != undefined ? doc[name] : ""; } catch (err) { } //fill

   $(form).on('DOMSubtreeModified', input, function () {
     doc[name] = input.innerHTML;
     
  });
  
 $($(input).prev().find('a')).click(function (e) {
  
    switch ($(this).data('role')) {
      case 'h1':
      case 'h2':
      case 'p':
        document.execCommand('formatBlock', false, $(this).data('role'));
        doc[name] = input.innerHTML;
        break;
      default:
        document.execCommand($(this).data('role'), false, null);
        doc[name] = input.innerHTML;
        break;
    } 
  });

}
function handleImageInput(form,input,doc){
  var name = input.getAttribute("name");
  var preview = input.previousSibling.querySelector(".img-preview");
  doc.img = doc.img != undefined ? doc.img: []; // se nao existir fazelo um array
  try{preview != undefined ?preview.src = doc.img[name].xs.location: null;}catch(ee){}
  input.onchange = e => {
    e.preventDefault();
    var reader = new FileReader();
    reader.onload = function (e) {
        preview.src=e.target.result
        doc.img[name]= input.files[0];
    }
    reader.readAsDataURL(input.files[0]);
  }
  if(doc.img[name] != undefined){
    preview.onclick = ()=>{
        try{
          imgPreviewModal.querySelector('.modal-body').querySelector("img").src=doc.img[name].xs.location;
          imgPreviewModal.querySelector('.modal-body').querySelector("img").srcset= `
          ${doc.img[name].xs.location} ${doc.img[name].xs.width}w,
          ${doc.img[name].sm.location} ${doc.img[name].sm.width}w,
          ${doc.img[name].md.location} ${doc.img[name].md.width}w,
          ${doc.img[name].lg.location} ${doc.img[name].lg.width}w,
          ${doc.img[name].xl.location} ${doc.img[name].xl.width}w` ;
          imgPreviewModal.querySelector('.modal-body').querySelector("img").sizes="(max-width: 960px)50vw, 100vw";
          $(imgPreviewModal).modal("show")
        }catch(err){console.log('nenhuma imagem selecionada');}
    }
  }  
}
/*  */
var swap = {
  seeking: [false,null],
  current: null
}
var elementsReference = {
  "selection": {
    drawingStyle: "dynamic",
    draw: function (rootDoc,flow,aux,cb) {
      var docs = rootDoc.resource == undefined ? [] :rootDoc.resource;
      flow.innerHTML = "";
      var thumbs = ([0,1,2,3,4,5]).map(function(index){
        var thumb = document.createElement("div");
        thumb.classList = aux.thumb.getAttribute("thumb");
        thumb.innerHTML = aux.thumb.innerHTML;
        thumb.setAttribute('indice',index);
        return thumb;
      })
      thumbs.forEach(function(thumb,index){
        flow.appendChild(thumb);
        if(docs[index] != undefined && docs[index].from != undefined){ 
          fetch("/direct"+docs[index].from+"/_id?v="+docs[index]._id)
          .then(answer=>answer.json())
          .then(answer=>{
            try{
              var doc = answer.result[0];
              try{thumb.querySelector('[ord_img]').src = doc.img[0].xs.location;}catch(err){}
              try{thumb.querySelector('[ord_title]').innerHTML = doc.title}catch(err){}
            }catch(err){}
          }) 
        }
        thumb.onclick = function(e){
        
         if(swap.current != null){
            docs[this.getAttribute("indice")]=swap.current;
            rootDoc.resource = docs;
            swap.current.selected.click()
            thumb.classList.add("bd-warning");
            if(docs[index] != undefined && docs[index].from != undefined){ 
              fetch("/direct"+docs[index].from+"/_id?v="+docs[index]._id)
              .then(answer=>answer.json())
              .then(answer=>{
                var doc = answer.result[0];
                try{thumb.querySelector('[ord_img]').src = doc.img[0].xs.location;}catch(err){}
                try{thumb.querySelector('[ord_title]').innerHTML = doc.title}catch(err){}
              }) 
            }
            //elementsReference.selection.draw(rootDoc,flow,aux,cb)
          } 
     
        }
      })
      
        
   

        
  

   
    },
    onEdit: function (rootDoc, thumbRoot, thumbInner, modalBody, localModal, cb) { cb(); }
  },
  "info": {
    drawingStyle: "static",
    draw: function (rootDoc,flow,aux,cb) {
      console.log("drawning info");
      var totalVisits  = flow.querySelector("#sttcs-v"),totalhours=flow.querySelector("#sttcs-h"),totalavarage = flow.querySelector("#sttcs-tv ")
      var totalVisitsM  = flow.querySelector("#sttcs-vM"),totalhoursM=flow.querySelector("#sttcs-hM"),totalavarageM = flow.querySelector("#sttcs-tvM");
      var totalVisitsW  = flow.querySelector("#sttcs-vW"),totalhoursW=flow.querySelector("#sttcs-hW"),totalavarageW = flow.querySelector("#sttcs-tvW");
      var totalVisitsD  = flow.querySelector("#sttcs-vD"),totalhoursD=flow.querySelector("#sttcs-hD"),totalavarageD = flow.querySelector("#sttcs-tvD");
      if(typeof(rootDoc.resource) == "string" && rootDoc.resource.charAt(0)=="!"){
        fetch(`/statistics/${href}`)
        .then(answer=>answer.json())
        .then(resp=>{

          console.log(resp)
          totalVisits.innerHTML = resp.total.visits;
          totalhours.innerHTML  = new Date(Number(resp.total.time)).toISOString().slice(11, -5)
          totalavarage.innerHTML  =  new Date(Number(resp.total.averageTimePerVisit)).toISOString().slice(11, -5)
          totalVisitsM.innerHTML = resp.mouth.visits;
          totalhoursM.innerHTML  = new Date(Number(resp.mouth.time)).toISOString().slice(11, -5)
          totalavarageM.innerHTML  =  new Date(Number(resp.mouth.averageTimePerVisit)).toISOString().slice(11, -5)
          totalVisitsW.innerHTML = resp.week.visits;
          totalhoursW.innerHTML  = new Date(Number(resp.week.time)).toISOString().slice(11, -5)
          totalavarageW.innerHTML  =  new Date(Number(resp.week.averageTimePerVisit)).toISOString().slice(11, -5)
          totalVisitsD.innerHTML = resp.day.visits;
          totalhoursD.innerHTML  = new Date(Number(resp.day.time)).toISOString().slice(11, -5)
          totalavarageD.innerHTML  =  new Date(Number(resp.day.averageTimePerVisit)).toISOString().slice(11, -5)
         /*  sttcs-v
          sttcs-h
          sttcs-tv */
        })

      }
      
    },
    onEdit: function (rootDoc, thumbRoot, thumbInner, modalBody, localModal, cb) { cb(); }
  },

  "form": {
    drawingStyle: "static",
    draw: function (rootDoc,flow,aux,cb) {
      var docs = rootDoc.resource;
      drawForm(docs, flow)
    },
    onEdit: function (rootDoc, thumbRoot, thumbInner, modalBody, localModal, cb) { cb(); }
  },
  "feed": {
    drawingStyle: "dynamic",
    draw: function (rootDoc,flow,aux, cb) {
      var thumbBody = aux.thumb;
      flow.innerHTML = "";
      var docs = rootDoc.resource;

      if (docs.length > 0) {
        docs.forEach(function (doc) {
          var thumb = document.createElement("div"); thumb.classList = thumbBody.getAttribute("thumb");
          thumb.innerHTML = thumbBody.innerHTML;
          flow.appendChild(thumb);
          
          try{thumb.querySelector(".ft-img-VP img").src = doc.img[0].xs.location;}catch(err){}
          thumb.querySelector(".ft-title").innerHTML = doc.title;
          thumb.querySelector(".ft-views").innerHTML = doc.views == undefined ? "Indefindo" : doc.views;
          thumb.querySelector(".ft-date").innerHTML = doc.date == undefined || doc.date == "" ? "Indefindo" : doc.date;
          var editBtn = thumb.querySelector('.ft-edit');
          editBtn.onclick = () => {
            domodal(aux.localModal, aux.modalBody, [doc])
              .then( resp=> {
                if(resp[1]){cb();}
                else{cb(resp[0]);}
              }) 
          }
          /*  */
          //var selectButton = thumb.querySelector(".select-btn");
          thumb.onclick = (e)=>{
            var selected = flow.querySelector('[selected='+rootDoc.elementId+']');
            if(selected != undefined){ selected.removeAttribute("selected");}
            if(selected != thumb){ thumb.setAttribute("selected",rootDoc.elementId);}
            swap.current = (swap.current != null && swap.current._id == doc._id) ? null :{_id: doc._id, from: rootDoc.rsrcDest, selected:thumb};
          }


        })
      }
    },
    onEdit: function (rootDoc, thumbRoot, thumbInner, modalBody, localModal, cb) {
      domodal(localModal, modalBody, [], thumbRoot)
        .then(newDocument => {
          newDocument.views = newDocument.views == undefined ? 0 : newDocument.views;
          thumbRoot.classList.add("loading-float")
          rootDoc.resource.push(newDocument);
          cb();
        })
    },
  }
}

