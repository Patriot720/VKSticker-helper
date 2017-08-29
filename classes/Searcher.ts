interface SearcherInterface {
    search(wordArray) : any;
}
class Searcher implements SearcherInterface {
    dictionary : Object
    status : boolean;
    ignoredList: Array<string>
    constructor(keywords) {
        this.dictionary = keywords 
        this.ignoredList = [];
        this.status = true;
    }
    search(wordsArray) {
        if(status){return;}
        let matched : Array < [string, number] > = [];
        for (var position in wordsArray) {
            if (this.dictionaryHas(wordsArray, position)) {
                let fullKeyword = this.dictionary[wordsArray[position]][0]
                let stickerID = this.dictionary[wordsArray[position]][2]
                matched.push([fullKeyword, stickerID])
            }
        }
        return matched;
    }
    private dictionaryHas(array, position) {
        var word = array[position];
        if (this.isPartlyInDictionary(word) && this.isCompletelyInDictionary(array, position)) 
            return true
        return false
    }
    private isPartlyInDictionary(word : string) {
        return this
            .dictionary
            .hasOwnProperty(word)
    }
    private isCompletelyInDictionary(arr, wordPos) {
        var stringWithSameWordAmount = this.expandString(arr, wordPos, this.dictionary[arr[wordPos]][1])
        var keyword = this.dictionary[arr[wordPos]][0]
        if (keyword === stringWithSameWordAmount) 
            return true
        return false
    }
    private expandString(arr, position, expansionLength) {
        var upperBoundary = parseInt(position) + parseInt(expansionLength)
        var lowerBoundary = position
        return arr
            .slice(lowerBoundary, upperBoundary)
            .join(' ')
    }
}