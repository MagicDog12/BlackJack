"use strict";

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
    alert(`Tus cartas: ${manoJugador.join(', ')}. Total de puntos: ${calcularPuntos(manoJugador)}. Carta visible del dealer: ${manoDealer[0]}`);
};

let main = prompt("Este es un simulador de Black Jack, quieres jugar una partida? (si/no)");
while (main == "si") {
    // Inicia el juego
    let mazo = inicializarMazo();
    mazo = mezclarMazo(mazo);
    const manoJugador = [repartirCarta(mazo), repartirCarta(mazo)];
    const manoDealer = [repartirCarta(mazo), repartirCarta(mazo)];

    mostrarEstado(manoJugador, manoDealer);

    let continuarJugando = true;
    // Turno del jugador
    while (calcularPuntos(manoJugador) < 21 && continuarJugando) {
        const accion = prompt('¿Quieres pedir otra carta? (si/no)');
        if (accion == 'si') {
            const nuevaCarta = repartirCarta(mazo);
            manoJugador.push(nuevaCarta);
            alert(`Has recibido una ${nuevaCarta}.`);
            mostrarEstado(manoJugador, manoDealer);
        } else {
            continuarJugando = false;
        }
    }

    // Turno del dealer
    while (calcularPuntos(manoDealer) < 17) {
        const nuevaCarta = repartirCarta(mazo);
        manoDealer.push(nuevaCarta);
        alert(`El dealer pide otra carta y ha recibido una ${nuevaCarta}.`);
    }

    // Muestra las manos finales
    alert(`\nMano del jugador: ${manoJugador.join(', ')}. Total de puntos: ${calcularPuntos(manoJugador)}`);
    alert(`Mano del dealer: ${manoDealer.join(', ')}. Total de puntos: ${calcularPuntos(manoDealer)}`);


    // Determina el resultado del juego
    const resultado = determinarResultado(manoJugador, manoDealer);
    alert(`\n${resultado}`);
    main = prompt("Quieres volver a jugar? (si/no)");
}
alert("Espero que te haya gustado el juego");