let programs;
let usable_ports;

export async function main(ns) {

	programs = {
		brute_ssh: false,
		ftp_crack: false,
		relay_smtp: false,
		http_worm: false,
		sql_inject: false,
	};
	usable_ports = 0;

	const targets = get_targets(ns);

	get_programs(ns);

	if (ns.args.length != 1) {
		ns.tprint("Invalid args");
	}

	switch (ns.args[0]) {
		case "kill":
			for (let i = 0; i < targets.length; ++i) {
				ns.killall(targets[i]);
			}
			break;
		case "attack":
			for (let i = 0; i < targets.length; ++i) {
				send_to_target(ns, targets[i]);
			}
			break;
		case "deploy":
			deploy(ns, targets);
			break;
		default:
			ns.tprint("Unknown subcommand");
	}
}
function get_programs(ns) {
	if (ns.fileExists("BruteSSH.exe")) {
		programs.brute_ssh = true;
		++usable_ports;
	}
	if (ns.fileExists("FTPCrack.exe")) {
		programs.ftp_crack = true;
		++usable_ports;
	}
	if (ns.fileExists("relaySMTP.exe")) {
		programs.relay_smtp = true;
		++usable_ports;
	}
	if (ns.fileExists("HTTPWorm.exe")) {
		programs.http_worm = true;
		++usable_ports;
	}
	if (ns.fileExists("SQLInject.exe")) {
		programs.sql_inject = true;
		++usable_ports;
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

	const purchased_servers = ns.getPurchasedServers();

	// Remove references to home and purchased servers
	const filtered_targets = targets.filter(value => {
		return (value !== "home") && !(purchased_servers.includes(value));
	});
	
	// Remove duplicates and return
	return [...new Set(filtered_targets)];
}
function send_to_target(ns, target) {

	// Crack ports
	if (programs.brute_ssh) ns.brutessh(target);
	if (programs.ftp_crack) ns.ftpcrack(target);
	if (programs.relay_smtp) ns.relaysmtp(target);
	if (programs.http_worm) ns.httpworm(target);
	if (programs.sql_inject) ns.sqlinject(target);

	const ports_required = ns.getServerNumPortsRequired(target);
	if (ports_required <= usable_ports) {
		ns.nuke(target);
	}

	// If server has no RAM (somehow?) skip it
	const max_ram = ns.getServerMaxRam(target);
	if (max_ram == 0.0) {
		return;
	}

	// Skip targets with no money
	if (ns.getServerMaxMoney(target) == 0.0) {
		return;
	}

	// Skip if not enough ports
	if (ports_required > usable_ports) {
		ns.tprint("Skipped: " + ports_required + " ports - '" + target + "'");
		return;
	}

	// If hacking skill isn't high enough, print and skip it
	const required_hacking_level = ns.getServerRequiredHackingLevel(target);
	if (required_hacking_level > ns.getHackingLevel()) {
		ns.tprint("Skipped: Requires hacking level of " + required_hacking_level + " '" + target + "'");
		return;
	}

	// Remove old hacking script
	ns.rm("hack.js", target);
	// Copy over hacking script
	ns.scp("hack.js", target);

	const hack_js_ram = ns.getScriptRam("hack.js");
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
function deploy(ns, targets) {

	targets.sort((a, b) => ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a));

	const purchased_servers = ns.getPurchasedServers().reverse();
	
	const hack_js_ram = ns.getScriptRam("hack.js");

	for (let i = 0; i < purchased_servers.length; ++i) {
		
		const target = targets[i];
		const server = purchased_servers[i];

		const threads = Math.floor(ns.getServerMaxRam(server) / hack_js_ram);

		ns.killall(server);
		ns.scp("hack.js", server);
		ns.exec(
			"hack.js",
			server,
			threads,
			target,
			ns.getServerMaxMoney(target) * 0.3,
			Math.min(90, ns.getServerMinSecurityLevel(target) * 3.5),
		);
	}
}
