// import dotenv from 'dotenv'
// dotenv.config()

import { Input } from './scripts/utils/index'
import { Charts } from './scripts/server/charts'
import { Calendar } from './scripts/server/calendar'
import { News } from './scripts/server/news'
import { Contact } from './scripts/server/contacts'

async function main() {
    const modules = [
        'გრაფიკები',
        'კალენდარი',
        'სიახლეები',
        'კონტაქტი',
    ]

    modules.map((entry, i) => {
        console.log(`${[i]}.${entry}`)
    })
    const answer = await Input('არჩევანი', Number)

    switch (answer) {
        case 0:
            await new Charts().Init()
            break
        case 1:
            await new Calendar().Init()
            break
        case 2:
            await new News().Init()
            break
        case 3:
            await new Contact().Init()
            break
        default:
            console.log('არასწორი არჩევანი')
            break
    }
}

main()