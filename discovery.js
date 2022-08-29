/** @param {NS} ns */
export async function main(ns) {

}

export const discoverServer = (server, depth, ns) => {
	let visited = [];
	let path = {};
	discoverServersDFS(path, visited, server, depth, ns)
	return path;
}

const discoverServersDFS = (path, visited, server, depth, ns) => {
	if (depth == 0) {
		return;
	}
	visited.push(server)
	path[server] = []
	const neighbors = ns.scan(server)
	neighbors.forEach((child) => {

		if (!visited.includes(child)) {
			if (!path[server].includes(child)) {
				path[server].push(child);
			}
			discoverServersDFS(path, visited, child, depth - 1, ns)
		}
	})
}