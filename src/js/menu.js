(function () {
  var MENU_CSS_CLASS = 'context-menu',
    MENU_WRAPPER_CLASS = 'context-menu-wrapper',
    ITEM_WRAPPER_CSS_CLASS = 'menu-item-wrapper',
    HIDDEN_CSS_CLASS = 'menu-hidden',
    OPEN_SUBMENU_CLASS = 'js-open-submenu',
    OVERLAY_CSS_CLASS = 'overlay-for-menu',
    ARROW_LI_CLASS_FIRST_PART = 'arrow-li-',
    ARROW_CLASS_FIRST_PART = 'arrow-',
    RIGHT_ARROW_CLASS = 'arrow-right',
    UP_ARROW_PREFIX = 'up',
    DOWN_ARROW_PREFIX = 'down',
    DISABLED_CSS_CLASS = 'disabled',
    SCROLLING_MENU_CLASS = 'scrolling',
    MENU_OFFSET = 28,
    ITEM_HEIGHT = 26,
    BORDER_WIDTH = 1,
    VERTICAL_ARROWS_COUNT = 2,
    OFFSET_FROM_CURSOR = {
      top: 0,
      left: 12
    },
    Menu;

  Menu = function () {
    this.menuElementList = [];
    this.menuElementParentDictionary = [];
  };

  Menu.prototype.elementHasClass = function (element, className) {
    if (element.classList) {
      return element.classList.contains(className);
    } else {
      return !!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }
  }

  Menu.prototype.addClassToElement = function (element, className) {
    if (element.classList) {
      element.classList.add(className);
    } else if (!this.elementHasClass(element, className)) {
      element.className += ' ' + className;
    }
    return element;
  }

  Menu.prototype.removeClassFromElement = function (element, className) {
    var regExp;
    if (element.classList) {
      element.classList.remove(className);
    } else if (this.elementHasClass(element, className)) {
      regExp = new RegExp('(\\s|^)' + className + '(\\s|$)');
      element.className = element.className.replace(regExp, ' ');
    }
    return element;
  }

  Menu.prototype.showElement = function (element) {
    this.removeClassFromElement(element, HIDDEN_CSS_CLASS);
    return element;
  }

  Menu.prototype.hideElement = function (element) {
    this.addClassToElement(element, HIDDEN_CSS_CLASS);
    return element;
  };

   Menu.prototype.getClosestElement = function (element, className) {
    do {
      if (this.elementHasClass(element, className)) {
        return element;
      }
      element = element.parentNode;
    } while (element.tagName !== 'HTML');
    return null;
  };


  Menu.prototype.addRightArrowToElement = function (element) {
    var divArrowElement = document.createElement('div');
    this.addClassToElement(divArrowElement, RIGHT_ARROW_CLASS);
    element.appendChild(divArrowElement);
    return element;
  };

  Menu.prototype.createArrowLiElement = function (type) {
    var arrowLiElement = document.createElement('div'),
      divArrowElement = document.createElement('div'),
      type = type ? type : UP_ARROW_PREFIX;

    this.addClassToElement(divArrowElement, ARROW_CLASS_FIRST_PART + type);
    arrowLiElement.appendChild(divArrowElement);
    this.addClassToElement(arrowLiElement, ARROW_LI_CLASS_FIRST_PART + type);
    return arrowLiElement;
  };

  Menu.prototype.overlayClickHandler = function (e) {
    var target = e.target,
      closestMenuElement = this.getClosestElement(target, MENU_WRAPPER_CLASS),
      closestElementsList = [],
      closestItemElement = this.getClosestElement(target, ITEM_WRAPPER_CSS_CLASS),
      allMenuElements = document.getElementsByClassName(MENU_WRAPPER_CLASS),
      allMenuElementsArray = this.convertNodeListToArray(allMenuElements),
      submenusToClose,
      that = this,
      subMenu,
      menuElementParent,
      isThisElementChecker;

    isThisElementChecker = function (item) {
      return item.element === closestMenuElement;
    }

    if (closestMenuElement) {
      closestElementsList.push(closestMenuElement);

      while (menuElementParentPair = this.menuElementParentDictionary.find(isThisElementChecker)) {
        closestMenuElement = menuElementParentPair.parent;
        closestElementsList.push(closestMenuElement);
      }
    }

    submenusToClose = allMenuElementsArray.filter(function (item) {
      return (closestElementsList.indexOf(item) < 0);
    });
    submenusToClose.forEach(function (item) {
      that.hideElement(item);
    });

    if (closestElementsList.length === 0) {
      this.hideElement(this.overlayElement);
    }
  };

  Menu.prototype.setPositionToElement = function (element, position, offset) {
    var measure = 'px',
      leftCoord = position.left,
      topCoord = position.top,
      offset = offset ? offset : {};

    topCoord += offset.top ? offset.top : 0;
    leftCoord += offset.left ? offset.left : 0;
    element.style.top = topCoord + measure;
    element.style.left = leftCoord + measure;
  };

  Menu.prototype.generateSubmenuOpener = function (subMenu, customClickHandler) {
    var that = this;
    return function (e) {
      e.stopImmediatePropagation();
      var target = this,
        closestMenuElement = that.getClosestElement(target, MENU_CSS_CLASS),
        closestMenuWrapperElement = that.getClosestElement(target, MENU_WRAPPER_CLASS),
        position = {
          top: target.offsetTop + closestMenuWrapperElement.offsetTop - closestMenuElement.scrollTop,
          left: target.offsetLeft + target.offsetWidth + closestMenuWrapperElement.offsetLeft + BORDER_WIDTH
        }, 
        offset = {
          top: 0,
          left: 0,
        },
        calculationOptions = {
          position: position,
          element: subMenu,
          offset: offset,
          topOffsetForReversedType: ITEM_HEIGHT
        },
        offsetFromMenu = that.calculateMenuOffset(calculationOptions);
      that.overlayClickHandler(e);
      that.setPositionToElement(subMenu, position, offsetFromMenu);
      that.showElement(subMenu);
      if (customClickHandler) {
        customClickHandler();
      }
    };
  }

  Menu.prototype.generateScrollingDownHandler = function (menuElement) {
    var that = this;
    return function (e) {
      menuElement.scrollTop += ITEM_HEIGHT;
    };
  }

  Menu.prototype.generateScrollingUpHandler = function (menuElement) {
    var that = this;
    return function (e) {
      menuElement.scrollTop -= ITEM_HEIGHT;
    };
  }

  Menu.prototype.parseItems = function (itemsArray) {
    var itemsArray = itemsArray ? itemsArray : this.itemsTree,
      ulElement = document.createElement('ul'),
      that = this,
      upArrowLiElement = that.createArrowLiElement(UP_ARROW_PREFIX),
      downArrowLiElement = that.createArrowLiElement(DOWN_ARROW_PREFIX),
      menuWrapperDivElement = document.createElement('div');
    
    menuWrapperDivElement.appendChild(upArrowLiElement);
    menuWrapperDivElement.appendChild(ulElement);
    that.addClassToElement(menuWrapperDivElement, MENU_WRAPPER_CLASS);
    that.addClassToElement(ulElement, MENU_CSS_CLASS);
    that.hideElement(menuWrapperDivElement);

    itemsArray.forEach(function (item) {
      var liElement = document.createElement('li'),
        divElementForTitle = document.createElement('div'),
        childMenuWrapperDivElement;

      divElementForTitle.innerHTML = item.title;
      that.addClassToElement(divElementForTitle, ITEM_WRAPPER_CSS_CLASS);
      if (item.disabled) {
        that.addClassToElement(divElementForTitle, DISABLED_CSS_CLASS);
      }

      liElement.appendChild(divElementForTitle);
      if (item.subItems) {
        that.addRightArrowToElement(divElementForTitle);
        childMenuWrapperDivElement = that.parseItems(item.subItems);
        that.addClassToElement(divElementForTitle, OPEN_SUBMENU_CLASS);
        divElementForTitle.addEventListener('click', that.generateSubmenuOpener(childMenuWrapperDivElement, item.clickHandler));
        that.menuElementParentDictionary.push({
          element: childMenuWrapperDivElement,
          parent: menuWrapperDivElement
        });
      } else if (item.clickHandler) {
        divElementForTitle.addEventListener('click', item.clickHandler);
      }
      ulElement.appendChild(liElement);
    });
    downArrowLiElement.addEventListener('click', that.generateScrollingDownHandler(ulElement));
    upArrowLiElement.addEventListener('click', that.generateScrollingUpHandler(ulElement));
    menuWrapperDivElement.appendChild(downArrowLiElement);
    that.menuElementList.push(menuWrapperDivElement)
    return menuWrapperDivElement;
  };

  Menu.prototype.copyObject = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  Menu.prototype.clearMenuPosition = function (menuElement) {
    menuElement.setAttribute('style', '');
    menuElement.childNodes[1].setAttribute('style', '');
    this.removeClassFromElement(menuElement, SCROLLING_MENU_CLASS);
  }


  Menu.prototype.calculateMenuOffset = function (options) {
    this.clearMenuPosition(options.element);
    var spaceAbove = options.position.top,
      spaceBelow = window.innerHeight - spaceAbove,
      menuUlElement = options.element.childNodes[1],
      menuHeight = ITEM_HEIGHT * (menuUlElement.childNodes.length),
      offsetFromCursor = options.offset ?  options.offset : this.copyObject(OFFSET_FROM_CURSOR),
      freeSpace,
      topOffsetForReversedType = options.topOffsetForReversedType ? options.topOffsetForReversedType : 0;

    if (spaceBelow < menuHeight && spaceAbove < menuHeight) {
      freeSpace = Math.max(spaceBelow, spaceAbove);
      menuHeight = Math.round((freeSpace - MENU_OFFSET) / ITEM_HEIGHT) * ITEM_HEIGHT;
      menuUlElement.style.height = menuHeight + 'px';
      this.addClassToElement(options.element, SCROLLING_MENU_CLASS);
    } 

    offsetFromCursor.top += (spaceBelow < menuHeight && spaceBelow < spaceAbove) ? -(menuHeight - topOffsetForReversedType)  : 0;
    return offsetFromCursor;
  };

  Menu.prototype.bindedElementClickHandler = function (e) {
    var mousePosition = {
        top: e.clientY,
        left: e.clientX
      },
      calculationOptions = {
        position: mousePosition,
        element: this.rootMenuElement,
      };
      offsetFromCursor = this.calculateMenuOffset(calculationOptions);
 
    this.setPositionToElement(this.rootMenuElement, mousePosition, offsetFromCursor);
    this.showElement(this.overlayElement);
    this.showElement(this.rootMenuElement);
  };

  Menu.prototype.convertNodeListToArray = function (nodeList) {
    var array = [];
    for (var i = 0; i < nodeList.length; i++) { 
      array.push(nodeList[i]);
    }
    return array;
  };

  Menu.prototype.wrapToOverlay = function (elementsList) {
    var divElementForOverlay = document.createElement('div');
    this.addClassToElement(divElementForOverlay, OVERLAY_CSS_CLASS);
    elementsList.forEach(function (element) {
      divElementForOverlay.appendChild(element);
    });
    
    this.hideElement(divElementForOverlay);
    return divElementForOverlay;
  };


  Menu.prototype.attachEventListeners = function () {
    var itemElementsWithSubmenu = document.getElementsByClassName(OPEN_SUBMENU_CLASS);
    this.overlayElement.addEventListener('click', this.overlayClickHandler.bind(this));
    this.elementToBind.addEventListener('click', this.bindedElementClickHandler.bind(this));
  };

  Menu.prototype.init = function (options) {
    var bodyElement = document.getElementsByTagName('body')[0];
    this.elementToBind = options.elementToBind;
    this.itemsTree = options.itemsTree;
    this.rootMenuElement = this.parseItems(this.itemsTree)
    this.overlayElement = this.wrapToOverlay(this.menuElementList);
    bodyElement.appendChild(this.overlayElement);
    this.attachEventListeners();
  };

  window.Menu = Menu;
}());