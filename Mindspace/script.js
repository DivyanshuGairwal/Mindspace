// State
let spaces = JSON.parse(localStorage.getItem('mindspace_data')) || [];
let activeSpaceId = null;

// DOM Elements
const viewSpaces = document.getElementById('view-spaces');
const viewSpaceDetails = document.getElementById('view-space-details');
const spacesGrid = document.getElementById('spaces-grid');
const spaceTitle = document.getElementById('space-title');
const spaceGoalInput = document.getElementById('space-goal-input');
const entriesList = document.getElementById('entries-list');
const modalCreate = document.getElementById('modal-create-space');
const inputNewSpaceName = document.getElementById('new-space-name');

// Navigation
function showSpacesList() {
    activeSpaceId = null;
    viewSpaces.classList.remove('hidden');
    viewSpaceDetails.classList.add('hidden');
    document.querySelector('.app-header').classList.remove('hidden');
    renderSpaces();
}

function showSpaceDetails(id) {
    activeSpaceId = id;
    const space = spaces.find(s => s.id === id);
    if (!space) return showSpacesList();

    viewSpaces.classList.add('hidden');
    viewSpaceDetails.classList.remove('hidden');
    document.querySelector('.app-header').classList.add('hidden');
    
    spaceTitle.textContent = space.name;
    spaceGoalInput.value = space.goal || '';
    renderEntries(space);
}

// Data Persistence
function save() {
    localStorage.setItem('mindspace_data', JSON.stringify(spaces));
}

// Renderers
function renderSpaces() {
    spacesGrid.innerHTML = '';
    spaces.forEach(space => {
        const card = document.createElement('div');
        card.className = 'space-card';
        card.innerHTML = `
            <h3>${space.name}</h3>
            <p>${space.entries.length} thought${space.entries.length !== 1 ? 's' : ''}</p>
        `;
        card.onclick = () => showSpaceDetails(space.id);
        spacesGrid.appendChild(card);
    });
}

function renderEntries(space) {
    entriesList.innerHTML = '';
    // Newest first
    const sortedEntries = [...space.entries].reverse();
    
    sortedEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'entry-item';
        
        const tagHtml = entry.tag ? `<span class="tag">${entry.tag}</span>` : '';
        
        // Format simple date
        const dateObj = new Date(entry.date);
        const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        item.innerHTML = `
            <div class="entry-text">${entry.text}</div>
            <div class="entry-meta">
                ${tagHtml}
                <span>${dateStr}</span>
            </div>
        `;
        entriesList.appendChild(item);
    });
}

// Actions
function createSpace(name) {
    if (!name.trim()) return;
    const newSpace = {
        id: Date.now(),
        name: name.trim(),
        goal: '',
        entries: []
    };
    spaces.push(newSpace);
    save();
    renderSpaces();
    closeModal();
}

function deleteActiveSpace() {
    if (!confirm('Delete this space and all thoughts within it?')) return;
    spaces = spaces.filter(s => s.id !== activeSpaceId);
    save();
    showSpacesList();
}

function updateGoal(text) {
    const space = spaces.find(s => s.id === activeSpaceId);
    if (space) {
        space.goal = text;
        save();
    }
}

function addEntry(text, tag) {
    if (!text.trim()) return;
    const space = spaces.find(s => s.id === activeSpaceId);
    if (space) {
        space.entries.push({
            id: Date.now(),
            text: text,
            tag: tag,
            date: new Date().toISOString()
        });
        save();
        renderEntries(space);
    }
}

function openModal() {
    modalCreate.classList.remove('hidden');
    inputNewSpaceName.value = '';
    inputNewSpaceName.focus();
}

function closeModal() {
    modalCreate.classList.add('hidden');
}

// Event Listeners
document.getElementById('btn-create-space').addEventListener('click', openModal);
document.getElementById('btn-cancel-create').addEventListener('click', closeModal);

document.getElementById('btn-confirm-create').addEventListener('click', () => {
    createSpace(inputNewSpaceName.value);
});

inputNewSpaceName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createSpace(inputNewSpaceName.value);
});

document.getElementById('btn-back').addEventListener('click', showSpacesList);
document.getElementById('btn-delete-space').addEventListener('click', deleteActiveSpace);

spaceGoalInput.addEventListener('input', (e) => updateGoal(e.target.value));

document.getElementById('btn-add-entry').addEventListener('click', () => {
    const textInput = document.getElementById('entry-text');
    const tagSelect = document.getElementById('entry-tag');
    
    addEntry(textInput.value, tagSelect.value);
    textInput.value = ''; // clear input
});

document.querySelector('.modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) closeModal();
});

// Init
showSpacesList();
