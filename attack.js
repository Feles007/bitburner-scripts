/** @param {NS} ns */
export async function main(ns) {

	const target = "";
	const total_ram = 1024;

	const hack_js_ram = ns.getScriptRam("hack.js");
	const max_ram = total_ram - ns.getScriptRam("attack.js");
	const threads = Math.floor(max_ram / hack_js_ram);

	ns.run(
		"hack.js",
		threads,
		target,
		ns.getServerMaxMoney(target) * 0.3,
		ns.getServerMinSecurityLevel(target) * 3.5,
	);
}
