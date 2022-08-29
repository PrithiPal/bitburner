/** @param {NS} ns */
let ns_global;

export async function main(ns) {
	ns_global = ns;
	const server = ns.args[0];
	const homeAttack = new Attack(server)
	homeAttack.attack();
}


export class Attack{
	constructor(name, executable,ns){
		this.ns_global = ns
		this.name = name
		this.executable = executable
	}

	isAvailable(){
		if(this.ns_global.fileExists(this.name, "home")){
			return true
		}
		return false
	}

	attack(server){
		this.executable(server)
	}
}



export class AttackLauncher {
	constructor(targetServer,ns_global){
		this.targetServer = targetServer
		this.ns_global = ns_global ; 
		this.portsNeeded = this.ns_global.getServerNumPortsRequired(this.targetServer)
		this.attacks = []
	}

	addAttack(attack){
		this.attacks.push(attack)
	}

	canAttack(){
		const hasLevel = this.ns_global.getHackingLevel() >= this.ns_global.getServerRequiredHackingLevel(this.targetServer)
		const attacksAvailable = this.attacks.filter(attack=>attack.isAvailable()).length

		const havePorts = attacksAvailable >= this.portsNeeded
		if (!hasLevel){
			this.ns_global.tprint(`current level ${this.ns_global.getHackingLevel()} < level needed ${this.ns_global.getServerRequiredHackingLevel(this.targetServer)} for '${this.targetServer}. Aborting...'`)
			return false
		}
		if(!havePorts){
			this.ns_global.tprint(`attacks available ${attacksAvailable} > ports needed ${this.portsNeeded} for '${this.targetServer}. Aborting...'`)
			return false
		}
		return true
	}



	attack(){
		if(this.ns_global.hasRootAccess(this.targetServer)){
			this.ns_global.tprint(`Already have root access on '${this.targetServer}'. Aborting...`);
			return false;
		}		
		if(!this.canAttack()){
			return false;
		}

		let attackVector = null ; 
		
		for(let i=0; i<this.portsNeeded; i++){
			attackVector = this.attacks[i] ; 
			this.ns_global.tprint(`${attackVector}`);
			attackVector.attack(this.targetServer) ; 
		}

		this.ns_global.nuke(this.targetServer);

		if(this.ns_global.hasRootAccess(this.targetServer)){
			this.ns_global.tprint(`Hacked and Gained Root Access on '${this.targetServer}'.`);
			return true
		}

		this.ns_global.tprint(`Sorry... Can't hack '${this.targetServer}'.`);
		return false
	}
}