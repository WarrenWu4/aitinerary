import { ReactNode } from "react"

interface PageContainerProps {
    children?: ReactNode
}

export default function PageContainer({children}: PageContainerProps) {
    return (
        <div className="mt-6 px-16">
            {children}
        </div>
    )
}
