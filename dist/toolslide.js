(function (root, factory) {
  if (root === undefined && window !== undefined) root = window;
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['toolslide'] = factory());
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
    navigationOffsetX: "0px",
    navigationOffsetY: "0px",
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
        this.targetElement.style.height = this.__getSizeString(height);
        if (this.config.position === "bottom") {
            this.containerElement.style.height = "calc(100% + " + this.__getSizeString(this.navElement.clientHeight) + ")";
        }
        else if (this.config.position === "top") {
            this.containerElement.style.height = "calc(100% - " + this.__getSizeString(this.navElement.clientHeight) + ")";
        }
    },
    
    setWidth: function(width) {
        this.targetElement.style.width = this.__getSizeString(width);
        if (this.config.position === "left") {
            this.containerElement.style.width = "calc(100% - " + this.__getSizeString(this.navElement.clientWidth) + ")";
        }
        else if (this.config.position === "right") {
            this.containerElement.style.width = "100%";
        }
    },
    
    setNavigationSize: function(width, height) {
        if (this.config.position === "left"  || this.config.position === "right") {
            this.navElement.style.width = this.__getSizeString(width);
        }
        if (this.config.position === "top"  || this.config.position === "bottom") {
            this.navElement.style.height = this.__getSizeString(height);
        }
        var navItems = this.navElement.querySelectorAll(".ts-nav-item"),
            l = navItems.length;
            
        while (l--) {
            navItems[l].style.width = this.__getSizeString(width);
            navItems[l].style.height = this.__getSizeString(height);
        }
    },

    setNavigationOffset: function(offsetX, offsetY) {
        if (this.config.position === "left") {
            this.navElement.style.left = "calc(" + this.__getSizeString(this.navElement.offsetLeft) + " + " + this.__getSizeString(offsetX) + " - " + this.__getSizeString(this.navElement.offsetWidth) + " - " + this.__getSizeString(this.navElement.marginLeft) + ")";
            this.navElement.style.top = "calc(" + this.__getSizeString(this.navElement.offsetTop) + " + " + this.__getSizeString(offsetY) + ")";
        }
        else if (this.config.position === "right") {
            this.navElement.style.left = "calc(" + this.__getSizeString(this.navElement.offsetLeft) + " + " + this.__getSizeString(offsetX) + ")";
            this.navElement.style.top = "calc(" + this.__getSizeString(this.navElement.offsetTop) + " + " + this.__getSizeString(offsetY) + ")";
        }
        else if (this.config.position === "top") {
            this.navElement.style.left = "calc(" + this.__getSizeString(this.navElement.offsetLeft) + " + " + this.__getSizeString(offsetX) + ")";
            this.navElement.style.top = "calc(" + this.__getSizeString(this.navElement.offsetTop) + " + " + this.__getSizeString(offsetY) + " - " + this.__getSizeString(this.navElement.offsetHeight) + " - " + this.__getSizeString(this.navElement.marginTop) + ")";
        }
        else if (this.config.position === "bottom") {
            this.navElement.style.left = "calc(" + this.__getSizeString(this.navElement.offsetLeft) + " + " + this.__getSizeString(offsetX) + ")";
            this.navElement.style.top = "calc(" + this.__getSizeString(this.navElement.offsetTop) + " + " + this.__getSizeString(offsetY) + ")";
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
        this.containerElement.style.left = this.__getSizeString(this.config.minClosedSize);
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
        this.setNavigationOffset(config.navigationOffsetX, config.navigationOffsetY);
        this.__updateEmbeding();
        if (config.autoclose) {
            this.setAutoClose();
        }
        this.__setAnimations(config.animations);
        if (typeof this.config.activePanel === "number") 
            this.setActiveByIndex(this.config.activePanel)
        else
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
            this.toggleButtonElement = this.__isDOMElement(this.config.toggleButton) ? this.config.toggleButton : document.querySelector(this.config.toggleButton);
            if (this.toggleButtonElement) {
                this.toggleButtonElement.onclick = this.onToggleButtonClick.bind(this);
            }
        }
    },
    
    __updateEmbeding: function() {
        if (!this.config.embed)  return;
        
        const resolvedWidth = this.__getSizeString(this.config.width);
        const resolvedHeight = this.__getSizeString(this.config.height);
        const resolvedNavItemWidth = this.__getSizeString(this.config.navigationItemWidth);
        const resolvedNavItemHeight = this.__getSizeString(this.config.navigationItemHeight);
        const resolvedMinClosedSize = this.__getSizeString(this.config.minClosedSize);

        if (this.config.position === "left") {
            this.targetElement.parentElement.style.marginLeft = this.isOpen() ? "calc(" + resolvedWidth + " - " + resolvedNavItemWidth + ")" : resolvedMinClosedSize;
        }
        else if (this.config.position === "right") {
            this.targetElement.parentElement.style.marginRight = this.isOpen() ? "calc(" + resolvedWidth + " - " + resolvedNavItemWidth + ")" : resolvedMinClosedSize;
            this.targetElement.parentElement.style.marginLeft = this.isOpen() ? "calc(-" + resolvedWidth + " + " + resolvedNavItemWidth + ")" : resolvedMinClosedSize;
        }
        else if (this.config.position === "top") {
            this.targetElement.parentElement.style.marginTop = this.isOpen() ? "calc(" + resolvedHeight + " - " + resolvedNavItemHeight + ")" : resolvedMinClosedSize;
        }
        else if (this.config.position === "bottom") {
            this.targetElement.parentElement.style.marginBottom = this.isOpen() ? "calc(" + resolvedHeight + " - " + resolvedNavItemHeight + ")" : resolvedMinClosedSize;
        }
    },
    
    __setAnimations: function(animations) {
        if (!animations || !Object.keys(animations).length) {
            return;
        }
        
        if (animations.replace) {
            var isObject = typeof animations.replace === "object" && animations.replace !== null;
            var animation = isObject ? animations.replace : this.__getAnimationFromString(animations.replace);
            var allContentPanels = this.contentElement.children;
            var l = allContentPanels.length;
            while (l--) {
                this.__setVendorStyleProperty(allContentPanels[l], "transition", this.__getTransitionFromAnimation(animation));
                allContentPanels[l].classList.add(animation.type);
            }
        }
        if (animations.toggle) {
            var isObject = typeof animations.replace === "object" && animations.replace !== null;
            var animation = isObject ? animations.toggle : this.__getAnimationFromString(animations.toggle);
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
    },

    __getSizeString: function(size) {
        return size + (typeof size === "number" ? "px" : "");
    }
};

function toolslide(target, config) {
    return new Toolslide(target, config);
}

return toolslide;

}));
