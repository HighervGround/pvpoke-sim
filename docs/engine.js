// PvPoke battle engine (github.com/pvpoke/pvpoke), concatenated in the same order as pvpoke_harness.js.
// See PVPOKE_LICENSE for the upstream license.
// JavaScript Document

var GameMaster = (function () {
    var instance;

    function createInstance(interface) {
        var object = new Object();

		object.data = {};
		object.rankings = [];
		object.trainRankings = [];
		object.groups = [];
		object.teamPools = [];
		object.loadedData = 0;
		// maps battle cp to list all pokemon objects for that cp
		object.allPokemon = {}
		object.pokemonMap = {};
		object.pokeSelectList = [];
		object.moveMap = {};

		object.originalData = {};

		var gmVersion = "gamemaster";

		// By default, load the minified version
		if((gmVersion == "gamemaster")&&(host.indexOf("localhost") == -1)){
			gmVersion = "gamemaster.min";
		}

		console.log("loading gamemaster");

		$.ajax({
			dataType: "json",
			url: webRoot+"data/"+gmVersion+".json?v="+siteVersion,
			mimeType: "application/json",
			error: function(request, error) {
				console.log("Request: " + JSON.stringify(request));
				console.log(error);
			},
			success: function( data ) {
				object.data = data;
				object.originalData = {...object.data}; // Soft copy original data for custom gamemaster comparison

				console.log("gamemaster loaded");

				// Insert cup and format values into cup and format select dropdowns
				if(typeof updateFormatSelect === "function"){
					updateFormatSelect(object.data.formats, InterfaceMaster.getInstance());
				}

				if(typeof updateCupSelect === "function"){
					updateCupSelect(object.data.formats, InterfaceMaster.getInstance());
				}

				// Insert format links into ranking submenu
				var formats = object.data.formats;

				for(var i = formats.length - 1; i >= 0; i--){
					if(formats[i].showFormat && ! formats[i].hideRankings && formats[i].title != "Custom"){
						var $link = $("<a href=\""+(host + "rankings/" + formats[i].cup + "/" + formats[i].cp + "/overall/"+"\">"+formats[i].title+"</a>"));
						$link.insertAfter($(".icon-rankings + .submenu a").eq(2));
					}
				}

				object.createSearchMaps();

				if(settings.gamemaster == "gamemaster"){
					// Sort Pokemon alphabetically for searching
					object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

					object.createPokeSelectList();

					if(typeof InterfaceMaster !== 'undefined'){
						InterfaceMaster.getInstance().init(object);
					}

					if(typeof customRankingInterface !== 'undefined'){
						customRankingInterface.init(object);
					}
				} else{
					// Load custom gamemaster from local storage
					let content = window.localStorage.getItem(settings.gamemaster);

					try{
						customData = JSON.parse(content);

						if(customData?.id){
							object.data.id = customData.id
						}

						if(customData?.title){
							object.data.title = customData.title
						}

						if(customData?.pokemon){
							// Strip any empty values
							customData.pokemon = customData.pokemon.filter(pokemon => pokemon.speciesId != "");
							object.data.pokemon = customData.pokemon
						}

						if(customData?.moves){
							// Strip any empty values
							customData.moves = customData.moves.filter(move => move.moveId != "");
							object.data.moves = customData.moves
						}

						// Initialize search maps
						object.createSearchMaps();
						object.createPokeSelectList();

						if(typeof InterfaceMaster !== 'undefined'){
							InterfaceMaster.getInstance().init(object);
						}

						if(typeof customRankingInterface !== 'undefined'){
							customRankingInterface.init(object);
						}
					} catch(e){
						console.error("Could not load custom gamemaster", e);
					}

				}
			}
		});

		// Load the JSON of a specific gamemaster file into the object, default or custom
		object.loadCustomGameMaster = function(id, callback){
			console.log(id);
			console.log("loading gamemaster");
			let customData = {};

			// By default, load the minified version
			if(id == "gamemaster"){
				// Load default gamemaster

				$.ajax({
					dataType: "json",
					url: webRoot+"data/gamemaster.min.json?v="+siteVersion,
					mimeType: "application/json",
					error: function(request, error) {
						console.log("Request: " + JSON.stringify(request));
						console.log(error);
					},
					success: function( data ) {
						customData = {
							id: "custom_gamemaster",
							title: "Custom Gamemaster",
							dataType: "gamemaster",
							pokemon: data.pokemon,
							moves: data.moves
						};

						callback(customData);
					}
				});
			} else{
				// Load custom gamemaster from local storage
				let content = window.localStorage.getItem(id);

				try{
					customData = JSON.parse(content);

					callback(customData);
				} catch(e){
					console.error("Could not load custom gamemaster", e);
				}
			}
		}

		// Save a custom gamemaster object to local storage
		object.saveCustomGameMaster = function(data){

			data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));
			data.moves.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));

			let customData = {
				id: data.id,
				title: data.title,
				dataType: "gamemaster",
				pokemon: data.pokemon,
				moves: data.moves
			}

			window.localStorage.setItem(customData.id, JSON.stringify(customData));
		}

		// Create indexed maps for Pokemon and move selection
		object.createSearchMaps = function(){
			// Initialize search maps
			object.pokemonMap = new Map(object.data.pokemon.map(pokemon => [pokemon.speciesId, pokemon]));
			object.moveMap = new Map(object.data.moves.map(move => [move.moveId, move]));
		}

		// Create data for Pokemon select dropdown list
		object.createPokeSelectList = function() {
			object.pokeSelectList = object.data.pokemon.map(pokemon => ({
				speciesId: pokemon.speciesId,
				speciesName: pokemon.speciesName.toLowerCase(),
				displayName: pokemon.speciesName,
				dex: pokemon.dex,
				priority: pokemon.searchPriority || 1,
				nicknames: pokemon.nicknames || null,
				tags: pokemon.tags || null
			}));
		}

		// function to help speed up searching by resuing Pokemon objects
		// could likely be used in other instances where `new Pokemon` is called
		object.getAllPokemon = function(battle) {
			const key = battle.getCP();

			if (!object.allPokemon.hasOwnProperty(key)) {
				object.allPokemon[key] = object.data.pokemon.map(p => {
					return new Pokemon(p.speciesId, 0, battle);
				})
			}

			return object.allPokemon[key]
		}

		// Flush all values in the search cache and all Pokemon list
		object.flushAllPokemonCache = function(){
			object.searchStringCache = {};
			object.allPokemon = {};
		}


		// Return a Pokemon object given species ID

		object.getPokemonById = function(id){
			id = id.replace("_xl", "");

			var pokemon = object.pokemonMap.get(id);

			return pokemon;
		}

		// Return a list of Pokemon belong to a give familyId

		object.getPokemonByFamily = function(familyId){
			var list = [];

			$.each(object.data.pokemon, function(index, poke){

				if(poke.family && poke.family.id == familyId && poke.speciesId.indexOf("_shadow") == -1){
					list.push(poke);
					return;
				}
			});

			return list;
		}

		// Return all Pokemon entries that have the provided dex number

		object.getPokemonForms = function(dex){
			var list = [];

			$.each(object.data.pokemon, function(index, poke){

				if(poke.tags && poke.tags.indexOf("duplicate") > -1){
					return;
				}

				if(poke.dex == dex){
					list.push(poke);
					return;
				}
			});

			return list;
		}

		// Returns the point value of a Pokemon in a tiered meta

		object.getPokemonTier = function(id, cup){
			id = id.replace("_xs", "");
			id = id.replace("_shadow", "");

			if(! cup.tierRules){
				return false;
			}

			var tierRules = cup.tierRules;
			var tiers = cup.tierRules.tiers;
			var points = cup.tierRules.floor;

			for(var i = 0; i < tiers.length; i++){
				for(var n = 0; n < tiers[i].pokemon.length; n++){
					if(tiers[i].pokemon[n] == id){
						points = tiers[i].points;
						break;
					}
				}
			}

			return points;
		}


		// Iterate through the Pokemon entries and apply shadow Pokemon traits

		object.updateShadowStatus = function(){

			// First, clear all Shadow entries from the game master to start from a clean slate
			/*for(var i = 0; i < object.data.pokemon.length; i++){
				var poke = object.data.pokemon[i];
				if((poke)&&(poke.speciesId.indexOf("_shadow") > -1)){
					console.log("Removed " + poke.speciesId);
					object.data.pokemon.splice(i, 1);
					i--;
				}
			}*/

			var battle = new Battle();

			$.each(object.data.pokemon, function(index, poke){
				if(poke.speciesId.indexOf("_shadow") > -1){
					return;
				}

				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);
				battle.setNewPokemon(pokemon, 0, false);

				if(pokemon.hasTag("shadoweligible")){
					return;
				}

				// Remove Return and Frustration from legacy move list
				if(entry.legacyMoves){
					for(var i = 0; i < entry.legacyMoves.length; i++){
						if((entry.legacyMoves[i] == "FRUSTRATION")||(entry.legacyMoves[i] == "RETURN")){
							console.log("Removing Return from " + entry.speciesId);
							entry.legacyMoves.splice(i, 1);
							i--;

							continue;
						}

						// Remove any elite moves from the legacy move list
						if(entry.eliteMoves){
							if(entry.eliteMoves.indexOf(entry.legacyMoves[i]) > -1){
								entry.legacyMoves.splice(i, 1);
								i--;
							}
						}
					}

					if(entry.legacyMoves.length == 0){
						delete entry.legacyMoves;
					}
				}

				if(object.data.shadowPokemon.indexOf(poke.speciesId) > -1){
					// Get CP at level 25
					var cp = pokemon.calculateCP(0.667934, 0, 0, 0);
					entry.level25CP = cp;

					// Delete shadow from tags
					if(entry.tags){
						if(entry.tags.indexOf("shadow") > -1){
							entry.tags.splice(entry.tags.indexOf("shadow"), 1);

							if(entry.tags.length == 0){
								delete entry.tags;
							}
						}
					}

					if(entry.tags){
						if(entry.tags.indexOf("shadoweligible") == -1){
							entry.tags.push("shadoweligible");
						}
					} else{
						entry.tags = ["shadoweligible"];
					}

					// Duplicate the entry for the Shadow version of the Pokemon
					// Your clones are very impressive, you must be very proud

					if(!pokemon.hasTag("mega")){
						entry = JSON.parse(JSON.stringify(entry)); // Your clones are very impressive, you must be very proud
						entry.speciesId += "_shadow";
						entry.speciesName += " (Shadow)";
						entry.tags = entry.tags.filter(t => t != "wildlegendary" && t != "shadoweligible");
						entry.tags.push("shadow");

						// Adjust IDs for evolutions

						if(entry.family){
							if(entry.family.parent && object.data.shadowPokemon.indexOf(entry.family.parent) > -1){
								entry.family.parent += "_shadow";
							}

							if(entry.family.evolutions){
								for(var i = 0; i < entry.family.evolutions.length; i++){
									entry.family.evolutions[i] += "_shadow";
								}
							}
						}

						// Remove all legacy and exclusive moves that aren't available via Elite TM
						if(entry.legacyMoves){
							for(var i = 0; i < entry.fastMoves.length; i++){
								var remove = true;
								if(entry.legacyMoves.indexOf(entry.fastMoves[i]) > -1){
									if((entry.eliteMoves)&&(entry.eliteMoves.indexOf(entry.fastMoves[i]) > -1)){
										remove = false;
									}

									if(remove){
										entry.fastMoves.splice(i, 1);
										i--;
									}
								}
							}

							for(var i = 0; i < entry.chargedMoves.length; i++){
								var remove = true;
								if(entry.legacyMoves.indexOf(entry.chargedMoves[i]) > -1){
									if((entry.eliteMoves)&&(entry.eliteMoves.indexOf(entry.chargedMoves[i]) > -1)){
										remove = false;
									}

									if(remove){
										entry.chargedMoves.splice(i, 1);
										i--;
									}
								}
							}

							delete entry.legacyMoves;
						}

						delete entry.level25CP;
						object.data.pokemon.push(entry);
					}
				} else{
					if(entry.tags){
						if(entry.tags.indexOf("shadow") > -1){
							entry.tags.splice(entry.tags.indexOf("shadow"), 1);
						}
					}
				}
			});

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data.pokemon);

			console.log(json);
		}

		// Iterate through the Pokemon entries and generate default IV's

		object.generateDefaultIVs = function(){

			$.each(object.data.pokemon, function(index, poke){
				var entry = object.getPokemonById(poke.speciesId);
				var defaultIVs = object.generateDefaultIVsByPokemon(poke);
				entry.defaultIVs = defaultIVs;
			});

			// Sort Pokemon by dex

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data.pokemon);

			console.log(json);
		}

		// Generate default IVs for a single Pokemon entry

		object.generateDefaultIVsByPokemon = function(poke){
			var leagues = [500,1500,2500];
			var battle = new Battle();

			var pokemon = new Pokemon(null, 0, battle, poke);

			battle.setNewPokemon(pokemon, 0, false);

			var defaultIVs = {
				cp500: [],
				cp1500: [],
				cp2500: []
			};

			for(var i = 0; i < leagues.length; i++){
				battle.setCP(leagues[i]);

				pokemon.ivs.atk = pokemon.ivs.def = pokemon.ivs.hp = 15;
				pokemon.setLevel(pokemon.levelCap, true);

				var cp = pokemon.cp;
				var level35cp = pokemon.calculateCP(0.76156384, 15, 15, 15);
				var level40cp = pokemon.calculateCP(0.790300011634826, 15, 15, 15);
				var level45cp = pokemon.calculateCP(0.815299987792968, 15, 15, 15);

				if(cp > leagues[i]){
					var combo = object.generateDefaultIVCombo(pokemon, pokemon.levelCap, leagues[i], level45cp);

					if(combo){
						defaultIVs["cp"+leagues[i]] = [combo.level, combo.ivs.atk, combo.ivs.def, combo.ivs.hp]

						if(combo.level > 40){
							if(level40cp > leagues[i]){
								combo = object.generateDefaultIVCombo(pokemon, 40, leagues[i], level35cp);

								defaultIVs["cp"+leagues[i] + "l40"] = [combo.level, combo.ivs.atk, combo.ivs.def, combo.ivs.hp];
							} else{

								defaultIVs["cp"+leagues[i] + "l40"] = [40, 15, 15, 15];
							}
						}
					} else{
						// Attempt to generate IV combo without level floor
						pokemon.baseLevelFloor = 1;

						combo = object.generateDefaultIVCombo(pokemon, pokemon.levelCap, leagues[i], level45cp);

						if(combo){
							defaultIVs["cp"+leagues[i]] = [combo.level, combo.ivs.atk, combo.ivs.def, combo.ivs.hp]
						} else{
							defaultIVs["cp"+leagues[i]] = [1, 0, 0, 0];
						}
						
					}
				} else{
					defaultIVs["cp"+leagues[i]] = [pokemon.levelCap, 15, 15, 15];
				}
			}

			// Pokemon exceptions

			switch(pokemon.speciesId){
				case "trevenant":
					defaultIVs["cp1500"] = [22, 3, 13, 12];
					break;

				case "dhelmise":
					defaultIVs["cp1500"] = [20, 1, 4, 4];
					break;

				case "medicham":
					defaultIVs["cp1500"] = [49, 7, 15, 14];
					break;

				case "lokix":
					defaultIVs["cp2500"] = [47.5, 11, 15, 15];
					break;

				case "regidrago":
					defaultIVs["cp1500"] = [20, 2, 4, 4];
					break;

				// Match Shield form's default IV's
				case "aegislash_blade":
					defaultIVs["cp1500"] = [22, 4, 14, 15];
					defaultIVs["cp2500"] = [38, 15, 15, 15];
					break;

				case "mimikyu":
					defaultIVs["cp1500"] = [25, 4, 14, 15];
					break;
			}

			return defaultIVs;
		}

		// Generate a singular default IV combo given league and level cap

		object.generateDefaultIVCombo = function(pokemon, levelCap, league, nearCapCP){
			var floor = 4;
			var defaultIndex = 1;

			// For Pokemon that max near the league cap, default to lucky IV's
			if(nearCapCP < league){
				floor = 12;
			}

			if(pokemon.hasTag("legendary") && pokemon.hasTag("shadow")){
				floor = 6;
			}

			pokemon.setLevelCap(levelCap);

			var combinations = pokemon.generateIVCombinations("overall", 1, 4096, null, floor);

			// For untradable Pokemon, set the index to the 32nd rank
			if(pokemon.hasTag("untradeable")){
				defaultIndex = 31;
			}

			// For legendaries, set the index to the 300th rank
			if(pokemon.hasTag("legendary")){
				defaultIndex = 31;
			}

			// For shadow legendaries, set the index to the 250th rank
			if(pokemon.hasTag("shadow") && pokemon.hasTag("legendary")){
				defaultIndex = 249;
			}

			if(defaultIndex > combinations.length){
				defaultIndex = Math.floor(combinations.length / 2);
			}

			pokemon.setLevelCap(50);

			return combinations[defaultIndex];
		}

		// Set level caps for gamemaster data

		object.setLevelCapData = function(){

			// List of legendaries and mythicals to be excluded from the level cap
			var levelCapExclusion = ["melmetal","thundurus_incarnate","thundurus_therian","landorus_incarnate","landorus_therian","tornadus_incarnate","tornadus_therian","rayquaza"];

			$.each(object.data.pokemon, function(index, poke){
				var battle = new Battle();
				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);

				if((pokemon.hasTag("legendary")||pokemon.hasTag("mythical")) && (levelCapExclusion.indexOf(pokemon.speciesId) == -1)){
					entry.levelCap = 40;
				}
			});

			// Sort Pokemon by dex

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data);

			console.log(json);
		}

		// Check parent and evolution IDs to validate Pokemon family data

		object.validateFamilyData = function(){

			$.each(object.data.pokemon, function(index, poke){

				if(poke.family){
					if(poke.family.parent){
						var parent = object.getPokemonById(poke.family.parent);
						if(! parent){
							console.error(poke.family.parent + " does not exist");
						}
					}

					if(poke.family.evolutions){
						for(var i = 0; i < poke.family.evolutions.length; i++){
							var evolution = object.getPokemonById(poke.family.evolutions[i]);

							if(! evolution){
								console.error(poke.family.evolutions[i] + " does not exist");
							}
						}
					}
				}

			});

			console.log("Family validation complete");
		}

		// Check parent and evolution IDs to validate Pokemon family data

		object.generatePokemonMovesetCSV = function(){

			var csv = 'Pokemon,Fast Moves,Charged Moves'

			$.each(object.data.pokemon, function(index, poke){
				var pokemon = new Pokemon(poke.speciesId, 0, new Battle());
				var fastNames = [];
				var chargedNames = [];

				$.each(pokemon.fastMovePool, function(i, move){
					fastNames.push(move.name);
				});

				$.each(pokemon.chargedMovePool, function(i, move){
					chargedNames.push(move.name);
				});

				csv += '\n'+pokemon.speciesName+','+fastNames.join("|")+','+chargedNames.join("|");
			});

			console.log(csv);
		}

		// Analyze Charged Moves and bucket them into archetypes

		object.generateMoveArchetypes = function(){

			// List of legendaries and mythicals to be excluded from the level cap

			$.each(object.data.moves, function(index, move){
				move.archetype = object.generateArchetypeByMove(move);
			});

			// Sort Pokemon by dex

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data);

			console.log(json);
		}

		// Generate the archetype for a single move
		object.generateArchetypeByMove = function(move){
			var archetype = "General"; // Default archetype

			// Charged Moves

			if(move.category == "charged" || (! move?.category && move.energy > 0)){
				var dpe = move.power / move.energy;

				// Categorize by energy
				if((move.energy > 60)&&(dpe > 1.5)){
					archetype = "Nuke";
				} else if(move.energy > 50){
					if(dpe > 1.75){
						archetype = "Nuke";
					} else{
						archetype = "High Energy";
					}

				} else if(move.energy < 45){
					archetype = "Spam/Bait"
				}

				var descriptor = "";

				if(move.buffs){

					if((move.buffTarget == "self")&&((move.buffs[0] > 0)||(move.buffs[1] > 0))){
						descriptor = "Boost"
					}

					if((move.buffTarget == "self")&&((move.buffs[0] < 0)||(move.buffs[1] < 0))){
						descriptor = "Self-Debuff"
					}

					if((move.buffTarget == "opponent")&&((move.buffs[0] < 0)||(move.buffs[1] < 0))){
						descriptor = "Debuff"
					}

					if(descriptor != ""){
						if(archetype == "General"){
							archetype = descriptor;
						} else if(archetype == "High Energy"){
							archetype = archetype + " " + descriptor;
						} else{
							archetype = descriptor + " " + archetype;
						}
					}

					archetype = archetype.replace(" Spam/Bait", " Spam");
				}

				return archetype;
			}


			// Fast Moves

			if(move.energyGain > 0){
				var dpt = move.power / (move.cooldown / 500)
				var ept = move.energyGain / (move.cooldown / 500)

				if((dpt >= 3.5) && (dpt > ept)){
					archetype = "Heavy Damage"
				}

				if((ept >= 3.5) && (ept > dpt)){
					archetype = "Fast Charge"
				}

				if( ((dpt >= 4) && (ept >= 3)) || ((dpt >= 3) && (ept >= 4)) ){
					archetype = "Multipurpose"
				}

				if( ((dpt < 3) && (ept <= 3)) || ((dpt <= 3) && (ept < 3)) ){
					archetype = "Low Quality"
				}

				return archetype;
			}
		}

		// Return a move object from the GameMaster file given move ID

		object.getMoveById = function(id){
			if(id == "none")
				return;

			var m = object.moveMap.get(id);

			if(m !== undefined){

				// Generate move abbreviation

				var arr = m.moveId.split('_');
				var abbreviation = '';

				if(m.abbreviation){
					// Use predefined abbreviation if set
					abbreviation = m.abbreviation;
				} else{
					// Make abbreviation from first character of each word
					for(var i = 0; i < arr.length; i++){
						abbreviation += arr[i].charAt(0);
					}
				}

				var archetype = '';

				if(m.archetype){
					archetype = m.archetype;
				}

				move = {
					moveId: m.moveId,
					name: m.name,
					category: m.energyGain > 0 ? "fast" : "charged",
					displayName: m.name,
					abbreviation: abbreviation,
					archetype: archetype,
					type: m.type,
					power: m.power,
					energy: m.energy,
					energyGain: m.energyGain,
					damageMethod: "default",
					cooldown: m.cooldown,
					turns: m.turns,
					selfDebuffing: false,
					selfBuffing: false,
					selfAttackDebuffing: false,
					selfDefenseDebuffing: false,
					legacy: false,
					elite: false,
					instant: false,
					isMegaMove: false,
					tags: [],
					hasTag: function(tag){
						return this.tags.includes(tag);
					}
				};

				if(m?.category){
					move.category = m.category;
				}

				if((move.moveId == "RETURN")||(move.moveId == "FRUSTRATION")){
					move.legacy = true;
					move.displayName = move.displayName + "<sup>†</sup>";
				}
				

				if(m?.damageMethod){
					move.damageMethod = m.damageMethod;
				}

				if(m.buffs){
					move.buffs = m.buffs;
					move.buffApplyChance = parseFloat(m.buffApplyChance);
					move.buffTarget = m.buffTarget;

					if(move.buffTarget == "both"){
						move.buffsSelf = m.buffsSelf;
						move.buffsOpponent = m.buffsOpponent;
					}

					if( move.buffTarget == "self" && move.buffApplyChance >= .5 && move.moveId != "DRAGON_ASCENT" && (move.buffs[0] < 0 || move.buffs[1] < 0 )){
						move.selfDebuffing = true;

						// Mark if move debuffs attack
						if(move.buffs[0] < 0){
							move.selfAttackDebuffing = true;
						}

						// Mark if move debuffs defense
						if(move.buffs[1] < 0){
							move.selfDefenseDebuffing = true;
						}
					}

					if(move.buffApplyChance == 1 && (move.buffTarget == "opponent" || (move.buffTarget == "self" && (move.buffs[0] > 0 || move.buffs[1] > 0) || (move.buffTarget == "both" && (move.buffsSelf[0] > 0 || move.buffsSelf[1] > 0) )))){
						move.selfBuffing = true;
					}
				}

				if(m.formChange){
					move.formChange = JSON.parse(JSON.stringify(m.formChange));
				}

				if(m.tags){
					move.tags = [...m.tags];
				}

				if(m.isMegaMove){
					move.isMegaMove = m.isMegaMove;
				}
			} else{
				console.error(id + " missing");
			}

			return move;
		}

		// Return a move object from the GameMaster file given move ID without any modification

		object.getMoveDataById = function(id){
			if(id == "none")
				return;

			let move = object.data.moves.find(move => move.moveId == id);

			if(move){
				return move;
			} else{
				console.error(id + " missing");
				return false;
			}
		}


		// Get status effect string from a move

		object.getStatusEffectString = function(move){
			if (!move.buffs && !move.formChange) {
				return '';
			}

			var stringArray = []

			if(move.buffs){
				var atk = object.getStatusEffectStatString(move.buffs[0], 'Atk');
				var def = object.getStatusEffectStatString(move.buffs[1], 'Def');
				var buffApplyChance = parseFloat(move.buffApplyChance)*100 + '%';
				var buffTarget = move.buffTarget;
				stringArray.push(buffApplyChance + " chance", atk, def, buffTarget);

				if(move.buffTarget == "both"){
					stringArray[3] = "self";

					var atkOpp = object.getStatusEffectStatString(move.buffsOpponent[0], 'Atk');
					var defOpp = object.getStatusEffectStatString(move.buffsOpponent[1], 'Def');
					var buffApplyChance = parseFloat(move.buffApplyChance)*100 + '%';
					stringArray.push(buffApplyChance + " chance", atkOpp, defOpp, "opponent");
				}

			}

			if(move.formChange){
				stringArray.push("Form change");
			}

			return "<div class=\"status-effect-description\">"+stringArray.join(' ')+"</div>";
		}

		// Get form change effect string for rankings move descriptions given the move and Pokemon

		object.getFormChangeEffectString = function(move, pokemon){
			if(! pokemon?.formChange){
				return '';
			}

			let effectString = '';

			switch(pokemon.speciesId){
				case "cramorant":
					if(move.moveId == "SURF" || move.moveId == "DIVE"){
						effectString = "Cramorant changes form if it hasn't already, holding an Arrokuda if its current HP > 50% or a Pikachu if its current HP <= 50%. It reverts to its original form if it switches out.";
					}

					if(move.moveId == "GULP_MISSILE_ARROKUDA"){
						effectString = "Fires when Cramorant takes an unshielded Charged Attack while holding an Arrokuda, even if Cramorant faints. It then reverts to its original form. This attack's damage doesn't interact with resistances, stats, or other multipliers.";
					}

					if(move.moveId == "GULP_MISSILE_PIKACHU"){
						effectString = "Fires when Cramorant takes an unshielded Charged Attack while holding a Pikachu, even if Cramorant faints. It then reverts to its original form. This attack's damage doesn't interact with resistances, stats, or other multipliers.";
					}
					break;
			}

			return effectString;

		}

		// Get stats string from move for status effects

		object.getStatusEffectStatString = function(stat, type){
			if (stat === 0) {
				return "";
			}
			var statString = stat;
			if (stat > 0) {
				statString = "+" + statString;
			}
			return statString + " " + type;
		}

		// Return a cup object given an id name

		object.getCupById = function(id){
			var cup;

			$.each(object.data.cups, function(index, c){
				if(c.name == id){
					cup = c;
				}
			});

			return cup;
		}

		// Return a cup object given an id name

		object.getFormat = function(cup, cp){
			var format;

			$.each(object.data.formats, function(index, f){
				if(f.cup == cup && parseInt(f.cp) == cp){
					format = f;
				}
			});

			return format;
		}

		// Load and return ranking data JSON

		object.loadRankingData = function(caller, category, league, cup){
			var key = cup + "" + category + "" + league;
			var cupData = object.getCupById(cup);

			// Allow duplicate cups to point to existing cup data
			if(cupData?.rankingAlias){
				cup = cupData?.rankingAlias;
			}
			
			if(! object.rankings[key]){
				var file = webRoot+"data/rankings/"+cup+"/"+category+"/"+"rankings-"+league+".json?v="+siteVersion;

				console.log(file);

				$.getJSON( file, function( data ){
					object.rankings[key] = data;
					object.loadedData++;

					if(caller.displayRankingData){
						caller.displayRankingData(data);
					}
				});
			} else{
				if(caller.displayRankingData){
					caller.displayRankingData(object.rankings[key]);
				}
			}
		}

		// Load and return ranking data JSON

		object.loadTrainData = function(caller, league, cup){

			var key = cup + "" + league;

			if(! object.trainRankings[key]){
				var file = webRoot+"data/training/analysis/"+cup+"/"+league+".json?v="+siteVersion;

				console.log(file);

				$.getJSON( file, function( data ){
					object.trainRankings[key] = data;

					caller.displayRankingData(data);
				});
			} else{
				caller.displayRankingData(object.trainRankings[key]);
			}
		}

		// Load quick fill group JSON

		object.loadGroupData = function(caller, group, rankingData){

			var key = group;

			if(! object.groups[key]){
				var file = webRoot+"data/groups/"+group+".json?v="+siteVersion;

				$.getJSON( file, function( data ){

					// Sort alphabetically

					data.sort((a,b) => (a.speciesId > b.speciesId) ? 1 : ((b.speciesId > a.speciesId) ? -1 : 0));

					object.groups[key] = data;

					// Return group data for all contexts except rankings
					var returnData = data;

					if(rankingData){
						returnData = rankingData;
					}

					if(caller?.quickFillGroup){
						caller.quickFillGroup(returnData);
					} else if(caller?.displayRankingData){
						caller.displayRankingData(returnData);
					}
				});
			} else{
				if(caller?.quickFillGroup){
					caller.quickFillGroup(object.groups[key]);
				} else if(caller?.displayRankingData){
					caller.displayRankingData(object.groups[key]);
				}
			}
		}

		// Load team pool JSON for AI team generation

		object.loadTeamData = function(league, cup, callback){

			var key = league + "" + cup;

			if(! object.teamPools[key]){
				var file = webRoot+"data/training/teams/"+cup+"/"+league+".json?v="+siteVersion;

				$.getJSON( file, function( data ){
					object.teamPools[key] = data;
					callback(league, cup, data);
				});
			} else{
				callback(league, cup, object.teamPools[key]);
			}
		}

		// Load article metadata json and return it to the interface

		object.loadArticleData = function(callback){
			var file = webRoot+"articles/articles.json?v="+siteVersion;

			$.getJSON( file, function( data ){
				console.log("article metadata loaded [" + data.length + "]");
				callback(data);
			});
		}

		// Modify a Pokemon data entry

		object.modifyPokemonEntry = function(id, type, props){
			$.each(object.data.pokemon, function(index, poke){

				if(poke.speciesId == id){

					switch(type){
						case "movepool":

							var movepool = (props.moveType == "fast") ? poke.fastMoves : poke.chargedMoves;
							movepool.push(props.moveId);

							break;
					}
				}
			});
		}

		// Return a list of eligible Pokemon given a Battle object, and include and exclude filters

		object.generateFilteredPokemonList = function(battle, include, exclude, rankingData, overrides, excludeByStatProduct){
			excludeByStatProduct = typeof excludeByStatProduct !== 'undefined' ? excludeByStatProduct : true;

			// Gather all eligible Pokemon

			var minStats = 4900; // You must be this tall to ride this ride

			if(battle.getCP() == 500){
				minStats = 0;
			} else if(battle.getCP() == 1500){
				minStats = 1370;
			} else if(battle.getCP() == 2500){
				minStats = 2800;
			}

			if(! excludeByStatProduct){
				minStats = 0;
			}

			var bannedList = object.data.greatLeagueIneligible;

			// Aggregate filters

			var filterLists = [
				include,
				exclude
			];

			var pokemonList = [];

			for(var i = 0; i < object.data.pokemon.length; i++){

				var pokemon = new Pokemon(object.data.pokemon[i].speciesId, 0, battle);
				pokemon.initialize(battle.getCP());

				var stats = (pokemon.stats.hp * pokemon.stats.atk * pokemon.stats.def) / 1000;

				if(stats >= minStats || battle.getCup().includeLowStatProduct ||
				 ( battle.getCP() == 1500 && pokemon.hasTag("include1500"))
				 	|| ( battle.getCP() == 2500 && pokemon.hasTag("include2500")) 
					|| ( battle.getCP() == 10000 && pokemon.hasTag("include10000")) 
					|| pokemon.hasTag("mega") ){
					// Today is the day
					if(! pokemon.released){
						continue;
					}

					if((battle.getCP() < 2500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
						continue;
					}

					if(pokemon.hasTag("duplicate1500") && (battle.getCP() != 1500 || (battle.getCup().name != "all" && battle.getCup().name != "retro" && battle.getCup().name != "halloween"))){
						continue;
					}

					// Ban Shadows from Little Cup that can't reach a low enough level
					if(battle.getCP() == 500 && pokemon.hasTag("shadow") && pokemon.level < 8){
						continue;
					}

					// Process all filters
					var allowed = false;
					var includeIDFilter = false; // Flag to see if an ID filter should override other filters

					for(var n = 0; n < filterLists.length; n++){
						var filters = filterLists[n];
						var include = (n == 0);
						var filtersMatched = 0;
						var requiredFilters = filters.length;

						for(var j = 0; j < filters.length; j++){
							var filter = filters[j];

							// Check if this filter is valid for this league
							if(filter.leagues){
								if(filter.leagues.indexOf(battle.getCP()) == -1){
									requiredFilters--;
									continue;
								}
							}

							switch(filter.filterType){
								case "type":

									if((filter.values.indexOf(pokemon.types[0]) > -1) || (filter.values.indexOf(pokemon.types[1]) > -1)){
										filtersMatched++;
									}
									break;

								case "dex":
									// Assess multiple ranges in two-value increments
									for(let k = 0; k < filter.values.length; k+=2){
										// Catch if no value range exists
										if(k + 1 >= filter.values.length){
											break;
										}

										if(pokemon.dex >= filter.values[k] && pokemon.dex <= filter.values[k+1]){
											filtersMatched++;
											break;
										}
									}

									break;

								case "tag":
									for(var k = 0; k < filter.values.length; k++){
										if(pokemon.hasTag(filter.values[k])){
											filtersMatched++;
										}
									}
									break;

								case "cost":
									if(filter.values.indexOf(pokemon.thirdMoveCost) > -1){
										filtersMatched++;
									}
									break;

								case "distance":
									if(filter.values.indexOf(pokemon.buddyDistance) > -1){
										filtersMatched++;
									}
									break;

								case "evolution":
									if(filter.values.indexOf(pokemon.getEvolutionStage()) > -1){
										filtersMatched++;
									}
									break;

								case "id":
									if((include)&&(filters.length > 1)){
										requiredFilters--;
									}

									var testId = pokemon.speciesId;

									// Exclude Shadow and XL versions of a listed Pokemon
									if((! include)||(filter.includeShadows)){
										testId = testId.replace("_shadow","");
										testId = testId.replace("_xs","");
									}

									if( filter.values.indexOf(testId) > -1 || filter.values.indexOf(pokemon.speciesId) > -1 ) {
										filtersMatched += filters.length; // If a Pokemon is explicitly included, ignore all other filters

										if(include){
											includeIDFilter = true;
										}
									}
									break;

								case "move":
									for(var k = 0; k < filter.values.length; k++){
										if(pokemon.knowsMove(filter.values[k])){
											filtersMatched++;
										}
									}
									break;

								case "moveType":
									for(var k = 0; k < filter.values.length; k++){
										if(pokemon.knowsMoveType(filter.values[k])){
											filtersMatched++;
										}
									}
									break;
							}
						}

						// Only include Pokemon that match all of the include filters

						if((include)&&(filtersMatched >= requiredFilters)){
							allowed = true;
						}

						// Exclude Pokemon that match any of the exclude filters
						if((! include)&&(filtersMatched > 0)&&(! includeIDFilter)){
							allowed = false;
						}
					}

					if(allowed){

						// If data is available, force "best" moveset
						pokemon.weightModifier = 1;

						// Set Pokemon moveset from existing rankings
						if(rankingData){
							let r = rankingData.find(ranking => ranking.speciesId == pokemon.speciesId);

							if(r){
								// Sort by uses
								var fastMoves = r.moves.fastMoves;
								var chargedMoves = r.moves.chargedMoves;
								var extraChargedMoves = r.moves?.extraChargedMoves ? r.moves?.extraChargedMoves : [];

								pokemon.selectMove("fast", fastMoves[0].moveId);
								pokemon.selectMove("charged", chargedMoves[0].moveId, 0);

								if(chargedMoves.length > 1){
									pokemon.selectMove("charged", chargedMoves[1].moveId, 1);
								}

								if(extraChargedMoves.length > 0 && pokemon.hasThirdChargedMove()){
									pokemon.selectMove("extra-charged", extraChargedMoves[0].moveId, 2);
								}
							} else{
								pokemon.autoSelectMoves();
							}
						}

						// Set Pokemon moveset from overrides
						if(overrides){
							object.overrideMoveset(pokemon, battle.getCP(), battle.getCup().name, overrides);
						}

						pokemonList.push(pokemon);
					}
				}
			}

			return pokemonList;
		}

		// maps a search query to list of pokemon ids to avoid searching again
		object.searchStringCache = {}

		// Generate a list of Pokemon given a search string
		object.generatePokemonListFromSearchString = function(str, battle){


			// Break the search string up into queries
			var queries = str.toLowerCase().split(/\s*,\s*/);
			var searchKey = queries.join() + battle.getCP() + battle.getCup().name;

			// don't bother searching if any of the terms are empty
			// as all pokemon will be valid
			if (str == "") {
				return object.data.pokemon.map(p => p.speciesId)
			}

			// if you already searched, use cached list instead of regenerating
			if (object.searchStringCache.hasOwnProperty(searchKey)) {
				return object.searchStringCache[searchKey]
			}

			var results = []; // Store an array of qualifying Pokemon ID's

			var types = ["bug","dark","dragon","electric","fairy","fighting","fire","flying","ghost","grass","ground","ice","normal","poison","psychic","rock","steel","water"];
			var tags = object.data.pokemonTags;
			var regions = object.data.pokemonRegions;

			var metaKey = $(".format-select option:selected").first().attr("meta-group");
			let rankingKey = battle.getCup().name + "overall" + battle.getCP();

			if(! battle){
				battle = new Battle();
			}

			for(var i = 0; i < queries.length; i++){
				var query = queries[i];

				if(query == ""){
					continue;
				}

				var params = query.split('&');

				// iterate over existing pokemon instead of creating new objects
				for(const pokemon of object.getAllPokemon(battle)){

					var paramsMet = 0;

					for(var j = 0; j < params.length; j++){
						var param = params[j];
						var isNot = false;
						var valid = false;

						if(param.length == 0){
							if(params.length == 1){
								paramsMet++;
							}
							continue;
						}

						if((param.charAt(0) == "!")&&(param.length > 1)){
							isNot = true;
							param = param.substr(1, param.length-1);
						}

						// Evolution family search
						if((param.charAt(0) == "+")&&(param.length > 2)){
							param = param.substr(1, param.length-1);

							var searchPokemon = object.getPokemonById(param);

							if(searchPokemon && searchPokemon.family && pokemon.family && searchPokemon.family.id == pokemon.family.id){
								valid = true;
							}
						}

						// Move search
						if((param.charAt(0) == "@")&&(param.length > 2)){
							param = param.substr(1, param.length-1);

							// legacy move search
							if ((param == "legacy")||(param == "special")) {
								for(var k = 0; k < pokemon.fastMovePool.length; k++){
									if((pokemon.fastMovePool[k].legacy == true)||(pokemon.fastMovePool[k].elite == true)){
										valid = true;
									}
								}

								for(var k = 0; k < pokemon.chargedMovePool.length; k++){
									if((pokemon.chargedMovePool[k].legacy == true)||(pokemon.chargedMovePool[k].elite == true)){
										valid = true;
									}

									if(pokemon.chargedMovePool[k].moveId == "FRUSTRATION"||pokemon.chargedMovePool[k].moveId === "RETURN") {
										if(param == "special"){
											valid = true;
										} else if(param == "legacy"){
											valid = false;
										}
									}
								}
							}

							// beam search
							if (param == "beam") {
								for(var k = 0; k < pokemon.chargedMovePool.length; k++){
									// only includes **REAL** beams
									if ((pokemon.chargedMovePool[k].moveId == "HYPER_BEAM")||(pokemon.chargedMovePool[k].moveId === "SOLAR_BEAM")) {
										valid = true;
									}
								}
							}

							// move name/type serach
							else {
								const fastOnly = (param.charAt(0) === "1")
								const chargedOnly = (param.charAt(0) === "2")
								if (fastOnly || chargedOnly) {
									param = param.substr(1, param.length-1)
								}
								// skip fast moves if @2
								if (!chargedOnly) {
									for(var k = 0; k < pokemon.fastMovePool.length; k++){
										if((pokemon.fastMovePool[k].name.toLocaleLowerCase().startsWith(param))||(pokemon.fastMovePool[k].type == param)){
											valid = true;
										}
									}
								}

								// skip charged moves if @1
								if (!fastOnly) {
									for(var k = 0; k < pokemon.chargedMovePool.length; k++){
										if((pokemon.chargedMovePool[k].name.toLocaleLowerCase().startsWith(param))||(pokemon.chargedMovePool[k].type == param)){
											valid = true;
										}
									}
								}
							}
						} else{
							// Name search
							if(pokemon.speciesName.toLowerCase().startsWith(param)){
								valid = true;
							}

							// Type search
							if(pokemon.types.indexOf(param) > -1){
								valid = true;
							}

							// Tag search
							if((tags.indexOf(param) > -1)&&(pokemon.hasTag(param))){
								valid = true;
							}

							// Nickname search
							if (pokemon.nicknames.indexOf(param) > -1) {
								valid = true;
							}

							// Dex number search

							if(pokemon.dex == param){
								valid = true;
							}

							// Move cost search
							if(param.indexOf("k") > -1){
								var arr = param.split("k");
								if(pokemon.thirdMoveCost == parseInt(arr[0]) * 1000){
									valid = true;
								}
							}

							// Buddy distance search
							if(param.indexOf("km") > -1){
								var arr = param.split("km");
								if(pokemon.buddyDistance == parseInt(arr[0])){
									valid = true;
								}
							}

							// Hundo search
							if((param == "hundo")||(param == "4*")){
								pokemon.initialize(true);

								if(pokemon.ivs.atk == 15 && pokemon.ivs.def == 15 && pokemon.ivs.hp == 15){
									valid = true;
								}
							}

							// New XL search, no longer a tag
							if(param == "xl"){
								if(pokemon.needsXLCandy()){
									valid = true;
								}
							}

							// Region/generation search
							for(k = 0; k < regions.length; k++){
								if((param == regions[k].string)||(param==regions[k].name)){
									if((pokemon.dex >= regions[k].dexStart)&&(pokemon.dex <= regions[k].dexEnd)){
										valid = true;

										// Exclude Alolan Pokemon from Gen1
										if((pokemon.hasTag("alolan"))&&(regions[k].string == "gen1")){
											valid = false;
										}
									}
								}
							}

							// Point/tier search
							if((param.indexOf("pt") > -1)||(param.indexOf("pts") > -1)){
								var val = param.replace("pt","");
								val = param.replace("pts","");
								val = parseInt(val);

								if(object.getPokemonTier(pokemon.speciesId, pokemon.getBattle().getCup()) == val){
									valid = true;
								}
							}

							// Meta group search
							if(param == "meta"){
								if(object.groups[metaKey] !== undefined){

									var group = object.groups[metaKey];

									valid = false;

									for(k = 0; k < group.length; k++){
										if(pokemon.speciesId.replace("_shadow", "") == group[k].speciesId.replace("_shadow", "")){
											valid = true;
										}
									}
								} else{
									valid = true;
								}
							}

							// Editor notes search on rankings page
							
							if(param == "notes" && window.location.href.indexOf("/rankings/") > -1){

								let $rankEntries = $(".rank[has-editor-notes='true'");
								$rankEntries.each(function(index, item){

									if(pokemon.speciesId == $(item).attr("data")){
										valid = true;
									}
								});
							}

							// Trait search

							if((object.data.pokemonTraits.pros.indexOf(param) > -1)||(object.data.pokemonTraits.cons.indexOf(param) > -1)){
								pokemon.initialize(true);
								pokemon.selectRecommendedMoveset("overall");
								var traits = pokemon.generateTraits();
								var searchTraits = [param];

								// Add bulk traits above or below the searched trait if applicable

								if(param == "bulky"){
									searchTraits.push("extremely bulky");
								}

								if(param == "less bulky"){
									searchTraits.push("frail", "glass cannon");
								}

								if(traits){
									// Search traits for search term
									for(var k = 0; k < traits.pros.length; k++){
										if(searchTraits.indexOf(traits.pros[k].trait.toLowerCase()) > -1){
											valid = true;

											break;
										}
									}

									for(var k = 0; k < traits.cons.length; k++){
										if(searchTraits.indexOf(traits.cons[k].trait.toLowerCase()) > -1){
											valid = true;

											break;
										}
									}
								}
							}
						}

						if(((valid)&&(!isNot))||((!valid)&&(isNot))){
							paramsMet++;
						}
					}

					if(paramsMet >= params.length){
						results.push(pokemon.speciesId);
					}
				}
			}

			object.searchStringCache[searchKey] = results
			return results;
		}

		// Generate a list of moves given a search string
		object.generateMoveListFromSearchString = function(str){


			// Break the search string up into queries
			var queries = str.toLowerCase().split(/\s*,\s*/);

			// don't bother searching if any of the terms are empty
			// as all pokemon will be valid
			if (str == "") {
				return object.data.moves.map(m=> m.moveId)
			}

			var results = []; // Store an array of qualifying Move ID's

			for(var i = 0; i < queries.length; i++){
				var query = queries[i];

				if(query == ""){
					continue;
				}

				var params = query.split('&');

				// iterate over existing pokemon instead of creating new objects
				for(const moveData of object.data.moves){
					const move = object.getMoveById(moveData.moveId);

					var paramsMet = 0;

					for(var j = 0; j < params.length; j++){
						var param = params[j];
						var isNot = false;
						var valid = false;

						if(param.length == 0){
							if(params.length == 1){
								paramsMet++;
							}
							continue;
						}

						if((param.charAt(0) == "!")&&(param.length > 1)){
							isNot = true;
							param = param.substr(1, param.length-1);
						}

						// Name search
						let moveNameParts = move.name.split(" ");
						if(moveNameParts.some(name => name.toLowerCase().startsWith(param))){
							valid = true;
						}

						if(move.name.toLowerCase().startsWith(param)){
							valid = true;
						}

						// Type search
						if(move.type == param){
							valid = true;
						}

						// Abbreviation search
						if(move.abbreviation.toLowerCase() == param){
							valid = true;
						}

						// Archetype
						if(move.archetype.toLowerCase() == param){
							valid = true;
						}

						// Category search
						if(move.category == param){
							valid = true;
						}

						if(((valid)&&(!isNot))||((!valid)&&(isNot))){
							paramsMet++;
						}
					}

					if(paramsMet >= params.length){
						results.push(move.moveId);
					}
				}
			}

			return results;
		}

		// Override a Pokemon's moveset to be used in the rankings

		object.overrideMoveset = function(pokemon, league, cup, overrides){

			// Search eligible leagues and cups
			var overrideSet = overrides.find(o => o.league == league && o.cup == cup);
			
			if(overrideSet){
				var pokemonEntry = overrideSet.pokemon.find(p => p.speciesId == pokemon.speciesId);

				if(pokemonEntry){
					// Set Fast Move

					if(pokemonEntry.fastMove){
						pokemon.selectMove("fast", pokemonEntry.fastMove);
					}

					// Set Charged Moves

					if(pokemonEntry.chargedMoves){
						for(var j = 0; j < pokemonEntry.chargedMoves.length; j++){
							pokemon.selectMove("charged", pokemonEntry.chargedMoves[j], j);
						}

						if(pokemonEntry.chargedMoves.length < 2){
							pokemon.selectMove("charged", "none", 1);
						}
					}

					if(pokemonEntry.extraChargedMoves && pokemon.hasThirdChargedMove()){
						pokemon.selectMove("extra-charged", pokemonEntry.extraChargedMoves[0], 2);
					}

					// Set weight modifier
					if (typeof pokemonEntry.weight !== 'undefined') {
						pokemon.weightModifier = pokemonEntry.weight;
					}
				}
			}
		}

        return object;
    }

    return {
        getInstance: function (interface) {
            if (!instance) {
                instance = createInstance(interface);
            }
            return instance;
        }
    };
})();

