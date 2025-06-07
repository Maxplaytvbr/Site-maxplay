function abrirTrailer(key) {
  const container = document.getElementById("trailer-container");
  const modal = document.getElementById("trailer-modal");
  container.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.className = "absolute top-0 left-0 w-full h-full";
  iframe.src = `https://www.youtube.com/embed/${key}`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  container.appendChild(iframe);
  modal.classList.remove("hidden");
}

document.getElementById("close-trailer").onclick = () => {
  document.getElementById("trailer-modal").classList.add("hidden");
  document.getElementById("trailer-container").innerHTML = "";
};
