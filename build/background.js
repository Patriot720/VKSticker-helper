var newTabId;
var token;
chrome.contextMenus.create({
    title: "Добавить в словарик",
    contexts: ['image'],
    onclick: function (item) {
        console.log(item);
        if (item.srcUrl.indexOf('stickers') > -1) {
            var stickerId = item.srcUrl.split('/')[5];
            chrome.tabs.create({ url: "/options.html?" + stickerId });
        }
        else {
            chrome.tabs.create({ url: "/options.html?error" });
        }
    }
});
chrome
    .runtime
    .onMessage
    .addListener(function (request, sender, sendResponse) {
    console.log(request);
    console.log(request.error);
    if (request === 'help') {
        chrome.tabs.create({ url: '/help.html' });
    }
    if (request.error) {
        var http = new XMLHttpRequest();
        var url = "http://stickerhelper.ddns.net:8000/";
        var params = 'error=' + request.error;
        http.open("POST", url, true);
        //Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function () {
            if (http.readyState === 4 && http.status === 200) {
                console.log(http.responseText);
            }
        };
        http.send(params);
    }
    if (request.getAccessTokenURL) {
        chrome
            .tabs
            .create({
            url: request.getAccessTokenURL,
            selected: true
        }, function (tab) {
            var newTabId = tab.id;
            chrome
                .tabs
                .onUpdated
                .addListener(function (tabId, changeInfo) {
                if (tabId === newTabId && changeInfo.url !== undefined && changeInfo.status === "loading") {
                    if (changeInfo.url.indexOf('https://oauth.vk.com/blank.html#access_token=') > -1) {
                        console.log(changeInfo.url);
                        var firstBorder = changeInfo
                            .url
                            .indexOf('=') + 1;
                        var secondBorder = changeInfo
                            .url
                            .indexOf('&');
                        token = changeInfo
                            .url
                            .substring(firstBorder, secondBorder);
                        console.log(token);
                        chrome
                            .storage
                            .local
                            .set({
                            'vk_token': token
                        }, function () {
                            chrome
                                .runtime
                                .sendMessage("apikeySet");
                        });
                        sendResponse({ Success: token });
                        chrome
                            .tabs
                            .remove(newTabId);
                    }
                }
            });
        });
    }
});
