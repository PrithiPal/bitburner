/** @param {NS} ns */


export async function main(ns) {

	const num_threads = ns.args[1]
	const server = ns.args[0]
	ns.tprint("Server to Hack : " + server);
	while (true){
		await ns.weaken(server, {threads : num_threads});
	}
	
}