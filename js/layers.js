var Layers = function(options){
	this.options = {
		layers_container: document.getElementById('layers_container'),
		layers: document.getElementsByClassName('layer'),
		icons_layers:  document.getElementById('icons_layers').children,
		icons_layers_class_activo: 'footer_activo'
	}
	
	if(this.options.layers.length > 1){
		this.start_move_pos = null;
		this.block_moving = null;
		this.moving_factor = 0;
		this.current_pos = window.getComputedStyle(layers_container).left.replace('px','') * 1;
		this.limit_pos = (this.options.layers.length - 1) * window.screen.width;
		
		this.set_events();
	}
}

Layers.prototype = {
	constructor: Layers,
	
	set_events: function(){
		//Registra el comienzo del movimiento
		//this.options.layers_container.addEventListener('touchstart', this.start_move.bind(this), false);
		
		//Calcula el movimiento de la pantalla y mueve los "layers"
		//this.options.layers_container.addEventListener('touchmove', this.moving.bind(this), false);
		
		//Registra el fin del movimiento de la pantalla y calcula la posicion final de las pantallas
		//this.options.layers_container.addEventListener('touchend', this.end_move.bind(this), false);
		
		//Cambia de pagina al clickear en el icono especifico
		for(var i=0; i < this.options.icons_layers.length; i++){
			this.options.icons_layers[i].index = i;
			this.options.icons_layers[i].addEventListener('click', this.set_layer.bind(this), false);
		}
	},
	
	start_move: function(e){
		if(!window.location.hash.startsWith('#modal-') && !window.location.hash.startsWith('modal-')){
			this.start_move_pos = {pageX: e.touches[0].screenX, pageY: e.touches[0].screenY, time: new Date()};
		}
	},
	
	moving: function(e){
		if(this.block_moving === null){
			if(this.start_move_pos != null && Math.abs(e.touches[0].screenX - this.start_move_pos.pageX) > Math.abs(e.touches[0].screenY - this.start_move_pos.pageY)){
				this.block_moving = false;
				this.options.layers_container.classList.add('block-scroll');
			}else{
				this.block_moving = true;
			}
		}
		
			
		if(!this.block_moving){
			var moving_factor_aux = this.moving_factor;
			this.moving_factor = this.start_move_pos.pageX - e.touches[0].screenX;
			var new_pos = this.current_pos - this.moving_factor;
			if(new_pos < 0 && Math.abs(new_pos) < this.limit_pos){
				this.options.layers_container.style.transform = 'translateX(' + new_pos + 'px)';
			}else{
				this.moving_factor = moving_factor_aux;
			}
		}
	},
	
	end_move: function(e){
		if(!this.block_moving && Math.abs(this.moving_factor) > 0){
			this.options.layers_container.classList.add('moving');
		
			if(Math.abs(this.moving_factor) > window.screen.width / 2 || (new Date() - this.start_move_pos.time <= 300)){
				if(this.moving_factor < 0){
					this.current_pos += window.screen.width;
				}else{
					this.current_pos -= window.screen.width;
				}
			}
			
			this.active_icon_layer(Math.abs(this.current_pos / window.screen.width));
			this.options.layers_container.style.transform = 'translateX(' + this.current_pos + 'px)';
			
			
			setTimeout((function(){
				this.options.layers_container.classList.remove('moving');
			}).bind(this), 400);
		}
		
		this.start_move_pos = null;
		this.moving_factor = 0;
		this.options.layers_container.classList.remove('block-scroll');
		this.block_moving = null;
	},
	
	set_layer: function(e){
		if(e.currentTarget.className.indexOf(this.options.icons_layers_class_activo) === -1){
			this.options.layers_container.classList.add('moving');
			var index = e.currentTarget.index;
			this.active_icon_layer(index);
			
			this.options.layers_container.style.transform = 'translateX(' + (-window.screen.width * index) + 'px)';
			
			setTimeout((function(){
				this.options.layers_container.classList.remove('moving');
			}).bind(this), 400);
		}
	},
	
	active_icon_layer: function(index){
		for(var i=0; i < this.options.icons_layers.length; i++){
			if(i === index){
				this.options.icons_layers[i].classList.add(this.options.icons_layers_class_activo);
			}else if(this.options.icons_layers[i].className.indexOf(this.options.icons_layers_class_activo) > -1){
				this.options.icons_layers[i].classList.remove(this.options.icons_layers_class_activo);
			}
		}
		
	}
}