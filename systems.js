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
            console.log("Creeps count: " + creeps.length);
            console.log("Colony room: " + colony.components.colony.room);
            let colony_creeps = creeps.filter(creep => creep.components.home_colony.room === colony.components.colony.room );


            // Get spawn
            let spawn = Game.rooms[colony.components.colony.room].find(FIND_MY_SPAWNS)[0];
            

            // For each room source

            let sources = Game.rooms[colony.components.colony.room].find(FIND_SOURCES);

            for (let source of sources) {
                console.log("Source: " + source.id);

                console.log("Colony creeps: " + JSON.stringify(colony_creeps));
                // Get creeps assigned to this source
                let source_creeps = colony_creeps.filter(creep => creep.components.source.id === source.id);

                console.log("Source creeps: " + source_creeps.length);



                console.log("Creeps: " + JSON.stringify(source_creeps));

                if (creeps.length < 0) {


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
                    console.log("Spawned creep: " + creep_name);
                    break;

                }


            }
            

            // Get spawn
            
            /*
            if (creepCount < 0) {

                // Spawn Creep
                let creep_name = colony.id + '_' + Math.random().toString(36).substring(2, 15);
                let result = spawn.spawnCreep([WORK, CARRY, MOVE], creep_name);

                // Skip entity creation if spawn fails
                if (result !== OK) {
                    continue;
                }
                console.log("Spawned creep: " + creep_name);


                // Create entity
                let entity = Entities.new();

                // Add components
                Components.creep.add(entity, creep_name); // This is a creep
                Components.home_colony.add(entity, colony.id); // Creep has a home room
                Components.pending_gameobject_creep.add(entity); // Creep is waiting for a gameobject

            }
            */

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
            if (!Game.getObjectById(entity.components.gameobject)) {
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