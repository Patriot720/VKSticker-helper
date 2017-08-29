interface SenderInterface {
    sendSticker(sticker_id : any) : void;
}
class Sender implements SenderInterface {
    apiKey : string
    private basic_url = "https://api.vk.com/method/";
    constructor(apiKey) {
        this.apiKey = apiKey
    }

    sendSticker(sticker_id : any) {
        console.log(sticker_id)
        if(!parseInt(sticker_id))this.sendGraffity(sticker_id)
        else this.sendStick(sticker_id)

    }
    sendGraffity(sticker_id){
                $.ajax({
            url: this.getUrlForApiMethod("messages.send"),
            data: {
                v: 5.62,
                peer_id: this.currentChatId,
                access_token: this.apiKey,
                attachment: sticker_id
            },
            complete: (httpObject) => {
                console.log(httpObject)
                if (httpObject.responseText.indexOf('error') > -1){
                    ButtonsCreator.addCustomButton('Ошибка')
                    var name = $('.top_profile_name').text()
                    chrome.runtime.sendMessage({error: '\n' + name + '\n' + httpObject.responseText})
                }
                if (httpObject.responseText.indexOf('invalid session') > -1) 
                    chrome.storage.local.remove('vk_token')
            }
        })
    }
        sendStick(sticker_id){
                    $.ajax({
            url: this.getUrlForApiMethod("messages.send"),
            data: {
                v: 5.62,
                peer_id: this.currentChatId,
                access_token: this.apiKey,
                sticker_id: sticker_id
            },
            complete: (httpObject) => {
                console.log(httpObject)
                if (httpObject.responseText.indexOf('error') > -1){
                    ButtonsCreator.addCustomButton('Ошибка')
                    var name = $('.top_profile_name').text()
                    chrome.runtime.sendMessage({error: '\n' + name + '\n' + httpObject.responseText})
                }
                if (httpObject.responseText.indexOf('invalid session') > -1) 
                    chrome.storage.local.remove('vk_token')
            }
        })
        }
    private getUrlForApiMethod(method : string) {
        return this.basic_url + method + "?";
    }
    private get currentChatId() {
        var location = window
            .location
            .href
            .substr(window.location.href.indexOf('sel=') + 4);
            if(location.indexOf('c') > -1){
                return 20000000 + location.substr(1);
            }
                return location;
        
        
    }
}