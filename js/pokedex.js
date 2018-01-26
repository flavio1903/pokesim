var Pokedex = function(options){
	this.options = {
		pokedex_container: document.getElementById('pokedex_container'),
		pokemon_visto_clase: 'visto',
		pokemon_capturado_clase: 'capturado',
		datos_guardados: {},
		pokemon_muestra: document.getElementById('pokemon_muestra'),
		pokemon_muestra_name: document.getElementById('pokemon_muestra_name'),
		pokemon_muestra_imagen: document.getElementById('pokemon_muestra_imagen'),
		siguiente: document.getElementById('pokedex_siguiente'),
		anterior: document.getElementById('pokedex_anterior'),
		ruta_voces: 'sounds/pokemonVoices/'
	}
	this.pokedex_items = [];
	
	this.crear_eventos();
	this.cargar_datos_guardados();
	this.create_pokedex();
}

Pokedex.prototype = {
	constructor: Pokedex,

	crear_eventos: function(){
		this.options.siguiente.addEventListener('click', (function(){
			var new_index = this.index_activo + 1;
			if(this.options.pokedex_container.children.length === new_index){
				new_index = 0;
			}
			this.options.pokedex_container.children[new_index].click();
		}).bind(this), false);

		this.options.anterior.addEventListener('click', (function(){
			var new_index = this.index_activo - 1;
			if(new_index == -1){
				new_index = db.pokemons.length-1;
			}
			this.options.pokedex_container.children[new_index].click();
		}).bind(this), false);
	},
	
	cargar_datos_guardados: function(){
		var data = localStorage.getItem('pokedex_data');
		if(data != null){
			this.options.datos_guardados = JSON.parse(data);
		}
	},
	
	create_pokedex: function(){
		var x_index = 0,
			y_index = 0;
		
		for(var i=0; i < db.pokemons.length; i++){

			if(x_index > 14){
				x_index = 0;
				y_index++;
			}
			
			var pokemon_pokedex = document.createElement('div'),
				pokemon_pokedex_nombre = document.createElement('h3'),
				pokemon_pokedex_imagen = document.createElement('i'),
				pokemon_pokedex_tipos = document.createElement('div'),
				pokemon_pokedex_numero = document.createElement('span');
			
			var pokemon_guardado = this.options.datos_guardados[utiles.convertir_numero(String(i), 3)];
			if( pokemon_guardado != null){
				if(pokemon_guardado[0] === 1){
					pokemon_pokedex.classList.add(this.options.pokemon_capturado_clase);
					pokemon_pokedex.capturado = true;
				}else {
					pokemon_pokedex.classList.add(this.options.pokemon_visto_clase);
					pokemon_pokedex.capturado = false;
				}
			}
			
			pokemon_pokedex_numero.className = 'pokedex_pokemon_indice';
			pokemon_pokedex_numero.innerText = i + 1;

			pokemon_pokedex.index = i;
			pokemon_pokedex.addEventListener('click', this.marcar_captura.bind(this), false);
			
			pokemon_pokedex_nombre.innerText = db.pokemons[i].nombre;
			
			pokemon_pokedex_imagen.style.backgroundPosition = '-' + (6 + 68*x_index) + 'px -' + (8 + 68*y_index) + 'px';
			
			pokemon_pokedex.appendChild(pokemon_pokedex_nombre);
			pokemon_pokedex.appendChild(pokemon_pokedex_imagen);
			//pokemon_pokedex.appendChild(pokemon_pokedex_tipos);
			pokemon_pokedex.appendChild(pokemon_pokedex_numero);
			
			this.options.pokedex_container.appendChild(pokemon_pokedex);
			
			x_index++;
		}
	},
	
	marcar_captura: function(e){
		if(this.first_click != null){
			clearTimeout(this.first_click);
			this.first_click = null;
			var data_index = utiles.convertir_numero(String(e.currentTarget.index) , 3),
			data = this.options.datos_guardados[data_index];


			if(e.currentTarget.className.indexOf(this.options.pokemon_visto_clase) > -1){
				e.currentTarget.classList.remove(this.options.pokemon_visto_clase);

				if(e.currentTarget.capturado === false){
					if(data[1] === 0){
						e.currentTarget.capturado = true;
					}
					e.currentTarget.classList.add(this.options.pokemon_capturado_clase);
					
					this.options.datos_guardados[data_index] = [1,data[1]];
				}else{
					e.currentTarget.capturado = false;
					delete this.options.datos_guardados[utiles.convertir_numero(String(e.currentTarget.index) , 3)];
				}
			}else{
				e.currentTarget.classList.remove(this.options.pokemon_capturado_clase);
				e.currentTarget.classList.add(this.options.pokemon_visto_clase);
				
				if(data != null){
					this.options.datos_guardados[data_index] = [0,data[1]];
				}else{
					this.options.datos_guardados[data_index] = [0,0];
				}
			}

			this.guardar_datos();
		}else{
			var index = e.currentTarget.index;
			this.first_click = setTimeout((function(){
				this.index_activo = index;
				this.options.pokemon_muestra_name.innerText = '#' + (index + 1) + ' ' + db.pokemons[index].nombre;
				this.options.pokemon_muestra_imagen.src = 'img/pokemons/fullcard/' + utiles.convertir_numero(new String(index+1), 3) +'.jpg';
				this.options.pokemon_muestra.classList.add('modal-activo');
				window.location.hash = 'modal-extra-muestra';
				this.first_click = null;

				if(this.audio != null){
					this.audio.pause();
				}
				this.audio = new Audio(this.options.ruta_voces + utiles.convertir_numero(String(index + 1), 3) + '.mp3');
				this.audio.play();
			}).bind(this),200);
		}
	},
	
	marcar_visto: function(index){
		var elemento = this.options.pokedex_container.children[index],
			data = this.options.datos_guardados[utiles.convertir_numero(String(index) , 3)];
		if(data == null){
			elemento.classList.add(this.options.pokemon_visto_clase);
			this.options.datos_guardados[utiles.convertir_numero(String(index) , 3)] = [0,1];
		}else{
			this.options.datos_guardados[utiles.convertir_numero(String(index) , 3)] = [data[0],((data[1] * 1) + 1)];
		}
		
		this.guardar_datos();
	},
	
	guardar_datos: function(){
		localStorage.setItem('pokedex_data', JSON.stringify(this.options.datos_guardados));
	}
}