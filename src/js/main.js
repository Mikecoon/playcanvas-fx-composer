//  Libs
let libs = document.createElement('script');
libs.src = chrome.extension.getURL('js/libs.min.js');
libs.async = false;
(document.head || document.documentElement).appendChild(libs);

//  Inject js
let script = document.createElement('script');
script.src = chrome.extension.getURL('js/inject.js');
script.async = false;
script.onload = function() {

    // Settings
    let layoutUrl = chrome.extension.getURL('html/layout.html');
    script = document.createElement('script');
    script.textContent = "composerDefaults.layoutUrl = '" + layoutUrl + "'";
    (document.head || document.documentElement).appendChild(script);

};
(document.head || document.documentElement).appendChild(script);


//  Style
let style = document.createElement('link');
style.href = chrome.extension.getURL('css/style.css');
style.rel="stylesheet";
(document.head || document.documentElement).appendChild(style);



