export async function main(ns) {

	const hack_js_ram = ns.getScriptRam("hack.js");

	const targets = get_targets(ns);

	if (ns.args[0] == "kill") {
		for (let i = 0; i < targets.length; ++i) {
			ns.killall(targets[i]);
		}
		return;
	}

	for (let i = 0; i < targets.length; ++i) {
		send_to_target(ns, hack_js_ram, targets[i]);
	}
}
function get_targets(ns) {

	let targets = [];

	const get_targets_internal = (ns, target) => {
		const new_targets = ns.scan(target);

		for (let i = 0; i < new_targets.length; ++i) {
			if (!targets.includes(new_targets[i])) {
				targets.push(new_targets[i]);
				get_targets_internal(ns, new_targets[i]);
			}
		}
	};

	get_targets_internal(ns, "home");

	const filtered_targets = targets.filter(value => value !== "home");
	
	return [...new Set(filtered_targets)];
}
function send_to_target(ns, hack_js_ram, target) {

	const ports = ns.getServerNumPortsRequired(target);

	switch (ports) {
		case 1:
			ns.brutessh(target);
		case 0:
			break;
		default:
			ns.tprint("Skipped: " + ports + " ports - '" + target + "'");
			return;
	}
	
	ns.nuke(target);
	ns.scp("hack.js", target);

	const max_ram = ns.getServerMaxRam(target);
	const threads = Math.floor(max_ram / hack_js_ram);
	
	ns.exec(
		"hack.js",
		target,
		threads,
		target,
		ns.getServerMaxMoney(target) * 0.3,
		ns.getServerMinSecurityLevel(target) * 3.5,
	);
}
