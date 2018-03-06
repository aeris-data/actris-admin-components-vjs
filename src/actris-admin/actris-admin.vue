<i18n>
{
  "en": {
  	"sites": "Sites",
  	"products": "Products",
  	"loading": "Loading...",
  	"noSelectedProduct" : "No selected product",
  	"responsibles": "Responsibles",
  	"addResponsible": "Add new responsible",
  	"delete": "Delete",
  	"add": "Add",
  	"save": "Save",
  	"saveKo": "An error has occured while saving. Please retry",
  	"saveOk": "The configuration has been saved"
  },
  "fr": {
	"sites": "Sites",
	"products": "Produits",
	"loading": "Chargement...",
	"noSelectedProduct" : "Aucun produit sélectionné",
	"responsibles": "Responsibles",
	"addResponsible": "Ajotuer un responsable",
  	"delete": "Supprimer",
  	"add": "Ajouter",
  	"save": "Sauver",
  	"saveKo": "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer",
  	"saveOk": "La configuration a été sauvegardée"
  }
}
</i18n>

<template>
<span>
<aeris-notifier></aeris-notifier>
<div class="actris-admin-host" :class="getGridByState()" >

<div class="sites" :class="getFoldClass('sites')">
	<header @click="toggleState('sites')" ><h2><i :class="getChevronClass('sites')"  ></i><span class="headerLabel">{{$t("sites")}}</span></h2></header>
	<main v-if="states['sites']">
		<h5 v-show="loadingsites">{{$t("loading")}}</h5>
		<div v-for="site in sites" ><input type="radio" name="site" :id="site.id" :value="site.name" v-model="selectedSite"></input><label style="cursor:pointer" :for="site.id">{{site.name}}</label></div>
	</main>
	<main v-else>
	<div class="selectedItem"  @click="toggleState('sites')" style="cursor:pointer">
	{{selectedSite}}
	</div>
	</main>
</div>

<div class="products" :class="getFoldClass('products')" >
<header @click="toggleState('products')"><h2><i :class="getChevronClass('products')"  ></i><span class="headerLabel">{{$t("products")}}</span></h2></header>

<main style="overflow-y: auto;" v-if="states['products']">
	<h5 v-show="loadingproducts">{{$t("loading")}}</h5>
	<div  v-if="hasProducts">
		<div v-for="summary in products" @click="selectedProduct = summary">
			<div data-template="summary">
			{{summary.title.DEFAULT_VALUE_KEY || summary.title.en }}
			</div>
		</div>
	</div>
	<div v-else>
	<span v-if="!loadingproducts">
	{{$t("noSelectedProduct")}}
	</span>
	</div>
</main>

<main v-else>
<div class="selectedProduct"  @click="toggleState('products')" style="cursor:pointer;min-width:100px" v-if="selectedProduct" >
{{selectedProduct.title.DEFAULT_VALUE_KEY || selectedProduct.title.en }}
</div>
</main>

</div>


<div class="details">
<h5 v-show="loadingconfig">{{$t("loading")}}</h5>
<div v-if="config" >
<h1>{{selectedProduct.title.DEFAULT_VALUE_KEY || selectedProduct.title.en }} <button type="button" class="button" :title="$t('save')" @click="save"><i class="fa fa-save"></i></button></h1>
<h3>{{$t("responsibles")}}</h3>
<div style="display: flex;">
<div v-for="responsible in config.responsibles" >
	<div  class="responsible">
		<div><i class="fa fa-user fa-2x" style="margin:10px"></i></div>
		<div v-if="responsible.name">
		<h3 >{{responsible.name}}</h3>
		<h5>{{responsible.orcid}}</h5>
		</div>
		<div v-else>
		<div>{{responsible.orcid}}</div>
		</div>
		<div>
		<button type="button" class="button" @click="remove(responsible)"><i class="fa fa-trash" :title="$t('delete')"></i></button>
		</div>
	</div>
</div>
<div  class="responsible new-responsible">
<div><i class="fa fa-user fa-2x" style="margin:10px"></i></div>
<div><input type="text" :placeholder="$t('addResponsible')" class="input" v-model="newOrcid" @keyup.enter="addResponsible"></input></div>
<div>
<button type="button" class="button" :title="$t('add')" @click="addResponsible"><i class="fa fa-plus"></i></button>
</div>
</div>
</div>
</div>
</div>
</div>
</span>
</template>

