const equationsJSON = localStorage.getItem("correctedEquations"); // Obtiene las ecuaciones de localStorage
const ecuationsElement = document.getElementById("Ecuations");
const solve = document.getElementById("Resolvamos");
const solveElement = document.getElementById("Matrix");
const End = document.getElementById("Solves");
const Solution = document.getElementById("End");

document.addEventListener("DOMContentLoaded", function () {
  resultado();
});

function Original() {
  const Real = []; // Inicializa el array para almacenar los coeficientes y el número a la derecha del "="
  const Matrix = []; // Define Matrix fuera del bucle para almacenar todas las ecuaciones

  const equationsJSON = localStorage.getItem("correctedEquations"); // Obtiene las ecuaciones desde el localStorage
  if (!equationsJSON) {
    return; // Sale si no hay ecuaciones
  }

  const equations = JSON.parse(equationsJSON); // Convierte el JSON a un array
  let numVariables = 0; // Inicializa el número de variables
  let numEcuaciones = equations.length; // Número de ecuaciones es la longitud del array

  equations.forEach((equation, index) => {
    const [leftSide, rightSide] = equation.split("="); // Divide la ecuación en los lados izquierdo y derecho

    // Extraer los coeficientes ignorando los subíndices
    const leftNumbers = leftSide.match(/([+-]?\d*)[a-zA-Z]/g).map((term) => {
      const coef = term.match(/([+-]?\d*)/)[0]; // Extraer solo el coeficiente
      return coef === "" || coef === "+" ? 1 : coef === "-" ? -1 : parseInt(coef, 10); // Manejar coeficientes implícitos
    });

    // Actualizar el número de variables basándose en el tamaño del lado izquierdo
    if (index === 0) {
      numVariables = leftNumbers.length; // Suponemos que todas las ecuaciones tienen el mismo número de variables
    }

    const rightNumber = parseFloat(rightSide.trim()); // Extrae el número en el lado derecho

    // Agrega la fila completa con los coeficientes y el número derecho
    Real.push([...leftNumbers, rightNumber]);
  });

  // Validar si el sistema es indeterminado (más variables que ecuaciones)
  if (numVariables > numEcuaciones) {
    ecuationsElement.innerHTML = "It cannot be solved: there are more variables than equations. The system is indeterminate.";
    return null; // Detener la ejecución ya que el sistema no se puede resolver
  }

  // Validar si el sistema es sobredeterminado (más ecuaciones que variables)
  if (numEcuaciones > numVariables) {
    ecuationsElement.innerHTML = "Warning: there are more equations than variables. The system could be overdetermined.";
    // Aun así, continuamos para intentar resolverlo
  }

  // Iterar sobre todas las filas de 'Real' y mostrarlas formateadas
  let resultText = ""; // Variable para almacenar el resultado formateado
  let rowIndex = 0;

  while (rowIndex < Real.length) {
    const row = [...Real[rowIndex]]; // Hacer una copia de la fila actual
    const result = row.pop(); // Extraer el último valor (resultado)

    let equation = ""; // Para construir la ecuación formateada
    for (let i = 0; i < row.length; i++) {
      const coef = row[i];
      const variable = `x${i + 1}`; // Asignar variables x1, x2, etc.

      // Mostrar incluso los coeficientes 0
      equation += `${coef >= 0 && i !== 0 ? '+' : ''}${coef}${variable}`;
    }

    // Añadir el lado derecho de la ecuación con una separación extra
    equation += ` &nbsp;&nbsp;&nbsp;= ${result}`;

    // Agregar la ecuación y resultado a 'Matrix'
    Matrix.push([...row, result]);

    // Añadir la ecuación formateada al resultado (sin el texto extra)
    resultText += equation + " --> L(°°/ L)  Original equation <br>"; // Separar cada ecuación con un salto de línea
    rowIndex++;
  }

  // Mostrar el resultado en el elemento HTML
  ecuationsElement.innerHTML = resultText;
  solve.innerHTML = "Solve _/(UwU_/)";
  
  return Matrix;
}

