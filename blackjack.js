"use strict";

//
// Funciones relacionadas con el flujo de juego:
//

// initDeck: Void ->  [Card]
// Inicializa el mazo de cartas
const initDeck = async () => {
    const resp = await fetch("/data.json");
    const data = await resp.json()
    return data.cards;
};

// mixDeck: [Card] -> [Card]
// Mezcla el mazo de forma aleatoria
const mixDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

// getCardValue: Card.value -> int
// Obtiene el valor de una carta
const getCardValue = (value) => {
    if (value === 'A') return 11;
    if (['K', 'Q', 'J'].includes(value)) return 10;
    return parseInt(value);
};

// dealCard: [Card] -> int
// Reparte una carta del mazo
const dealCard = (deck) => {
    const card = deck.pop();
    return card.value;
};

// getPoints: [Card] -> int
// Calcula el total de puntos de una mano
const getPoints = (hand) => {
    let total = 0;
    let asCount = 0;
    for (const card of hand) {
        const value = getCardValue(card);
        if (value === 11) asCount++;
        total += value;
    }
    while (total > 21 && asCount > 0) {
        total -= 10;
        asCount--;
    }
    return total;
};

// determinarResultado: [Card] [Card] -> string
// Determina el resultado del juego dado la mano del jugador y el dealer
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

//
// Funciones relacionadas con el almacenamiento del estado del juego
//

// getGameState: Void -> State
// Obtiene el estado del juego desde localStorage
const getGameState = () => {
    const state = localStorage.getItem('estadoJuego');
    return state ? JSON.parse(state) : null;
};

// putGameState: State -> Void
// Guarda el estado del juego en localStorage
const putGameState = (state) => {
    localStorage.setItem('estadoJuego', JSON.stringify(state));
};

// deleteGameState: Void -> Void
// Función para guardar el estado del juego en localStorage
const deleteGameState = () => {
    localStorage.removeItem('estadoJuego');
};

// mostrarEstado: [Card] [Card] -> Void
// Muestra el estado del juego
const mostrarEstado = (manoJugador, manoDealer) => {
    mostrarMensaje(`Tus cartas: ${manoJugador.join(', ')}. Total de puntos: ${getPoints(manoJugador)}. Carta visible del dealer: ${manoDealer[0]}`);
};

//
// Funciones relacionadas con el uso del DOM
// 

// Obtener referencias a elementos del DOM
const playButton = document.getElementById('playButton');
const historialDiv = document.getElementById('historial');
const accionInput = document.getElementById('accionInput');
const accionButton = document.getElementById('accionButton');
const gameInput = document.getElementById('gameInput');
const gameButton = document.getElementById('gameButton');

// Asignar evento al botón para iniciar el juego
playButton.addEventListener('click', jugarPartida);

// mostrarMensaje: string -> Void
// Muestra los mensajes en el historial
const mostrarMensaje = (mensaje) => {
    const mensajeDiv = document.createElement('p');
    mensajeDiv.textContent = mensaje;
    historialDiv.appendChild(mensajeDiv);
};

// borrarMensaje: Void -> Void
// Borra los mensajes del historial
const borrarMensaje = () => {
    historialDiv.textContent = "Historial: \n";
};

// mostrarAlerta: string string string -> Void
// Muestra una alerta usando sweet alerta con un titulo, mensaje e icono.
const mostrarAlerta = (title, mensaje, icon) => {
    Swal.fire({
        title: title,
        text: mensaje,
        icon: icon,
        showConfirmButton: false,
        timer: 1500
    })
};

// obtenerAccionJugador: Void -> Promise
// Obtiene la accion de un jugador para saber si es que va a agregar una nueva carta
const obtenerAccionJugador = () => {
    return new Promise(resolve => {
        const clickHandler = () => {
            const accion = accionInput.value.toLowerCase().trim();
            resolve(accion);
            accionButton.removeEventListener('click', clickHandler); // Elimina el listener después de la jugada
        };
        accionButton.addEventListener('click', clickHandler);
    });
};

// obtenerGameJugador: Void -> Promise
// Obtiene el juego de un jugador para saber si es que va a querer jugar otra partida
const obtenerGameJugador = () => {
    return new Promise(resolve => {
        const clickHandler = () => {
            const game = gameInput.value.toLowerCase().trim();
            resolve(game);
            gameButton.removeEventListener('click', clickHandler);
        };
        gameButton.addEventListener('click', clickHandler);
    });
};

// jugarPartida: Void -> Void
// Simula una partida del juego de Black Jack
const jugarPartida = async () => {
    let main = 'si';

    const ejecutarTurnoJugador = (titulo, mensaje, icon) => {
        mostrarMensaje(mensaje);
        mostrarAlerta(titulo, mensaje, icon)
        return obtenerAccionJugador()
    };

    const turnoJugador = async () => {
        const { mazo, manoJugador, manoDealer } = getGameState();
        let continuarJugando = true;
        while (getPoints(manoJugador) < 21 && continuarJugando) {
            const accion = await ejecutarTurnoJugador('¿Quieres pedir otra carta? (si/no)', '', 'question');
            if (accion === 'si') {
                const nuevaCarta = dealCard(mazo);
                manoJugador.push(nuevaCarta);
                putGameState({ mazo, manoJugador, manoDealer });
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
        // Se reinicia el juego
        borrarMensaje();
        deleteGameState();
        // Inicia el juego
        let estadoJuego = getGameState();
        let mazo;
        let manoJugador;
        let manoDealer;
        if (!estadoJuego) {
            mazo = mixDeck(await initDeck());
            manoJugador = [dealCard(mazo), dealCard(mazo)];
            manoDealer = [dealCard(mazo), dealCard(mazo)];
            putGameState({ mazo, manoJugador, manoDealer });
        } else {
            mazo = estadoJuego.mazo;
            manoJugador = estadoJuego.manoJugador;
            manoDealer = estadoJuego.manoDealer;
            putGameState({ mazo, manoJugador, manoDealer });
        }
        mostrarEstado(manoJugador, manoDealer);

        // Turno del jugador
        await turnoJugador();

        const nuevoEstado = getGameState();
        mazo = nuevoEstado.mazo;
        manoJugador = nuevoEstado.manoJugador;
        manoDealer = nuevoEstado.manoDealer;
        // Turno del dealer
        while (getPoints(manoDealer) < 17) {
            console.log("jugando dealer")
            const nuevaCarta = dealCard(mazo);
            manoDealer.push(nuevaCarta);
            putGameState({ mazo, manoJugador, manoDealer });
        }
        console.log("termina turno dealer")
        // Muestra las manos finales
        mostrarMensaje(`Mano del jugador: ${manoJugador.join(', ')}. Total de puntos: ${getPoints(manoJugador)}`);
        mostrarMensaje(`Mano del dealer: ${manoDealer.join(', ')}. Total de puntos: ${getPoints(manoDealer)}`);

        // Determina el resultado del juego
        const resultado = determinarResultado(manoJugador, manoDealer);
        mostrarMensaje(resultado);

        deleteGameState();

        // Solicita volver a jugar
        await rondaJugador();
        main = gameInput.value.toLowerCase().trim();
    }
    mostrarMensaje('Espero que te haya gustado el juego');
};