;
// Static constants
class DamageMultiplier{
	static BONUS = 1.2999999523162841796875;
	static SUPER_EFFECTIVE = 1.60000002384185791015625;
	static RESISTED = .625;
	static DOUBLE_RESISTED = .390625;
	static STAB = 1.2000000476837158203125;
	static SHADOW_ATK = 1.2;
	static SHADOW_DEF = 0.83333331;
	static MEGA_BONUS = [1, 1.10000002384185791015625, 1.2000000476837158203125, 1.2999999523162841796875]
}


/*
* Class with static methods for handling damage calculations
*/

class DamageCalculator {
	// Calculate damage given an attacker, defender, and move, requires move to be initialized first
	static damage(attacker, defender, move, charge = 1, mode = "simulate", players = []){
		var effectiveness = defender.typeEffectiveness[move.type];
		var chargeMultiplier = charge; // The amount of charge for a Charged Move


		// Fully charge moves in regular simulation or if the opponent is an AI
		if((mode == "emulate")&&(players[attacker.index])){
			if((move.energyGain > 0)||(players[attacker.index].getAI() !== false)){
				chargeMultiplier = 1;
			}

			// Protection to prevent 0 damage
			if(chargeMultiplier == 0){
				chargeMultiplier = 1;
			}
		}

		let power = move.power;
		let attackStat = attacker.getEffectiveStat(0);
		let defenseStat = defender.getEffectiveStat(1);
		let isMegaMove = (attacker.hasTag("mega") && move?.isMegaMove);
		let megaMultiplier = isMegaMove ? DamageMultiplier.MEGA_BONUS[attacker.megaLevel - 1] : 1;

		// Form specific special cases
		switch(attacker.activeFormId){
			case "aegislash_shield":
				// Calculate all Charged Attack damage using the Blade form's Attack stat
				if(move.category == "charged"){
					attackStat = attacker.getFormStats("aegislash_blade").atk;
				}
				break;
		}

		let damage = 1;

		// Form specific special cases
		switch(attacker.activeFormId){
			case "aegislash_shield":
				//
				if(move.energyGain > 0){
					damage = 1;
				}
				break;
		}

		// Alternative damage method calculations
		switch(move.damageMethod){
			default:
				damage = Math.floor(power * move.stab * ( attackStat / defenseStat) * effectiveness * chargeMultiplier * megaMultiplier * 0.5 * DamageMultiplier.BONUS) + 1;
				break;

			case "percentMaxHP":
				damage = Math.floor((move.power / 100) * (defender.stats.hp)) + 1;
				break;
		}

		return damage;
	}

	// Calculate damage given stats and effectiveness

	static damageByStats(attacker, defender, attack, defense, effectiveness, move){
		// For Pokemon which change forms before a charged attack, use the new form's attack stat
		if(attacker.formChange && attacker.formChange.trigger == "activate_charged" && move.category == "charged"){
			attack = attacker.getFormStats(attacker.formChange.alternativeFormId).atk;
		}

		let isMegaMove = (attacker.hasTag("mega") && move?.isMegaMove);
		let megaMultiplier = isMegaMove ? DamageMultiplier.MEGA_BONUS[attacker.megaLevel - 1] : 1;
		let damage = 1;

		// Form specific special cases
		switch(attacker.activeFormId){
			case "aegislash_shield":
				//
				if(move.energyGain > 0){
					damage = 1;
				}
				break;
		}

		// Alternative damage method calculations
		switch(move.damageMethod){
			default:
				damage = Math.floor(move.power * move.stab * (attack/defense) * megaMultiplier * effectiveness * 0.5 * DamageMultiplier.BONUS) + 1;
				break;

			case "percentMaxHP":
				damage = Math.floor((move.power / 100) * (defender.stats.hp)) + 1;
				break;
		}

		return damage;
	}

	// Solve for Attack given the damage, defense, effectiveness, and move

	static breakpoint(attacker, defender, damage, defense, effectiveness, move){
		var attackStatMultiplier = attacker.getStatBuffMultiplier(0, true);

		var attack = ((damage - 1) * defense) / (move.power * move.stab * effectiveness * attacker.shadowAtkMult * attackStatMultiplier * 0.5 * DamageMultiplier.BONUS);

		return attack;
	}

	// Solve for Defense given the damage, attack, effectiveness, and move

	static bulkpoint(attacker, defender, damage, attack, effectiveness, move){
		var defenseStatMultiplier = defender.getStatBuffMultiplier(1, true);

		var defense =  (move.power * move.stab * effectiveness * 0.5 * DamageMultiplier.BONUS * attack) / (damage);

		defense = (defense * defenseStatMultiplier) / defender.shadowDefMult;

		return defense;
	}


	// Given a move type and array of defensive types, return the final type effectiveness multiplier

	static getEffectiveness(moveType, targetTypes){
		var effectiveness = 1;

		var moveType = moveType.toLowerCase();

		for(var i = 0; i < targetTypes.length; i++){
			var type = targetTypes[i].toLowerCase();
			var traits = DamageCalculator.getTypeTraits(type);

			if(traits.weaknesses.indexOf(moveType) > -1){
				effectiveness *= DamageMultiplier.SUPER_EFFECTIVE;
			} else if(traits.resistances.indexOf(moveType) > -1){
				effectiveness *= DamageMultiplier.RESISTED;
			} else if(traits.immunities.indexOf(moveType) > -1){
				effectiveness *= DamageMultiplier.DOUBLE_RESISTED;
			}
		}

		return effectiveness;
	}

	// Helper function that returns an array of weaknesses, resistances, and immunities given defensive type

	static getTypeTraits(type){
		var traits = {
			weaknesses: [],
			resistances: [],
			immunities: []
		};

		switch(type){
			case "normal":
				traits = { resistances: [],
				  weaknesses: ["fighting"],
				  immunities: ["ghost"] };
				break;

			case "fighting":
				traits = { resistances: ["rock", "bug", "dark"],
				  weaknesses: ["flying", "psychic", "fairy"],
				  immunities: [] };
				break;

			case "flying":
				traits = { resistances: ["fighting", "bug", "grass"],
				  weaknesses: ["rock", "electric", "ice"],
				  immunities: ["ground"] };
				break;

			case "poison":
				traits = { resistances: ["fighting", "poison", "bug", "fairy","grass"],
				  weaknesses: ["ground", "psychic"],
				  immunities: [] };
				break;

			case "ground":
				traits = { resistances: ["poison", "rock"],
				  weaknesses: ["water", "grass", "ice"],
				  immunities: ["electric"] };
				break;

			case "rock":
				traits = { resistances: ["normal", "flying", "poison", "fire"],
				  weaknesses: ["fighting", "ground", "steel", "water", "grass"],
				  immunities: [] };
				break;

			case "bug":
				traits = { resistances: ["fighting", "ground", "grass"],
				  weaknesses: ["flying", "rock", "fire"],
				  immunities: [] };
				break;

			case "ghost":
				traits = { resistances: ["poison", "bug"],
				  weaknesses: ["ghost","dark"],
				  immunities: ["normal", "fighting"] };
				break;

			case "steel":
				traits = { resistances: ["normal", "flying", "rock", "bug", "steel", "grass", "psychic", "ice", "dragon", "fairy"],
				  weaknesses: ["fighting", "ground", "fire"],
				  immunities: ["poison"] };
				break;

			case "fire":
				traits = { resistances: ["bug", "steel", "fire", "grass", "ice", "fairy"],
				  weaknesses: ["ground", "rock", "water"],
				  immunities: [] };
				break;

			case "water":
				traits = { resistances: ["steel", "fire", "water", "ice"],
				  weaknesses: ["grass", "electric"],
				  immunities: [] };
				break;

			case "grass":
				traits = { resistances: ["ground", "water", "grass", "electric"],
				  weaknesses: ["flying", "poison", "bug", "fire", "ice"],
				  immunities: [] };
				break;

			case "electric":
				traits = { resistances: ["flying", "steel", "electric"],
				  weaknesses: ["ground"],
				  immunities: [] };
				break;

			case "psychic":
				traits = { resistances: ["fighting", "psychic"],
				  weaknesses: ["bug", "ghost", "dark"],
				  immunities: [] };
				break;

			case "ice":
				traits = { resistances: ["ice"],
				  weaknesses: ["fighting", "fire", "steel", "rock"],
				  immunities: [] };
				break;

			case "dragon":
				traits = { resistances: ["fire", "water", "grass", "electric"],
				  weaknesses: ["dragon", "ice", "fairy"],
				  immunities: [] };
				break;

			case "dark":
				traits = { resistances: ["ghost", "dark"],
				  weaknesses: ["fighting", "fairy", "bug"],
				  immunities: ["psychic"] };
				break;

			case "fairy":
				traits = { resistances: ["fighting", "bug", "dark"],
				  weaknesses: ["poison", "steel"],
				  immunities: ["dragon"] };
				break;
		}

		return traits;
	}
}

;
// JavaScript Document

/*
* The main Pokemon class used to represent individual Pokemon in battle
*/

