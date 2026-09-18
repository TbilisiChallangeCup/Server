import { octokit, repo, owner, Input } from '../utils'

type structure = {
    email: string,
    phone: string,
    location: string,
    workHours: string
}

export class Contact {
    path: string
    constructor() {
        this.path = "Contact.json"
    }

    async Init() {
        const methods = [
            'ელ-ფოსტის შეცვლა',
            'ტელეფონის შეცვლა',
            'მისამართის შეცვლა',
            'სამუშაო საათების შეცვლა',
        ]

        methods.map((entry, i) => {
            console.log(`${[i]}.${entry}`)
        })
        const answer = await Input('არჩევანი', Number);

        // Terminal
        switch (answer) {
            case 0:
                {
                    const email = await Input('ელ-ფოსტა', String)
                    await this.UpdateField('email', email)
                }
                break;
            case 1:
                {
                    const phone = await Input('ტელეფონი', String)
                    await this.UpdateField('phone', phone)
                }
                break;
            case 2:
                {
                    const location = await Input('მისამართი', String)
                    await this.UpdateField('location', location)
                }
                break;
            case 3:
                {
                    const workHours = await Input('სამუშაო საათები', String)
                    await this.UpdateField('workHours', workHours)
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

    async GetContact() {
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

    async UpdateField<K extends keyof structure>(field: K, value: structure[K]) {
        const { json, sha } = await this.GetContact();
        json[field] = value

        return await this.UpdateFile(json, `${field} შეცვლა`, sha)
    }
}