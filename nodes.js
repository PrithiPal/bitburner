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
     for(let idx=0; idx < ns.hacknet.numNodes() ; idx ++){
         mainCluster.addNode(new Node(idx))
     }
 
     const thousand = 1000
     const hundred_k = thousand * 100
     const five_hundred_k = hundred_k * 5
     const million = five_hundred_k * 2
     const five_million = million * 5
     const ten_million = million * five_million
     const hundred_million = ten_million * 10 
     const half_billion = hundred_million * 5
     const billion = half_billion * 2
 
 
     const EMERGENCY_FUND = 1000 // Will spend only if more than this amount.
     const SLEEP_SECONDS = 5 // Time in between the 
     
     while(true){
         mainCluster.refresh()
         buyNewNodes(EMERGENCY_FUND)
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
         ns_global.hacknet.purchaseNode()
         ns_global.tprint(`Purchased New Node! for ${purchaseCost}`)
         return
     }
     ns_global.tprint(`Need ${purchaseCost - availableMoney} money to buy next node`)
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
         [...cluster.getBottomNodes(1,config)].forEach((node)=>{
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
 
     addNode(node){
         this.nodes.push(node)
     }
 
     getAllNodes(){
         return this.nodes 
     }
     
     refresh(){
         this.nodes.forEach(node=>node.loadValues())
     }
 
     getSortedNodes(criteria){
         return [...this.nodes].sort((nodeA,nodeB)=>{
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
             return [...sorted]
         }
         return [...sorted.slice(0,n)]
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
         ns_global.tprint(this.name)
         ns_global.tprint(`\tlevel = ${this.level}`)
         ns_global.tprint(`\tram = ${this.ram}`)
         ns_global.tprint(`\tcores = ${this.cores}`)
         ns_global.tprint(`\tusedRam = ${this.tusedRam}`)
         ns_global.tprint(`\tcache = ${this.cache}`)
         ns_global.tprint(`\tproduction = ${this.production}`)
         ns_global.tprint(`\ttimeOnline = ${this.timeOnline}`)
         ns_global.tprint(`\ttotalProduction = ${this.totalProduction}`)
     }
 
 
     upgradeResource(resource,thresh){
         
         const functionMaps = {
             'ram' : {
                 'cost' : ns_global.hacknet.getRamUpgradeCost,
                 'upgrade' : ns_global.hacknet.upgradeRam
             },
             'level' : {
                 'cost' : ns_global.hacknet.getLevelUpgradeCost,
                 'upgrade' : ns_global.hacknet.upgradeLevel
             },
             'core' : {
                 'cost' : ns_global.hacknet.getCoreUpgradeCost,
                 'upgrade' : ns_global.hacknet.upgradeCore
             }
         }
 
         const purchaseCost = functionMaps[resource]['cost'](this.index,this.cores+1)
         const availableMoney = ns_global.getServerMoneyAvailable("home") - thresh
         if(purchaseCost < availableMoney){
             functionMaps[resource]['upgrade'](this.index,this.cores+1)
             ns_global.tprint(`Upgraded '${this.name}' ${resource} from ${this.cores-1} to ${this.cores}`)
             return true
         }
         ns_global.tprint(`Need ${purchaseCost-availableMoney} to upgrade '${this.cores} Cores'`)
         return false
 
     }
 
 }