class ApiGetter {
    observer : any;
    constructor(observer?: any) {
        if (observer) 
            this.observer = observer;
        }
    setObserver(observer) {
        this.observer = observer
    }
    notifyObserver(apiKey) {
        this
            .observer
            .addListeners(apiKey)
    }
    getApiKey() {
        chrome
            .storage
            .local
            .get('vk_token', (token) => {
                let vk_token = token['vk_token']
                if (this.isValidToken(vk_token)) {
                    this.notifyObserver(vk_token)
                } else 
                    this.askChromeToCreateVkAuthTab()
            })

    }
    private isValidToken(vk_token : string) {
        if (vk_token && vk_token.length > 10 && vk_token.indexOf("https://oauth.vk.com/") === -1) 
            return true;
        return false
    }
    private askChromeToCreateVkAuthTab() {
        var requestURL = this.getVKAuthUrl()
        chrome
            .runtime
            .sendMessage({
                getAccessTokenURL: requestURL
            }, () => {
                ButtonsCreator.addCustomButton('Запустить стикер хелпер', () => location.reload(),'launchButton')
            })
    }
    private getVKAuthUrl() {
        let url = "https://oauth.vk.com/authorize?";
        let data = {
            client_id: "5792521",
            v: '5.52',
            redirect_uri: "https://oauth.vk.com/blank.html",
            scope: "messages,docs,photos,offline",
            response_type: "token"
        };
        return url + $.param(data);
    }

}