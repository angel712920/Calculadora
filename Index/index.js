let correctedEquations = [];
const Advice = document.getElementById("Advice");
const Menu = document.getElementById("Menu");
const content = document.getElementById("content");

function validateAndProcess() {
  const equationsInput = document.getElementById("equations").value;
  const result = document.getElementById("result");
  const inputsContainer = document.getElementById("inputs-container");
  const Methods = document.getElementById("Methods_Button");
  
  let equations = parseInt(equationsInput, 10);
  let cont = 0;
  inputsContainer.innerHTML = "";
  Methods.innerHTML = "";
  Advice.innerHTML = "";

  if (isNaN(equations) || equations < 2) {
    Menu.style.display = "none";
    content.style.display = "none";
    result.textContent = "Please enter a valid positive integer greater than 1.";
    return;
  }

  if (equations > 3) {
    Menu.style.display = "none";
    content.style.display = "none";
    result.textContent = "At the moment only values between 2 and 3 are allowed.";
    return;
  }

  while (cont < equations) {
    cont++;
    const input = document.createElement("input");
    input.type = "text";
    input.name = `equation${cont}`;
    input.placeholder = `Equation ${cont}`;
    inputsContainer.appendChild(input);
    inputsContainer.appendChild(document.createElement("br"));
  }
  
  Menu.style.display = "none";
  content.style.display = "none";
  result.textContent = "You have entered " + cont + " equation(s).";

  const button = document.createElement("button");
  button.name = "Solve";
  button.textContent = "Solve";
  button.id = "SolveButton";
  button.onclick = validation;
  Methods.appendChild(button);
}

function validation() {
  const equationsInput = document.getElementById("equations").value;
  const equations = parseInt(equationsInput, 10);
  let cont = 0;

  while (cont < equations) {
    cont++;
    const equation = document.getElementsByName(`equation${cont}`)[0].value;

    if (equation.trim() === "") {
      Menu.style.display = "none";
      Advice.textContent = `Equation ${cont} is empty. Please fill it out.`;
      return false;
    }
  }

  ListsAndMatrices(equations);
  return true;
}

function ListsAndMatrices(equations) {
  let cont = 0;
  let lists = {};
  correctedEquations = [];

  while (cont < equations) {
    cont++;
    let inputElement = document.getElementsByName(`equation${cont}`)[0];
    if (!inputElement) continue;

    let equation = inputElement.value.trim();
    if (!isValidEquation(equation)) {
      Menu.style.display = "none";
      content.style.display = "none";
      Advice.textContent = `Equation ${cont} is not in a valid format. Please enter a valid equation.`;
      return;
    }

    let [leftSide, rightSide] = equation.split("=");
    let terms = splitEquation(leftSide);
    lists[`list${cont}`] = terms;
  }

  let allVariables = findAllVariables(lists);
  
  for (let i = 1; i <= equations; i++) {
    let terms = lists[`list${i}`];
    let completedTerms = fillMissingVariables(terms, allVariables);
    let finalEquation = addCoefficients(completedTerms);
    
    let [, rightSide] = document.getElementsByName(`equation${i}`)[0].value.split("=");
    rightSide = rightSide ? rightSide.trim() : "0";
    
    correctedEquations.push(`${finalEquation}=${rightSide}`);
  }

  localStorage.setItem("correctedEquations", JSON.stringify(correctedEquations));
  content.style.display = "none";
  ShowMethods();
}

function isValidEquation(equation) {
  let validTermRegex = /^[+-]?(\d*[a-zA-Z]\d*|\d+)$/;
  let validRightSideRegex = /^[+-]?\d+(\.\d+)?$/;

  let [leftSide, rightSide] = equation.split("=");
  let terms = splitEquation(leftSide);

  for (let term of terms) {
    if (!validTermRegex.test(term)) {
      return false;
    }
  }

  if (rightSide && !validRightSideRegex.test(rightSide.trim())) {
    return false;
  }

  return true;
}

function splitEquation(equation) {
  equation = equation.replace(/\s+/g, "");
  return equation.match(/[+-]?[^+-]+/g) || [];
}

function findAllVariables(lists) {
  let allVariables = new Set();
  let maxIndex = 0;
  let hasSubscript = false;

  for (let terms of Object.values(lists)) {
    terms.forEach((term) => {
      let match = term.match(/([a-zA-Z])(\d*)/);
      if (match) {
        let [, variable, subscript] = match;
        if (subscript) {
          hasSubscript = true;
          allVariables.add(variable + subscript);
          maxIndex = Math.max(maxIndex, parseInt(subscript));
        } else {
          allVariables.add(variable);
        }
      }
    });
  }

  if (hasSubscript) {
    for (let i = 1; i <= maxIndex; i++) {
      allVariables.add(`x${i}`);
    }
  }

  return Array.from(allVariables).sort((a, b) => {
    let aMatch = a.match(/([a-zA-Z])(\d*)/);
    let bMatch = b.match(/([a-zA-Z])(\d*)/);
    let aLetter = aMatch[1];
    let bLetter = bMatch[1];
    let aNum = aMatch[2] ? parseInt(aMatch[2]) : 0;
    let bNum = bMatch[2] ? parseInt(bMatch[2]) : 0;
    return aLetter.localeCompare(bLetter) || aNum - bNum;
  });
}

function fillMissingVariables(terms, allVariables) {
  let termMap = {};

  terms.forEach((term) => {
    let match = term.match(/^([+-]?\d*)([a-zA-Z]\d*)$/);
    if (match) {
      let [, coefficient, variable] = match;
      termMap[variable] = coefficient || "+1";
    }
  });

  return allVariables.map((variable) => {
    return termMap[variable] ? termMap[variable] + variable : "+0" + variable;
  });
}

function addCoefficients(terms) {
  return terms
    .map((term) => {
      if (/^[+-]?[a-zA-Z]/.test(term)) {
        return term.replace(/^[+-]?/, (match) => (match === "-" ? "-1" : "+1"));
      }
      return term;
    })
    .join("");
}

function ShowMethods() {
  Advice.innerHTML = "";
  Advice.textContent = "Select the method in which you want to see the solution to the equation.";
  Menu.style.display = "block";
}

function loadPage(page) {
  content.style.display = "block";
  document.getElementById("contentFrame").src = page;
}