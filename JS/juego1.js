const boton=document.getElementById("inicio");
const botonjugar=document.getElementById("jugar");
const botonreiniciar=document.getElementById("reiniciar");
const botonResultados=document.getElementById("mostrarResultados");
const botonAlternarMusica=document.getElementById("alternarMusica");
const resultados=document.getElementById("resultados");
const selectorColorFondo=document.getElementById("colorFondo");
const selectorDificultad=document.getElementById("dificultad");
const intentosRestantes=document.getElementById("intentosRestantes");
const gameOver=document.getElementById("gameOver");
const mensajeGameOver=document.getElementById("mensajeGameOver");
const musica=document.getElementById("musica");
const dificultades={
    facilito:{maximo:10, intentos:7},
    medio:{maximo:100, intentos:10},
    dificilisimo:{maximo:1000, intentos:30}
};
const nombresDificultad={
    facilito:"Facilito",
    medio:"Medio",
    dificilisimo:"Dificilísimo"
};
let tiempo=0;
let intervalo=null;
let partidaFinalizada=false;
let t=document.getElementById("contador");
let numsuerte=0;
let intentosDisponibles=0;

musica.volume=0.2;

function iniciarMusica(){
    musica.play().catch(()=>{
        document.addEventListener("pointerdown",iniciarMusica,{once:true});
        document.addEventListener("keydown",iniciarMusica,{once:true});
    });
}

iniciarMusica();

botonAlternarMusica.addEventListener("click",()=>{
    musica.muted=!musica.muted;
    botonAlternarMusica.setAttribute("aria-pressed",String(musica.muted));
    botonAlternarMusica.textContent=musica.muted
        ? "Activar música"
        : "Silenciar música";
});

selectorColorFondo.addEventListener("input",()=>{
    document.body.style.backgroundColor=selectorColorFondo.value;
});

function iniciartiempo(){
    intervalo=setInterval(function(){
        tiempo++;
        t.innerText=tiempo;
    },1000);
}

function guardarPartidaGanada(nombre, acumulativo){
    try{
        const partidasGuardadas=localStorage.getItem("partidasGanadas");
        const partidas=partidasGuardadas===null ? [] : JSON.parse(partidasGuardadas);

        if(!Array.isArray(partidas)){
            throw new Error("El historial guardado no tiene un formato válido.");
        }

        partidas.push({
            nombre,
            tiempo,
            acumulativo,
            dificultad:selectorDificultad.value
        });
        localStorage.setItem("partidasGanadas",JSON.stringify(partidas));
        return true;
    }catch(error){
        console.error("No se pudo guardar la partida ganada en localStorage.",error);
        return false;
    }
}

function mostrarResultados(){
    resultados.replaceChildren();
    const titulo=document.createElement("h2");
    titulo.textContent="Partidas ganadas";
    resultados.appendChild(titulo);

    try{
        const partidasGuardadas=localStorage.getItem("partidasGanadas");
        const partidas=partidasGuardadas===null ? [] : JSON.parse(partidasGuardadas);

        if(!Array.isArray(partidas)){
            throw new Error("El historial guardado no tiene un formato válido.");
        }

        if(partidas.length===0){
            const mensaje=document.createElement("p");
            mensaje.className="resultados-vacios";
            mensaje.textContent="Todavía no hay partidas ganadas.";
            resultados.appendChild(mensaje);
            return;
        }

        const contenedorTabla=document.createElement("div");
        contenedorTabla.className="tabla-resultados-contenedor";
        const tabla=document.createElement("table");
        tabla.className="tabla-resultados";
        const encabezado=document.createElement("thead");
        const filaEncabezado=document.createElement("tr");
        ["#", "Nombre", "Dificultad", "Tiempo", "Pistas"].forEach((texto)=>{
            const celda=document.createElement("th");
            celda.scope="col";
            celda.textContent=texto;
            filaEncabezado.appendChild(celda);
        });
        encabezado.appendChild(filaEncabezado);
        tabla.appendChild(encabezado);

        const cuerpo=document.createElement("tbody");
        partidas.forEach((partida, indice)=>{
            const fila=document.createElement("tr");
            const pistas=typeof partida.acumulativo==="string"
                ? partida.acumulativo.split("\n").filter(Boolean)
                : [];
            const valores=[
                indice+1,
                partida.nombre,
                nombresDificultad[partida.dificultad] || "Sin datos",
                `${partida.tiempo} segundos`,
                pistas.length
            ];
            valores.forEach((valor)=>{
                const celda=document.createElement("td");
                celda.textContent=String(valor);
                fila.appendChild(celda);
            });
            cuerpo.appendChild(fila);
        });
        tabla.appendChild(cuerpo);
        contenedorTabla.appendChild(tabla);
        resultados.appendChild(contenedorTabla);
    }catch(error){
        console.error("No se pudieron cargar los resultados desde localStorage.",error);
        const mensaje=document.createElement("p");
        mensaje.className="resultados-vacios";
        mensaje.textContent="No se pudieron cargar los resultados guardados.";
        resultados.appendChild(mensaje);
    }
}

