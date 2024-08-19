import Link from "next/link";

export default function GithubAppError() {
    return (
        <>
            <h1>Something went wrong</h1>
            <p>GitHub App installation failed. You can now close this tab or <Link href="/">go to dashboard</Link></p>
        </>
    )
}