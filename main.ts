let buttonsContainer;
class HelpersUtil {
    static getRandomInt(min, max) {
        if (min === max)
            return min;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
var ls = {
    checkVersion: function () {
        return (window.localStorage !== undefined);
    },
    set: function (k, v) {
        this.remove(k);
        try {
            return (ls.checkVersion())
                ? localStorage.setItem(k, JSON.stringify(v))
                : false;
        } catch (e) {
            return false;
        }
    },
    get: function (k) {
        if (!ls.checkVersion()) {
            return false;
        }
        try {
            return JSON.parse(localStorage.getItem(k));
        } catch (e) {
            return false;
        };
    },
    remove: function (k) {
        try {
            localStorage.removeItem(k);
        } catch (e) { };
    }
}
chrome.runtime.onMessage.addListener((message, sender, response) => {
    console.log(message)
    if (message === 'reloadPage')
        location.reload();
})
function onHelpButtonClick(){
    chrome.runtime.sendMessage('help')
}
function removeTabEventsOnChatbox() {
    $('._emoji_btn').removeClass('emoji_smile_on').removeClass('emoji_smile')
        .removeClass('_emoji_btn').css('padding','6px 14px 6px 3px');
}
$(document).ready(function () {
    buttonsContainer = $('<div class="helper"></div>');
    var helpButton = $('<div class="helpButton"><p>?</p></div>')
    helpButton.click(onHelpButtonClick)
    removeTabEventsOnChatbox();
    $('.im-chat-input--textarea').prepend(helpButton)
    $('.im-chat-input--textarea').prepend(buttonsContainer);
    var main = new ApiGetter(new Main)
    main.getApiKey()
})