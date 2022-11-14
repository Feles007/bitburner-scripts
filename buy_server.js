const BASE_SERVER_NAME = "";

export async function main(ns) {
	const max_ram = ns.getPurchasedServerMaxRam();

	const player_money = ns.getServerMoneyAvailable("home");
	const required_money = ns.getPurchasedServerCost(max_ram);

	if (required_money <= player_money) {
		ns.purchaseServer(BASE_SERVER_NAME, 1048576);
	} else {
		ns.tprint("Need $" + required_money);
	}
}