function Pokemon(id, i, b, d){
	var gm = GameMaster.getInstance();
	var data;
	var battle = b;
	var self = this;

	// Initialize Pokemon by ID or by passed game data
	if(id !== null){
		id = id.replace("_xl","");
		data = gm.getPokemonById(id);
	} else if(d !== null){
		id = d.speciesId;
		data = d;
	}

	// CP modifiers at each level

	var cpms = [0.0939999967813491, 0.135137430784308, 0.166397869586944, 0.192650914456886, 0.215732470154762, 0.236572655026622, 0.255720049142837, 0.273530381100769, 0.290249884128570, 0.306057381335773, 0.321087598800659, 0.335445032295077, 0.349212676286697, 0.362457748778790, 0.375235587358474, 0.387592411085168, 0.399567276239395, 0.411193549517250, 0.422500014305114, 0.432926413410414, 0.443107545375824, 0.453059953871985, 0.462798386812210, 0.472336077786704, 0.481684952974319, 0.490855810259008, 0.499858438968658, 0.508701756943992, 0.517393946647644, 0.525942508771329, 0.534354329109191, 0.542635762230353, 0.550792694091796, 0.558830599438087, 0.566754519939422, 0.574569148039264, 0.582278907299041, 0.589887911977272, 0.597400009632110, 0.604823657502073, 0.612157285213470, 0.619404110566050, 0.626567125320434, 0.633649181622743, 0.640652954578399, 0.647580963301656, 0.654435634613037, 0.661219263506722, 0.667934000492096, 0.674581899290818, 0.681164920330047, 0.687684905887771, 0.694143652915954, 0.700542893277978, 0.706884205341339, 0.713169102333341, 0.719399094581604, 0.725575616972598, 0.731700003147125, 0.734741011137376, 0.737769484519958, 0.740785574597326, 0.743789434432983, 0.746781208702482, 0.749761044979095, 0.752729105305821, 0.755685508251190, 0.758630366519684, 0.761563837528228, 0.764486065255226, 0.767397165298461, 0.770297273971590, 0.773186504840850, 0.776064945942412, 0.778932750225067, 0.781790064808426, 0.784636974334716, 0.787473583646825, 0.790300011634826, 0.792803950958807, 0.795300006866455, 0.797803921486970, 0.800300002098083, 0.802803892322847, 0.805299997329711, 0.807803863460723, 0.810299992561340, 0.812803834895026, 0.815299987792968, 0.817803806620319, 0.820299983024597, 0.822803778631297, 0.825299978256225, 0.827803750922782, 0.830299973487854, 0.832803753381377, 0.835300028324127, 0.837803755931569, 0.840300023555755, 0.842803729034748, 0.845300018787384, 0.847803702398935, 0.850300014019012, 0.852803676019539, 0.855300009250640, 0.857803649892077, 0.860300004482269, 0.862803624012168, 0.865299999713897];

	if(! data){
		console.log(id + " not found");
		return false;
	}

	// Base properties
	this.data = data;
	this.dex = data.dex;
	this.speciesId = id;
	this.aliasId = this.speciesId;
	this.activeFormId = this.speciesId;
	this.canonicalId = id.replace("_xs","");
	this.speciesName = data.speciesName;

	// Use an alias for duplicate Pokemon entries to redirect to the main Pokemon ID
	if(data.aliasId){
		this.aliasId = data.aliasId;
	}

	this.baseStats = { atk: data.baseStats.atk, def: data.baseStats.def, hp: data.baseStats.hp};
	this.stats = { atk: 0, def: 0, hp: 0 };
	this.statBuffs = [ 0, 0 ]; // 0 - attack, 1 - defense
	this.startStatBuffs = [ 0, 0 ];
	this.nativeStatBuffs = [ 0, 0 ]; // Form or species specific stat buffs
	this.buffChanceModifier = 0;
	this.ivs = { atk: 0, def: 0, hp: 0 };
	this.types = [ data.types[0], data.types[1] ];
	this.cp = 0;
	this.hp = 0;
	this.startHp = 0;
	this.startEnergy = 0;
	this.startCooldown = 0;
	this.originalFormId = this.activeFormId;
	this.level = 50;
	this.levelCap = 50; // Variable level cap as determined by the battle settings
	this.baseLevelCap = 50; // The default level cap as determined by the game master
	this.baseLevelFloor = 1; // IV combinations won't go lower than this level
	this.megaLevel = 3; // Determines mega evolution bonus for third charged attack
	this.cpm = 0.840300023555755;
	this.priority = 0; // Charged move priority
	this.fastMovePool = [];
	this.chargedMovePool = [];
	this.extraChargedMovePool = [];
	this.legacyMoves = [];
	this.eliteMoves = [];
	this.shadowEligible = false;
	this.shadowType = "normal"; // normal, shadow, or purified
	this.shadowAtkMult = 1;
	this.shadowDefMult = 1;
	this.released = data.released; // Used to filter Pokemon in rankings
	this.buddyDistance = data.buddyDistance;
	this.thirdMoveCost = data.thirdMoveCost;

	if(data.family){
		this.family = data.family;
	}

	if(data.formChange){
		this.formChange = data.formChange;
	}

	if(data.originalFormId){
		this.originalFormId = data.originalFormId;
		this.startFormId = data.originalFormId; // May differ for specific sims or training matchup evaluations
	}

	this.typeEffectiveness = getTypeEffectivenessArray(b);

	this.fastMove = null;
	this.chargedMoves = [];

	this.isCustom = false; // Does this Pokemon have custom set levels and IV's?
	this.autoLevel = false; // Automatically adjust a Pokemon to league CP when adjusting IVs

	this.index = i;

	this.dps = 10; // Used later to calculate TDO

	// Battle properties

	this.energy = 0;
	this.cooldown = 0;
	this.damageWindow = 0;
	this.shields = 0;
	this.startingShields = 0;
	this.hasActed = false; // This Pokemon has acted this turn

	this.baitShields = 1; // 0 - doesn't bait, 1 - baits selectively, 2 - always baits
	this.farmEnergy = false; // use fast moves only
	this.chargedMovesOnly = false; // Only allow Charged Move actions
	this.optimizeMoveTiming = true; // Optimize move timing to prevent opponent from getting extra turns
	this.turnsToKO = -1;

	// Training battle statistics

	this.battleStats = {};
	this.roundStats = {};

	// Custom ranking properties

	this.rankingWeight = 1;

	// Set legacy moves

	if(data.legacyMoves){
		this.legacyMoves = data.legacyMoves.slice();
	}

	if(data.eliteMoves){
		this.eliteMoves = data.eliteMoves.slice();
	}

	// Set tags

	this.tags = [];

	if(data.tags){
		this.tags = data.tags.slice();

		if(this.tags.includes("supermega")){
			this.megaLevel = 4;
		}
	}

	// Set nicknames

	this.nicknames = [];

	if(data.nicknames){
		this.nicknames = data.nicknames.slice();
	}

	// Set level cap
	this.levelCap = b.getLevelCap();

	if(data.levelCap){
		this.baseLevelCap = data.levelCap;
		this.levelCap = data.levelCap;
	}

	if(data.levelFloor){
		this.baseLevelFloor = data.levelFloor;
	}

	// Set battle moves

	for(var i = 0; i < data.fastMoves.length; i++){
		var move = gm.getMoveById(data.fastMoves[i]);

		if(move){
			move.legacy = (self.legacyMoves.indexOf(move.moveId) > -1);
			move.elite = (self.eliteMoves.indexOf(move.moveId) > -1);

			if(move.elite){
				move.legacy = false;
			}

			move.displayName = move.name;

			if(move.legacy){
				move.displayName = move.name + "<sup>†</sup>";
			} else if(move.elite){
				move.displayName = move.name + "*";
			}

			this.fastMovePool.push(move);
		}
	}

	// Safeguard for Pokemon with empty Fast Move pool
	if(this.fastMovePool.length == 0){
		this.fastMovePool.push(gm.getMoveById("SPLASH"));
	}

	for(var i = 0; i < data.chargedMoves.length; i++){
		var move = gm.getMoveById(data.chargedMoves[i]);

		if(move){
			move.legacy = (self.legacyMoves.indexOf(move.moveId) > -1);
			move.elite = (self.eliteMoves.indexOf(move.moveId) > -1);

			if(move.elite){
				move.legacy = false;
			}

			move.displayName = move.name;

			if(move.legacy){
				move.displayName = move.name + "<sup>†</sup>";
			} else if(move.elite){
				move.displayName = move.name + "*";
			}

			this.chargedMovePool.push(move);
		}
	}

	// Safeguard for Pokemon with empty Charged Move pool
	if(this.chargedMovePool.length == 0){
		this.chargedMovePool.push(gm.getMoveById("STRUGGLE"));
	}


	// Add Return and Frustration for eligible Pokemon

	if((data.tags)&&(data.tags.indexOf("shadoweligible") > -1)){
		self.shadowEligible = true;

		if(data.level25CP <= b.getCP()){
			self.chargedMovePool.push(gm.getMoveById("RETURN"));
			self.legacyMoves.push("RETURN");
		}
	}

	if((data.tags)&&(data.tags.indexOf("shadow") > -1)){
		self.shadowEligible = true;

		if(data.tags.indexOf("shadow") > -1){
			self.chargedMovePool.push(gm.getMoveById("FRUSTRATION"));
		}

		self.legacyMoves.push("FRUSTRATION");
	}

	// Add extra Charged Moves for Mega Evolutions or other qualifying Pokemon
	if(data.extraChargedMoves && data.extraChargedMoves.length > 0){
		for(let i = 0; i < data.extraChargedMoves.length; i++){
			let move = gm.getMoveById(data.extraChargedMoves[i]);

			if(move){
				move.legacy = (self.legacyMoves.indexOf(move.moveId) > -1);
				move.elite = (self.eliteMoves.indexOf(move.moveId) > -1);

				if(move.elite){
					move.legacy = false;
				}

				move.displayName = move.name;

				if(move.legacy){
					move.displayName = move.name + "<sup>†</sup>";
				} else if(move.elite){
					move.displayName = move.name + "*";
				}

				this.extraChargedMovePool.push(move);
			}
		}
	}

	// Sort moves by ID for consistent order

	self.fastMovePool.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));
	self.chargedMovePool.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));
	self.extraChargedMovePool.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));

	// Given a target CP, scale to CP, set actual stats, and initialize moves

	this.initialize = function(targetCP, defaultMode){

		defaultMode = typeof defaultMode !== 'undefined' ? defaultMode : "gamemaster";

		this.cp = self.calculateCP();

		if((b.getLevelCap() <= self.baseLevelCap)&&(self.levelCap - b.getLevelCap() > 1)){
			self.levelCap = b.getLevelCap();
		}

		if(self.megaLevel == 4){
			self.baseLevelCap = 52;
			self.levelCap = 52;
		}

		var maxCP = 10000;

		if(battle){
			maxCP = battle.getCP();
		}

		// Bandaid fix for scenarios where Pokemon who have shield baiting or stat boost settings are considered custom

		var isDefault = false;

		if(this.level == 40 && this.ivs.atk == 0 && this.ivs.def == 0 && this.ivs.hp == 0 && ! self.autoLevel){
			isDefault = true;
		}

		if((targetCP && ! self.isCustom) || (this.cp > maxCP && isDefault)){

			switch(defaultMode){
				case "scale":
					// Scale Pokemon to selected CP
					// If the Pokemon can't reach the CP limit without IV's, increment until it reaches the CP limit or 15/15/15

					var targetCPM = 1;
					var iv = -1;

					while((iv < 15) && (targetCPM > .7903)){
						iv++;

						targetCPM = Math.sqrt( (targetCP * 10) / ((this.baseStats.atk+iv) * Math.pow(this.baseStats.def+iv, 0.5) * Math.pow(this.baseStats.hp+iv, 0.5)));
					}

					this.ivs.atk = this.ivs.def = this.ivs.hp = iv;

					this.cpm = Math.min(targetCPM, .7903);
				break;

				case "maximize":
					self.maximizeStat("overall");
				break;

				case "gamemaster":
					if(maxCP == 10000){
						self.ivs.atk = self.ivs.def = self.ivs.hp = 15;
						self.setLevel(self.levelCap, false);
					} else{
						var combination = data.defaultIVs["cp"+maxCP];

						if((self.levelCap == 40)&&(data.defaultIVs["cp"+maxCP+"l40"])){
							combination = data.defaultIVs["cp"+maxCP+"l40"];
						}

						// If a valid combination exists for this CP cap
						if(combination){
							var level = Math.min(self.levelCap, combination[0]);

							if(combination){
								self.ivs.atk = combination[1];
								self.ivs.def = combination[2];
								self.ivs.hp = combination[3];
								self.setLevel(level, false);
							} else{
								self.ivs.atk = 15;
								self.ivs.def = 15;
								self.ivs.hp = 15;
								self.setLevel(self.levelCap, false);
							}
						} else{
							self.ivs.atk = 15;
							self.ivs.def = 15;
							self.ivs.hp = 15;
							self.setLevel(1, false);
						}


					}
				break;
			}

		}

		//Set effective stats

		this.stats.atk = this.cpm * (this.baseStats.atk+this.ivs.atk);
		this.stats.def = this.cpm * (this.baseStats.def+this.ivs.def);
		this.stats.hp = Math.max(Math.floor(this.cpm * (this.baseStats.hp+this.ivs.hp)), 10);

		// Set Shedinja hp to 10

		if (data.dex == 292) {
			this.stats.hp = 10;
		}

		this.hp = this.stats.hp;
		this.startHp = this.hp;

		this.cp = self.calculateCP();

		// Throw error if invalid IV combination
		if(targetCP && this.cp > maxCP){
			console.error(this.speciesId + " exceeds CP limit of " + maxCP);
		}

		if(this.cp < 10){
			this.cp = 10;
		}

		// Set Shadow Pokemon to Shadow

		if(self.hasTag("shadow")){
			self.setShadowType("shadow");
		}

		// Set moves if unset

		if(! self.fastMove){
			self.fastMove = self.fastMovePool[0];
			self.chargedMoves = [self.chargedMovePool[0]];

			if(self.chargedMovePool.length > 1){
				self.chargedMoves.push(self.chargedMovePool[1]);
			}
		}
		this.resetMoves();
	}

	// Calculate and return the Pokemon's CP

	this.calculateCP = function(cpm = self.cpm, atkIV = self.ivs.atk, defIV = self.ivs.def, hpIV = self.ivs.hp){
		let cp = Math.floor(( (self.baseStats.atk+atkIV) * Math.pow(self.baseStats.def+defIV, 0.5) * Math.pow(self.baseStats.hp+hpIV, 0.5) * Math.pow(cpm, 2) ) / 10);

		return cp;
	}

	// Calculate and return CP given CPM and base stats

	this.calculateCPByBaseStats = function(cpm, atk, def, hp){
		let cp = Math.floor(( (atk+self.ivs.atk) * Math.pow((def+self.ivs.def), 0.5) * Math.pow((hp+self.ivs.hp), 0.5) * Math.pow(cpm, 2) ) / 10);

		return cp;
	}

	// Set an IV combination that maximizes atk, def, hp, or overall

	this.maximizeStat = function(sortStat) {
		combinations = self.generateIVCombinations(sortStat, 1, 1);

        if (combinations.length > 0) {
            this.ivs.atk = combinations[0].ivs.atk;
            this.ivs.def = combinations[0].ivs.def;
            this.ivs.hp = combinations[0].ivs.hp;
            this.setLevel(combinations[0].level, false)
        } else {
            this.ivs.atk = 15;
            this.ivs.def = 15;
            this.ivs.hp = 15;
            this.setLevel(self.levelCap, false);
        }

        this.stats.atk = this.cpm * (this.baseStats.atk+this.ivs.atk);
        this.stats.def = this.cpm * (this.baseStats.def+this.ivs.def);
        this.stats.hp = Math.max(Math.floor(this.cpm * (this.baseStats.hp+this.ivs.hp)), 10);
        this.hp = this.stats.hp;
        this.startHp = this.hp;

        this.cp = self.calculateCP();
		
		self.isCustom = true;
	}

	// Generate an array of IV combinations sorted by stat

	this.generateIVCombinations = function(sortStat, sortDirection, resultCount, filters, ivFloor) {
		var targetCP = battle.getCP();
		var level = self.levelCap;
        var atkIV = 15;
        var defIV = 15;
        var hpIV = 15;
        var calcCP = 0;
        var overall = 0;
		var bestStat = 0;
        var cpm = 0;
        var combinations = [];

		if(sortDirection == -1){
			bestStat = 10000;
		}

		var floor = 0;

		if((self.hasTag("legendary") || self.hasTag("ultrabeast")) && ! self.hasTag("wildlegendary")){
			floor = 1;
		}

		if((self.hasTag("legendary") || self.hasTag("ultrabeast")) && (self.shadowType == "shadow" || self.hasTag("shadow"))){
			floor = 6;
		}

		if(ivFloor){
			floor = ivFloor;
		}

		if(self.hasTag("untradeable")){
			floor = 10;
		}

		if(self.hasMove("RETURN")){
			floor = 2;
		}

        hpIV = 15;
        while (hpIV >= floor) {
            defIV = 15;
            while (defIV >= floor) {
                atkIV = 15;
                while (atkIV >= floor) {
					if(targetCP > 500){ // Ignore level floor for Little Cup right now
						level = self.baseLevelFloor;
					} else{
						level = 0.5;
					}

					calcCP = 0;

					while((level < self.levelCap)&&(calcCP < targetCP)){
						level += 0.5;

						cpm = cpms[(level-1) * 2];

						/*if(level % 1 == 0){
							// Set CPM for whole levels
							cpm = cpms[level - 1];
						} else{
							// Set CPM for half levels
							cpm = Math.sqrt( (Math.pow(cpms[Math.floor(level-1)], 2) + Math.pow(cpms[Math.ceil(level-1)], 2)) / 2);
						}*/

						calcCP = self.calculateCP(cpm, atkIV, defIV, hpIV);
					}

					if(calcCP > targetCP){
						level -= 0.5;

						cpm = cpms[(level-1) * 2];
						/*if(level % 1 == 0){
							// Set CPM for whole levels
							cpm = cpms[level - 1];
						} else{
							// Set CPM for half levels
							cpm = Math.sqrt( (Math.pow(cpms[Math.floor(level-1)], 2) + Math.pow(cpms[Math.ceil(level-1)], 2)) / 2);
						}*/
						calcCP = this.calculateCP(cpm, atkIV, defIV, hpIV);
					}

                    if (calcCP <= targetCP) {
                        let atk = cpm * (self.baseStats.atk + atkIV);
                        let def = cpm * (self.baseStats.def + defIV);
                        let hp = Math.floor(cpm * (self.baseStats.hp + hpIV));
                        overall = (hp * atk * def);

						if(self.shadowType == "shadow"){

						}

						var combination = {
							level: level,
							ivs: {
								atk: atkIV,
								def: defIV,
								hp: hpIV
							},
							atk: atk,
							def: def,
							hp: hp,
							overall: overall,
							cp: calcCP
						};

						var valid = true;

						// This whole jumble won't include combinations that don't beat our best or worst if we just want one result

						if(resultCount == 1){
							if(sortDirection == 1){
								if(combination[sortStat] < bestStat){
									valid = false;
								}
							} else if(sortDirection == -1){
								if(combination[sortStat] > bestStat){
									valid = false;
								}
							}

							if(valid){
								bestStat = combination[sortStat];
							}
						}

						// Check if a minimum value must be reached

						if(filters){
							for(var i = 0; i < filters.length; i++){
								if(combination[filters[i].stat] < filters[i].value){
									valid = false;
								}
							}
						}

						if(valid){
							combinations.push(combination);
						}
                    }
                    atkIV--;
                }
                defIV--;
            }
            hpIV--;
        }

		combinations.sort((a,b) => (a[sortStat] > b[sortStat]) ? (-1 * sortDirection) : ((b[sortStat] > a[sortStat]) ? (1 * sortDirection) : 0));
		results = combinations.splice(0, resultCount);

		return results;
	}

	// Return the rank number of this Pokemon's IV combination for a given stat

	this.getIVRank = function(sortStat){
		var combinations = this.generateIVCombinations(sortStat, 1, 4096);
		var rank = combinations.findIndex((combo) => combo.ivs.atk == this.ivs.atk && combo.ivs.def == this.ivs.def && combo.ivs.hp == this.ivs.hp);
		rank++;

		return { rank: rank, count: combinations.length };
	}

	// Given a defender, generate a list of Attack values that reach certain breakpoints

	this.calculateBreakpoints = function(defender, move){
		var attackStatMultiplier = self.getStatBuffMultiplier(0, true);
		var defenseStatMultiplier = defender.getStatBuffMultiplier(1, true);

		var effectiveness = defender.typeEffectiveness[move.type];
		var minAttack = self.generateIVCombinations("atk", -1, 1)[0].atk * self.shadowAtkMult * attackStatMultiplier;
		var maxAttack = self.generateIVCombinations("atk", 1, 1)[0].atk * self.shadowAtkMult * attackStatMultiplier;
		var maxDefense = defender.generateIVCombinations("def", 1, 1)[0].def;

		var minDamage = DamageCalculator.damageByStats(self, defender, minAttack, defender.stats.def * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);
		var maxDamage = DamageCalculator.damageByStats(self, defender, maxAttack, defender.stats.def * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);

		var breakpoints = [];

		for(var i = minDamage; i <= maxDamage; i++){
			var breakpoint = DamageCalculator.breakpoint(self, defender, i, defender.stats.def * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);
			var maxDefenseBreakpoint = DamageCalculator.breakpoint(self, defender, i, maxDefense * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);

			if(maxDefenseBreakpoint > maxAttack){
				maxDefenseBreakpoint = -1;
			}

			breakpoints.push({
				damage: i,
				attack: breakpoint,
				guaranteedAttack: maxDefenseBreakpoint
			});
		}

		return breakpoints;
	}

	// Given an attacker, generate a list of Defense values that reach certain bulkpoints

	this.calculateBulkpoints = function(attacker, move){
		var attackStatMultiplier = attacker.getStatBuffMultiplier(0, true);
		var defenseStatMultiplier = self.getStatBuffMultiplier(1, true);

		var effectiveness = self.typeEffectiveness[move.type];
		var minDefense = self.generateIVCombinations("def", -1, 1)[0].def * self.shadowDefMult * defenseStatMultiplier;
		var maxDefense = self.generateIVCombinations("def", 1, 1)[0].def * self.shadowDefMult * defenseStatMultiplier;
		var maxAttack = attacker.generateIVCombinations("atk", 1, 1)[0].atk * attacker.shadowAtkMult;
		var minDamage = DamageCalculator.damageByStats(attacker, self, attacker.stats.atk * attacker.shadowAtkMult * attackStatMultiplier, maxDefense, effectiveness, move);
		var maxDamage = DamageCalculator.damageByStats(attacker, self, attacker.stats.atk * attacker.shadowAtkMult * attackStatMultiplier, minDefense, effectiveness, move);
		var breakpoints = [];

		for(var i = minDamage; i <= maxDamage; i++){
			var bulkpoint = DamageCalculator.bulkpoint(attacker, self, i, attacker.stats.atk * attacker.shadowAtkMult * attackStatMultiplier, effectiveness, move);
			var maxAttackBulkpoint = DamageCalculator.bulkpoint(attacker, self, i, maxAttack  * attacker.shadowAtkMult * attackStatMultiplier, effectiveness, move);

			if(maxAttackBulkpoint > maxDefense){
				maxAttackBulkpoint = -1;
			}

			breakpoints.push({
				damage: i,
				defense: bulkpoint,
				guaranteedDefense: maxAttackBulkpoint
			});
		}

		return breakpoints;
	}

	// The benevolent cousin to this.getStabbed()
	// Returns Same Type Attack Bonus given a move

	this.getStab = function(move){
		if((move.type == this.types[0]) || (move.type == this.types[1])){
			return DamageMultiplier.STAB;
		} else{
			return 1;
		}
	}

	// Initialize moves and set their respective damage numbers

	this.resetMoves = function(){
		for(var i = 0; i < this.fastMovePool.length; i++){
			this.initializeMove(this.fastMovePool[i]);
		}

		for(var i = 0; i < this.chargedMovePool.length; i++){
			this.initializeMove(this.chargedMovePool[i]);
		}

		for(var i = 0; i < this.extraChargedMovePool.length; i++){
			this.initializeMove(this.extraChargedMovePool[i]);
		}

		// Set best charged move

		self.activeChargedMoves = []; // Keep a list of charged moves sorted by energy

		if(this.chargedMoves.filter(m => m !== null).length > 0){

			for(var i = 0; i < self.chargedMoves.length; i++){

				if(! self.chargedMoves[i]){
					continue;
				}

				/*	Each chance buff move has an incrementing buff apply meter that will deterministically apply chance buffs
				*	once this value crosses each whole number.
				*/

				if(self.chargedMoves[i].buffs && self.chargedMoves[i].buffApplyChance < 1){
					self.chargedMoves[i].buffApplyMeter = self.chargedMoves[i].buffApplyChance;

					// For moves with a 50% chance, apply on the second activation
					if(self.chargedMoves[i].buffApplyChance == .5){
						self.chargedMoves[i].buffApplyMeter = 0;
					}
				}

				self.activeChargedMoves.push(self.chargedMoves[i]);
			}

			self.activeChargedMoves.sort((a,b) => (a.energy > b.energy) ? 1 : ((b.energy > a.energy) ? -1 : 0));

			self.fastestChargedMove = self.activeChargedMoves[0];

			if(self.activeChargedMoves.length > 1){
				for(var i = 1; i < self.activeChargedMoves.length; i++){

					// If both moves cost the same energy and one has a buff effect, prioritize the buffing move, or the move that does more damage

					if((self.activeChargedMoves[i].energy == self.activeChargedMoves[0].energy)&&(! self.activeChargedMoves[i].selfDebuffing)){

						if((self.activeChargedMoves[i].buffs)||(self.activeChargedMoves[i].damage > self.activeChargedMoves[0].damage)){
							var move = self.activeChargedMoves[0];
							self.activeChargedMoves.splice(0, 1);
							self.activeChargedMoves.push(move);
						}
					}

					// If both moves cost the same energy and one has a guaranteed buff effect, prioritize the buffing move

					if((self.activeChargedMoves[i].energy == self.activeChargedMoves[0].energy)&&(self.activeChargedMoves[0].buffs)&&(self.activeChargedMoves[i].buffs)&&(! self.activeChargedMoves[i].selfDebuffing)&&(self.activeChargedMoves[0].buffs)&&(self.activeChargedMoves[i].buffApplyChance > self.activeChargedMoves[0].buffApplyChance)){
						var move = self.activeChargedMoves[0];
						self.activeChargedMoves.splice(0, 1);
						self.activeChargedMoves.push(move);
					}

					// The Zap Cannon Registeel clause! It will treat Focus Blast like a self debuffing move and prefer Zap Cannon shields up

					if((self.activeChargedMoves[0].moveId == "FOCUS_BLAST")&&(self.activeChargedMoves[i].moveId == "ZAP_CANNON")){
						if(self.activeChargedMoves[i].dpe - self.activeChargedMoves[0].dpe > -.3){
							self.activeChargedMoves[0].buffs = [0,0];
							self.activeChargedMoves[0].buffTarget = "self";
							self.activeChargedMoves[0].selfDebuffing = true;
						} else{
							delete self.activeChargedMoves[0].buffs;
							delete self.activeChargedMoves[0].buffTarget;
							delete self.activeChargedMoves[0].selfDebuffing;
						}
					}

					// Behavior for Aegislash to build energy in shield mode

					if(self.activeFormId == "aegislash_shield"){
						self.activeChargedMoves.forEach(move => {
							move.buffs = [0,0];
							move.buffTarget = self;
							move.selfDebuffing = true;
						});
					}

					// If both moves cost similar energy and DPE and one has a buff effect, prioritize the buffing move

					if((self.activeChargedMoves[i].energy - self.activeChargedMoves[0].energy <= 10)&&(! self.activeChargedMoves[i].selfDebuffing)){

						if((self.activeChargedMoves[i].selfBuffing)&&(self.activeChargedMoves[0].dpe - self.activeChargedMoves[i].dpe < .3)){
							var move = self.activeChargedMoves[0];
							self.activeChargedMoves.splice(0, 1);
							self.activeChargedMoves.push(move);
						}
					}

					// If the cheaper move is a self debuffing move and the other move is a close non-debuffing move, prioritize the non-debuffing move

					if((self.activeChargedMoves[i].energy - self.activeChargedMoves[0].energy <= 10)&&(self.activeChargedMoves[0].selfAttackDebuffing)&&(! self.activeChargedMoves[i].selfDebuffing)){
						var move = self.activeChargedMoves[0];
						self.activeChargedMoves.splice(0, 1);
						self.activeChargedMoves.push(move);
					}

					// If the cheaper move is a self debuffing move and the other move is a close non-debuffing move, prioritize the non-debuffing move if the self debuffing move cannot be stacked

					if((self.activeChargedMoves[i].energy - self.activeChargedMoves[0].energy <= 10)&&(self.activeChargedMoves[0].selfDebuffing)&&(self.activeChargedMoves[0].energy > 50)&&(! self.activeChargedMoves[i].selfDebuffing)){
						var move = self.activeChargedMoves[0];
						self.activeChargedMoves.splice(0, 1);
						self.activeChargedMoves.push(move);
					}

					// If the second move is a close energy, self buffing move, prioritize it as the bait move

					if(self.activeChargedMoves[i].energy - self.activeChargedMoves[0].energy <= 5 && self.activeChargedMoves[i].selfBuffing){
						var move = self.activeChargedMoves[0];
						self.activeChargedMoves.splice(0, 1);
						self.activeChargedMoves.push(move);
					}

				}

			}

			self.bestChargedMove = self.activeChargedMoves[0];
			self.bestChargedMove.dpe = self.bestChargedMove.damage / self.bestChargedMove.energy;

			for(var i = 0; i < self.activeChargedMoves.length; i++){
				var move = self.activeChargedMoves[i];
				move.dpe = move.damage / move.energy;

				// Use moves that have higher DPE
				if(((move.dpe - self.bestChargedMove.dpe > .03)&&(move.moveId != "SUPER_POWER"))||(move.dpe - self.bestChargedMove.dpe > .3)){
					if((! self.bestChargedMove.selfBuffing)||((self.bestChargedMove.selfBuffing)&&(move.dpe - self.bestChargedMove.dpe > .3))){
						self.bestChargedMove = self.activeChargedMoves[i];
					}

				}

				// When DPE is close, favor moves with guaranteed buff effects
				if((Math.abs(move.dpe - self.bestChargedMove.dpe) < .03)&&(self.bestChargedMove.buffs)&&(move.buffs)&&(move.buffApplyChance > self.bestChargedMove.buffApplyChance)&&(! move.selfDebuffing)){
					self.bestChargedMove = self.activeChargedMoves[i];
				}



				// Favor Obstruct over close energy moves
				if(self.activeChargedMoves[i].moveId == "OBSTRUCT"){
					self.bestChargedMove = self.activeChargedMoves[i];
				}
			}

			// Favor Obstruct over close energy moves
			if(self.activeChargedMoves[0].moveId == "OBSTRUCT" && self.activeChargedMoves[0].energy - self.bestChargedMove.energy <= 5 && self.activeChargedMoves[0].dpe / self.bestChargedMove.dpe > .2){
				self.bestChargedMove = self.activeChargedMoves[0];
			}
		} else{
			self.bestChargedMove = null;
		}
	}

	// Set a moves stab and damage traits given an opponent

	this.initializeMove = function(move){
		var opponent = battle.getOpponent(self.index);

		move.stab = self.getStab(move);

		if(opponent){
			move.damage = DamageCalculator.damage(self, opponent, move);
		} else{
			move.damage = Math.floor(move.power * move.stab);
		}

		move.dps = move.damage / (move.cooldown / 500); // I guess this really damage per turn

		if(move.energy > 0){
			move.dpe = move.damage / move.energy;

			// If move buffs attack, apply that

			if(move.buffs){
				var buffEffect = 0;

				if((move.buffTarget == "self")&&(move.buffs[0] > 0)){
					buffEffect = move.buffs[0] * (80 / move.energy); // Factor in a rough number of times the move will be used in battle
				} else if((move.buffTarget == "opponent")&&(move.buffs[1] < 0)){
					buffEffect = Math.abs(move.buffs[1]) * (80 / move.energy);
				}

				var multiplier = 1;

				if(buffEffect > 0){
					multiplier = ( (gm.data.settings.buffDivisor +(buffEffect* move.buffApplyChance)) / gm.data.settings.buffDivisor);
				}

				move.dpe *= multiplier;
			}
		} else{
			move.eps = move.energyGain / (move.cooldown / 500);
			move.deps = move.dps * move.eps;
		}

	}

	// Select moves, given a Charged Move count (minimum 1)

	this.autoSelectMoves = function(count){

		count = typeof count !== 'undefined' ? count : 2;

		var opponent = battle.getOpponent(self.index);
		var usage = self.generateMoveUsage(opponent, 1);

		self.selectMove("fast", usage.fastMoves[0].moveId);
		self.selectMove("charged", usage.chargedMoves[0].moveId, 0);

		if((usage.chargedMoves.length > 1)&&(count > 1)&&(self.speciesId != "smeargle")){
			self.selectMove("charged", usage.chargedMoves[1].moveId, 1);

			if(usage.extraChargedMoves && self.hasThirdChargedMove()){
				self.selectMove("extra-charged", usage.extraChargedMoves[0].moveId, 2);
			}
		} else if(self.speciesId == "smeargle"){
			self.selectMove("charged", "none", 1);
		}
	}

	// Given a type string, move id, and charged move index, set a specific move

	this.selectMove = function(type, id, index = 0, disallowCustomAddition = false){
		var moveFound = false;
		var move;
		var arr;

		if(type == "charged" && index == 2){
			type = "extra-charged";
		}

		switch(type){
			case "fast":
				arr = this.fastMovePool;
				move = arr.find(m => m.moveId == id);

				if(move){
					this.fastMove = move;
					moveFound = true;
				}
				break;

			case "charged":
				arr = this.chargedMovePool;
				move = arr.find(m => m.moveId == id);

				if(move){
					this.chargedMoves[index] = move;
					moveFound = true;
				}
				break;

			case "extra-charged":
				arr = this.extraChargedMovePool;
				move = arr.find(m => m.moveId == id);

				if(move){
					this.chargedMoves[index] = move;
					moveFound = true;
				}
				break;
		}

		// If charged move is set to none, clear 2nd charged move

		if(id == "none" && (type == "charged" || type == "extra-charged")){
			if(this.chargedMoves.length < 3){
				this.chargedMoves.splice(index,1);
			} else{
				this.chargedMoves[index] = null;
			}
			
		}

		// If identical charged moves are selected, select first available

		if(type == "charged" && this.chargedMoves.filter(m => m !== null).length > 1){
			var nonIndex = 0;

			if(index == 0){
				nonIndex = 1;
			}

			if(id == this.chargedMoves[nonIndex].moveId){
				for(i = 0; i < arr.length; i++){
					if(arr[i].moveId != id){
						this.chargedMoves[nonIndex] = arr[i];
						break;
					}
				}
			}
		}

		// If the move wasn't found, add it to the movepool
		if(! moveFound && typeof id !== "undefined"){
			if(! disallowCustomAddition){
				self.addNewMove(id, arr, true, type, index);
			} else{
				switch(type){
					case "fast":
						self.fastMove = gm.getMoveById(id);
						self.initializeMove(self.fastMove);
						break;

					case "charged":
						self.chargedMoves[index] = gm.getMoveById(id);
						self.initializeMove(self.chargedMoves[index]);
						break;
				}
			}

		}
	}

	// Obtain a Pokemon's recommended moveset from the rankings and select them

	this.selectRecommendedMoveset = function(category){
		category = typeof category !== 'undefined' ? category : "overall";

		var cupName = "all";

		if(battle.getCup()){
			cupName = battle.getCup().name;
		}

		if(cupName == "custom"){
			cupName = "all";
		}

		var key = cupName + category + battle.getCP();

		if(! gm.rankings[key]){
			console.log("Ranking data not loaded yet");
			return;
		}

		var rankings = gm.rankings[key];
		var found = false;

		for(var i = 0; i < rankings.length; i++){
			var r = rankings[i];

			if(r.speciesId == self.speciesId){
				self.selectMove("fast", r.moveset[0]);
				self.selectMove("charged", r.moveset[1], 0);

				if(r.moveset.length > 2){
					self.selectMove("charged", r.moveset[2], 1);
				} else{
					self.selectMove("charged", "none", 1);
				}

				if(r.moveset.length > 3 && self.hasThirdChargedMove()){
					self.selectMove("extra-charged", r.moveset[3], 2);
				}

				self.resetMoves();

				// Assign overall score for reference
				self.overall = r.score;
				self.scores = r.scores;

				found = true;
				break;
			}
		}

		// If no results, auto select moveset
		if(! found){
			self.autoSelectMoves();
		}
	}

	// Given an opponent, generate move usage stats

	this.generateMoveUsage = function(opponent, weightModifier){
		weightModifier = typeof weightModifier !== 'undefined' ? weightModifier : 1;

		// First, initialize all moves to get updated damage numbers

		this.resetMoves();

		// Feed move pools into new arrays so they can be manipulated without affecting the originals

		var fastMoves = [];
		var chargedMoves = [];
		var fastMoveUses = [];
		var chargedMoveUses = [];
		var extraChargedMoveUses = [];
		var targetArrs = [fastMoves, chargedMoves, chargedMoves];
		var sourceArrs = [self.fastMovePool, self.chargedMovePool, self.extraChargedMovePool];

		for(var i = 0; i < sourceArrs.length; i++){
			for(var n = 0; n < sourceArrs[i].length; n++){
				targetArrs[i].push(sourceArrs[i][n]);
			}
		}

		// Sort charged moves by DPE

		chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

		var highestDPE = chargedMoves[0].dpe;

		for(var i = 0; i < chargedMoves.length; i++){
			var move = chargedMoves[i];
			var statChangeFactor = 1;

			// Calculate the magnitude of stat changes, factoring in stages and buff chance
			if(move.buffs){
				for(var n = 0; n < move.buffs.length; n++){
					// Don't factor self defense drops for move usage
					if((move.selfDebuffing)&&(n == 1)){
						continue;
					}

					if(move.buffs[n] > 0){
						if(move.buffTarget == "self"){
							statChangeFactor *= ((4+move.buffs[n]) / 4);
						} else if(move.buffTarget == "opponent"){
							statChangeFactor *= (1 / ((4+move.buffs[n]) / 4));
						}
					} else if(move.buffs[n] < 0){
						if(move.buffTarget == "self"){
							statChangeFactor *= (4 / (4-move.buffs[n]));
						} else if(move.buffTarget == "opponent"){
							statChangeFactor *= (1 / (4 / (4-move.buffs[n])));
						}
					}
				}

				statChangeFactor =  1 + ((statChangeFactor - 1) * move.buffApplyChance);
			}

			// Calculate usage based on raw damage, efficiency, and speed
			move.uses = (Math.pow(move.damage, 2) / Math.pow(move.energy, 4)) * Math.pow(statChangeFactor, 2);
		}

		chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

		// For moves that have a strictly better preference, sharply reduce usage
		total = chargedMoves[0].uses;

		for(var i = 1; i < chargedMoves.length; i++){
			for(var n = 0; n < i; n++){
				if((chargedMoves[i].type == chargedMoves[n].type)&&(chargedMoves[i].energy >= chargedMoves[n].energy)&&(chargedMoves[i].dpe / chargedMoves[n].dpe < 1.3)){
					chargedMoves[i].uses *= .5;
					break;
				}
			}

			total += chargedMoves[i].uses;
		}

		// Normalize move usage to total
		for(var i = 0; i < chargedMoves.length; i++){
			chargedMoves[i].uses = Math.round((chargedMoves[i].uses / total) * 100);
		}

		for(var i = 0; i < chargedMoves.length; i++){
			if(self.chargedMovePool.some(m => m.moveId == chargedMoves[i].moveId)){
				chargedMoveUses.push({
					moveId: chargedMoves[i].moveId,
					uses: chargedMoves[i].uses * weightModifier
				});
			} else if(self.extraChargedMovePool.some(m => m.moveId == chargedMoves[i].moveId)){
				extraChargedMoveUses.push({
					moveId: chargedMoves[i].moveId,
					uses: chargedMoves[i].uses * weightModifier
				});
			}

		}

		chargedMoveUses.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
		extraChargedMoveUses.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

		// Calculate TDO for each fast move and sort
		var total = 0;

		// Let's use Yawn as a baseline for comparison
		var yawn = gm.getMoveById("YAWN");
		yawn.damage = 1;

		var baseline = self.calculateCycleDPT(yawn, chargedMoves[0]);

		for(var i = 0; i < fastMoves.length; i++){
			var move = fastMoves[i];
			var ept = move.energyGain / (move.cooldown / 500);
			var dpt = move.damage / (move.cooldown / 500);

			move.uses = self.calculateCycleDPT(move, chargedMoves[0]);
			move.uses = Math.max(move.uses - baseline, 0.1);
			move.uses *= Math.pow(Math.pow(dpt*Math.pow(ept,4), 1/5), Math.max(highestDPE - 1, 1)); // Emphasize fast charging moves with access to powerful Charged Moves

			total += move.uses;
		}

		// Normalize move usage to total
		for(var i = 0; i < fastMoves.length; i++){
			fastMoves[i].uses = Math.round((fastMoves[i].uses / total) * 100);

			fastMoveUses.push({
				moveId: fastMoves[i].moveId,
				uses: fastMoves[i].uses * weightModifier
			});
		}

		fastMoveUses.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

		var results = {
			fastMoves: fastMoveUses,
			chargedMoves: chargedMoveUses
		};

		if(extraChargedMoveUses.length > 0){
			results.extraChargedMoves = extraChargedMoveUses;
		}

		return results;
	}

	// Add new move to the supplied move pool, with a flag to automatically select the new move

	this.addNewMove = function(id, movepool, selectNewMove, moveType, index){
		var move = gm.getMoveById(id);

		if(! move){
			return false;
		}

		// Force all 3rd Charged Moves into the Extra Charged Move Slot
		if(moveType == "charged" && index == 2){
			movepool = this.extraChargedMovePool;
			moveType = "extra-charged";
		}

		// Don't add move if it's already in the movepool
		if(moveType != "extra-charged" && this.knowsMove(id)){
			// Select the move that already exists
			if(selectNewMove){
				self.selectMove(moveType, id, index, true)
			}

			return false;
		}

		move.isCustom = true;
		movepool.push(move);

		if(selectNewMove){
			self.selectMove(moveType, id, index, true)
		}

		var props = {
			moveType: moveType,
			moveId: id
		};

		// Don't do this yet, since it breaks Multi-Battle links

		// gm.modifyPokemonEntry(self.speciesId, "movepool", props);

		self.resetMoves();
	}

	// Remove a specific move from the movepool (used for removing Frustration when Shadow type is changed)

	this.removeMove = function(id){
		for(var i = 0; i < self.chargedMovePool.length; i++){
			if(self.chargedMovePool[i].moveId == id){
				self.chargedMovePool.splice(i, 1);

				// Reset to the default moveset if the removed move is selected
				if(self.hasMove(id)){
					self.selectRecommendedMoveset();
				}

				return true;
			}
		}

		return false;
	}

	// This function calculates TDO given moveset and opponent, used for move selection

	this.calculateTDO = function(fastMove, chargedMove, opponent, final){
		var opponentDPS = Math.floor(20 * (100 / this.stats.def));
		var opponentDef = 100;

		if(opponent){
			opponentDPS = opponent.dps;
			opponentDef = opponent.stats.def;
		}

		// Calculate multiple cycles to avoid issues with overflow energy
		var cycleFastMoves = Math.ceil(chargedMove.energy / fastMove.energyGain);
		var cycleTime = cycleFastMoves * (fastMove.cooldown / 1000);
		var cycleDamage = (cycleFastMoves * fastMove.damage) + chargedMove.damage;
		var cycleDPS = cycleDamage / cycleTime;

		if(final){
			this.dps = cycleDPS;
		}

		var timeToFaint = this.stats.hp / opponentDPS;
		var tdo = cycleDPS * timeToFaint;

		return tdo;
	}

	// This function calculates cycle DPT given a moveset

	this.calculateCycleDPT = function(fastMove, chargedMove){
		// Calculate multiple cycles to avoid issues with overflow energy
		var cycleFastMoves = 150 / fastMove.energyGain;
		var cycleTime = (cycleFastMoves * (fastMove.cooldown / 500)) + 1;
		var cycleDamage = (cycleFastMoves * fastMove.damage) + (chargedMove.damage * ((150 / chargedMove.energy)-1)) + 1; // Emulate TDO with a shield
		var cycleDPT = cycleDamage / cycleTime;

		return cycleDPT;
	}

	// This function generates a list of descriptive traits displayed on the rankings page

	this.generateTraits = function(){
		var cupName = "all";
		var category = "overall";

		if(battle.getCup()){
			cupName = battle.getCup().name;
		}

		if(cupName == "custom"){
			cupName = "all";
		}

		// First, look up ranking data to use as a reference

		var key = cupName + category + battle.getCP();
		var rankings = gm.rankings[key];
		var r = false;
		var found = false;

		if(gm.rankings[key]){
			rankings = gm.rankings[key];

			for(var i = 0; i < rankings.length; i++){
				if(rankings[i].speciesId == self.speciesId){
					r = rankings[i];
				}
			}
		}

		// Initialize lists of positive and negative traits
		var pros = [];
		var cons = [];

		// Bulkiness
		var bulk = self.stats.def * self.stats.hp * self.shadowDefMult;
		var bulkScale = [12500,14000,17000,23000];
		var bulkRating = 0;

		if(battle.getCP() == 500){
			bulkScale = [4000,6000,8000,12000];
		} else if(battle.getCP() == 2500){
			bulkScale = [19000,22000,25000,31000];
		} else if(battle.getCP() == 10000){
			bulkScale = [27000,30000,35000,39000];
		}

		if(bulk <= bulkScale[0]){
			if(Math.pow(self.stats.atk * self.shadowAtkMult, 2) > bulk){
				cons.push({
					trait: "Glass Cannon",
					desc: "Hits hard but struggles to take hits. Depends on shields."
				});
			} else{
				cons.push({
					trait: "Glassy",
					desc: "Struggles to take hits and depends on shields."
				});
			}


			bulkRating = -2;

		} else if(bulk <= bulkScale[1]){
			cons.push({
				trait: "Less Bulky",
				desc: "Below average defensive stats and may struggle to take hits."
			});

			bulkRating = -1;
		} else if(bulk >= bulkScale[3]){
			pros.push({
				trait: "Extremely Bulky",
				desc: "Very high defensive stats and can absorb multiple attacks."
			});

			bulkRating = 2;
		} else if(bulk >= bulkScale[2]){
			pros.push({
				trait: "Bulky",
				desc: "Takes hits well."
			});

			bulkRating = 1;
		}

		// Charged Move activation speed
		var activationSpeed = Math.ceil( (self.fastestChargedMove.energy * 2) / self.fastMove.energyGain ) * self.fastMove.cooldown * (1 / 1000); // Avg speed over two cycles to account for overflow energy

		if(activationSpeed <= 12){
			pros.push({
				trait: "Spammy",
				desc: "Reaches Charged Moves quickly."
			});
		} else if(activationSpeed >= 19){
			cons.push({
				trait: "Slow",
				desc: "Takes a long time to reach Charged Moves."
			});
		}

		// Fast Move duration

		if(self.fastMove.cooldown == 500){
			pros.push({
				trait: "Agile",
				desc: "Uses short animations, can react quickly and reliably fire Charged Moves."
			});
		} else if(self.fastMove.cooldown >= 2000){
			cons.push({
				trait: "Clumsy",
				desc: "Uses long animations, is stuck while attacking and may not reliably fire Charged Moves."
			});
		}

		// Charged Move coverage
		var types = Pokemon.getAllTypes();
		var averagePower = 0;
		var totalResistingTypes = 0;
		var totalSuperEffectiveTypes = 0;

		var targetDef = 120;
		if(battle.getCP() == 500){
			targetDef = 75;
		} else if(battle.getCP() == 2500){
			targetDef = 150;
		} else if(battle.getCP() == 10000){
			targetDef = 170;
		}

		for(var i = 0; i < types.length; i++){
			var powerVSType = 0;
			var bestEffectiveness = 0;

			for(var n = 0; n < self.chargedMoves.length; n++){
				if(! self.chargedMoves[n]){
					continue;
				}
				
				var effectiveness = DamageCalculator.getEffectiveness(self.chargedMoves[n].type, [types[i].toLowerCase(), "none"]);
				var effectivePower = ((self.chargedMoves[n].power * self.chargedMoves[n].stab * self.shadowAtkMult * effectiveness) * (self.stats.atk / targetDef));
				var bestChargedMoveSpeed = Math.ceil(self.chargedMoves[n].energy / self.fastMove.energyGain) * (self.fastMove.cooldown / 500);
				effectivePower = effectivePower * (30 / bestChargedMoveSpeed);

				if(effectivePower > powerVSType){
					powerVSType = effectivePower;
				}

				if(effectiveness > bestEffectiveness){
					bestEffectiveness = effectiveness;
				}
			}

			averagePower += powerVSType;

			if(bestEffectiveness < 1){
				totalResistingTypes++;
			} else if(bestEffectiveness > 1){
				totalSuperEffectiveTypes++;
			}
		}

		averagePower /= types.length;

		var inflexible = false;

		if((totalResistingTypes == 0)&&(totalSuperEffectiveTypes >= 5)&&(averagePower >= 200)){
			pros.push({
				trait: "Flexible",
				desc: "Can hit a wide variety of types."
			});
		} else if((totalResistingTypes >= 2)&&(averagePower <= 240)&&(self.speciesId != "mew")){
			cons.push({
				trait: "Inflexible",
				desc: "May struggle to hit multiple types."
			});

			inflexible = true;
		}

		if(((self.chargedMoves.length == 1 || ! self.chargedMoves[1]) || ((self.chargedMoves.length == 2) && (self.chargedMoves[0].type == self.chargedMoves[1].type))) && (! inflexible)){
			cons.push({
				trait: "Inflexible",
				desc: "May struggle to hit multiple types."
			});
		}

		// Switch and safety scores

		if(r){
			if(((r.scores[2] >= 90)||(r.scores[3] >= 90)) && ( (self.fastMove.energyGain / self.fastMove.cooldown) >= (3 / 500))) {
				pros.push({
					trait: "Dynamic",
					desc: "Performs well with energy and has fluid, dynamic matchups."
				});
			}
		}

		// Fast Move pressure

		var effectiveDPT = ((self.fastMove.power * self.fastMove.stab * self.shadowAtkMult) * (self.stats.atk / targetDef)) / (self.fastMove.cooldown / 500);

		if(effectiveDPT >= 4){
			pros.push({
				trait: "Fast Move Pressure",
				desc: "Deals heavy Fast Move damage. It can pressure switches and work around shields."
			});
		} else if(effectiveDPT <= 2){
			cons.push({
				trait: "Low Fast Move Pressure",
				desc: "Deals low Fast Move damage. It may struggle to bring down weakened opponents."
			});
		}

		// Charged Move/Shield Pressure
		var effectivePower = ((self.bestChargedMove.power * self.bestChargedMove.stab * self.shadowAtkMult) * (self.stats.atk / targetDef));
		var bestChargedMoveSpeed = Math.ceil(self.bestChargedMove.energy / self.fastMove.energyGain) * (self.fastMove.cooldown / 500);
		effectivePower = effectivePower * (30 / bestChargedMoveSpeed);

		if(effectivePower >= 210 || self.speciesId == "aegislash_shield"){
			pros.push({
				trait: "Shield Pressure",
				desc: "Pressures opponents to shield its strong or rapid attacks."
			});
		} else if(effectivePower <= 150){
			cons.push({
				trait: "Low Shield Pressure",
				desc: "May struggle to draw shields because of its weaker or slower attacks."
			});
		}

		// Defensive typing
		var totalResistances = 0;
		var totalWeaknesses = 0;
		var doubleWeaknesses = 0;

		for(var key in self.typeEffectiveness){
			if(self.typeEffectiveness[key] < .9){
				totalResistances++;
			} else if(self.typeEffectiveness[key] > 1.1){
				totalWeaknesses++;

				if(self.typeEffectiveness[key] > 2){
					doubleWeaknesses++;
				}
			}
		}

		if((totalResistances >= 6)&&(totalWeaknesses < totalResistances)&&(bulkRating >= 0)){
			pros.push({
				trait: "Defensive",
				desc: "Resists attacks from a wide variety of types."
			});
		} else if((totalWeaknesses >= 5)&&(totalWeaknesses > totalResistances)){
			cons.push({
				trait: "Vulnerable",
				desc: "Takes super effective damage from a wide variety of types."
			});
		}

		if(doubleWeaknesses > 0){
			cons.push({
				trait: "Volatile",
				desc: "Susceptible to one or more double weaknesses."
			});
		}

		// Check for specific move archetypes

		if(self.hasMove("OCTAZOOKA") || self.hasMove("LEAF_TORNADO") || self.hasMove("MIRROR_SHOT") || self.hasMove("MUDDY_WATER") || self.hasMove("TRI_ATTACK")){
			cons.push({
				trait: "Chaotic",
				desc: "Uses move effects that can drastically alter the game but depend on random chance."
			});
		}

		if(self.hasMove("POWER_UP_PUNCH") || self.hasMove("FLAME_CHARGE") || self.hasMove("FELL_STINGER")){
			pros.push({
				trait: "Momentum",
				desc: "Uses stat boosts to build momentum and power through teams."
			});
		}

		var hasSelfDebuffingMove = false;

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(self.chargedMoves[i]?.selfDebuffing){
				hasSelfDebuffingMove = true;
			}
		}

		if(self.hasMove("BUBBLE_BEAM") || self.hasMove("ICY_WIND") || self.hasMove("LUNGE") || self.hasMove("SAND_TOMB") || self.hasMove("ACID_SPRAY") || hasSelfDebuffingMove || self?.formChange){
			// Only give this trait to energy driven Pokemon
			if(self.fastMove.energyGain / self.fastMove.cooldown >= 3 / 500){
				cons.push({
					trait: "Technical",
					desc: "Has complex moves or form changes that may have a high learning curve."
				});
			}
		}

		// Consistency

		if((r)&&(r.scores[5] <= 75)){
			cons.push({
				trait: "Inconsistent",
				desc: "May depend on baits and performs inconsistently."
			});
		}

		return {
			pros: pros,
			cons: cons
		};
	}

	// Generates a list of comparable Pokemon, comparing types, moves, and traits, receives existing as an input

	this.generateSimilarPokemon = function(traits){

		var pokemonList = gm.generateFilteredPokemonList(battle, battle.getCup().include, battle.getCup().exclude);

		for(var i = 0; i < pokemonList.length; i++){
			var pokemon = pokemonList[i];
			pokemon.selectRecommendedMoveset();

			pokemon.similarityScore = self.calculateSimilarity(pokemon, traits);
		}

		pokemonList.sort((a,b) => (a.similarityScore > b.similarityScore) ? -1 : ((b.similarityScore > a.similarityScore) ? 1 : 0));

		return pokemonList;
	}

	// Calculate similarity score with a target Pokemon
	this.calculateSimilarity = function(pokemon, traits, factorRanking = true){
		let similarityScore = 0;

		let id = pokemon.speciesId.replace("_shadow","")

		// A bunch of filtering here to remove Shadows of the same Pokemon and XS entries
		if(id == self.speciesId.replace("_shadow","")){
			return -1;
		}

		// Favor Pokemon with the same or similar types
		for(var n = 0; n < pokemon.types.length; n++){
			if((self.types.indexOf(pokemon.types[n]) > -1)&&(pokemon.types[n] != "none")){
				similarityScore += 400;
			}
		}

		// Favor Pokemon with the same or similar moves

		if(pokemon.fastMove.moveId == self.fastMove.moveId){
			similarityScore += 350;
		} else if(pokemon.fastMove.type == self.fastMove.moveId){
			similarityScore += 50;
		}

		for(var n = 0; n < pokemon.chargedMoves.length; n++){
			if(! pokemon.chargedMoves[n]){
				continue;
			}

			for(var j = 0; j < self.chargedMoves.length; j++){
				if(! self.chargedMoves[j]){
					continue;
				}

				if(pokemon.chargedMoves[n].moveId == self.chargedMoves[j].moveId){
					similarityScore += 200;
				} else if(pokemon.chargedMoves[n].type == self.chargedMoves[j].moveId){
					similarityScore += 50;
				}
			}
		}

		// Favor Pokemon with similar traits
		if(! traits){
			traits = self.generateTraits();
		}

		pokemon.traits = pokemon.generateTraits();

		for(var n = 0; n < pokemon.traits.pros.length; n++){
			for(var k = 0; k < traits.pros.length; k++){
				if(pokemon.traits.pros[n].trait == traits.pros[k].trait){
					similarityScore += 100;

					// Favor Pokemon with similar bulk
					if((pokemon.traits.pros[n].trait == "Bulky")){
						similarityScore += 150;
					}

					// Favor Pokemon with similar bulk
					if((pokemon.traits.pros[n].trait == "Extremely Bulky")){
						similarityScore += 350;
					}
				}

				if((pokemon.traits.pros[n].trait == "Bulky") && (traits.pros[k].trait == "Extremely Bulky")){
					similarityScore += 25;
				}

				if((pokemon.traits.pros[n].trait == "Extremely Bulky") && (traits.pros[k].trait == "Bulky")){
					similarityScore += 25;
				}
			}
		}

		for(var n = 0; n < pokemon.traits.cons.length; n++){
			for(var k = 0; k < traits.cons.length; k++){
				if(pokemon.traits.cons[n].trait == traits.cons[k].trait){
					similarityScore += 50;
				}

				if((pokemon.traits.cons[n].trait == "Less Bulky") && (traits.cons[k].trait == "Glass Cannon")){
					similarityScore += 25;
				}

				if((pokemon.traits.cons[n].trait == "Glass Cannon") && (traits.cons[k].trait == "Less Bulky")){
					similarityScore += 25;
				}
			}
		}

		if(pokemon.overall && factorRanking){
			similarityScore *= Math.pow(pokemon.overall, 1.5);
		}

		return similarityScore;
	}

	// Returns a string that describes how this Pokemon uses XL Candy

	this.needsXLCandy = function(){
		if((self.baseLevelCap <= 40)||(self.levelCap <= 40)){
			return false;
		}

		var level41CP = self.calculateCP(0.795300006866455, 15, 15, 15);

		if(level41CP >= battle.getCP() + 150){
			return false;
		} else{
			return true
		}
	}

	// Return whether or not this Pokemon has a specific move

	this.hasMove = function(moveId){

		if((self.fastMove)&&(self.fastMove.moveId == moveId)){
			return true;
		} else{
			return self.chargedMoves.find(m => m?.moveId == moveId);
		}
	}

	// Return whether or not this Pokemon has a specific move in its movepool

	this.knowsMove = function(moveId){
		moveId = moveId.toUpperCase();
		
		return self.fastMovePool.some(m => m?.moveId == moveId)
			|| self.chargedMovePool.some(m => m?.moveId == moveId)
			|| self.extraChargedMovePool.some(m => m?.moveId == moveId);
	}

	// Return whether or not this Pokemon has a move of a specific type

	this.knowsMoveType = function(type){

		for(var i = 0; i < self.fastMovePool.length; i++){
			if(self.fastMovePool[i].type == type){
				if(self.fastMovePool[i].moveId.indexOf("HIDDEN_POWER") == -1){
					return true;
				}
			}
		}

		for(var i = 0; i < self.chargedMovePool.length; i++){
			if(self.chargedMovePool[i]?.type == type){
				return true;
			}
		}

		return false;
	}

	// Returns a Pokemon's specific move by ID

	this.getMoveById = function(moveId){

		if((self.fastMove)&&(self.fastMove.moveId == moveId)){
			return self.fastMove;
		}

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(self.chargedMoves[i]?.moveId == moveId){
				return self.chargedMoves[i];
			}
		}

		return false;
	}

	// Return whether or not this Pokemon has a move with buff or debuff effects

	this.hasBuffMove = function(){
		var hasBuffMove = false;

		for(var i = 0; i < self.chargedMoves.length; i++){
			if( self.chargedMoves[i]?.buffs && self.chargedMoves[i]?.buffApplyChance < 1){
				hasBuffMove = true;
			}
		}

		return hasBuffMove;
	}

	// Return whether or not this Pokemon has a move with guaranteed or high chance of boosting itself or debuffing the opponent
	// This is used for some battle/AI logic

	this.getBoostMove = function(){
		var boostMove = false;

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(! self.chargedMoves[i]){
				continue;
			}

			if((self.chargedMoves[i].buffs)&&(self.chargedMoves[i].buffApplyChance >= 0.5)&&(! self.chargedMoves[i].selfDebuffing)){
				boostMove = self.chargedMoves[i];
			}
		}

		return boostMove;
	}

	// Return effectiveness array for offense or defense

	/*
	* So this is really weird. Javascript functions declared like this can't be called until
	* after the declaration. I need to call this in the constructor. So instead of moving
	* the one line of code beneath the function declaration, I chose ... this.
	*/

	self.getTypeEffectivenessArray = function(){
		return getTypeEffectivenessArray(self.battle);
	}

	function getTypeEffectivenessArray(battle){

		if(! battle){
			return;
		}

		var arr = [];

		var allTypes = Pokemon.getAllTypes();

		for(var n = 0; n < allTypes.length; n++){
			effectiveness = DamageCalculator.getEffectiveness(allTypes[n], self.types);
			arr[allTypes[n].toLowerCase()] = effectiveness;
		}

		return arr;
	}

	// Resets Pokemon prior to battle

	this.reset = function(isSwitch = false){
		self.hp = self.startHp;
		self.energy = self.startEnergy;
		self.cooldown = self.startCooldown;
		self.damageWindow = 0;
		self.shields = self.startingShields;
		self.statBuffs = [self.startStatBuffs[0], self.startStatBuffs[1]];
		self.faintSource = '';

		if(self.formChange && (self.formChange.resetOnSwitch || ! isSwitch)){
			self.changeForm(self.startFormId);
		}

		self.applyStatBuffs(self.nativeStatBuffs);

		self.resetMoves();
	}

	// Fully reset all Pokemon stats

	this.fullReset = function(){
		self.startHp = self.stats.hp;
		self.startEnergy = 0;
		self.startCooldown = 0;
		self.startStatBuffs = [0, 0];
		self.nativeStatBuffs = [0, 0];
		self.startFormId = self.originalFormId;

		self.reset();
	}

	// Reset stats for emulated battles

	this.resetBattleStats = function(){
		self.battleStats = {
			damage: 0,
			shieldsBurned: 0,
			shieldsUsed: 0,
			damageBlocked: 0,
			damageFromShields: 0,
			shieldsFromShields: 0,
			switchAdvantages: 0,
			energyGained: 0,
			energyUsed: 0,
			chargedDamage: 0
		};
	}

	this.setShields = function(amount){
		this.startingShields = parseInt(amount);
	}

	this.setStartHp = function(amount){
		this.startHp = Math.min(amount, this.stats.hp);

		if(! amount){
			this.startHp = this.stats.hp;
		}
	}

	this.setStartEnergy = function(amount){
		this.startEnergy = Math.min(amount, 100);

		if(! amount){
			this.startEnergy = 0;
		}
	}

	this.setStartBuffs = function(buffs){
		this.startStatBuffs = buffs;
		this.statBuffs = [buffs[0], buffs[1]];
	}

	this.setLevel = function(amount, initialize){
		initialize = typeof initialize !== 'undefined' ? initialize : true;

		self.level = amount;
		self.cpm = self.getCPMByLevel(amount);

		/*if(index % 1 == 0){
			// Set CPM for whole levels
			self.cpm = cpms[index];
		} else{
			// Set CPM for half levels
			self.cpm = Math.sqrt( (Math.pow(cpms[Math.floor(index)], 2) + Math.pow(cpms[Math.ceil(index)], 2)) / 2);
		}*/

		if(amount > self.levelCap){
			self.levelCap = amount;
		}

		if(initialize){
			self.isCustom = true;
			self.initialize(false);
		}
	}

	// Set the Pokemon's Mega Level
	this.setMegaLevel = function(level){
		if(battle.getCP() == 10000){
			if(self.megaLevel != 4 && level == 4){
				self.setLevel(52);
			} else if(self.megaLevel == 4 && level < 4){
				self.setLevel(50);
			}
		}

		self.megaLevel = level;
	}

	this.getCPMByLevel = function(level){
		let index = ((level - 1) * 2);
		return cpms[index];
	}

	// Set this Pokemon's level cap
	this.setLevelCap = function(levelCap){
		self.levelCap = Math.min(levelCap, self.baseLevelCap);
	}

	this.setIV = function(iv, amount){
		if(iv == "atk"){
			this.ivs.atk = parseInt(amount);
		} else if(iv == "def"){
			this.ivs.def = parseInt(amount);
		} else if(iv == "hp"){
			this.ivs.hp = parseInt(amount);
		}

		// Automatically adjust to league cap

		if(self.autoLevel){
			var level = self.levelCap;
			self.cp = 100000;

			while(self.cp > battle.getCP()){
				self.setLevel(level, true);
				level -= 0.5;
			}
		} else{
			self.isCustom = true;
			self.initialize(false);
		}
	}

	// Set battle reference object

	this.setBattle = function(b){
		battle = b;

		self.setLevelCap(battle.getLevelCap());
	}

	// Get battle reference object

	this.getBattle = function(){
		return battle;
	}

	// Buff or debuff stats given an array of buffs

	this.applyStatBuffs = function(buffs){

		var maxBuffStages = gm.data.settings.maxBuffStages;

		for(var i = 0; i < buffs.length; i++){
			self.statBuffs[i] += buffs[i];

			self.statBuffs[i] = Math.min(self.statBuffs[i], maxBuffStages);
			self.statBuffs[i] = Math.max(self.statBuffs[i], -maxBuffStages);
		}
	}

	// Return effective stat after applying modifier, 0 - attack, 1 - defense

	this.getEffectiveStat = function(index, useStartStatBuffs, attackContext){
		useStartStatBuffs = (typeof useStartStatBuffs !== 'undefined') ?  useStartStatBuffs : false

		var multiplier = self.getStatBuffMultiplier(index, useStartStatBuffs);

		if(self.shadowType == "shadow"){
			if(index == 0){
				multiplier *= self.shadowAtkMult;
			} else if(index == 1){
				multiplier *= self.shadowDefMult;
			}
		}

		if(index == 0){
			return self.stats.atk * multiplier;
		} else if(index == 1){
			return self.stats.def * multiplier;
		}

		return false;
	}

	this.getStatBuffMultiplier = function(index, useStartStatBuffs){
		useStartStatBuffs = (typeof useStartStatBuffs !== 'undefined') ?  useStartStatBuffs : false
		var buffDivisor = gm.data.settings.buffDivisor;
		var sourceBuffs = self.statBuffs;
		var multiplier;

		if(useStartStatBuffs){
			sourceBuffs = self.startStatBuffs;
		}

		if(sourceBuffs[index] > 0){
			multiplier = (buffDivisor + sourceBuffs[index]) / buffDivisor;
		} else{
			multiplier = buffDivisor / (buffDivisor - sourceBuffs[index]);
		}

		return multiplier;
	}

	// Return battle rating for this Pokemon

	this.getBattleRating = function(){
		var opponent = battle.getOpponent(self.index);

		if(! opponent){
			return 0;
		}

		return Math.floor( (500 * ((opponent.stats.hp - opponent.hp) / opponent.stats.hp)) + (500 * (self.hp / self.stats.hp)))
	}

	// Return whether or not this Pokemon has a specific tag

	this.hasTag = function(tag){
		return (self.tags.indexOf(tag) > -1);
	}

	// Output a string of numbers for URL building and recreating a Pokemon

	this.generateURLPokeStr = function(context){
		var pokeStr = self.aliasId;

		if((self.isCustom)||(self.startStatBuffs[0] != 0)||(self.startStatBuffs[1] != 0)){
			var arr = [self.level];

			arr.push(self.ivs.atk, self.ivs.def, self.ivs.hp, self.startStatBuffs[0]+gm.data.settings.maxBuffStages, self.startStatBuffs[1]+gm.data.settings.maxBuffStages, self.baitShields, self.optimizeMoveTiming ? 1 : 0);

			// Stat buffs are increased by 4 so the URL doesn't have to deal with parsing negative numbers

			var str = arr.join("-");

			pokeStr += "-" + str;
		}

		if(self.priority != 0){
			pokeStr += "-p";
		}

		if(self.startCooldown == 1000){
			pokeStr += "-d-1000";
		}

		if((self.shadowType != "normal")&&(self.speciesId.indexOf("_shadow") == -1)){
			pokeStr += "-"+self.shadowType;
		}

		if(context == "team-builder"){
			pokeStr += "-m-" + self.generateURLMoveStr();
		}

		return pokeStr;
	}


	// Output a string of numbers for URL building and recreating a moveset

	this.generateURLMoveStr = function(){
		var moveStr = '';

		var fastMoveStr = self.fastMovePool.indexOf(self.fastMove);
		var chargedMove1Str = self.chargedMovePool.indexOf(self.chargedMoves[0])+1;
		var chargedMove2Str = self.chargedMovePool.indexOf(self.chargedMoves[1])+1;
		var chargedMove3Str = self.chargedMoves[2] ? self.extraChargedMovePool.indexOf(self.chargedMoves[2])+1 : null;

		// Check for any custom moves;

		if(self.fastMove.isCustom || settings.hardMovesetLinks){
			fastMoveStr = self.fastMove.moveId;
		}

		if(self.chargedMoves[0]){
			if(self.chargedMoves[0].isCustom || settings.hardMovesetLinks){
				chargedMove1Str = self.chargedMoves[0].moveId;
			}
		}

		if(self.chargedMoves[1]){
			if(self.chargedMoves[1].isCustom || settings.hardMovesetLinks){
				chargedMove2Str = self.chargedMoves[1].moveId;
			}
		}

		if(self.chargedMoves[2]){
			if(self.chargedMoves[2].isCustom || settings.hardMovesetLinks){
				chargedMove3Str = self.chargedMoves[2].moveId;
			}
		}

		if(chargedMove3Str){
			moveStr = fastMoveStr + "-" + chargedMove1Str + "-" + chargedMove2Str + "-" + chargedMove3Str;
		} else{
			moveStr = fastMoveStr + "-" + chargedMove1Str + "-" + chargedMove2Str;
		}
		

		return moveStr;
	}

	// Output a string of the Pokemon's moveset abbreviation

	this.generateMovesetStr = function(){
		var moveAbbreviationStr = self.fastMove.abbreviation;
		var movesToDisplay = self.chargedMoves.filter(m => m !== null);

		for(var i = 0; i < movesToDisplay.length; i++){
			if(i == 0){
				moveAbbreviationStr += "+" + movesToDisplay[i].abbreviation;
			} else{
				moveAbbreviationStr += "/" + movesToDisplay[i].abbreviation;
			}
		}

		return moveAbbreviationStr;
	}

	// Change the value of this Pokemon's form type (normal, shadow, purified)

	this.setShadowType = function(val){
		self.shadowType = val;

		if(self.shadowType == "shadow"){
			self.shadowAtkMult = DamageMultiplier.SHADOW_ATK;
			self.shadowDefMult = DamageMultiplier.SHADOW_DEF;

			if(self.speciesName.indexOf("Shadow") == -1){
				self.speciesName = self.speciesName + " (Shadow)";

				// Add Frustration as a custom move
				if(! self.knowsMove("FRUSTRATION")){
					self.addNewMove("FRUSTRATION", self.chargedMovePool, false);
				}
			}
		} else{
			self.shadowAtkMult = 1;
			self.shadowDefMult = 1;

			if(self.speciesName.indexOf(" (Shadow)") > -1){
				self.speciesName = self.speciesName.replace(" (Shadow)","");

				// Remove Frustration if added as a Custom Move
				self.removeMove("FRUSTRATION");
			}
		}
	}

	// Calculate consistency score based on moveset, used in rankings and the team builder

	this.calculateConsistency = function(){

		var fastMove = self.fastMove;
		var chargedMoves = self.chargedMoves.filter(m => m !== null);
		var consistencyScore = 1;

		// Reset move stats
		fastMove.damage = fastMove.power * fastMove.stab;

		for(var i = 0; i < chargedMoves.length; i++){
			chargedMoves[i].damage = chargedMoves[i].power * chargedMoves[i].stab;
		}

		// Only calculate with multiple Charged Moves
		if(chargedMoves.length > 1){

			var effectivenessScenarios = [
				[1, 1]
				];

			if(chargedMoves[0].type != chargedMoves[1].type){
				effectivenessScenarios.push(
					[0.625, 1],
					[1, 0.625]
				);
			}

			// Here we are looking at how depenendent each Pokemon is on baiting in scenarios where both moves are neutral, or one or the other is resisted
			for(var n = 0; n < effectivenessScenarios.length; n++){
				// Sort moves by name as a starting point
				chargedMoves.sort((a,b) => (a.name > b.name) ? -1 : ((b.name > a.name) ? 1 : 0));

				// Need to reset this number because of how movesets are generated
				chargedMoves.forEach((move, index) => {
					if(index < 2){
						chargedMoves[index].dpe = (chargedMoves[index].damage / chargedMoves[index].energy) * effectivenessScenarios[n][index];
					} else if(chargedMoves[index].type == chargedMoves[0].type){
						chargedMoves[index].dpe = (chargedMoves[index].damage / chargedMoves[index].energy) * effectivenessScenarios[n][0];
					} else if(chargedMoves[index].type == chargedMoves[1].type){
						chargedMoves[index].dpe = (chargedMoves[index].damage / chargedMoves[index].energy) * effectivenessScenarios[n][1];
					} else {
						chargedMoves[index].dpe = chargedMoves[index].damage / chargedMoves[index].energy;
					}
				});

				chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

				// Factor in Power-Up Punch where Pokemon may be consistent spamming it

				if(chargedMoves.at(-1).moveId == "POWER_UP_PUNCH"){
					chargedMoves.at(-1).dpe *= 2;
					chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));
				}

				// Calculate how much fast move vs charged move damage this Pokemon puts out per cycle
				var cycleFastMoves = Math.ceil(chargedMoves[0].energy / fastMove.energyGain);
				var cycleFastDamage = fastMove.damage * cycleFastMoves;
				var cycleDamage = cycleFastDamage + chargedMoves[0].damage;

				if(fastMove.type == chargedMoves[0].type){
					cycleFastDamage *= effectivenessScenarios[n][0];
				} else if(fastMove.type == chargedMoves[1].type){
					cycleFastDamage *= effectivenessScenarios[n][1];
				}

				var factor = 1;
				if((chargedMoves[0].energy > chargedMoves[1].energy)||( (chargedMoves[0].energy == chargedMoves[1].energy) && (chargedMoves[1].moveId == "ACID_SPRAY")||((chargedMoves[0].selfAttackDebuffing)&&(! chargedMoves[1].selfDebuffing)&&(chargedMoves[1].energy - chargedMoves[0].energy <= 10))||((chargedMoves[0].selfDebuffing)&&(chargedMoves[0].energy > 50)&&(! chargedMoves[1].selfDebuffing)&&(chargedMoves[1].energy - chargedMoves[0].energy <= 10)))){
					factor = (cycleFastDamage / cycleDamage) + ((chargedMoves[0].damage / cycleDamage) * (chargedMoves[1].dpe / chargedMoves[0].dpe));

					// If the difference in energy is small, improve the consistency score as players may play straight more often
					if(chargedMoves[1].energy < chargedMoves[0].energy && ! chargedMoves[0].selfBuffing){
						factor += (1 - factor) * ((chargedMoves[1].energy-30) / (chargedMoves[0].energy-30)) * 0.5;
					} else if(chargedMoves[1].energy < chargedMoves[0].energy && chargedMoves[0].selfBuffing){
						factor += (1 - factor) * ((chargedMoves[1].energy-20) / (chargedMoves[0].energy-20)); // Players are more likely to spam self buffing moves than bait with non buffing moves
					}
				}

				// Add a factor for chance buff moves, especially high chance moves
				var buffChanceFactor = 0;

				for(var i = 0; i < chargedMoves.length; i++){

					if(chargedMoves[i].buffs && chargedMoves[i].buffApplyChance < 1 && chargedMoves[i].buffApplyChance > .15){
						var buffStages = Math.abs(chargedMoves[i].buffs[0]) + Math.abs(chargedMoves[i].buffs[1]);
						var buffConsistency = 0.5 + Math.abs(0.5 - chargedMoves[i].buffApplyChance); // 50% is the most chaotic, 10% the least

						// Roughly correlate buff strength to damage
						var buffsAsDamage = chargedMoves[i].damage + (buffStages * 25 * (1 - buffConsistency));

						buffChanceFactor += chargedMoves[i].damage / buffsAsDamage;
					} else{
						buffChanceFactor += 1;
					}
				}

				buffChanceFactor /= chargedMoves.length;


				consistencyScore *= factor * buffChanceFactor;
			}

			// Now do a square root mean
			consistencyScore = Math.pow(consistencyScore, (1/effectivenessScenarios.length));
		}

		// Factor in fast move duration, slower moves are less consistent
		/*var fastMoveConsistency = .5 + (.5 * (1 / (fastMove.cooldown / 500)));

		consistencyScore = ((consistencyScore * 6) + (fastMoveConsistency * 1)) / 7;*/

		// Penalize specific moves
		if(self.hasMove("POWER_UP_PUNCH")){
			consistencyScore *= .85;
		}

		if(self.hasMove("LUNGE")){
			consistencyScore *= .85;
		}

		if(self.hasMove("FEATHER_DANCE")){
			consistencyScore *= .75;
		}

		if(self.hasMove("BUBBLE_BEAM")){
			consistencyScore *= .75;
		}

		consistencyScore = Math.round(consistencyScore * 1000) / 10;

		return consistencyScore;
	}

	// Return an array of slot numbers which contain this Pokemon in a slot based meta

	this.getSlotNumbers = function(cup, forDisplay = true){
		let includedSlots = [];

		if(! cup?.slots){
			return includedSlots;
		}

		for(let i = 0; i < cup.slots.length; i++){
			if(cup.slots[i].pokemon.includes(self.speciesId) || cup.slots[i].pokemon.includes(self.speciesId.replace("_shadow","") )){
				if(forDisplay){
					includedSlots.push(i+1);
				} else{
					includedSlots.push(i);
				}
				
			}
		}

		return includedSlots;
	}

	// Return a numerical value for this Pokemon's evolution stage

	this.getEvolutionStage = function(){
		// Does not evolve and has no pre-evolution
		var stage = 0;

		if(this.family){
			// Evolves and has no pre-evolution
			if(this.family.evolutions && ! this.family.parent){
				stage = 1;
			}

			// Evolves and has a pre-evolution
			if(this.family.evolutions && this.family.parent){
				stage = 2;
			}

			// Does not evolve and has a pre-evolution
			if(! this.family.evolutions && this.family.parent){
				stage = 3;
			}
		}

		return stage;
	}

	// Change the Pokemon's form during battle

	this.changeForm = function(id){
		id = typeof id !== 'undefined' ? id : null;

		var formId = id;
		var form = gm.getPokemonById(formId);

		this.speciesName = form.speciesName;
		this.activeFormId = formId;
		this.types = [ form.types[0], form.types[1] ];
		this.typeEffectiveness = getTypeEffectivenessArray(battle);
		
		if(form?.formChange){
			this.formChange = form.formChange;
		}
		
		// Adjust base stats and CP if new form has different stats
		if(this.baseStats.atk != form.baseStats.atk || this.baseStats.def != form.baseStats.def || this.baseStats.hp != form.baseStats.hp){
			let newStats = self.getFormStats(formId);
			this.baseStats = { atk: form.baseStats.atk, def: form.baseStats.def, hp: form.baseStats.hp};
			this.stats.atk = newStats.atk;
			this.stats.def = newStats.def;
			//this.stats.hp = newStats.hp;
		}

		// Apply form specific stat buffs or debuffs
		if(form?.nativeStatBuffs){
			self.nativeStatBuffs[0] = form.nativeStatBuffs[0];
			self.nativeStatBuffs[1] = form.nativeStatBuffs[1];

			self.applyStatBuffs(self.nativeStatBuffs);
		}

		// Form specific functionality
		switch(formId){
			case "morpeko_full_belly":
				self.replaceMove("charged", "AURA_WHEEL_DARK", "AURA_WHEEL_ELECTRIC");
			break;

			case "morpeko_hangry":
				self.replaceMove("charged", "AURA_WHEEL_ELECTRIC", "AURA_WHEEL_DARK");
			break;

			case "aegislash_blade":
				self.replaceMove("fast", "AEGISLASH_CHARGE_AIR_SLASH", "AIR_SLASH");
				self.replaceMove("fast", "AEGISLASH_CHARGE_PSYCHO_CUT", "PSYCHO_CUT");
			break;

			case "aegislash_shield":
				self.replaceMove("fast", "AIR_SLASH", "AEGISLASH_CHARGE_AIR_SLASH");
				self.replaceMove("fast", "PSYCHO_CUT", "AEGISLASH_CHARGE_PSYCHO_CUT");
			break;
		}

		self.resetMoves();
	}

	// Obtain the active combat stats of this Pokemon in a different form

	this.getFormStats = function(formId){
		let newForm = gm.getPokemonById(formId);
		let newLevel = self.level;
		let cpmIndex = cpms.indexOf(self.cpm);
		let battleCP = battle.getCP();

		// Form specific cases
		if(self.speciesId != formId){
			switch(formId){
				case "aegislash_blade":
					if(battleCP == 1500){
						newLevel = Math.ceil(self.level * 0.5) + 1;
					}

					if(battleCP == 2500){
						newLevel = Math.ceil(self.level * 0.75);
					}

					cpmIndex = cpms.indexOf(self.getCPMByLevel(newLevel));
					break;

				case "aegislash_shield":
					if(battleCP == 1500){
						newLevel = (self.level / 0.5) + 2;
					}

					if(battleCP == 2500){
						newLevel = Math.round(self.level / 0.75);
					}

					cpmIndex = cpms.indexOf(self.getCPMByLevel(newLevel));
					break;
			}
		}

		let newCPM = cpms[cpmIndex];
		let newCP = self.cp;
		let newStats;

		// This loop reduces the new form's effective level until it fits under the CP cap
		while((! newStats || newCP > battleCP) && cpmIndex >= 0){
			cpmIndex = cpms.indexOf(self.getCPMByLevel(newLevel));
			newCPM = cpms[cpmIndex];

			newCP = self.calculateCPByBaseStats(newCPM, newForm.baseStats.atk, newForm.baseStats.def, newForm.baseStats.hp);

			newStats = {
				atk: newCPM * (newForm.baseStats.atk + self.ivs.atk),
				def: newCPM * (newForm.baseStats.def + self.ivs.def),
				hp: Math.max(Math.floor(newCPM * (newForm.baseStats.hp+self.ivs.hp)), 10),
				level: newLevel
			}

			newLevel--;
		}

		return newStats;
	}

	// Replaces a move in a Pokemon's move pool during battle (eg Morpeko)

	this.replaceMove = function(moveType, oldMoveId, newMoveId){
		if(moveType == "fast" && self.fastMove){
			if(self.fastMove.moveId == oldMoveId){
				self.selectMove(moveType, newMoveId, 0, true);
			}
		} else if(moveType == "charged"){
			var moveIndex = self.chargedMoves.findIndex(m => m.moveId == oldMoveId);
			if(moveIndex > -1){
				self.selectMove(moveType, newMoveId, moveIndex, true);
			}
		}
	}

	// Returns whether or not this Pokemon has access to a third charged move
	
	this.hasThirdChargedMove = function(){
		return self.hasTag("mega");
	}


}

