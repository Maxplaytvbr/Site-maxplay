document.addEventListener("DOMContentLoaded", () => {
  fetch("partes/header.html")
    .then(res => res.text())
    .then(data => document.getElementById("header").innerHTML = data);

  fetch("partes/filmes.html")
    .then(res => res.text())
    .then(data => document.getElementById("filmes").innerHTML = data);

  fetch("partes/esportes.html")
    .then(res => res.text())
    .then(data => document.getElementById("esportes").innerHTML = data);

  fetch("partes/canais.html")
    .then(res => res.text())
    .then(data => document.getElementById("canais").innerHTML = data);

  fetch("partes/modais.html")
    .then(res => res.text())
    .then(data => document.getElementById("modais").innerHTML = data);
});
