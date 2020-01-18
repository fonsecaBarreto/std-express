"use strict";
var body = document.querySelector("body"),
    navbarNav = document.querySelector(".navbar-nav");

function initChat() {
    var n = {
        atendente: ""
    };
    fetch("/direct/config/elementId?v=chat").then(function(e) {
        return e.json()
    }).then(function(e) {
        try {
            n.atendente = e.result[0].atendente
        } catch (e) {}
        $("#chat-button").on("click", function() {
            $("#chat-button").addClass("closed"), $("#chat").removeClass("closed")
        }), $("#c_close-btn").on("click", function() {
            $("#chat-button").removeClass("closed"), $("#chat").addClass("closed")
        });
        var t = document.querySelector("#chat-form-entrada"),
            a = document.querySelector("#chat-form-saida"),
            o = document.querySelector("#c_messages"),
            c = document.querySelector("#c_body"),
            vp=document.querySelector("#c_messages-vp"),
            r = io();
        r.on("connect", function() {
            document.querySelector("#c_mn-name").innerHTML = n.atendente, t.onsubmit = function(e) {
                e.preventDefault(), c.classList.add("stand-by"), t.classList.add("d-none");
                var n = {
                    name: 0 < t.name.value.length ? t.name.value : "Não informado",
                    phone: 0 < t.phone.value.length ? t.phone.value : "Não informado",
                    email: 0 < t.email.value.length ? t.email.value : "Não informado"
                };
                r.emit("chat init", JSON.stringify(n))
            }, r.on("update", function(e) {
                var n = JSON.parse(e);
                try {
                    document.querySelector("#c_mn-status").classList.remove("d-none")
                } catch (e) {}
                document.querySelector("#c_mn-status").innerHTML = null != n.admin && null != n.admin ? "On-line" : "Off-line";
                try {
                    c.classList.remove("stand-by")
                } catch (e) {}
                try {
                    a.classList.remove("d-none")
                } catch (e) {}
            }), a.onsubmit = function(e) {
                e.preventDefault();
                var n = {
                    client: r.id,
                    date: new Date,
                    sender: "self",
                    content: a.m.value
                };
                return r.emit("chat message", JSON.stringify(n)), a.m.value = "", !1
            };
            r.on("chat message", function(e) {
                e = JSON.parse(e);
                var n = document.createElement("li");
                n.innerHTML = ' \n    <div class=" sfit vRow aln-center px-2 mb-1">\n    <div class="vRow c_ballon jus-center aln-center sfit ">\n    <span class="c_content fs-small sfit ">Conteudo</span>\n    </div> \n    <span class="c_hour sfit fs-xxsmall text-muted mr-0 ml-auto">00:00</span>\n    </div>\n    ';
                var t = "admin" == e.sender ? "0 auto 0 0" : "0 0 0 auto",
                    a = "admin" == e.sender ? "#F8F8F8" : "#77DD77";
                n.querySelector(".c_content").innerHTML = e.content, 
                n.querySelector(".c_ballon").parentNode.style.margin = t, 
                n.querySelector(".c_ballon").style.backgroundColor = a, 
                o.appendChild(n)
                vp.scrollTop = vp.scrollHeight
            })
        })
    })
}

setTimeout(function(){
    document.querySelector("#chat-button").classList.remove("closed")
    initChat();
},5000)
navbarNav.querySelector(".active").classList.remove("active"), navbarNav.querySelectorAll(".nav-item").forEach(function(e) {
    e.onmouseover = function(e) {
        try {
            navbarNav.querySelector(".active").classList.add("panico")
        } catch (e) {}
    }, e.onmouseout = function() {
        try {
            navbarNav.querySelector(".active").classList.remove("panico")
        } catch (e) {}
    }
});