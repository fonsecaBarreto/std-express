"use strict";
var currentClient = null,
    clients = {},
    config = {
        atendente: "",
        saudacaoOnline: "",
        saudacaoOffline: ""
    },
    tbscontents = document.querySelector(".chat-contents").querySelectorAll(".c_tab_content");
//fuck this shiiiit
function chat() {
    var n = io();
    n.on("connect", function() {
        console.log("  > connected"), n.emit("admin login"), loadChat().then(function(e) {
            clients = e, chatting(n)
        })
    })
}

function loadChat() {
    return fetch("/chatClients").then(function(e) {
        return e.json()
    }).then(function(e) {
        var n = {};
        try {
            null == e.status && 0 < e.result.length && e.result.forEach(function(e) {
                n[e.id] = e
            })
        } catch (e) {
            throw e
        }
        return n
    })
}

function chatting(t) {
    drawClients(t), t.on("update", function() {
        console.log("updating"), loadChat(t.id).then(function(e) {
            clients = e, drawClients(t)
        })
    }), t.on("chat message", function(e) {
        var n = JSON.parse(e),
            t = n.client;
        clients[t].msgs.push(n), currentClient == t && drawchat(clients[t])
    }), $("form").submit(function(e) {
        if (e.preventDefault(), null != currentClient) {
            var n = {
                client: currentClient,
                date: new Date,
                sender: "admin",
                content: $("#m").val()
            };
            t.emit("chat message", JSON.stringify(n)), $("#m").val("")
        } else alert("slecione um cliente para chatear");
        return !1
    })
}

function drawClients(a) {
    $("#clients").html("");
    var c = document.querySelector("#clients");
    try {
        0 < Object.keys(clients).length && Object.keys(clients).forEach(function(e) {
            var n = clients[e],
                t = document.createElement("li");
            t.innerHTML = '<div class="hRow jus-start aln-center">\n          <a class="c_btn c_del-btn "></a>\n          <span id="tb-id" class="ml-3 c_name_dp sfit" >Nome</span>\n          <div class="c_online mr-2 ml-auto" ></div>\n        </div>', t.querySelector("#tb-id").innerHTML = n.name, t.querySelector(".c_del-btn").onclick = function() {
                a.emit("destroy", n.id), document.querySelector(".adm-element").classList.add("loading-float")
            }, t.querySelector(".c_online").style.backgroundColor = 1 == n.online ? "green" : "red", c.appendChild(t), t.onclick = function() {
                $(".client-info").removeClass("d-none"), $("#current").text(n.name), $("#client-name").text(n.name), $("#client-phone").text(n.phone), $("#client-phone").attr("href", "https://wa.me/".concat(n.phone, "?text=sua%20mensagem")), $("#client-email").text(n.email), $("#client-email").attr("href", "mailto:" + n.email), currentClient = n.id, drawchat(clients[n.id])
            }
        })
    } catch (e) {}
    try {
        document.querySelector(".loading-float").classList.remove("loading-float")
    } catch (e) {}
}

function drawchat(e) {
    $("#messages").html("");
    var l = document.querySelector("#messages"),
        n = document.querySelector("#messages-vp");
    try {
        0 < e.msgs.length && e.msgs.forEach(function(e) {
            var n = document.createElement("li");
            n.innerHTML = ' <div class="vRow jus-start aln-center ballon sfit px-2 py-1">\n    <span class="p-0 b_content h5 sfit m-0">Conteudo da Msg</span>\n    <span class="p-0 b_hour p sfit mr-0 ml-auto text-muted">00:00</span>\n  </div>';
            var t = "admin" == e.sender ? "#E9EBEE" : "#ccc",
                a = "admin" != e.sender ? "0" : "auto",
                c = "admin" != e.sender ? "auto" : "0";
            n.querySelector(".ballon").style.backgroundColor = t, n.querySelector(".ballon").style.marginLeft = a, n.querySelector(".ballon").style.marginRight = c, n.querySelector(".b_content").innerHTML = e.content;
            var o = new Date(e.date);
            n.querySelector(".b_hour").innerHTML = o.getHours() + ":" + o.getMinutes(), l.appendChild(n)
        })
    } catch (e) {}
    n.scrollTop = n.scrollHeight
}
document.querySelectorAll("#chat-tabs span").forEach(function(e, n) {
    e.onclick = function(e) {
        e.preventDefault();
        try {
            document.querySelector(".c_active").classList.remove("c_active")
        } catch (e) {
            throw e
        }
        console.log(tbscontents[n]), tbscontents[n].classList.add("c_active")
    }
}), fetch("/direct/config/elementId?v=chat").then(function(e) {
    return e.json(0)
}).then(function(e) {
    try {
        return config = e.result[0], !0
    } catch (e) {
        throw e
    }
}).then(function(e) {
    if (e) {
        console.log("statusu", config);
        var n = document.querySelector(".c_config-btn"),
            a = document.querySelector("#local-modal");
        n.onclick = function() {
            var n = a.querySelector(".modal-body");
            n.innerHTML = '\n      <div class="vRow">\n      <form id="config_formulario">\n        <div class="vRow px-3">\n          \n         \n            <label class="font-weight-bold fs-small" for="saudacao">Saudação quando Online:\n              <input name="saudacaoOnline" type="text" class="fs-medium" ></input> \n            </label>\n            <label class="font-weight-bold fs-small" for="saudacao">Saudação quando OffLine:\n              <input name="saudacaoOffline" type="text" class="fs-medium" ></input> \n              </label>\n           \n            <label class="font-weight-bold fs-small" for="saudacao">Nome do Atendente:\n              <input name="atendente" type="text" class="fs-medium" ></input> \n              </label>\n          \n          </div>\n      </form>\n      \n      \n      </div>\n      ';
            var e = a.querySelector(".btn-primary"),
                t = a.querySelector("#config_formulario");
            t.atendente.value = config.atendente, t.saudacaoOnline.value = config.saudacaoOnline, t.saudacaoOffline.value = config.saudacaoOffline, e.onclick = function(e) {
                n.classList.add("loading-float"), e.preventDefault();
                try {
                    config.atendente = 0 < t.atendente.value.length ? t.atendente.value : "Nomapa", config.saudacaoOnline = 0 < t.saudacaoOnline.value.length ? t.saudacaoOnline.value : "Seja Bem vindo!", config.saudacaoOffline = 0 < t.saudacaoOffline.value.length ? t.saudacaoOffline.value : "Nao estamos no momento, deixe um recado!"
                } catch (e) {
                    throw e
                }
                fetch("/direct/config", {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(config)
                }).then(function(e) {
                    return e.json()
                }).then(function(e) {
                    $(a).modal("hide");
                    try {
                        n.classList.remove("loading-float")
                    } catch (e) {}
                })
            }
        }, chat()
    }
});