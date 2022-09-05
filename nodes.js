/** @param {NS} ns */
/**
 * Goal : Upgrade and Boost Hacknet Nodes
 * Approach
 * 1. Choose property
 * 2. Get list of values of this property across all nodes.
 * 3. Choose the lowest property value and its index (node index)
 * 4. If enough money to upgrade this then upgrade.
 * 5. Otherwise choose another property and repeat all the steps.
 * 6. IF none of the property and none the value is affordable at this time. Just try in few iterations.
 */


let ns_global ; 

export async function main(ns) {
    ns_global = ns
    const mainCluster = new Cluster('mainCluster') 
    mainCluster.reloadAllNodes()

    const thousand = 1000
    const hundred_k = thousand * 100
    const five_hundred_k = hundred_k * 5
    const million = five_hundred_k * 2
    const five_million = million * 5
    const ten_million = million * five_million
    const hundred_million = ten_million * 10 
    const half_billion = hundred_million * 5
    const billion = half_billion * 2


    const EMERGENCY_FUND = 10 // Will spend only if more than this amount.
    const SLEEP_SECONDS = 0 // Time in between the 
    
    let newNodeIdx = -1 ; 
    while(true){
        newNodeIdx = buyNewNodes(EMERGENCY_FUND)
        if (newNodeIdx !== -1){
            ns_global.tprint(`buying new node ${newNodeIdx}`)
            mainCluster.addNode(newNodeIdx)
            
        }
        upgradeBottomNodes(mainCluster, EMERGENCY_FUND)
        await ns_global.sleep(SLEEP_SECONDS*1000);
    }
     // mainCluster.getBottomNodes(5,'ram').forEach((node)=>ns.tprint(`${node.name} : ${node.ram}`))
     // mainCluster.getBottomNodes(5,'level').forEach((node)=>ns.tprint(`${node.name} : ${node.level}`))
     // mainCluster.getBottomNodes(5,'cores').forEach((node)=>ns.tprint(`${node.name} : ${node.cores}`))
}
 
 
 
 
const buyNewNodes = (thresh) => {
    const purchaseCost = ns_global.hacknet.getPurchaseNodeCost()
    const availableMoney = ns_global.getServerMoneyAvailable("home") - thresh
    if (purchaseCost < availableMoney){
        const index = ns_global.hacknet.purchaseNode()
        ns_global.print(`Purchased New Node! for ${purchaseCost}`)
        return index
    }
    return -1
}
 
 
 
 /**
  * Round Robin -> Find Lowest config in order : Ram -> Level -> Core
  * If enough money for config -> Upgrade.
  * Move to next node
  * Max Upgrade in single turn ? - input variable.
  */
const upgradeBottomNodes = (cluster, thresh) =>{
    const upgradeConfig = ['level', 'ram', 'core']
    upgradeConfig.forEach((config)=>{	
        cluster.getBottomNodes(ns_global.hacknet.numNodes(),config).forEach((node)=>{
            if(config === 'level'){
                node.upgradeResource('level', thresh)
            }
            else if(config === 'ram'){
                node.upgradeResource('ram', thresh)
            }
            else if(config === 'core'){
                node.upgradeResource('core', thresh)
            }
            
        })
    })
}
 
 
 class Cluster{
    constructor(name){
        this.name = name
        this.nodes = []
    }

    reloadAllNodes(){
        for(let idx=0; idx < ns_global.hacknet.numNodes() ; idx ++){
            this.addNode(new Node(idx))
        }
    }

    addNode(node){
        this.nodes.push(node)
    }

    getAllNodes(){
        return this.nodes 
    }
 
 
    getSortedNodes(criteria){
        return this.nodes.sort((nodeA,nodeB)=>{
                if(nodeA.stats[criteria]>nodeB.stats[criteria]){
                    return -1
                }
                else if(nodeA.stats[criteria]<nodeB.stats[criteria]){
                    return 1
                }
                else{
                    return 0
                }
            }
        )
    }
    
    getTopNodes(n, criteria){
        const sorted = this.getSortedNodes(criteria)
        if (n===-1){
            return sorted
        }
        return [...sorted.slice(0,n)]
    }

    getBottomNodes(n, criteria){
        const sorted = this.getSortedNodes(criteria).reverse()
        if (n===-1){
            return sorted
        }
        return sorted.slice(0,n)
    }
 }
 
class Node{
    constructor(index){
        this.index = index	
        this.loadValues()
    }

    loadValues(){
        this.stats = ns_global.hacknet.getNodeStats(this.index)
        this.name = this.stats['name']
        this.level = this.stats['level']
        this.ram = this.stats['ram']
        this.cores = this.stats['cores']
        this.cache = this.stats['cache']
        this.hashCapacity = this.stats['hashCapacity']
        this.production = this.stats['production']
        this.timeOnline = this.stats['timeOnline']
        this.totalProduction = this.stats['totalProduction']
    }

    print() {
        ns_global.print(this.name)
        ns_global.print(`\tlevel = ${this.level}`)
        ns_global.print(`\tram = ${this.ram}`)
        ns_global.print(`\tcores = ${this.cores}`)
        ns_global.print(`\tusedRam = ${this.tusedRam}`)
        ns_global.print(`\tcache = ${this.cache}`)
        ns_global.print(`\tproduction = ${this.production}`)
        ns_global.print(`\ttimeOnline = ${this.timeOnline}`)
        ns_global.print(`\ttotalProduction = ${this.totalProduction}`)
    }
 
 
    upgradeResource(resource,thresh){
        this.loadValues()
        const functionMaps = {
            'ram' : {
                'cost' : ns_global.hacknet.getRamUpgradeCost,
                'upgrade' : ns_global.hacknet.upgradeRam,
                'current' : this.ram
            },
            'level' : {
                'cost' : ns_global.hacknet.getLevelUpgradeCost,
                'upgrade' : ns_global.hacknet.upgradeLevel,
                'current' : this.level
            },
            'core' : {
                'cost' : ns_global.hacknet.getCoreUpgradeCost,
                'upgrade' : ns_global.hacknet.upgradeCore,
                'current' : this.cores
            }
        }

        const currentResource = functionMaps[resource]['current']
        const purchaseCost = functionMaps[resource]['cost'](this.index,1)
        const availableMoney = ns_global.getServerMoneyAvailable("home") - thresh
        if(purchaseCost < availableMoney){
            functionMaps[resource]['upgrade'](this.index,1)
            ns_global.print(`Upgraded '${this.name}' ${resource} from ${currentResource-1} to ${currentResource}  for Node ${this.index}`)
            return true
        }
        //ns_global.print(`Need ${purchaseCost-availableMoney} to upgrade '${currentResource} ${resource}' for Node ${this.index}`)
        return false
    }
}