/* STATIC METHODS */

// Given Fast Move and Charged Move objects, calculate and return the move counts for 3 cycles

Pokemon.calculateMoveCounts = function(fastMove, chargedMove){
	var counts = [];

	counts.push( Math.ceil( (chargedMove.energy * 1) / fastMove.energyGain) );
	counts.push( Math.ceil( (chargedMove.energy * 2) / fastMove.energyGain) - counts[0] );
	counts.push( Math.ceil( (chargedMove.energy * 3) / fastMove.energyGain) - counts[0] - counts[1] );
	counts.push( Math.ceil( (chargedMove.energy * 4) / fastMove.energyGain) - counts[0] - counts[1] - counts[2] );

	return counts;

}

// Return array of all Pokemon types

Pokemon.getAllTypes = function(lowerCase = false){
	let types = ["Bug","Dark","Dragon","Electric","Fairy","Fighting","Fire","Flying","Ghost","Grass","Ground","Ice","Normal","Poison","Psychic","Rock","Steel","Water"];

	if(lowerCase){
		types = types.map(type => type.toLowerCase());
	}

	return types;
}
;
class Player {
	/**
	 * Represents a player in a battle
	 * @param {number} index 
	 * @param {any} aiType 
	 * @param {Battle} battle 
	 */
	constructor(index, aiType, battle) {
		this.index = index;
		this.battle = battle;
		
		// Initialize AI
		this.ai = aiType !== false ? new TrainingAI(aiType, this, battle) : false;
		
		// Arrays for Pokemon
		this.team = []; // Pokemon in the battle
		this.roster = []; // Full 6 Pokemon team
		
		// Battle properties
		this.shields = 2;
		this.switchTimer = 0;
		this.switchTime = 45000;
		this.wins = 0;
		this.priority = index;
	}

	reset() {
		this.shields = 2;
		this.switchTimer = 0;

		for (const pokemon of this.roster) {
			pokemon.reset();
		}
	}

	getRoster() {
		return this.roster;
	}

	setRoster(val) {
		this.roster = val;

		// For team generation purposes, give each Pokemon 2 shields and fully reset
		for (const pokemon of this.roster) {
			pokemon.setShields(2);
			pokemon.fullReset();
		}
	}

	getTeam() {
		return this.team;
	}

	setTeam(val) {
		this.team = val;

		// Reset battle stats
		for (const pokemon of this.team) {
			pokemon.resetBattleStats();
		}
	}

	/**
	 * Returns the number of shields remaining
	 * @returns {0|1|2}
	 */
	getShields() {
		return this.shields;
	}

	/**
	 * Attempts to use shield. Returns `true` if successful, otherwise returns `false`
	 * @returns {boolean}
	 */
	useShield() {
		if (this.shields > 0) {
			this.shields--;
			return true;
		}
		return false;
	}

	/**
	 * Returns the current switch timer in milliseconds
	 * @returns {number}
	 */
	getSwitchTimer() {
		return this.switchTimer;
	}

	/**
	 * 
	 * @param {number} val 
	 */
	setSwitchTime(val) {
		this.switchTime = val;
	}

	/**
	 * Starts the switch timer
	 */
	startSwitchTimer() {
		this.switchTimer = this.switchTime;

		console.log(this.switchTime);
	}

	decrementSwitchTimer(deltaTime) {
		// Evaluate the matchup when the switch clock completes
		let evaluateMatchup = false;
		if ((this.switchTimer <= deltaTime) && (this.switchTimer > 0)) {
			evaluateMatchup = true;
		}

		this.switchTimer = Math.max(this.switchTimer - deltaTime, 0);

		if ((this.index == 1) && evaluateMatchup) {
			this.ai.evaluateMatchup(
				this.battle.getTurns(),
				this.battle.getPokemon()[1],
				this.battle.getPokemon()[0],
				this.battle.getPlayers()[0]
			);
		}
	}

	/**
	 * Return the AI controlling this player
	 * @returns {TrainingAI}
	 */
	getAI() {
		return this.ai;
	}

	/**
	 * Return the player's index
	 * @returns {number}
	 */
	getIndex() {
		return this.index;
	}

	/**
	 * Returns this priority of the player
	 * @returns {number}
	 */
	getPriority() {
		return this.priority;
	}

	/**
	 * Sets the priority of the player
	 * @param {number} val
	 */
	setPriority(val) {
		this.priority = val;
	}

	/**
	 * Returns the number of remaining Pokemon
	 * @returns {number}
	 */
	getRemainingPokemon() {
		let count = 0;

		for (const pokemon of this.team) {
			if (pokemon.hp > 0) {
				count++;
			}
		}

		return count;
	}

	/**
	 * Generate a random roster for this player
	 * @param {number} partySize
	 * @param {Function} callback
	 * @param {boolean} [customTeamPool=false]
	 */
	generateRoster(partySize, callback, customTeamPool = false) {
		this.ai.generateRoster(partySize, callback, customTeamPool);
	}

	/**
	 * Generate a team of 3 with an established roster
	 * @param opponentRoster
	 * @param {'win' | 'loss'} [previousResult]
	 * @param previousTeams
	 */
	generateTeam(opponentRoster, previousResult, previousTeams) {
		if (!previousResult) {
			this.ai.generateTeam(opponentRoster);
		} else {
			this.ai.generateTeam(opponentRoster, previousResult, previousTeams);
		}
	}
}

;
/**
 * Type of TimelineAction
 * @typedef {"fast" | "charged" | "wait" | 'switch'} TimelineActionType
 */

/**
 * An action set in Sandbox Mode to be interpreted by Battle.js into a TimelineEvent
 */

class TimelineAction {
	/**
	 * @type {TimelineActionType}
	 */
	type;

	actor;

	/**
	 * @type {number}
	 */
	turn;

	/**
	 * Index of charged move to use
	 * @type {number}
	 */
	value;

	/**
	 * @type {any}
	 */

	settings;

	/**
	 * @type {boolean}
	 */
	processed;

	/**
	 * Whether this action has been processed yet or not
	 * @type {boolean}
	 */
	valid;

	/**
	 *
	 * @param {TimelineActionType} type
	 * @param actor
	 * @param {number} turn
	 * @param {number} value
	 * @param {any} settings
	 */
	constructor(type, actor, turn, value, settings) {
		this.type = type;
		this.actor = actor;
		this.turn = turn;
		this.value = value;
		this.settings = settings;
		this.valid = false;
		this.processed = false;
	}

	/**
	 * Converts the type to an integer
	 * @returns {0|1|2}
	 */
	typeToInt() {
		switch (this.type) {
			case "fast":
			case "charged":
				return 1;
				break;

			case "wait":
				return 2;
				break;
		}

		return 0;
	}
}

;
/**
 * @typedef {
 *      'switchAvailable' | 'faint' | 'tap interaction' |
 *      'tap interaction wait' | `tap{string}` | 'shield'
 *      } TimelineEventType
 */

/**
 * An event that occurs in the timeline
 */

class TimelineEvent {
	/**
	 * @type {TimelineEventType}
	 */
	type;
	/**
	 * @type {string}
	 */
	name;

	actor;

	/**
	 * @type {number}
	 */
	time;

	/**
	 * @type {number}
	 */
	turn;

	/**
	 * @type {Array<number>}
	 */
	values;

	/**
	 * @type {Boolean}
	 */
	editable;

	/**
	 *
	 * @param {TimelineEventType} type
	 * @param {string} name
	 * @param actor
	 * @param {number} time
	 * @param {number} turn
	 * @param {Array<number>} [values]
	 */
	constructor(type, name, actor, time, turn, values = [0], editable = true) {
		this.type = type;
		this.name = name;
		this.actor = actor;
		this.time = time;
		this.turn = turn;
		this.values = values; // 0 - damage, 1 - energy
		this.editable = editable;
	}
}

;

class ActionLogic {

	// Run AI decision making to determine battle action this turn, and return the resulting action

