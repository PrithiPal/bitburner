/** @param {NS} ns */
let ns_global;
import { AttackLauncher, Attack  } from 'attack';
import { discoverServer } from 'discovery'


class Server {
	constructor(name, neighbors) {
		this.name = name;

		this.neighbors = neighbors
		if (neighbors === undefined || neighbors === null) {
			this.neighbors = []
		}

		this.loadValues(name);
	}

	loadValues(name) {
		this.hasRootAccess = ns_global.hasRootAccess(name);
		this.moneyAvailable = ns_global.getServerMoneyAvailable(name);
		this.maxMoneyAvailable = ns_global.getServerMaxMoney(name);
		this.serverSecurity = ns_global.getServerSecurityLevel(name);
		this.usedRam = ns_global.getServerUsedRam(name);
		this.maxRam = ns_global.getServerMaxRam(name);
		this.haveHackingLevel = ns_global.getHackingLevel() > ns_global.getServerRequiredHackingLevel(name) ? "yes" : "no"
		this.numPortsRequire = ns_global.getServerNumPortsRequired(name)
	}

	print() {
		ns_global.tprint(this.name)
		ns_global.tprint(`\thasRootAccess = ${this.hasRootAccess}`)
		ns_global.tprint(`\tmoneyAvailable = ${this.moneyAvailable}`)
		ns_global.tprint(`\tmaxMoneyAvailable = ${this.maxMoneyAvailable}`)
		ns_global.tprint(`\tserverSecurity = ${this.serverSecurity}`)
		ns_global.tprint(`\tusedRam = ${this.usedRam}`)
		ns_global.tprint(`\tmaxRam = ${this.maxRam}`)
		ns_global.tprint(`\thaveHackingLevel = ${this.haveHackingLevel}`)
		ns_global.tprint(`\tnumPortsRequire = ${this.numPortsRequire}`)
		ns_global.tprint(`\tneighbors = ${this.neighbors}`)
	}

}


export async function main(ns) {
	ns_global = ns;
	
	const depth = 50;
	let servers = []
	const paths = discoverServer("home", depth, ns_global);
	Object.keys(paths).forEach(v => servers.push(new Server(v, paths[v])));

	const hackableServers = servers.filter(s => s.haveHackingLevel === "yes")
	const rootServers = servers.filter(s => s.hasRootAccess === true)

	ns.tprint("---- All Servers -----")
	servers.forEach(s => s.print())

	ns.tprint("---- Hackable Servers -----")
	hackableServers.forEach(s => s.print())

	ns.tprint("---- Root Access Servers -----")
	rootServers.forEach(s => s.print())

	let attackServer = null ; 
	let hackedServers = 0;
	
	ns.tprint(paths)
	ns.tprint("---- Summary ---- ");
	ns.tprint(`All Servers : ${servers.length}`)
	ns.tprint(`Hackable Servers : ${hackableServers.length}`)
	
	const ATTACK = true ; 
	const INSTALL_BACKDOOR = true;

	if (ATTACK === true){
		launchAttack(paths,ns)
	}
}


const launchAttack = (serverPaths,ns) => {
	let launcher = null ; 
	let hackedServers = 0 ;
	for(let [server, _] of Object.entries(serverPaths)){

		launcher = new AttackLauncher(server,ns);
		launcher.addAttack(new Attack('BruteSSH.exe', ns_global.brutessh, ns))
		launcher.addAttack(new Attack('FTPCrack.exe', ns_global.ftpcrack, ns))
		launcher.addAttack(new Attack('relaySMTP.exe', ns_global.relaysmtp, ns))
		launcher.addAttack(new Attack('HTTPWorm.exe', ns_global.httpworm, ns))
		launcher.addAttack(new Attack('SQLInject.exe', ns_global.sqlinject, ns))
		
		if (launcher.attack()){
			hackedServers += 1;
		}
	}
	ns_global.tprint(`Newly Hacked Servers : ${hackedServers}`)
}