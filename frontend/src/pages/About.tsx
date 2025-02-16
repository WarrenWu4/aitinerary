import PageContainer from "../components/PageContainer"
import Navbar from "../components/Navbar"
import { useState } from "react"

export default function About() {

    const [query, setQuery] = useState('')

    return (
        <PageContainer>
            <Navbar />
            <input
                placeholder="state your preferences and we will find the perfect match for you :)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </PageContainer>
    )
}
