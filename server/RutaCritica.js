
export function calcularRutaOrdenadaConCorrequisitos(materias, limitePorCuatrimestre = 6) {
  const mapaMaterias = new Map();
  const grafo = new Map();
  const gradosEntrada = new Map();
  const caminos = new Map(); // Para ruta crítica: materia_id -> [ruta acumulada]

  // Inicializar estructuras
  materias.forEach(m => {
    mapaMaterias.set(m.id_materia, m);
    grafo.set(m.id_materia, []);
    gradosEntrada.set(m.id_materia, 0);
    caminos.set(m.id_materia, []); // Inicializamos caminos vacíos
  });

  // Construir grafo de prerrequisitos
  materias.forEach(m => {
    const prereq = m.id_materia_prerrequisito;
    if (prereq !== null && mapaMaterias.has(prereq)) {
      grafo.get(prereq).push(m.id_materia);
      gradosEntrada.set(m.id_materia, gradosEntrada.get(m.id_materia) + 1);
    }
  });

  // Kahn + niveles + camino más largo
  const cola = [];
  const niveles = new Map(); // materia_id -> cuatrimestre
  const orden = [];
  const yaAgregados = new Set();

  gradosEntrada.forEach((grado, id) => {
    if (grado === 0) {
      cola.push(id);
      niveles.set(id, 1);
      caminos.set(id, [id]); // Su propio camino
    }
  });

  while (cola.length > 0) {
    const actual = cola.shift();
    if (yaAgregados.has(actual)) continue;

    const materiaActual = mapaMaterias.get(actual);
    const nivelActual = niveles.get(actual);

    const correq = materiaActual.id_materia_correquisito;
    if (correq && !yaAgregados.has(correq) && mapaMaterias.has(correq)) {
      niveles.set(correq, nivelActual);
      caminos.set(correq, [...caminos.get(actual), correq]);
      orden.push(mapaMaterias.get(correq));
      yaAgregados.add(correq);
    }

    orden.push(materiaActual);
    yaAgregados.add(actual);

    for (const vecino of grafo.get(actual)) {
      gradosEntrada.set(vecino, gradosEntrada.get(vecino) - 1);

      // Actualizar niveles
      const nivelVecino = niveles.get(vecino) || 1;
      niveles.set(vecino, Math.max(nivelVecino, nivelActual + 1));

      // Actualizar ruta más larga
      const caminoActual = caminos.get(actual) || [];
      const caminoVecino = caminos.get(vecino) || [];
      if (caminoActual.length + 1 > caminoVecino.length) {
        caminos.set(vecino, [...caminoActual, vecino]);
      }

      if (gradosEntrada.get(vecino) === 0) {
        cola.push(vecino);
      }
    }
  }

  // Agrupar por cuatrimestres
  const cuatrimestres = [];
  const materiasPorNivel = new Map();

  niveles.forEach((nivel, id) => {
    if (!materiasPorNivel.has(nivel)) materiasPorNivel.set(nivel, []);
    materiasPorNivel.get(nivel).push(mapaMaterias.get(id));
  });

  let nivel = 1;
  while (materiasPorNivel.size > 0) {
    const materias = materiasPorNivel.get(nivel) || [];
    let bloque = [];

    for (const materia of materias) {
      if (bloque.length < limitePorCuatrimestre) {
        bloque.push(materia);
      } else {
        if (!materiasPorNivel.has(nivel + 1)) materiasPorNivel.set(nivel + 1, []);
        materiasPorNivel.get(nivel + 1).push(materia);
      }
    }

    if (bloque.length > 0) cuatrimestres.push(bloque);
    materiasPorNivel.delete(nivel);
    nivel++;
  }

  // Buscar la ruta crítica más larga
  let rutaCritica = [];
  caminos.forEach(camino => {
    if (camino.length > rutaCritica.length) {
      rutaCritica = camino;
    }
  });

  const rutaCriticaMaterias = rutaCritica.map(id => mapaMaterias.get(id));

  return {
    cuatrimestres,
    totalCuatrimestres: cuatrimestres.length,
    rutaCritica: rutaCriticaMaterias,
  };
}
