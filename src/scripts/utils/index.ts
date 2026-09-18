import dotenv from 'dotenv'
dotenv.config()

// env veriables
const owner = process.env.GITHUB_OWNER
const repo = process.env.GITHUB_REPO
const token = process.env.GITHUB_TOKEN

// OctoKid importation
import { Octokit } from "octokit";
const octokit = new Octokit({auth: token});

// Input 
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

async function Input<T>(question: string, type: (v: string) => T): Promise<T>{
    const rl = createInterface({input: stdin, output: stdout})
    const answer = await rl.question(`${question}: `)
    rl.close();

    return type(answer)
}

export { octokit, owner, repo, Input }
