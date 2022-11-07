/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		if (upgrade(ns)) {
			await ns.sleep(100);
		}
	}
}

const MAX_LEVEL = 200;
const MAX_RAM = 64;
const MAX_CORES = 16;

const BUY_NODE = 0;
const UPGRADE_LEVEL = 1;
const UPGRADE_RAM = 2;
const UPGRADE_CORES = 3;

/** @param {NS} ns */
function upgrade(ns) {

	const num_nodes = ns.hacknet.numNodes();

	let cheapest = ns.hacknet.getPurchaseNodeCost();
	let index = -1;
	let upgrade_type = BUY_NODE;

	for (let node_index = 0; node_index < num_nodes; ++node_index) {
		const stats = ns.hacknet.getNodeStats(node_index);

		if (stats.level < MAX_LEVEL) {
			const upgrade_cost = ns.hacknet.getLevelUpgradeCost(node_index, 1);
			if (upgrade_cost < cheapest) {
				cheapest = upgrade_cost;
				index = node_index;
				upgrade_type = UPGRADE_LEVEL;
			}
		}

		if (stats.ram < MAX_RAM) {
			const upgrade_cost = ns.hacknet.getRamUpgradeCost(node_index, 1);
			if (upgrade_cost < cheapest) {
				cheapest = upgrade_cost;
				index = node_index;
				upgrade_type = UPGRADE_RAM;
			}
		}

		if (stats.cores < MAX_CORES) {
			const upgrade_cost = ns.hacknet.getCoreUpgradeCost(node_index, 1);
			if (upgrade_cost < cheapest) {
				cheapest = upgrade_cost;
				index = node_index;
				upgrade_type = UPGRADE_CORES;
			}
		}
	}

	if (ns.getServerMoneyAvailable("home") < cheapest) {
		return true;
	}

	switch (upgrade_type) {
		case BUY_NODE:
			if (ns.hacknet.purchaseNode() === -1) throw "BUY_NODE";
			break;
		case UPGRADE_LEVEL:
			if (!ns.hacknet.upgradeLevel(index, 1)) throw "UPGRADE_LEVEL";
			break;
		case UPGRADE_RAM:
			if (!ns.hacknet.upgradeRam(index, 1)) throw "UPGRADE_RAM";
			break;
		case UPGRADE_CORES:
			if (!ns.hacknet.upgradeCore(index, 1)) throw "UPGRADE_CORES";
			break;
		default:
			throw upgrade_type;
	}

	return false;
}
