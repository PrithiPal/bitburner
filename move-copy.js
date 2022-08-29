/** @param {NS} ns */

export async function main(ns) {
	const files = ['servers.js', 'hack.js', 'nodes.js', 'move-copy.js']

	const source = "home"
	const destination = ns.args[0]
	ns.tprint("Source : " + source);
	ns.tprint("Destination : "+ destination );
	ns.tprint("File : " + files);
	await ns.scp(files, destination);

}