function abrirResultados(){
    resultados.hidden=false;
    botonResultados.setAttribute("aria-expanded","true");
    botonResultados.textContent="Ocultar resultados";
    mostrarResultados();
    resultados.scrollIntoView({behavior:"smooth", block:"start"});
}

botonResultados.addEventListener("click",()=>{
    if(resultados.hidden){
        abrirResultados();
    }else{
        resultados.hidden=true;
        botonResultados.setAttribute("aria-expanded","false");
        botonResultados.textContent="Ver resultados";
    }
});

function iniciarPartida(){
    const dificultad=dificultades[selectorDificultad.value];
    clearInterval(intervalo);
    tiempo=0;
    t.innerText=tiempo;
    partidaFinalizada=false;
    intentosDisponibles=dificultad.intentos;
    numsuerte=Math.floor(Math.random()*(dificultad.maximo+1));
    const entrada=document.getElementById("numerouser");
    entrada.min="0";
    entrada.max=String(dificultad.maximo);
    entrada.value="";
    intentosRestantes.innerText=`Intentos restantes: ${intentosDisponibles}`;
    document.querySelector(".mensaje1").innerText="";
    document.querySelector(".pista").innerText="";
    gameOver.hidden=true;
    gameOver.style.display="none";
    document.getElementById("primeraparte").style.display="none";
    document.getElementById("juego").style.display="block";
    iniciartiempo();
    entrada.focus();
}

botonreiniciar.addEventListener("click",iniciarPartida);
document.getElementById("intentarDeNuevo").addEventListener("click",iniciarPartida);
document.getElementById("cambiarDificultad").addEventListener("click",()=>{
    gameOver.hidden=true;
    gameOver.style.display="none";
    document.getElementById("primeraparte").style.display="block";
    selectorDificultad.focus();
});

botonjugar.addEventListener("click",()=>{
    let nuser=document.getElementById("numerouser");
    let men=document.querySelector(".mensaje1");
    let pista=document.querySelector(".pista");

    if(partidaFinalizada){
        return;
    }

    const numeroIngresado=nuser.valueAsNumber;
    const maximo=dificultades[selectorDificultad.value].maximo;
    if(!Number.isInteger(numeroIngresado) || numeroIngresado<0 || numeroIngresado>maximo){
        men.innerText=`Ingresa un número entero entre 0 y ${maximo}.`;
        return;
    }

    if(numeroIngresado===numsuerte){
        clearInterval(intervalo);
        partidaFinalizada=true;
        const guardado=guardarPartidaGanada(
            document.getElementById("nombre").value,
            pista.innerText
        );
        men.innerText=guardado
            ? "Ganaste... partida guardada :)"
            : "Ganaste, pero no se pudo guardar la partida :(";
        abrirResultados();
    }else{
        intentosDisponibles--;
        intentosRestantes.innerText=`Intentos restantes: ${intentosDisponibles}`;
        men.innerText="No es el número...";

        if(numeroIngresado>=numsuerte){
            pista.innerText += (pista.innerText ? "\n" : "") + "Es menor...";
        }else{
            pista.innerText += (pista.innerText ? "\n" : "") + "Es mayor...";
        }

        if(intentosDisponibles===0){
            clearInterval(intervalo);
            partidaFinalizada=true;
            mensajeGameOver.innerText=`Se acabaron los intentos :C El número era ${numsuerte}.`;
            document.getElementById("juego").style.display="none";
            gameOver.hidden=false;
            gameOver.style.display="block";
            gameOver.scrollIntoView({behavior:"smooth", block:"center"});
        }
    }
});

boton.addEventListener("click",()=>{
    let n=document.getElementById("nombre");
    let men=document.querySelector(".mensaje");

    if(n.value.trim()===""){
        men.innerText="Escribir el nombre...";
    }else{
        iniciarPartida();
    }
});
