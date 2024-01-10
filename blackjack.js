"use strict";

// Obtener referencias a elementos del DOM
const botonJugar = document.getElementById('botonJugar');
const inputNombre = document.getElementById('inputNombre');
const resultadoDiv = document.getElementById('resultado');
const accionInput = document.getElementById('accionInput');
const botonAccion = document.getElementById('botonAccion');
const gameInput = document.getElementById('gameInput');
const botonGame = document.getElementById('botonGame');

// Funciones relacionadas con el flujo de juego:

// initDeck: Void ->  [Card]
// Inicializa el mazo de cartas
const initDeck = async () => {
    const resp = await fetch("/data.json");
    const data = await resp.json()
    return data.cartas;
};

// mixDeck: [Carta] -> [Carta]
// Mezcla el mazo de forma aleatoria
const mixDeck = (mazo) => {
    for (let i = mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    return mazo;
};

// getCardValue: Carta.valor -> int
// Obtiene el valor de una carta
const getCardValue = (valor) => {
    if (valor === 'A') return 11;
    if (['K', 'Q', 'J'].includes(valor)) return 10;
    return parseInt(valor);
};

// dealCard: [Carta] -> int
// Reparte una carta del mazo
const dealCard = (mazo) => {
    const carta = mazo.pop();
    return carta.valor;
};

// getPoints: [Carta] -> int
// Calcula el total de puntos de una mano
const getPoints = (mano) => {
    let total = 0;
    let ases = 0;
    for (const carta of mano) {
        const valor = getCardValue(carta);
        if (valor === 11) ases++;
        total += valor;
    }
    while (total > 21 && ases > 0) {
        total -= 10;
        ases--;
    }
    return total;
};

const obtenerAccionJugador = () => {
    return new Promise(resolve => {
        const clickHandler = () => {
            const accion = accionInput.value.toLowerCase().trim();
            resolve(accion);
            botonAccion.removeEventListener('click', clickHandler); // Elimina el listener después de la jugada
        };
        botonAccion.addEventListener('click', clickHandler);
    });
};

// Función para obtener el juego del jugador
const obtenerGameJugador = () => {
    return new Promise(resolve => {
        const clickHandler = () => {
            const game = gameInput.value.toLowerCase().trim();
            resolve(game);
            botonGame.removeEventListener('click', clickHandler);
        };
        botonGame.addEventListener('click', clickHandler);
    });
};

// Función para cargar el estado del juego desde localStorage
const cargarEstadoJuego = () => {
    const estadoGuardado = localStorage.getItem('estadoJuego');
    return estadoGuardado ? JSON.parse(estadoGuardado) : null;
};

// Función para guardar el estado del juego en localStorage
const guardarEstadoJuego = (estadoJuego) => {
    localStorage.setItem('estadoJuego', JSON.stringify(estadoJuego));
};
// Función para guardar el estado del juego en localStorage
const reiniciarEstadoJuego = () => {
    localStorage.removeItem('estadoJuego');
};


// Función para manejar el juego
const jugarPartida = async () => {
    let main = 'si';

    const ejecutarTurnoJugador = (mensaje) => {
        mostrarMensaje(mensaje);
        return obtenerAccionJugador()
    };

    const turnoJugador = async () => {
        const { mazo, manoJugador, manoDealer } = cargarEstadoJuego();
        let continuarJugando = true;
        while (getPoints(manoJugador) < 21 && continuarJugando) {
            const accion = await ejecutarTurnoJugador('¿Quieres pedir otra carta? (si/no)');
            if (accion === 'si') {
                const nuevaCarta = dealCard(mazo);
                manoJugador.push(nuevaCarta);
                guardarEstadoJuego({ mazo, manoJugador, manoDealer });
                mostrarEstado(manoJugador, manoDealer);
            } else {
                console.log("no quiero otra carta")
                continuarJugando = false;
            }
        }
    };
    const rondaJugador = async () => {
        mostrarMensaje('¿Quieres volver a jugar? (si/no)');
        await obtenerGameJugador();
    };

    while (main === 'si') {
        borrarMensaje();
        // Inicia el juego
        let estadoJuego = cargarEstadoJuego();
        let mazo;
        let manoJugador;
        let manoDealer;
        if (!estadoJuego) {
            mazo = mixDeck(initDeck());
            manoJugador = [dealCard(mazo), dealCard(mazo)];
            manoDealer = [dealCard(mazo), dealCard(mazo)];
            guardarEstadoJuego({ mazo, manoJugador, manoDealer });
        } else {
            mazo = estadoJuego.mazo;
            manoJugador = estadoJuego.manoJugador;
            manoDealer = estadoJuego.manoDealer;
            guardarEstadoJuego({ mazo, manoJugador, manoDealer });
        }
        mostrarEstado(manoJugador, manoDealer);

        // Turno del jugador
        await turnoJugador();

        const nuevoEstado = cargarEstadoJuego();
        mazo = nuevoEstado.mazo;
        manoJugador = nuevoEstado.manoJugador;
        manoDealer = nuevoEstado.manoDealer;
        // Turno del dealer
        while (getPoints(manoDealer) < 17) {
            console.log("jugando dealer")
            const nuevaCarta = dealCard(mazo);
            manoDealer.push(nuevaCarta);
            guardarEstadoJuego({ mazo, manoJugador, manoDealer });
        }
        console.log("termina turno dealer")
        // Muestra las manos finales
        mostrarMensaje(`Mano del jugador: ${manoJugador.join(', ')}. Total de puntos: ${getPoints(manoJugador)}`);
        mostrarMensaje(`Mano del dealer: ${manoDealer.join(', ')}. Total de puntos: ${getPoints(manoDealer)}`);

        // Determina el resultado del juego
        const resultado = determinarResultado(manoJugador, manoDealer);
        mostrarMensaje(resultado);

        reiniciarEstadoJuego();

        // Solicita volver a jugar
        await rondaJugador();
        main = gameInput.value.toLowerCase().trim();
    }
    mostrarMensaje('Espero que te haya gustado el juego');
};

// Asignar evento al botón para iniciar el juego
botonJugar.addEventListener('click', jugarPartida);

// Función para mostrar mensajes en el DOM
const mostrarMensaje = (mensaje) => {
    const mensajeDiv = document.createElement('p');
    mensajeDiv.textContent = mensaje;
    resultadoDiv.appendChild(mensajeDiv);
};

// Función para borrar mensajes en el DOM
const borrarMensaje = () => {
    resultadoDiv.textContent = "";
};

// Función para determinar el resultado del juego
const determinarResultado = (manoJugador, manoDealer) => {
    const puntosJugador = getPoints(manoJugador);
    const puntosDealer = getPoints(manoDealer);

    if (puntosJugador > 21) {
        return 'Has perdido. Te pasaste de 21.';
    } else if (puntosDealer > 21) {
        return '¡Ganaste! El dealer se pasó de 21.';
    } else if (puntosJugador > puntosDealer) {
        return '¡Ganaste! Tienes más puntos que el dealer.';
    } else if (puntosDealer > puntosJugador) {
        return 'Has perdido. El dealer tiene más puntos que tú.';
    } else {
        return 'Es un empate.';
    }
};

// Función para mostrar el estado del juego
const mostrarEstado = (manoJugador, manoDealer) => {
    mostrarMensaje(`Tus cartas: ${manoJugador.join(', ')}. Total de puntos: ${getPoints(manoJugador)}. Carta visible del dealer: ${manoDealer[0]}`);
};