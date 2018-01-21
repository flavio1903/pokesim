var Salvajes = function(options){
	this.options = {
		habitat_selector: document.getElementById('habitat_selector'),
		horario_selector: document.getElementById('horario_selector'),
		horario_inputs: horario_selector.getElementsByTagName('input'),
		habitat_button: document.getElementById('habitat_button'),
		horario_button: document.getElementById('horario_button'),
		salvaje_boton: document.getElementById('salvaje_boton'),
		pokemon_carta: document.getElementById('pokemon_salvaje'),
		pokemon_salvaje: {
			nombre: document.getElementById('pokemon_name'),
			imagen: document.getElementById('pokemon_imagen'),
			tipos: document.getElementById('pokemon_tipos'),
			tipos_debilidad: document.getElementById('pokemon_tipos_debilidad'),
			tipos_resistencia: document.getElementById('pokemon_tipos_resistencia'),
			tipos_inmunidad: document.getElementById('pokemon_tipos_inmunidad'),
			vida:  document.getElementById('pokemon_vida'),
			ataque: document.getElementById('pokemon_ataque'),
			defensa:  document.getElementById('pokemon_defensa'),
			velocidad:  document.getElementById('pokemon_velocidad'),
			vida_contenedor: document.getElementById('pokemon_vida_contenedor'),
			ataque_contenedor: document.getElementById('pokemon_ataque_contenedor'),
			defensa_contenedor: document.getElementById('pokemon_defensa_contenedor'),
			habilidades: document.getElementById('pokemon_habilidades'),
			vida_icono: document.getElementById('pokemon_vida_icono')
		},
		entrenador:{
			layer: document.getElementById('entrenador'),
			pokemons_container: document.getElementById('entrenador_pokemons'),
			imagen: document.getElementById('entrenador_imagen')
		},
		bajar_vida_timeout: null,
		pokemon_generado: null,
		pokemon_generado_index: null,
		pokemon_habilidades: [],
		ruta_voces: 'sounds/pokemonVoices/'
	}
	
	//Al terminar de crear el pokemon, se guarda en esta variable la vida original
	this.pokemon_vida_original;
	//Al aumentar o disminui la vida del pokemon, se guarda en esta variable
	this.pokemon_vida_actual;
	this.cargar_habitats();
	this.cargar_parametros();
	this.crear_eventos()
}

