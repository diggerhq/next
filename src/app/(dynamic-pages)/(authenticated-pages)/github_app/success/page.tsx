import Link from "next/link";

export default function GithubAppError() {
    return (
        <>
            <h1>Success</h1>
            <p>GitHub App installed successfully. You can now close this tab or <Link href="/">go to dashboard</Link></p>
        </>
    )
}