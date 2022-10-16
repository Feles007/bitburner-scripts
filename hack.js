export async function main(ns) {
	
	const target = ns.args[0];
	const money_threshold = ns.args[1];
	const security_threshold = ns.args[2];

	while(true) {
		if (ns.getServerSecurityLevel(target) > security_threshold) {
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) > money_threshold) {
			await ns.grow(target);
		} else {
			await ns.hack(target);
		}
	}
}
