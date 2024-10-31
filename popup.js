document.getElementById('formatButton').addEventListener('click', formatText);
document.getElementById('copyButton').addEventListener('click', copyText);
document.getElementById('clearButton').addEventListener('click', clearText);

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

function showToast(message) {
    // Rimuovi toast esistenti
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Crea e mostra il nuovo toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Forza un reflow per far funzionare l'animazione
    toast.offsetHeight;
    toast.classList.add('show');

    // Rimuovi il toast dopo 2 secondi
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// Aggiungi supporto per la tastiera
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        formatText();
    } else if (e.ctrlKey && e.key === 'c' && document.activeElement.id !== 'inputText') {
        copyText();
    } else if (e.key === 'Escape') {
        clearText();
    }
});
