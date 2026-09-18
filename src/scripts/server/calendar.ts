import path from 'node:path'
import { octokit, repo, owner, Input } from '../utils'
import sharp from 'sharp'

type Team = {
    "index": number,
    "team": string,
    "played": number,
    "wins": number,
    "draws": number,
    "losses": number,
    "goalsScored": number,
    "goalsAgainst": number,
    "goalDifference": number,
    "points": number
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

        switch (answer) {
            case 0:

                break;

            default:
                break;
        }
    }

    async TeamIcon(path: string) {
        const buffer = await sharp(path).resize(500).toBuffer()
        const base64 = buffer.toString('base64')

        const name = `images/calendar-${Date.now()}.jpg`
        const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${name}`

        await octokit.rest.repos.createOrUpdateFileContents({
            owner: owner!,
            repo: repo!,
            path: name,
            content: base64,
            message: 'ფოტოს ატვირთვა',
        });
        return imageUrl 
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