	static decideAction(battle, poke, opponent){
		let turns = battle.getTurns()
		let action;
		let chargedMoveReady = []; // Array containing how many turns to reach active charged attacks
		let winsCMP = poke.stats.atk >= opponent.stats.atk;

		let fastDamage = DamageCalculator.damage(poke, opponent, poke.fastMove);
		let oppFastDamage = DamageCalculator.damage(opponent, poke, opponent.fastMove);
		let hasNonDebuff = false;

		// If no Charged Moves at all, return
		if(poke.activeChargedMoves.length < 1){
			return;
		}

		// If no charged move ready or farm energy is on, always throw fast move
		if (poke.energy < poke.fastestChargedMove.energy || poke.farmEnergy) {
			return;
		}

		// Evaluate cooldown to reach each charge move
		for(var n = 0; n < poke.activeChargedMoves.length; n++) {
			if (!poke.activeChargedMoves[n].selfDebuffing) {
				hasNonDebuff = true;
			}
			if (poke.energy >= poke.activeChargedMoves[n].energy) {
				chargedMoveReady.push(0);
			} else {
				chargedMoveReady.push(Math.ceil((poke.activeChargedMoves[n].energy - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.turns);
			}
		}

		let turnsToLive = Infinity;
		let queue = [];
		let moveTurns = poke.fastMove.turns;

		// Check if opponent is in the middle of a fast move and adjust accordingly
		// ELEMENTS OF STATE: POKEMON HP, OPPONENT ENERGY, CURRENT TURN, SHIELDS

		if (opponent.cooldown != 0) {
			queue.unshift(
				{
					hp: poke.hp - oppFastDamage,
					opEnergy: opponent.energy + opponent.fastMove.energyGain,
					turn: opponent.cooldown / 500,
					shields: poke.shields
				}
			);
		} else {
			queue.unshift(
				{
					hp: poke.hp,
					opEnergy: opponent.energy,
					turn: 0,
					shields: poke.shields
				}
			);
		}

		// Check if opponent can KO in your fast move cooldown
		while (queue.length != 0) {

			var currState = queue.shift();

			// If turn > when you can act before your opponent, move to the next item in the queue

			if(currState.hp > oppFastDamage){
				if (winsCMP) {
					if (currState.turn > poke.fastMove.turns) {
						continue;
					}
				} else {
					if (currState.turn > poke.fastMove.turns + 1) {
						continue;
					}
				}
			}

			// Shield bait if shields are up, otherwise try to KO
			if (currState.shields != 0) {
				if (currState.opEnergy >= opponent.fastestChargedMove.energy) {
					queue.unshift(
						{
							hp: currState.hp - 1,
							opEnergy: currState.opEnergy - opponent.fastestChargedMove.energy,
							turn: currState.turn + 1,
							shields: currState.shields - 1
						}
					);
				}
			} else {
				// Check if any charge move KO's, add results to queue
				for(var n = 0; n < opponent.activeChargedMoves.length; n++) {

					if (currState.opEnergy >= opponent.activeChargedMoves[n].energy) {
						var moveDamage = DamageCalculator.damage(opponent, poke, opponent.activeChargedMoves[n]);

						if (moveDamage >= currState.hp) {
							turnsToLive = Math.min(currState.turn, turnsToLive);

							if(poke.stats.atk > opponent.stats.atk && opponent.fastMove.cooldown % poke.fastMove.cooldown == 0){
								turnsToLive++;
							}

							battle.logDecision(poke, " opponent has energy to use " + opponent.activeChargedMoves[n].name + " and it would do " + moveDamage + " damage. I have " + turnsToLive + " turn(s) to live, opponent has " + currState.opEnergy);
							break;
						}
						queue.unshift(
							{
								hp: currState.hp - moveDamage,
								opEnergy: currState.opEnergy - opponent.activeChargedMoves[n].energy,
								turn: currState.turn + 1,
								shields: currState.shields
							}
						);
					}
				}
			}

			// Check if a fast move faints, add results to queue
			if (currState.hp - oppFastDamage <= 0) {
				turnsToLive = Math.min(currState.turn + (opponent.fastMove.turns), turnsToLive);
				break;
			} else {
				queue.unshift(
					{
						hp: currState.hp - oppFastDamage,
						opEnergy: currState.opEnergy + opponent.fastMove.energyGain,
						turn: currState.turn + opponent.fastMove.turns,
						shields: currState.shields
					}
				);
			}
		}

		// If you can't throw a fast move and live, throw whatever move you can with the most damage
		if (turnsToLive != -1) {
			if(poke.hp <= opponent.fastMove.damage * 2 && opponent.fastMove.cooldown == 500){
				turnsToLive--;
			}

			// Anticipate a Fast Move landing that has already initiated
			if((poke.hp <= opponent.fastMove.damage)&&(opponent.cooldown > 0)&&(opponent.fastMove.cooldown > 500)){
				turnsToLive = opponent.cooldown / 500;

				if(opponent.hp > poke.fastMove.damage){
					turnsToLive--;
				}
			}

			// Anticipate a Fast Move landing if you use your Fast Move
			if(poke.hp <= opponent.fastMove.damage && opponent.cooldown == 0 && opponent.fastMove.cooldown <= poke.fastMove.cooldown + 500){
				if(opponent.hp > poke.fastMove.damage){
					turnsToLive--;
				}
			}

			if (turnsToLive * 500 < poke.fastMove.cooldown || (turnsToLive * 500 == poke.fastMove.cooldown && !winsCMP) || (turnsToLive * 500 == poke.fastMove.cooldown && poke.hp <= opponent.fastMove.damage)) {

				var maxDamageMoveIndex = 0;
				var prevMoveDamage = -1;

				for(var n = poke.activeChargedMoves.length; n >= 0; n--) {

					// Find highest damage available move
					if (chargedMoveReady[n] == 0) {
						var moveDamage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);

						// If this move deals more damage than the other move, use it
						if (moveDamage > prevMoveDamage){
							maxDamageMoveIndex = poke.chargedMoves.indexOf(poke.activeChargedMoves[n]);
							prevMoveDamage = moveDamage;
						}

						// If the Pokemon can fire two of this move and deal more damage, use it
						if(poke.energy >= poke.activeChargedMoves[n].energy * 2 && poke.stats.atk > opponent.stats.atk && moveDamage * 2 > prevMoveDamage){
							maxDamageMoveIndex = poke.chargedMoves.indexOf(poke.activeChargedMoves[n]);
							prevMoveDamage = moveDamage * 2;
						}
					}
				}


				// If no moves available, throw fast move
				if (prevMoveDamage == -1) {
					battle.logDecision(poke, " uses a fast move because it has " + turnsToLive + " turn(s) before it is KO'd but has no energy.");
					return;
				// Throw highest damage move
				} else {

					battle.logDecision(poke, " uses " + poke.chargedMoves[maxDamageMoveIndex].name + " because it has " + turnsToLive + " turn(s) before it is KO'd.");

					action = new TimelineAction(
						"charged",
						poke.index,
						turns,
						maxDamageMoveIndex,
						{shielded: false, buffs: false, priority: poke.priority});

					return action;
				}
			}
		}

		// Throw a lethal Charged Move if it will faint the opponent

		if(! poke.farmEnergy && opponent.shields == 0){
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {
				var move = poke.activeChargedMoves[n];
				var moveIndex = poke.chargedMoves.indexOf(poke.activeChargedMoves[n]);

				if(poke.energy >= move.energy){
					var moveDamage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);

					// Don't throw self debuffing moves at this point, or if the opponent will faint from Fast Move damage
					if(opponent.hp <= moveDamage && (! move.selfDebuffing) && (n == 0 || (n == 1 && ! poke.baitShields)) && opponent.hp > poke.fastMove.damage){

						action = new TimelineAction(
							"charged",
							poke.index,
							turns,
							moveIndex,
							{shielded: false, buffs: false, priority: poke.priority});

						return action;
					}
				}
			}
		}

		// If opponent is Mimikyu or has similar mechanic, throw fastest Charged Attack ASAP
		if(opponent.formChange && opponent?.formChange?.effect == "protect" && opponent.shields == 0){
			if(poke.energy >= poke.fastestChargedMove.energy && ! poke.fastestChargedMove.selfDebuffing){
				let moveIndex = poke.chargedMoves.indexOf(poke.fastestChargedMove);

				battle.logDecision(poke, " uses " + poke.fastestChargedMove.name + " to break opponent's ability as soon as possible.");

				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					moveIndex,
					{shielded: false, buffs: false, priority: poke.priority});

				return action;
			}
		}

