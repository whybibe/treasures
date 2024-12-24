class TreasureMap {
    static async getInitialClue() {
        const data = await TreasureMap.loadGameData();
        return data['图书馆'];
    }

    static async decodeAncientScript(clue) {
        const data = await TreasureMap.loadGameData();
        return data['神庙'];
    }

    static async searchTemple(location) {
        const data = await TreasureMap.loadGameData();
        return data['守卫'];
    }

    static openTreasureBox() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("恭喜!你找到了传说中的宝藏!");
            }, 1000);
        });
    }

    // 新增的寻宝情节：寻找开启神庙的钥匙
    static async findTempleKey(location) {
        const data = await TreasureMap.loadGameData();
        return data['花园'];
    }

    // 新增的寻宝情节：解开箱子上的魔法封印
    static unsealTreasureBox(box) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const random = Math.random();
                if (random < 0.2) {
                    reject("魔法封印过于强大，无法解开...");
                }
                resolve("成功解开封印，宝藏即将显现...");
            }, 2000);
        });
    }

    static async loadGameData() {
        const response = await fetch('txt/treasurehunt.txt');
        const text = await response.text();
        const data = text.split('\n').reduce((acc, line) => {
            const [key, value] = line.split(': ');
            acc[key] = value;
            return acc;
        }, {});
        return data;
    }
}

function savePlayerInfo(playerId, nickname, history) {
    const playerInfo = { playerId, nickname, history };
    localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
}

function loadPlayerInfo() {
    const playerInfo = localStorage.getItem('playerInfo');
    return playerInfo ? JSON.parse(playerInfo) : null;
}

function* findTreasureGenerator() {
    let playerId = 'player123';
    let nickname = '冒险者';
    let history = [];
    const playerInfo = loadPlayerInfo();
    if(playerInfo) {
        playerId = playerInfo.playerId;
        nickname = playerInfo.nickname;
        history = playerInfo.history;
    }

    const initialClue = yield TreasureMap.getInitialClue();
    displayTreasureHuntProgress(initialClue);
    history.push({ date: new Date(), result: initialClue });
    savePlayerInfo(playerId, nickname, history);

    const location = yield TreasureMap.decodeAncientScript(initialClue);
    displayTreasureHuntProgress(location);
    history.push({ date: new Date(), result: initialClue });
    savePlayerInfo(playerId, nickname, history);

    const templeKey = yield TreasureMap.findTempleKey(location);
    displayTreasureHuntProgress(templeKey);
    history.push({ date: new Date(), result: initialClue });
    savePlayerInfo(playerId, nickname, history);

    const box = yield TreasureMap.searchTemple(location);
    displayTreasureHuntProgress(box);
    history.push({ date: new Date(), result: initialClue });
    savePlayerInfo(playerId, nickname, history);

    const unsealedBox = yield TreasureMap.unsealTreasureBox(box);
    displayTreasureHuntProgress(unsealedBox);
    history.push({ date: new Date(), result: initialClue });
    savePlayerInfo(playerId, nickname, history);

    const treasure = yield TreasureMap.openTreasureBox();
    displayTreasureHuntProgress(treasure);
    history.push({ date: new Date(), result: initialClue });
    savePlayerInfo(playerId, nickname, history);

    history.push({ date: new Date(), result:'找到宝藏'});
    savePlayerInfo(playerId, nickname, history);
}

function runTreasureHuntStep(gen, value) {
    const result = gen.next(value);
    if (result.done) {
        displayTreasureHuntProgress("寻宝完成！");
    } else {
        result.value.then((value) => {
            displayTreasureHuntProgress(value);
            const playerInfo = loadPlayerInfo();
            playerInfo.history.push({ date: new Date(), result: value });
            savePlayerInfo(playerInfo.playerId, playerInfo.nickname, playerInfo.history)
            const startButton = document.getElementById('start-button');
            startButton.textContent = "继续下一步";
            startButton.disabled = false;
        }).catch((error) => {
            displayTreasureHuntProgress(`任务失败: ${error}`);
            const playerInfo = loadPlayerInfo();
            playerInfo.history.push({date: new Date(), result: `任务失败： ${error}`});
            savePlayerInfo(playerInfo.playerId, playerInfo.nickname, playerInfo.history);
        });
    }
}

function displayTreasureHuntProgress(text) {
    const messageBoard = document.getElementById('status-message');
    const progressBar = document.getElementById('progress');
    messageBoard.textContent = text;
    progressBar.style.width = '+=10%';
}

const treasureHuntGen = findTreasureGenerator();

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
    // 在每次点击后立即禁用按钮，防止连续点击
    startButton.disabled = true;
    runTreasureHuntStep(treasureHuntGen);
});
