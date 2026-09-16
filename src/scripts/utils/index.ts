import dotenv from 'dotenv'
dotenv.config()

// env veriables
const owner = process.env.GITHUB_OWNER
const repo = process.env.GITHUB_REPO
const token = process.env.GITHUB_TOKEN

// OctoKid importation
import { Octokit } from "octokit";
const octokit = new Octokit({auth: token});

export { octokit, owner, repo }
