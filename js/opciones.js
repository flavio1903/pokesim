var Opciones = function(options){
    this.options = {
        pokedex: document.getElementById('pokedex_container'),
        resetear_pokedex_element: document.getElementById('resetear_pokedex')
    }

    this.crear_eventos();
    this.firstclick = null;
}

Opciones.prototype = {
    constructor: Opciones,

    crear_eventos: function(){
        this.options.resetear_pokedex_element.addEventListener('click', this.resetear_pokedex.bind(this), false);
    },

    resetear_pokedex: function(){
        if(this.firstclick !== null && this.firstclick.id === 'resetear_pokedex' && new Date() - this.firstclick.time <= 200){
            localStorage.removeItem('pokedex_data');
            pokedex.options.datos_guardados = {};
            var pokemons_activos = this.options.pokedex.children;
            for(let pokemon of pokemons_activos){
                pokemon.className = '';
            }

            history.back();
            this.firstclick = null;
        }else{
            this.firstclick = {
                id: 'resetear_pokedex',
                time: new Date()
            }
        }
    }
}