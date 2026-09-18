import path from 'node:path'
import { octokit, repo, owner, Input } from '../utils'
import sharp from 'sharp'

type Team = {
    index: number,
    team: string,
    played: number,
    wins: number,
    draws: number,
    losses: number,
    goalsScored: number,
    goalsAgainst: number,
    goalDifference: number,
    points: number
}
type structure = {
    [year: string]: [Team]
}

export class Calendar {
    path: string
    constructor() {
        this.path = "Calendar.json"
    }

    async Init() {
        const methods = [
            'გუნდის დამატება',
            'გუნდის წაშლა',
            'წლის ამოშლა',
        ]

        methods.map((entry, i) => {
            console.log(`${[i]}.${entry}`)
        })
        const answer = await Input('არჩევანი', Number);

        // Terminal
        switch (answer) {
            case 0:
                const teamData = {
                    index: 0,
                    team: await this.TeamIcon(await Input('გუნდის ფოტო', String)),
                    played: await Input('ნათამაშები', Number),
                    wins: await Input('ნათამაშები', Number),
                    draws: await Input('ნიჩიები', Number),
                    losses: await Input('წაგებები', Number),
                    goalsScored: await Input('გატანილი გოლები', Number),
                    goalsAgainst: await Input('საწინააღმდეგოდ გატანილი გოლები', Number),
                    points: 0
                }
                teamData.points = teamData.wins * 3 + teamData.draws * 1;
                
                console.log(teamData)
            break;

            default:
                break;
        }
    }

    async TeamIcon(path: string) : Promise<string> {
        const buffer = await sharp(path).resize(500).toBuffer()
        const base64 = buffer.toString('base64')

        const name = `images/calendar-${Date.now()}.jpg`

        await octokit.rest.repos.createOrUpdateFileContents({
            owner: owner!,
            repo: repo!,
            path: name,
            content: base64,
            message: 'ფოტოს ატვირთვა',
        });
        return `https://raw.githubusercontent.com/${owner}/${repo}/main/${name}`
    }

    async UpdateFile(json: structure, messege: string, sha: string) {
        octokit.rest.repos.createOrUpdateFileContents({
            owner: owner!,
            repo: repo!,
            path: this.path,
            content: Buffer.from(JSON.stringify(json, null, 2)).toString("base64"),
            message: messege,
            sha: sha,
        });
    }

    async GetCalendar() {
        const res = await octokit.rest.repos.getContent({
            owner: owner!,
            repo: repo!,
            path: this.path
        })

        const data = res.data as {
            type: "file"
            content: string
            sha: string
        }

        const content = data.content
        const sha = data.sha

        const json: structure = JSON.parse(Buffer.from(content, "base64").toString("utf8"))

        return { json, sha }
    }

    async AddTeam(year: string, team: Team) {
        const { json, sha } = await this.GetCalendar();
        json[year]?.push(team);

        return await this.UpdateFile(json, 'გუნდის ამოშლა', sha);
    }

    async DeleteTeam(year: string, indexes: number[]) {
        const { json, sha } = await this.GetCalendar();

        for (let i = 0; i < indexes.length; i++) {
            json[year]?.splice(indexes[i]!, 1)
        }
        return await this.UpdateFile(json, 'გუნდის წაშლა', sha)
    }

    async DeleteYear(year: string) {
        const { json, sha } = await this.GetCalendar();
        delete json[year]

        return await this.UpdateFile(json, 'წლის ამოშლა', sha)
    }
}