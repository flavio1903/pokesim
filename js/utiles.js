var Utiles = function(options){}

Utiles.prototype = {
	constructor: Utiles,
	
	convertir_numero: function(numero, largo){
		if(numero.length < largo){
			var max = largo - numero.length;
			for(var i=0; i < max; i++){
				numero = '0'.concat(numero);
			}
		}
		
		return numero;
	},

	vaciar_elemento: function(elemento){
		while(elemento.firstChild){
			elemento.removeChild(elemento.firstChild);
		}
	},

	unir_arrays: function(array1, array2){
		return this.manejar_arrays(array1, array2, true);
	},

	restar_arrays: function(array_base, array_restar){
		return this.manejar_arrays(array_base, array_restar, false);
	},

	manejar_arrays: function(array1, array2, concatenar){
		var array_aux = [],
			array_matches = [];
		for(let param of array1){
			let add = true;
			for(let param2 of array2){
				if(param === param2){
					add = false;
					array_matches.push(param);
					break;
				}
			}
			if(add){
				array_aux.push(param);
			}
		}

		if(concatenar){
			array_aux = array2.concat(array_aux)
		}

		return [array_aux, array_matches];
	},

	generar_random: function(minimo, maximo, entero){
		var random = Math.random() * (maximo - minimo) + minimo;
		if(entero){
			random = Math.floor(random);
		}

		return random;
	}
}