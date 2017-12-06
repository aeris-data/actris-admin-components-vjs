require("exports-loader?!./l.min.js")

import Vue from 'vue'

import vueCustomElement from 'vue-custom-element'
Vue.use(vueCustomElement);

import VueI18n from 'vue-i18n'
Vue.use(VueI18n);

import VueResource from 'vue-resource';
Vue.use(VueResource);

import {VueAerisLanguagePlugin} from 'aeris-mixins'
Vue.use(VueAerisLanguagePlugin)

import ActrisAdmin from './actris-admin/actris-admin.vue';

ljs.addAliases({
	dep: ['https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
		'https://cdnjs.cloudflare.com/ajax/libs/document-register-element/1.4.1/document-register-element.js', 
		'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment-with-locales.min.js']
})

ljs.load('dep', function() {
	
	if (!window.registredAerisElements) {
		window.registredAerisElements = [];
	}
	
	var actrisAdminTimer;
	
	function stopactrisAdminTimer() {
		clearInterval(actrisAdminTimer);
	}

	function registerElement(name, component) {
        if (!window.registredAerisElements) {
            window.registredAerisElements = [];
        }
        if (window.registredAerisElements.indexOf(name) < 0) {
            Vue.customElement(name, component);
            window.registredAerisElements.push(name)
        }
    }
	
	function actrisAdminRegister() {
		console.info("trying to register actris admin components");
		if (window.registredAerisElements.indexOf("aeris-catalogue-components-vjs") > -1) {
			console.info("Start registration of Actris admin components")
			console.info("Registred elements at this time: "+window.registredAerisElements)
			
			registerElement('actris-admin', ActrisAdmin);
						
			console.info("Actris admin components registration complete")
			stopactrisAdminTimer();
		}
		else {
			console.info("aeris-catalogue-components-vjs not available yet...");
		}
	}
	
	actrisAdminTimer = setInterval(actrisAdminRegister, 1000);
	
	
	
})

