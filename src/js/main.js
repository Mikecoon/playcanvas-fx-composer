let script = document.createElement('script');
script.src = chrome.extension.getURL('js/inject.js');
script.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

let style = document.createElement('link');
style.href = chrome.extension.getURL('css/style.css');
style.rel="stylesheet";
(document.head || document.documentElement).appendChild(style);