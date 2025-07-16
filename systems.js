var Entities = require('./entities');
var Components = require('./components');
var Util = require('./util');

module.exports = {


    spawnSystem: function() {
        
        let colonies = Entities.query([Components.colony.id], []).entities;

        // Get all creeps
        let creeps = Entities.query([Components.creep.id], []).entities;






        for (let colony of colonies) {

            // Get creeps in this colony
            let colony_creeps = creeps.filter(creep => creep.components.home_colony.room === colony.components.colony.room );

            // Get spawn
            let spawn = Game.rooms[colony.components.colony.room].find(FIND_MY_SPAWNS)[0];
            
            // For each room source
            let sources = Game.rooms[colony.components.colony.room].find(FIND_SOURCES);



            // Spawn Basic Creeps
            for (let source of sources) {

                // Get creeps assigned to this source
                let source_creeps = colony_creeps.filter(creep => creep.components.source.id === source.id);

                if (source_creeps.length < 1) {


                    // Spawn creep
                    let creep_name = colony.components.colony.room + '_' + Math.random().toString(36).substring(2, 5);
                    let result = spawn.spawnCreep([WORK, CARRY, CARRY, MOVE, MOVE], creep_name);

                    if (result !== OK) {
                        break;
                    }

                    // Create entity
                    let entity = Entities.new();
                    Components.creep.add(entity, creep_name);
                    Components.source.add(entity, source.id);
                    Components.home_colony.add(entity, colony.components.colony.room);
                    Components.pending_gameobject_creep.add(entity);
                    Components.creep_type_basic.add(entity);
                    Components.move_to.add(entity, source.pos);
                    console.log("Spawned creep: " + creep_name);
                    break;

                }


            }
            



        }
    },

    creep_job_system: function () {

        // Get all
        let result = Entities.query(
            [Components.creep_type_basic.id, Components.gameobject.id, Components.source.id],
            [Components.move_to.id, Components.harvest.id, Components.deposit_any.id]);
        
        for (let entity of result.entities) {

            let creep = Game.getObjectById(entity.components.gameobject.id);



            if (creep) {
                console.log("Creep: " + creep.name + " energy: " + creep.store.getUsedCapacity());

                // If creep has energy, deposit
                if (creep.store.getUsedCapacity() > 0) {
                    Components.deposit_any.add(entity);
                }

                // If creep has no energy, harvest
                if (creep.store.getUsedCapacity() === 0) {
                    Components.harvest.add(entity);
                }

            }

        }

    },


    harvestSystem: function () {

        let result = Entities.query([Components.gameobject.id, Components.harvest.id], []);

        for (let entity of result.entities) {

            let creep = Game.getObjectById(entity.components.gameobject.id);
            let source = Game.getObjectById(entity.components.source.id);



            // Check if creep is full
            if (creep.store.getFreeCapacity() === 0) {
                Components.harvest.remove(entity);
                continue;
            }

            // 
            if (creep && source) {
                let result = creep.harvest(source);
                if (result === OK) continue;

                if (result === ERR_NOT_IN_RANGE) {
                    Components.move_to.add(entity, source.pos);
                }

                if (result === ERR_TIRED) continue;

                console.log("ERR: Unexpected harvest result, creep: " + creep.name + " source: " + source.id + " result: " + result);
            
            } else {
                console.log("ERR: Creep or source not found, creep: " + creep.name + " source: " + source.id);
            }

        }


    },

    depositSystem: function () {

        let result = Entities.query([Components.gameobject.id, Components.deposit_any.id], [Components.move_to.id]);

        for (let entity of result.entities) {
            
            // Get Creep object
            let creep = Game.getObjectById(entity.components.gameobject.id);
            if (!creep) {
                console.log("ERR: Creep not found, entity: " + entity.components.gameobject.id);
                continue;
            }

            // Get target
            let target = Game.getObjectById(entity.components.deposit_any.target_id);


            // If no target, select a target and move to it
            if (!target) {
                console.log("Selecting target for creep: " + creep.name);


                // Check for any spawns with free capacity
                let spawns = Game.rooms[creep.room.name].find(FIND_MY_SPAWNS);

                for (let spawn of spawns) {
                    if (spawn.store.getFreeCapacity() > 0) {
                        entity.components.deposit_any.target_id = spawn.id;
                        Components.move_to.add(entity, spawn.pos);
                        continue;
                    }
                }

                // If no other targets, select the controller
                controller = Game.rooms[creep.room.name].controller;
                entity.components.deposit_any.target_id = controller.id;
                Components.move_to.add(entity, controller.pos);
                continue;

            }



            console.log("Depositing to target: " + JSON.stringify(target));
            
            if (target) {
                if (target.structureType === STRUCTURE_SPAWN) {
                    console.log("Depositing to spawn for creep: " + creep.name);
                    let result = creep.transfer(target, RESOURCE_ENERGY);
                } else if (target.structureType === STRUCTURE_CONTROLLER) {
                    console.log("Depositing to controller for creep: " + creep.name);
                    let result = creep.transfer(target, RESOURCE_ENERGY);
                } else {
                    console.log("ERR: Invalid target type: " + target.structureType);
                }
                console.log("Deposit result: " + result);
            } else {
                console.log("ERR: No target found for creep: " + creep.name);
            }
        }

    },

    moveToSystem: function () {

        // Get all creeps that are moving to a position and have a gameobject
        let result = Entities.query([Components.creep.id, Components.move_to.id, Components.gameobject.id], []);

        

        // Process moveto for all creeps
        for (let entity of result.entities) {


            // Get creep gameobject
            let creep = Game.getObjectById(entity.components.gameobject.id);
            

            if (creep) {

                // Check if should stop moving
                let pos = entity.components.move_to.pos;
                let creep_pos = creep.pos;

                if (entity.components.move_to.exact) {
                    if (creep_pos.x === pos.x && creep_pos.y === pos.y) {
                        Components.move_to.remove(entity);
                        continue;
                    }
                }

                if (!entity.components.move_to.exact) {
                    if ((creep_pos.x === pos.x + 1 || creep_pos.x === pos.x - 1) && 
                        (creep_pos.y === pos.y + 1 || creep_pos.y === pos.y - 1)) {
                        Components.move_to.remove(entity);
                        continue;
                    }
                }


                // Move creep to position
                let result = creep.moveTo(pos.x, pos.y);

            }


            
        }
    },


    creepCountSystem: function() {

        let result = Entities.query(['creep'], []);

        console.log("Creep count: " + result.entities.length);

    },
    


    // Creeps gameobjects do not appear immediately, so we need to wait for them
    assignGameobjectSystem: function() {


        // Get all creeps that are waiting for a gameobjects
        let result = Entities.query([
            Components.pending_gameobject_creep.id, 
            Components.creep.id], 
            []);

        
        for (let entity of result.entities) {

            let c_wait_for_gameobject_creep = entity.components.pending_gameobject_creep;
            let c_creep = entity.components.creep;

            // Try getting gameobject of creep
            let object = Game.getObjectById(Game.creeps[c_creep.name].id);
            

            // If gameobject is found, add gameobject component
            if (object) {
                console.log("Gameobject found for creep: " + c_creep.name);
                Components.gameobject.add(entity, object.id);
                Components.pending_gameobject_creep.remove(entity);
                continue;
            }


            // If gameobject is not found, check if max wait time has been reached
            // If so, remove the entity
            if (Game.time - c_wait_for_gameobject_creep.created > c_wait_for_gameobject_creep.max_wait_time) {
                Components.pending_gameobject_creep.remove(entity);
                console.log("Max wait time reached for creep: " + c_creep.name);
                Entities.delete(entity);
                continue;
            }
        }

    },

    
    removeDeadCreepsSystem: function() {

        let result = Entities.query([Components.creep.id, Components.gameobject.id], []);

        for (let entity of result.entities) {
            if (!Game.getObjectById(entity.components.gameobject.id)) {
                Entities.delete(entity); // Mark entity for deletion
                console.log("Removed dead creep: " + entity.components.creep.name);
            }
        }
    },
    

    consoleCommandsSystem: function() {

        // Check the for any commands 
        // Commands format is Memory.commands.<command> = "argument"


        // Example: Memory.commands.add_colony = { room: "W8N3", name: "Screepburg" }
        // Example: Memory.commands.remove_colony = { room: "W8N3" }
        // Example: Memory.commands.add_remote_room = { home: "W8N3", remote: "W8N4" }


        // Grab commands from memory and reset them
        let commands = _.cloneDeep(Memory.commands);
        Memory.commands = {
            add_colony: null,
            remove_colony: null,
            add_remote_room: null,
        }




        // Add Colony
        // Example: Memory.commands.add_colony = { room: "W8N3", name: "Screepburg" }
        if (commands.add_colony) {

            // Check if room name is valid
            if (!Util.isValidRoomName(commands.add_colony.room)) {
                console.log("Invalid room name: " + commands.add_colony.room);
                return;
            }

            // Check if colony already exists
            let query = Entities.query([Components.colony.id], []);
            for (let entity of query.entities) {
                if (entity.components.colony.room === commands.add_colony.room) {
                    console.log("Colony already exists: " + commands.add_colony.room);
                    return;
                }
            }

            // Create colony
            let entity = Entities.new();
            Components.colony.add(entity, commands.add_colony.name, commands.add_colony.room);
            console.log("Created colony: " + commands.add_colony.room);
            
        }

        // Remove Colony
        // Example: Memory.commands.remove_colony = { room: "W8N3" }
        if (commands.remove_colony) {

            // Check if colony exists
            let query = Entities.query([Components.colony.id], []);
            for (let entity of query.entities) {
                if (entity.components.colony.room === commands.remove_colony.room) {
                    Entities.delete(entity);
                    console.log("Removed colony: " + commands.remove_colony.room);
                }
            }
        }










    },





};