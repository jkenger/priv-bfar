module.exports = {
    getFormattedDate: ()=>{
        // yyyy/mm/dd
        const yyyy = new Date().getFullYear()
        const mm = new Date().getMonth() + 1
        const dd = new Date().getDate()

        return `${yyyy}-${(mm < 10) ? "0" + mm : mm}-${(dd < 10) ? "0" + dd : dd }`
    }
}