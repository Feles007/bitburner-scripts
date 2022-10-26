let no_ram_count = 0;
let no_money_count = 0;

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

	ns.tprint(no_ram_count + " targets have no RAM");
	ns.tprint(no_money_count + " targets have no money");
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

	const purchased_servers = ns.getPurchasedServers();

	// Remove references to home and purchased servers
	const filtered_targets = targets.filter(value => {
		return (value !== "home") && !(purchased_servers.includes(value));
	});
	
	// Remove duplicates and return
	return [...new Set(filtered_targets)];
}
function send_to_target(ns, hack_js_ram, target) {

	// If server has no RAM (somehow?) skip it
	const max_ram = ns.getServerMaxRam(target);
	if (max_ram == 0.0) {
		++no_ram_count;
		return;
	}

	// Skip targets with no money
	if (ns.getServerMaxMoney(target) == 0.0) {
		++no_money_count;
		return;
	}

	// Crack ports
	const ports = ns.getServerNumPortsRequired(target);
	switch (ports) {
		case 5: ns.sqlinject(target);
		case 4: ns.httpworm(target);
		case 3: ns.relaysmtp(target);
		case 2: ns.ftpcrack(target);
		case 1: ns.brutessh(target);
		case 0: break;
		default:
			ns.tprint("Skipped: " + ports + " ports - '" + target + "'");
			return;
	}

	// If hacking skill isn't high enough, print and skip it
	const required_hacking_level = ns.getServerRequiredHackingLevel(target);
	if (required_hacking_level > ns.getHackingLevel()) {
		ns.tprint("Skipped: Requires hacking level of " + required_hacking_level + " '" + target + "'");
		return;
	}
	
	// Get root access
	ns.nuke(target);

	// Remove old hacking script
	ns.rm("hack.js", target);
	// Copy over hacking script
	ns.scp("hack.js", target);

	const threads = Math.floor(max_ram / hack_js_ram);
	
	// Run hack command
	ns.exec(
		"hack.js",
		target,
		threads,
		target,
		ns.getServerMaxMoney(target) * 0.04,
		ns.getServerMinSecurityLevel(target) * 3.5,
	);
}