		// Optimize move timing to reduce free turns
		if(poke.optimizeMoveTiming){
			var targetCooldown = 500; // Look to throw moves when opponent is at this cooldown or lower

			if(poke.fastMove.cooldown >= 2000){
				targetCooldown = 1000;
			}

			if((poke.fastMove.cooldown >= 1500)&&(opponent.fastMove.cooldown == 2500)){
				targetCooldown = 1000;
			}

			if((poke.fastMove.cooldown == 1000)&&(opponent.fastMove.cooldown == 2000)){
				targetCooldown = 1000;
			}

			// Don't optimize timing for Pokemon with the same duration moves
			if(poke.fastMove.cooldown == opponent.fastMove.cooldown){
				targetCooldown = 0;
			}

			// Don't optimize timing for Pokemon with longer, even duration moves (ie 4 vs 2, 3 vs 1)
			if(poke.fastMove.cooldown % opponent.fastMove.cooldown == 0 && poke.fastMove.cooldown > opponent.fastMove.cooldown){
				targetCooldown = 0;
			}

			// Perform additional checks to execute optimal timing
			if( (opponent.cooldown == 0 || opponent.cooldown > targetCooldown) && targetCooldown > 0) {
				var optimizeTiming = true;

				// Don't optimize if we're about to faint from a fast move
				if(poke.hp <= opponent.fastMove.damage){
					optimizeTiming = false;
				}

				// Don't optimize if we'll go over 100 energy
				var queuedFastMoves = 0;
				var queuedActions = battle.getQueuedActions();
				for(var i = 0; i < queuedActions.length; i++){
					if((queuedActions[i].actor == poke.index)&&(queuedActions[i].type == "fast")){
						queuedFastMoves++;
					}
				}

				queuedFastMoves++; // Add 1 for the Fast Move we are thinking about doing

				if(poke.energy + (poke.fastMove.energyGain * queuedFastMoves) > 100){
					optimizeTiming = false;
				}

				// Don't optimize if we have fewer turns to live than we can throw Charged Moves
				var turnsPlanned = poke.fastMove.turns + Math.floor(poke.energy / poke.activeChargedMoves[0].energy);

				if(poke.stats.atk < opponent.stats.atk){
					turnsPlanned++;
				}

				if(turnsPlanned > turnsToLive){
					optimizeTiming = false;
				}

				battle.logDecision(poke, " has " + turnsToLive + " turns to live");

				// Don't optimize if we can KO with a Charged Move
				if(opponent.shields == 0){
					for(var n = 0; n < poke.activeChargedMoves.length; n++) {
						poke.activeChargedMoves[n].damage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);

						if (poke.energy >= poke.activeChargedMoves[n].energy && poke.activeChargedMoves[n].damage >= opponent.hp) {

							optimizeTiming = false;
							break;
						}
					}
				}

				// Don't optimize if our opponent can KO with a Charged Move
				for(var n = 0; n < opponent.activeChargedMoves.length; n++) {
					var fastMovesFromCharged = Math.ceil((opponent.activeChargedMoves[n].energy - opponent.energy) / opponent.fastMove.energyGain);
					var fastMovesInFastMove = Math.floor(poke.fastMove.cooldown / opponent.fastMove.cooldown); // How many Fast Moves can the opponent get in if we do an extra move?
					var turnsFromMove = (fastMovesFromCharged * opponent.fastMove.turns) + 1;

					opponent.activeChargedMoves[n].damage = DamageCalculator.damage(opponent, poke, opponent.activeChargedMoves[n]);

					var moveDamage = opponent.activeChargedMoves[n].damage + (opponent.fastMove.damage * fastMovesInFastMove);

					if(poke.shields > 0){
						moveDamage = 1 + (opponent.fastMove.damage * fastMovesInFastMove)
					}

					if (turnsFromMove <= poke.fastMove.turns && moveDamage >= poke.hp) {
						optimizeTiming = false;
						break;
					}
				}

				// Don't optimize if the opponent will KO with Fast Moves it can fit into our Fast Move
				var fastMovesInFastMove = Math.floor( (poke.fastMove.cooldown + 500) / opponent.fastMove.cooldown);
				if(poke.hp <= opponent.fastMove.damage * fastMovesInFastMove){
					optimizeTiming = false;
				}



				if(optimizeTiming){
					battle.logDecision(poke, " is optimizing move timing");
					return;
				}
			}
		}

		// If Cramorant has not changed form, use Dive or Surf as soon as possible if other moves aren't meaningfully more effective
		if(poke.activeFormId == "cramorant"){
			let gulpMove = poke.activeChargedMoves.find(move => move.moveId == "DIVE" || move.moveId == "SURF");
			let nonGulpMove = poke.activeChargedMoves.find(move => move.moveId != "DIVE" && move.moveID != "SURF");

			if(gulpMove && nonGulpMove && poke.energy >= gulpMove.energy
				&& opponent.hp > nonGulpMove.damage * 1.3 && nonGulpMove.dpe / gulpMove.dpe < 1.5){

				let moveIndex = poke.chargedMoves.indexOf(gulpMove);

				battle.logDecision(poke, " uses " + gulpMove.name + " to trigger form change as soon as possible.");

				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					moveIndex,
					{shielded: false, buffs: false, priority: poke.priority});

				return action;
			}
		}

		// Evaluate if opponent can't be fainted in a limited number of cycles. If so, do a simpler move selection.

		var bestChargedDamage = DamageCalculator.damage(poke, opponent, poke.bestChargedMove);
		var bestCycleDamage = bestChargedDamage + (fastDamage * Math.ceil(poke.bestChargedMove.energy / poke.fastMove.energyGain));
		var minimumCycleThreshold = 2;

		// Prefer non-debuffing moves when it will take multiple to KO
		if(poke.bestChargedMove.selfDebuffing && poke.bestChargedMove.energy > poke.fastestChargedMove.energy && poke.bestChargedMove.dpe / poke.fastestChargedMove.dpe < 2){
			minimumCycleThreshold = 1.1;
		}

		if(opponent.hp / bestCycleDamage > minimumCycleThreshold){
			// It's going to take a lot of cycles to KO, so just throw the best move

			// Build up to best move
			var selectedMove = poke.bestChargedMove;

			if(poke.activeChargedMoves.length > 1){
				for(var i = 0; i < poke.activeChargedMoves.length; i++){
					if(poke.bestChargedMove.selfDebuffing && (! poke.activeChargedMoves[i].selfDebuffing) && (selectedMove.dpe / poke.activeChargedMoves[i].dpe < 2)){
						selectedMove = poke.activeChargedMoves[i];
					}

					if(poke.baitShields && opponent.shields > 0 && ! poke.activeChargedMoves[0].selfDebuffing && ActionLogic.wouldShield(battle, poke, opponent, poke.activeChargedMoves[i]).value){
						selectedMove = poke.activeChargedMoves[0];
					}
				}
			}

			if(poke.energy < selectedMove.energy){
				return;
			} else{
				// Stack self debuffing moves
				if(selectedMove.selfDebuffing){
					var energyToReach = poke.energy + (Math.floor((100 - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.energyGain);
					if(poke.energy < energyToReach){
						return;
					}
				}

				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(selectedMove),
					{shielded: false, buffs: false, priority: poke.priority});

				return action;
			}
		}

		// Calculate the most efficient way to defeat opponent

		// ELEMENTS OF DP QUEUE: ENERGY, OPPONENT HEALTH, TURNS, OPPONENT SHIELDS, USED MOVES, ATTACK BUFF, CHANCE

		var stateCount = 0;

		var DPQueue = [new BattleState(poke.energy, opponent.hp, 0, opponent.shields, [], 0, 1)];
		var stateList = [];
		var finalState;

		while (DPQueue.length != 0) {

			// A not very good way to prevent infinite loops
			if (stateCount >= 500) {
				battle.logDecision(poke, " considered too many states, likely an infinite loop");
				return;
			}
			stateCount++;

			var currState = DPQueue.shift();
			var DPchargedMoveReady = [];

			// Set cap of 4 for buffs
			currState.buffs = Math.min(4, currState.buffs);
			currState.buffs = Math.max(-4, currState.buffs);

			// Found fastest way to defeat enemy, fastest = optimal in this case since damage taken is strictly dependent on time
			// Set finalState to currState and do more evaluation later
			if (currState.oppHealth <= 0) {

				stateList.push(currState);

				if (currState.chance == 1) {
					break;
				} else {
					continue;
				}
			}

			// Evaluate cooldown to reach each charge move
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {
				if (currState.energy >= poke.activeChargedMoves[n].energy) {
					DPchargedMoveReady.push(0);
				} else {
					DPchargedMoveReady.push(Math.ceil((poke.activeChargedMoves[n].energy - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.turns);
				}
			}

			// Push states onto queue in order of TURN
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {

				// Apply stat changes to pokemon attack
				var currentStatBuffs = [poke.statBuffs[0], poke.statBuffs[1]];
				poke.applyStatBuffs([currState.buffs, 0]);

				var moveDamage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);
				var fastSimulatedDamage = DamageCalculator.damage(poke, opponent, poke.fastMove);

				// Remove stat changes from pokemon attack
				poke.statBuffs = [currentStatBuffs[0], currentStatBuffs[1]];

				// Skip self defense debuffing moves like Superpower if they aren't lethal
				// MELMETAL V CRESSELIA IS A NIGHTMARE :D
				if (hasNonDebuff && poke.speciesName == "Melmetal" && opponent.speciesName == "Cresselia") {
					if((poke.activeChargedMoves[n].selfDebuffing) && (poke.activeChargedMoves[n].buffs[1] < 1) && (opponent.hp > moveDamage * (1 + 4 / (4 -	poke.activeChargedMoves[n].buffs[0])))){
						continue;
					}
				}

				// Add result of farming down from this point
				var movesToFarmDown = Math.ceil(currState.oppHealth / fastSimulatedDamage);

				// Place state at correct spot in priority queue
				var i = 0;
				var insertElement = true;
				if (DPQueue.length == 0) {
					DPQueue.unshift(new BattleState(currState.energy + poke.fastMove.energyGain * movesToFarmDown, 0, currState.turn + movesToFarmDown * poke.fastMove.turns, currState.opponentShields, currState.moves, currState.buffs, currState.chance));
				} else {
					while (DPQueue[i].turn <= currState.turn + movesToFarmDown * poke.fastMove.turns) {
						if (DPQueue[i].hp < 0) {
							insertElement = false;
							break;
						}
						i ++;
						if (i == DPQueue.length) {
							break;
						}
					}
					if (insertElement) {
						DPQueue.splice(i, 0, new BattleState(currState.energy + poke.fastMove.energyGain * movesToFarmDown, 0, currState.turn + movesToFarmDown * poke.fastMove.turns, currState.opponentShields, currState.moves, currState.buffs, currState.chance));
					}
				}

				// Find new attack after move
				var attackMult = currState.buffs;

				// Track if move has a chance to change TTK
				var changeTTKChance = 0;
				var possibleAttackMult = attackMult;

				// If attack changes attack stat, apply effects
				if (poke.activeChargedMoves[n].buffApplyChance && (poke.activeChargedMoves[n].buffTarget == "self")) {
					if (poke.activeChargedMoves[n].buffApplyChance == 1) {
						attackMult += poke.activeChargedMoves[n].buffs[0];
					} else {
						possibleAttackMult += poke.activeChargedMoves[n].buffs[0];
						changeTTKChance = poke.activeChargedMoves[n].buffApplyChance;
					}
				}

				// If attack changes opponent defense, apply effects
				if (poke.activeChargedMoves[n].buffApplyChance && (poke.activeChargedMoves[n].buffTarget == "opponent")) {
					if (poke.activeChargedMoves[n].buffApplyChance == 1) {
						attackMult -= poke.activeChargedMoves[n].buffs[1];
					} else {
						possibleAttackMult -= poke.activeChargedMoves[n].buffs[1];
						changeTTKChance = poke.activeChargedMoves[n].buffApplyChance;
					}
				}

				// DISABLE THE NON-GUARANTEED BUFF EVALUATION SYSTEM
				changeTTKChance = 0;

				// If move is ready, use it and add results to queue
				if (DPchargedMoveReady[n] == 0) {

					// If shielded, apply 1 damage, otherwise apply move damage
					var newOppHealth = currState.oppHealth - moveDamage;
					if (currState.oppShields > 0) {
						newOppHealth = currState.oppHealth - 1;
					}

					var newShields = currState.oppShields;
					// Assume pokemon shields
					if (newShields > 0) {
						newShields--;
					}

					// DEBUG
	//					self.logDecision(turns, poke, " wants to use " + poke.chargedMoves[n].name + " because it has the energy for it. Opponent hp will be " + newOppHealth + ". Turn = " + (currState.turn));

					// Remove all elements that are strictly worse than this state while checking if there are any elements better than this state
					var i = 0;
					insertElement = true;
					while (i < DPQueue.length && DPQueue[i].turn == currState.turn + 1) {
						if (DPQueue[i].oppHealth == newOppHealth && DPQueue[i].buffs == attackMult) {
							if (DPQueue[i].energy == (currState.energy - poke.activeChargedMoves[n].energy)) {

								// Added this just for Perrserker and Giratina
								// If energy is the same and opponent at same health choose path with less debuffs or more buff chances

								var DPDebuffs = 0;
								var currDebuffs = 0;
								for (var x = 0; x < DPQueue[i].moves.length; x++) {
									if (DPQueue[i].moves[x].selfDebuffing) {
										DPDebuffs++;
									}
									if (DPQueue[i].moves[x].buffApplyChance == 1 && DPQueue[i].moves[x].buffTarget == "self" && DPQueue[i].moves[x].buffs[0] + DPQueue[i].moves[x].buffs[1] > 0) {
										DPDebuffs--;
									}
								}
								var tempState = currState.moves.concat([poke.activeChargedMoves[n]]);
								for (var x = 0; x < tempState.length; x++) {
									if (tempState[x].selfDebuffing) {
										currDebuffs++;
									}
									if (tempState[x].buffApplyChance == 1 && tempState[x].buffTarget == "self" && tempState[x].buffs[0] + tempState[x].buffs[1] > 0) {
										currDebuffs--;
									}
								}


								if (DPDebuffs > currDebuffs) {
									DPQueue.splice(i, 1);
								} else {
									insertElement = false;
									i++;
								}
							} else {
								insertElement = false;
								i++;
							}

						} else {
							i++;
						}
					}
					if (insertElement) {

						// Place state at correct spot in priority queue
						var i = 0;
						var insert = true;
						if (DPQueue.length == 0) {
							DPQueue.unshift(new BattleState(newEnergy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.unshift(new BattleState(newEnergy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						} else {
							while (DPQueue[i].turn <= currState.turn + 1) {
								if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
									insert = false;
									break;
								}
								i ++;
								if (i == DPQueue.length) {
									break;
								}
							}
							if (insert) {
								DPQueue.splice(i, 0, new BattleState(currState.energy - poke.activeChargedMoves[n].energy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							}
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						}
					}

					// If move will debuff attack, calculate values when you stack two of them then throw
					if (poke.activeChargedMoves[n].selfDebuffing && poke.activeChargedMoves[n].buffs[0] < 0 && poke.activeChargedMoves[n].energy * 2 <= 100) {

						var newTurn = Math.ceil((poke.activeChargedMoves[n].energy * 2 - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.turns;
						newEnergy = Math.floor(newTurn / poke.fastMove.turns) * poke.fastMove.energyGain + currState.energy - poke.activeChargedMoves[n].energy;

						if (newTurn != 0) {
							// Calculate new health
							newOppHealth = currState.oppHealth - fastSimulatedDamage * (newTurn / poke.fastMove.turns);

							// Calculate shield scenarios
							if (currState.oppShields > 0) {
								newOppHealth = newOppHealth - 1;
							} else {
								newOppHealth = newOppHealth - moveDamage;
							}

							newTurn += currState.turn + 1;

							i = 0;
							insertElement = true;
							if (DPQueue.length == 0) {
								DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
								// If move has chance of changing TTK, add that result
								if (changeTTKChance != 0) {
									DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
								}
							} else {
								while (DPQueue[i].turn <= newTurn) {
									if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
										insertElement = false;
										break;
									}
									i ++;
									if (i == DPQueue.length) {
										break;
									}
								}
								if (insertElement) {
									DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
								}
								// If move has chance of changing TTK, add that result
								if (changeTTKChance != 0) {
									DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
								}
							}
						}


					}

				} else {
					var newEnergy = currState.energy - poke.activeChargedMoves[n].energy + poke.fastMove.energyGain * (DPchargedMoveReady[n] / poke.fastMove.turns);
					var newOppHealth = currState.oppHealth - moveDamage - fastSimulatedDamage * (DPchargedMoveReady[n] / poke.fastMove.turns);

					// If shields are up, only apply fast move damage
					if (currState.oppShields > 0) {
						newOppHealth = currState.oppHealth - fastSimulatedDamage * (DPchargedMoveReady[n] / poke.fastMove.turns) - 1;
					}
					var newTurn = currState.turn + DPchargedMoveReady[n] + 1;
					var newShields = currState.oppShields;

					// Assume pokemon shields
					if (newShields > 0) {
						newShields--;
					}

					// Place in priority queue, with TURN being the priority
					var i = 0;
					insertElement = true;
					if (DPQueue.length == 0) {
						DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
						// If move has chance of changing TTK, add that result
						if (changeTTKChance != 0) {
							DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
						}
					} else {
						while (DPQueue[i].turn < newTurn) {
							if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
								insertElement = false;
								break;
							}
							i ++;
							if (i == DPQueue.length) {
								break;
							}
						}
						if (insertElement) {
							DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
						}
						// If move has chance of changing TTK, add that result
						if (changeTTKChance != 0) {
							DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
						}
					}

					// If move will debuff attack, calculate values when you stack two of them then throw
					if (poke.activeChargedMoves[n].selfDebuffing && poke.activeChargedMoves[n].buffs[0] < 0 && poke.activeChargedMoves[n].energy * 2 <= 100) {

						newTurn = Math.ceil((poke.activeChargedMoves[n].energy * 2 - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.turns;
						newEnergy = Math.floor(newTurn / poke.fastMove.turns) * poke.fastMove.energyGain + currState.energy - poke.activeChargedMoves[n].energy;

						// Calculate new health
						newOppHealth = currState.oppHealth - fastSimulatedDamage * (newTurn / poke.fastMove.turns);

						// Calculate shield scenarios
						if (currState.oppShields > 0) {
							newOppHealth = newOppHealth - 1;
						} else {
							newOppHealth = newOppHealth - moveDamage;
						}

						newTurn += currState.turn + 1

						i = 0;
						insertElement = true;
						if (DPQueue.length == 0) {
							DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						} else {
							while (DPQueue[i].turn < newTurn) {
								if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
									insertElement = false;
									break;
								}
								i ++;
								if (i == DPQueue.length) {
									break;
								}
							}
							if (insertElement) {
								DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							}
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						}
					}
				}
			}
		}

		// Evaluate throwing strategy after finding optimal plan

		// Set our turnsToKO to our guaranteed KO turn
		if(stateList.length > 0){
			poke.turnsToKO = turns + stateList[stateList.length - 1].turn;
		} else{
			return;
		}

		// If opponent KOs before our guaranteed KO, go for the least risky plan that still KOs before opponent KOs us.
		var needsBoost = false;
		if (stateList.length == 1) {
			finalState = stateList[0];
		} else if (opponent.turnsToKO != -1 && poke.turnsToKO > opponent.turnsToKO) {

			var bestPlan = stateList[0];
			for (var i = 1; i < stateList.length; i++) {
				if (stateList[i].chance > bestPlan) {
					bestPlan = stateList[i];
				}
			}
			battle.logDecision(poke, " changes its plan because it needs the BOOST to win or debuff");
			finalState = bestPlan;

		} else {
			// We guaranteed KO before opponent or opponent hasn't evaluated their turnsToKO yet.
			finalState = stateList[stateList.length - 1];
		}


		// Return if plan is the farm down
		if (finalState.moves.length == 0) {

			if(! poke.getBoostMove()){
				battle.logDecision(poke, " wants to farm down");
				return;
			} else{
				finalState.moves.push(poke.getBoostMove());
				battle.logDecision(poke, " will force throw a boost move");
			}
		}

		// Find if there are any debuffing moves and the most expensive move in planned move list
		var debuffingMove = false;
		var mostExpensiveMove = finalState.moves[0];
		for (var moveInd = 0; moveInd < finalState.moves.length; moveInd++) {
			if (finalState.moves[moveInd].selfDebuffing) {
				debuffingMove = true;
			}

			if(finalState.moves[moveInd].energy > mostExpensiveMove.energy){
				mostExpensiveMove = finalState.moves[moveInd];
			}
		}

		// If bait shields, build up to most expensive charge move in planned move list
		if (poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			for(var i = 1; i < poke.activeChargedMoves.length; i++){
				if ((poke.energy < poke.activeChargedMoves[i].energy)&&(poke.activeChargedMoves[i].dpe > finalState.moves[0].dpe)) {
					var bait = true;

					// Don't go for baits if you have an effective self buffing move
					if((poke.activeChargedMoves[i].dpe / poke.activeChargedMoves[0].dpe <= 1.5)&&(poke.activeChargedMoves[0].selfBuffing)){
						bait = false;
					}

					if(bait){
						battle.logDecision(poke, " doesn't use " + finalState.moves[0].name + " because it wants to bait");
						return;
					}
				}
			}
		}

		// Don't bait if the opponent won't shield
		if (poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			for(var i = 1; i < poke.activeChargedMoves.length; i++){
				var dpeRatio = (poke.activeChargedMoves[i].damage / poke.activeChargedMoves[i].energy) / (finalState.moves[0].damage / finalState.moves[0].energy);

				if ((poke.energy >= poke.activeChargedMoves[i].energy)&&(dpeRatio > 1.5)) {
					if(! ActionLogic.wouldShield(battle, poke, opponent, poke.activeChargedMoves[i]).value){
						finalState.moves[0] = poke.activeChargedMoves[i];
					}
				}
			}

		}

		// If pokemon needs boost, we cannot reorder and no moves both buff and debuff
		if (!needsBoost) {
			// If not baiting shields or shields are down and no moves debuff, throw most damaging move first
			if (!poke.baitShields || (opponent.shields == 0 && debuffingMove == false)) {
				finalState.moves.sort(function(a, b) {
					var moveDamage1 = DamageCalculator.damage(poke, opponent, a);
					var moveDamage2 = DamageCalculator.damage(poke, opponent, b);
					return moveDamage2 - moveDamage1;
				})
			}
		}

		// If shields are up, prefer low energy moves that are more efficient
		if (opponent.shields > 0 && poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy <= finalState.moves[0].energy && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && (! poke.activeChargedMoves[0].selfDebuffing)) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// If shields are down, prefer non-debuffing moves if both sides have significant HP remaining
		if (opponent.shields == 0 && poke.activeChargedMoves.length > 1 && finalState.moves[0].selfDebuffing && finalState.moves[0].energy > 50 && (poke.hp / poke.stats.hp) > .5 && (finalState.moves[0].damage / opponent.hp) < .8) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Bandaid to force more efficient move of the same energy
		if (poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy == finalState.moves[0].energy && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && (! poke.activeChargedMoves[0].selfDebuffing)) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Bandaid to force more efficient move of the similar energy if chosen move is self debuffing
		if (poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy - 10 <= finalState.moves[0].energy && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && finalState.moves[0].selfDebuffing && (! poke.activeChargedMoves[0].selfDebuffing)) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Bandaid to force more efficient move of the similar energy if one move is self buffing
		if (poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy - finalState.moves[0].energy <= 5 && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && poke.activeChargedMoves[0].selfBuffing) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Don't bait with self debuffing moves
		if (poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			for(var i = 1; i < poke.activeChargedMoves.length; i++){
				if ((poke.energy >= poke.activeChargedMoves[i].energy)&&(poke.activeChargedMoves[i].dpe > finalState.moves[0].dpe)) {
					if((finalState.moves[0].selfDebuffing)&&(! poke.activeChargedMoves[i].selfDebuffing)){
						finalState.moves[0] = poke.activeChargedMoves[i];
					}
				}
			}
		}

		// When shields are down, don't use self debuffing moves that are significantly less efficient
		if (opponent.shields == 0 && poke.activeChargedMoves.length > 1 && finalState.moves[0].selfDebuffing) {
			for(var i = 1; i < poke.activeChargedMoves.length; i++){
				if (poke.activeChargedMoves[i].dpe > finalState.moves[0].dpe && (! poke.activeChargedMoves[i].selfDebuffing)) {
					finalState.moves[0] = poke.activeChargedMoves[i];
				}
			}
		}

		// While shields are up, prefer close non debuffing moves in scenarios where debuffing move won't KO

		if (opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			// Is one self debuffing and the other non self debuffing, and will the first Charged Move
			for(var i = 1; i < poke.activeChargedMoves.length; i++){
				if((poke.activeChargedMoves[0].selfDebuffing)&&(! poke.activeChargedMoves[i].selfDebuffing)){
					// Is the Pokemon baiting or will the self debuffing move not come close to a KO?
					if(poke.baitShields || (opponent.hp - poke.activeChargedMoves[0].damage > 10)){
						// Is the second move close in energy and dpe?
						if((poke.activeChargedMoves[i].energy - poke.activeChargedMoves[0].energy <= 10) && (poke.activeChargedMoves[i].dpe / poke.activeChargedMoves[0].dpe > 0.7)){
							finalState.moves[0] = poke.activeChargedMoves[i];
						}
					}
				}
			}

		}

		// Defer self debuffing moves until after survivable Charged Moves
		if(finalState.moves[0].selfDebuffing && poke.shields == 0 && poke.energy < 100 && opponent.bestChargedMove){
			if((opponent.energy >= opponent.bestChargedMove.energy)&&(! ActionLogic.wouldShield(battle, opponent, poke, opponent.bestChargedMove).value)&&(! poke.activeChargedMoves[0].selfBuffing)){
				battle.logDecision(poke, " is deferring its self debuffing move until after the opponent fires its move");
				return;
			}
		}

		// If move is self debuffing and doesn't KO, try to stack as much as you can
		if (finalState.moves[0].selfDebuffing || (opponent.activeFormId == "cramorant_gulping" || opponent.activeFormId == "cramorant_gorging")) {
			//var targetEnergy = poke.energy + (Math.round( (100 - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.energyGain);
			let targetEnergy = Math.floor(100 / finalState.moves[0].energy) * finalState.moves[0].energy;

			if (poke.energy < targetEnergy) {
				var moveDamage = DamageCalculator.damage(poke, opponent, finalState.moves[0]);
				if ((opponent.hp > moveDamage || opponent.shields != 0) && (poke.hp > opponent.fastMove.damage * 2 || opponent.fastMove.cooldown - poke.fastMove.cooldown > 500)){
					battle.logDecision(poke, " doesn't use " + finalState.moves[0].name + " because it wants to minimize time debuffed and it can stack the move " + Math.floor(100 / finalState.moves[0].energy) + " times");
					return;
				}
			} else if(poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves[0].energy - finalState.moves[0].energy <= 10 && ! poke.activeChargedMoves[0].selfDebuffing){
				// Use the lower energy move if it's a boosting move or if the opponent would shield the bigger move
				if(poke.activeChargedMoves[0].selfBuffing || ActionLogic.wouldShield(battle, poke, opponent, finalState.moves[0]).value){
					finalState.moves[0] = poke.activeChargedMoves[0];
				}
			}
		}

		// Use the final move, or a Fast Move if not enough energy
		if (poke.energy >= finalState.moves[0].energy) {
			if (finalState.moves.length > 1) {
				battle.logDecision(poke, " uses " + finalState.moves[0].name + " because it thinks that using " + (finalState.moves.length - 1) + " moves afterwards is the best plan.");

				// Debugging Log
				for (var i = 1; i < finalState.moves.length; i++) {
					battle.logDecision(poke, " wants to use " + finalState.moves[i].name + " after it uses " + finalState.moves[i - 1].name);
				}

			} else {
				battle.logDecision(poke, " uses " + finalState.moves[0].name + " at turn " + turns + " because it KO's or it wants to farm down afterwards");
			}

		} else {
			battle.logDecision(poke, " uses a fast move because it has no energy for " + finalState.moves[0].name);
			return;
		}
		
		// Build energy for Aegislash Shield to reduce time spent in Blade form
		if(poke.activeFormId == "aegislash_shield" && poke.energy < 100 - (poke.fastMove.energyGain / 2)){
			if(battle.getMode() == "simulate" && poke.bestChargedMove.damage < opponent.hp){
				battle.logDecision(poke, " wants to gain as much energy as possible before changing form");
				return;
			} else if(battle.getMode() == "emulate"){
				battle.logDecision(poke, " wants to gain as much energy as possible before changing form");
				return;
			}
		}

		action = new TimelineAction(
			"charged",
			poke.index,
			turns,
			poke.chargedMoves.indexOf(finalState.moves[0]),
			{shielded: false, buffs: false, priority: poke.priority});

		return action;
	}


	// Select a randomized action for this turn
	static decideRandomAction(battle, poke, opponent){
		let fastMoveWeight = 10;
		let hasKnockoutMove = false;
		let actionOptions = [];
		let chargedMoveValues = [];
		let turns = battle.getTurns();

		// Evaluate when to randomly use Charged Moves
		for(var i = 0; i < poke.activeChargedMoves.length; i++){
			if(poke.energy >= poke.activeChargedMoves[i].energy){
				poke.activeChargedMoves[i].damage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[i]);
				let chargedMoveWeight = Math.round(poke.energy / 4);
				let damage = poke.activeChargedMoves[i].damage;

				if(poke.energy < poke.bestChargedMove.energy){
					chargedMoveWeight = Math.round(poke.energy / 50);
				}

				if(hasKnockoutMove){
					chargedMoveWeight = 0;
				}

				// Go for the KO if it's there
				if((damage >= opponent.hp)&&(opponent.shields == 0)){
					fastMoveWeight = 0;
					hasKnockoutMove = true;
				}

				// Don't use Charged Move if it's strictly worse than the other option
				if((i > 0)&&(poke.activeChargedMoves[i].damage < poke.activeChargedMoves[0].damage)&&(poke.activeChargedMoves[i].energy >= poke.activeChargedMoves[0].energy)&&(! poke.activeChargedMoves[i].selfBuffing)){
					chargedMoveWeight = 0;
				}

				// Use Charged Moves if capped on energy
				if(poke.energy == 100){
					chargedMoveWeight *= 2;
				}

				chargedMoveValues.push({move: poke.activeChargedMoves[i], damage: damage, weight: chargedMoveWeight, index: i});
			}
		}

		if(chargedMoveValues.length > 1){
			// If shields are up and both moves would KO, prefer non debuffing moves
			if((chargedMoveValues[0].damage >= opponent.hp)&&(chargedMoveValues[1].damage >= opponent.hp)&&(opponent.shields > 0)){
				if((chargedMoveValues[0].move.selfDebuffing)&&(! chargedMoveValues[1].move.selfDebuffing)&&(chargedMoveValues[1].move.energy <= chargedMoveValues[0].move.energy)){
					chargedMoveValues[0].weight = 0;
				} else if((chargedMoveValues[1].move.selfDebuffing)&&(! chargedMoveValues[0].move.selfDebuffing)&&(chargedMoveValues[0].move.energy <= chargedMoveValues[1].move.energy)){
					chargedMoveValues[1].weight = 0;
				}
			}
		}

		for(var i = 0; i < chargedMoveValues.length; i++){
			actionOptions.push(new DecisionOption("CHARGED_MOVE_"+chargedMoveValues[i].index, chargedMoveValues[i].weight));
		}

		actionOptions.push(new DecisionOption("FAST_MOVE", fastMoveWeight));

		let actionType = ActionLogic.chooseOption(actionOptions);
		let action;

		switch(actionType.name){
			case "FAST_MOVE":
				return;
				break;

			case "CHARGED_MOVE_0":
				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(poke.activeChargedMoves[0]),
					{shielded: false, buffs: false, priority: poke.priority});
				break;

			case "CHARGED_MOVE_1":
				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(poke.activeChargedMoves[1]),
					{shielded: false, buffs: false, priority: poke.priority});
				break;
		}

		return action;
	}

	// Choose an option from an array
	static chooseOption(options){
		var optionBucket = [];

		// Put all the options in bucket, multiple times for its weight value

		for(var i = 0; i < options.length; i++){
			for(var n = 0; n < options[i].weight; n++){
				optionBucket.push(options[i].name);
			}
		}

		// If all options have 0 weight, just toss the first option in there

		if(optionBucket.length == 0){
			optionBucket.push(options[0].name);
		}

		var index = Math.floor(Math.random() * optionBucket.length);
		var optionName = optionBucket[index];
		var option = options.filter(obj => {
			return obj.name === optionName
		})[0];

		return option;
	}

	// Returns a boolean for default sims, and weights for randomized sims to determine if a Pokemon would shield a Charged Move

	static wouldShield(battle, attacker, defender, move){
		var useShield = false;
		var shieldWeight = 1;
		var noShieldWeight = 2; // Used for randomized shielding decisions
		var damage = DamageCalculator.damage(attacker, defender, move);
		move.damage = damage;

		var postMoveHP = defender.hp - damage; // How much HP will be left after the attack
		// Capture current buffs for pokemon whose buffs will change
		var currentBuffs;
		var moveBuffs = [0, 0];

		if(move.buffs){
			moveBuffs = move.buffs;
		}

		if (moveBuffs[0] > 0) {
			currentBuffs = [attacker.statBuffs[0], attacker.statBuffs[1]];
			attacker.applyStatBuffs(moveBuffs);
		} else {
			currentBuffs = [defender.statBuffs[0], defender.statBuffs[1]];
			defender.applyStatBuffs(moveBuffs);
		}

		var fastDamage = DamageCalculator.damage(attacker, defender, attacker.fastMove);

		// Determine how much damage will be dealt per cycle to see if the defender will survive to shield the next cycle

		var fastAttacks = Math.ceil( (move.energy - Math.max(attacker.energy - move.energy, 0)) / attacker.fastMove.energyGain) + 1; // Give some margin for error here
		var fastAttackDamage = fastAttacks * fastDamage;
		var cycleDamage = (fastAttackDamage + 1) * defender.shields;

		if(postMoveHP <= cycleDamage){
			useShield = true;
			shieldWeight = 2;
		}

		// Reset buffs to original
		if (moveBuffs[0] > 0) {
			attacker.statBuffs = [currentBuffs[0], currentBuffs[1]];
		} else {
			defender.statBuffs = [currentBuffs[0], currentBuffs[1]];
		}

		// If the defender can't afford to let a charged move connect, block
		var fastDPT = fastDamage / attacker.fastMove.turns;

		for (var i = 0; i < attacker.chargedMoves.length; i++){
			if(! attacker.chargedMoves[i]){
				continue;
			}
			
			var chargedMove = attacker.chargedMoves[i];

			if(attacker.energy + chargedMove.energy >= chargedMove.energy){
				var chargedDamage = DamageCalculator.damage(attacker, defender, chargedMove);

				if((chargedDamage >= defender.hp / 1.4)&&(fastDPT > 1.5)){
					useShield = true;
					shieldWeight = 4
				}

				if(chargedDamage >= defender.hp - cycleDamage){
					useShield = true;
					shieldWeight = 4
				}

				if((chargedDamage >= defender.hp / 2)&&(fastDPT > 2)){
					shieldWeight = 12
				}
			}
		}

		// Shield the first in a series of Attack debuffing moves like Superpower, if they would do major damage
		if(move.selfAttackDebuffing && (move.damage / defender.hp > 0.55)){
			useShield = true;
			shieldWeight = 4;
		}

		// When a Pokemon is set to always bait, always return true for this value
		if((battle.getMode() == "simulate")&&(attacker.baitShields == 2)){
			useShield = true;
		}

		// Save shields in Aegislash shield form to protect Blade form

		if(defender.activeFormId == "aegislash_shield" && move.damage * 2 < defender.hp){
			useShield = false;
		}

		// Save shields in Cramorant gulping or gorging form to trigger Gulp Missile earlier against weak moves

		if((defender.activeFormId == "cramorant_gulping" || defender.activeFormId == "cramorant_gorging") && move.damage * 2.2 < defender.hp){
			useShield = false;
		}

		// Don't shield early Cramorant Dives or Surfs to save for later attacks
		if(attacker.speciesId == "cramorant" && move.damage && move.damage / defender.hp < .33){
			useShield = false;
		}

		if(attacker.speciesId == "cramorant" && (move.moveId == "DIVE" || move.moveID == "SURF") && move.damage > defender.hp){
			useShield = false;
		}

		return {
			value: useShield,
			shieldWeight: shieldWeight,
			noShieldWeight: noShieldWeight
		};
	}
}

// State used for DP in battle simulation
class BattleState{
	constructor(pokeEnergy, opponentHealth, currentTurn, opponentShields, usedMoves, attackBuff, probability){
		this.energy = pokeEnergy;
		this.oppHealth = opponentHealth;
		this.turn = currentTurn;
		this.oppShields = opponentShields;
		this.moves = usedMoves;
		this.buffs = attackBuff;
		this.chance = probability;
	}
}

;
// JavaScript Document

function Battle(){
	var gm = GameMaster.getInstance();
	var interface;

	var self = this;
	var pokemon = [null, null];
	var players = [];
	var cp = 1500;
	var levelCap = 50;
	var cup = {name: "all", include: [], exclude: [{
		filterType: "tag",
		values: ["mega"]
	}]}; // List of allowed types

	var decisionLog = []; // For debugging
	var debug = false;

	var actions = []; // User defined actions
	var previousTurnActions = [] // Actions from the previous turn
	var turnMessages = []; // Array of messages to be displayed by the emulator for specific Pokemon
	var turnAnimations = []; // Animations to be displayed by the front end this turn
	var turnActions = []; // Actions to be performed this turn
	var actionIndex = 0; // Iterator over current turnActions
	var queuedActions = []; // Input registered from previous turns to be processed on future turns
	var sandbox = false; // Is this automated or following user instructions?
	var mode = "simulate"; // Simulate or emulate?
	var decisionMethod = "default"; // Default or random

	// Battle properties

	var timeline = [];
	var time;
	var matchupDisplayTime;
	var turns;
	var lastProcessedTurn = 0; // Preserve the turn number so Pokemon don't act twice during Charged Move sequence
	var deltaTime = 500;

	var duration = 0;
	var battleRatings = [];
	var turnsToWin = [0, 0];
	var winner;

	var battleEndMode = "first"; // first - end the battle on the first faint, both - end the battle once both Pokemon faint
	var phase = "neutral";
	var phaseProps; // A collection of properties associated with the current phase
	var phaseTimeout; // Used to trigger the end of certain phases like charging up and switching
	var mainLoopInterval;
	var isPaused = false; // A flag for whether or not to pause the battle
	var switchTimerMarked = false; // Flag for if the 60 second marker has been displayed yet in the timeline

	var roundChargedMoveUsed;
	var roundChargedMovesInitiated; // used in decision making
	var roundShieldUsed;

	var chargedMinigameTime = 10000;

	var usePriority = false;

	var chargeAmount = 0; // Multiplier used in emulated battles
	var playerUseShield = false; // Flag for a player to use an available shield in emulated battles

	var startingValues = [
		{hp: 0, energy: 0},
		{hp: 0, energy: 0}
	];

	var debugMode = false;

	// Buff parameters

	var buffChanceModifier = -1; // -1 prevents buffs, 1 guarantees buffs

	// Callback for inteface to updated

	var updateCallback;

	this.init = function(){
		interface = InterfaceMaster.getInterface();
	}

	this.setNewPokemon = function(poke, index, initialize){
		initialize = typeof initialize !== 'undefined' ? initialize : true;

		poke.setBattle(self);

		if(initialize){
			poke.initialize(cp);
		}
		
		if(mode == "simulate"){
			poke.reset();
		} else if (mode == "emulate" && turns > 1){
			poke.reset(true);
			console.log(poke.statBuffs);
		}
		
		poke.index = index;
		pokemon[index] = poke;

		// Set shields for corresponding player

		if(mode == "emulate"){

			poke.shields = players[index].getShields();
			poke.startingShields = players[index].getShields();
			poke.priority = players[index].getPriority();

			// Evaluate AI
			if((pokemon[0])&&(pokemon[1])){
				for(var i = 0; i < pokemon.length; i++){
					pokemon[i].resetMoves();

					if(players[i].getAI()){
						players[i].getAI().evaluateMatchup(turns, pokemon[i], self.getOpponent(i), players[(i == 0) ? 1 : 0]);
					}
				}
			}
		}
	}

	this.getPokemon = function(){
		return pokemon;
	}

	// This is used after team rankings so Pokemon don't auto-select moves based on the last simulated battle

	this.clearPokemon = function(){
		pokemon = [null, null];
	}

	// Set the active players

	this.setPlayers = function(arr){
		players = arr;

		for(var i = 0; i < players.length; i++){
			players[i].reset();
		}
	}

	this.getCP = function(forURLStr){
		forURLStr = typeof forURLStr !== 'undefined' ? forURLStr : false;

		if((forURLStr)&&(levelCap != 50)){
			return cp + "-"+ + levelCap;
		} else{
			return parseInt(cp);
		}

	}

	this.setCP = function(cpLimit){
		cp = cpLimit;

		for(var i = 0; i < pokemon.length; i++){
			if(pokemon[i]){
				pokemon[i].initialize(cp);
			}
		}
	}

	this.setLevelCap = function(val){
		levelCap = val;

		for(var i = 0; i < pokemon.length; i++){
			if(pokemon[i]){
				pokemon[i].initialize(cp);
			}
		}
	}

	this.getLevelCap = function(){
		return levelCap;
	}

	// Set cup object from Game Master

	this.setCup = function(cupName){
		cup = gm.getCupById(cupName);

		if(! cup){
			return false;
		}

		if(cup.levelCap){
			self.setLevelCap(cup.levelCap);
		}
	}

	// Set a custom cup object

	this.setCustomCup = function(customCup){
		cup = customCup;
	}

	// Return object with a name and array of allowed types

	this.getCup = function(){
		return cup;
	}

	// Return the current simulation mode

	this.getMode = function(){
		return mode;
	}

	// Return the opposing Pokemon given an index of 0 or 1

	this.getOpponent = function(index){
		if(index == 0){
			return pokemon[1];
		} else{
			return pokemon[0];
		}
	}

	// Return the starting values of the battle.

	this.getStartingValues = function(){
		return startingValues;
	}

	// Set the modifier for buff apply chance, -1 prevents buffs and 1 guarantees them

	this.setBuffChanceModifier = function(value){
		buffChanceModifier = value;
	}

	// Returns array of actions queued by all Pokemon
	this.getQueuedActions = function(){
		return queuedActions;
	}

	// Reset all battle components and initiate the battle

	this.start = function(){
		// Reset all Pokemon
		for(var i = 0; i < pokemon.length; i++){
			pokemon[i].reset();

			startingValues[i].hp = pokemon[i].hp;
			startingValues[i].energy = pokemon[i].energy;
		}

		// Reset all actions
		for(var i = 0; i < actions.length; i++){
			actions[i].processed = false;
		}

		// Determine if charged move priority should be used
		usePriority = false;

		if(pokemon[0].stats.atk != pokemon[1].stats.atk
			|| pokemon[0].speciesId == "cramorant" && pokemon[1].speciesId == "cramorant" ){
			usePriority = true;
		}

		time = 0;
		matchupDisplayTime = 0;
		turns = 1;
		lastProcessedTurn = 0;
		turnsToWin = [0, 0];
		timeline = [];
		queuedActions = [];
		turnActions = [];
		previousTurnActions = [];
		turnMessages = [];
		turnAnimations = [];
		switchTimerMarked = false;
		decisionLog = [];
	}

	// Process a turn

	this.step = function(){
		// Return from this function if paused
		if(phase == "game_paused"){
			return false;
		}

		// For display purposes, need to track whether a Pokemon has used a charged move or shield each round

		roundChargedMoveUsed = 0;
		roundChargedMovesInitiated = 0;
		roundShieldUsed = false;

		// Hold the actions for both Pokemon this turn

		if(turns > lastProcessedTurn){
			turnActions = [];
		}

		// Reduce cooldown for both Pokemon

		for(var i = 0; i < 2; i++){
			var poke = pokemon[i];
			poke.cooldown = Math.max(0, poke.cooldown - deltaTime); // Reduce cooldown
			poke.chargedMovesOnly = false;
			if(turns > lastProcessedTurn){
				poke.hasActed = false;
			}
		}

		// Reduce switch timer for both players

		for(var i = 0; i < players.length; i++){
			players[i].decrementSwitchTimer(deltaTime);
		}

		// Exit if not regular battle phase

		if(phase != "neutral"){
			return false;
		}

		// Determine actions for both Pokemon
		var actionsThisTurn = false;
		var chargedMoveThisTurn = false;
		var chargedMoveLastTurn = previousTurnActions.find(action => action.type == "charged");
		var cooldownsToSet = [pokemon[0].cooldown, pokemon[1].cooldown]; // Store cooldown values to set later

		if(turns > lastProcessedTurn){
			for(var i = 0; i < 2; i++){

				var poke = pokemon[i];
				var opponent = this.getOpponent(i);
				var action = self.getTurnAction(poke, opponent);

				if(action){

					if(chargedMoveLastTurn && action.type != "switch"){
						continue; // Only allow 0 turn switches after a Charged Attack sequence
					}

					actionsThisTurn = true;

					if(action.type == "charged"){
						chargedMoveThisTurn = true;
					}

					// Are both Pokemon alive?

					if((action.type == "switch")||((action.type != "switch")&&(poke.hp > 0)&&(opponent.hp > 0))){
						if((action.type=="fast")&&(mode == "emulate")){
							// Submit an animation to be played
							self.pushAnimation(poke.index, "fast", pokemon[action.actor].turns);
						}

						var valid = true;

						if(action.type == "fast"){
							if(poke.chargedMovesOnly){
								valid = false;
							}

							if(valid){
								cooldownsToSet[i] += poke.fastMove.cooldown;
								timeline.push(new TimelineEvent("tap interaction", "Tap", poke.index, time, turns, [2,0]));
							}
						}

						// Don't allow any inputs on the same turn that a Charged Attack resolves
						/*if(queuedActions.find(action => action.type == "charged" && action.turn == turns - 1)){
							valid = false;
						}*/

						if(action.type == "charged" && valid){
							cooldownsToSet[i] += 500;
						}

						if(valid){
							queuedActions.push(action);
						}
					}
				}
			}
		}

		// Set cooldowns for both Pokemon. We do this after move decision making because cooldown values are used in the decision making process
		pokemon[0].cooldown = cooldownsToSet[0];
		pokemon[1].cooldown = cooldownsToSet[1];

		// Check for a Charged Move this turn to apply floating Fast Moves
		var chargedMoveLastTurn = previousTurnActions.find(action => action.type == "charged");

		// Take actions from the queue to be processed now
		for(var i = 0; i < queuedActions.length; i++){
			var action = queuedActions[i];
			var valid = false;

			// Is there a fast move that's eligible to be processed this turn?
			if(action.type == "fast" || action.type == "charged"){

				// Was this queued on a previous turn? See if it's eligible
				var timeSinceActivated = (turns - action.turn) * 500;

				var requiredTimeToPass = action.type == "fast" ? pokemon[action.actor].fastMove.cooldown - 500 : 0;

				if(timeSinceActivated >= requiredTimeToPass || (action.type == "fast" && chargedMoveLastTurn && action.turn < turns)){
					valid = true;
				}
			}

			if(action.type == "wait"){
				valid = true;
			}

			if(action.type == "switch"){
				valid = true;

				if(chargedMoveLastTurn){
					action.priority -= 40; // Resolve floating Fast Attacks before 0 turn swaps after a Charged Attack sequence
				}
			}

			if(valid){
				turnActions.push(action);
				queuedActions.splice(i, 1);
				i--;
			}
		}

		// Sort actions by priority
		turnActions.sort((a,b) => (a.settings.priority > b.settings.priority) ? -1 : ((b.settings.priority > a.settings.priority) ? 1 : 0));

		// Process actions on this turn
		actionIndex = 0;
		
		while(actionIndex < turnActions.length){
			// Return here if we've reached a suspended state
			if(phase != "neutral"){
				return false;
			}

			var action = turnActions[actionIndex++];
			var poke = pokemon[action.actor];
			var opponent = pokemon[ (action.actor == 0) ? 1 : 0 ];

			switch(action.type){

				case "fast":
					action.valid = true;

					if(opponent.hp < 1){
						action.valid = false;
					}

					if(poke.hp < 1 && poke.faintSource == "charged"){
						action.valid = false;
					}
					break;

				case "charged":
					if(typeof action.value === 'number'){
						var move = poke.chargedMoves[action.value];
					} else if(typeof action.value === 'string'){
						var move = poke.extraChargedMovePool.find(m => m.moveId == action.value);
					}

					if(! move){
						console.log("ERROR: Can't find move " + action.value);
					} else{
						if(poke.energy >= move.energy){
							action.valid = true;
						}
					}

					// Check if knocked out from a priority move
					if(usePriority && poke.hp <= 0 && poke.faintSource == "charged" && ! move.hasTag("ignoresFaint")){
						action.valid = false;
					}
					break;

				case "wait":
					action.valid = true;
					break;

				case "switch":
					if(((poke.cooldown == 0)&&(players[poke.index].getSwitchTimer() == 0))||(poke.hp < 1)){
						action.valid = true;
					}
					break;
			}

			self.processAction(action, poke, opponent);
		}

		previousTurnActions = turnActions;
		turnActions = [];

		if(mode == "emulate"){
			actions = [];
		}

		if(roundChargedMoveUsed == 0){
			time += deltaTime;
			matchupDisplayTime += deltaTime;
		} else{
			// This is for display purposes only
			if(roundShieldUsed){
				time += chargedMinigameTime * (roundChargedMoveUsed-1);
			} else{
				time += chargedMinigameTime;
			}
		}

		duration = time;
		lastProcessedTurn = turns;
		turns++;

		// Display sixty second marker after 60 seconds have passed

		if((mode == "simulate")&&(matchupDisplayTime >= 45000)&&(! switchTimerMarked)){
			timeline.push(new TimelineEvent("switchAvailable", "Switch Available (45 seconds)", 0, time, turns));
			switchTimerMarked = true;
		}

		// Check for faint
		var faintedPokemonIndexes = [];

		for(var i = 0; i < 2; i++){
			var poke = pokemon[i];

			if(poke.hp <= 0){
				timeline.push(new TimelineEvent("faint", "Faint", poke.index, time, turns));

				var opponentIndex = (i == 0) ? 0 : 1;

				if(turnsToWin[opponentIndex] == 0){
					turnsToWin[opponentIndex] = turns;
				}

				faintedPokemonIndexes.push(poke.index);
			}

			// Reset after a charged move

			if(roundChargedMoveUsed){
				poke.cooldown = 500;
			}
		}

		if((mode == "emulate")&&(faintedPokemonIndexes.length > 0)&&(phase == "neutral")){

			// Push faint animations
			for(var i = 0; i < faintedPokemonIndexes.length; i++){
				self.pushAnimation(faintedPokemonIndexes[i], "switch", true);
			}

			// Are all Pokemon fainted or should the battle continue?

			if((players[0].getRemainingPokemon() > 0)&&(players[1].getRemainingPokemon() > 0)){
				phase = "suspend_switch";
				phaseProps = {
					actors: faintedPokemonIndexes
				};

				if(players[0].getRemainingPokemon() > 1){
					phaseTimeout = setTimeout(self.forceSwitch,	13000);
				} else{
					self.forceSwitch();
				}

				// Reset cooldowns for active Pokemon

				for(var i = 0; i < pokemon.length; i++){
					pokemon[i].cooldown = 0;
				}

				// AI switch
				if(phaseProps.actors.indexOf(1) > -1){
					var switchChoice = players[1].getAI().decideSwitch();
					var waitTime = 500;

					if((players[1].getAI().hasStrategy("WAIT_CLOCK"))&&(players[1].getSwitchTimer() > 0)&&(players[1].getRemainingPokemon() > 1)){
						waitTime = Math.min(players[1].getSwitchTimer() - 1000, 5000);
						waitTime = Math.floor(Math.random() * waitTime) + 2000;
					}

					setTimeout(function(){
						self.queueAction(1, "switch", switchChoice);
					}, waitTime);
				}
			} else{
				var result = "tie";
				phase = "game_over";

				if(players[0].getRemainingPokemon() > players[1].getRemainingPokemon()){
					result = "win";
				} else{
					result = "loss";
				}

				self.dispatchUpdate({ result: result });
				clearInterval(mainLoopInterval);
			}

			// If a Pokemon has fainted, clear the action queue
			turnActions = [];
			queuedActions = [];
		}
	}

	// This is the meat of the pie. Runs the battle simulation and returns an array of timeline events

	this.simulate = function(){

		mode = "simulate";
		self.start();

		// Main battle loop

		var continueBattle = true;

		while(continueBattle){

			self.step();

			continueBattle = ((pokemon[0].hp > 0) && (pokemon[1].hp > 0));

			if(battleEndMode == "both"){
				continueBattle = ((pokemon[0].hp > 0) || (pokemon[1].hp > 0));
			}

			// Check for time expired, this will also prevent accidental infinite loops
			if(time > 240000){
				continueBattle = false;
			}

		}

		battleRatings = [pokemon[0].getBattleRating(), pokemon[1].getBattleRating()];

		// Set winner

		if(battleRatings[0] > battleRatings[1]){
			winner = {
				pokemon: pokemon[0],
				rating: battleRatings[0],
				hp: pokemon[0].hp,
				energy: pokemon[0].energy,
				buffs: [pokemon[0].statBuffs[0], pokemon[0].statBuffs[1]],
				shields: pokemon[0].shields
			};
		} else if(battleRatings[1] > battleRatings[0]){
			winner = {
				pokemon: pokemon[1],
				rating: battleRatings[1],
				hp: pokemon[1].hp,
				energy: pokemon[1].energy,
				buffs: [pokemon[1].statBuffs[0], pokemon[1].statBuffs[1]],
				shields: pokemon[0].shields
			};
		} else if(battleRatings[1] == battleRatings[0]){
			winner = {
				pokemon: false,
				rating: battleRatings[0]
			};
		}

		return timeline;
	}

	this.emulate = function(callback){
		mode = "emulate";
		sandbox = true;
		buffChanceModifier = 0;
		updateCallback = callback;

		// Sort and reset Pokemon
		for(var i = 0; i < players.length; i++){
			players[i].reset();

			var team = players[i].getTeam();

			for(var n = 0; n < team.length; n++){
				team[n].fullReset();
			}
		}

		for(var i = 0; i < pokemon.length; i++){
			pokemon[i].setBattle(self);
		}

		players[1].getAI().evaluateMatchup(turns, pokemon[1], pokemon[0], players[0]);

		self.start();

		var countdown = 5;
		phase = "countdown";
		self.dispatchUpdate();

		// Initiate countdown


		var countdownInterval = setInterval(function(){
			countdown--;

			if(countdown < 1){
				phase = "neutral";
				clearInterval(countdownInterval);
				self.dispatchUpdate();
			} else{
				self.dispatchUpdate({ countdown: countdown });
			}

		}, 1000);

		mainLoopInterval = setInterval(function(){
			self.step();
			self.dispatchUpdate();
		}, 500);
	}

	// Isolated function that returns an action a pokemon will perform this turn

	this.getTurnAction = function(poke, opponent){
		var action = null;

		// If Pokemon can take action

		if((poke.cooldown == 0)&&(! poke.hasActed)){
			if((! sandbox)||((mode == "emulate")&&(players[poke.index].getAI() !== false)&&(poke.hp > 0))){
				poke.hasActed = true;

				if(mode == "simulate"){
					if(decisionMethod == "default"){
						action = ActionLogic.decideAction(self, poke, opponent);
					} else{
						action = ActionLogic.decideRandomAction(self, poke, opponent);
					}

				} else{
					action = players[poke.index].getAI().decideAction(turns, poke, opponent);
				}
			} else{
				// Search for a charged move action

				for(var n = 0; n < actions.length; n++){
					var a = actions[n];

					if( ((mode == "simulate")&&(a.actor == poke.index)&&(a.turn == turns)&&(poke.chargedMoves.length > a.value))
					   || ( (mode == "emulate") && (a.actor == poke.index) && (! poke.hasActed) ) ){
						action = a;

						// Apply priority
						action.settings.priority = poke.priority;

						// Don't do action if not enough energy
						if((action.type == "charged")&&(poke.energy < poke.chargedMoves[action.value].energy)){
							action = null;
						}

						poke.hasActed = true;
					}
				}
			}

			// If no other action set, use a fast move
			if((! action)&&( (mode == "simulate") || ((mode == "emulate")&&(players[poke.index].getAI() !== false)))){
				action = new TimelineAction("fast", poke.index, turns, 0, {priority: poke.priority});
			}

			// Adjust priority

			if(action){
				if(action.type == "charged"){
					roundChargedMovesInitiated++;

					action.settings.priority += 10;

					// Set additional priority by attack stat
					if(poke.stats.atk > opponent.stats.atk){
						action.settings.priority++;
					}
				}

				if(action.type == "switch"){
					action.settings.priority += 20;
				}
			}
		}

		return action;
	}


	// Queue an action to be processed on the next available turn

	this.queueAction = function(actor, type, value){
		// First, clear any existing actions that belong to the current actor

		for(var i = 0; i < actions.length; i++){
			// Don't override a switch
			if(actions[i].actor == actor){
				if((actions[i].type != "switch")||(type == "switch")){
					actions.splice(i, 1);
					break;
				} else{
					return false;
				}
			}
		}

		// Insert a new action

		var action = new TimelineAction(
			type,
			actor,
			turns,
			value,
			{ shielded: false, buffs: false, priority: pokemon[actor].priority }
			);

		actions.push(action);

		if((type=="switch")&&(phase == "suspend_switch")){
			// If all required switches have been answered, resume the battle
			var switchesAnswered = 0;

			for(var i = 0; i < phaseProps.actors.length; i++){
				for(var n = 0; n < actions.length; n++){
					if((actions[n].type == "switch")&&(actions[n].actor == phaseProps.actors[i])){
						switchesAnswered++;
					}
				}
			}

			if(switchesAnswered == phaseProps.actors.length){
				clearTimeout(phaseTimeout);
				phase = "neutral";
			}
		}
	}


	// Process and apply a set battle action

	this.processAction = function(action, poke, opponent){

		// Don't run this action if it's invalidated

		if((! action.valid)||(action.processed)){

			self.logDecision(poke, " cannot use invalid action " + action.type + " " + action.value);
			return false;
		}

		// Set porcessed to true so it isn't processed twice
		action.processed = true;

		switch(action.type){

			case "fast":
				var move = poke.fastMove;
				self.useMove(poke, opponent, move);
				break;

			case "charged":
				if(typeof action.value === 'number'){
					var move = poke.chargedMoves[action.value];
				} else if(typeof action.value === 'string'){
					var move = poke.extraChargedMovePool.find(m => m.moveId == action.value);
				}
				
				// Validate this move can be used

				if(poke.energy >= move.energy){
					if(mode == "simulate"){
						self.useMove(poke, opponent, move, action.settings.shielded, action.settings.buffs, action.settings.charge);
					} else if((mode == "emulate")&&(phase != "suspend_charged")){
						// Initiate the suspended phase

						// If multiple moves are set to process on this turn, continue the same turn
						var continueSameTurn = false;

						for(var i = 0; i < turnActions.length; i++){
							if(((turnActions[i].type == "charged")||(turnActions[i].type == "fast"))&&(turnActions[i].actor != poke.index)){
								continueSameTurn = true;
							}
						}

						if(continueSameTurn){
							turns--;
						}

						// For instant moves, skip to animation and damage steps. Otherwise, perform charge up and shield decision
						if(move.hasTag("instant")){
							phase = "animating";
							chargeAmount = 1;

							self.dispatchUpdate({
								type: "charged",
								actor: poke.index,
								moveName: move.name,
								moveType: move.type
							});

							// Execute this move after a set amount of time
							setTimeout(function(){
								self.useMove(poke, opponent, move, false, action.settings.buffs);

								// If AI, evaluate the rest of the matchup
								if(opponent.hp > 0){
									if(players[1].getAI()){
										players[1].getAI().evaluateMatchup(turns, pokemon[1], pokemon[0], players[0]);
									}
								}
							}, 1000);

							// Return the game to the neutral phase
							phaseTimeout = setTimeout(function(){
								phase = "neutral";
							}, 3000);

						} else{
							phase = "suspend_charged";
							phaseProps = {
								actor: poke.index,
								move: action.value,
								power: 1,
								shield: false
							};

							chargeAmount = 0;
							playerUseShield = false;

							if(players[opponent.index].getAI() !== false){
								playerUseShield = players[opponent.index].getAI().decideShield(poke, opponent, move);
							}

							// Initiate the move animation
							setTimeout(function(){
								phase = "animating";
								self.dispatchUpdate({
									type: "charged",
									actor: poke.index,
									moveName: move.name,
									moveType: move.type
								});
							}, 6000);

							// Execute this move after a set amount of time
							setTimeout(function(){
								self.useMove(poke, opponent, move, playerUseShield, action.settings.buffs);

								// If AI, evaluate the rest of the matchup
								if(opponent.hp > 0){
									if(players[1].getAI()){
										players[1].getAI().evaluateMatchup(turns, pokemon[1], pokemon[0], players[0]);
									}
								}
							}, 8000);

							// Return the game to the neutral phase
							phaseTimeout = setTimeout(function(){
								phase = "neutral";
							}, 10000);
						}



					}

					roundChargedMoveUsed++;
				}
				break;

			case "wait":
				var displayTime = time;
				if(roundShieldUsed){
					displayTime -= chargedMinigameTime;
				}
				timeline.push(new TimelineEvent("tap interaction wait", "Wait", poke.index, displayTime, turns, [2,0]));
				break;

			case "switch":
				var player = players[poke.index];
				var newPokemon = player.getTeam()[action.value];

				if(newPokemon){
					if(poke.hp > 0){
						player.startSwitchTimer();

						// Reset the outgoing Pokemon's buffs and debuffs
						poke.statBuffs = [0,0];
						poke.startStatBuffs = [0,0];
						poke.setStartHp(poke.hp);
						poke.setStartEnergy(poke.energy);

						// Revert current Pokemon to original form
						if(poke.formChange && poke.activeFormId != poke.originalFormId && poke.formChange?.resetOnSwitch){
							poke.startFormId = poke.originalFormId;
							poke.changeForm(poke.originalFormId);
						}
					} else{
						self.getOpponent(poke.index).cooldown = 500;
					}

					self.setNewPokemon(newPokemon, poke.index, false);

					if(mode == "emulate"){
						// Submit an animation to be played
						self.pushAnimation(poke.index, "switch", false);
					}
				}
				break;
		}
	}

	// Use a move on an opposing Pokemon and produce a Timeline Event

	this.useMove = function(attacker, defender, move, forceShields, forceBuff, charge){
		charge = typeof charge !== 'undefined' ? charge : 1;

		let attackerChangedForm = false;
		let defenderChangedForm = false;
		let defenderUsedShield = false;

		// Apply pre-attack form changes
		if(attacker.formChange && attacker.formChange.trigger == "activate_charged" && attacker.activeFormId != attacker.formChange.alternativeFormId
			&& move.category == "charged"  && (attacker.formChange.moveId == "ANY" || attacker.formChange.moveId == move.moveId)){
			attacker.changeForm(attacker.formChange.alternativeFormId);

			self.logDecision(attacker, " has changed forms into " + attacker.activeFormId);

			if(mode == "emulate"){
				self.pushAnimation(attacker.index, "formchange", attacker.activeFormId);
			}

			attackerChangedForm = true;
		}

		var type = "fast " + move.type;
		var damage = DamageCalculator.damage(attacker, defender, move, charge, mode, players);
		move.damage = damage;

		var displayTime = time;
		var shieldBuffModifier = 0;

		self.logDecision(attacker, " uses " + move.name);

		// If Charged Move

		if(move.category == "charged"){

			type = "charged " + move.type;
			attacker.energy -= move.energy;

			let chargedMoveTime = chargedMinigameTime;

			if(move.hasTag("instant")){
				chargedMoveTime = 3000;
			}

			if((usePriority)&&(roundChargedMoveUsed > 0)&&(roundShieldUsed == 0)){
				time+=chargedMoveTime;
			}

			matchupDisplayTime += chargedMoveTime;

			// Add tap events for display

			if(! move.hasTag("instant")){
				for(var i = 0; i < 8; i++){
					timeline.push(new TimelineEvent("tap "+move.type, "Swipe", attacker.index, time+(1000*i), turns, [i]));
				}
			}


			// If defender has a shield, use it
			let canShield = defender.shields > 0 && ! move.hasTag("instant");

			if(canShield && (! sandbox || forceShields)){
				var useShield = true;
				var shieldWeight = 1;
				var noShieldWeight = 1; // Used for randomized shielding decisions
				var shieldDecision = ActionLogic.wouldShield(self, attacker, defender, move);

				// Don't shield early PUP's, Acid Sprays, or similar moves
				if( (! sandbox) && move.buffs && move.selfBuffing){
					if( (move.buffTarget == "self" && move.buffs[0] > 0) ||
					(move.buffTarget == "opponent" && move.buffs[1] < 0)){
						useShield = shieldDecision.value;
					}

					// For moves with multiple targets
					if( move.buffTarget == "both" && (move.buffsSelf[0] > 0 ||
					move.buffsOpponent[1] < 0) ){
						useShield = shieldDecision.value;
					}
				}

				// Don't shield early moves if the user has a defense debuffing move

				if( (! sandbox) && defender.bestChargedMove && defender.bestChargedMove.selfDefenseDebuffing){
					if(attacker.shields > 0){
						useShield = shieldDecision.value;
					} else if(defender.bestChargedMove && attacker.bestChargedMove){
						// If the attacker has no shields, shield this attack if the defender's next move will knock out the attacker
						var fastToNextCharged = Math.ceil( (defender.bestChargedMove.energy - defender.energy) / defender.fastMove.energyGain);
						var turnsToNextCharged = fastToNextCharged * defender.fastMove.turns;
						var cycleDamage = (fastToNextCharged * defender.fastMove.damage) + defender.bestChargedMove.damage;

						var attackerTurnsToNextCharged = Math.ceil((attacker.activeChargedMoves[0].energy - attacker .energy) / attacker.fastMove.energyGain) * attacker.fastMove.turns;

						if(attacker.stats.atk > defender.stats.atk){
							attackerTurnsToNextCharged--;
						}

						if((turnsToNextCharged >= attackerTurnsToNextCharged) && (attacker.hp <= cycleDamage)){
							useShield = shieldDecision.value;
						}
					}
				}

				if(! sandbox){
					// Save shields in Aegislash shield form to protect Blade form

					if(defender.activeFormId == "aegislash_shield" && damage * 2 < defender.hp){
						useShield = shieldDecision.value;
					}

					// Save shields in Cramorant gulping or gorging form to trigger Gulp Missile earlier against weak moves

					if((defender.activeFormId == "cramorant_gulping" || defender.activeFormId == "cramorant_gorging") && damage * 2.2 < defender.hp){
						useShield = shieldDecision.value;
					}

					// Don't shield early Cramorant Dives or Surfs to save for later attacks
					if(attacker.speciesId == "cramorant" && damage / defender.hp < .33){
						useShield = shieldDecision.value;
					}
				}

				if(decisionMethod == "random"){
					// For randomized battles, randomize shield usage
					shieldWeight = shieldDecision.shieldWeight;
					noShieldWeight = shieldDecision.noShieldWeight;

					// Shield the move if it's the lowest energy move and guaranteed to KO

					var lowestMoveEnergy = attacker.chargedMoves[0].energy;
					var lowestMoveDamage = attacker.chargedMoves[0].damage;

					if((attacker.chargedMoves.length > 1)&&(attacker.chargedMoves[1].energy < lowestMoveEnergy)){
						lowestMoveEnergy = attacker.chargedMoves[1].energy;
					}

					if((attacker.chargedMoves.length > 1)&&(attacker.chargedMoves[1].damage < lowestMoveDamage)){
						lowestMoveDamage = attacker.chargedMoves[1].damage;
					}

					if((move.energy == lowestMoveEnergy)&&(damage >= defender.hp * .75)){
						shieldWeight += 10;
					}

					if((move.energy == lowestMoveEnergy)&&(damage >= defender.hp * .95)){
						noShieldWeight = 0;
					}

					if(lowestMoveDamage >= defender.hp * .95){
						noShieldWeight = 0;
					}

					var shieldOptions = [
						new DecisionOption("YES", shieldWeight),
						new DecisionOption("NO", noShieldWeight)
					];

					var option = ActionLogic.chooseOption(shieldOptions);

					if(option.name == "YES"){
						useShield = true;
					} else{
						useShield = false;
					}
				}

				if(mode == "emulate" && players[defender.index].getShields() == 0){
					useShield = false;
				}

				if(useShield){
					let damageBlocked = damage-1;

					let shieldTimelineDescriptions = [damageBlocked];

					damage = 1;
					defender.shields--;
					roundShieldUsed = true;
					defenderUsedShield = true;

					// Apply form changes
					if(defender.formChange && defender.formChange.trigger == "activate_shield" && defender.activeFormId != defender.formChange.alternativeFormId){
						defender.changeForm(defender.formChange.alternativeFormId);

						self.logDecision(defender, " has changed forms into " + defender.activeFormId);

						if(mode == "emulate"){
							self.pushAnimation(defender.index, "formchange", defender.activeFormId);
						}

						defenderChangedForm = true

						shieldTimelineDescriptions.push("Form Change");
					}

					timeline.push(new TimelineEvent("shield", "Shield", defender.index, time+8500, turns, shieldTimelineDescriptions));

					if(players.length > 0){
						players[defender.index].useShield();
					}

					if(mode == "emulate"){
						turnMessages.push({ index: defender.index, str: "Blocked!"});
					}

					// Don't debuff if it shields

					if((move.buffs)&&(move.buffTarget == "opponent")){
						shieldBuffModifier = 0;
					}

					self.logDecision(defender, " blocks with a shield");

					// If a shield has already been used, add time so events don't visually overlap

					if((usePriority)&&(roundChargedMoveUsed > 0)&&(roundShieldUsed > 0)){
						displayTime = time;
					}

					if(roundChargedMoveUsed == 0){
						time+=chargedMinigameTime;
					}

					// Accumulate battle stats

					if(mode == "emulate"){
						attacker.battleStats.shieldsBurned++;
						defender.battleStats.shieldsUsed++;
						defender.battleStats.damageBlocked += damageBlocked;

						if(attacker.battleStats.shieldsUsed > 0){
							attacker.battleStats.shieldsFromShields++;
						}
					}

				} else{

					self.logDecision(defender, " doesn't shield because it can withstand the attack and is saving shields for later, boosted attacks");
				}
			} else{
				// No shield used

				if(mode == "emulate"){
					var effectiveness = defender.typeEffectiveness[move.type];
					if(effectiveness > 1){
						turnMessages.push({ index: defender.index, str: "Super effective!"});
					} else if(effectiveness < 1){
						turnMessages.push({ index: defender.index, str: "Not very effective..."});
					}

					if((defender.hp <= damage)&&(players[0].getSwitchTimer() == 0)&&(players[1].getSwitchTimer()==0)){
						attacker.battleStats.switchAdvantages++;
					}
				}
			}

			// Special event for Mimikyu, copying shield functionality
			if(defender.formChange && defender.formChange.trigger == "charged_move_damage" && defender.formChange.effect == "protect" && ! defenderUsedShield && ! move.hasTag("instant")){''
				let damageBlocked = damage-1;
				let shieldTimelineDescriptions = [damageBlocked, "Form Change", "-1 Defense"];

				damage = 1;
				roundShieldUsed = true;

				timeline.push(new TimelineEvent("shieldSpecial", "Disguise Busted", defender.index, time+8500, turns, shieldTimelineDescriptions));

				if(mode == "emulate"){
					turnMessages.push({ index: defender.index, str: "Blocked!"});
					
					if(defender.formChange.alternativeFormId == "mimikyu_busted"){
						turnMessages.push({ index: defender.index, str: "Mimikyu's disguise was busted!"});
					}
				}

				self.logDecision(defender, "'s disguise was busted");

				// If a shield has already been used, add time so events don't visually overlap

				if((usePriority)&&(roundChargedMoveUsed > 0)&&(roundShieldUsed > 0)){
					displayTime = time;
				}

				if(roundChargedMoveUsed == 0){
					time+=chargedMinigameTime;
				}
			}

			if(mode == "emulate"){
				attacker.battleStats.energyUsed += move.energy
				attacker.battleStats.chargedDamage += damage;
			}

			// Clear the queue if defender if fainted by a Charged Move
			if((mode == "emulate")&&(defender.hp <= 0)){
				turnActions = [];
				queuedActions = [];
			}

		} else if(move.category == "fast"){
			// If Fast Move

			if(mode == "emulate"){
				attacker.battleStats.energyGained += Math.min(move.energyGain, 100 - attacker.energy);
			}

			let energyGain = attacker.fastMove.energyGain;

			// Hard code to apply to custom moves
			if(attacker.activeFormId == "aegislash_shield"){
				energyGain = 6;
			}


			attacker.energy += energyGain;

			if(attacker.energy > 100){
				attacker.energy = 100;
			}
		}


		// In the emulator, accumulate battle stats

		if(mode == "emulate"){
			attacker.battleStats.damage += (Math.min(damage, defender.hp) / defender.stats.hp) * 100;

			if(attacker.battleStats.shieldsUsed > 0){
				attacker.battleStats.damageFromShields += (Math.min(damage, defender.hp) / defender.stats.hp) * 100;
			}

			// Enter health bar animations
			var effectiveness = defender.typeEffectiveness[move.type];

			self.pushAnimation(defender.index, "damage", effectiveness);
		}

		// Hard code to apply to custom moves
		if(attacker.activeFormId == "aegislash_shield" && move.energyGain > 0){
			damage = 1;
		}

		defender.hp = Math.max(0, defender.hp-damage);

		// Adjust display time so events don't visually overlap
		// This was really hard for my little brain to figure out so like really don't touch it

		if(move.category == "charged"){
			displayTime += 8500;

			if(usePriority && roundChargedMoveUsed > 0 && ! roundShieldUsed){
				if(! move.hasTag("instant")){
					displayTime += chargedMinigameTime;
				} else{
					displayTime += 2000;
				}
				
			}
		} else if(roundShieldUsed){
			displayTime -= chargedMinigameTime;
		}

		if((move.energyGain > 0)&&(roundChargedMoveUsed)){
			displayTime += 10000;
		}

		// Apply move buffs and debuffs

		var buffApplied = false;

		if(move.buffs){

			// Roll against the buff chance to see if it applies

			var buffRoll = Math.random() + buffChanceModifier + shieldBuffModifier; // Totally not Really Random but just to get off the ground for now

			if(forceBuff){
				buffRoll += 2; // Allow this to overcome the buffChanceModifier
			}

			if((move.buffApplyChance == 1)&&(! sandbox)){
				buffRoll += 1; // Force guaranteed buffs even when they're disabled
			}

			// For moves that have a buff apply chance, apply the deterministically by incrementing a value each activation based on the chance
			if((move.buffApplyChance < 1) && (move.buffApplyMeter !== undefined) &&(! sandbox)&&(buffChanceModifier == -1)){

				var startApplyCount = Math.floor(move.buffApplyMeter);
				move.buffApplyMeter += move.buffApplyChance;

				// If the cumulative activations of this move pass a whole number, deterministically apply the buff
				if(startApplyCount < Math.floor(move.buffApplyMeter)){
					buffRoll += 2;
				}
			}

			if(move.buffApplyChance == 1 || buffRoll > 1 - move.buffApplyChance){

				// Gather targets for move buffs or debuffs
				var buffTargets = [];
				var buffType = "debuff";

				if((move.buffTarget == "opponent")||(move.buffTarget == "both")){
					var buffType = "debuff";
					var buffs = move.buffs;

					if(move.buffTarget == "both"){
						buffs = move.buffsOpponent;
					}

					if((buffs[0] > 0) || (buffs[1] > 0)){
						buffType = "buff";
					}

					buffTargets.push({
						target: defender,
						buffs: buffs,
						buffType: buffType
					});
				}

				if((move.buffTarget == "self")||(move.buffTarget == "both")){
					buffType = "debuff";
					buffs = move.buffs;

					if(move.buffTarget == "both"){
						buffs = move.buffsSelf;
					}

					if((buffs[0] > 0) || (buffs[1] > 0)){
						buffType = "buff";
					}

					buffTargets.push({
						target: attacker,
						buffs: buffs,
						buffType: buffType
					});
				}

				// Apply all buff effects to their relevant targets

				for(var i = 0; i < buffTargets.length; i++){
					var buffs = buffTargets[i].buffs;

					buffTargets[i].target.applyStatBuffs(buffs);

					// In emulated battles, add buff messages

					if(mode == "emulate"){
						var statNames = ["Attack","Defense"];

						for(var n = buffs.length-1; n >= 0; n--){
							if(buffs[n] != 0){
								var statDescription = "";

								if(buffs[n] < -1){
									statDescription = "fell sharply";
								} else if(buffs[n] == -1){
									statDescription = "fell";
								} else if(buffs[n] == 1){
									statDescription = "rose";
								} else if(buffs[n] > 1){
									statDescription = "rose sharply";
								}

								turnMessages.push({ index: buffTargets[i].target.index, str: statNames[n] + " " + statDescription +"!"});
							}
						}
					}
				}

				buffApplied = true;

				// Set string for Charged Move timeline event

				var buffType = "debuff";

				if((move.buffs[0] > 0) || (move.buffs[1] > 0)){
					buffType = "buff";
				}

				type += " " + buffType;

			}

		}

		// Set energy value for TimelineEvent

		var energyValue = move.energyGain;
		var percentDamage = Math.round((damage / defender.stats.hp) * 1000) / 10;

		if(move.energy > 0){
			energyValue = -move.energy;
		}

		// Hard code override for Shield forme with custom move
		if(attacker.activeFormId == "aegislash_shield" && move.energyGain > 0 && move.moveId.indexOf("AEGISLASH_CHARGE") == -1){
			energyValue = 6;
		}


		var timelineDescriptions = [damage, energyValue, percentDamage];

		if(buffApplied){
			var buffStr = "";

			if(move.buffs[0] != 0){
				if(move.buffs[0] > 0){
					buffStr += "+";
				}

				buffStr += move.buffs[0] + " Attack";

				if(move.buffs[1] != 0){
					buffStr += "<br>";
				}
			}

			if(move.buffs[1] > 0){
				buffStr += "+";
			}

			if(move.buffs[1] != 0){
				buffStr += move.buffs[1] + " Defense";
			}

			timelineDescriptions.push(buffStr);
		}

		// Apply post-attack form changes
		if(attacker.formChange && attacker.formChange.trigger == "charged_move"
			&& move.category == "charged" && (attacker.formChange.moveId == "ANY" || attacker.formChange?.moveId == move.moveId || attacker.formChange?.moveIDs?.includes(move.moveId))){

			let newFormId = attacker.formChange.alternativeFormId;

			if(newFormId == "variable"){
				switch(attacker.speciesId){
					case "cramorant":
						let hp = attacker.hp / attacker.stats.hp;
						if(hp > 0.5){
							newFormId = "cramorant_gulping";
						} else{
							newFormId = "cramorant_gorging";
						}
						break;
				}
			}

			if(attacker.activeFormId != newFormId){
				self.logDecision(attacker, " has changed forms into " + newFormId);

				attacker.changeForm(newFormId);

				if(mode == "emulate"){
					self.pushAnimation(attacker.index, "formchange", attacker.activeFormId);
				}

				attackerChangedForm = true;
			}
		}

		if(attackerChangedForm){
			timelineDescriptions.push("Form Change");
		}

		// Form specific functionality for Cramorant Gulp Missile trigger, form change is applied on Gulp Missile
		if((defender.activeFormId == "cramorant_gulping" || defender.activeFormId == "cramorant_gorging")
			&& move.category == "charged" && ! defenderUsedShield && ! move.hasTag("instant")){

			switch(defender.activeFormId){
				case "cramorant_gulping":
					action = new TimelineAction(
						"charged",
						defender.index,
						turns,
						"GULP_MISSILE_ARROKUDA",
						{shielded: false, buffs: false, priority: defender.priority});
					
					
					turnActions.splice(actionIndex, 0, action);

					if(mode == "emulate"){
						turns--;
					}
					break;

				case "cramorant_gorging":
					action = new TimelineAction(
						"charged",
						defender.index,
						turns,
						"GULP_MISSILE_PIKACHU",
						{shielded: false, buffs: false, priority: defender.priority});
					
					turnActions.splice(actionIndex, 0, action);

					if(mode == "emulate"){
						turns--;
					}
					break;
			}
		}

		// Apply post-attack form changes to defender
		if(defender.formChange && defender.formChange.trigger == "charged_move_damage" && defender.activeFormId != defender.formChange.alternativeFormId
			&& move.category == "charged" && ! defenderUsedShield && ! move.hasTag("instant")){

			self.logDecision(defender, " has changed forms into " + defender.formChange.alternativeFormId);

			defender.changeForm(defender.formChange.alternativeFormId);

			if(mode == "emulate"){
				self.pushAnimation(defender.index, "formchange", defender.activeFormId);
			}

			defenderChangedForm = true;
		}

		if(defenderChangedForm){
			//timelineDescriptions.push("Form Change");
		}

		let editable = ! move.hasTag("uneditable");

		timeline.push(new TimelineEvent(type, move.name, attacker.index, displayTime, turns, timelineDescriptions, editable));
		// If a Pokemon has fainted, clear the action queue

		if(defender.hp <= 0){
			defender.faintSource = move.category;

			if(mode == "emulate"){
				queuedActions = [];
			}
		}

		return time;
	}

	// Send a battle update to the interface

	this.dispatchUpdate = function(props){

		if(! updateCallback){
			return false;
		}

		var data = {
			turn: turns,
			phase: phase,
			pokemon: pokemon,
			players: players,
			messages: turnMessages,
			animations: turnAnimations
		};

		if((phase == "suspend_charged")||(phase == "suspend_switch")){
			props = phaseProps;
		}

		// Merge additional properties supplied in parameters

		for (var prop in props){
			data[prop] = props[prop];
		}

		updateCallback(data);

		// Clear turn messages so they aren't displayed multiple times

		turnMessages = [];
		turnAnimations = [];
	}

	// Set a charge multiplier in emulated Battles

	this.setChargeAmount = function(val){
		chargeAmount = val;
	}

	// Set whether or not the player will use a shield for the upcoming Charged Move

	this.setPlayerUseShield = function(val){
		playerUseShield = val;
	}

	// Pause or resume the simulation

	this.setPause = function(val){
		isPaused = val;

		if(isPaused){
			phase = "game_paused";
		} else{
			phase = "neutral";
		}
	}

	// Completely stop the current simulation

	this.stop = function(){
		clearInterval(mainLoopInterval);
	}

	// Return whether or not a simulation can run successfully

	this.validate = function(){
		if((pokemon[0]) && (pokemon[1])){
			return true;
		} else{
			return false;
		}
	}

	// Return victorious pokemon, or false if simultaneous knockout

	this.getWinner = function(){
		return winner;
	}

	// Return battle rating results

	this.getBattleRatings = function(){
		return battleRatings;
	}

	// Return turns to win

	this.getTurnsToWin = function(){
		return turnsToWin;
	}

	// Reset the current turn number

	this.setTurns = function(val){
		turns = val;
	}

	// Return the current turn number

	this.getTurns = function(){
		return turns;
	}

	// Return the current players

	this.getPlayers = function(){
		return players;
	}

	// Return a battle rating RGB color given a rating

	this.getRatingColor = function(rating){
		var winColors = [
			[74,85,169],
			[11,118,215]
		]; // rgb
		var lossColors = [
			[199,12,112],
			[111,56,160]
		]; // rgb

		if(settings.colorblindMode){
			winColors = [
				[59,113,227],
				[26,133,255]
			]; // rgb

			lossColors = [
				[212,17,89],
				[178,39,120]
			]; // rgb
		}

		// Apply a gradient to bar color
		var colors = (rating <= 500) ? lossColors : winColors;
		var color = [ colors[0][0], colors[0][1], colors[0][2] ];

		if(rating > 1000){
			rating = 1000;
		} else if(rating < 0){
			rating = 0;
		}

		for(var j = 0; j < color.length; j++){
			var range = colors[1][j] - color[j];
			var base = color[j];
			var ratio = rating / 500;

			if(ratio > 1){
				ratio -= 1;
			}

			color[j] = Math.floor(base + (range * ratio));
		}

		return color;
	}

	// Returns whether a battle rating was a win, close win, tie, close loss, or loss

	this.getRatingClass = function(rating){
		if(rating == 500){
			return "tie";
		} else if( (rating < 500) && (rating > 250)){
			return "close-loss";
		} else if( rating <= 250){
			return "loss";
		} else if( (rating > 500) && (rating < 750)){
			return "close-win";
		} else if( rating >= 750){
			return "win";
		}
	}

	// Convert timeine to user-editable actions

	this.convertTimelineToActions = function(){
		var actions = [];

		// Iterate through timeline events

		for(var i = 0; i < timeline.length; i++){
			var event = timeline[i];

			// Fast moves are the default so only process charged moves

			if(event.type.indexOf("charged") > -1){

				// Determine which attack is being used

				var index = 0;

				for(var n = 0; n < pokemon[event.actor].chargedMoves.length; n++){
					if(pokemon[event.actor].chargedMoves[n].name == event.name){
						index = n;
					}
				}

				// Is the very previous event a shield event?

				var shielded = false;

				if((timeline[i-1])&&(timeline[i-1].type == "shield")&&(timeline[i-1].actor != event.actor)){
					shielded = true;
				}

				var buffs = (event.values[3] !== undefined); // Check to see if any buff or debuff values are associated with this event

				actions.push(new TimelineAction(
					"charged",
					event.actor,
					event.turn,
					index,
					{
						shielded: shielded,
						buffs: buffs,
						charge: 1,
						priority: pokemon[event.actor].priority
					}
				));
			}
		}

		return actions;
	}

	// Calculate number of turns it would take to flip the matchup

	this.calculateTurnMargin = function(){
		var turnMargin = 0;
		var target = pokemon[0]; // The Pokemon that won the battle
		var subject = pokemon[1]; // The Pokemon that lost the battle
		var turnArr = [];

		if(subject.hp > target.hp){
			target = pokemon[1];
			subject = pokemon[0];
		}

		// Calculate turns away from fainting with Fast Moves

		var fastMoveTurns = Math.ceil(target.hp / subject.fastMove.damage) * subject.fastMove.turns;
		var fastestChargedMoveTurns = 100;

		for(var i = 0; i < subject.chargedMoves.length; i++){
			var chargedMove = subject.chargedMoves[i];

			if(! chargedMove){
				continue;
			}

			var chargedMoveTurns = 0
			var fastMovesFromChargedMove = Math.ceil((chargedMove.energy - subject.energy) / subject.fastMove.energyGain);
			var sequenceDamage = chargedMove.damage + (fastMovesFromChargedMove * subject.fastMove.damage);

			if(fastMovesFromChargedMove < 0){
				fastMovesFromChargedMove = 0;
			}

			if(sequenceDamage >= target.hp){
				chargedMoveTurns = 1 + (fastMovesFromChargedMove * subject.fastMove.turns);
			} else{
				chargedMoveTurns = 1 + (fastMovesFromChargedMove * subject.fastMove.turns) + (Math.ceil((target.hp-sequenceDamage) / subject.fastMove.damage) * subject.fastMove.turns);
			}

			if(chargedMoveTurns < fastestChargedMoveTurns){
				fastestChargedMoveTurns = chargedMoveTurns;
			}

		}

		turnMargin = Math.min(fastMoveTurns, fastestChargedMoveTurns);

		return turnMargin;
	}

	// Set an array of user-defined actions to be processed by the simulator

	this.setActions = function(arr){
		actions = arr;

		// Reset action validation

		for(var i = 0; i < actions.length; i++){
			actions[i].valid = false;
		}
	}

	// Return actions

	this.getActions = function(){
		return actions;
	}

	// Force a switch at the end of the suspended switch period

	this.forceSwitch = function(){
		for(var i = 0; i < phaseProps.actors.length; i++){
			var player = players[phaseProps.actors[i]];
			var team = player.getTeam();

			// Switch in the first available Pokemon
			for(var n = 0; n < team.length; n++){
				if(team[n].hp > 0){
					self.queueAction(phaseProps.actors[i], "switch", n);
					break;
				}
			}
		}
	}

	// For the emulator, push an animation into the list of animations from this turn

	this.pushAnimation = function(actor, type, value){
		turnAnimations.push({
			actor: actor,
			type: type,
			value: value
		});
	}

	// Set whether to emulate or simulate

	this.setBattleMode = function(val){
		mode = val;
	}

	// Set whether or not the simulator will follow user input

	this.setSandboxMode = function(val){
		sandbox = val;

		if(val){
			buffChanceModifier = -1;
			actions = self.convertTimelineToActions();
		} else{
			buffChanceModifier = 0;
		}
	}

	// Set whether decisions are decided by the default deterministic method, or random

	this.setDecisionMethod = function(val){
		decisionMethod = val;
	}

	// Override another Pokemon's priority, used to remove priority from one Pokemon when it is given to another

	this.overridePriority = function(index, val){
		if(pokemon.length > index){
			pokemon[index].priority = val;
		}
	}


	// Add a decision to the debug log

	this.logDecision = function(pokemon, string){
		if(! debugMode)
			return false;

		decisionLog.push({
			turn: turns,
			pokemon: pokemon.speciesName,
			hp: pokemon.hp,
			string: string
		});
	}

	// Output debug log to console, debugMode must be set to true to collect logs

	this.debug = function(){
		for(var i = 0; i < decisionLog.length; i++){
			var log = decisionLog[i];

			console.log(log.turn + "\t:\t" + log.pokemon + "(" + log.hp + ")" + log.string);
		}
	}

	this.getDuration = function(){
		return duration;
	}

	this.getDisplayTime = function(){
		return matchupDisplayTime;
	}

	this.getTimeline = function(){
		return timeline;
	}

	this.setDebugMode = function(value){
		debugMode = value;
	}
};

;
class DecisionOption {
	/**
	 * @type {string | number | boolean}
	 */
	name;

	/**
	 * @type {number}
	 */
	weight;

	/**
	 *
	 * @param {string | number | boolean} name - Type is based on existing usage
	 * @param {number} weight
	 */
	constructor(name, weight) {
		this.name = name;
		this.weight = weight;
	}
}

;
// Load AI archetypes

var file = webRoot+"data/training/aiArchetypes.json?v=1";
var aiData = [];

$.getJSON( file, function( data ){
	aiData = data;
	console.log("AI data loaded ["+aiData.length+"]");
});

function TrainingAI(l, p, b){
	var level = parseInt(l);
	var player = p;
	var battle = b;
	var gm = GameMaster.getInstance();
	var teamPool = [];
	var currentTeamPool = null;
	var teamSelectMode = "normal";
	var partySize = 3;
	var props = aiData[l];
	var generateRosterCallback;
	var self = this;

	var currentStrategy; // The current employed strategy to determine behavior
	var previousStrategy; // Store the previous strategy
	var scenarios;

	var turnLastEvaluated = 0;

	if(level == 0){
		chargedMoveCount = 1;
	}

	// Generate a random roster of 6 given a cup and league

	this.generateRoster = function(size, callback, customTeamPool){
		partySize = size;
		generateRosterCallback = callback;

		var league = battle.getCP();
		var cup = battle.getCup().name;

		if((! teamPool[league+""+cup])&&(!customTeamPool)){
			gm.loadTeamData(league, cup, self.setTeamPool);
			return;
		}

		var pool;

		if(! customTeamPool){
			pool = teamPool[league+""+cup];
			currentTeamPool = teamPool[league+""+cup];
			teamSelectMode = "normal";
		} else{
			if(customTeamPool.data){
				pool = {
					"presets": customTeamPool.data
				}
			} else{
				pool = {
					"presets": customTeamPool
				}
			}

			currentTeamPool = pool;
			teamSelectMode = "preset";
		}

		// Test current pool for errors
		self.testPool(pool);

		if(pool.slots){
			pool = pool.slots;
		}

		var slotBucket = [];
		var slots = [];
		var roles = []; // Array of roles that have been filled on the team

		// Choose presets
		if(pool.presets){
			// Select a random preset team
			var presets = pool.presets;
			var presetIndex = Math.floor(Math.random() * pool.presets.length);
			var preset = pool.presets[presetIndex];
			pool = [];

			// For each Pokemon in the preset team, make a new "slot"

			for(var i = 0; i < preset.pokemon.length; i++){
				var slot = {
					slot: i,
					synergies: [],
					pokemon: [],
					weight: 1
				};

				preset.pokemon[i].weight = 1;
				preset.pokemon[i].difficulty = level;

				slot.pokemon.push(preset.pokemon[i]);

				pool.push(slot);
			}
		}

		// Put all the slots in bucket, multiple times for its weight value

		for(var i = 0; i < pool.length; i++){
			for(var n = 0; n < pool[i].weight; n++){
				slotBucket.push(pool[i].slot);
			}
		}

		// Draw unique slots from the bucket
		var rosterSize = 6;

		if((battle.getCup().partySize == 3)&&(battle.getCup().presetOnly)){
			rosterSize = battle.getCup().partySize;
		}

		if((teamSelectMode == "preset")&&(partySize == 3)){
			rosterSize = 3;
		}

		for(var i = 0; i < rosterSize; i++){
			var index = Math.floor(Math.random() * slotBucket.length);
			var slot = slotBucket[index];
			var synergies = pool.filter(obj => {
  				return obj.slot === slot
			})[0].synergies;
			slots.push(slot);

			// Add synergies to bucket to increase chances of picking them
			for(var n = 0; n < synergies.length; n++){
				if(slotBucket.indexOf(synergies[n]) > -1){
					slotBucket.push(synergies[n], synergies[n]);
				}
			}

			// Clear the selected value from the bucket
			var itemIndex = 0;
			while ((itemIndex = slotBucket.indexOf(slot, itemIndex)) > -1) {
			  slotBucket.splice(itemIndex, 1);
			}
		}

		// For each slot, pick a random Pokemon

		var roster = [];
		var selectedIds = []; // Array of Pokemon ID's to check to avoid duplicates
		var restrictedPicks = 0;
		var restrictedLimit = 6;
		var restrictedPicksExist = false;

		if(battle.getCup().restrictedPicks){
			restrictedLimit = battle.getCup().restrictedPicks;
			restrictedPicksExist = true;
		}

		for(var i = 0; i < slots.length; i++){
			// Grab the pool of Pokemon given the slot name
			var slotPool = pool.filter(obj => {
  				return obj.slot === slots[i]
			})[0].pokemon;
			var pokeBucket = [];

			// Choose from restricted picks if available
			if((restrictedPicksExist)&&(restrictedPicks<restrictedLimit)){
				var slotObj = pool.filter(obj => {
  				return obj.slot === slots[i]
			})[0];

				if(slotObj.restricted){
					slotPool = slotObj.restricted;
					restrictedPicks++;
				}
			}

			for(var n = 0; n < slotPool.length; n++){
				var poke = slotPool[n];
				var role = "none";

				if(poke.role){
					role = poke.role;
				}
				// Is this Pokemon valid to be added to the team?
				if((selectedIds.indexOf(poke.speciesId) === -1)&&(Math.abs(poke.difficulty - level) <= 1)&&(roles.indexOf(role) == -1)){
					for(var j = 0; j < poke.weight; j++){
						pokeBucket.push(poke);
					}
				}
			}

			// Select a random poke from the bucket
			var index = Math.floor(Math.random() * pokeBucket.length);
			var poke = pokeBucket[index];

			var pokemon = new Pokemon(poke.speciesId, player.index, battle);
			pokemon.initialize(battle.getCP());

			if(self.hasStrategy("OPTIMIZE_TIMING")){
				pokemon.optimizeMoveTiming = true;
			} else{
				pokemon.optimizeMoveTiming = false;
			}

			roles.push(poke.role);

			// Select a random IV spread according to difficulty
			var ivCombos = pokemon.generateIVCombinations("overall", 1, props.ivComboRange);
			var rank = Math.floor(Math.random() * ivCombos.length);

			// If this Pokemon maxes under or near 1500, make sure it's close to 1500
			if(ivCombos[0].level >= 39){
				rank = Math.floor(Math.random() * 50 * (props.ivComboRange  / 4000));
			}
			var combo = ivCombos[rank];

			pokemon.setIV("atk", combo.ivs.atk);
			pokemon.setIV("def", combo.ivs.def);
			pokemon.setIV("hp", combo.ivs.hp);
			pokemon.setLevel(combo.level);

			pokemon.selectMove("fast", poke.fastMove);
			for(var n = 0; n < props.chargedMoveCount; n++){
				pokemon.selectMove("charged", poke.chargedMoves[n], n);
			}

			if(props.chargedMoveCount == 1){
				pokemon.selectMove("charged", "none", 1);
			}

			if(poke.shadowType){
				pokemon.setShadowType(poke.shadowType);
			}

			roster.push(pokemon);
			selectedIds.push(poke.speciesId);
		}

		player.setRoster(roster);
		generateRosterCallback(roster);
	}

	// With a set roster, produce a team of 3

	this.generateTeam = function(opponentRoster, previousResult, previousTeams){
		var roster = player.getRoster();
		var team = [];

		// Reset all Pokemon involves

		for(var i = 0; i < opponentRoster.length; i++){
			opponentRoster[i].fullReset();
		}

		for(var i = 0; i < roster.length; i++){
			roster[i].fullReset();
		}

		// In Single 3v3 mode, use the Basic option most of the time depending on difficulty
		var basicWeight = 1;

		if(opponentRoster.length < 6){
			basicWeight = (4 * (4 - level));

			// Make the teams more random in GO Battle League

			if((battle.getCup().partySize)&&(battle.getCup().partySize == 3)){
				basicWeight *= 3;
			}
		}

		// Choose a pick strategy
		var pickStrategyOptions = [];

		if(! previousResult){
			// If this is a fresh round, use these strategies
			pickStrategyOptions.push(new DecisionOption("BASIC", basicWeight));
			pickStrategyOptions.push(new DecisionOption("BEST", 6));
			pickStrategyOptions.push(new DecisionOption("COUNTER", 6));
			pickStrategyOptions.push(new DecisionOption("UNBALANCED", 3));
		} else{
			// If this is subsequent round, use these strategies
			var winStratWeight = 3;
			var loseStratWeight = 3;

			if(previousResult == "win"){
				loseStratWeight = 12;
			} else if(previousResult == "loss"){
				winStratWeight = 12;
			}

			pickStrategyOptions.push(new DecisionOption("SAME_TEAM", winStratWeight));
			pickStrategyOptions.push(new DecisionOption("SAME_TEAM_DIFFERENT_LEAD", winStratWeight));
			pickStrategyOptions.push(new DecisionOption("COUNTER_LAST_LEAD", loseStratWeight));
			pickStrategyOptions.push(new DecisionOption("COUNTER", loseStratWeight));
		}

		// Add option for presets
		if((currentTeamPool)&&(currentTeamPool.presets)&&(opponentRoster.length == 3)){
			pickStrategyOptions.push(new DecisionOption("PRESET", 90));
		}

		var pickStrategy = self.chooseOption(pickStrategyOptions).name;

		// If the team pool only has presets, use a preset

		if(currentTeamPool && battle.getCup().partySize && (battle.getCup().partySize == 3)){
			if(teamSelectMode == "preset" || (battle.getCup().presetOnly) || ((! currentTeamPool.slots) && (! currentTeamPool[0].slot))){

				pickStrategy = "PRESET";
			}
		}

		console.log(pickStrategyOptions);


		switch(pickStrategy){
			// Choose a random set of 3 from the roster
			case "BASIC":
				var startIndex = Math.floor(Math.random() * 4);
				for(var i = 0; i < 3; i++){
					team.push(roster[startIndex + i]);
				}
				break;

			// Choose a team that has the best average matchups against the opponent's roster
			case "BEST":
				var teamPerformance = self.calculateAverageRosterPerformance(roster, opponentRoster);

				// Lead with the best average Pokemon
				team.push(teamPerformance[0].pokemon);

				// Next, let's give it a bodyguard
				var scenarios = teamPerformance[0].scenarios;
				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to best

				var targets = [scenarios[0].opponent, scenarios[1].opponent];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						// Sometimes lead with the bodyguard, sometimes have it in the back
						if(Math.random() > .5){
							team.push(teamPerformance[i].pokemon);
						} else{
							team.unshift(teamPerformance[i].pokemon);
						}

						break;
					}
				}

				// Finally, let's round them out with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				break;

			// Choose a team that counters the opponent's best Pokemon
			case "COUNTER":
				var teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, roster);
				var scenarios = teamPerformance[0].scenarios;

				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to best

				// Lead with the best counter
				team.push(scenarios[0].opponent);

				// Next, let's give it a bodyguard
				var scenarios = self.runBulkScenarios("NO_BAIT", team[0], opponentRoster);
				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to last

				var targets = [scenarios[0].opponent, scenarios[1].opponent];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				// Finally, let's round them out with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				break;

			// Choose two high performance Pokemon and lead with a bodyguard
			case "UNBALANCED":
				var teamPerformance = self.calculateAverageRosterPerformance(roster, opponentRoster);

				// Choose the best two average Pokemon
				team.push(teamPerformance[0].pokemon, teamPerformance[1].pokemon);

				// Finally, let's round lead with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.splice(0, 0, teamPerformance[i].pokemon);
						break;
					}
				}

				break;

			// Use the same team as last time
			case "SAME_TEAM":
				var previousTeam = previousTeams[1];

				for(var i = 0; i < previousTeam.length; i++){
					team.push(previousTeam[i]);
				}
				break;

			// Use the same team as last time but with the previous lead's bodyguard as the lead
			case "SAME_TEAM_DIFFERENT_LEAD":
				var previousTeam = previousTeams[1];

				team.push(previousTeam[1]);
				previousTeam.splice(1,1);

				for(var i = 0; i < previousTeam.length; i++){
					team.push(previousTeam[i]);
				}
				break;

			// Choose a team that counters the opponent's previous lead
			case "COUNTER_LAST_LEAD":
				var opponentPreviousLead = previousTeams[0][0];

				var teamPerformance = self.calculateAverageRosterPerformance([opponentPreviousLead], roster);
				var scenarios = teamPerformance[0].scenarios;

				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to best

				// Lead with the best counter
				team.push(scenarios[0].opponent);

				// Next, let's give it a bodyguard
				var scenarios = self.runBulkScenarios("NO_BAIT", team[0], opponentRoster);
				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to last

				var targets = [scenarios[0].opponent, scenarios[1].opponent];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				// Finally, let's round them out with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				break;

			case "PRESET":
				var presetBucket = [];

				for(var i = 0; i < currentTeamPool.presets.length; i++){
					for(var n = 0; n < currentTeamPool.presets[i].weight; n++){
						presetBucket.push(currentTeamPool.presets[i]);
					}
				}

				var presetIndex = Math.floor(Math.random() * presetBucket.length);
				var preset = presetBucket[presetIndex];

				for(var i = 0; i < preset.pokemon.length; i++){
					var poke = preset.pokemon[i];
					var pokemon = new Pokemon(poke.speciesId, player.index, battle);
					pokemon.initialize(battle.getCP());

					// Select a random IV spread according to difficulty
					var ivCombos = pokemon.generateIVCombinations("overall", 1, props.ivComboRange);
					var rank = Math.floor(Math.random() * ivCombos.length);

					// If this Pokemon maxes under or near 1500, make sure it's close to 1500
					if(ivCombos[0].level >= 39){
						rank = Math.floor(Math.random() * 50 * (props.ivComboRange  / 4000));
					}
					var combo = ivCombos[rank];

					pokemon.setIV("atk", combo.ivs.atk);
					pokemon.setIV("def", combo.ivs.def);
					pokemon.setIV("hp", combo.ivs.hp);
					pokemon.setLevel(combo.level);

					pokemon.selectMove("fast", poke.fastMove);
					for(var n = 0; n < props.chargedMoveCount; n++){
						pokemon.selectMove("charged", poke.chargedMoves[n], n);
					}

					if(props.chargedMoveCount == 1){
						pokemon.selectMove("charged", "none", 1);
					}

					team.push(pokemon);
				}

				break;
		}

		console.log(pickStrategy);
		console.log(team);

		player.setTeam(team);
	}

	// Test a pool of Pokemon for moveset errors

	this.testPool = function(pool){
		var slots = pool;
		var presets = [];
		var pokes = [];

		if(pool.slots){
			slots = pool.slots;
		}

		if(pool.presets){
			presets = pool.presets;
		}

		for(var i = 0; i < slots.length; i++){
			for(var n = 0; n < slots[i].pokemon.length; n++){
				pokes.push(slots[i].pokemon[n]);
			}
		}

		for(var i = 0; i < presets.length; i++){
			for(var n = 0; n < presets[i].pokemon.length; n++){
				pokes.push(presets[i].pokemon[n]);
			}
		}

		for(var i = 0; i < pokes.length; i++){
			var pokemon = new Pokemon(pokes[i].speciesId, 0, battle);

			if(pokemon.data.fastMoves.indexOf(pokes[i].fastMove) == -1){
				console.error(pokemon.speciesId + " doesn't know " + pokes[i].fastMove);
			}

			if(pokemon.data.chargedMoves.indexOf(pokes[i].chargedMoves[0]) == -1){
				console.error(pokemon.speciesId + " doesn't know " + pokes[i].chargedMoves[0]);
			}

			if(pokemon.data.chargedMoves.indexOf(pokes[i].chargedMoves[0]) == -1){
				console.error(pokemon.speciesId + " doesn't know " + pokes[i].chargedMoves[0]);
			}
		}
	}

	// Return an array of average performances of team A against team B

	this.calculateAverageRosterPerformance = function(teamA, teamB){
		var results = [];

		for(var i = 0; i < teamA.length; i++){
			var scenarios = self.runBulkScenarios("NO_BAIT", teamA[i], teamB);
			var average = 0;

			for(var n = 0; n < scenarios.length; n++){
				average += scenarios[n].average;
			}

			average /= scenarios.length;

			results.push({
				pokemon: teamA[i],
				scenarios: scenarios,
				average: average
			});
		}

		// Sort by average rating
		results.sort((a,b) => (a.average > b.average) ? -1 : ((b.average > a.average) ? 1 : 0));
		return results;
	}

	// Set the pool of available Pokemon from data

	this.setTeamPool = function(league, cup, data){
		teamPool[league+""+cup] = data;
		self.generateRoster(partySize, generateRosterCallback);
	}

	// Evaluate the current matchup and decide a high level strategy

	this.evaluateMatchup = function(turn, pokemon, opponent, opponentPlayer){
		pokemon.baitShields = 1;
		pokemon.farmEnergy = false;

		opponent.baitShields = 1;
		opponent.farmEnergy = false;

		// Sim multiple scenarios to help determine strategy

		scenarios = {};

		scenarios.bothBait = self.runScenario("BOTH_BAIT", pokemon, opponent);
		scenarios.neitherBait = self.runScenario("NEITHER_BAIT", pokemon, opponent);
		scenarios.noBait = self.runScenario("NO_BAIT", pokemon, opponent);
		scenarios.farm = self.runScenario("FARM", pokemon, opponent);

		var overallRating = (scenarios.bothBait.average + scenarios.neitherBait.average + scenarios.noBait.average) / 3;
		var options = [];
		var totalSwitchWeight = 0;

		if((self.hasStrategy("SWITCH_BASIC"))&&(player.getSwitchTimer() == 0)&&(player.getRemainingPokemon() > 1)){
			var switchThreshold = 500;

			if((self.hasStrategy("PRESERVE_SWITCH_ADVANTAGE"))&&(opponentPlayer.getRemainingPokemon() > 1)){
				switchThreshold = 450;
			}

			var switchWeight = Math.floor(Math.max((switchThreshold - overallRating) / 10, 0));
			var canCounterSwitch = false;

			// Is the opponent switch locked and do I have a better Pokemon for it?
			if(opponentPlayer.getSwitchTimer() > 30000){
				var team = player.getTeam();
				var remainingPokemon = [];

				for(var i = 0; i < team.length; i++){
					if((team[i].hp > 0)&&(team[i] != pokemon)){
						remainingPokemon.push(team[i]);
					}
				}

				for(var i = 0; i < remainingPokemon.length; i++){
					var scenario = self.runScenario("NO_BAIT", remainingPokemon[i], opponent);
					var rating = scenario.average;

					if(rating - 500 > (Math.max(overallRating, 500) - 500) * 1.2){
						switchWeight += Math.round((rating-overallRating)/10);
						canCounterSwitch = true;
					}
				}
			}

			// Don't switch Pokemon when HP is low
			if((self.hasStrategy("PRESERVE_SWITCH_ADVANTAGE"))&&(opponentPlayer.getSwitchTimer() - player.getSwitchTimer() < 30)&&(pokemon.hp / pokemon.stats.hp <= .25)&&(opponentPlayer.getRemainingPokemon() > 1)){
				switchWeight = 0;
			}
			options.push(new DecisionOption("SWITCH_BASIC", switchWeight));

			totalSwitchWeight += switchWeight;

			// See if it's feasible to build up energy before switching
			if(self.hasStrategy("SWITCH_FARM")){
				var dpt = (opponent.fastMove.damage / (opponent.fastMove.cooldown / 500));
				var percentPerTurn = (dpt / pokemon.stats.hp) * 100; // The opponent's fast attack will deal this % damage per turn
				var weightFactor =  Math.pow(Math.round(Math.max(3 - percentPerTurn, 0)), 2);

				// Switch immediately if previously failed to switch before a Charged Move
				if(previousStrategy == "SWITCH_FARM"){
					weightFactor = 0;
				}

				if(percentPerTurn > 3){
					weightFactor = 0;
				}

				if(opponent.fastMove.energyGain / (opponent.fastMove.cooldown / 500) < 3){
					weightFactor = 0;
				}

				if((pokemon.hp / pokemon.stats.hp < .5)&&(opponentPlayer.getRemainingPokemon() > 1)){
					weightFactor = .1;
				}

				if(canCounterSwitch){
					weightFactor = .1;
				}

				if(pokemon.hp / pokemon.stats.hp < .25){
					weightFactor = 0;
				}

				totalSwitchWeight += (switchWeight * weightFactor);
				options.push(new DecisionOption("SWITCH_FARM", Math.floor(switchWeight * weightFactor)));
			}
		}

		// If there's a decent chance this Pokemon really shouldn't switch out, add other actions

		if(totalSwitchWeight < 10){
			options.push(new DecisionOption("DEFAULT", 1));

			if((self.hasStrategy("BAIT_SHIELDS"))&&(opponent.shields > 0)&&(pokemon.chargedMoves.length > 1)){
				var baitWeight = Math.max(Math.round( (scenarios.bothBait.average - scenarios.noBait.average) / 20), 1);

				// If this Pokemon's moves are very close in DPE, prefer the shorter energy move
				if((scenarios.bothBait.average >= 500)&&(pokemon.chargedMoves.length == 2)){
					if(Math.abs(pokemon.chargedMoves[0].dpe - pokemon.chargedMoves[1].dpe) <= .1){
						baitWeight += 5;
					}
				}

				// If behind on shields, bait more
				if(player.getShields() < opponentPlayer.getShields()){
					baitWeight += 2;
				}

				// If this matchup is very bad, consider not baiting
				if(overallRating < 250){
					baitWeight = 1;
				}

				// For Skull Bash specifically, prefer not to bait
				if((pokemon.bestChargedMove.moveId == "SKULL_BASH")&&(player.getRemainingPokemon() > 1)){
					baitWeight = 0;
				}

				// If the Pokemon has very low health, don't bait
				if((pokemon.hp / pokemon.stats.hp < .25)&&(pokemon.energy < 70)){
					baitWeight = 0;
				}

				options.push(new DecisionOption("BAIT_SHIELDS", baitWeight));

				// If this Pokemon's most powerful Charged Move doesn't threaten shields, be less likely to bait
				var biggestDamage = 0;

				for(var i = 0; i < pokemon.chargedMoves.length; i++){
					if(pokemon.chargedMoves[i].damage > biggestDamage){
						biggestDamage = pokemon.chargedMoves[i].damage;
					}
				}

				if((biggestDamage < pokemon.hp * .9)&&(!pokemon.getBoostMove())){
					var defaultWeight = Math.ceil(pokemon.hp / biggestDamage);
					options.push(new DecisionOption("DEFAULT", defaultWeight));
				}
			}

			if(self.hasStrategy("FARM_ENERGY")){
				var farmWeight = Math.round( (scenarios.farm.average - 600) / 20);

				// Let's farm if we'll win and the opponent is low on energy
				if((opponent.energy < 20)&&(scenarios.farm.average > 500)){
					farmWeight += 12;
				}

				// Don't farm against the last Pokemon
				if(opponentPlayer.getRemainingPokemon() < 2){
					farmWeight = 0;
				}

				// Let's make very certain to farm if that looks like a winning strategy
				if((self.hasStrategy("BAD_DECISION_PROTECTION"))&&(farmWeight >= 15)){
					farmWeight *= 5;
				}
				options.push(new DecisionOption("FARM", farmWeight));
			}
		}

		// Decide the AI's operating strategy
		var option = self.chooseOption(options);
		self.processStrategy(option.name);

		if(turn !== undefined){
			turnLastEvaluated = battle.getTurns();
		} else{
			turnLastEvaluated = 1;
		}
	}

	// Run a specific scenario

	this.runScenario = function(type, pokemon, opponent){
		var scenario = {
			opponent: opponent,
			name: type,
			matchups: [],
			average: 0,
			minShields: 3
		};

		// Preserve current HP, energy, and stat boosts which get reset during simulation
		// Otherwise old values of startHp, startingShields, etc. may get used during the reset
		pokemon.startHp = pokemon.hp;
		pokemon.startEnergy = pokemon.energy;
		pokemon.startStatBuffs = [pokemon.statBuffs[0], pokemon.statBuffs[1]];
		pokemon.startCooldown = pokemon.cooldown;
		pokemon.startingShields = pokemon.shields;
		pokemon.startFormId = pokemon.activeFormId;

		opponent.startHp = opponent.hp;
		opponent.startEnergy = opponent.energy;
		opponent.startStatBuffs = [opponent.statBuffs[0], opponent.statBuffs[1]];
		opponent.startCooldown = opponent.cooldown;
		opponent.startingShields = opponent.shields;
		opponent.startFormId = opponent.activeFormId;

		// Preserve old Pokemon stats
		var startStats = [
			{
				shields: pokemon.startingShields,
				hp: pokemon.hp,
				energy: pokemon.energy,
				cooldown: pokemon.cooldown,
				index: pokemon.index,
				formId: pokemon.activeFormId
			},
			{
				shields: opponent.startingShields,
				hp: opponent.hp,
				energy: opponent.energy,
				cooldown: opponent.cooldown,
				index: opponent.index,
				formId: opponent.activeFormId
			}
		];

		switch(type){
			case "BOTH_BAIT":
				pokemon.baitShields = 1;
				pokemon.farmEnergy = false;
				opponent.baitShields = 1;
				opponent.farmEnergy = false;
				break;

			case "NEITHER_BAIT":
				pokemon.baitShields = 0;
				pokemon.farmEnergy = false;
				opponent.baitShields = 0;
				opponent.farmEnergy = false;
				break;

			case "NO_BAIT":
				pokemon.baitShields = 0;
				pokemon.farmEnergy = false;
				opponent.baitShields = 0;
				opponent.farmEnergy = false;
				break;

			case "FARM":
				pokemon.baitShields = 1;
				pokemon.farmEnergy = true;
				opponent.baitShields = 1;
				opponent.farmEnergy = false;
				break;
		}

		var b = new Battle();
		b.setNewPokemon(pokemon, 0, false);
		b.setNewPokemon(opponent, 1, false);

		var shieldWeights = [4,4,1];
		var totalWeight = 0;

		var maxShields = Math.max(pokemon.startingShields, opponent.startingShields);

		for(var i = 0; i <= startStats[0].shields; i++){
			for(n = 0; n <= startStats[1].shields; n++){
				pokemon.startingShields = i;
				opponent.startingShields = n;
				b.simulate();

				var rating = b.getBattleRatings()[0];

				scenario.matchups.push(rating);

				var shieldWeight = shieldWeights[i] * shieldWeights[n];
				totalWeight += shieldWeight;
				scenario.average += (rating * shieldWeight);

				if((rating >= 500)&&(i < scenario.minShields)){
					scenario.minShields = i;
				}
			}
		}

		scenario.average /= totalWeight;

		pokemon.startingShields = startStats[0].shields;
		pokemon.startHp = startStats[0].hp;
		pokemon.startEnergy = startStats[0].energy;
		pokemon.startCooldown = startStats[0].cooldown;

		opponent.startingShields = startStats[1].shields;
		opponent.startHp = startStats[1].hp;
		opponent.startEnergy = startStats[1].energy;
		opponent.startCooldown = startStats[1].cooldown;
		

		pokemon.reset();
		opponent.reset();
		pokemon.index = startStats[0].index;
		pokemon.farmEnergy = false;
		opponent.index = startStats[1].index;
		opponent.farmEnergy = false;

		if(pokemon.formChange){
			pokemon.startFormId = pokemon.originalFormId;

			if(pokemon.activeFormId != startStats[0].formId){
				pokemon.formChange(startStats[0].formId);
			}
		}

		if(opponent.formChange){
			opponent.startFormId = opponent.originalFormId;

			if(opponent.activeFormId != startStats[1].formId){
				opponent.formChange(startStats[1].formId);
			}
		}


		return scenario;
	}

	this.runBulkScenarios = function(type, pokemon, opponents){
		var scenarios = [];

		for(var i = 0; i < opponents.length; i++){
			var scenario = self.runScenario(type, pokemon, opponents[i]);
			scenarios.push(scenario);
		}

		return scenarios;
	}

	// Choose an option from an array
	this.chooseOption = function(options){
		var optionBucket = [];

		// Put all the options in bucket, multiple times for its weight value

		for(var i = 0; i < options.length; i++){
			for(var n = 0; n < options[i].weight; n++){
				optionBucket.push(options[i].name);
			}
		}

		// If all options have 0 weight, just toss the first option in there

		if(optionBucket.length == 0){
			optionBucket.push(options[0].name);
		}

		var index = Math.floor(Math.random() * optionBucket.length);
		var optionName = optionBucket[index];
		var option = options.filter(obj => {
			return obj.name === optionName
		})[0];

		return option;
	}

	// Change settings to accomodate a new strategy

	this.processStrategy = function(strategy){
		previousStrategy = currentStrategy;
		currentStrategy = strategy;

		var pokemon = battle.getPokemon()[player.getIndex()];

		switch(currentStrategy){
			case "SWITCH_FARM":
				pokemon.farmEnergy = true;
				break;

			case "FARM":
				pokemon.farmEnergy = true;
				break;

			case "DEFAULT":
				pokemon.baitShields = 0;
				pokemon.farmEnergy = false;
				break;

			case "BAIT_SHIELDS":
				pokemon.baitShields = 1;
				pokemon.farmEnergy = false;
				break;

			case "OVERFARM":
				pokemon.farmEnergy = true;
				break;
		}
	}

	this.decideAction = function(turn, poke, opponent){
		var action = null;
		var opponentPlayer = battle.getPlayers()[opponent.index];

		poke.setBattle(battle);
		poke.resetMoves();

		// How much potential damage will they have after one more Fast Move?
		var extraFastMoves = Math.floor((poke.fastMove.cooldown-opponent.cooldown) / (opponent.fastMove.cooldown));

		// Give some extra room for overfarming
		if((currentStrategy.indexOf("SWITCH") == -1)){
			extraFastMoves++;
		}

		if((opponent.cooldown > 0)&&(opponent.cooldown < poke.fastMove.cooldown)){
			extraFastMoves = Math.max(extraFastMoves, 1);
		}

		var futureEnergy = opponent.energy + (extraFastMoves * opponent.fastMove.energyGain);
		var futureDamage = self.calculatePotentialDamage(opponent, poke, futureEnergy);

		// Stop farming if they're about to get a lethal Charged Move

		if((futureDamage >= poke.hp)&&(currentStrategy=="FARM")){
			currentStrategy = "DEFAULT";
			self.processStrategy(currentStrategy);
		}

		if((currentStrategy.indexOf("SWITCH") > -1) && (player.getSwitchTimer() == 0)){
			var performSwitch = false;

			if((currentStrategy == "SWITCH_BASIC") && (turn - turnLastEvaluated >= props.reactionTime)){
				performSwitch = true;
			}

			if(currentStrategy == "SWITCH_FARM"){
				// Check to see if the opposing Pokemon is close to a damaging Charged Move
				if((futureDamage >= poke.hp)||(futureDamage >= poke.stats.hp * .14)){
					performSwitch = true;
				}

				if(poke.hp / poke.stats.hp < .2){
					performSwitch = true;
				}

			}

			if(performSwitch){
				// Determine a Pokemon to switch to
				var switchChoice = self.decideSwitch();
				action = new TimelineAction("switch", player.getIndex(), turn, switchChoice, {priority: poke.priority});
			}
		}

		// Potentially farm more energy than needed

		if((self.hasStrategy("OVERFARM"))&&(scenarios.noBait.average > 450)
			&&(currentStrategy.indexOf("SWITCH") == -1)&&(opponentPlayer.getRemainingPokemon() > 1)){
			var overfarmChance = 2;

			// Be likely to overfarm if the opponent is low on energy
			overfarmChance += Math.round((50 - opponent.energy) / 10);

			if((futureDamage >= poke.hp)||(futureDamage >= poke.stats.hp * .15)){
				overfarmChance = -1;
			}

			if(poke.energy == 100){
				overfarmChance = -1;
			}

			// Don't overfarm with Power-Up Punch or Acid Spray
			for(var i = 0; i < poke.chargedMoves.length; i++){
				if((poke.chargedMoves[i].name == "Power-Up Punch")||(poke.chargedMoves[i].name == "Acid Spray")){
					overfarmChance = -1;
				}
			}

			// Don't overfarm if this Pokemon has extremely low HP
			if(poke.hp / poke.stats.hp < .2){
				overfarmChance = -1;
			}

			// Perform overfarm
			if(Math.floor((Math.random() * overfarmChance)) > 0){
				action = new TimelineAction("fast", poke.index, turn, 0, {priority: poke.priority});
			}
		}

		poke.resetMoves(true);

		if(! action){
			action = ActionLogic.decideAction(battle, poke, opponent);
		}

		return action;
	}

	// Return the index of a Pokemon to switch to

	this.decideSwitch = function(){
		var switchOptions = [];
		var team = player.getTeam();
		var poke = battle.getPokemon()[player.getIndex()];
		var opponent = battle.getOpponent(player.getIndex());
		var opponentPlayer = battle.getPlayers()[opponent.index];

		for(var i = 0; i < team.length; i++){
			var pokemon = team[i];

			if((pokemon.hp > 0)&&(pokemon != poke)){
				var scenario = self.runScenario("NO_BAIT", pokemon, opponent);
				var weight = 1;

				// Dramatically scale weight based on winning or losing
				if(scenario.average < 500){
					weight = Math.round(Math.pow(scenario.average / 100, 4) / 20);
				} else{

					if((opponentPlayer.getSwitchTimer() > 10)||(poke.hp <= 0)){
						// If the opponent is switch locked, favor the hard counter
						weight = Math.round(Math.pow((scenario.average-250) / 100, 4));
					} else{
						// If the opponent isn't switch locked, favor the softer counter
						weight = Math.round(Math.pow((1000-scenario.average) / 100, 4));
					}

				}

				if(weight < 1){
					weight = 1;
				}

				switchOptions.push(new DecisionOption(i, weight));
			}
		}

		if(self.hasStrategy("BAD_DECISION_PROTECTION")){
			switchOptions.sort((a,b) => (a.weight > b.weight) ? -1 : ((b.weight > a.weight) ? 1 : 0));

			if((switchOptions.length > 1)&&(switchOptions[0].weight > switchOptions[1].weight * 4)){
				switchOptions.splice(1, 1);
			}
		}
		var switchChoice = self.chooseOption(switchOptions);
		return switchChoice.name;
	}

	// Decide whether or not to shield a Charged Attack

	this.decideShield = function(attacker, defender, m){
		// First, how hot are we looking in this current matchup?
		var currentScenario = self.runScenario("NO_BAIT", defender, attacker);
		var currentRating = currentScenario.average;
		var currentHp = defender.hp;
		var estimatedEnergy = attacker.energy + (Math.floor(Math.random() * (props.energyGuessRange * 2)) - props.energyGuessRange);
		var potentialDamage = 0;
		var potentialHp = defender.hp - potentialDamage;

		// Which move do we think the attacker is using?
		var moves = [];
		var minimumEnergy = 100;

		// Don't allow the AI to guess less energy than the opponent's fastest move
		for(var i = 0; i < attacker.chargedMoves.length; i++){
			if(minimumEnergy > attacker.chargedMoves[i].energy){
				minimumEnergy = attacker.chargedMoves[i].energy;
			}
		}

		if(estimatedEnergy < minimumEnergy){
			estimatedEnergy = minimumEnergy; // Want to make sure at least one valid move can be guessed
		}

		for(var i = 0; i < attacker.chargedMoves.length; i++){
			if(estimatedEnergy >= attacker.chargedMoves[i].energy){
				attacker.chargedMoves.damage = DamageCalculator.damage(attacker, defender, attacker.chargedMoves[i], true);
				moves.push(attacker.chargedMoves[i]);
			}
		}

		// Sort moves by damage

		moves.sort((a,b) => (a.damage > b.damage) ? -1 : ((b.damage > a.damage) ? 1 : 0));

		var moveGuessOptions = [];

		for(var i = 0; i < moves.length; i++){
			var moveWeight = 1;

			// Is the opponent low on HP? Probably the higher damage move
			if((i == 0)&&(attacker.hp / attacker.stats.hp <= .25)){
				moveWeight += 8;

				if(moves[i].name == "Acid Spray"){
					moveWeight += 12;
				}
			}

			// Be more cautious when you have more shields
			if(i == 0){
				moveWeight += player.getShields();
			}

			// Am I the last Pokemon and will this move faint me? Better protect myself
			if((player.getRemainingPokemon() == 1)&&(moves[i].damage >= defender.hp)){
				moveWeight += 4;
			}

			// Is this move lower damage and higher energy? Definitely the other one, then
			if((i == 1)&&(moves[i].damage < moves[0].damage)&&(moves[i].energy >= moves[0].energy)&&(moves[i].name != "Acid Spray")){
				moveGuessOptions[0].weight += 20;
			}
			moveGuessOptions.push(new DecisionOption(i, moveWeight));
		}

		var move = moves[self.chooseOption(moveGuessOptions).name]; // The guessed move of the attacker

		// Great! We've guessed the move, now let's analyze if we should shield like a player would
		var yesWeight = 4 + ((3-level)*2); // Lower difficulties will make more random choices
		var noWeight = 4 + ((3-level)*2);

		// Will this attack hurt?
		var damageWeight = Math.min(Math.round((move.damage / Math.max(defender.hp, defender.stats.hp / 2)) * 10), 10);
		var moveDamage = move.damage;
		var fastMoveDamage = attacker.fastMove.damage;

		// Prefer shielding high damage moves over low damage moves
		if(damageWeight >= 5){
			yesWeight += ((damageWeight - 3) * (player.getShields()+1));
		} else{
			noWeight += (8 - damageWeight) * 2;
		}

		// Prefer to shield hard hitting or knockout moves in good matchups over bad matchups

		if((damageWeight >= 6)||(moveDamage + (fastMoveDamage * 2) >= defender.hp)){

			if(player.getRemainingPokemon() > 1){
				var yesRating = currentRating - 400;
				var noRating = 400 - currentRating;

				if(defender.hp / defender.stats.hp < .35){
					yesRating = currentRating - 500;
					noRating = 500 - currentRating;
				}

				// If we're locked in, prefer to shield good matchups and let bad matchups go
				if((player.getSwitchTimer() > 0)&&(player.getRemainingPokemon() > 1)){
					yesRating *= 2;
					noRating *= 2;
				}

				yesWeight += Math.round( (yesRating / 100) * damageWeight);
				noWeight += Math.round( (noRating / 100) * (10 - damageWeight));
			} else{
				yesWeight += damageWeight;
				noWeight -= damageWeight;
			}

		}

		// Monkey see, monkey do
		if((attacker.battleStats.shieldsUsed > 0)&&(damageWeight > 2)&&(! self.hasStrategy("ADVANCED_SHIELDING"))){
			yesWeight += 4;
		}

		// Is this Pokemon close to a move that will faint or seriously injure the attacker?
		for(var i = 0; i < defender.chargedMoves.length; i++){
			var move = defender.chargedMoves[i];
			var turnsAway = Math.ceil( (move.energy - defender.energy) / defender.fastMove.energyGain ) * (defender.fastMove.cooldown / 500);

			if( ((moveDamage >= attacker.hp)||((moveDamage >= defender.stats.hp * .8)))&&(turnsAway <= 1)){
				if(self.hasStrategy("ADVANCED_SHIELDING")){
					yesWeight += 4;
				}
			}
		}

		// Preserve shield advantage where possible
		if((player.getRemainingPokemon() > 1)&&(attacker.startingShields >= defender.startingShields)&&(defender.battleStats.shieldsUsed > 0)){
			yesWeight = Math.round(yesWeight / 2);

			if(currentScenario < 500){
				yesWeight = Math.round(yesWeight / 4);
			}
		}

		// Is this the last Pokemon remaining? If so, protect it at all costs
		if(player.getRemainingPokemon() == 1){
			yesWeight *= 2;
			noWeight = Math.round(noWeight / 4);
		}

		/*

		// Does my current Pokemon have a better matchup against the attacker than my remaining Pokemon?
		if((self.hasStrategy("ADVANCED_SHIELDING"))&&(player.getRemainingPokemon() > 1)){
			var team = player.getTeam();
			var remainingPokemon = [];

			for(var i = 0; i < team.length; i++){
				if((team[i].hp > 0)&&(team[i] != defender)){
					remainingPokemon.push(team[i]);
				}
			}

			var betterMatchupExists = false;

			for(var i = 0; i < remainingPokemon.length; i++){
				var scenario = self.runScenario("NO_BAIT", remainingPokemon[i], attacker);

				if(scenario.average >= currentRating){
					betterMatchupExists = true;
				}
			}

			if((! betterMatchupExists)&&(currentRating >= 500)&&((damageWeight > 4)||(moveDamage + (fastMoveDamage * 2) >= defender.hp))){
				yesWeight += 20;
				noWeight = Math.round(noWeight / 2);
			}

			// Avoid shielding twice if it won't be fatal
			if((betterMatchupExists)&&(moveDamage + (fastMoveDamage * 2) < defender.hp)&&(defender.battleStats.shieldsUsed > 0)){
				yesWeight = Math.round(yesWeight / 2);
			}
		}
		*/

		// If one of these options is significantly more weighted than the other, make it the only option
		if(self.hasStrategy("BAD_DECISION_PROTECTION")){
			if(yesWeight / noWeight >= 4){
				noWeight = 0;
			} else if (noWeight / yesWeight >= 4){
				yesWeight = 0;
			}
		}

		var options = [];
		options.push(new DecisionOption(true, yesWeight));
		options.push(new DecisionOption(false, noWeight));

		var decision = self.chooseOption(options).name;

		return decision;
	}

	// Given a pokemon and its stored energy, how much potential damage can it deal?

	this.calculatePotentialDamage = function(attacker, defender, energy, stack){
		stack = typeof stack !== 'undefined' ? stack : true;

		var totalDamage = [];

		for(var i = 0; i < attacker.chargedMoves.length; i++){
			var countMultiplier = Math.floor(energy / attacker.chargedMoves[i].energy);
			if(! stack){
				countMultiplier = 0;
				if(attacker.chargedMoves[i].energy <= energy){
					countMultiplier = 1;
				}
			}

			var damage = countMultiplier * DamageCalculator.damage(attacker, defender, attacker.chargedMoves[i], true);
			totalDamage.push(damage);
		}

		if(totalDamage.length == 0){
			return 0;
		} else{
			return Math.max.apply(Math, totalDamage);
		}
	}

	// Return whether not this AI can run the provided strategy
	this.hasStrategy = function(strategy){
		return (props.strategies.indexOf(strategy) > -1);
	}

	// Return the AI's difficulty level

	this.getLevel = function(){
		return level;
	}

	// Return the name of the difficulty level
	this.difficultyToString = function(){
		var name = "AI";

		switch(level){
			case 0:
				name = "Novice";
				break;

			case 1:
				name = "Rival";
				break;

			case 2:
				name = "Elite";
				break;

			case 3:
				name = "Champion";
				break;
		}

		return name;
	}

}

