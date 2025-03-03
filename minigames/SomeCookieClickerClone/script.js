let waterCount = 0;
let waterPerClick = 1;

const upgrades = [
    { name: 'Bottle', cost: 10, increment: 1, amount: 0},
    { name: 'Jug', cost: 100, increment: 10, amount: 0},
    { name: 'Tank', cost: 1000, increment: 100, amount: 0}
];

class Shop {
    constructor(upgrades) {
        this.upgrades = upgrades;
    }

    updateShop() {
        for (let i = 0; i < this.upgrades.length; i++) {
            const upgrade = this.upgrades[i];
            console.log(upgrade);
        }
        document.getElementById('bottleCount').innerText = this.upgrades[0].amount;
        document.getElementById('bottleCost').innerText = this.upgrades[0].cost;
        document.getElementById('jugCount').innerText = this.upgrades[1].amount;
        document.getElementById('jugCost').innerText = this.upgrades[1].cost;
        document.getElementById('tankCount').innerText = this.upgrades[2].amount;
        document.getElementById('tankCost').innerText = this.upgrades[2].cost;
    }

    buyUpgrade(upgradeIndex) {
        const upgrade = this.upgrades[upgradeIndex];
        if (waterCount >= upgrade.cost) {
            waterCount -= upgrade.cost;
            upgrade.amount++;
            upgrade.cost = Math.floor(upgrade.cost * 1.15); // Increase cost for next purchase
            updateWaterCount();
            this.updateShop();
        }
    }
}

function updateWaterCount() {
    document.getElementById('waterCount').innerText = waterCount;
}

function clickWater() {
    waterCount += waterPerClick;
    updateWaterCount();
}

function autoCollect() {
    for (let i = 0; i < upgrades.length; i++) {
        waterCount += upgrades[i].amount * upgrades[i].increment;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const shop = new Shop(upgrades);
    document.getElementById('water').addEventListener('click', clickWater);
    document.getElementById('buyBottle').addEventListener('click', () => shop.buyUpgrade(0));
    document.getElementById('buyJug').addEventListener('click', () => shop.buyUpgrade(1));
    document.getElementById('buyTank').addEventListener('click', () => shop.buyUpgrade(2));
    updateWaterCount();
    shop.updateShop();
    setInterval(updateWaterCount, 500);
    setInterval(autoCollect, 1000)
});