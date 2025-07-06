var _ = require('lodash');


// Init Memory
if (!Memory.colony) {
    Memory.colony = [];

    // Add new rooms to Memory.colony
    for (let roomName in Game.rooms) {

        // Check if room contains spawns
        if (Game.rooms[roomName].find(FIND_MY_SPAWNS).length > 0) {
            console.log("Adding room to Memory.colony: " + roomName);
            Memory.colony.push({
                name: roomName,
                homeRoom: roomName,
            });
        }
    }
}






// Run colony logic
for (let colony of Memory.colony) {

    // Spawns
    let spawns = Game.rooms[colony.homeRoom].find(FIND_MY_SPAWNS);

    // Harvest Creeps Spawn
    let harvestCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === "harvester");
    let harvestCreepsA = _.filter(harvestCreeps, (creep) => creep.memory.roleType === "basic");

    console.log(harvestCreepsA.length);


    // Sources 

    let sources = Game.rooms[colony.homeRoom].find(FIND_SOURCES);

    for (let source of sources) {

        // Get creeps for this source
        let sourceCreeps = _.filter(harvestCreepsA, (creep) => creep.memory.source === source.id);

        if (sourceCreeps.length < 4) {
            console.log("Spawning harvester_basic for source: " + source.id);
            spawns[0].spawnCreep([WORK, CARRY, CARRY, MOVE, MOVE], "harvester_basic_" + Game.time, {
                memory: { role: "harvester", roleType: "basic", colony: colony.name, source: source.id }
            });
        }

    }


}


// Creep logic

for (creep in Game.creeps) {

    creep = Game.creeps[creep];
    if (creep.memory.roleType === "basic") {
        console.log("Harvester: " + creep.name + " - " + creep.memory.source);


        let source = Game.getObjectById(creep.memory.source);


        // Init State
        if (!creep.memory.state) {
            creep.memory.state = "harvesting";
        }




        // Update state
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
            creep.memory.state = "depositing";
        }

        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = "harvesting";
        }



        // Try to deposit energy
        if (creep.memory.state === "depositing") {


            let spawns = Game.rooms[creep.memory.colony].find(FIND_MY_SPAWNS);

            let foundEmptySpawn = false;
            for (let spawn of spawns) {
                

                if (spawn.store[RESOURCE_ENERGY] < spawn.energyCapacity) {

                    console.log("Depositing energy to " + spawn.name);

                    foundEmptySpawn = true;


                    let transferResult = creep.transfer(spawn, RESOURCE_ENERGY);
                    
                    if (transferResult === ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawn, {
                            visualizePathStyle: {
                                stroke: "#ffaa00"
                            }
                        });
                    } else if (transferResult === OK) {
                        // Successfully transferred energy
                        creep.memory.state = "harvesting";
                    }


                    break;
                }

                
            }

            if (!foundEmptySpawn) {
                creep.memory.state = "upgrading";
            }


        }



        // Try to harvest energy
        if (creep.memory.state === "harvesting") {

            let harvResult = creep.harvest(source);

            if (harvResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: {
                        stroke: "#ffaa00"
                    }
                });
            }

            

        }


        if (creep.memory.state === "upgrading") {
            console.log("Upgrading");


            let upgradeResult = creep.upgradeController(Game.rooms[creep.memory.colony].controller);
            
            if (upgradeResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.rooms[creep.memory.colony].controller, {
                    visualizePathStyle: {
                        stroke: "#ffaa00"
                    }
                });
            }   



        }


        

    }





}






// Remove dead creeps from Memory
for (let creepName in Memory.creeps) {
    if (!(Game.creeps[creepName])) {
        delete Memory.creeps[creepName];
    }
}