// Game Data
const MONSTERS = {
    flamby: { name: 'Flamby', type: 'Fire', hp: 45, atk: 12, def: 8, spd: 10, sprite: '🔥' },
    aqualis: { name: 'Aqualis', type: 'Water', hp: 50, atk: 10, def: 10, spd: 8, sprite: '💧' },
    terrak: { name: 'Terrak', type: 'Earth', hp: 55, atk: 11, def: 12, spd: 6, sprite: '🌿' },
    voltix: { name: 'Voltix', type: 'Electric', hp: 40, atk: 13, def: 7, spd: 12, sprite: '⚡' },
    glaceon: { name: 'Glaceon', type: 'Ice', hp: 48, atk: 10, def: 9, spd: 9, sprite: '❄️' },
    shadowfang: { name: 'Shadowfang', type: 'Dark', hp: 52, atk: 14, def: 8, spd: 11, sprite: '🌙' }
};

const ZONES = [
    { id: 'forest', name: 'Forêt Mystique', monsters: ['flamby', 'terrak', 'glaceon'], level: 1 },
    { id: 'lake', name: 'Lac Cristal', monsters: ['aqualis', 'glaceon'], level: 2 },
    { id: 'mountain', name: 'Mont Tonnerre', monsters: ['voltix', 'terrak', 'shadowfang'], level: 3 }
];

const ITEMS = {
    potion: { name: 'Potion', price: 50, effect: 'heal', value: 20 },
    superPotion: { name: 'Super Potion', price: 100, effect: 'heal', value: 50 },
    monsterBall: { name: 'Monster Ball', price: 200, effect: 'capture', value: 0.3 }
};

// Game State
let gameState = {
    player: { name: '', level: 1, money: 500, exp: 0 },
    team: [],
    inventory: { potion: 3, superPotion: 1, monsterBall: 5 },
    currentZone: null,
    gameStarted: false
};

let battleState = null;

// Initialize Game
function initGame() {
    loadGame();
    if (gameState.gameStarted) {
        showNavbar();
        navigateTo('exploration');
    } else {
        renderStarters();
    }
}

// Save/Load Game
function saveGame() {
    localStorage.setItem('monstersWebSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('monstersWebSave');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// Navigation
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');
    
    if (page === 'exploration') renderExploration();
    if (page === 'team') renderTeam();
    if (page === 'inventory') renderInventory();
}

function showNavbar() {
    document.getElementById('navbar').style.display = 'flex';
}

function resetGame() {
    if (confirm('Recommencer ? La sauvegarde sera perdue.')) {
        localStorage.removeItem('monstersWebSave');
        location.reload();
    }
}

// Render Functions
function renderStarters() {
    const startersDiv = document.getElementById('starters');
    const starters = ['flamby', 'aqualis', 'terrak'];
    
    startersDiv.innerHTML = starters.map(key => {
        const monster = MONSTERS[key];
        return `
            <div class="starter-card" onclick="startGame('${key}')">
                <div class="monster-sprite-large">${monster.sprite}</div>
                <h3>${monster.name}</h3>
                <p>${monster.type}</p>
            </div>
        `;
    }).join('');
}

function startGame(starterKey) {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        showMessage('Entre ton nom de dresseur !');
        return;
    }

    const starter = { ...MONSTERS[starterKey], level: 5, exp: 0 };
    starter.currentHp = Math.floor(starter.hp * 1.5);
    starter.maxHp = starter.currentHp;

    gameState.player.name = playerName;
    gameState.team = [starter];
    gameState.gameStarted = true;
    
    saveGame();
    showNavbar();
    navigateTo('exploration');
}

function renderExploration() {
    document.getElementById('player-info').innerHTML = `
        <p>👤 ${gameState.player.name} - Niveau ${gameState.player.level}</p>
        <p>💰 ${gameState.player.money}</p>
    `;

    document.getElementById('zones').innerHTML = ZONES.map(zone => `
        <div class="zone-card" onclick="startBattle('${zone.id}')">
            <h3>${zone.name}</h3>
            <p>Niveau recommandé: ${zone.level}</p>
            <p>Monstres: ${zone.monsters.map(m => MONSTERS[m].sprite).join(' ')}</p>
        </div>
    `).join('');
}

function renderTeam() {
    const teamGrid = document.getElementById('team-grid');
    if (gameState.team.length === 0) {
        teamGrid.innerHTML = '<p>Aucun monstre dans l\'équipe</p>';
        return;
    }

    teamGrid.innerHTML = gameState.team.map((monster, i) => {
        const expPercent = (monster.exp / (monster.level * 100)) * 100;
        return `
            <div class="team-monster">
                <div class="monster-card">
                    <div class="monster-sprite">${monster.sprite}</div>
                    <h3>${monster.name}</h3>
                    <p class="monster-type">${monster.type}</p>
                    <p>Niveau ${monster.level}</p>
                    <div class="stats">
                        <span>❤️ ${Math.floor(monster.hp * (1 + monster.level * 0.1))}</span>
                        <span>⚔️ ${Math.floor(monster.atk * (1 + monster.level * 0.1))}</span>
                        <span>🛡️ ${Math.floor(monster.def * (1 + monster.level * 0.1))}</span>
                        <span>⚡ ${monster.spd}</span>
                    </div>
                </div>
                <div class="exp-bar">
                    <div class="exp-fill" style="width: ${expPercent}%"></div>
                </div>
                <p>EXP: ${monster.exp} / ${monster.level * 100}</p>
            </div>
        `;
    }).join('');
}

