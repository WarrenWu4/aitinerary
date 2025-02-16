import PageContainer from "../components/PageContainer"
import Navbar from "../components/Navbar"
import { useState } from "react"

export default function About() {

    const [query, setQuery] = useState('')

    async function createEmbeddings() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            })
            const data = await response.json()
            console.log(data)
        } catch (error) {
            console.error(error)
        }
        setQuery('')
    }

    return (
        <PageContainer>
            <Navbar />
            <input
                className="mt-8 w-full px-4 py-2"
                placeholder="state your preferences and we will find the perfect match for you :)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createEmbeddings()}
            />
            <div>
            </div>
        </PageContainer>
    )
}
