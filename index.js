const checkBtn = document.querySelector('.checkBtn');
const expressionInput = document.querySelector('.expression');
const content = document.querySelector('.content');
const tautologyField = document.querySelector('.tautology');
const untautologyField = document.querySelector('.untautology');
const errorField = document.querySelector('.error');
const resultField = document.querySelector('.result');
const resultArray = [];

const variablesSymbols = ['p', 'P', 'q', 'Q', 'r', 'R'];
const operationSymbols = ['n', 'N', 's', 'S', 'c', 'C', 'i', 'I', 'E', 'e'];
const otherSymbols = [' ', '(', ')', '[', ']'];
let expression = '';

expressionInput.addEventListener('input', function () {
    tautologyField.classList.remove('active')
    untautologyField.classList.remove('active')
    errorField.classList.remove('active')
    const lastSymbol = expressionInput.value[expressionInput.value.length - 1];
    const allSymbols = [...variablesSymbols, ...operationSymbols, ...otherSymbols]

    if (!allSymbols.includes(lastSymbol)) {
        expressionInput.value = expressionInput.value.slice(0, -1)
    }
})

checkBtn.addEventListener('click', checkTautology)

function checkTautology() {
    resultArray.length = 0;
    expression = expressionInput.value;
    expression = expression.replace(/ /g, '');
    expression = expression.replace(/\[/g, '(').replace(/\]/g, ')');
    expression = expression.replace(/P|Q|R/g, function (x) {
        return x.toLowerCase();
    });
    expression = expression.replace(/n|s|c|i|e/g, function (x) {
        return x.toUpperCase();
    });

    if (!expression) return;

    for (let i = 0; i < expression.length - 1; i++) {
        if (variablesSymbols.includes(expression[i]) && [...variablesSymbols, '(', '['].includes(expression[i + 1])) return errorField.classList.add('active')
    }

    expression = '(' + expression + ')'

    try {
        combine(expression, 0, 0, 0);
        combine(expression, 1, 0, 0);
        combine(expression, 0, 1, 0);
        combine(expression, 1, 1, 0);
        combine(expression, 0, 0, 1);
        combine(expression, 0, 1, 1);
        combine(expression, 1, 0, 1);
        combine(expression, 1, 1, 1);
    }

    catch (e) {
        errorField.classList.add('active')
        return
    }

    if (!untautologyField.classList.contains('active')) tautologyField.classList.add('active');
    else resultField.textContent = resultArray.join(',');
}

function combine(expression, p, q, r) {

    const oryginalExpression = expression;
    expression = expression.replace(/p/gi, p).replace(/q/gi, q).replace(/r/gi, r);

    expression = getInternalPart(expression);
    if (expression == 0) {
        const pString = oryginalExpression.includes('p') ? ` p=${p}` : '';
        const qString = oryginalExpression.includes('q') ? ` q=${q}` : '';
        const rString = oryginalExpression.includes('r') ? ` r=${r}` : '';
        const fullResult = `${pString}${qString}${rString}`;

        if (!resultArray.includes(fullResult)) resultArray.push(fullResult);

        if (!untautologyField.classList.contains('active')) untautologyField.classList.add('active');
    }
}

function getInternalPart(expression) {

    const numberOfLoop = expression.split('(').length - 1;

    for (let i = 0; i < numberOfLoop; i++) {

        let openedBracket = expression.lastIndexOf('(');
        let closedBracket = expression.indexOf(')', openedBracket) + 1;
        let fragment = expression.slice(openedBracket, closedBracket);
        fragment = negation(fragment);
        fragment = conjunctionAndAlternative(fragment);
        fragment = implicationAndEquivalence(fragment);

        fragment = fragment[1];
        expression = expression.slice(0, openedBracket) + fragment + expression.slice(closedBracket)
    }
    return expression
}


function negation(fragment) {
    let negativeIndex = fragment.indexOf('N')
    while (negativeIndex !== -1) {
        fragment = fragment.replace('N', "!");

        const negativeValue = fragment[negativeIndex] + fragment[negativeIndex + 1];
        const negativeValueNumber = +(eval(negativeValue));
        fragment = fragment.slice(0, negativeIndex) + negativeValueNumber + fragment.slice(negativeIndex + 2)

        negativeIndex = fragment.indexOf('N')
    }
    return fragment;
}

function conjunctionAndAlternative(fragment) {
    let conjunctionOrAlternativeIndex = firstOnLeft('S', 'C', fragment);

    while (conjunctionOrAlternativeIndex !== -1) {
        const letter = fragment[conjunctionOrAlternativeIndex];
        const symbolToReplace = letter === 'S' ? '|' : '&'
        fragment = fragment.replace(letter, symbolToReplace);

        const value = fragment.slice(conjunctionOrAlternativeIndex - 1, conjunctionOrAlternativeIndex + 2);

        const transformedValue = +(eval(value));
        fragment = fragment.slice(0, conjunctionOrAlternativeIndex - 1) + transformedValue + fragment.slice(conjunctionOrAlternativeIndex + 2);

        conjunctionOrAlternativeIndex = firstOnLeft('S', 'C', fragment);
    }

    return (fragment)
}


function implicationAndEquivalence(fragment) {

    let implicationAndEquivalenceIndex = firstOnLeft('I', 'E', fragment);

    while (implicationAndEquivalenceIndex !== -1) {
        const letter = fragment[implicationAndEquivalenceIndex];
        const symbolToReplace = letter === 'I' ? '|' : '==';
        fragment = fragment.replace(letter, symbolToReplace);

        if (letter === 'I') {
            fragment = fragment.slice(0, implicationAndEquivalenceIndex - 1) + '!' + fragment.slice(implicationAndEquivalenceIndex - 1);
        }
        const value = fragment.slice(implicationAndEquivalenceIndex - 1, implicationAndEquivalenceIndex + 3);
        const transformedValue = +(eval(value));
        fragment = fragment.slice(0, implicationAndEquivalenceIndex - 1) + transformedValue + fragment.slice(implicationAndEquivalenceIndex + 3)

        implicationAndEquivalenceIndex = firstOnLeft('I', 'E', fragment);
    }

    return (fragment)
}


function firstOnLeft(a, b, fragment) {
    const indexA = fragment.indexOf(a);
    const indexB = fragment.indexOf(b);
    if (indexA === -1 || (indexB < indexA && indexB !== -1)) return indexB;
    else if (indexB === -1 || (indexA < indexB && indexB !== -1)) return indexA;
}