Salvajes.prototype = {
	constructor: Salvajes,
	
	cargar_habitats: function(){
		for(var i=0; i < db.habitats.length; i++){
			var habitat = document.createElement('label'),
				input = document.createElement('input')
				habitat_icon = document.createElement('i'),
				habitat_name = document.createElement('span');
			
			if(i == 0){
				input.checked = true;
			}
			input.type = 'radio';
			input.name = 'habitat';
			input.value = i;
			
			habitat.className = 'habitat_' + db.habitats[i].replace(/ /g, '_');
			habitat_icon.className = 'icon icon-' + db.habitats[i].replace(/ /g, '-');
			habitat_name.innerText = db.habitats[i];
				
			habitat.appendChild(input);
			habitat.appendChild(habitat_name);
			habitat.appendChild(habitat_icon);
			
			this.options.habitat_selector.appendChild(habitat);
		}
	},
	
	cargar_parametros: function(){
		this.habitat_inputs = this.options.habitat_selector.getElementsByTagName('input');
	},
	
	crear_eventos: function(){
		// Seleccion de un nuevo habitat
		for(var i=0; i < this.habitat_inputs.length; i++){
			this.habitat_inputs[i].addEventListener('change', this.cambio_habitat.bind(this), false);
		}

		// Seleccion de un nuevo horario
		for(var i=0; i < this.options.horario_inputs.length; i++){
			this.options.horario_inputs[i].addEventListener('change', this.cambio_horario.bind(this), false);
		}
		
		// Se resta la vida del pokemon al hacer un click sobre el mismo
		// Se aumenta ña voda del pokemon al hacer doble click sobre el mismo
		this.options.pokemon_salvaje.vida_contenedor.addEventListener('click', this.cambio_vida_salvaje.bind(this), false);
		
		//Genera el pokemon salvaje al pulsar en la pokebola principal
		this.options.salvaje_boton.addEventListener('click', this.generar_entrenador_pokemon.bind(this), false);

		//Abre el menu de las debilidades, resistencias e inmunidades
		this.options.pokemon_salvaje.tipos.addEventListener('click', (function(){
			this.options.pokemon_carta.classList.toggle('tipos-activo');
		}).bind(this), false);

		this.options.pokemon_salvaje.imagen.addEventListener('load', (function(){
			this.options.pokemon_carta.classList.add('modal-activo');
			setTimeout((function(){
				var audio = new Audio(this.options.ruta_voces + utiles.convertir_numero(String(this.options.pokemon_generado_index + 1), 3) + '.mp3');
				audio.play();
			}).bind(this), 200);
		}).bind(this), false);

		this.options.entrenador.imagen.addEventListener('load', (function(){
			this.options.pokemon_carta.classList.add('modal-extra');
			this.options.entrenador.layer.classList.add('modal-activo');
		}).bind(this), false);

		/** Se abre un pokemon del entrenador */
		this.options.entrenador.pokemons_container.addEventListener('click', (function(e){
			if(e.target.classList.contains('entrenador-pokemon-boton')){
				window.location.hash = 'modal-extran-salvaje';
				this.generar_salvaje(e.target, e.target.datos);
			}
		}).bind(this), false)
	},
	
	cambio_habitat: function(e){
		this.options.habitat_button.children[0].innerText = e.currentTarget.nextElementSibling.innerText;
		this.options.habitat_button.children[1].className = e.currentTarget.nextElementSibling.nextElementSibling.className;
		this.options.habitat_button.style.backgroundColor = window.getComputedStyle(e.currentTarget.parentElement).backgroundColor;
		this.options.habitat_button.style.color = window.getComputedStyle(e.currentTarget.parentElement).color;
		history.back();
	},
	
	cambio_horario: function(e){
		this.options.horario_button.children[0].innerText = e.currentTarget.nextElementSibling.innerText;
		this.options.horario_button.children[1].className = e.currentTarget.nextElementSibling.nextElementSibling.className;
		this.options.horario_button.style.backgroundColor = window.getComputedStyle(e.currentTarget.parentElement).backgroundColor;
		this.options.horario_button.style.color = window.getComputedStyle(e.currentTarget.parentElement).color;
		history.back();
	},
	
	generar_entrenador_pokemon: function(e){
		this.options.pokemon_carta.classList.remove('modal-extra');
		var random = utiles.generar_random(0, 100, true);
		if(random < 20){
			this.generar_entrenador();
			window.location.hash = 'modal-entrenador';
		}else{
			this.generar_salvaje();
			window.location.hash = 'modal-salvaje';
		}
	},

	generar_entrenador: function(){
		var cantidad_pokemons = utiles.generar_random(1, 4, true);
			iconos_pokemon = '';

		for(let i=0; i < cantidad_pokemons; i++){
			iconos_pokemon += '<div class="entrenador-pokemon-boton"></div>';
		}

		this.options.entrenador.pokemons_container.innerHTML = iconos_pokemon;

		this.options.entrenador.imagen.src = 'img/trainers/01.jpg';
	},

	generar_salvaje: function(boton, pokemon_precargado){
		var habitat_index = this.options.habitat_selector.querySelector('input:checked').value * 1,
			horario_index = this.options.horario_selector.querySelector('input:checked').value * 1,
			nombre_lugar = db.habitats[habitat_index].replace(/ /g, '_') + '_' +  db.horarios[horario_index],
			listado_pokemons = db.habitats_horario_pokemons[nombre_lugar],
			pokemon_generado_numero = null,
			porcentaje_acumulado = 0,
			datos_pokemon_precargado = pokemon_precargado || null;
		
		if(listado_pokemons === null || listado_pokemons.length === 0){
			return;
		}

		if(datos_pokemon_precargado != null){
			this.options.pokemon_generado_index = datos_pokemon_precargado.index;
		}else{
			this.options.pokemon_generado_index = this.calcular_pokemon_generado(listado_pokemons);
		}
		
		pokedex.marcar_visto(this.options.pokemon_generado_index);
		this.options.pokemon_generado = db.pokemons[this.options.pokemon_generado_index];
		pokemon_generado_numero = utiles.convertir_numero(String(this.options.pokemon_generado_index + 1), 3);

		//Se cierra la ventana de influencias de tipos
		this.options.pokemon_carta.classList.remove('tipos-activo');
		
		var vida_icono = this.options.pokemon_salvaje.vida_contenedor.getElementsByClassName('icon-heart-broken');
		if(vida_icono.length > 0){
			vida_icono[0].classList.add('icon-heart');
			vida_icono[0].classList.remove('icon-heart-broken');
		}
			
		utiles.vaciar_elemento(this.options.pokemon_salvaje.tipos);
		
		//Carga los iconos de tipos del pokemon
		var tipos_relacionados = {
			tipos_debilidad: [],
			tipos_resistencia: [],
			tipos_inmunidad: []
		}

		for(var i=0; i < this.options.pokemon_generado.tipos.length; i++){
			var tipo_icon = document.createElement('i'),
				tipo = db.tipos_de_pokemon[this.options.pokemon_generado.tipos[i]];
			tipo_icon.className = 'icon_tipo tipo_' + tipo.nombre.toLowerCase();
			this.options.pokemon_salvaje.tipos.appendChild(tipo_icon);

			tipos_relacionados.tipos_debilidad.push(tipo.debilidad);
			tipos_relacionados.tipos_resistencia.push(tipo.resistencia);
			tipos_relacionados.tipos_inmunidad.push(tipo.inmunidad);
		}

		//Si el pokemon tiene mas de un tipo, se eliminan las resistencias y debilidades contrapuestas y se setean las deb/res dobles
		if(this.options.pokemon_generado.tipos.length == 2){
			var tipos_debilidad_aux = utiles.unir_arrays(tipos_relacionados.tipos_debilidad[0], tipos_relacionados.tipos_debilidad[1]),
				tipos_resistencia_aux = utiles.unir_arrays(tipos_relacionados.tipos_resistencia[0], tipos_relacionados.tipos_resistencia[1]),
				tipos_inmunidad_aux = utiles.unir_arrays(tipos_relacionados.tipos_inmunidad[0], tipos_relacionados.tipos_inmunidad[1]);

			var tipos_debilidad_aux2 = utiles.restar_arrays(tipos_debilidad_aux[0], tipos_inmunidad_aux[0])[0];
			tipos_debilidad_aux2 = utiles.restar_arrays(tipos_debilidad_aux2, tipos_resistencia_aux[0])[0];
			var tipos_resistencia_aux2 = utiles.restar_arrays(tipos_resistencia_aux[0], tipos_inmunidad_aux[0])[0];
			tipos_resistencia_aux2 = utiles.restar_arrays(tipos_resistencia_aux2, tipos_debilidad_aux[0])[0];
			tipos_inmunidad_aux[0] = utiles.restar_arrays(tipos_inmunidad_aux[0], tipos_resistencia_aux[0])[0];

			tipos_debilidad_aux[0] = tipos_debilidad_aux2;
			tipos_resistencia_aux[0] = tipos_resistencia_aux2;

			if(tipos_debilidad_aux[1].length){
				var tipos_matches = tipos_debilidad_aux[1];
				tipos_debilidad_aux = utiles.restar_arrays(tipos_debilidad_aux[0], tipos_matches);
				for(let i = 0; i < tipos_debilidad_aux[1].length; i++){
					tipos_matches[i] = tipos_matches[i] + 100;
				}
				tipos_relacionados.tipos_debilidad[0] = utiles.unir_arrays(tipos_debilidad_aux[0], tipos_matches)[0];
			}else{
				tipos_relacionados.tipos_debilidad[0] = tipos_debilidad_aux[0];
			}

			if(tipos_resistencia_aux[1].length){
				var tipos_matches = tipos_resistencia_aux[1];
				tipos_resistencia_aux = utiles.restar_arrays(tipos_resistencia_aux[0], tipos_matches);
				for(let i = 0; i < tipos_resistencia_aux[1].length; i++){
					tipos_matches[i] = tipos_matches[i] + 100;
				}
				tipos_relacionados.tipos_resistencia[0] = utiles.unir_arrays(tipos_resistencia_aux[0], tipos_matches)[0];
			}else{
				tipos_relacionados.tipos_resistencia[0] = tipos_resistencia_aux[0];
			}

			if(tipos_inmunidad_aux[1].length){
				var tipos_matches = tipos_inmunidad_aux[1];
				tipos_inmunidad_aux = utiles.restar_arrays(tipos_inmunidad_aux[0], tipos_matches);
				for(let i = 0; i < tipos_inmunidad_aux[1].length; i++){
					tipos_matches[i] = tipos_matches[i] + 100;
				}
				tipos_relacionados.tipos_inmunidad[0] = utiles.unir_arrays(tipos_inmunidad_aux[0], tipos_matches)[0];
			}else{
				tipos_relacionados.tipos_inmunidad[0] = tipos_inmunidad_aux[0];
			}
		}

		//Carga las debilidades, resistencias e inmunidades
		['tipos_debilidad','tipos_resistencia','tipos_inmunidad'].forEach((function(relacion, index){
			if(tipos_relacionados[relacion][0].length){
				var tipos_icono = '';
				for(let tipo_id of tipos_relacionados[relacion][0]){
					var doble_class = '';
					if(tipo_id >= 100){
						tipo_id -= 100;
						doble_class = 'tipo_doble'
					}
					let tipo_relacion = db.tipos_de_pokemon[tipo_id].nombre.toLowerCase();
					tipos_icono += '<i class="icon_tipo tipo_' + tipo_relacion + ' ' + doble_class + '"></i>';
				}
				this.options.pokemon_salvaje[relacion].innerHTML = tipos_icono;
			}else{
				this.options.pokemon_salvaje[relacion].innerText = '-'
			}
		}).bind(this))
		
		//Carga las habilidades del pokemon
		this.options.pokemon_habilidades = this.inicializar_habilidades([0]);
		
		if(datos_pokemon_precargado != null){
			this.options.pokemon_salvaje.vida.innerText = datos_pokemon_precargado.vida;
			this.options.pokemon_salvaje.ataque.innerText = datos_pokemon_precargado.ataque;
			this.options.pokemon_salvaje.defensa.innerText = datos_pokemon_precargado.defensa;
			this.options.pokemon_salvaje.velocidad.innerText = datos_pokemon_precargado.velocidad;
			this.pokemon_vida_original = datos_pokemon_precargado.vida;
			this.pokemon_vida_actual = datos_pokemon_precargado.vida;
		}else{
			var ataque = utiles.generar_random(2, 10, true) + ((this.options.pokemon_generado.fase - 1) * 2),
				defensa = utiles.generar_random(2, 10, true) + ((this.options.pokemon_generado.fase - 1) * 2),
				velocidad = utiles.generar_random(1, 11, true) + ((this.options.pokemon_generado.fase - 1) * 2),
				vida = defensa * 2

			this.options.pokemon_salvaje.vida.innerText = vida;
			this.options.pokemon_salvaje.ataque.innerText = ataque;
			this.options.pokemon_salvaje.defensa.innerText = defensa;
			this.options.pokemon_salvaje.velocidad.innerText = velocidad;
			this.pokemon_vida_original = vida;
			this.pokemon_vida_actual = vida;

			if(boton){
				datos_pokemon_precargado = {
					vida: this.options.pokemon_salvaje.vida.innerText,
					ataque: this.options.pokemon_salvaje.ataque.innerText,
					defensa: this.options.pokemon_salvaje.defensa.innerText,
					velocidad: this.options.pokemon_salvaje.velocidad.innerText,
					index: this.options.pokemon_generado_index
				};
	
				boton.datos = datos_pokemon_precargado;
			}
		}	

		this.options.pokemon_salvaje.nombre.innerText = '#' + pokemon_generado_numero + ' ' + this.options.pokemon_generado.nombre;
		this.options.pokemon_salvaje.imagen.src = 'img/pokemons/fullcard/' + pokemon_generado_numero + '.jpg';
		
		this.chequear_habilidades();
	},
	
	cambio_vida_salvaje: function(e){
		if(!this.bajar_vida_timeout){
			this.bajar_vida_timeout = setTimeout((function(){
				if(this.pokemon_vida_actual > 0){
					this.pokemon_vida_actual--;
					this.options.pokemon_salvaje.vida.innerText = this.pokemon_vida_actual;
					if(this.pokemon_vida_actual === 0){
						this.options.pokemon_salvaje.vida_icono.classList.remove('icon-heart');
						this.options.pokemon_salvaje.vida_icono.classList.add('icon-heart-broken');
					}else if(this.pokemon_vida_actual === this.pokemon_vida_original - 1){
						this.options.pokemon_salvaje.vida.classList.add('vida-menor');
					}else if(this.pokemon_vida_actual === this.pokemon_vida_original){
						this.options.pokemon_salvaje.vida.classList.remove('vida-mayor');
					}
				}
				
				this.bajar_vida_timeout = null;
				this.chequear_habilidades();
				
			}).bind(this), 200);
		}else{
			clearTimeout(this.bajar_vida_timeout);
			this.bajar_vida_timeout = null;
			this.pokemon_vida_actual++;
			this.options.pokemon_salvaje.vida.innerText = this.pokemon_vida_actual;

			if(this.pokemon_vida_actual === 1){
				vida_icono[0].classList.add('icon-heart');
				vida_icono[0].classList.remove('icon-heart-broken');
			}else if(this.pokemon_vida_actual === this.pokemon_vida_original + 1){
				this.options.pokemon_salvaje.vida.classList.add('vida-mayor');
			}else if(this.pokemon_vida_actual === this.pokemon_vida_original){
				this.options.pokemon_salvaje.vida.classList.remove('vida-menor');
			}
			this.chequear_habilidades();
		}
	},
	
	chequear_habilidades: function(){
		if(this.options.pokemon_habilidades.length > 0){
			for(var i=0; i < this.options.pokemon_habilidades.length; i++){
				switch(this.options.pokemon_habilidades[i][0]){
					case 'ultimo_esfuerzo':
						if(this.options.pokemon_salvaje.vida.innerText * 1 === 1){
							if(this.options.pokemon_habilidades[i][1] == false){
								document.getElementById('ultimo_esfuerzo').classList.add('habilidad_activa');
								this.options.pokemon_salvaje.ataque.innerText = this.options.pokemon_salvaje.ataque.innerText * 1 + 4;
								this.options.pokemon_habilidades[i][1] = true;
							}
						}else if(this.options.pokemon_habilidades[i][1] == true){
							document.getElementById('ultimo_esfuerzo').classList.remove('habilidad_activa');
							this.options.pokemon_salvaje.ataque.innerText = this.options.pokemon_salvaje.ataque.innerText * 1 - 4;
							this.options.pokemon_habilidades[i][1] = false;
						}
						break;
				}
			}
		}
	},

	/* Calcula los porcentajes de aparicion*/
	calcular_pokemon_generado: function(listado_zona){
		var probabilidades = [],
			pokemons_raros = 0,
			pokemons_infrecuentes = 0,
			pokemons_comunes = 0,
			probabilidad_raros = 0,
			probabilidad_infrecuentes = 0,
			probabilidad_comunes = 0


		if(listado_zona != null && listado_zona.length){
			for(let pokemon_probabilidad of listado_zona){
				if(pokemon_probabilidad[1] === 1){
					pokemons_raros++;
				}else if(pokemon_probabilidad[1] === 2){
					pokemons_infrecuentes++;
				}else if(pokemon_probabilidad[1] === 3){
					pokemons_comunes++;
				}
			}

			var chances_raros = pokemons_raros > 0 ? 1 : 0;
			var chances_infrecuentes = pokemons_infrecuentes > 0 ? 3 : 0;
			var chances_comunes = 100 - chances_infrecuentes - chances_raros;
			var rareza_final = 0;
			var pokemon_indice_final = 0;

			var random_rareza = utiles.generar_random(0, 100, false);

			if(chances_raros > 0 && random_rareza <= chances_raros){
				rareza_final = 1;
				pokemon_indice_final =	utiles.generar_random(0, pokemons_raros, true);
			}else if(random_rareza <= chances_comunes + chances_raros){
				rareza_final = 3;
				pokemon_indice_final = utiles.generar_random(0, pokemons_comunes, true);
			}else if(chances_infrecuentes > 0){
				rareza_final = 2;
				pokemon_indice_final = utiles.generar_random(0, pokemons_infrecuentes, true);
			}


			var acumulado = 0;

			for(let i=0; i < listado_zona.length; i++){
				if(listado_zona[i][1] === rareza_final){
					if(acumulado === pokemon_indice_final){
						return listado_zona[i][0];
					}else{
						acumulado++;
					}
				}
			}
		}

		return probabilidades;
	},

	/* Calcula las probabilidades tomando en cuenta la chance basica pero sin que superen en conjunto las chances maximas*/
	calcular_probabilidad: function(basico, maximo, cantidad){
		var probabilidad = basico;

		if(basico * cantidad > maximo){
			probabilidad = maximo / cantidad;
		}

		return probabilidad;
	},
	
	inicializar_habilidades: function(habilidades_id){
		utiles.vaciar_elemento(this.options.pokemon_salvaje.habilidades);
		var habilidades = [];
		for(var i=0; i < habilidades_id.length; i++){
			var habilidad = db.habilidades[habilidades_id[i]];
			if(habilidad){
				habilidades.push([habilidad.nombre, false]);
				
				var habilidad_container = document.createElement('div'),
					habilidad_nombre = document.createElement('div'),
					habilidad_texto = document.createElement('div');
				
				habilidad_container.id = db.habilidades[habilidades_id[i]].nombre;
				habilidad_nombre.innerText = db.habilidades[habilidades_id[i]].nombre.replace(/_/g, ' ');
				habilidad_texto.innerText = db.habilidades[habilidades_id[i]].texto;
				habilidad_container.appendChild(habilidad_nombre);
				habilidad_container.appendChild(habilidad_texto);
				this.options.pokemon_salvaje.habilidades.appendChild(habilidad_container);
			}
		}
		
		return habilidades;
	}
}