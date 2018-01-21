var Modals = function(options){
	this.options = {
		openers: document.querySelectorAll('[data-modal]'),
		closers: document.querySelectorAll('[data-dismiss]'),
		open_class: 'modal-activo'
	}
	
	this.set_events();
	if(window.location.hash !== '' && window.location.hash !== '#'){
		window.location.hash = '';
	}
}

Modals.prototype = {
	constructor: Modals,
	
	set_events: function(){
		
		//modal openers
		for(var i=0; i < this.options.openers.length; i++){
			this.options.openers[i].addEventListener('click', this.open_modal.bind(this), false)
		}
		
		//modal closers
		for(var i=0; i < this.options.closers.length; i++){
			this.options.closers[i].addEventListener('click', this.close_modal.bind(this), false)
		}
		
		//hash change
		window.onhashchange = this.hash_change_event.bind(this);
	},
	
	open_modal: function(e){
		var target_id = e.currentTarget.dataset.modal;
		
		if(target_id == null || target_id === ''){
			return;
		}
		
		var target = document.getElementById(target_id);
		
		if(target === null || target.className.indexOf(this.options.open_class) > -1){
			return;
		}
		
		target.classList.add(this.options.open_class);
		window.location.hash = 'modal-' + target_id;
		
	},
	
	close_modal: function(e){
		e.stopImmediatePropagation();
		var target_id = e.currentTarget.dataset.dismiss;
		
		if(target_id == null || target_id === ''){
			return;
		}
		
		var target = document.getElementById(target_id);
		
		if(target === null || target.className.indexOf(this.options.open_class) === -1){
			return; 
		}

		history.back();
	},
	
	hash_change_event: function(e){
		if(window.location.hash === '' || window.location.hash === '#'){
			var open_modal = document.getElementsByClassName(this.options.open_class);
			
			for(var i=0; i < open_modal.length; i++){
				open_modal[i].classList.remove(this.options.open_class);
			}
		}else if(!window.location.hash.startsWith('modal-extra') && !window.location.hash.startsWith('#modal-extra')){
			var open_modal_extra = document.getElementsByClassName('modal-extra');

			for(var i=0; i < open_modal_extra.length; i++){
				open_modal_extra[i].classList.remove(this.options.open_class);
			}
		}
	}
}