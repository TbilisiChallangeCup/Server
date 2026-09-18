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
        this.path = "Charts.json"
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
                {
                    const year = await Input('წელი', String)

                    const played = await Input('ნათამაშები', Number)
                    const wins = await Input('გამარჯვებები', Number)
                    const draws = await Input('ფრეები', Number)
                    const losses = await Input('წაგებები', Number)
                    const goalsScored = await Input('გატანილი გოლები', Number)
                    const goalsAgainst = await Input('საწინააღმდეგოდ გატანილი გოლები', Number)

                    const teamData: Team = {
                        index: 0,
                        team: await this.TeamIcon(await Input('გუნდის ფოტო', String)),
                        played,
                        wins,
                        draws,
                        losses,
                        goalsScored,
                        goalsAgainst,
                        goalDifference: goalsScored - goalsAgainst,
                        points: wins * 3 + draws * 1
                    }

                    await this.AddTeam(year, teamData)
                }
                break;
            case 1:
                {
                    const year = await Input('წელი', String)
                    const index = (await Input('გუნდის მიმდევრობა', String))
                        .split(' ')
                        .map(num => Number(num))

                    await this.DeleteTeam(year, index)
                }
                break;
            case 2:
                {
                    const year = await Input('წელი', String)
                    await this.DeleteYear(year);
                }
                break;

            default: break;
        }
    }

    async TeamIcon(inputPath: string): Promise<string> {
        try {
            const resolvedPath = path.resolve(inputPath)
            const buffer = await sharp(resolvedPath).resize(500).toBuffer()
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
        } catch (err: any) {
            console.error('TeamIcon failed:', err?.message ?? err)
            throw new Error(`ფოტოს ატვირთვა ვერ მოხერხდა: ${err?.message ?? err}`)
        }
    }

    async UpdateFile(json: structure, message: string, sha: string) {
        try {
            await octokit.rest.repos.createOrUpdateFileContents({
                owner: owner!,
                repo: repo!,
                path: this.path,
                content: Buffer.from(JSON.stringify(json, null, 2)).toString("base64"),
                message: message,
                sha: sha,
            });
        } catch (err: any) {
            console.error('UpdateFile failed:', err?.message ?? err)
            throw err
        }
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

        if (!json[year]) {
            json[year] = [team] as [Team]
        } else {
            json[year]!.push(team)
        }

        return await this.UpdateFile(json, 'გუნდის დამატება', sha);
    }

    async DeleteTeam(year: string, indexes: number[]) {
        const { json, sha } = await this.GetCalendar();

        // sort descending so earlier splices don't shift later indexes
        const sortedIndexes = [...indexes].sort((a, b) => b - a)
        for (const idx of sortedIndexes) {
            json[year]?.splice(idx, 1)
        }
        return await this.UpdateFile(json, 'გუნდის წაშლა', sha)
    }

    async DeleteYear(year: string) {
        const { json, sha } = await this.GetCalendar();
        delete json[year]

        return await this.UpdateFile(json, 'წლის ამოშლა', sha)
    }
}