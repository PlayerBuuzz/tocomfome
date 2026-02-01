import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyD6a29L24aFSgVjmC7NFGXpdWW4g1uQsio",
  authDomain: "tocomfome-754e1.firebaseapp.com",
  projectId: "tocomfome-754e1",
};

/* 🔥 Inicialização única */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* 🌙 Aplicar tema salvo */
onAuthStateChanged(auth, async (user)=>{
  if(!user){
    document.body.classList.remove("dark-theme");
    return;
  }

  try{
    const snap = await getDoc(doc(db,"clientes",user.uid));
    if(!snap.exists()) return;

    const dados = snap.data();

    if(dados.tema === "dark"){
      document.body.classList.add("dark-theme");
    }else{
      document.body.classList.remove("dark-theme");
    }

  }catch(e){
    console.error("Erro ao aplicar tema:", e);
  }
});
