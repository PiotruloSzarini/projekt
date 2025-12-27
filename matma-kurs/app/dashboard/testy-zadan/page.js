import Link  from "next/link"
export default function testyzadanek({}) {
    return (
    <div>
        <div>
            <ul>
                <li>
                    <Link href="/dashboard/testy-zadan/single-input">Single input</Link>
                </li>
                <li>
                    <Link href="/dashboard/testy-zadan/multiple-choice">Multiple-choice</Link>
                </li>
                <li>
                    <Link href="/dashboard/testy-zadan/matching">matching</Link>
                </li>
                <li>
                    <Link href="/dashboard/testy-zadan/step-by-step">step-by-step</Link>
                </li>
            </ul>
    </div>
    </div>
)};