;
// JavaScript Document

/*
* This is the Ranker.js file without all the bells and whistles,
* used to rank potential counters on the Team Builder page.
* Should I be using the same code? Yup. Am I? Nope. Stay tuned for
* when this comes back to bite me.
*/

var RankerMaster = (function () {
    var instance;

    function createInstance() {


        var object = new rankerObject();

		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle;
			var self = this;

			var targets = []; // Set targets to rank against

			var rankings = [];

			var shieldMode = 'single'; // single - sim specific shield scenarios, average - sim average of 0 and 1 shields each
			var overrideSettings = [getDefaultMultiBattleSettings(), getDefaultMultiBattleSettings()];

			var useRecommendedMoves = true;
			var prioritizeMeta = true;

			var csv = '';

			var metaGroup = [];

			this.context = "team-builder";

			// Run an individual rank set

			this.rank = function(team, cp, cup, exclusionList, context){
				if(context){
					self.context = context;
				}

				var totalBattles = 0;

				battle = new Battle();

				if(isNaN(cp)){
					var levelCap = parseInt(cp.split("-")[1]);
					cp = parseInt(cp.split("-")[0]);
					battle.setLevelCap(levelCap);
				}

				battle.setCP(cp);

				if(cup.name != "custom"){
					battle.setCup(cup.name);
				} else{
					battle.setCustomCup(cup);
				}

				var pokemonList = [];
				var teamRatings = [];

				for(var i = 0; i < team.length; i++){
					teamRatings.push([]);
				}

				rankings = [];

				if(team.length == 1){
					csv = 'Pokemon,Battle Rating,Energy Remaining,HP Remaining'
				}

				if((targets.length == 0)&&(context != "matrix")){
					// Get a full list of Pokemon from the game master
					pokemonList = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude);
				} else{
					// Otherwise, push all set targets into the list

					for(var i = 0; i < targets.length; i++){
						pokemonList.push(targets[i]);
					}
				}

				// Remove any Pokemon that are in the exclusion list
				if(exclusionList){
					for(var i = 0; i < pokemonList.length; i++){
						if(exclusionList.indexOf(pokemonList[i].speciesId) > -1){
							pokemonList.splice(i, 1);
							i--;
						}
					}
				}

				// For all eligible Pokemon, simulate battles and gather rating data

				var rankCount = pokemonList.length;

				for(var i = 0; i < rankCount; i++){

					var pokemon = pokemonList[i];

					if((targets.length == 0)&&(useRecommendedMoves)){
						pokemon.selectRecommendedMoveset();
					}

					var rankObj = {
						pokemon: pokemon,
						speciesId: pokemon.speciesId,
						speciesName: pokemon.speciesName,
						types: pokemon.types,
						rating: 0,
						opRating: 0,
						matchups: [],
						index: i
					};

					// Add to CSV

					var name = pokemon.speciesName;
					var moveset = {
						fastMove: pokemon.fastMove,
						chargedMoves: []
					};

					name += ' ' + pokemon.generateMovesetStr();
					csv += '\n' + name;

					for(var n = 0; n < pokemon.chargedMoves.length; n++){
						moveset.chargedMoves.push(pokemon.chargedMoves[n]);
					}

					/*if((overrideSettings[1].ivs != "gamemaster")&&(overrideSettings[1].ivs != "original")){
						pokemon.levelCap = overrideSettings[1].levelCap;
						pokemon.maximizeStat(overrideSettings[1].ivs);
					} else if((overrideSettings[1].ivs == "gamemaster")&&(pokemon.isCustom)){
						pokemon.isCustom = false;
						pokemon.initialize(battle.getCP());
						if(pokemon.baitShields != 1){
							pokemon.isCustom = true;
						}
					}*/

					rankObj.moveset = moveset;

					var avg = 0;
					var matchupScore = 0; // A softer representation of wins/losses used for team builder threats and alternatives
					var matchupAltScore = 0;
					var opponentRating = 0;

					// Simulate battle against each Pokemon

					for(var n = 0; n < team.length; n++){

						var opponent = team[n];

						opponent.index = 1;

						totalBattles++;

						battle.setNewPokemon(pokemon, 0, false);
						battle.setNewPokemon(opponent, 1, false);


						// Force best moves on counters but not on the user's selected Pokemon

						if((context != "team-counters")&&(context != "matrix")&&(team.length > 1)&&(useRecommendedMoves)){
							opponent.selectRecommendedMoveset();
						}

						self.applySettingsToPokemon(overrideSettings[1], pokemon);

						if(context == "matrix" || context == "team-counters"){
							self.applySettingsToPokemon(overrideSettings[0], opponent);
						}

						if(overrideSettings[1].bait != 1){
							pokemon.isCustom = true;
						}

						if(overrideSettings[0].bait != 1){
							opponent.isCustom = true;
						}

						var shieldTestArr = []; // Array of shield scenarios to test


						if(shieldMode == 'single'){
							shieldTestArr.push([ overrideSettings[0].shields, overrideSettings[1].shields ]);
						} else if(shieldMode == 'average'){
							shieldTestArr.push([0,0], [1,1]);
						}

						var avgPokeRating = 0;
						var avgOpRating = 0;
						var shieldRatings = [];

						for(var j = 0; j < shieldTestArr.length; j++){
							pokemon.setShields(shieldTestArr[j][1]);

							if((shieldMode == 'average')||(shieldMode == 'single')||(context == 'matrix')){
								opponent.setShields(shieldTestArr[j][0]);
							}

							battle.simulate();

							var healthRating = (pokemon.hp / pokemon.stats.hp);
							var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));

							var opHealthRating = (opponent.hp / opponent.stats.hp);
							var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));

							var rating = Math.floor( (healthRating + damageRating) * 500);
							var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);

							if(isNaN(avgPokeRating)){
								console.log(battle.getPokemon());
								return false;
							}

							avgPokeRating += rating;
							avgOpRating += opRating;

							shieldRatings.push(rating);
						}

						if(shieldTestArr.length > 1){
							avgPokeRating = Math.round( Math.pow(shieldRatings[0] * Math.pow(shieldRatings[1], 3), 1/4));
						}

						avgOpRating = Math.floor(avgOpRating / shieldTestArr.length);

						csv += ',' + avgOpRating + ',' + opponent.energy + ',' + opponent.hp;

						avg += avgPokeRating;
						opponentRating = avgOpRating;

						var score = 500;
						var alternativeScore = 500;

						if(avgPokeRating > 500){
							alternativeScore = 500 + Math.pow(avgPokeRating - 500, .85);
							score = 500 + Math.pow(avgPokeRating - 500, .75);
						} else{
							score = avgPokeRating / 2;
							alternativeScore = avgPokeRating / 2;
						}

						
						// Factor in meta relevance

						if(context == "team-counters" || context == "team-alternatives"){
							let isMetaFactor = 0.85;

							if(score > 500 && prioritizeMeta){
								if(metaGroup.some(poke => poke.speciesId == pokemon.speciesId)){
									score += (1000 - score) * isMetaFactor;
									alternativeScore += (1000 - alternativeScore) * isMetaFactor;
								} else{
									score -= (score - 500) * (1 - isMetaFactor);
									alternativeScore -= (alternativeScore - 500) * (1 - isMetaFactor);
								}
							}

						}

						matchupScore += score;
						matchupAltScore += alternativeScore;

						if(settings.matrixDirection == "column"){
							avgPokeRating = 1000 - avgPokeRating;
						}

						teamRatings[n].push(avgOpRating);


						var matchup = {
							opponent: opponent,
							rating: avgPokeRating,
							score: score,
							alternativeScore: score,
							time: battle.getDuration()
						};

						// Calculate breakpoint and bulkpoint
						if(context == "matrix"){
							pokemon.reset();
							opponent.reset();

							var breakpoint = DamageCalculator.damageByStats(pokemon, opponent, pokemon.getEffectiveStat(0), opponent.getEffectiveStat(1), opponent.typeEffectiveness[pokemon.fastMove.type], pokemon.fastMove);

							var bulkpoint = DamageCalculator.damageByStats(opponent, pokemon, opponent.getEffectiveStat(0), pokemon.getEffectiveStat(1), pokemon.typeEffectiveness[opponent.fastMove.type], opponent.fastMove);

							matchup.breakpoint = breakpoint; // Fast move breakpoint
							matchup.bulkpoint = bulkpoint; // Fast move bulkpoint
							matchup.breakpointCM1 = 0;
							matchup.breakpointCM2 = 0;
							matchup.bulkpointCM1 = 0;
							matchup.bulkpointCM2 = 0;

							if(pokemon.chargedMoves.length > 0){
								var breakpointCM1 = DamageCalculator.damageByStats(pokemon, opponent, pokemon.getEffectiveStat(0), opponent.getEffectiveStat(1), opponent.typeEffectiveness[pokemon.chargedMoves[0].type], pokemon.chargedMoves[0]);
								matchup.breakpointCM1 = breakpointCM1;
							}

							if(pokemon.chargedMoves.length > 1){
								var breakpointCM2 = DamageCalculator.damageByStats(pokemon, opponent, pokemon.getEffectiveStat(0), opponent.getEffectiveStat(1), opponent.typeEffectiveness[pokemon.chargedMoves[1].type], pokemon.chargedMoves[1]);
								matchup.breakpointCM2 = breakpointCM2;
							}

							if(opponent.chargedMoves.length > 0){
								var bulkpointCM1 = DamageCalculator.damageByStats(opponent, pokemon, opponent.getEffectiveStat(0), pokemon.getEffectiveStat(1), pokemon.typeEffectiveness[opponent.chargedMoves[0].type], opponent.chargedMoves[0]);
								matchup.bulkpointCM1 = bulkpointCM1;
							}

							if(opponent.chargedMoves.length > 1){
								var bulkpointCM2 = DamageCalculator.damageByStats(opponent, pokemon, opponent.getEffectiveStat(0), pokemon.getEffectiveStat(1), pokemon.typeEffectiveness[opponent.chargedMoves[1].type], opponent.chargedMoves[1]);
								matchup.bulkpointCM2 = bulkpointCM2;
							}


							matchup.atkDifferential = pokemon.stats.atk - opponent.stats.atk;
						}

						pokemon.reset();
						opponent.reset();

						rankObj.matchups.push(matchup);
					}

					avg = Math.floor(avg / team.length);
					matchupScore = matchupScore / team.length;
					matchupAltScore = matchupAltScore / team.length;


					rankObj.rating = avg;
					rankObj.opRating = opponentRating;
					rankObj.score = matchupScore;
					rankObj.matchupAltScore = matchupAltScore;
					rankObj.overall = (pokemon.overall !== undefined) ? pokemon.overall : 0;
					rankObj.speciesName = pokemon.speciesName;

					rankings.push(rankObj);
				}

				// Sort rankings

				if((self.context == "team-builder")||(self.context == "team-counters")){
					rankings.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));
				} else if(self.context == "battle"){
					rankings.sort((a,b) => (a.rating > b.rating) ? 1 : ((b.rating > a.rating) ? -1 : 0));
				}

				// Sort team's matchups by best to worst

				for(var i = 0; i < teamRatings.length; i++){
					 teamRatings[i].sort((a,b) => (a > b) ? -1 : ((b > a) ? 1 : 0));
				}

				battle.clearPokemon(); // Prevents associated Pokemon objects from being altered by future battles

				return {rankings: rankings, teamRatings: teamRatings, csv: csv};
			}

			// Set the targets to rank against

			this.setTargets = function(arr){
				targets = arr;
			}

			// Set how to handle multiple shield scenarios

			this.setShieldMode = function(value){
				shieldMode = value;
			}

			// Apply settings from a MultiSelector

			this.applySettings = function(settings, index){
				overrideSettings[index] = settings;
			}

			this.applySettingsToPokemon = function(settings, pokemon){
				var defaultSettings = getDefaultMultiBattleSettings();

				var fastMoveCount = Math.floor((settings.startEnergy * 500) / pokemon.fastMove.cooldown);

				pokemon.baitShields = settings.bait;
				pokemon.startHp = Math.floor(settings.startHp * pokemon.stats.hp);
				pokemon.startEnergy = Math.min(pokemon.fastMove.energyGain * fastMoveCount, 100);
				pokemon.startCooldown = settings.startCooldown;
				pokemon.optimizeMoveTiming = settings.optimizeMoveTiming;
				pokemon.startStatBuffs = settings.startStatBuffs;

				if(settings.bait != defaultSettings.bait || settings.startCooldown != defaultSettings.startCooldown ||
					settings.optimizeMoveTiming != defaultSettings.optimizeMoveTiming || settings.startStatBuffs[0] != defaultSettings.startStatBuffs[0] || settings.startStatBuffs[1] != defaultSettings.startStatBuffs[1]){
					pokemon.isCustom = true;
				}
			}

			// Set whether to use recommended movesets for threats

			this.setRecommendMoveUsage = function(val){
				useRecommendedMoves = val;
			}

			// Set the meta group for determining which Pokemon are meta for factoring team builder threats and alternatives
			this.setMetaGroup = function(group){
				metaGroup = group;
			}

			// Set whether or not to prioritize meta Pokemon in the results
			this.setPrioritizeMeta = function(val){
				prioritizeMeta = val;
			}

		};

        return object;
	}

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

;
