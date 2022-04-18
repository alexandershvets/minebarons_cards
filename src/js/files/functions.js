// ==============================================================
// user agent

var ua = window.navigator.userAgent;
var msie = ua.indexOf("MSIE ");
var isMobile = { Android: function () { return navigator.userAgent.match(/Android/i); }, BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); }, iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, Opera: function () { return navigator.userAgent.match(/Opera Mini/i); }, Windows: function () { return navigator.userAgent.match(/IEMobile/i); }, any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); } };

function isIE() {
  ua = navigator.userAgent;
  var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  return is_ie;
}

if (isIE()) {
  document.querySelector('body').classList.add('ie');
}
if (isMobile.any()) {
  document.querySelector('body').classList.add('_touch');
}

// ==============================================================
// WebP

function testWebP(callback) {
  var webP = new Image();
  webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
  };
  webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
testWebP(function (support) {
  if (support == true) {
    document.querySelector('body').classList.add('_webp');
  } else {
    document.querySelector('body').classList.add('_no-webp');
  }
});

// ==============================================================

if (document.querySelector('.wrapper')) {
  document.querySelector('.wrapper').classList.add('_loaded');
}

// ==============================================================
// Menu

let iconMenu = document.querySelector(".icon-menu");
let iconClose = document.querySelector('.mobile-menu__close');
let menuBody = document.querySelector(".mobile-menu");
let wrapper = document.querySelector('.wrapper');

if (iconMenu != null) {
  iconMenu.addEventListener("click", function (e) {
    iconMenu.classList.toggle("_active");
    menuBody.classList.toggle("_active");
    wrapper.classList.toggle("_active");
  });
}

function menu_close() {
  iconMenu.classList.remove("_active");
  menuBody.classList.remove("_active");
  wrapper.classList.remove("_active");
}

iconClose.addEventListener('click', function () {
  menu_close();
});

// ==============================================================
// Полифилы

(function () {
  // проверяем поддержку
  if (!Element.prototype.closest) {
    // реализуем
    Element.prototype.closest = function (css) {
      var node = this;
      while (node) {
        if (node.matches(css)) return node;
        else node = node.parentElement;
      }
      return null;
    };
  }
})();
(function () {
  // проверяем поддержку
  if (!Element.prototype.matches) {
    // определяем свойство
    Element.prototype.matches = Element.prototype.matchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector;
  }
})();
