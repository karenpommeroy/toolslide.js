!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('toolslide', this, function () {
	'use strict';
	
    var TOOLSLIDE_CLASS = "toolslide";
    
	var defaults = {
		position: "left",
		height: "100%",
		width: "25%",
		startOpen: true,
		sticky: true,
		closeable: true,
		autoclose: false,
		autocloseDelay: 5,
		clickOutsideToClose: true,
		animations: {
			replace: "crossfade 0.5s ease-in-out",
			toggle: "slide 0.5s ease",
		}
	}
	
	function Toolslide() {
		this.init.apply(this, arguments)
	};
	
	Toolslide.prototype = {
		
		init: function (target, config) {
			this.config = Object.assign({}, defaults, config);
			
			if (!target) {
				throw new Error("Missing required attribute: target element (css selector or DOM node) must be provided");
			}
			else if (this.__isString(target)) {
				this.targetElement = document.querySelector(target);
			}
			else if (this.__isDOMElement(target)) {
				this.targetElement = target;
			}
			else {
				throw new Error("Incorrect type: target element must be DOM node or string css selector");
			}
			this.targetElement.classList.add(TOOLSLIDE_CLASS);
			this.contentElement = this.targetElement.querySelector(".ts-content-container");
			this.navElement = this.targetElement.querySelector(".ts-nav-container");
			
			this.applyConfig(this.config);
			this.attachEventListeners();
		},
		
		applyConfig: function(config) {
			this.setPosition(this.config.position);
			this.setWidth(this.config.width);
			this.setHeight(this.config.height);
			this.setSticky(this.config.sticky);
			this.setAnimations(this.config.animations);
			if (config.autoclose) {
                this.setAutoClose();
            }
			this.setActiveById(this.config.activePanel || this.__getContentPanel(0));			
			if (this.config.startOpen) {
				this.open();
			}
			else {
				this.close();
			}
		},
		
		setPosition: function(position) {
			this.targetElement.classList.add("ts-" + position);
		},
		
		setHeight: function(height) {
			this.targetElement.style.height = height;
		},
		
		setWidth: function(width) {
			this.targetElement.style.width = width;
		},
		
		setAutoClose: function(delay) {
			if (this.autocloseTimeout) {
				clearTimeout(this.autocloseTimeout);
			}
			this.autocloseTimeout = setTimeout(this.close, delay * 1000);
		},
		
		setSticky: function(sticky) {
			sticky ? this.targetElement.classList.add("sticky") : this.targetElement.classList.remove("sticky");
		},
		
		setAnimations: function(animations) {
			if (!animations || !Object.keys(animations).length) {
				return;
			}
			
			if (animations.replace) {
				var animation = this.__getAnimationFromString(animations.replace);
				var allContentPanels = this.contentElement.children;
				var l = allContentPanels.length;
				while (l--) {
					this.__setVendorStyleProperty(allContentPanels[l], "transition", this.__getTransitionFromAnimation(animation));
					allContentPanels[l].classList.add(animation.type);
				}
			}
			if (animations.toggle) {
				var animation = this.__getAnimationFromString(animations.toggle);
				this.__setVendorStyleProperty(this.targetElement, "transition", this.__getTransitionFromAnimation(animation));
			}
		},
		
		setActiveById: function(panel) {
			var previousActivePanel = this.targetElement.querySelector(".ts-content-item.active");
			var id;
			
			if (this.__isDOMElement(panel)) {
				id = panel.id;
			}
			else if (this.__isString(panel)) {
				id = panel;
			}
			else {
				return;
			}
			
			if (previousActivePanel && id === previousActivePanel.id) {
				return;
			}
			
			this.fire("beforeToggle",[previousActivePanel, currentActivePanel]);
			var activeNavButton = this.targetElement.querySelector(".ts-nav-item[ts-target='" + id + "']");
			var currentActivePanel = this.targetElement.querySelector("#" + id);
			
			this.__deactivateAll();
			currentActivePanel.classList.add("active");
			activeNavButton.classList.add("active");
			this.fire("afterToggle",[previousActivePanel, currentActivePanel]);
		},
		
		setActiveByIndex: function(index) {
			var allPanels = this.contentElement && this.contentElement.children;
			this.setActiveById(allPanels[index] && allPanels[index].id)
		},
		
		open: function() {
			this.fire("beforeOpen", [this.targetElement]);
			this.targetElement.classList.remove("closed");
			this.targetElement.classList.add("open");
			this.fire("afterOpen", [this.targetElement]);
		},
		
		close: function() {
			this.fire("beforeClose", [this.targetElement]);
			this.targetElement.classList.remove("open");
			this.targetElement.classList.add("closed");
			this.fire("afterClose", [this.targetElement]);
		},
		
		isOpen: function() {
			return this.targetElement.classList.contains("open");
		},
		
		isActive: function(target) {
			if (this.__isString(target)) {
				target = document.getElementById(target);
			}
			else if (this.__isDOMElement(target)) {
			}
			else {
				return false;
			}
			
			return target.classList.contains("active");
		},
		
		attachEventListeners: function() {
			var navButtons = this.navElement.children;
			var l = navButtons.length;
			
			while (l--) {
				navButtons[l].onclick = this.onNavButtonClick.bind(this);
			}
			
			if (this.autocloseTimeout) {
				this.targetElement.onmouseover = this.onMouseOver.bind(this);
				this.targetElement.onmouseover = this.onMouseOut.bind(this);
			}
		},
		
		onNavButtonClick: function(event) {
			if (!this.isOpen()) {
				this.open();
			}
			else if (this.isActive(event.currentTarget) && this.config.closeable) {
				this.close();
			}
			
			this.setActiveById(event.currentTarget.getAttribute("ts-target"));
		},
		
		onMouseOver: function(event) {
			clearTimeout(this.autocloseTimeout);
		},
		
		onMouseOut: function(event) {
			this.setAutoClose(this.config.autocloseDelay);
		},
		
		fire: function(eventName, args) {
			if (!this.config.listeners || !this.config.listeners[eventName]) {
				return;
			}
			this.config.listeners[eventName].apply(this, args)
		},
		
		__deactivateAll: function() {
			var allPanels = this.contentElement && this.contentElement.children;
			var allNavButtons = this.navElement && this.navElement.children;
			var l = allPanels.length;
			var ll = allNavButtons.length;
			while (l--) {
				allPanels[l].classList.remove("active");
			}
			while (ll--) {
				allNavButtons[ll].classList.remove("active");
			}
		},
		
		__getContentPanel: function(index) {
			return this.contentElement && this.contentElement.children && this.contentElement.children[index];
		},
		
		__hasValidId: function (element) {
			return !!element.getAttribute("id");
		},
		
		__isDOMElement: function (target) {
			return target instanceof Element;
		},
		
		__isString: function (target) {
			return typeof target === "string";
		},
		
		__getAnimationFromString: function(input) {
			var animationOptions = input.split(" ");
			return {
				type: animationOptions[0],
				speed: animationOptions[1],
				easing: animationOptions[2]
			}
		},
		
		__getTransitionFromAnimation: function(animation) {
			var transitionString = "";
			if(animation.type === "slide") {
				transitionString += "transform " + animation.speed + " " + animation.easing;
			}
			else if (animation.type === "crossfade") {
				transitionString += "opacity " + animation.speed + " " + animation.easing;
			}
			else if (animation.type === "slidefade"){
				transitionString += "opacity " + animation.speed + " " + animation.easing + ", ";
				transitionString += "transform " + animation.speed + " " + animation.easing;
			}
			return transitionString;
		},
		
		__setVendorStyleProperty: function (target, propertyName, value) {
			var capitalizedPropertyName = this.__capitalizeFirstLetter(propertyName);
			target.style["webkit" + capitalizedPropertyName] = value;
			target.style["Moz" + capitalizedPropertyName] = value;
			target.style["ms" + capitalizedPropertyName] = value;
			target.style["O" + capitalizedPropertyName] = value;
			target.style[propertyName] = value;
		},
		
		__capitalizeFirstLetter: function(input) {
			return input.charAt(0).toUpperCase() + input.slice(1);
		}
	};
	
	function toolslide(target, config) {
		return new Toolslide(target, config);
	}
	
	return toolslide;
	
});