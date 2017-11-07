(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['toolslide'] = factory();
  }
}(this, function () {

'use strict';
	
var TOOLSLIDE_CLASS = "toolslide",
    TOOLSLIDE_EMBED_CONTAINER_CLASS = "ts-embed-container";

var defaults = {
    position: "left",
    height: "100%",
    width: "25%",
    startOpen: true,
    closeable: true,
    minClosedSize: 0,
    toggleButton: "",
    embed: false,
    navigationItemWidth: "50px",
    navigationItemHeight: "50px",
    autoclose: false,
    autocloseDelay: 5000,
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
        if (this.config.embed) this.targetElement.parentElement.classList.add(TOOLSLIDE_EMBED_CONTAINER_CLASS);
        this.containerElement = this.targetElement.querySelector(".ts-container");
        this.contentElement = this.targetElement.querySelector(".ts-content-container");
        this.navElement = this.targetElement.querySelector(".ts-nav-container");
        this.__applyConfig(this.config);
        this.__attachEventListeners();
    },

    setPosition: function(position) {
        this.targetElement.classList.add("ts-" + position);
    },
    
    setHeight: function(height) {
        this.targetElement.style.height = height;
        if (this.config.position === "top"  || this.config.position === "bottom") {
            this.containerElement.style.height = "calc(100% - " + this.navElement.clientHeight + "px)";
        }
    },
    
    setWidth: function(width) {
        this.targetElement.style.width = width;
        if (this.config.position === "left"  || this.config.position === "right") {
            this.containerElement.style.width = "calc(100% - " + this.navElement.clientWidth + "px)";
        }
    },
    
    setNavigationSize: function(width, height) {
        if (this.config.position === "left"  || this.config.position === "right") {
            this.navElement.style.width = width;
        }
        if (this.config.position === "top"  || this.config.position === "bottom") {
            this.navElement.style.height = height;
        }
        var navItems = this.navElement.querySelectorAll(".ts-nav-item"),
            l = navItems.length;
            
        while (l--) {
            navItems[l].style.width = width;
            navItems[l].style.height = height;
        }
    },
    
    setAutoClose: function(delay) {
        if (this.autocloseTimeout) {
            clearTimeout(this.autocloseTimeout);
        }
        this.autocloseTimeout = setTimeout(this.close.bind(this), delay);
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
        currentActivePanel &&currentActivePanel.classList.add("active");
        activeNavButton && activeNavButton.classList.add("active");
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
        this.containerElement.style.left = "";
        this.__updateEmbeding();
        this.fire("afterOpen", [this.targetElement]);
    },
    
    close: function() {
        this.fire("beforeClose", [this.targetElement]);
        this.targetElement.classList.remove("open");
        this.targetElement.classList.add("closed");
        this.containerElement.style.left = this.config.minClosedSize + "px";
        this.__updateEmbeding()
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
    
    __applyConfig: function(config) {
        this.setPosition(config.position);
        config.startOpen ? this.open() : this.close();
        this.setNavigationSize(config.navigationItemWidth, config.navigationItemHeight);
        
        this.setWidth(config.width);
        this.setHeight(config.height);
        this.__updateEmbeding();
        if (config.autoclose) {
            this.setAutoClose();
        }
        this.__setAnimations(config.animations);
        this.setActiveById(this.config.activePanel || this.__getContentPanel(0));			
    },
    
    __attachEventListeners: function() {
        var navButtons = this.navElement.children;
        var l = navButtons.length;
        
        while (l--) {
            navButtons[l].onclick = this.onNavButtonClick.bind(this);
        }
        
        if (this.autocloseTimeout) {
            this.containerElement.onmouseover = this.onMouseOver.bind(this);
            this.containerElement.onmouseout = this.onMouseOut.bind(this);
        }
        if (this.config.clickOutsideToClose) {
            document.addEventListener("click", this.onDocumentClick.bind(this), false);
        }
        if (this.config.toggleButton) {
            this.toggleButtonElement = document.querySelector(this.config.toggleButton);
            if (this.toggleButtonElement) {
                this.toggleButtonElement.onclick = this.onToggleButtonClick.bind(this);
            }
        }
    },
    
    __updateEmbeding: function() {
        if (!this.config.embed)  return;
        
        if (this.config.position === "left") {
            this.targetElement.parentElement.style.marginLeft = this.isOpen() ? "calc(" + this.config.width + " - " + this.config.navigationItemWidth + ")" : this.config.minClosedSize + "px";
        }
        else if (this.config.position === "right") {
            this.targetElement.parentElement.style.marginRight = this.isOpen() ? "calc(" + this.config.width + " - " + this.config.navigationItemWidth + ")" : this.config.minClosedSize + "px";
            this.targetElement.parentElement.style.marginLeft = this.isOpen() ? "calc(-" + this.config.width + " + " + this.config.navigationItemWidth + ")" : this.config.minClosedSize + "px";
        }
        else if (this.config.position === "top") {
            this.targetElement.parentElement.style.marginTop = this.isOpen() ? "calc(" + this.config.height + " - " + this.config.navigationItemHeight + ")" : this.config.minClosedSize + "px";
        }
        else if (this.config.position === "bottom") {
            this.targetElement.parentElement.style.marginBottom = this.isOpen() ? "calc(" + this.config.height + " - " + this.config.navigationItemHeight + ")" : this.config.minClosedSize + "px";
        }
    },
    
    __setAnimations: function(animations) {
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
    
    onDocumentClick: function(event) {
        if (!this.targetElement.contains(event.target) && !(this.toggleButtonElement && this.toggleButtonElement.contains(event.target))) {
            this.close();
        }
    },
    
    onToggleButtonClick: function(event) {
        if (!this.isOpen()) {
            this.open();
        }
        else {
            this.close();
        }
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
    
    __isDOMElement: function (target) {
        return target && (target.nodeType === document.ELEMENT_NODE || target.nodeType === document.DOCUMENT_FRAGMENT_NODE);
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

}));
