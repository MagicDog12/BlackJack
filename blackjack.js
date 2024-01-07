"use strict";

// Obtener referencias a elementos del DOM
const botonJugar = document.getElementById('botonJugar');
const inputNombre = document.getElementById('inputNombre');
const resultadoDiv = document.getElementById('resultado');
const accionInput = document.getElementById('accionInput');
const botonAccion = document.getElementById('botonAccion');
const gameInput = document.getElementById('gameInput');
const botonGame = document.getElementById('botonGame');


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
        while (calcularPuntos(manoJugador) < 21 && continuarJugando) {
            const accion = await ejecutarTurnoJugador('¿Quieres pedir otra carta? (si/no)');
            if (accion === 'si') {
                const nuevaCarta = repartirCarta(mazo);
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
            mazo = mezclarMazo(inicializarMazo());
            manoJugador = [repartirCarta(mazo), repartirCarta(mazo)];
            manoDealer = [repartirCarta(mazo), repartirCarta(mazo)];
            guardarEstadoJuego({mazo, manoJugador, manoDealer});
        } else {
            mazo = estadoJuego.mazo;
            manoJugador = estadoJuego.manoJugador;
            manoDealer = estadoJuego.manoDealer;
            guardarEstadoJuego({mazo, manoJugador, manoDealer});
        }
        mostrarEstado(manoJugador, manoDealer);

        // Turno del jugador
        await turnoJugador();

        const nuevoEstado = cargarEstadoJuego();
        mazo = nuevoEstado.mazo;
        manoJugador = nuevoEstado.manoJugador;
        manoDealer = nuevoEstado.manoDealer;
        // Turno del dealer
        while (calcularPuntos(manoDealer) < 17) {
            console.log("jugando dealer")
            const nuevaCarta = repartirCarta(mazo);
            manoDealer.push(nuevaCarta);
            guardarEstadoJuego({ mazo, manoJugador, manoDealer });
        }
        console.log("termina turno dealer")
        // Muestra las manos finales
        mostrarMensaje(`Mano del jugador: ${manoJugador.join(', ')}. Total de puntos: ${calcularPuntos(manoJugador)}`);
        mostrarMensaje(`Mano del dealer: ${manoDealer.join(', ')}. Total de puntos: ${calcularPuntos(manoDealer)}`);

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


// Función para inicializar el mazo de cartas
const inicializarMazo = () => {
    const mazo = [];
    const palos = ['Corazones', 'Diamantes', 'Picas', 'Tréboles'];
    const valores = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const palo of palos) {
        for (const valor of valores) {
            mazo.push({ palo, valor });
        }
    }
    return mazo;
};

// Función para mezclar el mazo
const mezclarMazo = (mazo) => {
    for (let i = mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    return mazo;
};

// Función para obtener el valor de una carta
const valorCarta = (carta) => {
    if (carta === 'A') return 11;
    if (['K', 'Q', 'J'].includes(carta)) return 10;
    return parseInt(carta);
};

// Función para repartir una carta
const repartirCarta = (mazo) => {
    const carta = mazo.pop();
    return carta.valor;
};

// Función para calcular el total de puntos de una mano
const calcularPuntos = (mano) => {
    let total = 0;
    let ases = 0;

    for (const carta of mano) {
        const valor = valorCarta(carta);
        if (valor === 11) ases++;
        total += valor;
    }

    while (total > 21 && ases > 0) {
        total -= 10;
        ases--;
    }

    return total;
};

// Función para determinar el resultado del juego
const determinarResultado = (manoJugador, manoDealer) => {
    const puntosJugador = calcularPuntos(manoJugador);
    const puntosDealer = calcularPuntos(manoDealer);

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
    mostrarMensaje(`Tus cartas: ${manoJugador.join(', ')}. Total de puntos: ${calcularPuntos(manoJugador)}. Carta visible del dealer: ${manoDealer[0]}`);
};