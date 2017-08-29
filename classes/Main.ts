class Main {
    addListeners(apiKey) {
        chrome
            .storage
            .local
            .get(['newUserDict', 'standartHelpers', 'blacklist'], (dict) => {
                if (!dict['blacklist'])
                    dict['blacklist'] = [];
                var keywords = new KeywordsGetter(dict['newUserDict'], dict['standartHelpers'], dict['blacklist']).getHelpersDictionary()
                var searcher = new Searcher(keywords)
                var buttonsCreator = new ButtonsCreator()
                var sender = new Sender(apiKey)
                $(document).on('click','.helperelement',function (){
                    sender.sendSticker($.data(this,'id'));          // NEEDS REDOING !!!!!!!!!!!!!
                })
                var eventListener = new EventListenersSetter(buttonsCreator, searcher, sender, $('.im_editable'))
                eventListener.setListeners()
                this.onPageUrlChange(() => {
                    if ($('.im-chat-input--textarea').find('.helper').length)
                        return;
                    buttonsContainer = $('<div class="helper"></div>');
                    var helpButton = $('<div class="helpButton"><p>?</p></div>')
                    helpButton.click(onHelpButtonClick)
                    removeTabEventsOnChatbox(); //                      RECONSTRUCT THIS STUFF
                    $('.im-chat-input--textarea').prepend(helpButton)
                    $('.im-chat-input--textarea').prepend(buttonsContainer);
                    eventListener.inputBox = $('.im_editable')
                    eventListener.setListeners()
                })

            })
    }
    onPageUrlChange(callback: Function) {
        var oldLocation = location.href;
        var reg = new RegExp("https://vk.com/im?sel=")
        setInterval(function () {
            if (location.href !== oldLocation) {
                if (oldLocation.match(reg) === null) {
                    callback()
                }
                oldLocation = location.href;
            }
        }, 2000)
    }

}
