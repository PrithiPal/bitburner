/** @param {NS} ns */
let ns_global;
import {Attack} from 'attack';

const discoverServer = (server, depth) => {
	let visited = [];
	let path = {};
	discoverServersDFS(path, visited, server, depth)
	return path;
}

const discoverServersDFS = (path, visited, server, depth) => {
	if (depth == 0) {
		return;
	}
	visited.push(server)
	path[server] = []
	const neighbors = ns_global.scan(server)
	neighbors.forEach((child) => {

		if (!visited.includes(child)) {
			if (!path[server].includes(child)) {
				path[server].push(child);
			}
			discoverServersDFS(path, visited, child, depth - 1)
		}
	})
}



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
	
	const depth = 15;
	let servers = []
	const paths = discoverServer("home", depth);
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
	
	const ATTACK = false ; 
	const INSTALL_BACKDOOR = true;

	if (ATTACK === true){
		for(let [server, _] of Object.entries(paths)){
			attackServer = new Attack(server,ns);
			// if (ns_global.hasRootAccess(server)){
			// 	ns_global.installBackdoor(server)
			// }
			if (attackServer.attack()){
				hackedServers += 1;
				// ns_global.installBackdoor(server)
			}
		}
		ns.tprint(`New Hacked Servers : ${hackedServers}`)
	}


}