import path from 'node:path'
import { octokit, repo, owner, Input } from '../utils'
import sharp from 'sharp'

type Match = {
    tour: number,
    year: string,
    team1: string,
    team1Points: number,
    team2: string,
    team2Points: number
}
type structure = {
    [year: string]: Match[]
}

export class Calendar {
    path: string
    constructor() {
        this.path = "Calendar.json"
    }

    async Init() {
        const methods = [
            'მატჩის დამატება',
            'მატჩის წაშლა',
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
                    const tour = await Input('ტური', Number)

                    const team1 = await this.TeamIcon(await Input('1-ლი გუნდის ფოტო', String))
                    const team1Points = await Input('1-ლი გუნდის ქულები', Number)

                    const team2 = await this.TeamIcon(await Input('მე-2 გუნდის ფოტო', String))
                    const team2Points = await Input('მე-2 გუნდის ქულები', Number)

                    const matchData: Match = {
                        tour,
                        year,
                        team1,
                        team1Points,
                        team2,
                        team2Points
                    }

                    await this.AddMatch(year, matchData)
                }
                break;
            case 1:
                {
                    const year = await Input('წელი', String)
                    const index = (await Input('მატჩის მიმდევრობა', String))
                        .split(' ')
                        .map(num => Number(num))

                    await this.DeleteMatch(year, index)
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

            const name = `images/calendar-${Date.now()}.jpeg`

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: owner!,
                repo: repo!,
                path: name,
                content: base64,
                message: 'ფოტოს ატვირთვა',
            });

            return name
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

    async AddMatch(year: string, match: Match) {
        const { json, sha } = await this.GetCalendar();

        if (!json[year]) {
            json[year] = [match]
        } else {
            json[year]!.push(match)
        }

        return await this.UpdateFile(json, 'მატჩის დამატება', sha);
    }

    async DeleteMatch(year: string, indexes: number[]) {
        const { json, sha } = await this.GetCalendar();

        // sort descending so earlier splices don't shift later indexes
        const sortedIndexes = [...indexes].sort((a, b) => b - a)
        for (const idx of sortedIndexes) {
            json[year]?.splice(idx, 1)
        }
        return await this.UpdateFile(json, 'მატჩის წაშლა', sha)
    }

    async DeleteYear(year: string) {
        const { json, sha } = await this.GetCalendar();
        delete json[year]

        return await this.UpdateFile(json, 'წლის ამოშლა', sha)
    }
}