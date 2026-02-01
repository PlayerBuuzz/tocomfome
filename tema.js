// aplica o tema salvo ao carregar qualquer página
(function(){
  const tema = localStorage.getItem("tema");
  if(tema === "dark"){
    document.body.classList.add("dark-theme");
  }
})();

// alterna tema manualmente (se tiver botão)
function toggleTema(){
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("tema", isDark ? "dark" : "light");
}
