import locales from './locales.js';

let currentLocale = 'en';

function updateTexts() {
    const texts = locales[currentLocale];
    
    // Update all text content
    document.getElementById('title').textContent = texts.title;
    document.getElementById('subtitle').textContent = texts.subtitle;
    document.getElementById('infoButtonText').textContent = texts.infoButton;
    document.getElementById('howToUseTitle').textContent = texts.howToUse;
    document.getElementById('whatItDoes').textContent = texts.whatItDoes;
    document.getElementById('whatItDoesDesc').textContent = texts.whatItDoesDesc;
    document.getElementById('whenToUse').textContent = texts.whenToUse;
    document.getElementById('whenToUseDesc').textContent = texts.whenToUseDesc;
    document.getElementById('howToUseStepsTitle').textContent = texts.howToUseTitle;
    document.getElementById('exampleTitle').textContent = texts.example;
    document.getElementById('fromLabel').textContent = texts.from;
    document.getElementById('becomesLabel').textContent = texts.becomes;
    document.getElementById('closeText').textContent = texts.close;
    document.getElementById('inputLabel').textContent = texts.inputLabel;
    document.getElementById('formatButtonText').textContent = texts.formatButton;
    document.getElementById('copyButtonText').textContent = texts.copyButton;
    document.getElementById('clearButtonText').textContent = texts.clearButton;
    document.getElementById('outputLabel').textContent = texts.outputLabel;
    document.getElementById('checkDuplicatesText').textContent = texts.checkDuplicatesButton;

    // Update steps list
    const stepsContainer = document.getElementById('howToUseSteps');
    stepsContainer.innerHTML = '';
    texts.howToUseSteps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsContainer.appendChild(li);
    });
}

// Language selector handler
document.getElementById('languageSelector').addEventListener('change', (e) => {
    currentLocale = e.target.value;
    updateTexts();
    // Save preference
    chrome.storage.sync.set({ preferredLanguage: currentLocale });
});

// Load saved language preference
chrome.storage.sync.get(['preferredLanguage'], (result) => {
    if (result.preferredLanguage) {
        currentLocale = result.preferredLanguage;
        document.getElementById('languageSelector').value = currentLocale;
        updateTexts();
    }
});

// Rest of the existing functionality
document.getElementById('formatButton').addEventListener('click', formatText);
document.getElementById('copyButton').addEventListener('click', copyText);
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
}

function copyText() {
    const outputText = document.getElementById('outputText').value;
    if (!outputText) {
        showToast(locales[currentLocale].noCopyText);
        return;
    }

    navigator.clipboard.writeText(outputText).then(() => {
        showToast(locales[currentLocale].copiedText);
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

function checkDuplicates() {
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
    const textArea = document.getElementById('inputText');
    const text = textArea.value;
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    
    const highlightedText = document.createElement('div');
    highlightedText.style.whiteSpace = 'pre-wrap';
    highlightedText.style.position = 'absolute';
    highlightedText.style.top = '0';
    highlightedText.style.left = '0';
    highlightedText.style.pointerEvents = 'none';
    highlightedText.style.width = '100%';
    
    let htmlContent = text;
    duplicateItems.forEach(([value, indices]) => {
        const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${escapedValue}$`, 'gm');
        htmlContent = htmlContent.replace(regex, `<span class="duplicate-highlight">${value}</span>`);
    });
    
    highlightedText.innerHTML = htmlContent;
    wrapper.appendChild(highlightedText);
    
    // Ask user if they want to remove duplicates
    if (confirm(locales[currentLocale].removeDuplicates || 'Duplicates found. Would you like to remove them?')) {
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
        copyText();
    } else if (e.key === 'Escape') {
        if (document.getElementById('infoPanel').classList.contains('show')) {
            hideInfo();
        } else {
            clearText();
        }
    }
});

// Initial text update
updateTexts();
