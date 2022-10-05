module.exports = {
    getFormattedDate: (date) => {
        // yyyy/mm/dd
        if (!date) {
            console.log('true')
            const yyyy = new Date().getFullYear()
            const mm = new Date().getMonth() + 1
            const dd = new Date().getDate()
            return `${yyyy}-${(mm < 10) ? "0" + mm : mm}-${(dd < 10) ? "0" + dd : dd}`
        }

        const yyyy = new Date(date).getFullYear()
        const mm = new Date(date).getMonth() + 1
        const dd = new Date(date).getDate()
        return `${yyyy}-${(mm < 10) ? "0" + mm : mm}-${(dd < 10) ? "0" + dd : dd}`
    }
}