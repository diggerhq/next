import Link from "next/link";

export default function GithubAppError() {
    const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
    return (
        <>
            <h1>Something went wrong</h1>
            <p>GitHub App installation failed. Maybe <Link href={`https://github.com/apps/${appSlug}/installations/new/`}>try re-install it?</Link></p>
        </>
    )
}