<script>
export default {
	props: {
		lang:  {
			type: String,
			default: 'en'
		}
	},
  
	mounted: function() {
		var event = new CustomEvent('aerisThemeRequest', {});
		document.dispatchEvent(event);
		
		var url = "https://sedoo.aeris-data.fr/actris-datacenter-rest/rest/sites/list"
		//var url= "http://localhost:9080/actris-validation-rest/rest/sites/list"
        this.loadingsites = true;
        this.$http.get(url).then((response) => {
          this.siteLoadingSuccess(response)
        }, (response) => {
          this.siteLoadingError(response)
        });
	},
   
	watch: {
		lang (value) {
			this.$i18n.locale = value
		},

		
		config() {
			this.fetchNameFromOrcid()
		},
		
		selectedSite() {
			this.products=[]
			this.config = null
			console.log(this.selectedSite)
			this.loadingproducts = true
			this.states["sites"] = false
			this.states["products"] = true
			var productUrl = "https://sedoo.aeris-data.fr/catalogue/rest/metadatarecette/request?program=ACTRIS-FR"
			var box = this.getBoxById(this.selectedSite)
			var body = {}
			body["box"] = box
			this.$http.post(productUrl, body).then((response) => {
		          this.productLoadingSuccess(response)
	        }, (response) => {
	          this.productLoadingError(response)
	        });
		},
		
		selectedProduct() {
			this.config = null
			this.states["sites"] = false
			this.states["products"] = false
			 this.loadingconfig = true
			var configUrl = this.configUrl+this.selectedProduct.id
			this.$http.get(configUrl).then((response) => {
			          this.configLoadingSuccess(response)
		        }, (response) => {
		          this.configLoadingError(response)
		        });
		}
	},
  
	destroyed: function() {
		document.removeEventListener('aerisTheme', this.aerisThemeListener);
		this.aerisThemeListener = null;
	},
  
	created: function () {
		console.log("Actris admin - Creating");
		this.$i18n.locale = this.lang;
	    // to apply theme
	    this.aerisThemeListener = this.handleTheme.bind(this);
	    document.addEventListener('aerisTheme', this.aerisThemeListener);
	},
  
	updated: function() {
		this.ensureTheme();
	},
  
	computed: {
		hasProducts: function() {
			return ((this.products) && (this.products.length>0))
		}
	},
  
	data () {
		return {
			visible: true,
			theme : null,
			aerisThemeListener: null,
			sites: [],
			products: [],
			selectedSite: null,
			selectedProduct: null,
			loadingsites: false,
			loadingproducts: false,
			loadingconfig: false,
			config: null,
			"newOrcid": null,
			orcidService: "https://sedoo.aeris-data.fr/aeris-rest-services/rest/orcid/name/",
			//configUrl : "http://localhost:9080/actris-validation-rest/rest/admin/config?uuid=",
			configUrl: "https://sedoo.aeris-data.fr/actris-datacenter-rest/rest/admin/config?uuid=",
			states: {
			"sites": true,
			"products": false,
			"details": false
			}
		}
	},
  
	methods: {
		
		save: function() {
			var configUrl = this.configUrl+this.selectedProduct.id
			this.$http.post(configUrl, this.config).then((response) => {
		          this.configSavingSuccess(response)
	        }, (response) => {
	          this.configSavingError(response)
	        });
			
			
		},
		
		 remove: function(responsible) {
			 this.config.responsibles = this.config.responsibles.filter(function(item) {return item != responsible})
		 },
		 
		 fetchNameFromOrcid: function() {
			 console.log("Actris Admin - maj config détectée")
				if (this.config) {
					if (this.config.responsibles) {
						 for (var i = 0; i< this.config.responsibles.length;i++) {
				        	  var responsible = this.config.responsibles[i]
				        	  if (!responsible.name) {
				        		  var url = this.orcidService + responsible.orcid;
				        		  let aux = responsible.orcid
				        		  this.$http.get(url)
				        		  .then((response)=>{this.orcidLoadingSuccess(response, aux)},(response)=>{this.orcidLoadingError(response)});
				        	  }
				          }
					}
				}
		 },
		
		 siteLoadingSuccess: function(response) {
			 this.loadingsites = false;
		      var sites = JSON.parse(response.bodyText)
		      this.sites = sites
		 },
		 
		 getBoxById: function(id) {
			 for (var i = 0; i< this.sites.length; i++) {
				 if (this.sites[i].id == id) {
					 return this.sites[i].box;
				 }
			 } 
		 },
		 
		 addResponsible: function() {
			 var aux = {}
			 aux.orcid = this.newOrcid;
			 this.config.responsibles.push(aux);
			 this.newOrcid="";
			 this.fetchNameFromOrcid()
		 },
		 
		 siteLoadingError: function(response) {
		      this.loadingsites = false;
		 },
		 
		 productLoadingSuccess: function(response) {
			 this.loadingproducts = false;
			 this.products = response.body
		 },
		 
		 productLoadingError: function(response) {
		      this.loadingproducts = false;
		 },
		 
		 configLoadingSuccess: function(response) {
			 console.log("XXX")
			 this.loadingconfig = false;
			 this.config = response.body
		 },
		 
		 configLoadingError: function(response) {
		      this.loadingconfig = false;
		 },
		 
		 configSavingSuccess: function(response) {
			 document.dispatchEvent(new CustomEvent('aerisNotificationMessageEvent', { 'detail': {message: this.$i18n.t('saveOk')}}))
		 },
		 
		 configSavingError: function(response) {
			 document.dispatchEvent(new CustomEvent('aerisErrorNotificationMessageEvent', { 'detail': {message: this.$i18n.t('saveKo')}}))
		 },
		 
		 
		 orcidLoadingError: function(response) {
		 },
		 
		 orcidLoadingSuccess: function(response, orcid) {
			 if ((this.config) && (this.config.responsibles)) {
		  			for (var i = 0; i < this.config.responsibles.length;i++) {
		  				var responsible = this.config.responsibles[i]
		  				if (responsible.orcid == orcid) {
		  					responsible.name= response.bodyText
		  					this.$set(this.config.responsibles, i, responsible)
		  				}
		  			}
		  		}
		 },
		
		handleTheme: function(event) {
			this.theme = event.detail
			this.ensureTheme();
	  		
		},
		
		ensureTheme: function() {
		},
		
		getGridByState: function() {
			return ""
		},
		
		getChevronClass: function(tab) {
			var aux = this.states[tab];
			if (aux) {
				return "fa fa-chevron-circle-left"
			}
			else {
				return "fa fa-chevron-circle-up"
			}
		},
		
		getFoldClass: function(tab) {
			var aux = this.states[tab];
			if (aux) {
				return "unfold";
			} 
			else {
				return "fold";
			}
		},
		
		toggleState: function(tab) {
			var aux = this.states[tab];
			this.states[tab] = !aux;
		}
		      
	} // methods
	
} // default
</script>

