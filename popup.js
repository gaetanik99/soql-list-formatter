import locales from './locales.js';

let currentLocale = 'en';

function updateUIText() {
    document.getElementById('title').textContent = locales[currentLocale].title;
    document.getElementById('subtitle').textContent = locales[currentLocale].subtitle;
    document.getElementById('infoButtonText').textContent = locales[currentLocale].infoButton;
    document.getElementById('formatButtonText').textContent = locales[currentLocale].formatButton;
    document.getElementById('clearButtonText').textContent = locales[currentLocale].clearButton;
    document.getElementById('checkDuplicatesText').textContent = locales[currentLocale].checkDuplicatesButton;
    document.getElementById('inputLabel').textContent = locales[currentLocale].inputLabel;
    document.getElementById('outputLabel').textContent = locales[currentLocale].outputLabel;
    document.getElementById('howToUseTitle').textContent = locales[currentLocale].howToUseTitle;
    document.getElementById('whatItDoes').textContent = locales[currentLocale].whatItDoes;
    document.getElementById('whatItDoesDesc').textContent = locales[currentLocale].whatItDoesDesc;
    document.getElementById('whenToUse').textContent = locales[currentLocale].whenToUse;
    document.getElementById('whenToUseDesc').textContent = locales[currentLocale].whenToUseDesc;
    document.getElementById('howToUseStepsTitle').textContent = locales[currentLocale].howToUseStepsTitle;
    document.getElementById('fromLabel').textContent = locales[currentLocale].fromLabel;
    document.getElementById('becomesLabel').textContent = locales[currentLocale].becomesLabel;
    document.getElementById('closeText').textContent = locales[currentLocale].close;

    // Update How to use steps
    const stepsContainer = document.getElementById('howToUseSteps');
    stepsContainer.innerHTML = ''; // Clear existing steps
    locales[currentLocale].howToUseSteps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsContainer.appendChild(li);
    });
}

// Language selector handler
document.getElementById('languageSelector').addEventListener('change', (e) => {
    currentLocale = e.target.value;
    updateUIText();
    // Save preference
    chrome.storage.sync.set({ preferredLanguage: currentLocale });
});

// Load saved language preference
chrome.storage.sync.get(['preferredLanguage'], (result) => {
    if (result.preferredLanguage) {
        currentLocale = result.preferredLanguage;
        document.getElementById('languageSelector').value = currentLocale;
        updateUIText();
    }
});

// Rest of the existing functionality
document.getElementById('formatButton').addEventListener('click', formatText);
document.getElementById('clearButton').addEventListener('click', clearText);
document.getElementById('infoButton').addEventListener('click', showInfo);
document.getElementById('closeInfo').addEventListener('click', hideInfo);
document.getElementById('checkDuplicatesButton').addEventListener('click', checkDuplicates);

function formatText() {
    const inputText = document.getElementById('inputText').value.trim();
    if (!inputText) {
        showToast(locales[currentLocale].noInputText);
        return;
    }
    
    const lines = inputText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    const formattedText = lines.map(line => `'${line}'`).join(',\n');
    document.getElementById('outputText').value = formattedText;
    
    // Copia automaticamente il testo formattato negli appunti
    navigator.clipboard.writeText(formattedText).then(() => {
        showToast(locales[currentLocale].copiedText);
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

function showConfirmDialog(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        
        const content = document.createElement('div');
        content.className = 'popup-content';
        
        const title = document.createElement('div');
        title.className = 'popup-title';
        title.textContent = message;
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'popup-buttons';
        
        const confirmButton = document.createElement('button');
        confirmButton.className = 'popup-button confirm';
        confirmButton.textContent = locales[currentLocale].ok || 'OK';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'popup-button cancel';
        cancelButton.textContent = locales[currentLocale].cancel || 'Cancel';
        
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        
        content.appendChild(title);
        content.appendChild(buttonsContainer);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        confirmButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
    });
}

async function checkDuplicates() {
    const inputText = document.getElementById('inputText');
    const lines = inputText.value.split('\n').filter(line => line.trim() !== '');
    const duplicates = new Map();
    
    // Reset previous highlights
    inputText.value = lines.join('\n');
    
    // Find duplicates
    lines.forEach((line, index) => {
        if (!duplicates.has(line)) {
            duplicates.set(line, [index]);
        } else {
            duplicates.get(line).push(index);
        }
    });
    
    // Filter only items with duplicates
    const duplicateItems = Array.from(duplicates.entries())
        .filter(([_, indices]) => indices.length > 1);
    
    if (duplicateItems.length === 0) {
        showToast(locales[currentLocale].noDuplicates || 'No duplicates found');
        return;
    }
    
    // Highlight duplicates
    duplicateItems.forEach(([value, indices]) => {
        indices.forEach(index => {
            const start = lines.slice(0, index).join('\n').length + (index > 0 ? 1 : 0);
            const end = start + value.length;
            inputText.setSelectionRange(start, end);
        });
    });
    
    // Ask user if they want to remove duplicates
    const shouldRemove = await showConfirmDialog(locales[currentLocale].removeDuplicates || 'Duplicates found. Would you like to remove them?');
    
    if (shouldRemove) {
        const uniqueLines = Array.from(new Set(lines));
        inputText.value = uniqueLines.join('\n');
        showToast(locales[currentLocale].duplicatesRemoved || 'Duplicates removed');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        formatText();
    } else if (e.ctrlKey && e.key === 'c' && document.activeElement.id !== 'inputText') {
        navigator.clipboard.writeText(document.getElementById('outputText').value).then(() => {
            showToast(locales[currentLocale].copiedText);
            setTimeout(() => {
                window.close();
            }, 1000);
        });
    } else if (e.key === 'Escape') {
        if (document.getElementById('infoPanel').classList.contains('show')) {
            hideInfo();
        } else {
            clearText();
        }
    }
});

// Initial text update
updateUIText();
