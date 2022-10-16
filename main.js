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

	// Remove references to home
	const filtered_targets = targets.filter(value => value !== "home");
	
	// Remove duplicates and return
	return [...new Set(filtered_targets)];
}
function send_to_target(ns, hack_js_ram, target) {

	// Crack ports
	const ports = ns.getServerNumPortsRequired(target);
	switch (ports) {
		case 2:
			ns.ftpcrack(target);
		case 1:
			ns.brutessh(target);
		case 0:
			break;
		default:
			ns.tprint("Skipped: " + ports + " ports - '" + target + "'");
			return;
	}
	
	// Get root access
	ns.nuke(target);
	// Copy over hacking script
	ns.scp("hack.js", target);

	// If server has no RAM (somehow?) print and skip it
	const max_ram = ns.getServerMaxRam(target);
	if (max_ram == 0.0) {
		ns.tprint("Skipped: No RAM - '" + target + "'");
		return;
	}
	const threads = Math.floor(max_ram / hack_js_ram);
	
	// If hacking skill isn't high enough, print and skip it
	if (ns.getServerRequiredHackingLevel(target) > ns.getHackingLevel()) {
		ns.tprint("Skipped: Hacking level too low - '" + target + "'");
		return;
	}
	
	// Run hack command
	ns.exec(
		"hack.js",
		target,
		threads,
		target,
		ns.getServerMaxMoney(target) * 0.3,
		ns.getServerMinSecurityLevel(target) * 3.5,
	);
}
