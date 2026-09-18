import { octokit, repo, owner, Input } from '../utils'

type Post = {
    title: string,
    description: string
}
type structure = Post[]

export class News {
    path: string
    constructor() {
        this.path = "News.json"
    }

    async Init() {
        const methods = [
            'პოსტის დამატება',
            'პოსტის წაშლა',
        ]

        methods.map((entry, i) => {
            console.log(`${[i]}.${entry}`)
        })
        const answer = await Input('არჩევანი', Number);

        // Terminal
        switch (answer) {
            case 0:
                {
                    const title = await Input('სათაური', String)
                    const description = await Input('აღწერა', String)

                    const postData: Post = {
                        title,
                        description
                    }

                    await this.AddPost(postData)
                }
                break;
            case 1:
                {
                    const index = (await Input('პოსტის მიმდევრობა', String))
                        .split(' ')
                        .map(num => Number(num))

                    await this.DeletePost(index)
                }
                break;

            default: break;
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

    async GetNews() {
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

    async AddPost(post: Post) {
        const { json, sha } = await this.GetNews();
        json.push(post)

        return await this.UpdateFile(json, 'პოსტის დამატება', sha);
    }

    async DeletePost(indexes: number[]) {
        const { json, sha } = await this.GetNews();

        // sort descending so earlier splices don't shift later indexes
        const sortedIndexes = [...indexes].sort((a, b) => b - a)
        for (const idx of sortedIndexes) {
            json.splice(idx, 1)
        }
        return await this.UpdateFile(json, 'პოსტის წაშლა', sha)
    }
}   