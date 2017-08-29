class KeywordsGetter {
    keywordsJson : JSON;
    userKeywords : string
    standartHelpers: boolean;
    blacklist: Array<string>
    constructor(userKeywords : string,standartHelpers,blacklist) {
        this.keywordsJson = ls.get("stickers_keywords");
        this.userKeywords = userKeywords
        this.standartHelpers = standartHelpers
        this.blacklist = blacklist
    }
    getHelpersDictionary() {
        var dict = {};
        for (var x = 0; x < this.keywordsJson['keywords'].length; x++) 
            for (var i = 0; i < this.keywordsJson['keywords'][x]['words'].length; i++) 
                if (!this.keywordsJson['keywords'][x]['words'][i].includes('&')) { // IF !EMOJI
                    var Helper = this.keywordsJson['keywords'][x]['words'][i];
                    var stickerIDsArray = this.keywordsJson['keywords'][x]['user_stickers'];
                    var arrayOfHelper = Helper.split(' ')
                    if (stickerIDsArray.length !== 0 && this.blacklist.indexOf(Helper) === -1) 
                        dict[arrayOfHelper[0]] = [
                            Helper,
                            arrayOfHelper.length,
                            stickerIDsArray
                        ]
                }
            var userDict = this.userKeywords
            console.log(this.standartHelpers)
            if(this.standartHelpers)
                return userDict;
            else
        Object.assign(dict, userDict)
        return dict;
    }
}