<style>
	
	.actris-admin-host .input {
    border-style: none;
    border: none;
    outline: none;
    padding: 12px;
    font-size: 1rem;
    background: transparent;
	border-bottom: 1px grey solid;
    margin: 5px;
	}

	.actris-admin-host .headerLabel {
		font-variant: small-caps;
	}
	
	.actris-admin-host .selectedProduct {
		margin: 10px 5px
	}

	.actris-admin-host .fold header {
	  writing-mode: vertical-rl;
	  text-orientation: sideways;
	}
	
	.actris-admin-host .fold .headerLabel {
		margin-top: 5px
	}
	
	.actris-admin-host .unfold .headerLabel {
		margin-left: 5px
	}
	
	.actris-admin-host .products.unfold  {
		min-width:400px
	}
	
	.actris-admin-host .new-responsible {
		border: grey 2px dashed;
	}
	
	.actris-admin-host .responsible {
		border-radius: 2px;
		background: #e1e1e1;
		margin:10px;
		padding: 10px
	}
	
	.actris-admin-host .unfold header {
		 margin-left: 8px;
		 margin-right: 8px
    }
	
	.actris-admin-host .fold header {
		 margin-top: 5px;
   }
	
	.actris-admin-host  .button {
		justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    background-color: silver;
	font-size: 1rem;
	}
	
	.actris-admin-host  .button:hover {
		cursor: pointer;
    filter: brightness(90%);
		
	}
	
	.actris-admin-host {
		background-color: #ccc;
		display: grid;
		grid-template-columns: min-content min-content auto ;
		width: 100vw;
		height: inherit; 
	  	grid-template-rows: auto;
		grid-template-areas: "sites products details";
	}
	
	
	.actris-admin-host [data-template=summary] {
	    height: 100%;
	    width: 100%;
	    margin: 10px 0;
	    border-radius: 2px;
	    box-sizing: border-box;
	    padding: 10px;
	    background: #e1e1e1;
	    color: #333;
	}
	
	.actris-admin-host [data-template=summary]:hover {
	    cursor: pointer;
	    filter: brightness(90%);
	}
	
	
	.actris-admin-host.secondStep {
		grid-template-columns: 30px auto 30px;
	}
	
	.actris-admin-host .selectedItem {
		margin: 10px 5px;
	}
	
	.actris-admin-host header{
		white-space: nowrap;
		cursor: pointer;
	}
	
	.actris-admin-host .sites {
		grid-area: sites;
		background-color: #ccc;
	padding: 10px;
	}
	
	.actris-admin-host .products {
		grid-area: products;
		background-color: #eeeeee;
    	padding: 10px;
	}
	
	.actris-admin-host .details {
		grid-area: details;
		background-color: #eee;
	}
 </style>