function resultado() {
  const ecuaciones = Original(); // Llama a la función Original para obtener las ecuaciones
  if (!ecuaciones) return; // Si no se puede resolver, no continuar

  let resultText = "";
  let cont = 0;

  // Verificar si ecuaciones tiene contenido antes de iterar
  if (ecuaciones && ecuaciones.length > 0) {
    // Iterar sobre el array de ecuaciones
    while (cont < ecuaciones.length) {
      // Usar .join() para concatenar los elementos sin comas
      const formattedEquation = ecuaciones[cont].slice(0, -1).join(" ") + " &nbsp;&nbsp;&nbsp;= " + ecuaciones[cont].slice(-1);
      resultText += formattedEquation + " --> <(U.U)>  Original equation <br>"; // Separar cada ecuación con un salto de línea
      cont++;
    }
  } else {
    resultText = "No equations were found."; // Mensaje en caso de no haber ecuaciones
  }

  // Mostrar el resultado en el elemento HTML sin las comas
  solveElement.innerHTML = resultText;

  // Llamar a la función que aplica el método de Gauss y muestra paso a paso
  aplicarMetodoGauss(ecuaciones);
}



function aplicarMetodoGauss(ecuaciones) {
  const steps = [];
  const step1 = [];
  let n = ecuaciones.length;
  let m = ecuaciones[0].length - 1; // Número de variables (columnas sin incluir el término independiente)

  // Paso 1: Crear los pivotes
for (let i = 0; i < Math.min(n, m); i++) {
    let pivot = ecuaciones[i][i];

    // Verificar si el pivote es cero y buscar una fila para intercambiar
    if (pivot === 0) {
        let swapped = false;
        for (let k = i + 1; k < n; k++) {
            if (ecuaciones[k][i] !== 0) {
                // Intercambiar las filas
                [ecuaciones[i], ecuaciones[k]] = [ecuaciones[k], ecuaciones[i]];
                swapped = true;
                break;
            }
        }

        if (!swapped) {
            // Si no se encuentra una fila para intercambiar, el sistema no puede resolverse
            steps.push(`The system cannot be solved. No valid pivot found for column ${i + 1}.`);
            End.innerHTML = steps.join('');
            return;
        }

        // Actualizar el valor del nuevo pivote
        pivot = ecuaciones[i][i];
    }

    // Normalizar la fila pivote
    for (let j = 0; j <= m; j++) {
        ecuaciones[i][j] /= pivot;
        if (isNaN(ecuaciones[i][j])) {
            ecuaciones[i][j] = 0;
        }
    }

    // Agregar pasos para la visualización
    steps.push(`${formatearEcuacion(ecuaciones[i], m)} --> Normalize row. Split by ${pivot} <br>`);

    // Hacer ceros en la columna del pivote para otras filas
    for (let k = 0; k < n; k++) {
        if (k !== i) {
            const factor = ecuaciones[k][i];
            if (!isNaN(factor) && factor !== 0) {
                for (let j = 0; j <= m; j++) {
                    ecuaciones[k][j] -= factor * ecuaciones[i][j];
                    if (isNaN(ecuaciones[k][j])) {
                        ecuaciones[k][j] = 0;
                    }
                }
                steps.push(`${formatearEcuacion(ecuaciones[k], m)} --> Convert to zeros using factor ${factor} <br>`);
            }
        }
    }
    steps.push(`<br>`);
}


  step1.push(`Solution: <br> <br>`);

  // Verificar si el sistema tiene solución única
  if (n > m) {
    // Verificar si el sistema es consistente
    let esConsistente = true;
    for (let i = m; i < n; i++) {
      if (Math.abs(ecuaciones[i][m]) > 1e-10) {
        esConsistente = false;
        break;
      }
    }
    
    if (!esConsistente) {
      step1.push("The system has no solution (inconsistent system)");
      Solution.innerHTML = step1.join('');
      return;
    }
  }

  // Mostrar la solución
  for (let i = 0; i < m; i++) {
    if (i < ecuaciones.length) {
      let valor = ecuaciones[i][m];
      // Redondear a 4 decimales si es necesario
      valor = Math.abs(valor) < 1e-10 ? 0 : parseFloat(valor.toFixed(4));
      step1.push(`x${i + 1}: ${valor} <br>`);
    }
  }

  // Mostrar los pasos en el elemento 'End'
  End.innerHTML = steps.join('');
  Solution.innerHTML = step1.join('');
}

// Función auxiliar para formatear la ecuación
function formatearEcuacion(ecuacion, numVariables) {
  let str = '';
  // Mostrar los coeficientes de las variables
  for (let i = 0; i < numVariables; i++) {
    let valor = ecuacion[i];
    // Redondear a 4 decimales si es necesario
    valor = Math.abs(valor) < 1e-10 ? 0 : parseFloat(valor.toFixed(4));
    str += `${valor} `;
  }
  // Mostrar el término independiente
  let resultado = ecuacion[numVariables];
  resultado = Math.abs(resultado) < 1e-10 ? 0 : parseFloat(resultado.toFixed(4));
  str += `   = ${resultado}`;
  return str;
}