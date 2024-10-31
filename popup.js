document.getElementById('formatButton').addEventListener('click', formatText);
document.getElementById('copyButton').addEventListener('click', copyText);
document.getElementById('clearButton').addEventListener('click', clearText);
document.getElementById('infoButton').addEventListener('click', showInfo);
document.getElementById('closeInfo').addEventListener('click', hideInfo);

function formatText() {
    const inputText = document.getElementById('inputText').value.trim();
    if (!inputText) {
        showToast('Inserisci del testo da formattare');
        return;
    }
    
    const lines = inputText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    const formattedText = lines.map(line => `'${line}'`).join(',\n');
    document.getElementById('outputText').value = formattedText;
}

function copyText() {
    const outputText = document.getElementById('outputText').value;
    if (!outputText) {
        showToast('Nessun testo da copiare');
        return;
    }

    navigator.clipboard.writeText(outputText).then(() => {
        showToast('Testo copiato!');
        setTimeout(() => {
            window.close();
        }, 1000);
    });
}

function clearText() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
}

function showInfo() {
    document.getElementById('infoPanel').classList.add('show');
}

function hideInfo() {
    document.getElementById('infoPanel').classList.remove('show');
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        formatText();
    } else if (e.ctrlKey && e.key === 'c' && document.activeElement.id !== 'inputText') {
        copyText();
    } else if (e.key === 'Escape') {
        if (document.getElementById('infoPanel').classList.contains('show')) {
            hideInfo();
        } else {
            clearText();
        }
    }
});
