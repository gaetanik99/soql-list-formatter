document.getElementById('formatButton').addEventListener('click', formatText);
document.getElementById('copyButton').addEventListener('click', copyText);
document.getElementById('clearButton').addEventListener('click', clearText);

function formatText() {
    const inputText = document.getElementById('inputText').value.trim();
    const lines = inputText.split('\n').map(line => line.trim());
    const formattedText = lines.map(line => `'${line}'`).join(',\n');
    document.getElementById('outputText').value = formattedText;
}

function copyText() {
    const outputText = document.getElementById('outputText').value;
    navigator.clipboard.writeText(outputText).then(() => {
        alert('The formatted text has been copied to the clipboard!');
    });
}

function clearText() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
}
