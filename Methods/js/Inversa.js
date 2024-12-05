const equationsJSON = localStorage.getItem("correctedEquations");
const ecuationsElement = document.getElementById("Ecuations");
const solve = document.getElementById("Resolvamos");
const solveElement = document.getElementById("Matrix");
const End = document.getElementById("Solves");
const Solution = document.getElementById("End");

document.addEventListener("DOMContentLoaded", function () {
  resultado();
});

function Original() {
  const Real = [];
  const Matrix = [];

  const equationsJSON = localStorage.getItem("correctedEquations");
  if (!equationsJSON) {
    return;
  }

  const equations = JSON.parse(equationsJSON);
  let numVariables = 0;
  let numEcuaciones = equations.length;

  equations.forEach((equation, index) => {
    const [leftSide, rightSide] = equation.split("=");

    const leftNumbers = leftSide.match(/([+-]?\d*)[a-zA-Z]/g).map((term) => {
      const coef = term.match(/([+-]?\d*)/)[0];
      return coef === "" || coef === "+"
        ? 1
        : coef === "-"
        ? -1
        : parseInt(coef, 10);
    });

    if (index === 0) {
      numVariables = leftNumbers.length;
    }

    const rightNumber = parseFloat(rightSide.trim());
    Real.push([...leftNumbers, rightNumber]);
  });

  if (numVariables > numEcuaciones) {
    ecuationsElement.innerHTML =
      "It cannot be solved: there are more variables than equations. The system is indeterminate.";
    return null;
  }

  if (numEcuaciones > numVariables) {
    ecuationsElement.innerHTML =
      "Warning: there are more equations than variables. The system could be overdetermined.";
  }

  let resultText = "";
  let rowIndex = 0;

  while (rowIndex < Real.length) {
    const row = [...Real[rowIndex]];
    const result = row.pop();

    let equation = "";
    for (let i = 0; i < row.length; i++) {
      const coef = row[i];
      const variable = `x${i + 1}`;
      equation += `${coef >= 0 && i !== 0 ? "+" : ""}${coef}${variable}`;
    }

    equation += ` &nbsp;&nbsp;&nbsp;= ${result}`;
    Matrix.push([...row, result]);

    resultText += equation + " --> L(°°/ L)  Original equation <br>";
    rowIndex++;
  }

  ecuationsElement.innerHTML = resultText;
  solve.innerHTML = "Solve _/(UwU_/)";

  return Matrix;
}




function resultado() {
  const ecuaciones = Original();
  if (!ecuaciones) return;

  let resultText = "";
  let cont = 0;

  if (ecuaciones && ecuaciones.length > 0) {
    while (cont < ecuaciones.length) {
      const formattedEquation =
        ecuaciones[cont].slice(0, -1).join(" ") +
        " &nbsp;&nbsp;&nbsp;= " +
        ecuaciones[cont].slice(-1);
      resultText += formattedEquation + " --> <(U.U)>  Original equation <br>";
      cont++;
    }
  } else {
    resultText = "No equations were found.";
  }

  solveElement.innerHTML = resultText;
  aplicarMetodoInversa(ecuaciones);
}

function aplicarMetodoInversa(ecuaciones) {
  const steps = [];
  const step1 = [];
  const n = ecuaciones.length;
  const m = ecuaciones[0].length - 1;

  // Extraer la matriz de coeficientes
  const coefMatrix = ecuaciones.map(row => row.slice(0, m));
  const constantTerms = ecuaciones.map(row => row[m]);

  // Crear la matriz aumentada con la matriz identidad
  const augmented = coefMatrix.map((row, i) => [
    ...row,
    '|',
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  ]);

  steps.push("Step 1: Original Augmented Matrix:<br>");
  steps.push(formatearMatrizConSeparador(augmented));
  steps.push("<br><br>");

  // Proceso de eliminación de Gauss-Jordan para obtener la inversa
  for (let i = 0; i < n; i++) {
    // Paso de búsqueda de pivote
    let pivot = augmented[i][i];

    steps.push(`Iteration ${i + 1}: Pivot Selection<br>`);
    steps.push(`Current pivot at position [${i},${i}]: ${pivot}<br><br>`);

    if (pivot === 0) {
      steps.push("Pivot is zero. Searching for a non-zero pivot by row swapping.<br><br>");
      for (let k = i + 1; k < n; k++) {
        if (augmented[k][i] !== 0) {
          [augmented[i], augmented[k]] = [augmented[k], augmented[i]];
          pivot = augmented[i][i];
          steps.push(`Swapped row ${i} with row ${k}<br><br>`);
          break;
        }
      }
    }

    // Normalización de la fila del pivote
    steps.push("Normalizing pivot row:<br>");
    for (let j = 0; j < augmented[i].length; j++) {
      if (typeof augmented[i][j] === 'number') {
        augmented[i][j] /= pivot;
      }
    }
    steps.push(formatearMatrizConSeparador(augmented));
    steps.push("<br><br>");

    // Eliminación de otras filas
    steps.push("Eliminating other rows:<br>");
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        steps.push(`Eliminating row ${k} using factor ${factor}<br>`);
        for (let j = 0; j < augmented[k].length; j++) {
          if (typeof augmented[k][j] === 'number' && typeof augmented[i][j] === 'number') {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
        steps.push(formatearMatrizConSeparador(augmented));
        steps.push("<br><br>");
      }
    }
  }

  // Extraer la matriz inversa
  const inverseMatrix = augmented.map(row => 
    row.slice(m + 1).filter(val => typeof val === 'number')
  );

  steps.push("Final Inverse Matrix:<br>");
  steps.push(formatearMatrizConSeparador(inverseMatrix.map(row => row.map(val => val.toFixed(4)))));
  steps.push("<br><br>");

  // Verificación de solución multiplicando inversa * términos constantes
  const solution = constantTerms.map((value, index) => 
    inverseMatrix[index].reduce((sum, coef, col) => sum + coef * constantTerms[col], 0)
  );

  // Mostrar pasos de multiplicación de inversa por términos constantes
  steps.push("Solution Verification (Inverse * Constants):<br>");
  inverseMatrix.forEach((row, i) => {
    let verificationStep = `x${i+1} = `;
    verificationStep += row.map((coef, j) => 
      `(${coef.toFixed(4)} * ${constantTerms[j].toFixed(4)})`
    ).join(" + ");
    
    const result = solution[i];
    verificationStep += ` = ${result.toFixed(4)}<br><br>`;
    steps.push(verificationStep);
  });

  // Formatear solución final
  step1.push(`Solution: <br><br>`);
  solution.forEach((valor, index) => {
    const roundedValor = Math.abs(valor) < 1e-10 ? 0 : parseFloat(valor.toFixed(4));
    step1.push(`x${index + 1}: ${roundedValor} <br><br>`);
  });

  // Mostrar resultados
  End.innerHTML = steps.join("");
  Solution.innerHTML = step1.join("");
}

// Función auxiliar para formatear la matriz con separador vertical
function formatearMatrizConSeparador(matriz) {
  return matriz.map(fila => 
    fila.map(val => 
      typeof val === 'number' ? 
        (Math.abs(val) < 1e-10 ? 0 : parseFloat(val.toFixed(4))) : 
        val
    ).join(" ")
  ).join("<br>");
}