function renderInventory() {
    const inventoryGrid = document.getElementById('inventory-grid');
    inventoryGrid.innerHTML = Object.entries(gameState.inventory).map(([key, qty]) => {
        const item = ITEMS[key];
        return `
            <div class="inventory-item">
                <h3>${item.name}</h3>
                <p>Quantité: ${qty}</p>
                <p class="item-desc">
                    ${item.effect === 'heal' ? `Soigne ${item.value} HP` : 'Capture un monstre'}
                </p>
            </div>
        `;
    }).join('');
}

// Battle Functions
function startBattle(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    const randomMonster = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
    const enemy = { ...MONSTERS[randomMonster], level: zone.level + Math.floor(Math.random() * 3) };
    enemy.currentHp = Math.floor(enemy.hp * (1 + enemy.level * 0.1));
    enemy.maxHp = enemy.currentHp;

    const playerMonster = { ...gameState.team[0] };
    playerMonster.currentHp = playerMonster.currentHp || playerMonster.maxHp;

    battleState = {
        enemy,
        playerMonster,
        turn: 'player',
        canCapture: false
    };

    renderBattle();
    navigateTo('battle');
}

function renderBattle() {
    const enemy = battleState.enemy;
    const player = battleState.playerMonster;

    document.getElementById('enemy-monster').innerHTML = `
        <div class="monster-sprite">${enemy.sprite}</div>
        <h3>${enemy.name}</h3>
        <p class="monster-type">${enemy.type}</p>
        <p>Niveau ${enemy.level}</p>
    `;

    document.getElementById('player-monster').innerHTML = `
        <div class="monster-sprite">${player.sprite}</div>
        <h3>${player.name}</h3>
        <p class="monster-type">${player.type}</p>
        <p>Niveau ${player.level}</p>
    `;

    updateBattleUI();
}

function updateBattleUI() {
    const enemy = battleState.enemy;
    const player = battleState.playerMonster;

    document.getElementById('enemy-hp').style.width = `${(enemy.currentHp / enemy.maxHp) * 100}%`;
    document.getElementById('enemy-hp-text').textContent = `${enemy.currentHp} / ${enemy.maxHp} HP`;

    document.getElementById('player-hp').style.width = `${(player.currentHp / player.maxHp) * 100}%`;
    document.getElementById('player-hp-text').textContent = `${player.currentHp} / ${player.maxHp} HP`;

    document.getElementById('btn-potion').textContent = `🧪 Potion (${gameState.inventory.potion})`;
    document.getElementById('btn-capture').textContent = `⚾ Capturer (${gameState.inventory.monsterBall})`;
    document.getElementById('btn-capture').disabled = !battleState.canCapture || gameState.inventory.monsterBall === 0;
}

function attack() {
    if (battleState.turn !== 'player') return;

    const damage = Math.max(1, Math.floor(
        battleState.playerMonster.atk * (1 + battleState.playerMonster.level * 0.1) - 
        battleState.enemy.def * (1 + battleState.enemy.level * 0.05)
    ));

    battleState.enemy.currentHp = Math.max(0, battleState.enemy.currentHp - damage);
    
    showBattleMessage(`${battleState.playerMonster.name} inflige ${damage} dégâts !`);
    updateBattleUI();

    if (battleState.enemy.currentHp === 0) {
        setTimeout(() => endBattle(true), 1500);
        return;
    }

    battleState.canCapture = battleState.enemy.currentHp < battleState.enemy.maxHp * 0.3;
    battleState.turn = 'enemy';
    
    setTimeout(enemyTurn, 1500);
}

function enemyTurn() {
    const damage = Math.max(1, Math.floor(
        battleState.enemy.atk * (1 + battleState.enemy.level * 0.1) - 
        battleState.playerMonster.def * (1 + battleState.playerMonster.level * 0.05)
    ));

    battleState.playerMonster.currentHp = Math.max(0, battleState.playerMonster.currentHp - damage);
    
    showBattleMessage(`${battleState.enemy.name} inflige ${damage} dégâts !`);
    updateBattleUI();

    if (battleState.playerMonster.currentHp === 0) {
        setTimeout(() => endBattle(false), 1500);
        return;
    }

    battleState.turn = 'player';
}

function useItem(itemKey) {
    if (battleState.turn !== 'player' || gameState.inventory[itemKey] <= 0) return;

    const item = ITEMS[itemKey];
    gameState.inventory[itemKey]--;

    if (item.effect === 'heal') {
        const healed = Math.min(
            battleState.playerMonster.maxHp - battleState.playerMonster.currentHp,
            item.value
        );
        battleState.playerMonster.currentHp += healed;
        
        showBattleMessage(`${gameState.player.name} utilise ${item.name} ! +${healed} HP`);
        saveGame();
        updateBattleUI();
        
        battleState.turn = 'enemy';
        setTimeout(enemyTurn, 1500);
    } else if (item.effect === 'capture') {
        const catchRate = item.value * (1 - battleState.enemy.currentHp / battleState.enemy.maxHp);
        const caught = Math.random() < catchRate;

        showBattleMessage(caught ? `${battleState.enemy.name} capturé !` : `${battleState.enemy.name} s'est échappé !`);
        
        if (caught) {
            const newMonster = { ...battleState.enemy, currentHp: battleState.enemy.maxHp, exp: 0 };
            if (gameState.team.length < 6) {
                gameState.team.push(newMonster);
            }
            saveGame();
            setTimeout(() => endBattle(true, true), 1500);
        } else {
            saveGame();
            updateBattleUI();
            battleState.turn = 'enemy';
            setTimeout(enemyTurn, 1500);
        }
    }
}